"""Endpoint superadmin sesuai kontrak PRD dan frontend."""

import sqlite3
from datetime import datetime
from typing import Literal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr, Field, model_validator

from app.core.security import CurrentUser, password_hasher, require_csrf, require_roles
from app.db.audit import log_action
from app.db.items import read_item, shred_field, write_item
from app.db.settings_store import get_setting, set_setting
from app.db.users import create_user, email_taken, get_email
from app.db.views import documents_data, profile_data, public_settings, team_data
from app.dependencies import get_db
from app.benchmarking import benchmark_summary

router = APIRouter(prefix="/admin", tags=["admin"])


class VerifyParticipantRequest(BaseModel):
    verification_status: Literal["terverifikasi", "ditolak"]
    note: str | None = None

    @model_validator(mode="after")
    def require_rejection_note(self):
        if self.verification_status == "ditolak" and not (self.note or "").strip():
            raise ValueError("Alasan penolakan wajib diisi")
        return self


class CreateJudgeRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)


class AssignmentsRequest(BaseModel):
    team_ids: list[str]


class SettingsUpdate(BaseModel):
    registration_deadline: datetime | None = None
    submission_deadline: datetime | None = None
    min_team_size: int | None = Field(default=None, ge=2)
    max_team_size: int | None = Field(default=None, ge=2)
    privacy_policy_version: str | None = Field(default=None, min_length=1)
    privacy_policy_text: str | None = None


def participant_detail(db: sqlite3.Connection, user_id: str) -> dict:
    user = db.execute(
        "SELECT * FROM users WHERE id = ? AND role = 'peserta'", (user_id,)
    ).fetchone()
    if user is None:
        raise HTTPException(404, "Peserta tidak ditemukan")
    profile = profile_data(db, user_id)
    team = db.execute(
        "SELECT teams.* FROM teams JOIN team_members ON teams.id = team_members.team_id WHERE user_id = ?",
        (user_id,),
    ).fetchone()
    return {
        "user_id": user_id,
        "email": get_email(db, user_id),
        "profile": profile,
        "documents": documents_data(db, user_id),
        "verification_status": user["verification_status"],
        "verification_note": profile["verification_note"],
        "team": {
            "id": team["id"],
            "name": read_item(db, owner_team_id=team["id"], field="team_name") or "",
            "status": team["status"],
        }
        if team
        else None,
    }


@router.get("/participants")
def list_participants(
    current_user: CurrentUser = Depends(require_roles("superadmin")),
    db: sqlite3.Connection = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    verification_status: Literal[
        "belum_lengkap", "menunggu", "terverifikasi", "ditolak"
    ]
    | None = Query(None, alias="status"),
) -> dict:
    where, args = "role = 'peserta'", []
    if verification_status:
        where += " AND verification_status = ?"
        args.append(verification_status)
    total = db.execute(f"SELECT COUNT(*) FROM users WHERE {where}", args).fetchone()[0]
    users = db.execute(
        f"SELECT id FROM users WHERE {where} ORDER BY created_at LIMIT ? OFFSET ?",
        [*args, page_size, (page - 1) * page_size],
    ).fetchall()
    items = []
    for user in users:
        detail = participant_detail(db, user["id"])
        profile = detail["profile"]
        items.append(
            {
                "user_id": user["id"],
                "email": detail["email"],
                "full_name": profile["full_name"],
                "institution": profile["institution"],
                "age": profile["age"],
                "is_minor": profile["is_minor"],
                "verification_status": detail["verification_status"],
                "documents_complete": detail["documents"]["documents_complete"],
                "team_name": detail["team"]["name"] if detail["team"] else None,
            }
        )
        log_action(
            db,
            actor_id=current_user.id,
            action="view_profile",
            subject_user_id=user["id"],
        )
    return {"items": items, "page": page, "page_size": page_size, "total": total}


@router.get("/participants/{user_id}")
def get_participant(
    user_id: str,
    current_user: CurrentUser = Depends(require_roles("superadmin")),
    db: sqlite3.Connection = Depends(get_db),
) -> dict:
    detail = participant_detail(db, user_id)
    log_action(
        db, actor_id=current_user.id, action="view_profile", subject_user_id=user_id
    )
    return detail


