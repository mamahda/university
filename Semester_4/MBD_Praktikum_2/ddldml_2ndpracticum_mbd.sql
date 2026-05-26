-- Active: 1774190586555@@127.0.0.1@5432@prakticum2_mbd
-- 1. DDL: CREATE TABLES

CREATE DATABASE prakticum2_mbd;

CREATE TABLE PENULIS (
    penulis_id VARCHAR(5) PRIMARY KEY,
    nama_penulis VARCHAR(100) NOT NULL
);

CREATE TABLE BUKU (
    kode_buku VARCHAR(10) PRIMARY KEY,
    penulis_id VARCHAR(5),
    judul_buku VARCHAR(150) NOT NULL,
    tahun_terbit INT,
    harga NUMERIC(10, 2) NOT NULL,
    stok INT NOT NULL,
    FOREIGN KEY (penulis_id) REFERENCES PENULIS (penulis_id) ON DELETE CASCADE
);

CREATE TABLE PENJUALAN (
    no_nota VARCHAR(10) PRIMARY KEY,
    nama_pelanggan VARCHAR(100) NOT NULL,
    tanggal_penjualan DATE NOT NULL
);

CREATE TABLE DETAIL_PENJUALAN (
    detail_id VARCHAR(10) PRIMARY KEY,
    kode_buku VARCHAR(10),
    no_nota VARCHAR(10),
    jumlah_beli INT NOT NULL,
    total_harga NUMERIC(12, 2) NOT NULL,
    FOREIGN KEY (kode_buku) REFERENCES BUKU (kode_buku) ON DELETE CASCADE,
    FOREIGN KEY (no_nota) REFERENCES PENJUALAN (no_nota) ON DELETE CASCADE
);

-- 2. DML: INSERT DATA

INSERT INTO
    PENULIS (penulis_id, nama_penulis)
VALUES ('P01', 'Andrea Hirata'),
    ('P02', 'Raditya Dika'),
    ('P03', 'Tere Liye'),
    ('P04', 'Dee Lestari');

INSERT INTO
    BUKU (
        kode_buku,
        penulis_id,
        judul_buku,
        tahun_terbit,
        harga,
        stok
    )
VALUES (
        'BK-01',
        'P01',
        'Laskar Pelangi',
        2005,
        85000.00,
        25
    ),
    (
        'BK-02',
        'P01',
        'Sang Pemimpi',
        2006,
        75000.00,
        12
    ),
    (
        'BK-03',
        'P02',
        'Cinta Brontosaurus',
        2006,
        65000.00,
        18
    ),
    (
        'BK-04',
        'P03',
        'Bumi',
        2014,
        95000.00,
        30
    ),
    (
        'BK-05',
        'P04',
        'Perahu Kertas',
        2009,
        65000.00,
        20
    );

INSERT INTO
    PENJUALAN (
        no_nota,
        nama_pelanggan,
        tanggal_penjualan
    )
VALUES (
        'NOTA-001',
        'Andi Pratama',
        '2024-04-10'
    ),
    (
        'NOTA-002',
        'Siti Rahmawati',
        '2024-04-15'
    ),
    (
        'NOTA-003',
        'Budi Santoso',
        '2024-05-02'
    ),
    (
        'NOTA-004',
        'Diana Putri',
        '2024-05-10'
    );

INSERT INTO
    DETAIL_PENJUALAN (
        detail_id,
        kode_buku,
        no_nota,
        jumlah_beli,
        total_harga
    )
VALUES (
        'DTL-001',
        'BK-01',
        'NOTA-001',
        2,
        170000.00
    ),
    (
        'DTL-002',
        'BK-02',
        'NOTA-001',
        1,
        75000.00
    ),
    (
        'DTL-003',
        'BK-05',
        'NOTA-001',
        1,
        65000.00
    ),
    (
        'DTL-004',
        'BK-03',
        'NOTA-002',
        1,
        65000.00
    ),
    (
        'DTL-005',
        'BK-02',
        'NOTA-002',
        1,
        75000.00
    ),
    (
        'DTL-006',
        'BK-04',
        'NOTA-003',
        5,
        475000.00
    ),
    (
        'DTL-007',
        'BK-01',
        'NOTA-003',
        2,
        170000.00
    ),
    (
        'DTL-008',
        'BK-04',
        'NOTA-004',
        5,
        475000.00
    ),
    (
        'DTL-009',
        'BK-03',
        'NOTA-004',
        2,
        130000.00
    );