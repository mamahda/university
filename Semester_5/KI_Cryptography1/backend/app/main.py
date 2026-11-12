"""Entry point FastAPI. Jalankan dengan `python run.py` dari folder backend/."""

from contextlib import asynccontextmanager, closing

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from slowapi.errors import RateLimitExceeded

from app.core.config import get_settings
from app.core.crypto import get_crypto_service
from app.core.limiter import limiter
from app.core.security import password_hasher
from app.db.database import connect_db, migrate_db
from app.db.users import create_user, email_taken
from app.routers import (
    account,
    admin,
    auth,
    documents,
    items,
    judges,
    privacy,
    profile,
    teams,
)

settings = get_settings()


def _seed_superadmin() -> None:
    """Buat akun superadmin pertama dari SUPERADMIN_EMAIL/PASSWORD di .env,
    kalau belum ada peserta dengan email itu. Dipakai sekali saat setup awal."""
    if not settings.superadmin_email or not settings.superadmin_password:
        return

    with closing(connect_db(settings.database_path_abs)) as connection:
        if email_taken(connection, settings.superadmin_email):
            return

        create_user(
            connection,
            email=settings.superadmin_email,
            password_hash=password_hasher.hash(settings.superadmin_password),
            role="superadmin",
            verification_status="terverifikasi",
        )
        connection.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_crypto_service()  # gagal cepat kalau ROOT_KEY kosong/pendek
    migrate_db(settings.database_path_abs)
    settings.storage_dir_abs.mkdir(parents=True, exist_ok=True)
    _seed_superadmin()
    yield


app = FastAPI(title="Schematics NIC API", lifespan=lifespan)
app.state.limiter = limiter


@app.exception_handler(StarletteHTTPException)
async def api_error(request: Request, exc: StarletteHTTPException):
    defaults = {
        400: "validation_error",
        401: "unauthenticated",
        403: "forbidden",
        404: "not_found",
        409: "conflict",
        413: "too_large",
        415: "unsupported_type",
        429: "rate_limited",
    }
    error = (
        exc.detail
        if isinstance(exc.detail, dict)
        else {
            "code": defaults.get(exc.status_code, "internal_error"),
            "message": str(exc.detail),
        }
    )
    return JSONResponse(
        {"error": error}, status_code=exc.status_code, headers=exc.headers
    )


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError):
    fields = {str(error["loc"][-1]): error["msg"] for error in exc.errors()}
    return JSONResponse(
        {
            "error": {
                "code": "validation_error",
                "message": "Data tidak valid",
                "details": {"fields": fields},
            }
        },
        status_code=400,
    )


@app.exception_handler(RateLimitExceeded)
async def rate_limit_error(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        {
            "error": {
                "code": "rate_limited",
                "message": "Terlalu banyak percobaan, coba lagi nanti",
            }
        },
        status_code=429,
    )


@app.exception_handler(Exception)
async def internal_error(request: Request, exc: Exception):
    return JSONResponse(
        {"error": {"code": "internal_error", "message": "Terjadi kesalahan server"}},
        status_code=500,
    )


for router in (
    auth.router,
    account.router,
    privacy.router,
    profile.router,
    documents.router,
    teams.router,
    items.router,
    judges.router,
    admin.router,
):
    app.include_router(router, prefix="/api")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
