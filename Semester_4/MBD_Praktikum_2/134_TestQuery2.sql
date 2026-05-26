-- nomor 1
CREATE VIEW INFO_STOK_BUKU AS
SELECT p.nama_penulis, b.judul_buku, b.tahun_terbit, b.stok
FROM BUKU b
    JOIN PENULIS p ON b.penulis_id = p.penulis_id
WHERE
    b.stok > 20
ORDER BY p.nama_penulis ASC;

SELECT * FROM INFO_STOK_BUKU;

DROP VIEW INFO_STOK_BUKU;

-- nomor 2
CREATE VIEW REKAP_PENDAPATAN AS
SELECT
    EXTRACT(
        MONTH
        FROM p.tanggal_penjualan
    ) AS bulan_penjualan,
    EXTRACT(
        YEAR
        FROM p.tanggal_penjualan
    ) AS tahun_penjualan,
    SUM(dp.total_harga) AS total_pemasukan
FROM
    PENJUALAN p
    JOIN DETAIL_PENJUALAN dp ON p.no_nota = dp.no_nota
GROUP BY
    EXTRACT(
        YEAR
        FROM p.tanggal_penjualan
    ),
    EXTRACT(
        MONTH
        FROM p.tanggal_penjualan
    )
ORDER BY
    bulan_penjualan,
    tahun_penjualan

SELECT * FROM REKAP_PENDAPATAN;

DROP VIEW REKAP_PENDAPATAN;

-- nomor 3
CREATE TABLE LOG_BUKU (
    log_id SERIAL PRIMARY KEY,
    aktivitas VARCHAR(100),
    kode_buku VARCHAR(10),
    waktu_eksekusi TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION trg_log_buku()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO LOG_BUKU (kode_buku, aktivitas) VALUES (NEW.kode_buku, 'Menambah Data Buku');
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO LOG_BUKU (kode_buku, aktivitas) VALUES (NEW.kode_buku, 'Mengubah Data Buku');
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO LOG_BUKU (kode_buku, aktivitas) VALUES (OLD.kode_buku, 'Menghapus Data Buku');
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_buku
AFTER INSERT OR UPDATE OR DELETE ON BUKU
FOR EACH ROW
EXECUTE FUNCTION trg_log_buku();

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
        'BK-99',
        'P01',
        'Edensor',
        2007,
        70000.00,
        15
    );

UPDATE BUKU
SET
    judul_buku = 'Edensor Edisi Revisi'
WHERE
    kode_buku = 'BK-99';

DELETE FROM BUKU WHERE kode_buku = 'BK-99';

SELECT * FROM LOG_BUKU;

DROP TABLE log_buku;

-- nomor 4
CREATE OR REPLACE FUNCTION trg_update_stok()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE BUKU
    SET stok = stok - NEW.jumlah_beli
    WHERE kode_buku = NEW.kode_buku;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stok
AFTER INSERT ON DETAIL_PENJUALAN
FOR EACH ROW
EXECUTE FUNCTION trg_update_stok();

INSERT INTO
    PENJUALAN (
        no_nota,
        nama_pelanggan,
        tanggal_penjualan
    )
VALUES (
        'NOTA-005',
        'Eko Susanto',
        '2024-05-15'
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
        'DTL-010',
        'BK-01',
        'NOTA-005',
        3,
        255000
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
        'DTL-011',
        'BK-05',
        'NOTA-005',
        2,
        130000
    );

SELECT * FROM buku

-- nomor 5
CREATE OR REPLACE FUNCTION CARI_KARYA_PENULIS(penulis_nama VARCHAR)
RETURNS TABLE (cari_karya_penulis VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT b.judul_buku
    FROM BUKU b
    JOIN PENULIS p ON b.penulis_id = p.penulis_id
    WHERE p.nama_penulis = penulis_nama;
END;
$$ LANGUAGE plpgsql;

SELECT * FROM CARI_KARYA_PENULIS ('Andrea Hirata');

SELECT * FROM CARI_KARYA_PENULIS ('Raditya Dika');