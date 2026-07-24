-- Lihat total belanja pelanggan 'CUST-001' di semua toko
SELECT pl.nama, SUM(p.total_bayar) AS total_pengeluaran
FROM Pelanggan pl
JOIN Pesanan p ON pl.id_pelanggan = p.id_pelanggan
WHERE pl.id_pelanggan = 'CUST-001'
GROUP BY pl.nama;


-- Lihat asal departemen pelanggan yang pernah transaksi di Kantin PWK
SELECT DISTINCT d.nama_departemen
FROM Departemen d
JOIN Pelanggan pl ON d.id_departemen = pl.id_departemen
JOIN Pesanan p ON pl.id_pelanggan = p.id_pelanggan
JOIN Toko t ON p.id_toko = t.id_toko
JOIN Kantin k ON t.id_kantin = k.id_kantin
WHERE k.nama_kantin = 'Kantin PWK';


-- Buat view untuk 10 toko dengan banyak transaksi terbanyak
CREATE OR REPLACE VIEW toko_terlaris AS
SELECT nama, jumlah_transaksi
FROM (
    SELECT t.nama, COUNT(p.id_pesanan) AS jumlah_transaksi
    FROM Toko t
    JOIN Pesanan p ON t.id_toko = p.id_toko
    GROUP BY t.id_toko, t.nama
    ORDER BY jumlah_transaksi DESC
	LIMIT 10
);
SELECT * FROM toko_terlaris;

-- Buat view rata" transaksi setiap pelanggan
CREATE OR REPLACE VIEW ratarata_transaksi AS
SELECT 
	pl.nama,
	ROUND(AVG(total_bayar),2) AS rata_rata_transaksi 
FROM Pelanggan pl
JOIN Pesanan p ON pl.id_pelanggan = p.id_pelanggan
GROUP BY pl.nama
ORDER BY rata_rata_transaksi DESC;
SELECT * FROM ratarata_transaksi;

-- Trigger isi kolom catatan jika null dengan default
CREATE OR REPLACE FUNCTION fn_catatan_default() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.catatan IS NULL OR NEW.catatan = '' THEN
       NEW.catatan := 'Tanpa alat makan';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_catatan_default
BEFORE INSERT ON Pesanan
FOR EACH ROW EXECUTE FUNCTION fn_catatan_default();

INSERT INTO Pesanan (id_pesanan, total_bayar, catatan, status_pesanan, metode_pembayaran, status_pembayaran, id_pelanggan, id_toko) VALUES
(101, 15000.00, 'Sambalnya minta banyakin', 'Diproses', 'Tunai', 'Belum Lunas', 'CUST-010', 4),
(102, 20000.00, '', 'Selesai', 'QRIS', 'Lunas', 'CUST-012', 7),
(103, 12000.00, NULL, 'Diproses', 'Transfer', 'Lunas', 'CUST-013', 5);

SELECT id_pesanan, catatan, status_pesanan FROM Pesanan
ORDER BY id_pesanan DESC;


-- Trigger Cegah Update Stok Negatif
CREATE OR REPLACE FUNCTION fn_cegah_stok_negatif() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stok < 0 THEN
        RAISE EXCEPTION 'Stok tidak boleh kurang dari nol';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_cegah_stok_negatif
BEFORE UPDATE OF stok ON Menu
FOR EACH ROW EXECUTE FUNCTION fn_cegah_stok_negatif();

UPDATE Menu 
SET stok = 10 
WHERE id_menu = 'M-001';
-- Cek hasilnya: Stok harusnya 10
SELECT id_menu, nama_menu, stok FROM Menu WHERE id_menu = 'M-001';

-- Skenario ketika stok > 0
UPDATE Menu 
SET stok = stok - 4 
WHERE id_menu = 'M-001';
SELECT id_menu, nama_menu, stok FROM Menu WHERE id_menu = 'M-001';

-- Skenario ketika stok < 0
UPDATE Menu 
SET stok = stok - 7 
WHERE id_menu = 'M-001';

-- Function untuk melihat omset total hari ini
CREATE OR REPLACE FUNCTION fn_total_omzet_hari_ini() RETURNS NUMERIC AS $$
DECLARE
    v_total NUMERIC;
BEGIN
    SELECT SUM(total_bayar) INTO v_total
    FROM Pesanan
    WHERE waktu_pesan::DATE = CURRENT_DATE;
    RETURN COALESCE(v_total, 0);
END;
$$ LANGUAGE plpgsql;

SELECT fn_total_omzet_hari_ini() AS omzet_hari_ini;

-- Procedure menutup seluruh toko di sebuah kantin
CREATE OR REPLACE PROCEDURE sp_tutup_kantin(p_id_kantin INT) AS $$
BEGIN
    UPDATE Toko SET is_open = FALSE WHERE id_kantin = p_id_kantin;
END;
$$ LANGUAGE plpgsql;

-- Cek sebelum ditutup
SELECT id_toko, nama, is_open FROM Toko WHERE id_kantin = 20;

-- Memanggil procedure
CALL sp_tutup_kantin(20);
SELECT id_toko, nama, is_open FROM Toko WHERE id_kantin = 20;