@router.patch("/participants/{user_id}")
def verify_participant(
    user_id: str,
    body: VerifyParticipantRequest,
    current_user: CurrentUser = Depends(require_roles("superadmin")),
    db: sqlite3.Connection = Depends(get_db),
    _csrf: None = Depends(require_csrf),
) -> dict:
    detail = participant_detail(db, user_id)
    if detail["verification_status"] == "belum_lengkap":
        raise HTTPException(409, "Peserta belum melengkapi dokumen")
    db.execute(
        "UPDATE users SET verification_status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
        (body.verification_status, user_id),
    )
    # Catatan admin terenkripsi sebagai item `verification_note` milik peserta;
    # tabel verification_events hanya menyimpan kode alasan dan id item catatannya.
    note_item_id = None
    if (body.note or "").strip():
        note_item_id = write_item(
            db, owner_user_id=user_id, field="verification_note", value=body.note
        )
    else:
        shred_field(db, owner_user_id=user_id, field="verification_note")
    db.execute(
        "INSERT INTO verification_events (id, user_id, admin_id, decision, reason_code, note_item_id) VALUES (?, ?, ?, ?, ?, ?)",
        (
            str(uuid4()),
            user_id,
            current_user.id,
            body.verification_status,
            "approved" if body.verification_status == "terverifikasi" else "rejected",
            note_item_id,
        ),
    )
    log_action(
        db,
        actor_id=current_user.id,
        action="verify_participant",
        subject_user_id=user_id,
        result=body.verification_status,
    )
    return {
        "user_id": user_id,
        "verification_status": body.verification_status,
        "verification_note": body.note,
    }


@router.get("/teams")
def list_teams(
    current_user: CurrentUser = Depends(require_roles("superadmin")),
    db: sqlite3.Connection = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> dict:
    rows = db.execute(
        "SELECT * FROM teams ORDER BY created_at LIMIT ? OFFSET ?",
        (page_size, (page - 1) * page_size),
    ).fetchall()
    items = []
    for row in rows:
        team = team_data(db, row)
        items.append(
            {
                "id": row["id"],
                "name": team["name"],
                "status": team["status"],
                "member_count": len(team["members"]),
                "leader_name": read_item(
                    db, owner_user_id=row["leader_id"], field="full_name"
                ),
                "finalized_at": row["finalized_at"],
            }
        )
    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": db.execute("SELECT COUNT(*) FROM teams").fetchone()[0],
    }


@router.get("/juri")
def list_juri(
    current_user: CurrentUser = Depends(require_roles("superadmin")),
    db: sqlite3.Connection = Depends(get_db),
) -> dict:
    rows = db.execute(
        "SELECT id AS user_id, created_at FROM users WHERE role = 'juri' AND disabled = 0 ORDER BY created_at"
    ).fetchall()
    return {
        "juri": [
            {
                "user_id": row["user_id"],
                "email": get_email(db, row["user_id"]),
                "created_at": row["created_at"],
                "team_ids": [
                    team["team_id"]
                    for team in db.execute(
                        "SELECT team_id FROM juri_assignments WHERE juri_id = ?",
                        (row["user_id"],),
                    )
                ],
            }
            for row in rows
        ]
    }


@router.post("/juri", status_code=201)
def create_judge_account(
    body: CreateJudgeRequest,
    current_user: CurrentUser = Depends(require_roles("superadmin")),
    db: sqlite3.Connection = Depends(get_db),
    _csrf: None = Depends(require_csrf),
) -> dict:
    email = body.email.strip().lower()
    if email_taken(db, email):
        raise HTTPException(
            409, {"code": "email_taken", "message": "Email sudah terdaftar"}
        )
    user_id = create_user(
        db,
        email=email,
        password_hash=password_hasher.hash(body.password),
        role="juri",
        verification_status="terverifikasi",
        must_change_password=True,
    )
    log_action(
        db, actor_id=current_user.id, action="create_juri", subject_user_id=user_id
    )
    return {"user_id": user_id, "email": email, "role": "juri"}


