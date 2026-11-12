import io
import zipfile
import re
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("JWT_SECRET_KEY", "test-only-secret-key-at-least-32-bytes")
    monkeypatch.setenv("ROOT_KEY", "test-only-root-key-at-least-32-characters")
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "app.db"))
    monkeypatch.setenv("STORAGE_DIR", str(tmp_path / "storage"))
    monkeypatch.setenv("SUPERADMIN_EMAIL", "admin@example.com")
    monkeypatch.setenv("SUPERADMIN_PASSWORD", "Password123!")
    from app.core.config import get_settings

    get_settings.cache_clear()
    from app import main

    monkeypatch.setattr(main, "settings", get_settings())
    monkeypatch.setattr(main.limiter, "enabled", False)
    with TestClient(main.app) as value:
        yield value
    get_settings.cache_clear()


def headers(client):
    return {"X-CSRF-Token": client.cookies.get("csrf_access_token", "")}


def login(client, email):
    response = client.post(
        "/api/auth/login", json={"email": email, "password": "Password123!"}
    )
    assert response.status_code == 200, response.text
    return response.json()["user"]


def register_complete(client, email):
    response = client.post(
        "/api/auth/register", json={"email": email, "password": "Password123!"}
    )
    assert response.status_code == 201, response.text
    user = response.json()["user"]
    policy = client.get("/api/policy").json()
    response = client.post(
        "/api/consent",
        json={"policy_version": policy["version"]},
        headers=headers(client),
    )
    assert response.status_code == 201, response.text
    response = client.put(
        "/api/profile",
        headers=headers(client),
        json={
            "full_name": "Peserta Dummy",
            "nim": "123456",
            "study_program": "Informatika",
            "institution": "ITS",
            "birth_date": "2001-01-01",
            "domicile": "Surabaya",
            "phone": "081234567890",
        },
    )
    assert response.status_code == 200, response.text
    assert response.json()["profile_complete"] is True
    for kind in ("ktp", "ktm", "twibbon"):
        response = client.post(
            f"/api/documents/{kind}",
            content=b"%PDF-1.4\ndummy",
            headers={
                **headers(client),
                "Content-Type": "application/octet-stream",
                "X-Filename": "dokumen.pdf",
            },
        )
        assert response.status_code == 201, response.text
        assert response.json()["original_filename"] == "dokumen.pdf"
    assert client.get("/api/documents").json()["documents_complete"] is True
    return user


def test_prd_and_frontend_endpoint_registry(client):
    paths = client.app.openapi()["paths"]
    expected = {
        ("PUT", "/api/auth/password"),
        ("DELETE", "/api/consent"),
        ("GET", "/api/me/items"),
        ("GET", "/api/me/access-log"),
        ("GET", "/api/me/export"),
        ("PUT", "/api/admin/juri/{id}/assignments"),
        ("GET", "/api/admin/settings"),
    }
    types_file = Path(__file__).resolve().parents[2] / "frontend/src/api/types.ts"
    expected.update(
        re.findall(
            r"'([A-Z]+) (/api/[^']+)': EndpointContract",
            types_file.read_text(encoding="utf-8"),
        )
    )
    normalize = lambda path: re.sub(r"\{[^}]+\}", "{}", path)
    actual = {
        (method.upper(), normalize(path))
        for path, methods in paths.items()
        for method in methods
    }
    missing = {
        (method, path)
        for method, path in expected
        if (method, normalize(path)) not in actual
    }
    assert not missing, f"Missing routes: {sorted(missing)}"
    source = (types_file.parent / "client.ts").read_text(encoding="utf-8")
    calls = re.findall(
        r"fetchApi(?:<[\s\S]*?>)?\(\s*(['`])(/api/.*?)\1\s*,\s*\{\s*method:\s*'([A-Z]+)'",
        source,
        re.S,
    )
    uploads = re.findall(
        r"uploadFileWithProgress(?:<[^>]+>)?\(\s*(['`])(/api/.*?)\1", source, re.S
    )
    requests = [(method, path) for _, path, method in calls] + [
        ("POST", path) for _, path in uploads
    ]
    assert len(requests) >= 30
    for method, path in requests:
        normalized = normalize(re.sub(r"\$\{[^}]+\}", "{}", path))
        assert (method, normalized) in actual, (
            f"Frontend calls unsupported {method} {path}"
        )


