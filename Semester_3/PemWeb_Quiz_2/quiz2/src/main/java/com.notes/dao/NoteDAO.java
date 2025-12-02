package com.notes.dao;

import com.notes.model.Note;
import com.notes.util.DB;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * NoteDAO (Data Access Object)
 * ----------------------------
 * Kelas ini bertanggung jawab untuk menangani semua operasi database terkait tabel 'notes'.
 * * FITUR KEAMANAN & MULTI-USER:
 * Berbeda dengan versi sebelumnya, semua method di kelas ini sekarang mewajibkan
 * parameter 'userId'. Ini menerapkan prinsip "User Isolation", di mana setiap query
 * SQL ditambahkan klausa "WHERE user_id = ?" untuk memastikan pengguna hanya bisa
 * mengakses, mengedit, atau menghapus catatan milik mereka sendiri.
 */
public class NoteDAO {

    /**
     * 1. CREATE: Menambahkan catatan baru ke database.
     * * @param note   Objek Note yang berisi judul dan konten.
     * @param userId ID pengguna yang membuat catatan (Foreign Key).
     */
    public void insertNote(Note note, int userId) {
        // Menggunakan try-with-resources untuk menutup koneksi secara otomatis
        try (Connection conn = DB.getConnection();
             PreparedStatement ps = conn.prepareStatement("INSERT INTO notes (title, content, is_pinned, user_id) VALUES (?, ?, ?, ?)")) {
            
            ps.setString(1, note.getTitle());
            ps.setString(2, note.getContent());
            ps.setBoolean(3, false); // Default: Catatan baru tidak di-pin
            ps.setInt(4, userId);    // Menandai pemilik catatan
            
            ps.executeUpdate();
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
    }

    /**
     * 2. READ ALL: Mengambil semua catatan milik user tertentu.
     * * Logika Sorting:
     * 1. Pinned (Favorit) muncul paling atas.
     * 2. Updated At (Terbaru diedit) muncul setelahnya.
     * * @param userId ID pengguna yang sedang login.
     * @return List<Note> Daftar catatan milik user tersebut.
     */
    public List<Note> selectAllNotes(int userId) {
        List<Note> notes = new ArrayList<>();
        try (Connection conn = DB.getConnection();
             // Filter WHERE user_id = ? sangat penting agar data antar user tidak bocor
             PreparedStatement ps = conn.prepareStatement("SELECT * FROM notes WHERE user_id = ? ORDER BY is_pinned DESC, updated_at DESC")) {
            
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            
            while (rs.next()) {
                notes.add(mapResultSetToNote(rs));
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return notes;
    }

    /**
     * 3. READ ONE: Mengambil satu catatan spesifik.
     * * KEAMANAN (IDOR Protection):
     * Kita menggunakan query "WHERE id = ? AND user_id = ?".
     * Ini mencegah pengguna A mengakses catatan pengguna B meskipun pengguna A
     * menebak ID catatan tersebut melalui URL (Insecure Direct Object Reference).
     * * @param id     ID catatan yang dicari.
     * @param userId ID pemilik catatan.
     * @return Note jika ditemukan dan milik user tersebut, null jika tidak.
     */
    public Note selectNote(int id, int userId) {
        Note note = null;
        try (Connection conn = DB.getConnection();
             PreparedStatement ps = conn.prepareStatement("SELECT * FROM notes WHERE id = ? AND user_id = ?")) {
            
            ps.setInt(1, id);
            ps.setInt(2, userId);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                note = mapResultSetToNote(rs);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return note;
    }

    /**
     * 4. SEARCH: Mencari catatan berdasarkan kata kunci.
     * Hanya mencari di dalam catatan milik user sendiri.
     * * @param keyword Kata kunci pencarian.
     * @param userId  ID pemilik.
     * @return List<Note> Hasil pencarian.
     */
    public List<Note> searchNotes(String keyword, int userId) {
        List<Note> notes = new ArrayList<>();
        try (Connection conn = DB.getConnection();
             PreparedStatement ps = conn.prepareStatement("SELECT * FROM notes WHERE user_id = ? AND (title LIKE ? OR content LIKE ?) ORDER BY is_pinned DESC")) {
            
            ps.setInt(1, userId);
            String query = "%" + keyword + "%"; // Wildcard untuk pencarian parsial
            ps.setString(2, query); // Parameter Title
            ps.setString(3, query); // Parameter Content
            
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                notes.add(mapResultSetToNote(rs));
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return notes;
    }

    /**
     * 5. UPDATE CONTENT: Mengupdate isi catatan.
     * * @param note   Objek note dengan data baru.
     * @param userId ID pemilik (untuk verifikasi keamanan).
     */
    public void updateNote(Note note, int userId) {
        try (Connection conn = DB.getConnection();
             PreparedStatement ps = conn.prepareStatement("UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?")) {
            
            ps.setString(1, note.getTitle());
            ps.setString(2, note.getContent());
            ps.setInt(3, note.getId());
            ps.setInt(4, userId); // Verifikasi kepemilikan sebelum update
            
            ps.executeUpdate();
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
    }
    
    /**
     * Helper: SAVE (Upsert Logic).
     * Menentukan apakah harus melakukan INSERT atau UPDATE.
     * * @param note   Objek note.
     * @param userId ID pemilik.
     */
    public void saveNote(Note note, int userId) {
        // Jika ID > 0, berarti data sudah ada di DB -> Lakukan Update
        if (note.getId() > 0) {
            updateNote(note, userId);
        } 
        // Jika ID 0 atau kosong, berarti data baru -> Lakukan Insert
        else {
            insertNote(note, userId);
        }
    }

    /**
     * 6. UPDATE PIN: Mengubah status favorit (Toggle).
     * Menggunakan query 'NOT is_pinned' untuk membalik nilai boolean.
     * * @param id     ID catatan.
     * @param userId ID pemilik.
     */
    public void togglePin(int id, int userId) {
        try (Connection conn = DB.getConnection();
             PreparedStatement ps = conn.prepareStatement("UPDATE notes SET is_pinned = NOT is_pinned WHERE id = ? AND user_id = ?")) {
            
            ps.setInt(1, id);
            ps.setInt(2, userId);
            ps.executeUpdate();
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
    }

    /**
     * 7. DELETE ONE: Menghapus satu catatan.
     * * @param id     ID catatan.
     * @param userId ID pemilik.
     */
    public void deleteNote(int id, int userId) {
        try (Connection conn = DB.getConnection();
             PreparedStatement ps = conn.prepareStatement("DELETE FROM notes WHERE id = ? AND user_id = ?")) {
            
            ps.setInt(1, id);
            ps.setInt(2, userId);
            ps.executeUpdate();
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
    }

    /**
     * 8. DELETE ALL: Menghapus SEMUA catatan milik user tertentu.
     * Catatan milik user lain TIDAK akan terhapus.
     * * @param userId ID pemilik yang ingin membersihkan catatannya.
     */
    public void deleteAllNotes(int userId) {
        try (Connection conn = DB.getConnection();
             PreparedStatement ps = conn.prepareStatement("DELETE FROM notes WHERE user_id = ?")) {
            
            ps.setInt(1, userId);
            ps.executeUpdate();
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
    }

    /**
     * Helper: Mapper ResultSet.
     * Mengonversi baris data SQL menjadi objek Java Note.
     */
    private Note mapResultSetToNote(ResultSet rs) throws SQLException {
        return new Note(
            rs.getInt("id"), 
            rs.getString("title"), 
            rs.getString("content"), 
            rs.getBoolean("is_pinned"), 
            rs.getTimestamp("created_at"), 
            rs.getTimestamp("updated_at")
        );
    }
}