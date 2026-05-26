CREATE USER admin_toko WITH PASSWORD '12345';

CREATE USER admin_album WITH PASSWORD '12345';

SELECT usename
FROM pg_catalog.pg_user
WHERE
    usename IN ('admin_toko', 'admin_album');

CREATE ROLE role_toko;

CREATE ROLE role_album;

GRANT
SELECT, INSERT,
UPDATE ON TABLE RECEIPT, DETAILITEM TO role_toko;

GRANT SELECT ON TABLE SINGER, ALBUM TO role_toko;

GRANT SELECT, INSERT, UPDATE ON TABLE SINGER, ALBUM TO role_album;

GRANT role_toko TO admin_toko;

GRANT role_album TO admin_album;

SELECT
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE
    grantee IN ('role_toko', 'role_album');

pg_dump - U postgres - W - F c - f backup_album.backup album

CREATE DATABASE "newAlbum";


pg_restore - U postgres - d "newAlbum" -1 backup_album.backup

\c "newAlbum";

SELECT * FROM ALBUM;