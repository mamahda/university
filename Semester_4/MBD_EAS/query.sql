-- add attribute total point di tabel pelanggan. kemudian, buat trigger add point 15% dari 2 digit terakhir id departemen apabila membayar dengan e-wallet. menggunakan hak akses penjual.

SELECT * FROM departemen;

SELECT * FROM pelanggan;

select * from pesanan;

select * from toko;

ALTER TABLE pelanggan DROP COLUMN total_point;

ALTER TABLE pelanggan ADD COLUMN total_point_mahda FLOAT;

CREATE OR REPLACE FUNCTION add_point_mahda() RETURNS TRIGGER AS $$
DECLARE
    v_id_departemen VARCHAR(10);
    v_point_tambahan FLOAT;
BEGIN
    IF NEW.metode_pembayaran = 'e-wallet' THEN
        
        SELECT id_departemen INTO v_id_departemen
        FROM pelanggan
        WHERE id_pelanggan = NEW.id_pelanggan;

        v_point_tambahan := (CAST(SUBSTRING(v_id_departemen FROM 5 FOR 2) AS INTEGER)) * 0.15;

        UPDATE pelanggan
        SET total_point_mahda = COALESCE(total_point_mahda, 0) + v_point_tambahan
        WHERE id_pelanggan = NEW.id_pelanggan;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_add_point_mahda
AFTER INSERT OR UPDATE ON pesanan
FOR EACH ROW 
EXECUTE FUNCTION add_point_mahda();

drop Trigger tr_tambah_poin_nasi on pesanan;

INSERT INTO Pesanan (id_pesanan, total_bayar, catatan, waktu_pesan, status_pesanan, metode_pembayaran, status_pembayaran, id_pelanggan, id_toko)
VALUES (
        '1011',
        50000,
        'eas',
        '2026-06-23 16:00:00',
        'dibayar',
        'qris',
        'Lunas',
        'CUST-003',
        '1'
    );