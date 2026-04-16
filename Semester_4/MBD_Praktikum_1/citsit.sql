/*
DOKUMENTASI SYNTAX POSTGRESQL (CHEAT SHEET)
Deskripsi: Panduan dasar DDL, DML, dan fungsi PostgreSQL.
*/

-- 1. MANAJEMEN DATABASE & TABEL (DDL)
------------------------------------------------------------

-- Membuat database baru
-- CREATE DATABASE nama_database;

-- Membuat tabel dengan berbagai tipe data
CREATE TABLE karyawan (
    id SERIAL PRIMARY KEY, -- Auto-increment integer
    nama VARCHAR(100) NOT NULL, -- String dengan batas karakter
    email TEXT UNIQUE, -- String tanpa batas, harus unik
    gaji NUMERIC(15, 2) DEFAULT 0, -- Angka presisi (total digit, desimal)
    tanggal_masuk DATE DEFAULT CURRENT_DATE,
    aktif BOOLEAN DEFAULT TRUE,
    metadata JSONB -- Tipe data JSON yang teroptimasi
);

-- Menambah kolom baru ke tabel yang sudah ada
ALTER TABLE karyawan ADD COLUMN departemen VARCHAR(50);

-- Menghapus tabel
DROP TABLE IF EXISTS nama_tabel;

-- 2. MANIPULASI DATA (DML)
------------------------------------------------------------

-- Menambah data (Insert)
INSERT INTO
    karyawan (nama, email, gaji, departemen)
VALUES (
        'Budi Santoso',
        'budi@email.com',
        5000000,
        'IT'
    ),
    (
        'Siti Aminah',
        'siti@email.com',
        6000000,
        'HR'
    );

-- Memperbarui data (Update)
UPDATE karyawan SET gaji = 7000000 WHERE nama = 'Budi Santoso';

-- Menghapus data (Delete)
DELETE FROM karyawan WHERE id = 1;

-- Upsert (Insert atau Update jika terjadi konflik pada email)
INSERT INTO
    karyawan (nama, email)
VALUES ('Andi', 'andi@email.com')
ON CONFLICT (email) DO
UPDATE
SET
    nama = EXCLUDED.nama;

-- 3. QUERY DATA (SELECT)
------------------------------------------------------------

-- Filter dasar dan pengurutan
SELECT nama, gaji
FROM karyawan
WHERE
    gaji > 4000000
ORDER BY gaji DESC
LIMIT 5;

-- Pencarian pola (Pattern Matching)
-- % = karakter apa saja, _ = satu karakter tunggal
SELECT * FROM karyawan WHERE nama ILIKE 'bu%';
-- ILIKE = Case-insensitive

-- Agregasi (Group By)
SELECT departemen, COUNT(*), AVG(gaji)
FROM karyawan
GROUP BY
    departemen
HAVING
    COUNT(*) > 0;

-- 4. JOIN (MENGGABUNGKAN TABEL)
------------------------------------------------------------

-- Diasumsikan ada tabel 'departemen'
SELECT k.nama, d.nama_dept
FROM karyawan k
    INNER JOIN departemen d ON k.departemen_id = d.id;

-- LEFT JOIN: Ambil semua karyawan meskipun tidak punya departemen
SELECT k.nama, d.nama_dept
FROM karyawan k
    LEFT JOIN departemen d ON k.departemen_id = d.id;

-- 5. OPERASI LANJUTAN (COMMON TABLE EXPRESSION / CTE)
------------------------------------------------------------

WITH
    gaji_tinggi AS (
        SELECT *
        FROM karyawan
        WHERE
            gaji > 10000000
    )
SELECT *
FROM gaji_tinggi
WHERE
    departemen = 'Finance';

-- 6. FUNGSI WAKTU & STRING
------------------------------------------------------------

-- Mengambil tahun dari tanggal
SELECT EXTRACT( YEAR FROM tanggal_masuk ) FROM karyawan;

-- Manipulasi string
SELECT CONCAT(nama, ' (', departemen, ')') AS label FROM karyawan;

-- Menghitung selisih waktu
SELECT age (tanggal_masuk) FROM karyawan;

-- 7. TRANSAKSI (ACID)
------------------------------------------------------------

BEGIN;

UPDATE karyawan SET gaji = gaji + 500000 WHERE id = 2;
-- Jika ragu: ROLLBACK;
COMMIT;
-- Simpan permanen