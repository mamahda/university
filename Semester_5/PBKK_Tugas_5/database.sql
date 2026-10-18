-- =====================================================================
-- Mata Kuliah : .NET Programming with C#
-- Modul       : Hands-On Lab 1 & 2 - Database Student Registration
-- Database    : StudentRegistrationDB
-- Engine      : Microsoft SQL Server
-- =====================================================================

-- ---------------------------------------------------------------------
-- LAB 09 - 10: MEMBUAT & MENGGUNAKAN DATABASE
-- ---------------------------------------------------------------------
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'StudentRegistrationDB')
BEGIN
    CREATE DATABASE StudentRegistrationDB;
END
GO

USE StudentRegistrationDB;
GO

SELECT DB_NAME() AS CurrentDatabase;
GO

-- ---------------------------------------------------------------------
-- LAB 11: MEMBUAT TABEL Programs
-- ---------------------------------------------------------------------
IF OBJECT_ID(N'dbo.Students', N'U') IS NOT NULL DROP TABLE dbo.Students;
IF OBJECT_ID(N'dbo.Programs', N'U') IS NOT NULL DROP TABLE dbo.Programs;
GO

CREATE TABLE Programs 
( 
    ProgramId INT IDENTITY(1,1) 
        CONSTRAINT PK_Programs PRIMARY KEY, 
 
    ProgramCode VARCHAR(20) NOT NULL 
        CONSTRAINT UQ_Programs_ProgramCode UNIQUE, 
 
    ProgramName VARCHAR(100) NOT NULL, 
 
    IsActive BIT NOT NULL 
        CONSTRAINT DF_Programs_IsActive DEFAULT 1, 
 
    CreatedAt DATETIME2 NOT NULL 
        CONSTRAINT DF_Programs_CreatedAt 
        DEFAULT SYSDATETIME() 
); 
GO

-- ---------------------------------------------------------------------
-- LAB 12 - 13: MEMASUKKAN & MELIHAT DATA Programs
-- ---------------------------------------------------------------------
INSERT INTO Programs 
( 
    ProgramCode, 
    ProgramName 
) 
VALUES 
('TI',  'Teknik Informatika'), 
('SI',  'Sistem Informasi'), 
('MNJ', 'Manajemen'), 
('TE',  'Teknik Elektro'), 
('DKV', 'Desain Komunikasi Visual'); 
GO

SELECT * FROM Programs;
GO

-- ---------------------------------------------------------------------
-- LAB 14 - 15: MEMBUAT TABEL Students & RELASI 1:N
-- ---------------------------------------------------------------------
CREATE TABLE Students 
( 
    StudentId INT IDENTITY(1,1) 
        CONSTRAINT PK_Students PRIMARY KEY, 
 
    NIM VARCHAR(20) NOT NULL 
        CONSTRAINT UQ_Students_NIM UNIQUE, 
 
    Name VARCHAR(100) NOT NULL, 
 
    ProgramId INT NOT NULL, 
 
    BirthDate DATE NULL, 
 
    Address VARCHAR(250) NULL, 
 
    PhoneNumber VARCHAR(20) NULL, 
 
    CreatedAt DATETIME2 NOT NULL 
        CONSTRAINT DF_Students_CreatedAt 
        DEFAULT SYSDATETIME(), 
 
    UpdatedAt DATETIME2 NULL, 
 
    CONSTRAINT FK_Students_Programs 
        FOREIGN KEY (ProgramId) 
        REFERENCES Programs(ProgramId) 
); 
GO

-- ---------------------------------------------------------------------
-- LAB 16: MEMASUKKAN DATA AWAL MAHASISWA (5 Mahasiswa)
-- ---------------------------------------------------------------------
INSERT INTO Students 
( 
    NIM, 
    Name, 
    ProgramId, 
    BirthDate, 
    Address, 
    PhoneNumber 
) 
VALUES 
( 
    '20231001', 
    'Ahmad Rizki', 
    1, 
    '2003-03-12', 
    'Jl. Merdeka No. 123, Surabaya', 
    '081234567890' 
), 
( 
    '20231002', 
    'Siti Aisyah', 
    2, 
    '2004-07-21', 
    'Jl. Diponegoro No. 45, Surabaya', 
    '082233445566' 
), 
( 
    '20231003', 
    'Budi Santoso', 
    1, 
    '2003-11-05', 
    'Jl. Ahmad Yani No. 10, Surabaya', 
    '081355667788' 
), 
( 
    '20231004', 
    'Citra Lestari', 
    3, 
    '2004-01-18', 
    'Jl. Darmo No. 20, Surabaya', 
    '089900112233' 
), 
( 
    '20231005', 
    'Dimas Prayoga', 
    4, 
    '2003-09-27', 
    'Jl. Raya ITS, Surabaya', 
    '081288776655' 
); 
GO

