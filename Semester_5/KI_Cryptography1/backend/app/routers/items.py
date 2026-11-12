"""Modul Submission dan File: karya tim, submit final, dan membuka file/item."""

import sqlite3
import re
from urllib.parse import quote, unquote

from fastapi import APIRouter, Depends, HTTPException, Request, Response, Header
from pydantic import BaseModel, field_validator
from starlette import status
from starlette.concurrency import run_in_threadpool

from app.core.config import Settings, get_settings
from app.core.security import CurrentUser, get_current_user, require_csrf
from app.db.audit import log_action
from app.db.items import (
    get_active_item,
    get_item,
    read_file,
    read_original_filename,
    read_text,
    save_file,
    write_item,
)
from app.db.settings_store import get_setting, is_past_deadline
from app.dependencies import get_db, read_upload
from app.db.views import item_meta, team_data

router = APIRouter(tags=["items"])

TEAM_FIELDS = ("proposal", "video", "repo_url")


class RepoUrlRequest(BaseModel):
    repo_url: str

    @field_validator("repo_url")
    @classmethod
    def _must_be_github(cls, value: str) -> str:
        if not re.fullmatch(r"https://github\.com/[^/\s?#]+/[^/\s?#]+", value):
            raise ValueError("repo_url harus link GitHub")
        return value


class SubmitFinalRequest(BaseModel):
    confirm: bool  # konfirmasi dua langkah: frontend minta konfirmasi dulu


def _get_editable_team(
    db: sqlite3.Connection, current_user: CurrentUser
) -> sqlite3.Row:
    """Tim yang dipimpin user ini, selama belum final dan tenggat belum lewat."""
    team = db.execute(
        "SELECT * FROM teams WHERE leader_id = ?", (current_user.id,)
    ).fetchone()
    if team is None:
        raise HTTPException(
            403,
            {
                "code": "not_leader",
                "message": "Hanya ketua tim yang bisa melakukan ini",
            },
        )
    if team["status"] == "final":
        raise HTTPException(
            409, {"code": "team_locked", "message": "Tim sudah submit final"}
        )
    if is_past_deadline(db):
        raise HTTPException(
            409,
            {"code": "deadline_passed", "message": "Tenggat pengumpulan sudah lewat"},
        )
    return team


@router.post("/teams/me/proposal", status_code=status.HTTP_201_CREATED)
async def upload_proposal(
    request: Request,
    filename: str = Header(alias="X-Filename"),
    current_user: CurrentUser = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
    settings: Settings = Depends(get_settings),
    _csrf: None = Depends(require_csrf),
) -> dict:
    team = _get_editable_team(db, current_user)
    filename = unquote(filename)
    data, ext, content_type = await read_upload(
        request, filename, {"pdf": "application/pdf"}, max_mb=10
    )
    await run_in_threadpool(
        save_file,
        db,
        field="proposal",
        data=data,
        ext=ext,
        content_type=content_type,
        storage_dir=settings.storage_dir_abs,
        owner_team_id=team["id"],
        original_filename=filename,
    )
    return item_meta(
        db, get_active_item(db, field="proposal", owner_team_id=team["id"])
    )


@router.post("/teams/me/video", status_code=status.HTTP_201_CREATED)
async def upload_video(
    request: Request,
    filename: str = Header(alias="X-Filename"),
    current_user: CurrentUser = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
    settings: Settings = Depends(get_settings),
    _csrf: None = Depends(require_csrf),
) -> dict:
    team = _get_editable_team(db, current_user)
    filename = unquote(filename)
    data, ext, content_type = await read_upload(
        request, filename, {"mp4": "video/mp4"}, max_mb=100
    )
    await run_in_threadpool(
        save_file,
        db,
        field="video",
        data=data,
        ext=ext,
        content_type=content_type,
        storage_dir=settings.storage_dir_abs,
        owner_team_id=team["id"],
        original_filename=filename,
    )
    return item_meta(db, get_active_item(db, field="video", owner_team_id=team["id"]))


@router.put("/teams/me/repo")
def set_repo_url(
    body: RepoUrlRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
    _csrf: None = Depends(require_csrf),
) -> dict:
    team = _get_editable_team(db, current_user)
    write_item(db, owner_team_id=team["id"], field="repo_url", value=body.repo_url)
    return {"repo_url": body.repo_url}


