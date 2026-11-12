BEGIN IMMEDIATE;

-- Akun dinonaktifkan (tarik consent) alih-alih dihapus.
ALTER TABLE users ADD COLUMN disabled INTEGER NOT NULL DEFAULT 0 CHECK (disabled IN (0, 1));

-- Satu file (ktp/ktm/twibbon/proposal/video) punya satu item anak `original_filename`
-- (terenkripsi juga, karena nama file bisa memuat data pribadi). Item anak menunjuk
-- item induknya lewat parent_item_id, sehingga indeks unik "satu item aktif per
-- (pemilik, field)" hanya berlaku untuk item induk (parent_item_id IS NULL).
ALTER TABLE items ADD COLUMN parent_item_id TEXT REFERENCES items(id) ON DELETE CASCADE;

DROP INDEX IF EXISTS uq_active_user_item;
DROP INDEX IF EXISTS uq_active_team_item;
CREATE UNIQUE INDEX uq_active_user_item
    ON items(owner_user_id, field)
    WHERE owner_user_id IS NOT NULL AND shredded_at IS NULL AND parent_item_id IS NULL;
CREATE UNIQUE INDEX uq_active_team_item
    ON items(owner_team_id, field)
    WHERE owner_team_id IS NOT NULL AND shredded_at IS NULL AND parent_item_id IS NULL;
CREATE UNIQUE INDEX uq_active_child_item
    ON items(parent_item_id, field)
    WHERE parent_item_id IS NOT NULL AND shredded_at IS NULL;

PRAGMA user_version = 2;
COMMIT;
