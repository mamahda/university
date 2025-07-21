-- Active: 1728814371862@@127.0.0.1@3306@DML
DROP DATABASE IF EXISTS DML;

CREATE DATABASE DML;

USE DML;

CREATE TABLE JENIS_LAYANAN (
    JL_ID VARCHAR(5) NOT NULL,
    JL_NAMA VARCHAR(100) NOT NULL,
    JL_HARGA DECIMAL(6, 2) NOT NULL,
    PRIMARY KEY (JL_ID)
);

CREATE TABLE KARYAWAN (
    K_ID CHARACTER(2) NOT NULL,
    K_NAMA VARCHAR(100) NOT NULL,
    K_BAGIAN VARCHAR(25),
    K_TGLMASUK DATE,
    K_EMAIL VARCHAR(100) NOT NULL,
    K_PASSWORD VARCHAR(100) NOT NULL,
    K_MANAGER_ID CHARACTER(2),
    PRIMARY KEY (K_ID),
    FOREIGN KEY (K_MANAGER_ID) REFERENCES KARYAWAN (K_ID)
);

CREATE TABLE PELANGGAN (
    P_NO CHAR(5) NOT NULL,
    P_NAMA VARCHAR(60) NOT NULL,
    P_JENISKEL CHAR(1),
    P_TEMPATLAHIR VARCHAR(30),
    P_TGLLAHIR DATE,
    P_ALAMAT VARCHAR(200),
    P_NOTELP VARCHAR(15),
    P_TGLDAFTAR DATE NOT NULL,
    PRIMARY KEY (P_NO)
);

CREATE TABLE NOTA (
    N_NO INTEGER NOT NULL,
    N_TGLMASUK DATE NOT NULL,
    N_TGLPERKIRAANSELESAI DATE NOT NULL,
    N_TGLSELESAI DATE,
    N_TGLAMBIL TIMESTAMP,
    N_STATUS VARCHAR(10) NOT NULL,
    N_KODERAK VARCHAR(3),
    P_NO CHAR(5) NOT NULL,
    PRIMARY KEY (N_NO),
    FOREIGN KEY (P_NO) REFERENCES PELANGGAN (P_NO)
);

CREATE TABLE NOTA_JENIS_LAYANAN (
    N_NO INTEGER NOT NULL,
    JL_ID VARCHAR(5) NOT NULL,
    PRIMARY KEY (N_NO, JL_ID),
    FOREIGN KEY (N_NO) REFERENCES NOTA (N_NO),
    FOREIGN KEY (JL_ID) REFERENCES JENIS_LAYANAN (JL_ID)
);

CREATE TABLE NOTA_KARYAWAN (
    N_NO INTEGER NOT NULL,
    K_ID CHAR(2) NOT NULL,
    PRIMARY KEY (N_NO, K_ID),
    FOREIGN KEY (N_NO) REFERENCES NOTA (N_NO),
    FOREIGN KEY (K_ID) REFERENCES KARYAWAN (K_ID)
);

CREATE TABLE PAYMENT (
    B_NO INTEGER NOT NULL,
    B_TOTALHARGA DECIMAL(10, 3) NOT NULL,
    B_TGLBAYAR DATE NOT NULL,
    N_NO INTEGER NOT NULL,
    PRIMARY KEY (B_NO, N_NO),
    FOREIGN KEY (N_NO) REFERENCES NOTA (N_NO)
);

-- 1.1
ALTER TABLE NOTA MODIFY COLUMN N_TGLAMBIL DATE
-- 1.2
ALTER TABLE NOTA DROP COLUMN N_KODERAK
-- 1.3
ALTER TABLE PAYMENT ADD COLUMN B_METHOD VARCHAR(50)
-- 2
INSERT INTO
    JENIS_LAYANAN (JL_ID, JL_NAMA, JL_HARGA)
VALUES (
        'JL001',
        'Dry Cleaning',
        5000.00
    ),
    ('JL002', 'Washing', 3000.00),
    ('JL003', 'Ironing', 2000.00),
    ('JL004', 'Folding', 1000.00),
    (
        'JL005',
        'Express Service',
        8000.00
    );

INSERT INTO
    KARYAWAN (
        K_ID,
        K_NAMA,
        K_BAGIAN,
        K_TGLMASUK,
        K_EMAIL,
        K_PASSWORD,
        K_MANAGER_ID
    )
