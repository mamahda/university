import pygame
import heapq
import random
import urllib.request
import os

# Inisialisasi semua modul pygame yang dibutuhkan
pygame.init() 
try:
    pygame.mixer.init()
except Exception:
    print("[WARNING] pygame.mixer failed to initialize; sound disabled.")

# ==============================================================================
# CONSTANTS (KONSTANTA)
# ==============================================================================
GRID_SIZE = 17                      # Ukuran grid 
CELL_SIZE = 43                      # Ukuran satu sel/kotak dalam piksel
WINDOW_SIZE = GRID_SIZE * CELL_SIZE # Ukuran total jendela game (GRID_SIZE * CELL_SIZE)
FPS = 60                            # Frame per second (Kecepatan update layar)

# Colors (Warna-warna dasar)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
YELLOW = (255, 255, 0)
ORANGE = (255, 165, 0)

# Game States (Status Permainan)
MENU, PLAYING, THIEF_WIN, POLICE_WIN = -1, 0, 1, 2
# -1: Menu Utama, 0: Sedang Bermain, 1: Pencuri Menang, 2: Polisi Menang

# Game Settings (Pengaturan Permainan)
INTERCEPT_DISTANCE = 5          # Jarak Manhattan di mana Polisi 2 beralih ke mode 'chase' (kejar langsung)
MOVE_DELAY = 150                # Waktu tunda minimum (ms) antara gerakan pencuri (membuat gerakan berbasis giliran/langkah)
POLICE_PATH_VISUALIZATION = 0   # Tampilkan jalur prediksi polisi (untuk debugging/visualisasi)

# Konfigurasi Level Permainan
LEVEL_CONFIG = {
    1: {"walls": 0.25, "police_speed": 300, "name": "Easy"},
    2: {"walls": 0.30, "police_speed": 200, "name": "Normal"},
    3: {"walls": 0.35, "police_speed": 180, "name": "Hard"},
    4: {"walls": 0.35, "police_speed": 150, "name": "Expert"},
    5: {"walls": 0.40, "police_speed": 120, "name": "Impossible"},
    # 'walls': Persentase sel yang akan diisi dinding
    # 'police_speed': Waktu tunda (ms) antara gerakan polisi (semakin kecil semakin cepat)
}

