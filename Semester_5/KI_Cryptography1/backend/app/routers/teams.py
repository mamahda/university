"""Modul Tim: buat tim, kode tim, gabung, keluar, keluarkan anggota."""

import secrets
import sqlite3
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, field_validator
from starlette import status

from app.core.limiter import limiter
from app.core.security import CurrentUser, get_current_user, require_csrf, require_roles
from app.db.items import write_item
from app.db.settings_store import get_setting, is_past_deadline
from app.db.views import team_data
from app.db.audit import log_action
from app.dependencies import get_db

router = APIRouter(prefix="/teams", tags=["teams"])

TEAM_CODE_ALPHABET = (
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # tanpa karakter yang mudah tertukar
)


class CreateTeamRequest(BaseModel):
    name: str = Field(min_length=1, max_length=50)


class JoinTeamRequest(BaseModel):
    code: str = Field(min_length=8, max_length=8)

    @field_validator("code", mode="before")
    @classmethod
    def normalize_code(cls, value: str) -> str:
        return value.strip().upper()


def _get_membership(db: sqlite3.Connection, user_id: str) -> sqlite3.Row | None:
    return db.execute(
        "SELECT team_id FROM team_members WHERE user_id = ?", (user_id,)
    ).fetchone()


def _get_team(db: sqlite3.Connection, team_id: str) -> sqlite3.Row:
    return db.execute("SELECT * FROM teams WHERE id = ?", (team_id,)).fetchone()


def _generate_team_code(db: sqlite3.Connection) -> str:
    for _ in range(10):
        code = "".join(secrets.choice(TEAM_CODE_ALPHABET) for _ in range(8))
        exists = db.execute(
            "SELECT 1 FROM teams WHERE team_code = ?", (code,)
        ).fetchone()
        if exists is None:
            return code
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Gagal membuat kode tim")


@router.post("", status_code=status.HTTP_201_CREATED)
def create_team(
    body: CreateTeamRequest,
    current_user: CurrentUser = Depends(require_roles("peserta")),
    db: sqlite3.Connection = Depends(get_db),
    _csrf: None = Depends(require_csrf),
) -> dict:
    if is_past_deadline(db, "registration_deadline"):
        raise HTTPException(
            409,
            {"code": "deadline_passed", "message": "Tenggat pendaftaran sudah lewat"},
        )
    if _get_membership(db, current_user.id) is not None:
        raise HTTPException(
            409, {"code": "already_in_team", "message": "Sudah tergabung di sebuah tim"}
        )

    team_id = str(uuid4())
    team_code = _generate_team_code(db)
    db.execute(
        "INSERT INTO teams (id, team_code, leader_id, status) VALUES (?, ?, ?, 'draft')",
        (team_id, team_code, current_user.id),
    )
    db.execute(
        "INSERT INTO team_members (team_id, user_id) VALUES (?, ?)",
        (team_id, current_user.id),
    )
    write_item(db, owner_team_id=team_id, field="team_name", value=body.name)

    return {"team": team_data(db, _get_team(db, team_id))}


@router.post("/join")
@limiter.limit("10/minute")
def join_team(
    request: Request,
    body: JoinTeamRequest,
    current_user: CurrentUser = Depends(require_roles("peserta")),
    db: sqlite3.Connection = Depends(get_db),
    _csrf: None = Depends(require_csrf),
) -> dict:
    if is_past_deadline(db, "registration_deadline"):
        raise HTTPException(
            409,
            {"code": "deadline_passed", "message": "Tenggat pendaftaran sudah lewat"},
        )
    if _get_membership(db, current_user.id) is not None:
        raise HTTPException(
            409, {"code": "already_in_team", "message": "Sudah tergabung di sebuah tim"}
        )

    team = db.execute(
        "SELECT * FROM teams WHERE team_code = ?", (body.code,)
    ).fetchone()
    if team is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Kode tim tidak ditemukan")
    if team["status"] != "draft":
        raise HTTPException(409, {"code": "team_locked", "message": "Tim sudah final"})

    member_count = db.execute(
        "SELECT COUNT(*) AS n FROM team_members WHERE team_id = ?", (team["id"],)
    ).fetchone()["n"]
    if member_count >= int(get_setting(db, "max_team_size")):
        raise HTTPException(409, {"code": "team_full", "message": "Tim sudah penuh"})

    db.execute(
        "INSERT INTO team_members (team_id, user_id) VALUES (?, ?)",
        (team["id"], current_user.id),
    )
    return {"team": team_data(db, team)}


@router.post("/me/leave", status_code=status.HTTP_204_NO_CONTENT)
def leave_team(
    current_user: CurrentUser = Depends(require_roles("peserta")),
    db: sqlite3.Connection = Depends(get_db),
    _csrf: None = Depends(require_csrf),
) -> None:
    membership = _get_membership(db, current_user.id)
    if membership is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Belum tergabung di tim manapun")

    team = _get_team(db, membership["team_id"])
    if team["status"] == "final":
        raise HTTPException(
            status.HTTP_409_CONFLICT, "Tim sudah final, tidak bisa keluar"
        )

    if team["leader_id"] == current_user.id:
        other_members = db.execute(
            "SELECT COUNT(*) AS n FROM team_members WHERE team_id = ? AND user_id != ?",
            (team["id"], current_user.id),
        ).fetchone()["n"]
        if other_members > 0:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                "Ketua tidak bisa keluar selagi masih ada anggota lain; keluarkan anggota dulu",
            )
        db.execute("DELETE FROM teams WHERE id = ?", (team["id"],))
    else:
        db.execute(
            "DELETE FROM team_members WHERE team_id = ? AND user_id = ?",
            (team["id"], current_user.id),
        )


@router.get("/me")
def get_my_team(
    current_user: CurrentUser = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
) -> dict:
    membership = _get_membership(db, current_user.id)
    if membership is None:
        return {"team": None}
    return {"team": team_data(db, _get_team(db, membership["team_id"]))}


@router.delete("/me/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(
    user_id: str,
    current_user: CurrentUser = Depends(require_roles("peserta")),
    db: sqlite3.Connection = Depends(get_db),
    _csrf: None = Depends(require_csrf),
) -> None:
    team = db.execute(
        "SELECT * FROM teams WHERE leader_id = ?", (current_user.id,)
    ).fetchone()
    if team is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Kamu bukan ketua tim manapun")
    if team["status"] == "final":
        raise HTTPException(
            status.HTTP_409_CONFLICT, "Tim sudah final, tidak bisa keluarkan anggota"
        )
    if user_id == current_user.id:
        raise HTTPException(
            status.HTTP_409_CONFLICT, "Ketua tidak bisa mengeluarkan diri sendiri"
        )

    cursor = db.execute(
        "DELETE FROM team_members WHERE team_id = ? AND user_id = ?",
        (team["id"], user_id),
    )
    if cursor.rowcount == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Bukan anggota tim ini")
    log_action(
        db,
        actor_id=current_user.id,
        action="remove_team_member",
        subject_user_id=user_id,
    )
