SELECT * FROM Departemen;
SELECT * FROM Kantin;
SELECT * FROM Menu;
SELECT * FROM Pelanggan;
SELECT * FROM Pesanan;
SELECT * FROM Pesanan_Menu;
SELECT * FROM Toko;

-- JOIN
-- mencari nama pelanggan di suatu toko pada tanggal tertentu
SELECT DISTINCT pl.nama
FROM Pelanggan pl
JOIN Pesanan p ON pl.id_pelanggan = p.id_pelanggan
WHERE p.id_toko = 1 AND p.waktu_pesan::DATE = '2026-06-12';

-- mencari menu di bawah 15.000
SELECT m.nama_menu, m.harga, t.nama AS nama_toko
FROM Menu m
JOIN Toko t ON m.id_toko = t.id_toko
WHERE m.harga < 15000 LIMIT 5;

-- VIEW
-- antrean pesanan aktif
CREATE OR REPLACE VIEW antrean_pesanan AS
SELECT p.id_pesanan, pl.nama AS pelanggan, t.nama AS toko, p.status_pesanan
FROM Pesanan p
JOIN Pelanggan pl ON p.id_pelanggan = pl.id_pelanggan
JOIN Toko t ON p.id_toko = t.id_toko
WHERE p.status_pesanan IN ('Diproses') LIMIT 5;

SELECT * FROM antrean_pesanan;

-- jumlah pelanggan per departemen
CREATE OR REPLACE VIEW pelanggan_departemen AS
SELECT d.nama_departemen, COUNT(pl.id_pelanggan) AS jumlah_mhs
FROM Departemen d
LEFT JOIN Pelanggan pl ON d.id_departemen = pl.id_departemen
GROUP BY d.id_departemen, d.nama_departemen;

SELECT * FROM pelanggan_departemen;

-- TRIGGER
-- validasi jam operasional toko
CREATE OR REPLACE FUNCTION fn_cek_jam_toko() RETURNS TRIGGER AS $$
DECLARE
    buka  TIME;
    tutup TIME;
    sekarang TIME := CURRENT_TIME;
BEGIN
    SELECT waktu_buka, waktu_tutup
    INTO buka, tutup
    FROM Toko
    WHERE id_toko = NEW.id_toko;

    IF sekarang < buka OR sekarang > tutup THEN
        RAISE EXCEPTION 'toko sudah tutup atau belum buka';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_cek_jam_toko
BEFORE INSERT ON Pesanan
FOR EACH ROW EXECUTE FUNCTION fn_cek_jam_toko();

SELECT id_toko, nama, waktu_buka, waktu_tutup
FROM Toko;

INSERT INTO Pesanan (id_pesanan, total_bayar, catatan, waktu_pesan, status_pesanan, metode_pembayaran, status_pembayaran, id_pelanggan, id_toko)
VALUES (203, 20000, 'Tes Toko Tutup', CURRENT_TIMESTAMP, 'Diproses', 'Cash', 'Lunas', 'CUST-001', 3);

INSERT INTO Pesanan (id_pesanan, total_bayar, catatan, waktu_pesan, status_pesanan, metode_pembayaran, status_pembayaran, id_pelanggan, id_toko)
VALUES (201, 20000, 'Tes Toko Tutup', CURRENT_TIMESTAMP, 'Diproses', 'Cash', 'Lunas', 'CUST-001', 2);

-- mencegah menghapus departemen kalau masih ada pelanggan
CREATE OR REPLACE FUNCTION fn_cegah_hapus_dept() RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM Pelanggan WHERE id_departemen = OLD.id_departemen) THEN
        RAISE EXCEPTION 'tidak bisa menghapus departemen yang masih memiliki pelanggan';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_cegah_hapus_dept
BEFORE DELETE ON Departemen
FOR EACH ROW EXECUTE FUNCTION fn_cegah_hapus_dept();

DELETE FROM Departemen WHERE id_departemen = 'DEP-024';

INSERT INTO Departemen (id_departemen, nama_departemen) 
VALUES ('DEP-999', 'departemen cobaan');

DELETE FROM Departemen WHERE id_departemen = 'DEP-999';

-- FUNCTION atau PROCEDURE
-- ambil nama kantin dari toko
CREATE OR REPLACE FUNCTION fn_get_nama_kantin(p_id_toko INT) RETURNS VARCHAR AS $$
DECLARE
    variabel_nama VARCHAR;
BEGIN
    SELECT k.nama_kantin INTO variabel_nama
    FROM Kantin k
    JOIN Toko t ON k.id_kantin = t.id_kantin
    WHERE t.id_toko = p_id_toko;
    RETURN variabel_nama;
END;
$$ LANGUAGE plpgsql;

SELECT fn_get_nama_kantin(1) AS nama_kantin_toko_tersebut;

SELECT id_toko, nama, fn_get_nama_kantin(id_toko) AS nama_kantin
FROM Toko;

-- menghapus pesanan lama
CREATE OR REPLACE PROCEDURE hapus_pesanan_lama() AS $$
BEGIN
    DELETE FROM Pesanan WHERE waktu_pesan < CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- contoh pesanan baru
INSERT INTO Pesanan (id_pesanan, total_bayar, catatan, waktu_pesan, status_pesanan, metode_pembayaran, status_pembayaran, id_pelanggan, id_toko)
VALUES (301, 50000,'', CURRENT_DATE - INTERVAL '2 days', 'Selesai', 'Tunai', 'Lunas', 'CUST-001', 1);

-- contoh pesanan lama
INSERT INTO Pesanan (id_pesanan, total_bayar, catatan, waktu_pesan, status_pesanan, metode_pembayaran, status_pembayaran, id_pelanggan, id_toko)
VALUES (302, 75000,'', CURRENT_DATE - INTERVAL '40 days', 'Selesai', 'Tunai', 'Lunas', 'CUST-002', 1);

SELECT id_pesanan, waktu_pesan 
FROM Pesanan 
WHERE id_pesanan IN (301, 302);

CALL hapus_pesanan_lama();
