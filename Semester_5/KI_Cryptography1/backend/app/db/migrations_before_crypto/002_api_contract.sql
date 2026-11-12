BEGIN IMMEDIATE;
ALTER TABLE items ADD COLUMN original_filename TEXT;
ALTER TABLE users ADD COLUMN disabled INTEGER NOT NULL DEFAULT 0 CHECK (disabled IN (0, 1));
CREATE TABLE juri_assignments (
    juri_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    assigned_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    PRIMARY KEY (juri_id, team_id)
);
CREATE TABLE benchmark_runs (
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
CREATE INDEX ix_benchmark_query ON benchmark_runs(cipher, operation, size_bytes);
PRAGMA user_version = 2;
COMMIT;
