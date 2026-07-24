-- ROLE & USER MANAGEMENT
 
-- Buat Role
CREATE ROLE admin;
CREATE ROLE penjual;
CREATE ROLE pembeli;

-- Buat User
CREATE USER admin_user
WITH LOGIN PASSWORD 'Admin123!';

CREATE USER penjual_user
WITH LOGIN PASSWORD 'Penjual123!';

CREATE USER pembeli_user
WITH LOGIN PASSWORD 'Pembeli123!';

-- Assign User ke Role
GRANT admin TO admin_user;
GRANT penjual TO penjual_user;
GRANT pembeli TO pembeli_user;

-- DATABASE ACCESS
 
GRANT CONNECT ON DATABASE myitscanteen TO admin;
GRANT CONNECT ON DATABASE myitscanteen TO penjual;
GRANT CONNECT ON DATABASE myitscanteen TO pembeli;

-- REMOVE DEFAULT ACCESS
 
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;

-- ADMIN PERMISSIONS
 
GRANT ALL PRIVILEGES
ON ALL TABLES IN SCHEMA public
TO admin;

GRANT ALL PRIVILEGES
ON ALL SEQUENCES IN SCHEMA public
TO admin;

GRANT ALL PRIVILEGES
ON ALL FUNCTIONS IN SCHEMA public
TO admin;

-- PENJUAL PERMISSIONS
 
-- Referensi Data
GRANT SELECT ON Departemen TO penjual;
GRANT SELECT ON Kantin TO penjual;
GRANT SELECT ON Toko TO penjual;

-- Kelola Menu
GRANT SELECT, INSERT, UPDATE, DELETE
ON Menu
TO penjual;

-- Kelola Pesanan
GRANT SELECT, UPDATE
ON Pesanan
TO penjual;

-- Detail Pesanan
GRANT SELECT
ON Pesanan_Menu
TO penjual;

-- Lihat Data Pelanggan
GRANT SELECT
ON Pelanggan
TO penjual;

-- PEMBELI PERMISSIONS

-- Lihat Data
GRANT SELECT ON Departemen TO pembeli;
GRANT SELECT ON Kantin TO pembeli;
GRANT SELECT ON Toko TO pembeli;
GRANT SELECT ON Menu TO pembeli;

-- Kelola Akun Pelanggan
GRANT SELECT, INSERT, UPDATE
ON Pelanggan
TO pembeli;

-- Membuat Pesanan
GRANT SELECT, INSERT
ON Pesanan
TO pembeli;

GRANT SELECT, INSERT
ON Pesanan_Menu
TO pembeli;

-- DEFAULT PRIVILEGES
-- Berlaku untuk tabel yang dibuat setelah script ini

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO admin;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON SEQUENCES TO admin;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO penjual;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO pembeli;

-- melihat role dan user:
-- \du

-- melihat hak akses tabel:
-- \dp