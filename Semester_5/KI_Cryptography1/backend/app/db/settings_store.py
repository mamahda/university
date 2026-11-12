"""Baca/tulis tabel `settings` (key-value): tenggat, batas anggota, kebijakan privasi."""

import sqlite3
from datetime import datetime

DEFAULTS = {
    "deadline_at": None,
    "max_team_members": "4",
    "min_team_size": "2",
    "privacy_policy_version": "v1",
    "privacy_policy_text": "Data pendaftaran hanya dibuka untuk pengguna berhak.",
}


def get_setting(db: sqlite3.Connection, key: str) -> str | None:
    row = db.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
    if row is not None:
        return row["value"]
    if key in ("registration_deadline", "submission_deadline"):
        return get_setting(db, "deadline_at")
    if key == "max_team_size":
        return get_setting(db, "max_team_members")
    return DEFAULTS.get(key)


def set_setting(
    db: sqlite3.Connection, key: str, value: str, *, updated_by: str
) -> None:
    db.execute(
        """INSERT INTO settings (key, value, updated_by, updated_at)
               VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
           ON CONFLICT(key) DO UPDATE SET
               value = excluded.value, updated_by = excluded.updated_by, updated_at = excluded.updated_at""",
        (key, value, updated_by),
    )


def is_past_deadline(db: sqlite3.Connection, key: str = "submission_deadline") -> bool:
    deadline = get_setting(db, key)
    if not deadline:
        return False
    deadline_dt = datetime.fromisoformat(deadline.replace("Z", "+00:00"))
    # Tanpa zona waktu = dianggap jam lokal server.
    return datetime.now(deadline_dt.tzinfo) >= deadline_dt
