INSERT INTO
    singer
VALUES ('I01', 'RAISA'),
    ('I02', 'AFGAN'),
    ('I03', 'LYODRA'),
    ('I04', 'TULUS');

INSERT INTO
    album
VALUES (
        'A01',
        'I01',
        'THE BEST OF RAISA',
        2016,
        150000.00
    ),
    (
        'A02',
        'I04',
        'MONOKROM',
        2016,
        81000.00
    ),
    (
        'A03',
        'I02',
        'DEKADE',
        2018,
        65000.00
    ),
    (
        'A04',
        'I03',
        'LYODRA',
        2021,
        40000.00
    ),
    (
        'A05',
        'I01',
        'IT''S PERSONAL',
        2022,
        85000.00
    ),
    (
        'A06',
        'I04',
        'MANUSIA',
        2022,
        40000.00
    );

INSERT INTO
    receipt
VALUES (
        'RE001',
        'THRESSYE NATALIA',
        '2024-02-28'
    ),
    (
        'RE002',
        'ERPHAN PURNOMO',
        '2024-03-02'
    ),
    (
        'RE003',
        'NATHAN ANDREO',
        '2024-03-05'
    );

INSERT INTO
    detailitem
VALUES (
        'DE001',
        'A03',
        'RE001',
        5,
        325000.00
    ),
    (
        'DE002',
        'A04',
        'RE002',
        2,
        80000.00
    ),
    (
        'DE003',
        'A01',
        'RE002',
        2,
        300000.00
    ),
    (
        'DE004',
        'A05',
        'RE002',
        4,
        340000.00
    ),
    (
        'DE005',
        'A02',
        'RE003',
        1,
        81000.00
    ),
    (
        'DE006',
        'A06',
        'RE003',
        5,
        200000.00
    );