# ==============================================================================
# ASSET LOADER (Pemuat Aset)
# ==============================================================================
class AssetLoader:
    def __init__(self):
        """
        Konstruktor kelas AssetLoader.
        Mengatur direktori aset dan memulai proses pemuatan.
        """
        self.assets = {} 
        self.asset_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
        os.makedirs(self.asset_dir, exist_ok=True)
        self.load_assets()

    def load_assets(self):
        """
        Memuat semua aset game (gambar dan suara). 
        Memanggil fungsi load_or_create untuk gambar dan load_sound untuk audio.
        """
        self.assets['thief'] = self.load_or_create('thief.png', (255, 0, 255))      # Load gambar pencuri
        self.assets['police1'] = self.load_or_create('police1.png', (0, 0, 255))    # Load gambar polisi 1
        self.assets['police2'] = self.load_or_create('police2.png', (0, 100, 255))  # Load gambar polisi 2
        self.assets['money'] = self.load_or_create('money.png', (255, 215, 0))      # Load gambar uang
        self.assets['exit'] = self.create_exit_sprite()                             # Buat sprite pintu keluar prosedural
        self.assets['wall'] = self.create_wall_sprite()                             # Buat sprite dinding prosedural
        self.assets['floor'] = self.create_floor_sprite()                           # Buat sprite lantai prosedural
        
        self.assets['running'] = self.load_sound('running.mp3')  # Suara lari (saat dikejar)
        self.assets['before'] = self.load_sound('before.mp3')    # Suara sebelum mengambil uang
        self.assets['win'] = self.load_sound('win.mp3')          # Suara menang
        self.assets['lose'] = self.load_sound('lose.mp3')        # Suara kalah

    def load_or_create(self, filename, fallback_color):
        """
        Memuat gambar dari file. 
        Jika gagal memuat file (misalnya tidak ditemukan), akan dibuat objek Surface Pygame 
        berwarna solid (kotak) sebagai pengganti (fallback) dengan ukuran CELL_SIZE.

        Args:
            filename (str): Nama file gambar yang dicoba dimuat.
            fallback_color (tuple): Warna RGB yang digunakan jika file gagal dimuat.

        Returns:
            pygame.Surface: Objek gambar yang berhasil dimuat atau gambar fallback.
        """
        filepath = os.path.join(self.asset_dir, filename)
        try:
            img = pygame.image.load(filepath)
            return pygame.transform.scale(img, (CELL_SIZE, CELL_SIZE))
        except:
            surf = pygame.Surface((CELL_SIZE, CELL_SIZE))
            surf.fill(fallback_color)
            return surf

    def create_exit_sprite(self):
        """
        Membuat dan mengembalikan sprite pintu keluar secara prosedural (digambar).
        Sprite pintu terdiri dari bingkai, pintu utama, dan kenop.
        
        Returns:
            pygame.Surface: Sprite pintu keluar.
        """
        surf = pygame.Surface((CELL_SIZE, CELL_SIZE), pygame.SRCALPHA)
        pygame.draw.rect(surf, (101, 67, 33), (5, 0, CELL_SIZE - 10, CELL_SIZE))
        pygame.draw.rect(surf, (70, 130, 70), (8, 3, CELL_SIZE - 16, CELL_SIZE - 6))
        pygame.draw.circle(surf, YELLOW, (CELL_SIZE - 15, CELL_SIZE // 2), 4)
        return surf

    def load_sound(self, filename):
        """
        Memuat file suara menggunakan pygame.mixer.Sound. 
        Jika modul mixer tidak diinisialisasi atau file tidak ditemukan/rusak, 
        fungsi akan mencetak peringatan dan mengembalikan None.

        Args:
            filename (str): Nama file suara yang akan dimuat.

        Returns:
            pygame.mixer.Sound | None: Objek Sound jika berhasil, atau None jika gagal.
        """
        filepath = os.path.join(self.asset_dir, filename)
        try:
            sound = pygame.mixer.Sound(filepath)
            return sound
        except Exception as e:
            print(f"[WARNING] Sound {filename} failed to load: {e}")
            return None

    def create_wall_sprite(self):
        """
        Membuat dan mengembalikan sprite dinding (pola batu bata/ubin) secara prosedural.

        Returns:
            pygame.Surface: Sprite dinding.
        """
        surf = pygame.Surface((CELL_SIZE, CELL_SIZE))
        surf.fill((90, 90, 90))
        for y in range(0, CELL_SIZE, 15):
            offset = 0 if (y // 15) % 2 == 0 else 20
            for x in range(-20 + offset, CELL_SIZE, 40):
                pygame.draw.rect(surf, (60, 60, 60), (x, y, 38, 13))
        return surf

    def create_floor_sprite(self):
        """
        Membuat dan mengembalikan sprite lantai (pola ubin kotak-kotak) secara prosedural.

        Returns:
            pygame.Surface: Sprite lantai.
        """
        surf = pygame.Surface((CELL_SIZE, CELL_SIZE))
        surf.fill((200, 200, 200)) 
        pygame.draw.rect(surf, (180, 180, 180), (0, 0, CELL_SIZE//2, CELL_SIZE//2))
        pygame.draw.rect(surf, (180, 180, 180), (CELL_SIZE//2, CELL_SIZE//2, CELL_SIZE//2, CELL_SIZE//2))
        return surf

# ==============================================================================
# A* NODE (Simpul untuk Algoritma A*)
# ==============================================================================
class Node:
    def __init__(self, pos, g=0, h=0, parent=None):
        """
        Konstruktor Node untuk algoritma A*.

        Args:
            pos (tuple): Koordinat (x, y) dari simpul di grid.
            g (int): Biaya sebenarnya dari titik awal ke simpul ini.
            h (int): Estimasi biaya (heuristik) dari simpul ini ke tujuan.
            parent (Node | None): Simpul sebelumnya dalam jalur terbaik yang ditemukan sejauh ini.
        """
        self.pos = pos       # Posisi (x, y) sebagai tuple
        self.g = g           # Biaya dari titik awal ke simpul ini
        self.h = h           # Estimasi biaya (heuristik) dari simpul ini ke tujuan
        self.f = g + h       # Total biaya (f = g + h)
        self.parent = parent # Simpul sebelumnya dalam jalur terbaik

    def __lt__(self, other):
        """
        Membandingkan dua simpul berdasarkan nilai 'f' (biaya total).
        Digunakan oleh heapq (priority queue) agar simpul dengan F terendah diprioritaskan.

        Args:
            other (Node): Simpul lain yang dibandingkan.

        Returns:
            bool: True jika simpul ini memiliki F lebih rendah dari simpul lain.
        """
        return self.f < other.f

# ==============================================================================
# GAME (Inti Permainan)
# ==============================================================================
class Game:
    def __init__(self):
        """
        Konstruktor utama kelas Game.
        Menyiapkan jendela game, memuat font, memuat aset, dan mengatur status awal game.
        """
        self.screen = pygame.display.set_mode((WINDOW_SIZE, WINDOW_SIZE))
        pygame.display.set_caption("Museum Heist - Escape the Police!")
        self.clock = pygame.time.Clock() 
        
        font_path = "./assets/upheavtt.ttf"
        try:
            self.title_font = pygame.font.Font(font_path, 64)   # Font judul
            self.subtitle_font = pygame.font.Font(None, 32)     # Font sub-judul
            self.font = pygame.font.Font(None, 24)              # Font teks biasa
        except:
            self.title_font = pygame.font.Font(None, 64)
        
        self.assets = AssetLoader() # Pemuat aset game
        self.game_state = MENU      # Status game awal: Menu
        self.selected_level = 1     # Level yang dipilih saat ini
        self.reset_timers()         # Inisialisasi variabel waktu/timer

    def reset_timers(self):
        """
        Mereset semua variabel waktu permainan dan status pemutaran suara
        ke nilai awal, mempersiapkan untuk putaran permainan baru.
        """
        self.last_move_time = 0         # Waktu terakhir pencuri bergerak
        self.last_police_move = 0       # Waktu terakhir polisi bergerak
        self.start_time = 0             # Waktu game dimulai
        self.elapsed_time = 0           # Waktu total yang berlalu di level
        self.timer_started = False      # Status apakah timer game sudah berjalan

        # Status pemutaran suara
        self.running_sound_playing = False
        self.before_sound_playing = False
        self.win_sound_playing = False
        self.lose_sound_playing = False

    # --- FUNGSI PENGATUR SUARA --- 
    def play_running_sound(self):
        """Memutar suara lari berulang kali (-1) saat pengejaran dimulai."""
        sound = None
        try:
            sound = self.assets.assets.get('running')
        except Exception:
            return
        if sound and not getattr(self, 'running_sound_playing', False):
            try:
                sound.set_volume(0.5)
                sound.play(-1) 
                self.running_sound_playing = True
            except Exception:
                pass
    
    def stop_running_sound(self):
        """Menghentikan suara lari dan mengatur status pemutaran."""
        try:
            sound = self.assets.assets.get('running')
        except Exception:
            sound = None
        if sound:
            try:
                sound.stop()
            except Exception:
                pass
        self.running_sound_playing = False
        
    def play_before_sound(self):
        """Memutar suara 'before' berulang kali (-1) saat fase pra-pencurian."""
        sound = None
        try:
            sound = self.assets.assets.get('before')
        except Exception:
            return
        if sound and not getattr(self, 'before_sound_playing', False):
            try:
                sound.play(-1)
                self.before_sound_playing = True
            except Exception:
                pass

    def stop_before_sound(self):
        """Menghentikan suara 'before' dan mengatur status pemutaran."""
        try:
            sound = self.assets.assets.get('before')
        except Exception:
            sound = None
        if sound:
            try:
                sound.stop()
            except Exception:
                pass
        self.before_sound_playing = False

    def play_win_sound(self):
        """Memutar suara menang (sekali: 0) dan mengatur status pemutaran."""
        sound = None
        try:
            sound = self.assets.assets.get('win')
        except Exception:
            return
        if sound and not getattr(self, 'win_sound_playing', False):
            try:
                sound.play(0) 
                self.win_sound_playing = True
            except Exception:
                pass

    def stop_win_sound(self):
        """Menghentikan suara menang dan mengatur status pemutaran."""
        try:
            sound = self.assets.assets.get('win')
        except Exception:
            sound = None
        if sound:
            try:
                sound.stop()
            except Exception:
                pass
        self.win_sound_playing = False

    def play_lose_sound(self):
        """Memutar suara kalah (sekali: 0) dan mengatur status pemutaran."""
        sound = None
        try:
            sound = self.assets.assets.get('lose')
        except Exception:
            return
        if sound and not getattr(self, 'lose_sound_playing', False):
            try:
                sound.play(0)
                self.lose_sound_playing = True
            except Exception:
                pass

    def stop_lose_sound(self):
        """Menghentikan suara kalah dan mengatur status pemutaran."""
        try:
            sound = self.assets.assets.get('lose')
        except Exception:
            sound = None
        if sound:
            try:
                sound.stop()
            except Exception:
                pass
        self.lose_sound_playing = False

    def get_random_position(self, exclude=[], min_distance=1):
        """
        Mencari dan mengembalikan posisi grid yang kosong (bukan dinding) secara acak.
        Fungsi ini memiliki dua batasan ketat:
        1. Posisi harus merupakan lantai (grid[y][x] == 0).
        2. Jarak Manhattan ke **setiap** posisi di `exclude` harus lebih besar dari atau
           sama dengan `min_distance`.

        Args:
            exclude (list): Daftar posisi `[x, y]` yang harus dihindari.
            min_distance (int): Jarak Manhattan minimum dari posisi `exclude`.

        Returns:
            list: Koordinat `[x, y]` dari posisi yang valid.
        """
        for _ in range(10000):  
            x, y = random.randint(1, GRID_SIZE - 2), random.randint(1, GRID_SIZE - 2)
            current_pos = [x, y]
            
            # Pengecekan 1: Pastikan bukan dinding
            if self.grid[y][x] == 0:
                # Pengecekan 2: Pastikan jarak Manhattan >= min_distance dari SEMUA excluded_pos
                is_far_enough = all(self.manhattan_distance(current_pos, pos) >= min_distance 
                                    for pos in exclude)
                
                if is_far_enough:
                    return current_pos
                    
        # Fallback: Jika gagal menemukan posisi valid (sangat jarang terjadi), kembalikan posisi tengah
        return [GRID_SIZE // 2, GRID_SIZE // 2]

    def clear_area(self, positions):
        """
        Mengubah sel-sel di sekitar posisi yang diberikan (termasuk posisi itu sendiri,
        dalam area 3x3) menjadi lantai (0), memastikan elemen-elemen penting game 
        tidak tertutup dinding saat game dimulai.

        Args:
            positions (list): Daftar posisi `[x, y]` yang harus dibersihkan areanya.
        """
        for pos in positions:
            for dy in range(-1, 2):
                for dx in range(-1, 2):
                    ny, nx = pos[1] + dy, pos[0] + dx
                    # Cek batas grid
                    if 0 <= ny < GRID_SIZE and 0 <= nx < GRID_SIZE:
                        self.grid[ny][nx] = 0 # 0 = Lantai

    def reset_game(self):
        """
        Menginisialisasi ulang semua variabel dan elemen untuk memulai permainan baru.
        Ini termasuk:
        1. Mengambil konfigurasi level.
        2. Menghentikan/memulai suara latar belakang yang relevan.
        3. Membuat grid baru dengan dinding acak.
        4. Menentukan posisi elemen utama (Uang, Pintu Keluar, Pencuri, Polisi).
        5. Membersihkan area di sekitar elemen penting.
        """
        self.current_level = self.selected_level
        config = LEVEL_CONFIG[self.current_level]
        
        try:
            self.stop_running_sound()
            self.stop_before_sound()
            self.play_before_sound()
        except Exception:
            pass
        
        # Pembuatan Grid
        self.grid = [[0] * GRID_SIZE for _ in range(GRID_SIZE)]
        wall_count = int(GRID_SIZE * GRID_SIZE * config["walls"])
        for _ in range(wall_count):
            self.grid[random.randint(1, GRID_SIZE-2)][random.randint(1, GRID_SIZE-2)] = 1
        
        # Penempatan Elemen
        self.money_pos = self.get_random_position()
        self.exit_pos = self.get_random_position([self.money_pos], min_distance=10)
        self.thief_pos = list(self.exit_pos)
        self.thief_prev_pos = list(self.exit_pos)
        self.police_positions = [
            self.get_random_position([self.money_pos, self.exit_pos], min_distance=5),
            self.get_random_position([self.money_pos, self.exit_pos], min_distance=5)
        ]
        
        self.clear_area([self.thief_pos, self.money_pos, self.exit_pos] + self.police_positions)
        
        # Pengaturan Status
        self.police_paths = [[], []]
        self.police_move_delay = config["police_speed"]
        self.money_collected = False
        self.interceptor_mode = "intercept"
        self.game_state = PLAYING
        self.reset_timers()

    def manhattan_distance(self, pos1, pos2):
        """
        Menghitung Jarak Manhattan ($|x_1 - x_2| + |y_1 - y_2|$),
        yaitu jumlah perbedaan absolut koordinat x dan y.
        Digunakan sebagai heuristik (H) dalam A* dan untuk mengukur jarak fisik.

        Args:
            pos1 (list/tuple): Koordinat posisi 1.
            pos2 (list/tuple): Koordinat posisi 2.

        Returns:
            int: Jarak Manhattan.
        """
        return abs(pos1[0] - pos2[0]) + abs(pos1[1] - pos2[1])

    def get_neighbors(self, pos):
        """
        Mengembalikan daftar koordinat tetangga dari posisi yang diberikan.
        Hanya mengembalikan tetangga yang valid, yaitu:
        1. Berada di dalam batas grid.
        2. Bukan merupakan dinding (lantai, nilai grid 0).

        Args:
            pos (list): Koordinat `[x, y]` posisi saat ini.

        Returns:
            list: Daftar koordinat `[x, y]` dari tetangga yang valid.
        """
        neighbors = []
        # Periksa 4 arah: Atas, Kanan, Bawah, Kiri
        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            nx, ny = pos[0] + dx, pos[1] + dy
            # Pastikan di dalam batas grid dan bukan dinding
            if 0 <= nx < GRID_SIZE and 0 <= ny < GRID_SIZE and self.grid[ny][nx] == 0:
                neighbors.append([nx, ny])
        return neighbors

    def a_star(self, start, goal):
        """
        Mengimplementasikan algoritma pencarian jalur A* untuk menemukan jalur 
        terpendek (berdasarkan jumlah langkah) dari titik awal ke titik tujuan, 
        menghindari dinding.

        Args:
            start (list): Koordinat awal `[x, y]`.
            goal (list): Koordinat tujuan `[x, y]`.

        Returns:
            list: Daftar koordinat `[x, y]` yang membentuk jalur dari awal ke tujuan 
                  (tidak termasuk titik awal). Jika tidak ada jalur, kembalikan daftar kosong `[]`.
        """
        start_node = Node(tuple(start), 0, self.manhattan_distance(start, goal))
        open_list = [start_node]     # Priority queue (heap) untuk simpul yang akan dievaluasi
        closed_set = set()           # Simpul yang sudah selesai dievaluasi
        g_scores = {tuple(start): 0} # Biaya G terpendek yang ditemukan sejauh ini

        while open_list:
            current = heapq.heappop(open_list) # Ambil simpul dengan F (G+H) terendah

            if current.pos == tuple(goal):
                path = []
                while current.parent:
                    path.append(list(current.pos))
                    current = current.parent
                return path[::-1]

            if current.pos in closed_set:
                continue
            closed_set.add(current.pos)

            for neighbor in self.get_neighbors(list(current.pos)):
                neighbor_tuple = tuple(neighbor)
                if neighbor_tuple in closed_set:
                    continue

                tentative_g = current.g + 1 
                if neighbor_tuple not in g_scores or tentative_g < g_scores[neighbor_tuple]:
                    g_scores[neighbor_tuple] = tentative_g
                    h = self.manhattan_distance(neighbor, goal) 
                    heapq.heappush(open_list, Node(neighbor_tuple, tentative_g, h, current))

        return [] # Tidak ada jalur ditemukan

    def get_intercept_target(self):
        """
        Menghitung posisi 'pencegatan' untuk Polisi 2 (Interceptor).
        Posisi ini diprediksi dengan mengambil gerakan terakhir Pencuri (dx, dy) 
        dan memproyeksikannya hingga 5 langkah ke depan. 
        Tujuannya adalah memotong jalur pelarian Pencuri, bukan hanya mengejar posisi saat ini.

        Returns:
            list: Koordinat `[x, y]` posisi yang diprediksi valid atau posisi Pencuri saat ini.
        """
        # Hitung arah gerakan pencuri terakhir
        dx = self.thief_pos[0] - self.thief_prev_pos[0]
        dy = self.thief_pos[1] - self.thief_prev_pos[1]
        
        # Coba prediksi posisi dari 5 langkah ke depan hingga 1 langkah ke depan
        for step in range(5, 0, -1):
            tx, ty = self.thief_pos[0] + dx * step, self.thief_pos[1] + dy * step
            # Periksa apakah posisi prediksi valid (di dalam grid dan bukan dinding)
            if 0 <= tx < GRID_SIZE and 0 <= ty < GRID_SIZE and self.grid[ty][tx] == 0:
                return [tx, ty] # Target adalah posisi prediksi yang valid
        # Jika tidak ada gerakan prediksi yang valid, targetkan posisi pencuri saat ini
        return self.thief_pos

    def handle_input(self):
        """
        Menangani input keyboard untuk navigasi menu dan gerakan Pencuri.
        Gerakan Pencuri dibatasi oleh `MOVE_DELAY` untuk gerakan berbasis langkah.
        Juga memeriksa:
        - Pengambilan uang (`money_collected`).
        - Kondisi kemenangan (`THIEF_WIN`).
        - Memulai timer game pada gerakan pertama.
        """
        keys = pygame.key.get_pressed()
        current_time = pygame.time.get_ticks()
        
        if self.game_state == MENU:
            # Kontrol menu
            if current_time - self.last_move_time < 150: return
            if keys[pygame.K_UP] or keys[pygame.K_w]:
                self.selected_level = max(1, self.selected_level - 1)
                self.last_move_time = current_time
            elif keys[pygame.K_DOWN] or keys[pygame.K_s]:
                self.selected_level = min(len(LEVEL_CONFIG), self.selected_level + 1)
                self.last_move_time = current_time
        
        elif self.game_state == PLAYING:
            # Kontrol gerakan pencuri
            if current_time - self.last_move_time < MOVE_DELAY: return
            
            new_pos = list(self.thief_pos)
            moved = False
            
            # Tentukan posisi baru berdasarkan input
            if keys[pygame.K_UP] or keys[pygame.K_w]:
                new_pos[1] -= 1
                moved = True
            elif keys[pygame.K_DOWN] or keys[pygame.K_s]:
                new_pos[1] += 1
                moved = True
            elif keys[pygame.K_LEFT] or keys[pygame.K_a]:
                new_pos[0] -= 1
                moved = True
            elif keys[pygame.K_RIGHT] or keys[pygame.K_d]:
                new_pos[0] += 1
                moved = True
            
            # Validasi dan update posisi
            if moved and 0 <= new_pos[0] < GRID_SIZE and 0 <= new_pos[1] < GRID_SIZE:
                if self.grid[new_pos[1]][new_pos[0]] == 0: # Cek apakah bukan dinding
                    if not self.timer_started:
                        self.timer_started = True
                        self.start_time = current_time
                        
                    self.thief_prev_pos = list(self.thief_pos) 
                    self.thief_pos = new_pos                    
                    self.last_move_time = current_time
                    
                    # Cek pengambilan uang
                    if self.thief_pos == self.money_pos:
                        self.money_collected = True
                        try:
                            self.stop_before_sound()
                            self.play_running_sound() # Mulai musik pengejaran
                        except Exception:
                            pass
                        
                    # Cek kondisi menang
                    if self.thief_pos == self.exit_pos and self.money_collected:
                        self.game_state = THIEF_WIN
                        self.elapsed_time = (current_time - self.start_time) / 1000.0
                        try:
                            self.stop_running_sound()
                            self.stop_before_sound()
                            self.play_win_sound()
                        except Exception:
                            pass

    def update_police(self):
        """
        Memperbarui posisi kedua Polisi (AI) berdasarkan logika pengejaran dan pencegatan.
        Polisi hanya bergerak setelah uang diambil dan setelah `police_move_delay`.
        Logika pergerakan:
        1. Polisi 1 (Chaser): Selalu mengejar posisi Pencuri saat ini menggunakan A*.
        2. Polisi 2 (Interceptor): 
           - Jika Jarak Manhattan < `INTERCEPT_DISTANCE`, mengejar posisi Pencuri saat ini ('chase').
           - Jika Jarak Manhattan > `INTERCEPT_DISTANCE`, mengejar posisi prediksi (`get_intercept_target()`) ('intercept').
        Juga memeriksa kondisi kekalahan (`POLICE_WIN`).
        """
        if self.game_state != PLAYING or not self.money_collected:
            return
        
        current_time = pygame.time.get_ticks()
        if current_time - self.last_police_move < self.police_move_delay:
            return
        
        self.last_police_move = current_time

        # Polisi 1: Direct chaser
        path = self.a_star(self.police_positions[0], self.thief_pos)
        self.police_paths[0] = path
        if path:
            self.police_positions[0] = path[0]

        # Polisi 2: Interceptor (Logika beralih mode)
        distance = self.manhattan_distance(self.police_positions[1], self.thief_pos)
        self.interceptor_mode = "chase" if distance <= INTERCEPT_DISTANCE else "intercept"
        target = self.thief_pos if self.interceptor_mode == "chase" else self.get_intercept_target()
        
        path = self.a_star(self.police_positions[1], target)
        self.police_paths[1] = path
        if path:
            self.police_positions[1] = path[0]

        # Cek penangkapan (kondisi kalah)
        if self.thief_pos in self.police_positions:
            self.game_state = POLICE_WIN
            self.elapsed_time = (current_time - self.start_time) / 1000.0
            try:
                self.stop_running_sound()
                self.stop_before_sound()
                self.play_lose_sound()
            except Exception:
                pass

    def draw_menu(self):
        """Menggambar seluruh elemen pada layar menu utama, termasuk judul, opsi level, dan instruksi."""
        # Gambar latar belakang gradien
        for y in range(WINDOW_SIZE):
            t = y / WINDOW_SIZE
            r = int(10 * (1 - t) + 30 * t)
            g = int(10 * (1 - t) + 30 * t)
            b = int(50 * (1 - t) + 100 * t)
            pygame.draw.line(self.screen, (r, g, b), (0, y), (WINDOW_SIZE, y))
        
        # Gambar Judul
        title = self.title_font.render("MUSEUM HEIST", True, RED)
        self.screen.blit(title, (WINDOW_SIZE//2 - title.get_width()//2, 40))
        
        # Gambar opsi level
        subtitle = self.subtitle_font.render("Pilih Level:", True, WHITE)
        self.screen.blit(subtitle, (WINDOW_SIZE//2 - subtitle.get_width()//2, 150))
        y = 200
        for level, config in LEVEL_CONFIG.items():
            color = ORANGE if level == self.selected_level else WHITE
            text = self.font.render(f"Level {level}: {config['name']}", True, color)
            self.screen.blit(text, (200, y))
            if level == self.selected_level:
                pygame.draw.circle(self.screen, color, (180, y + 8), 5)
            y += 40
        
        # Gambar instruksi
        info = self.font.render("ENTER to Start", True, (150, 150, 150))
        self.screen.blit(info, (WINDOW_SIZE//2 - info.get_width()//2, WINDOW_SIZE - 60))

    def draw_game(self):
        """
        Menggambar seluruh elemen pada layar permainan (status `PLAYING`).
        Ini termasuk grid (lantai/dinding), elemen game (uang, pintu keluar),
        karakter (pencuri, polisi), jalur prediksi polisi, dan HUD.
        Juga bertanggung jawab untuk menggambar layar Game Over/Menang jika status game berubah.
        """
        self.screen.fill(WHITE)

        # Draw grid
        for y in range(GRID_SIZE):
            for x in range(GRID_SIZE):
                sprite = self.assets.assets['wall'] if self.grid[y][x] == 1 else self.assets.assets['floor']
                self.screen.blit(sprite, (x * CELL_SIZE, y * CELL_SIZE))

        # Draw police paths (visualisasi 5 langkah pertama jalur A*)
        if self.money_collected and POLICE_PATH_VISUALIZATION:
                for i, path in enumerate(self.police_paths):
                    alpha = 100 if i == 0 else 80 
                    color = (255, 200, 200, alpha) if i == 0 else (200, 100, 100, alpha)
                    for pos in path: 
                        s = pygame.Surface((CELL_SIZE-20, CELL_SIZE-20), pygame.SRCALPHA)
                        s.fill(color)
                        self.screen.blit(s, (pos[0]*CELL_SIZE+10, pos[1]*CELL_SIZE+10))

        # Draw game elements and characters
        self.screen.blit(self.assets.assets['exit'], (self.exit_pos[0]*CELL_SIZE, self.exit_pos[1]*CELL_SIZE))
        if not self.money_collected:
            self.screen.blit(self.assets.assets['money'], (self.money_pos[0]*CELL_SIZE, self.money_pos[1]*CELL_SIZE))
        self.screen.blit(self.assets.assets['thief'], (self.thief_pos[0]*CELL_SIZE, self.thief_pos[1]*CELL_SIZE))
        self.screen.blit(self.assets.assets['police1'], (self.police_positions[0][0]*CELL_SIZE, self.police_positions[0][1]*CELL_SIZE))
        self.screen.blit(self.assets.assets['police2'], (self.police_positions[1][0]*CELL_SIZE, self.police_positions[1][1]*CELL_SIZE))

        # Draw HUD 
        status = "Steal the Gold!" if not self.money_collected else "ESCAPE! Police chasing!"
        color = ORANGE if not self.money_collected else RED
        self.draw_hud_text(status, color, 10, 5, self.subtitle_font)
        
        if self.game_state == PLAYING:
            elapsed = (pygame.time.get_ticks() - self.start_time) / 1000.0 if self.timer_started else 0
        else :
            elapsed = self.elapsed_time
        self.draw_hud_text(f"Time: {elapsed:.1f}s", BLACK, 10, 40, self.font)
        
        config = LEVEL_CONFIG[self.current_level]
        self.draw_hud_text(f"Level {self.current_level}: {config['name']}", BLACK, 10, 65, self.font)

        # Draw game over / win screen
        if self.game_state != PLAYING:
            overlay = pygame.Surface((WINDOW_SIZE, WINDOW_SIZE))
            overlay.fill(BLACK)
            overlay.set_alpha(150)
            self.screen.blit(overlay, (0, 0))
            
            # Teks hasil
            if self.game_state == THIEF_WIN:
                msg, color = "YOU ESCAPED!", GREEN
                action = "Press N for Next | R for Menu | Q to Quit" if self.current_level < len(LEVEL_CONFIG) else "Press R for Menu | Q to Quit"
            else:
                msg, color = "CAUGHT!", RED
                action = "Press R for Menu | Q to Quit"
            
            text = self.title_font.render(msg, True, color)
            score = self.subtitle_font.render(f"Time: {self.elapsed_time:.1f}s", True, WHITE)
            restart = self.font.render(action, True, WHITE)
            
            # Posisikan teks di tengah
            cx, cy = WINDOW_SIZE // 2, WINDOW_SIZE // 2
            self.screen.blit(text, (cx - text.get_width()//2, cy - 60))
            self.screen.blit(score, (cx - score.get_width()//2, cy+10))
            self.screen.blit(restart, (cx - restart.get_width()//2, cy + 300))

    def draw_hud_text(self, text, color, x, y, font=None):
        """
        Menggambar teks HUD dengan menambahkan latar belakang kotak putih semi-transparan 
        di belakang teks agar teks lebih mudah dibaca terlepas dari latar belakang grid.

        Args:
            text (str): Teks yang akan digambar.
            color (tuple): Warna RGB teks.
            x (int): Koordinat X di layar.
            y (int): Koordinat Y di layar.
            font (pygame.font.Font | None): Objek font yang akan digunakan.
        """
        if font is None:
            font = self.font
        rendered = font.render(text, True, color)

        # Buat latar belakang
        bg = pygame.Surface((rendered.get_width() + 10, rendered.get_height() + 5))
        bg.fill(WHITE)
        bg.set_alpha(200) # Atur transparansi 200/255
        self.screen.blit(bg, (x - 5, y))
        self.screen.blit(rendered, (x, y + 2))

    def draw(self):
        """
        Fungsi utama untuk menggambar. Memilih antara `draw_menu()` atau `draw_game()` 
        berdasarkan `self.game_state` dan memperbarui tampilan layar (`pygame.display.flip()`).
        """
        if self.game_state == MENU:
            self.draw_menu()
        else:
            self.draw_game()
        pygame.display.flip() # Update seluruh layar

    def run(self):
        """
        Loop utama permainan.
        Bertanggung jawab untuk:
        1. Mengolah semua event Pygame (QUIT, KEYDOWN).
        2. Mengelola transisi status game (Menu, Play, Win, Lose).
        3. Memanggil `handle_input()` dan `update_police()` untuk logika game.
        4. Memanggil `draw()` untuk rendering.
        5. Mengontrol frame rate (`self.clock.tick(FPS)`).
        6. Memastikan semua suara berhenti saat game ditutup atau kembali ke menu.
        """
        running = True

        # Penanganan Event
        while running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False 
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_q: # Tombol Q: Keluar/Kembali ke Menu
                        running = False if self.game_state == MENU else None 
                        self.game_state = MENU if self.game_state != MENU else self.game_state
                    elif event.key == pygame.K_RETURN and self.game_state == MENU:
                        self.reset_game() # Mulai game
                    elif event.key == pygame.K_r and self.game_state != MENU:
                        self.game_state = MENU # Kembali ke Menu
                    elif event.key == pygame.K_n: # Tombol N: Lanjut ke level berikutnya
                        if self.game_state == THIEF_WIN and self.current_level < len(LEVEL_CONFIG):
                            self.selected_level = self.current_level + 1
                            self.reset_game()

            # Logika game
            self.handle_input()
            self.update_police()
            
            # Penghentian suara saat di menu
            if self.game_state == MENU:
                try:
                    self.stop_running_sound()
                    self.stop_before_sound()
                    self.stop_win_sound()
                    self.stop_lose_sound()
                except Exception:
                    pass
                    
            # Gambar ulang layar
            self.draw()

            # Batasi frame rate
            self.clock.tick(FPS)
        
        # Keluar dari pygame saat loop utama berakhir
        pygame.quit()

if __name__ == "__main__":
    # Jalankan game saat skrip dieksekusi
    Game().run()