@router.put("/juri/{juri_id}/assignments")
def assign_teams(
    juri_id: str,
    body: AssignmentsRequest,
    current_user: CurrentUser = Depends(require_roles("superadmin")),
    db: sqlite3.Connection = Depends(get_db),
    _csrf: None = Depends(require_csrf),
) -> dict:
    if not db.execute(
        "SELECT 1 FROM users WHERE id = ? AND role = 'juri' AND disabled = 0",
        (juri_id,),
    ).fetchone():
        raise HTTPException(404, "Akun juri tidak ditemukan")
    team_ids = list(dict.fromkeys(body.team_ids))
    for team_id in team_ids:
        if not db.execute("SELECT 1 FROM teams WHERE id = ?", (team_id,)).fetchone():
            raise HTTPException(404, "Tim tidak ditemukan")
    db.execute("DELETE FROM juri_assignments WHERE juri_id = ?", (juri_id,))
    db.executemany(
        "INSERT INTO juri_assignments (juri_id, team_id, assigned_by) VALUES (?, ?, ?)",
        [(juri_id, team_id, current_user.id) for team_id in team_ids],
    )
    log_action(
        db, actor_id=current_user.id, action="assign_juri", subject_user_id=juri_id
    )
    return {"juri_id": juri_id, "team_ids": team_ids}


@router.get("/settings")
def get_settings_values(
    current_user: CurrentUser = Depends(require_roles("superadmin")),
    db: sqlite3.Connection = Depends(get_db),
) -> dict:
    return {
        **public_settings(db),
        "privacy_policy_version": get_setting(db, "privacy_policy_version"),
        "privacy_policy_text": get_setting(db, "privacy_policy_text"),
    }


@router.put("/settings")
def update_settings_values(
    body: SettingsUpdate,
    current_user: CurrentUser = Depends(require_roles("superadmin")),
    db: sqlite3.Connection = Depends(get_db),
    _csrf: None = Depends(require_csrf),
) -> dict:
    changes = body.model_dump(exclude_unset=True)
    current = public_settings(db)
    minimum = changes.get("min_team_size") or current["min_team_size"]
    maximum = changes.get("max_team_size") or current["max_team_size"]
    if minimum > maximum:
        raise HTTPException(400, "Jumlah minimum anggota melebihi maksimum")
    for key, value in changes.items():
        if value is None:
            if key in ("registration_deadline", "submission_deadline"):
                set_setting(db, key, "", updated_by=current_user.id)
        else:
            set_setting(
                db,
                key,
                value.isoformat() if isinstance(value, datetime) else str(value),
                updated_by=current_user.id,
            )
    if changes:
        log_action(db, actor_id=current_user.id, action="update_settings")
    return public_settings(db)


@router.get("/audit-logs")
def list_audit_logs(
    current_user: CurrentUser = Depends(require_roles("superadmin")),
    db: sqlite3.Connection = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    actor_id: str | None = None,
    action: str | None = None,
    date_from: datetime | None = Query(None, alias="from"),
    date_to: datetime | None = Query(None, alias="to"),
) -> dict:
    conditions, args = [], []
    for column, value in [("actor_id", actor_id), ("action", action)]:
        if value:
            conditions.append(f"a.{column} = ?")
            args.append(value)
    for op, value in [(">=", date_from), ("<=", date_to)]:
        if value:
            conditions.append(f"julianday(a.created_at) {op} julianday(?)")
            args.append(value.isoformat())
    where = " AND ".join(conditions) or "1 = 1"
    total = db.execute(
        f"SELECT COUNT(*) FROM audit_logs a WHERE {where}", args
    ).fetchone()[0]
    rows = db.execute(
        f"SELECT a.*, u.role AS actor_role FROM audit_logs a LEFT JOIN users u ON u.id = a.actor_id WHERE {where} ORDER BY a.created_at DESC LIMIT ? OFFSET ?",
        [*args, page_size, (page - 1) * page_size],
    ).fetchall()
    items = []
    for row in rows:
        entry = dict(row)
        # Email aktor terenkripsi di items, jadi didekripsi per baris (bukan lewat JOIN).
        entry["actor_email"] = (
            get_email(db, row["actor_id"]) if row["actor_id"] else None
        )
        items.append(entry)
    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
    }


@router.get("/benchmarks")
def benchmarks(
    current_user: CurrentUser = Depends(require_roles("superadmin")),
    db: sqlite3.Connection = Depends(get_db),
    source: Literal["live", "controlled"] = "controlled",
    operation: Literal["enc", "dec", "hmac", "wrap"] | None = None,
    run_id: str | None = None,
) -> dict:
    try:
        return benchmark_summary(db, source=source, run_id=run_id, operation=operation)
    except LookupError as error:
        raise HTTPException(404, str(error)) from error
    except ValueError as error:
        raise HTTPException(409, str(error)) from error
