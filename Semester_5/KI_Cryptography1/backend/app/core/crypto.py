"""Menghubungkan konfigurasi (.env) ke modul crypto_services."""

from functools import lru_cache

from app.core.config import get_settings
from app.crypto_services import CryptoService, KeyConfigError


@lru_cache
def _build(
    root_key: str, version: int, ciphers: tuple[str, ...]
) -> CryptoService:
    return CryptoService(root_key, key_version=version, ciphers=ciphers)


def get_crypto_service() -> CryptoService:
    """CryptoService bersama. Dibuat ulang otomatis kalau Settings berubah (tes)."""
    settings = get_settings()
    if not settings.root_key:
        raise KeyConfigError("ROOT_KEY belum diisi di .env")
    return _build(
        settings.root_key,
        settings.root_key_version,
        tuple(settings.crypto_cipher_list),
    )
