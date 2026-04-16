-- DataPasien
INSERT INTO
    DataPasien
VALUES (
        'PS00006',
        '3507254111940001',
        'Lidra Trifidya'
    ),
    (
        'PS00007',
        '3606125204940003',
        'Yutika Amelia Effendi'
    );

-- Poli
INSERT INTO
    Poli
VALUES ('P01', 'Bedah Umum'),
    ('P02', 'Mulut'),
    ('P03', 'THT');

-- Dokter
INSERT INTO
    Dokter
VALUES (
        'D009',
        'P01',
        'Dr. Budikusnaedi'
    ),
    (
        'D010',
        'P02',
        'Dr. Hariyanto Kusuma'
    ),
    (
        'D011',
        'P02',
        'Dr. Sri Herianti'
    ),
    (
        'D012',
        'P03',
        'Dr. Elvin Purwantari'
    );

-- Pemeriksaan
INSERT INTO
    Pemeriksaan
VALUES (
        'C001',
        'D009',
        'PS00006',
        '2015-01-01',
        'Radang Usus Buntu'
    ),
    (
        'C002',
        'D010',
        'PS00007',
        '2015-01-02',
        'Gigi Berlubang'
    ),
    (
        'C003',
        'D011',
        'PS00007',
        '2015-02-10',
        'Flu'
    ),
    (
        'C004',
        'D009',
        'PS00007',
        '2015-05-02',
        'Radang Usus Buntu'
    );

CREATE TABLE R (A INT, B INT);

CREATE TABLE S (B INT, C INT);

CREATE TABLE R2 (B INT, C INT);