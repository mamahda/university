BEGIN IMMEDIATE;

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email_index BLOB NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('peserta', 'juri', 'superadmin')),
    verification_status TEXT NOT NULL DEFAULT 'belum_lengkap'
        CHECK (verification_status IN ('belum_lengkap', 'menunggu', 'terverifikasi', 'ditolak')),
    must_change_password INTEGER NOT NULL DEFAULT 0 CHECK (must_change_password IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS consents (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    policy_version TEXT NOT NULL,
    agreed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    withdrawn_at TEXT,
    UNIQUE (user_id, policy_version)
);

CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    team_code TEXT NOT NULL UNIQUE,
    leader_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    finalized_at TEXT,
    CHECK ((status = 'draft' AND finalized_at IS NULL) OR
           (status = 'final' AND finalized_at IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS team_members (
    team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    joined_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    PRIMARY KEY (team_id, user_id)
);

CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    owner_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    owner_team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
    field TEXT NOT NULL CHECK (field IN (
        'email', 'full_name', 'nim', 'study_program', 'institution',
        'birth_date', 'domicile', 'phone', 'ktp', 'ktm', 'twibbon',
        'team_name', 'proposal', 'video', 'repo_url', 'original_filename',
        'verification_note'
    )),
    storage TEXT NOT NULL CHECK (storage IN ('db', 'fs')),
    content_type TEXT,
    size_bytes INTEGER NOT NULL DEFAULT 0 CHECK (size_bytes >= 0),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    shredded_at TEXT,
    CHECK ((owner_user_id IS NOT NULL AND owner_team_id IS NULL) OR
           (owner_user_id IS NULL AND owner_team_id IS NOT NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_user_item
    ON items(owner_user_id, field)
    WHERE owner_user_id IS NOT NULL AND shredded_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_team_item
    ON items(owner_team_id, field)
    WHERE owner_team_id IS NOT NULL AND shredded_at IS NULL;

CREATE TABLE IF NOT EXISTS ciphertexts (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    cipher TEXT NOT NULL CHECK (cipher IN ('aes', 'des', 'rc4')),
    nonce BLOB,
    wrap_nonce BLOB NOT NULL,
    wrapped_keys BLOB NOT NULL,
    wrap_tag BLOB NOT NULL,
    key_version INTEGER NOT NULL DEFAULT 1 CHECK (key_version > 0),
    hmac_tag BLOB NOT NULL,
    blob BLOB,
    path TEXT,
    UNIQUE (item_id, cipher),
    CHECK ((blob IS NOT NULL AND path IS NULL) OR
           (blob IS NULL AND path IS NOT NULL)),
    CHECK ((cipher = 'rc4' AND nonce IS NULL) OR
           (cipher IN ('aes', 'des') AND nonce IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS juri_assignments (
    juri_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    assigned_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    PRIMARY KEY (juri_id, team_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    item_id TEXT REFERENCES items(id) ON DELETE SET NULL,
    subject_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    result TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS ix_audit_actor_created ON audit_logs(actor_id, created_at);
CREATE INDEX IF NOT EXISTS ix_audit_subject_created ON audit_logs(subject_user_id, created_at);

CREATE TABLE IF NOT EXISTS benchmark_runs (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL,
    cipher TEXT NOT NULL CHECK (cipher IN ('aes', 'des', 'rc4')),
    operation TEXT NOT NULL CHECK (operation IN ('enc', 'dec', 'hmac', 'wrap')),
    field TEXT NOT NULL,
    size_bytes INTEGER NOT NULL CHECK (size_bytes >= 0),
    duration_ns INTEGER NOT NULL CHECK (duration_ns >= 0),
    source TEXT NOT NULL CHECK (source IN ('live', 'controlled')),
    env TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS ix_benchmark_query
    ON benchmark_runs(cipher, operation, size_bytes);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS verification_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    admin_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    decision TEXT NOT NULL CHECK (decision IN ('terverifikasi', 'ditolak', 'menunggu')),
    reason_code TEXT NOT NULL,
    note_item_id TEXT REFERENCES items(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS ix_verification_user_created
    ON verification_events(user_id, created_at);

PRAGMA user_version = 1;
COMMIT;

