DROP DATABASE IF EXISTS horizon_air;

CREATE DATABASE horizon_air;

USE horizon_air;

-- 1
CREATE TABLE maskapai (
    ID CHAR(6) NOT NULL,
    Nama VARCHAR(255) NOT NULL,
    Negara_asal VARCHAR(255) NOT NULL,
    PRIMARY KEY (ID)
);

CREATE TABLE pesawat (
    ID CHAR(6) NOT NULL,
    Model VARCHAR(255) NOT NULL,
    Kapasitas INT NOT NULL,
    Tahun_produksi CHAR(4) NOT NULL,
    Status_pesawat VARCHAR(50) NOT NULL,
    Maskapai_ID CHAR(6) NOT NULL,
    PRIMARY KEY (ID),
    FOREIGN KEY (Maskapai_ID) REFERENCES maskapai (ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE bandara (
    ID INT NOT NULL,
    Nama VARCHAR(256) NOT NULL,
    Kota VARCHAR(256) NOT NULL,
    Negara VARCHAR(256) NOT NULL,
    Kode_IATA VARCHAR(3) NOT NULL,
    PRIMARY KEY (ID)
);

CREATE TABLE penerbangan (
    ID CHAR(6) NOT NULL,
    Waktu_keberangkatan DATETIME NOT NULL,
    Waktu_sampai DATETIME NOT NULL,
    Status_penerbangan VARCHAR(50) NOT NULL,
    Pesawat_ID CHAR(6) NOT NULL,
    PRIMARY KEY (ID),
    FOREIGN KEY (Pesawat_ID) REFERENCES pesawat (ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE bandara_penerbangan (
    Bandara_ID INT NOT NULL,
    Penerbangan_ID CHAR(6) NOT NULL,
    PRIMARY KEY (Bandara_ID, Penerbangan_ID),
    FOREIGN KEY (Bandara_ID) REFERENCES bandara (ID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Penerbangan_ID) REFERENCES penerbangan (ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE bagasi (
    ID INT NOT NULL,
    Berat INT NOT NULL,
    Ukuran VARCHAR(5) NOT NULL,
    Warna VARCHAR(255) NOT NULL,
    Jenis VARCHAR(255) NOT NULL,
    PRIMARY KEY (ID)
);

CREATE TABLE penumpang (
    NIK CHAR(16) NOT NULL,
    Nama VARCHAR(255) NOT NULL,
    Tanggal_lahir DATE NOT NULL,
    Alamat VARCHAR(255) NOT NULL,
    No_telepon VARCHAR(13) NOT NULL,
    Jenis_kelamin VARCHAR(1) NOT NULL,
    Kewarganegaraan VARCHAR(255) NOT NULL,
    Bagasi_ID INT NOT NULL,
    PRIMARY KEY (NIK),
    FOREIGN KEY (Bagasi_ID) REFERENCES bagasi (ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE tiket (
    ID CHAR(6) NOT NULL,
    Nomor_kursi CHAR(3) NOT NULL,
    Harga INT NOT NULL,
    Waktu_pembelian DATETIME NOT NULL,
    Kelas_penerbangan VARCHAR(50) NOT NULL,
    Penumpang_NIK CHAR(16) NOT NULL,
    Penerbangan_ID CHAR(6) NOT NULL,
    PRIMARY KEY (ID),
    FOREIGN KEY (Penumpang_NIK) REFERENCES penumpang (NIK) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Penerbangan_ID) REFERENCES penerbangan (ID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 2
INSERT INTO
    bandara (
        ID,
        Nama,
        Kota,
        Negara,
        Kode_IATA
    )
VALUES (
        1,
        'Soekarno-Hatta',
        'Jakarta',
        'Indonesia',
        'CGK'
    ),
    (
        2,
        'Ngurah Rai',
        'Denpasar',
        'Indonesia',
        'DPS'
    ),
    (
        3,
        'Changi',
        'Singapore',
        'Singapore',
        'SIN'
    ),
    (
        4,
        'Haneda',
        'Tokyo',
        'Japan',
        'HND'
    );

INSERT INTO
    bagasi (
        ID,
        Berat,
        Ukuran,
        Warna,
        Jenis
    )
VALUES (1, 20, 'M', 'Hitam', 'Koper'),
    (2, 15, 'S', 'Merah', 'Ransel'),
    (3, 25, 'L', 'Biru', 'Koper'),
    (4, 10, 'S', 'Hijau', 'Ransel');

INSERT INTO
    maskapai (ID, Nama, Negara_asal)
VALUES (
        'GA123',
        'Garuda Indonesia',
        'Indonesia'
    ),
    (
        'SQ456',
        'Singapore Airlines',
        'Singapore'
    ),
    (
        'JL789',
        'Japan Airlines',
        'Japan'
    ),
    (
        'QZ987',
        'Air Asia',
        'Malaysia'
    );

INSERT INTO
    penumpang (
        NIK,
        Nama,
        Tanggal_lahir,
        Alamat,
        No_telepon,
        Jenis_kelamin,
        Kewarganegaraan,
        Bagasi_ID
    )
VALUES (
        '3201123456789012',
        'Budi Santoso',
        '1990-04-15',
        'Jl. Merdeka No. 1',
        '081234567890',
        'L',
        'Indonesia',
        1
    ),
    (
        '3301234567890123',
        'Siti Aminah',
        '1985-08-20',
        'Jl. Kebangsaan No. 2',
        '081298765432',
        'P',
        'Indonesia',
        2
    ),
    (
        '340314567890123',
        'John Tanaka',
        '1992-12-05',
        'Shibuya Tokyo',
        '080123456789',
        'L',
        'Japan',
        3
    ),
    (
        '3504156789012345',
        'Li Wei',
        '1995-03-01',
        'Orchard Rd, Singapore',
        '065812345678',
        'L',
        'Singapore',
        4
    );

INSERT INTO
    pesawat (
        ID,
        Model,
        Kapasitas,
        Tahun_produksi,
        Status_pesawat,
        Maskapai_ID
    )
VALUES (
        'PKABC1',
        'Boeing 737',
        180,
        '2018',
        'Aktif',
        'GA123'
    ),
    (
        'PKDEF2',
        'Airbus A320',
        150,
        '2020',
        'Aktif',
        'SQ456'
    ),
    (
        'PKGHI3',
        'Boeing',
        250,
        '2019',
        'Dalam perawatan',
        'JL789'
    ),
    (
        'PKJKL4',
        'Airbus A330',
        280,
        '2021',
        'Aktif',
        'QZ987'
    );

INSERT INTO
    penerbangan (
        ID,
        Waktu_keberangkatan,
        Waktu_sampai,
        Status_penerbangan,
        Pesawat_ID
    )
VALUES (
        'FL0001',
        '2024-12-15 10:00:00',
        '2024-12-15 12:30:00',
        'Jadwal',
        'PKABC1'
    ),
    (
        'FL0002',
        '2024-12-16 08:00:00',
        '2024-12-16 10:45:00',
        'Jadwal',
        'PKDEF2'
    ),
    (
        'FL0003',
        '2024-12-17 14:00:00',
        '2024-12-17 16:30:00',
        'Ditunda',
        'PKGHI3'
    ),
    (
        'FL0004',
        '2024-12-18 18:00:00',
        '2024-12-18 20:30:00',
        'Jadwal',
        'PKJKL4'
    );

INSERT INTO
    bandara_penerbangan (Bandara_ID, Penerbangan_ID)
VALUES (1, 'FL0001'),
    (2, 'FL0002'),
    (3, 'FL0003'),
    (4, 'FL0004');

INSERT INTO
    tiket (
        ID,
        Nomor_kursi,
        Harga,
        Waktu_pembelian,
        Kelas_penerbangan,
        Penumpang_NIK,
        Penerbangan_ID
    )
VALUES (
        'TK0001',
        '12A',
        1200000,
        '2024-11-01 08:00:00',
        'Ekonomi',
        '3201123456789012',
        'FL0001'
    ),
    (
        'TK0002',
        '14B',
        1500000,
        '2024-11-02 09:30:00',
        'Bisnis',
        '3301234567890123',
        'FL0002'
    ),
    (
        'TK0003',
        '16C',
        2000000,
        '2024-11-03 10:15:00',
        'Ekonomi',
        '340314567890123',
        'FL0003'
    ),
    (
        'TK0004',
        '18D',
        1000000,
        '2024-11-04 11:45:00',
        'Ekonomi',
        '3504156789012345',
        'FL0004'
    );

-- 3
ALTER TABLE penumpang ADD Email VARCHAR(255) NOT NULL;

-- 4
ALTER TABLE bagasi MODIFY jenis VARCHAR(50) NOT NULL;

-- 5
ALTER TABLE bandara
DROP PRIMARY KEY,
ADD PRIMARY KEY (ID, Kode_IATA);

-- 6
ALTER TABLE penumpang DROP COLUMN Email;

-- 7
UPDATE penerbangan
SET
    `Waktu_keberangkatan` = '2024-12-15 11:00:00',
    `Waktu_sampai` = '2024-12-15 13:30:00'
WHERE
    ID = 'FL0001';

-- 8
UPDATE penumpang
SET
    `No_telepon` = '081223344556'
WHERE
    NIK = '3301234567890123';

-- 9
UPDATE pesawat SET `Status_pesawat` = 'Aktif' WHERE ID = 'PKGHI3';

-- 10
DELETE FROM tiket WHERE `Penumpang_NIK` = '3504156789012345';

-- 11
DELETE FROM bagasi WHERE `ID` = 2;

-- 12
DELETE FROM penerbangan WHERE `Status_penerbangan` = 'Ditunda';