"""Representasi JSON bersama untuk kontrak API peserta, tim, dan admin."""

import sqlite3
from datetime import date

from app.db.items import get_active_item, read_item, read_original_filename, read_text
from app.db.settings_store import get_setting
from app.db.users import get_email

PROFILE_FIELDS = (
    "full_name",
    "nim",
    "study_program",
    "institution",
    "birth_date",
    "domicile",
    "phone",
)
DOCUMENT_FIELDS = ("ktp", "ktm", "twibbon")


def item_meta(db: sqlite3.Connection, item: sqlite3.Row | None) -> dict | None:
    if item is None:
        return None
    return {
        "item_id": item["id"],
        "field": item["field"],
        "content_type": item["content_type"] or "text/plain",
        "size_bytes": item["size_bytes"],
        "original_filename": read_original_filename(db, item["id"]) or item["field"],
        "uploaded_at": item["created_at"],
    }


def profile_data(db: sqlite3.Connection, user_id: str) -> dict:
    user = db.execute(
        "SELECT verification_status FROM users WHERE id = ?", (user_id,)
    ).fetchone()
    values = {
        field: read_item(db, owner_user_id=user_id, field=field)
        for field in PROFILE_FIELDS
    }
    age = None
    if values["birth_date"]:
        try:
            born = date.fromisoformat(values["birth_date"])
            today = date.today()
            age = (
                today.year
                - born.year
                - ((today.month, today.day) < (born.month, born.day))
            )
        except ValueError:
            pass
    note = db.execute(
        "SELECT note_item_id FROM verification_events WHERE user_id = ? ORDER BY created_at DESC, rowid DESC LIMIT 1",
        (user_id,),
    ).fetchone()
    return {
        **values,
        "age": age,
        "is_minor": age < 18 if age is not None else None,
        "profile_complete": all(values.values()),
        "verification_status": user["verification_status"],
        # Catatan terenkripsi (item `verification_note`); "" kalau keputusan terakhir tanpa catatan.
        "verification_note": (
            (read_text(db, note["note_item_id"]) if note["note_item_id"] else "")
            if note
            else None
        ),
    }


def documents_data(db: sqlite3.Connection, user_id: str) -> dict:
    documents = {
        field: item_meta(db, get_active_item(db, owner_user_id=user_id, field=field))
        for field in DOCUMENT_FIELDS
    }
    return {**documents, "documents_complete": all(documents.values())}


def team_data(db: sqlite3.Connection, team: sqlite3.Row) -> dict:
    rows = db.execute(
        "SELECT user_id FROM team_members WHERE team_id = ? ORDER BY joined_at",
        (team["id"],),
    ).fetchall()
    members = []
    for row in rows:
        profile = profile_data(db, row["user_id"])
        members.append(
            {
                "user_id": row["user_id"],
                "full_name": profile["full_name"],
                "is_leader": row["user_id"] == team["leader_id"],
                "profile_complete": profile["profile_complete"],
                "documents_complete": documents_data(db, row["user_id"])[
                    "documents_complete"
                ],
            }
        )
    submission = {
        field: item_meta(
            db, get_active_item(db, owner_team_id=team["id"], field=field)
        )
        for field in ("proposal", "video")
    }
    submission["repo_url"] = read_item(db, owner_team_id=team["id"], field="repo_url")
    missing = [field for field, value in submission.items() if not value]
    if len(members) < int(get_setting(db, "min_team_size")):
        missing.append("min_members")
    if any(
        not member["profile_complete"] or not member["documents_complete"]
        for member in members
    ):
        missing.append("members_incomplete")
    return {
        "id": team["id"],
        "name": read_item(db, owner_team_id=team["id"], field="team_name") or "",
        "code": team["team_code"],
        "status": team["status"],
        "leader_id": team["leader_id"],
        "created_at": team["created_at"],
        "finalized_at": team["finalized_at"],
        "members": members,
        "submission": submission,
        "finalize_missing": missing,
    }


def me_data(db: sqlite3.Connection, user_id: str) -> dict:
    user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    consent = db.execute(
        "SELECT policy_version, agreed_at FROM consents WHERE user_id = ? AND withdrawn_at IS NULL ORDER BY agreed_at DESC LIMIT 1",
        (user_id,),
    ).fetchone()
    team = db.execute(
        "SELECT teams.* FROM teams JOIN team_members ON teams.id = team_members.team_id WHERE team_members.user_id = ?",
        (user_id,),
    ).fetchone()
    return {
        "id": user_id,
        "email": get_email(db, user_id),
        "role": user["role"],
        "full_name": read_item(db, owner_user_id=user_id, field="full_name"),
        "verification_status": user["verification_status"]
        if user["role"] == "peserta"
        else None,
        "verification_note": profile_data(db, user_id)["verification_note"],
        "must_change_password": bool(user["must_change_password"]),
        "consent": dict(consent) if consent else None,
        "current_policy_version": get_setting(db, "privacy_policy_version"),
        "team": {
            "id": team["id"],
            "name": read_item(db, owner_team_id=team["id"], field="team_name") or "",
            "status": team["status"],
            "is_leader": team["leader_id"] == user_id,
        }
        if team
        else None,
    }


def public_settings(db: sqlite3.Connection) -> dict:
    return {
        "registration_deadline": get_setting(db, "registration_deadline") or None,
        "submission_deadline": get_setting(db, "submission_deadline") or None,
        "min_team_size": int(get_setting(db, "min_team_size")),
        "max_team_size": int(get_setting(db, "max_team_size")),
        "limits": {
            "document_max_bytes": 5 * 1024**2,
            "proposal_max_bytes": 10 * 1024**2,
            "video_max_bytes": 100 * 1024**2,
        },
    }
