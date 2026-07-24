-- 1. Tabel Departemen
CREATE TABLE Departemen (
    id_departemen VARCHAR(10) PRIMARY KEY,
    nama_departemen VARCHAR(50) NOT NULL
);

-- 2. Tabel Kantin
CREATE TABLE Kantin (
    id_kantin SERIAL PRIMARY KEY,
    nama_kantin VARCHAR(50) NOT NULL,
    lokasi VARCHAR(50) NOT NULL
);

-- 3. Tabel Pelanggan
CREATE TABLE Pelanggan (
    id_pelanggan VARCHAR(15) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    no_hp VARCHAR(15),
    email VARCHAR(50) UNIQUE,
    password VARCHAR(50) NOT NULL,
    id_departemen VARCHAR(10),
    CONSTRAINT fk_pelanggan_departemen FOREIGN KEY (id_departemen) 
        REFERENCES Departemen(id_departemen) ON DELETE SET NULL
);

-- 4. Tabel Toko
CREATE TABLE Toko (
    id_toko SERIAL PRIMARY KEY,
    nama VARCHAR(50) NOT NULL,
    waktu_buka TIME NOT NULL,
    waktu_tutup TIME NOT NULL,
    is_open BOOLEAN DEFAULT TRUE,
    email VARCHAR(50) UNIQUE,
    password VARCHAR(50) NOT NULL,
    id_kantin INT,
    CONSTRAINT fk_toko_kantin FOREIGN KEY (id_kantin) 
        REFERENCES Kantin(id_kantin) ON DELETE SET NULL
);

-- 5. Tabel Menu
CREATE TABLE Menu (
    id_menu VARCHAR(5) PRIMARY KEY,
    nama_menu VARCHAR(50) NOT NULL,
    harga DECIMAL(9,2) NOT NULL, 
    stok INT NOT NULL DEFAULT 0,
    id_toko INT,
    CONSTRAINT fk_menu_toko FOREIGN KEY (id_toko) 
        REFERENCES Toko(id_toko) ON DELETE CASCADE
);

-- 6. Tabel Pesanan
CREATE TABLE Pesanan (
    id_pesanan SERIAL PRIMARY KEY,
    total_bayar DECIMAL(12,2) NOT NULL DEFAULT 0.00, 
    catatan VARCHAR(255),
    waktu_pesan TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status_pesanan VARCHAR(25) NOT NULL,
    metode_pembayaran VARCHAR(50) NOT NULL,
    status_pembayaran VARCHAR(25) NOT NULL,
    id_pelanggan VARCHAR(15),
    id_toko INT,
    CONSTRAINT fk_pesanan_pelanggan FOREIGN KEY (id_pelanggan) 
        REFERENCES Pelanggan(id_pelanggan) ON DELETE SET NULL,
    CONSTRAINT fk_pesanan_toko FOREIGN KEY (id_toko) 
        REFERENCES Toko(id_toko) ON DELETE SET NULL
);

-- 7. Tabel Pesanan_Menu (Junction Table)
CREATE TABLE Pesanan_Menu (
    id_pesanan INT,
    id_menu VARCHAR(5),
    quantity INT NOT NULL DEFAULT 1,
    sub_total DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id_pesanan, id_menu),
    CONSTRAINT fk_pm_pesanan FOREIGN KEY (id_pesanan) 
        REFERENCES Pesanan(id_pesanan) ON DELETE CASCADE,
    CONSTRAINT fk_pm_menu FOREIGN KEY (id_menu) 
        REFERENCES Menu(id_menu) ON DELETE CASCADE
);
