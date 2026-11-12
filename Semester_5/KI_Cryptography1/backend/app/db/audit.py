"""Pencatatan audit_logs: akses ke data orang lain, keputusan verifikasi, dll."""

import sqlite3
from uuid import uuid4


def log_action(
    db: sqlite3.Connection,
    *,
    actor_id: str | None,
    action: str,
    result: str = "ok",
    item_id: str | None = None,
    subject_user_id: str | None = None,
) -> None:
    db.execute(
        """INSERT INTO audit_logs (id, actor_id, action, item_id, subject_user_id, result)
               VALUES (?, ?, ?, ?, ?, ?)""",
        (str(uuid4()), actor_id, action, item_id, subject_user_id, result),
    )
