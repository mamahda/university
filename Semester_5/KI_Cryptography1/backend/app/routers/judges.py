"""Daftar dan detail tim final yang ditugaskan kepada juri."""

import sqlite3

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import CurrentUser, require_roles
from app.db.audit import log_action
from app.db.items import read_item
from app.db.views import team_data
from app.dependencies import get_db

router = APIRouter(prefix="/juri", tags=["juri"])


@router.get("/teams")
def list_final_teams(
    current_user: CurrentUser = Depends(require_roles("juri")),
    db: sqlite3.Connection = Depends(get_db),
) -> dict:
    rows = db.execute(
        "SELECT t.* FROM teams t JOIN juri_assignments a ON t.id = a.team_id WHERE a.juri_id = ? AND t.status = 'final' ORDER BY t.finalized_at",
        (current_user.id,),
    ).fetchall()
    teams = []
    for row in rows:
        count = db.execute(
            "SELECT COUNT(*) FROM team_members WHERE team_id = ?", (row["id"],)
        ).fetchone()[0]
        teams.append(
            {
                "id": row["id"],
                "name": read_item(db, owner_team_id=row["id"], field="team_name") or "",
                "finalized_at": row["finalized_at"],
                "member_count": count,
            }
        )
    return {"teams": teams}


@router.get("/teams/{team_id}")
def get_final_team_detail(
    team_id: str,
    current_user: CurrentUser = Depends(require_roles("juri")),
    db: sqlite3.Connection = Depends(get_db),
) -> dict:
    row = db.execute(
        "SELECT t.* FROM teams t JOIN juri_assignments a ON t.id = a.team_id WHERE t.id = ? AND a.juri_id = ? AND t.status = 'final'",
        (team_id, current_user.id),
    ).fetchone()
    if row is None:
        raise HTTPException(404, "Tim tidak ditemukan")
    team = team_data(db, row)
    members = []
    for member in team["members"]:
        members.append(
            {
                "full_name": member["full_name"],
                "institution": read_item(
                    db, owner_user_id=member["user_id"], field="institution"
                ),
                "is_leader": member["is_leader"],
            }
        )
        log_action(
            db,
            actor_id=current_user.id,
            action="view_profile",
            subject_user_id=member["user_id"],
        )
    return {
        "team": {
            "id": row["id"],
            "name": team["name"],
            "finalized_at": row["finalized_at"],
            "members": members,
            **team["submission"],
        }
    }
