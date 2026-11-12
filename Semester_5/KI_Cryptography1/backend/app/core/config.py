"""Konfigurasi aplikasi dari environment variable (lihat backend/.env.example)."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Kunci induk untuk modul crypto_services (wajib, minimal 32 karakter).
    root_key: str | None = None
    root_key_version: int = 1
    # Cipher yang dipakai menyimpan tiap item (satu baris `ciphertexts` per cipher).
    # Saat membaca dipakai cipher pertama dalam daftar ini yang tersedia.
    crypto_ciphers: str = "aes,des,rc4"
    jwt_secret_key: str
    jwt_cookie_secure: bool = False

    database_path: str = "data/schematics.db"
    storage_dir: str = "storage"

    ratelimit_storage_uri: str = "memory://"

    app_debug: bool = True
    app_host: str = "127.0.0.1"
    app_port: int = 8000

    superadmin_email: str | None = None
    superadmin_password: str | None = None

    @property
    def crypto_cipher_list(self) -> list[str]:
        return [name.strip().lower() for name in self.crypto_ciphers.split(",") if name.strip()]

    @property
    def database_path_abs(self) -> Path:
        path = Path(self.database_path)
        return path if path.is_absolute() else BACKEND_DIR / path

    @property
    def storage_dir_abs(self) -> Path:
        path = Path(self.storage_dir)
        return path if path.is_absolute() else BACKEND_DIR / path


@lru_cache
def get_settings() -> Settings:
    return Settings()
