BEGIN IMMEDIATE;

-- Assignment 2: berbagi data antarpeserta (lihat docs/KONTRAK_SHARING_ASSIGNMENT_2.md).
-- Hanya menambah tabel baru; tidak ada data lama yang diubah atau dihapus.
-- Akun dinonaktifkan (users.disabled), tidak dihapus, sehingga ON DELETE CASCADE ke
-- users/items mengikuti pola tabel lama dan tidak pernah terpicu oleh penonaktifan.

-- Public key RSA-OAEP penerima (SPKI DER). Satu key per user, tanpa rotasi.
CREATE TABLE IF NOT EXISTS sharing_public_keys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    public_key_spki BLOB NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Permintaan akses: requester meminta data owner. Diputuskan sekali saja.
CREATE TABLE IF NOT EXISTS sharing_requests (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requester_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    decided_at TEXT,
    CHECK (owner_id <> requester_id),
    CHECK ((status = 'pending' AND decided_at IS NULL) OR
           (status <> 'pending' AND decided_at IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS ix_sharing_requests_owner ON sharing_requests(owner_id, created_at);
CREATE INDEX IF NOT EXISTS ix_sharing_requests_requester ON sharing_requests(requester_id, created_at);

-- Kunci AES+HMAC existing satu item, dienkripsi RSA untuk penerima (bukan DEK plaintext).
-- Mengganti item menghapus baris ciphertexts lamanya, dan grant ikut terhapus lewat
-- ON DELETE CASCADE; item penggantinya tidak otomatis dibagikan.
CREATE TABLE IF NOT EXISTS sharing_grants (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL REFERENCES sharing_requests(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    ciphertext_id TEXT NOT NULL REFERENCES ciphertexts(id) ON DELETE CASCADE,
    recipient_key_id TEXT NOT NULL REFERENCES sharing_public_keys(id) ON DELETE CASCADE,
    encrypted_key BLOB NOT NULL,
    UNIQUE (request_id, item_id)
);
CREATE INDEX IF NOT EXISTS ix_sharing_grants_ciphertext ON sharing_grants(ciphertext_id);

PRAGMA user_version = 3;
COMMIT;