VALUES (
        'K1',
        'Siti Nurhaliza',
        'Manager',
        '2021-03-15',
        'siti.nurhaliza@gmail.com',
        'admin#123',
        NULL
    ),
    (
        'K2',
        'Andi Rianto',
        'Laundry',
        '2020-01-10',
        'andi.rianto@gmail.com',
        'admin#123',
        'K1'
    ),
    (
        'K3',
        'Dian Saputra',
        'Customer Service',
        '2019-07-22',
        'dian.saputra@gmail.com',
        'admin#123',
        'K1'
    ),
    (
        'K4',
        'Farras Nizar',
        'Delivery',
        '2018-05-19',
        'farras.nizar@gmail.com',
        'admin#123',
        'K1'
    ),
    (
        'K5',
        'Fitri Haryanti',
        'Ironing',
        '2017-10-11',
        'fitri.haryanti@gmail.com',
        'admin#123',
        'K1'
    );

INSERT INTO
    PELANGGAN (
        P_NO,
        P_NAMA,
        P_JENISKEL,
        P_TEMPATLAHIR,
        P_TGLLAHIR,
        P_ALAMAT,
        P_NOTELP,
        P_TGLDAFTAR
    )
VALUES (
        'P001',
        'Delilah',
        'F',
        'Jakarta',
        '2014-05-12',
        'Jl. Sudirman No.123, Jakarta',
        '081234567890',
        '2014-05-13'
    ),
    (
        'P002',
        'Dewi Lestari',
        'F',
        'Bandung',
        '2005-11-23',
        'Jl. Setiabudi No.456, Bandung',
        '081298765432',
        '2021-12-10'
    ),
    (
        'P003',
        'Bara Semangat',
        'M',
        'Surabaya',
        '1990-04-05',
        'Jl. Diponegoro No.789, Surabaya',
        '081311223344',
        '2023-01-05'
    ),
    (
        'P004',
        'Siti Aisyah',
        'F',
        'Medan',
        '1995-06-17',
        'Jl. Gatot Subroto No.321, Medan',
        '081322334455',
        '2023-03-22'
    ),
    (
        'P005',
        'Irfan Sandy',
        'M',
        'Malang',
        '1983-09-30',
        'Jl. Veteran, Malang',
        '081333445566',
        '2022-09-12'
    );

INSERT INTO
    NOTA (
        N_NO,
        N_TGLMASUK,
        N_TGLPERKIRAANSELESAI,
        N_TGLSELESAI,
        N_TGLAMBIL,
        N_STATUS,
        P_NO
    )
VALUES (
        1001,
        '2024-09-10',
        '2024-09-15',
        '2024-09-14',
        '2024-09-16',
        'Completed',
        'P001'
    ),
    (
        1002,
        '2024-09-11',
        '2024-09-16',
        '2024-09-15',
        '2024-09-17',
        'Completed',
        'P002'
    ),
    (
        1003,
        '2024-09-12',
        '2024-09-17',
        NULL,
        NULL,
        'Pending',
        'P003'
    ),
    (
        1004,
        '2024-09-13',
        '2024-09-18',
        '2024-09-17',
        '2024-09-18',
        'Completed',
        'P004'
    ),
    (
        1005,
        '2024-09-14',
        '2024-09-19',
        NULL,
        NULL,
        'Pending',
        'P005'
    );

INSERT INTO
    NOTA_JENIS_LAYANAN (N_NO, JL_ID)
VALUES (1001, 'JL001'),
    (1002, 'JL002'),
    (1003, 'JL003'),
    (1004, 'JL004'),
    (1005, 'JL005');

INSERT INTO
    NOTA_KARYAWAN (N_NO, K_ID)
VALUES (1001, 'K1'),
    (1002, 'K2'),
    (1003, 'K3'),
    (1004, 'K4'),
    (1005, 'K5');

INSERT INTO
    PAYMENT (
        B_NO,
        B_TOTALHARGA,
        B_TGLBAYAR,
        N_NO,
        B_METHOD
    )
VALUES (
        2001,
        5000.00,
        '2024-09-16',
        1001,
        'Credit Card'
    ),
    (
        2002,
        3000.00,
        '2024-09-17',
        1002,
        'Cash'
    ),
    (
        2003,
        2000.00,
        '2024-09-18',
        1003,
        'Debit Card'
    ),
    (
        2004,
        1000.00,
        '2024-09-19',
        1004,
        'Cash'
    ),
    (
        2005,
        8000.00,
        '2023-10-15',
        1005,
        'QRIS'
    );

-- 3.1
UPDATE PAYMENT
SET
    `B_TOTALHARGA` = `B_TOTALHARGA` * 0.90
WHERE
    `B_TGLBAYAR` = '2023-10-15';

-- 3.2
UPDATE PELANGGAN
SET
    `P_NOTELP` = '0811839034'
WHERE
    `P_NAMA` = 'Delilah';

-- 3.3
DELETE FROM NOTA_KARYAWAN
WHERE
    K_ID = (
        SELECT `K_ID`
        FROM KARYAWAN
        WHERE
            `K_NAMA` = 'Andi Rianto'
    )

DELETE FROM KARYAWAN WHERE `K_NAMA` = 'Andi Rianto';