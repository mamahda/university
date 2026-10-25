-- Skema database Lost and Found Departemen Teknik Informatika.
-- Dijalankan setiap aplikasi dimulai; aman dijalankan berulang kali.

CREATE TABLE IF NOT EXISTS Users (
    Id             INTEGER PRIMARY KEY AUTOINCREMENT,
    IdentityNumber TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    FullName       TEXT    NOT NULL,
    PasswordHash   TEXT    NOT NULL,
    PasswordSalt   TEXT    NOT NULL,
    Role           TEXT    NOT NULL DEFAULT 'User' CHECK (Role IN ('User', 'Admin'))
);

CREATE TABLE IF NOT EXISTS FoundItems (
    Id          INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId      INTEGER NOT NULL REFERENCES Users(Id),
    ItemName    TEXT    NOT NULL,
    PhotoPath   TEXT    NOT NULL,
    Category    TEXT    NOT NULL CHECK (Category IN ('Dompet & Kartu', 'Elektronik', 'Kunci', 'Tas', 'Pakaian', 'Alat Tulis & Buku', 'Dokumen', 'Lainnya')),
    Location    TEXT    NOT NULL,
    FoundDate   TEXT    NOT NULL,
    Description TEXT    NOT NULL,
    Contact     TEXT    NOT NULL,
    Status      TEXT    NOT NULL DEFAULT 'BelumDikembalikan' CHECK (Status IN ('BelumDikembalikan', 'Dikembalikan')),
    CreatedAt   TEXT    NOT NULL,
    UpdatedAt   TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS IX_FoundItems_Status_FoundDate ON FoundItems (Status, FoundDate, Id);
CREATE INDEX IF NOT EXISTS IX_FoundItems_UserId_Status ON FoundItems (UserId, Status);

CREATE TABLE IF NOT EXISTS LostItems (
    Id          INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId      INTEGER NOT NULL REFERENCES Users(Id),
    ItemName    TEXT    NOT NULL,
    PhotoPath   TEXT    NULL,
    Category    TEXT    NOT NULL CHECK (Category IN ('Dompet & Kartu', 'Elektronik', 'Kunci', 'Tas', 'Pakaian', 'Alat Tulis & Buku', 'Dokumen', 'Lainnya')),
    Location    TEXT    NULL,
    LostDate    TEXT    NOT NULL,
    Description TEXT    NOT NULL,
    Contact     TEXT    NOT NULL,
    Status      TEXT    NOT NULL DEFAULT 'BelumDitemukan' CHECK (Status IN ('BelumDitemukan', 'Ditemukan')),
    CreatedAt   TEXT    NOT NULL,
    UpdatedAt   TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS IX_LostItems_Status_LostDate ON LostItems (Status, LostDate, Id);
CREATE INDEX IF NOT EXISTS IX_LostItems_UserId_Status ON LostItems (UserId, Status);
