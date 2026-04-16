-- Active: 1774190586555@@127.0.0.1@5432@latihan
CREATE TABLE DataPasien (
    IDPasien VARCHAR(10) PRIMARY KEY,
    NoKTP VARCHAR(20),
    NamaPasien VARCHAR(50)
);

CREATE TABLE Poli (
    KodePoli VARCHAR(5) PRIMARY KEY,
    NamaPoli VARCHAR(50)
);

CREATE TABLE Dokter (
    NID VARCHAR(10) PRIMARY KEY,
    KodePoli VARCHAR(5),
    Nama VARCHAR(50),
    FOREIGN KEY (KodePoli) REFERENCES Poli (KodePoli)
);

CREATE TABLE Pemeriksaan (
    IDPeriksa VARCHAR(10) PRIMARY KEY,
    NID VARCHAR(10),
    IDPasien VARCHAR(10),
    TglPeriksa DATE,
    Diagnosa VARCHAR(100),
    FOREIGN KEY (NID) REFERENCES Dokter (NID),
    FOREIGN KEY (IDPasien) REFERENCES DataPasien (IDPasien)
);

-- R
INSERT INTO R VALUES (1, 2), (5, 6), (1, 2);

-- S
INSERT INTO S VALUES (3, 4), (7, 8);

-- R2
INSERT INTO R2 VALUES (5, 6), (7, 8), (9, 10);