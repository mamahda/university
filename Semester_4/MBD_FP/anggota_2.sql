-- ==========================================
-- ANGGOTA 2 (Gilbran mahdavikia Raja)
-- ==========================================

-- Searching: Cari toko di lokasi kantin tertentu
SELECT t.nama, t.waktu_buka, k.lokasi
FROM Toko t
JOIN Kantin k ON t.id_kantin = k.id_kantin
WHERE k.lokasi = 'Departemen Teknik Informatika';

-- Searching: Detail menu dalam satu pesanan
SELECT m.nama_menu, pm.quantity, pm.sub_total
FROM Pesanan_Menu pm
JOIN Menu m ON pm.id_menu = m.id_menu
WHERE pm.id_pesanan = 1;

-- View: Rekap Pendapatan per Toko
CREATE OR REPLACE VIEW v_rekap_pendapatan_toko AS
SELECT t.nama, SUM(p.total_bayar) AS pendapatan_total
FROM Pesanan p
JOIN Toko t ON p.id_toko = t.id_toko
WHERE p.status_pembayaran = 'Lunas'
GROUP BY t.id_toko, t.nama;

select * FROM v_rekap_pendapatan_toko;

-- View: Pelanggan Aktif (> 5 pesanan)
CREATE OR REPLACE VIEW v_pelanggan_aktif AS
SELECT pl.nama, COUNT(p.id_pesanan) AS jumlah_pesanan
FROM Pelanggan pl
JOIN Pesanan p ON pl.id_pelanggan = p.id_pelanggan
GROUP BY pl.id_pelanggan, pl.nama
HAVING COUNT(p.id_pesanan) > 5;

select * FROM v_pelanggan_aktif;

-- Trigger: Auto Update Total Bayar di tabel Pesanan
CREATE OR REPLACE FUNCTION fn_tr_update_total_bayar() RETURNS TRIGGER AS $$
BEGIN
    UPDATE Pesanan 
    SET total_bayar = (
        SELECT COALESCE(SUM(sub_total), 0)
        FROM Pesanan_Menu
        WHERE id_pesanan = NEW.id_pesanan
    )
    WHERE id_pesanan = NEW.id_pesanan;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_update_total_bayar
AFTER INSERT OR UPDATE ON Pesanan_Menu
FOR EACH ROW EXECUTE FUNCTION fn_tr_update_total_bayar();

INSERT INTO Pesanan (id_pesanan, total_bayar, catatan, waktu_pesan, status_pesanan, metode_pembayaran, status_pembayaran, id_pelanggan, id_toko) 
VALUES (201, 0.00, 'Pesanan Tes Trigger', CURRENT_TIMESTAMP, 'Diproses', 'Tunai', 'Belum Lunas', 'CUST-001', 1);
SELECT id_pesanan, total_bayar FROM Pesanan WHERE id_pesanan = 201;

INSERT INTO Pesanan_Menu (id_pesanan, id_menu, quantity, sub_total) 
VALUES (201, 'M-001', 2, 12000.00);

INSERT INTO Pesanan_Menu (id_pesanan, id_menu, quantity, sub_total) 
VALUES (201, 'M-002', 1, 10000.00);

-- drop row pesanan menu
DELETE FROM Pesanan_Menu WHERE id_pesanan = 201 AND id_menu = 'M-001';

DELETE FROM Pesanan_Menu WHERE id_pesanan = 201 AND id_menu = 'M-002';

SELECT id_pesanan, total_bayar FROM Pesanan WHERE id_pesanan = 201;

-- Trigger: Cegah Harga Negatif
CREATE OR REPLACE FUNCTION fn_tr_validasi_harga() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.harga < 0 THEN
        RAISE EXCEPTION 'Harga tidak boleh negatif';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_validasi_harga
BEFORE INSERT OR UPDATE ON Menu
FOR EACH ROW EXECUTE FUNCTION fn_tr_validasi_harga();

SELECT * FROM Menu WHERE id_menu = 'M-001';
UPDATE Menu SET harga = -5000 WHERE id_menu = 'M-001';

-- Function: Cek Stok Tersedia
CREATE OR REPLACE FUNCTION fn_cek_stok_tersedia(p_id_menu VARCHAR(5), p_qty INT) RETURNS BOOLEAN AS $$
DECLARE
    v_stok INT;
BEGIN
    SELECT stok INTO v_stok FROM Menu WHERE id_menu = p_id_menu;
    RETURN COALESCE(v_stok, 0) >= p_qty;
END;
$$ LANGUAGE plpgsql;

select fn_cek_stok_tersedia('M-001', 3) AS stok_tersedia;

-- Procedure: Tambah Menu Baru
CREATE OR REPLACE PROCEDURE sp_tambah_menu_baru(
    p_id VARCHAR(5),
    p_nama VARCHAR(50),
    p_harga DECIMAL(9,2),
    p_stok INT,
    p_toko INT
) AS $$
BEGIN
    INSERT INTO Menu (id_menu, nama_menu, harga, stok, id_toko)
    VALUES (p_id, p_nama, p_harga, p_stok, p_toko);
END;
$$ LANGUAGE plpgsql;

select * from menu where id_toko = 1;

call sp_tambah_menu_baru('M-501', 'Kwetiaw', 15000.00, 20, 1);
select * FROM Menu WHERE id_menu = 'M-501';