@router.post("/teams/me/finalize")
def submit_final(
    body: SubmitFinalRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
    _csrf: None = Depends(require_csrf),
) -> dict:
    if not body.confirm:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Konfirmasi dibutuhkan untuk submit final"
        )
    team = _get_editable_team(db, current_user)

    members = db.execute(
        "SELECT user_id FROM team_members WHERE team_id = ?", (team["id"],)
    ).fetchall()
    max_members = int(get_setting(db, "max_team_size"))
    data = team_data(db, team)
    if data["finalize_missing"] or len(members) > max_members:
        raise HTTPException(
            409,
            {
                "code": "finalize_requirements",
                "message": "Syarat submit final belum lengkap",
                "details": {"missing": data["finalize_missing"]},
            },
        )

    db.execute(
        "UPDATE teams SET status = 'final', finalized_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
        (team["id"],),
    )
    return {
        "team": team_data(
            db, db.execute("SELECT * FROM teams WHERE id = ?", (team["id"],)).fetchone()
        )
    }


def _content_disposition(kind: str, filename: str) -> str:
    ascii_name = filename.encode("ascii", "ignore").decode().replace('"', "") or "file"
    return f"{kind}; filename=\"{ascii_name}\"; filename*=utf-8''{quote(filename)}"


def _parse_range(header: str | None, size: int) -> tuple[int, int] | None:
    """Range `bytes=a-b` tunggal -> (awal, akhir) inklusif; None kalau tidak ada/tak valid."""
    match = re.fullmatch(r"bytes=(\d*)-(\d*)", (header or "").strip())
    if not match or not any(match.groups()):
        return None
    first, last = match.groups()
    if first == "":  # suffix: N byte terakhir
        start, end = max(size - int(last), 0), size - 1
    else:
        start, end = int(first), min(int(last) if last else size - 1, size - 1)
    return (start, end) if 0 <= start <= end < size else None


@router.get("/items/{item_id}")
def open_item(
    item_id: str,
    request: Request,
    download: bool = False,
    current_user: CurrentUser = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> Response:
    # Item yang tidak ada dan yang tidak boleh dibuka sama-sama dijawab 404.
    item = get_item(db, item_id)
    if item is None or item["shredded_at"] is not None:
        raise HTTPException(status.HTTP_404_NOT_FOUND)

    is_mine = item["owner_user_id"] == current_user.id
    if item["owner_team_id"] is not None:
        is_mine = (
            db.execute(
                "SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ?",
                (item["owner_team_id"], current_user.id),
            ).fetchone()
            is not None
        )

    can_open = is_mine or current_user.role == "superadmin"
    if not can_open and current_user.role == "juri" and item["field"] in TEAM_FIELDS:
        can_open = (
            db.execute(
                "SELECT 1 FROM teams JOIN juri_assignments ON teams.id = juri_assignments.team_id WHERE teams.id = ? AND teams.status = 'final' AND juri_id = ?",
                (item["owner_team_id"], current_user.id),
            ).fetchone()
            is not None
        )
    if not can_open:
        raise HTTPException(status.HTTP_404_NOT_FOUND)

    if not is_mine:
        log_action(
            db,
            actor_id=current_user.id,
            action=f"open_item:{item['field']}",
            item_id=item_id,
            subject_user_id=item["owner_user_id"],
        )

    headers = {"Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"}
    if item["storage"] == "db":
        return Response(
            read_text(db, item_id), media_type="text/plain", headers=headers
        )

    # File dibaca dari storage/ lalu didekripsi (HMAC diverifikasi) sebelum dikirim.
    data = read_file(db, item_id, settings.storage_dir_abs)
    filename = read_original_filename(db, item_id) or item["field"]
    headers["Content-Disposition"] = _content_disposition(
        "attachment" if download else "inline", filename
    )
    headers["Accept-Ranges"] = "bytes"
    if request.headers.get("range"):
        byte_range = _parse_range(request.headers["range"], len(data))
        if byte_range is None:
            headers["Content-Range"] = f"bytes */{len(data)}"
            return Response(status_code=416, headers=headers)
        start, end = byte_range
        headers["Content-Range"] = f"bytes {start}-{end}/{len(data)}"
        return Response(
            data[start : end + 1],
            status_code=206,
            media_type=item["content_type"],
            headers=headers,
        )
    return Response(data, media_type=item["content_type"], headers=headers)