def test_participant_flow_and_assigned_judge_access(client):
    register_complete(client, "leader@example.com")
    response = client.post(
        "/api/teams", json={"name": "Tim Dummy"}, headers=headers(client)
    )
    assert response.status_code == 201, response.text
    team = response.json()["team"]
    register_complete(client, "member@example.com")
    response = client.post(
        "/api/teams/join", json={"code": team["code"]}, headers=headers(client)
    )
    assert response.status_code == 200, response.text
    login(client, "leader@example.com")
    for kind, filename, data in [
        ("proposal", "proposal.pdf", b"%PDF-1.4\ndummy"),
        ("video", "video.mp4", b"\x00\x00\x00\x18ftypmp42dummy"),
    ]:
        response = client.post(
            f"/api/teams/me/{kind}",
            content=data,
            headers={**headers(client), "X-Filename": filename},
        )
        assert response.status_code == 201, response.text
    response = client.put(
        "/api/teams/me/repo",
        json={"repo_url": "https://github.com/team/repo"},
        headers=headers(client),
    )
    assert response.status_code == 200, response.text
    response = client.post(
        "/api/teams/me/finalize", json={"confirm": True}, headers=headers(client)
    )
    assert response.status_code == 200, response.text
    proposal_id = response.json()["team"]["submission"]["proposal"]["item_id"]
    personal_document = client.get("/api/documents").json()["ktp"]["item_id"]
    response = client.put(
        "/api/teams/me/repo",
        json={"repo_url": "https://github.com/team/changed"},
        headers=headers(client),
    )
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "team_locked"
    login(client, "admin@example.com")
    response = client.post(
        "/api/admin/juri",
        json={"email": "judge@example.com", "password": "Password123!"},
        headers=headers(client),
    )
    assert response.status_code == 201, response.text
    judge_id = response.json()["user_id"]
    login(client, "judge@example.com")
    assert client.get("/api/juri/teams").json() == {"teams": []}
    assert client.get(f"/api/juri/teams/{team['id']}").status_code == 404
    assert client.get(f"/api/items/{proposal_id}").status_code == 404
    login(client, "admin@example.com")
    response = client.put(
        f"/api/admin/juri/{judge_id}/assignments",
        json={"team_ids": [team["id"]]},
        headers=headers(client),
    )
    assert response.status_code == 200, response.text
    assert client.get("/api/admin/juri").json()["juri"][0]["team_ids"] == [team["id"]]
    login(client, "judge@example.com")
    assert client.get("/api/juri/teams").json()["teams"][0]["id"] == team["id"]
    assert client.get(f"/api/juri/teams/{team['id']}").status_code == 200
    response = client.get(f"/api/items/{proposal_id}?download=1")
    assert response.status_code == 200
    assert "attachment" in response.headers["content-disposition"]
    assert response.headers["cache-control"] == "no-store"
    assert client.get(f"/api/items/{personal_document}").status_code == 404


def test_errors_csrf_and_admin_contract(client):
    response = client.get("/api/me")
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "unauthenticated"
    assert client.get("/api/settings").json()["registration_deadline"] is None
    response = client.post(
        "/api/auth/login",
        json={"email": "missing@example.com", "password": "Password123!"},
    )
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "invalid_credentials"
    register_complete(client, "participant@example.com")
    assert (
        client.put("/api/profile", json={"full_name": "Changed"}).json()["error"][
            "code"
        ]
        == "csrf_failed"
    )
    login(client, "admin@example.com")
    assert client.get("/api/admin/participants?page=1&page_size=1").json()["total"] == 1
    assert client.get("/api/admin/benchmarks").json()["rows"] == []
    assert client.get("/api/admin/audit-logs?page=1").json()["page"] == 1


