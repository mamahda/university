-- ==========================================
-- ANGGOTA 5
-- ==========================================

-- Searching: Pesanan Tunai di Toko Tertentu
SELECT id_pesanan, total_bayar, waktu_pesan
FROM Pesanan
WHERE metode_pembayaran = 'Tunai' AND id_toko = 3;

-- Searching: Pelanggan yang membeli menu 'Nasi Goreng'
SELECT DISTINCT pl.nama, pl.email
FROM Pelanggan pl
JOIN Pesanan p ON pl.id_pelanggan = p.id_pelanggan
JOIN Pesanan_Menu pm ON p.id_pesanan = pm.id_pesanan
JOIN Menu m ON pm.id_menu = m.id_menu
WHERE m.nama_menu ILIKE '%Nasi Goreng%';

-- View: Daftar Menu Habis
CREATE OR REPLACE VIEW v_menu_habis AS
SELECT m.nama_menu, t.nama AS toko
FROM Menu m
JOIN Toko t ON m.id_toko = t.id_toko
WHERE m.stok = 0;

-- View: Riwayat Pembayaran QRIS
CREATE OR REPLACE VIEW v_riwayat_qris AS
SELECT p.id_pesanan, pl.nama, p.total_bayar, p.waktu_pesan
FROM Pesanan p
JOIN Pelanggan pl ON p.id_pelanggan = pl.id_pelanggan
WHERE p.metode_pembayaran = 'QRIS';

-- Trigger: Update Waktu Saat Selesai
CREATE OR REPLACE FUNCTION fn_tr_waktu_selesai() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status_pesanan = 'Selesai' AND OLD.status_pesanan <> 'Selesai' THEN
        RAISE NOTICE 'Pesanan % telah selesai pada %', NEW.id_pesanan, CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_waktu_selesai
AFTER UPDATE ON Pesanan
FOR EACH ROW EXECUTE FUNCTION fn_tr_waktu_selesai();

-- Trigger: Notifikasi Stok Menipis
CREATE OR REPLACE FUNCTION fn_tr_notif_stok() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stok < 5 THEN
        RAISE NOTICE 'Peringatan: Stok menu % sisa %', NEW.nama_menu, NEW.stok;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_notif_stok
AFTER UPDATE OF stok ON Menu
FOR EACH ROW EXECUTE FUNCTION fn_tr_notif_stok();

-- Function: Cek Berapa Jam Toko Buka
-- Contoh pemanggilan: SELECT fn_durasi_buka(1);
CREATE OR REPLACE FUNCTION fn_durasi_buka(p_id_toko INT) RETURNS INTERVAL AS $$
DECLARE
    v_buka  TIME;
    v_tutup TIME;
BEGIN
    SELECT waktu_buka, waktu_tutup
    INTO v_buka, v_tutup
    FROM Toko
    WHERE id_toko = p_id_toko;
    RETURN v_tutup - v_buka;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Ganti No HP Pelanggan
-- Contoh pemanggilan: CALL sp_update_nohp('CUST-001', '08123456789');
CREATE OR REPLACE PROCEDURE sp_update_nohp(p_id VARCHAR, p_baru VARCHAR) AS $$
BEGIN
    UPDATE Pelanggan SET no_hp = p_baru WHERE id_pelanggan = p_id;
END;
$$ LANGUAGE plpgsql;
