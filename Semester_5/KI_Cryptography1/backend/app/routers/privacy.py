"""Modul Privasi: pemberitahuan privasi berversi dan persetujuan."""

import sqlite3
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from starlette import status

from app.core.security import (
    CurrentUser,
    require_roles,
    require_csrf,
    clear_session_cookies,
)
from app.core.config import Settings, get_settings
from app.db.settings_store import get_setting
from app.dependencies import get_db

router = APIRouter(tags=["privacy"])


@router.get("/policy")
def get_current_notice(db: sqlite3.Connection = Depends(get_db)) -> dict:
    return {
        "version": get_setting(db, "privacy_policy_version"),
        "text_markdown": get_setting(db, "privacy_policy_text"),
    }


class ConsentRequest(BaseModel):
    policy_version: str


@router.post("/consent", status_code=status.HTTP_201_CREATED)
def give_consent(
    body: ConsentRequest,
    current_user: CurrentUser = Depends(require_roles("peserta")),
    db: sqlite3.Connection = Depends(get_db),
    _csrf: None = Depends(require_csrf),
) -> dict:
    policy_version = get_setting(db, "privacy_policy_version")
    if body.policy_version != policy_version:
        raise HTTPException(
            409,
            {"code": "policy_outdated", "message": "Setujui versi kebijakan terbaru"},
        )
    db.execute(
        """INSERT INTO consents (id, user_id, policy_version)
               VALUES (?, ?, ?)
           ON CONFLICT(user_id, policy_version) DO UPDATE SET withdrawn_at = NULL""",
        (str(uuid4()), current_user.id, policy_version),
    )
    return dict(
        db.execute(
            "SELECT policy_version, agreed_at FROM consents WHERE user_id = ? AND policy_version = ?",
            (current_user.id, policy_version),
        ).fetchone()
    )


@router.delete("/consent", status_code=204)
def withdraw_consent(
    response: Response,
    current_user: CurrentUser = Depends(require_roles("peserta")),
    db: sqlite3.Connection = Depends(get_db),
    settings: Settings = Depends(get_settings),
    _csrf: None = Depends(require_csrf),
) -> None:
    # Ambil nama file terenkripsi sebelum baris items (dan ciphertexts) ikut terhapus.
    paths = db.execute(
        "SELECT c.path FROM ciphertexts c JOIN items i ON i.id = c.item_id "
        "WHERE i.owner_user_id = ? AND c.path IS NOT NULL",
        (current_user.id,),
    ).fetchall()
    db.execute(
        "UPDATE consents SET withdrawn_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE user_id = ?",
        (current_user.id,),
    )
    db.execute("DELETE FROM items WHERE owner_user_id = ?", (current_user.id,))
    db.execute("UPDATE users SET disabled = 1 WHERE id = ?", (current_user.id,))
    team = db.execute(
        "SELECT teams.* FROM teams JOIN team_members ON teams.id = team_members.team_id WHERE user_id = ?",
        (current_user.id,),
    ).fetchone()
    if team and team["status"] == "draft":
        if team["leader_id"] == current_user.id:
            successor = db.execute(
                "SELECT user_id FROM team_members WHERE team_id = ? AND user_id != ? ORDER BY joined_at LIMIT 1",
                (team["id"], current_user.id),
            ).fetchone()
            if successor:
                db.execute(
                    "UPDATE teams SET leader_id = ? WHERE id = ?",
                    (successor["user_id"], team["id"]),
                )
            else:
                db.execute("DELETE FROM teams WHERE id = ?", (team["id"],))
        db.execute(
            "DELETE FROM team_members WHERE team_id = ? AND user_id = ?",
            (team["id"], current_user.id),
        )
    clear_session_cookies(response)
    db.commit()
    for row in paths:
        (settings.storage_dir_abs / row["path"]).unlink(missing_ok=True)