-- ---------------------------------------------------------------------
-- AG. MINI ASSIGNMENT: TAMBAH 3 MAHASISWA BARU (1 TI, 1 SI, 1 TE)
-- ---------------------------------------------------------------------
INSERT INTO Students 
( 
    NIM, 
    Name, 
    ProgramId, 
    BirthDate, 
    Address, 
    PhoneNumber 
) 
VALUES 
( 
    '20231006', 
    'Eko Prasetyo', 
    1, -- Teknik Informatika (TI)
    '2003-05-15', 
    'Jl. Gebang Putih No. 12, Surabaya', 
    '081211223344' 
), 
( 
    '20231007', 
    'Farah Diba', 
    2, -- Sistem Informasi (SI)
    '2004-02-10', 
    'Jl. Keputih Sukolilo No. 8, Surabaya', 
    '081399887766' 
), 
( 
    '20231008', 
    'Gilang Ramadan', 
    4, -- Teknik Elektro (TE)
    '2003-08-25', 
    'Jl. Mulyorejo No. 19, Surabaya', 
    '085612345678' 
); 
GO

-- ---------------------------------------------------------------------
-- LAB 17 - 18: MENAMPILKAN DATA & HASIL JOIN
-- ---------------------------------------------------------------------
SELECT * FROM Students;
GO

SELECT 
    s.StudentId, 
    s.NIM, 
    s.Name, 
    p.ProgramCode, 
    p.ProgramName, 
    s.BirthDate, 
    s.PhoneNumber 
FROM Students s 
INNER JOIN Programs p 
    ON s.ProgramId = p.ProgramId; 
GO

-- ---------------------------------------------------------------------
-- LAB 24: QUERY CHALLENGES
-- ---------------------------------------------------------------------

-- Challenge 1: Tampilkan seluruh mahasiswa
SELECT * 
FROM Students;
GO

-- Challenge 2: Tampilkan mahasiswa Teknik Informatika
SELECT 
    s.NIM, 
    s.Name, 
    p.ProgramName 
FROM Students s 
INNER JOIN Programs p 
    ON s.ProgramId = p.ProgramId 
WHERE p.ProgramCode = 'TI';
GO

-- Challenge 3: Hitung jumlah mahasiswa
SELECT COUNT(*) AS TotalMahasiswa 
FROM Students;
GO

-- Challenge 4: Hitung mahasiswa berdasarkan program studi
SELECT 
    p.ProgramName, 
    COUNT(s.StudentId) AS JumlahMahasiswa 
FROM Programs p 
LEFT JOIN Students s 
    ON p.ProgramId = s.ProgramId 
GROUP BY 
    p.ProgramId, 
    p.ProgramName;
GO

-- ---------------------------------------------------------------------
-- QUERY OUTPUT MINI ASSIGNMENT
-- ---------------------------------------------------------------------
SELECT 
    s.NIM, 
    s.Name, 
    p.ProgramName, 
    s.BirthDate, 
    s.PhoneNumber 
FROM Students s 
INNER JOIN Programs p 
    ON s.ProgramId = p.ProgramId 
ORDER BY s.Name;
GO

-- ---------------------------------------------------------------------
-- QUERY UNTUK APLIKASI WPF (ADO.NET)
-- ---------------------------------------------------------------------
SELECT 
    s.StudentId, 
    s.NIM, 
    s.Name, 
    s.ProgramId, 
    p.ProgramName, 
    s.BirthDate, 
    s.Address, 
    s.PhoneNumber, 
    s.CreatedAt, 
    s.UpdatedAt 
FROM Students s 
INNER JOIN Programs p 
    ON s.ProgramId = p.ProgramId 
ORDER BY s.StudentId;
GO