def test_admin_settings_verification_and_consent_withdrawal(client):
    user = register_complete(client, "withdraw@example.com")
    archive = client.get("/api/me/export")
    assert archive.status_code == 200
    with zipfile.ZipFile(io.BytesIO(archive.content)) as data:
        assert "profile.json" in data.namelist()
        assert len(data.namelist()) == 4
    assert len(client.get("/api/me/items").json()["items"]) == 10
    login(client, "admin@example.com")
    detail = client.get(f"/api/admin/participants/{user['id']}").json()
    assert detail["documents"]["documents_complete"] is True
    response = client.patch(
        f"/api/admin/participants/{user['id']}",
        json={"verification_status": "ditolak", "note": "Perbaiki dokumen"},
        headers=headers(client),
    )
    assert response.status_code == 200, response.text
    assert response.json()["verification_note"] == "Perbaiki dokumen"
    response = client.put(
        "/api/admin/settings",
        json={
            "registration_deadline": "2000-01-01T00:00:00Z",
            "submission_deadline": "2099-01-01T00:00:00Z",
            "min_team_size": 2,
            "max_team_size": 4,
        },
        headers=headers(client),
    )
    assert response.status_code == 200
    assert response.json()["max_team_size"] == 4
    login(client, "withdraw@example.com")
    assert client.get("/api/profile").json()["verification_note"] == "Perbaiki dokumen"
    response = client.post(
        "/api/teams", json={"name": "Late team"}, headers=headers(client)
    )
    assert response.json()["error"]["code"] == "deadline_passed"
    token = client.cookies.get("access_token")
    assert client.delete("/api/consent", headers=headers(client)).status_code == 204
    client.cookies.set("access_token", token)
    assert client.get("/api/me").status_code == 401


def test_existing_database_migrates_without_data_loss(tmp_path):
    from contextlib import closing
    from app.db.database import connect_db, migrate_db, MIGRATIONS

    database_path = tmp_path / "old.db"
    with closing(connect_db(database_path)) as db:
        db.executescript((MIGRATIONS / "001_initial.sql").read_text(encoding="utf-8"))
        db.execute(
            "INSERT INTO users (id, email_index, password_hash, role) VALUES ('old-user', X'0102', 'dummy-hash', 'peserta')"
        )
        db.execute(
            "INSERT INTO items (id, owner_user_id, field, storage, size_bytes) VALUES ('old-item', 'old-user', 'full_name', 'db', 9)"
        )
        db.commit()
    migrate_db(database_path)
    migrate_db(database_path)
    with closing(connect_db(database_path)) as db:
        assert db.execute("PRAGMA user_version").fetchone()[0] == 2
        assert (
            db.execute("SELECT size_bytes FROM items WHERE id = 'old-item'").fetchone()[
                0
            ]
            == 9
        )
        assert (
            db.execute("SELECT disabled FROM users WHERE id = 'old-user'").fetchone()[0]
            == 0
        )


def test_benchmark_summary_and_audit_filter(client):
    login(client, "admin@example.com")
    from app.db.database import connect_db
    from app.core.config import get_settings
    from contextlib import closing
    import json

    with closing(connect_db(get_settings().database_path_abs)) as db:
        env = {"cpu": "test", "aes_ni": False, "python": "test", "pycryptodome": "test"}
        for number, duration in enumerate([100, 200, 300]):
            db.execute(
                "INSERT INTO benchmark_runs (id, run_id, cipher, operation, field, size_bytes, duration_ns, source, env) VALUES (?, 'run', 'aes', 'enc', 'proposal', 1024, ?, 'controlled', ?)",
                (str(number), duration, json.dumps(env)),
            )
        db.commit()
    summary = client.get("/api/admin/benchmarks?source=controlled&operation=enc").json()
    assert summary["rows"][0]["median_ns"] == 200
    assert summary["rows"][0]["n"] == 3
    live = client.get("/api/admin/benchmarks?source=live").json()
    assert live["rows"]
    assert live["source"] == "live"
    assert client.get("/api/admin/benchmarks?run_id=missing").status_code == 404
    assert client.get("/api/admin/audit-logs?action=missing").json()["items"] == []
