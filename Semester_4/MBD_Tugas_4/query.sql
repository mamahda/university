SELECT IDPasien, TglPeriksa
FROM Pemeriksaan
WHERE
    Diagnosa IN ('Gigi Berlubang', 'Flu');

SELECT dp.NoKTP, dp.NamaPasien
FROM Pemeriksaan p
    JOIN DataPasien dp ON p.IDPasien = dp.IDPasien
WHERE
    EXTRACT(
        MONTH
        FROM p.TglPeriksa
    ) = 5;

SELECT dp.NamaPasien, d.Nama AS NamaDokter, pl.NamaPoli, p.TglPeriksa
FROM
    Pemeriksaan p
    JOIN Dokter d ON p.NID = d.NID
    JOIN Poli pl ON d.KodePoli = pl.KodePoli
    JOIN DataPasien dp ON p.IDPasien = dp.IDPasien
WHERE
    d.Nama = 'Dr. Budikusnaedi';

SELECT * FROM R WHERE A * B > 5;

SELECT DISTINCT C FROM R2;

SELECT * FROM R CROSS JOIN S;

SELECT R.A, R.B, R2.C FROM R JOIN R2 ON R.B < R2.C;

SELECT DISTINCT S.C FROM S JOIN R ON S.B = R.B JOIN R2 ON R.B = R2.B;