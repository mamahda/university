"""Turunan kunci dari ROOT_KEY (HKDF-SHA256).

ROOT_KEY sendiri tidak pernah dipakai langsung untuk mengenkripsi data. Dari
situ diturunkan dua kunci dengan label berbeda (domain separation):
  - KEK (key-encryption key): membungkus kunci data tiap ciphertext.
  - kunci blind index: HMAC untuk pencarian email tanpa menyimpan email.
"""

import hmac

from Crypto.Hash import SHA256
from Crypto.Protocol.KDF import HKDF

from .errors import KeyConfigError

MIN_ROOT_KEY_CHARS = 32
_SALT = b"schematics-nic/crypto_services/v1"


class Keyring:
    def __init__(self, root_key: str, version: int = 1) -> None:
        if not root_key or len(root_key) < MIN_ROOT_KEY_CHARS:
            raise KeyConfigError(
                f"ROOT_KEY wajib diisi minimal {MIN_ROOT_KEY_CHARS} karakter. "
                'Buat dengan: python -c "import secrets; print(secrets.token_hex(32))"'
            )
        if version < 1:
            raise KeyConfigError("Versi kunci harus >= 1")
        self._root = root_key.encode("utf-8")
        self.version = version
        self._kek = self._derive(f"kek/v{version}")
        self._index_key = self._derive("email-index/v1")

    def _derive(self, label: str) -> bytes:
        return HKDF(
            self._root, 32, _SALT, SHA256, 1, context=label.encode("ascii")
        )

    def kek(self, version: int) -> bytes:
        """KEK untuk versi tertentu. Hanya versi aktif yang tersedia."""
        if version != self.version:
            raise KeyConfigError(f"Versi kunci {version} tidak tersedia")
        return self._kek

    def blind_index(self, value: str) -> bytes:
        """HMAC-SHA256 deterministik; dipakai sebagai `users.email_index`."""
        return hmac.digest(self._index_key, value.encode("utf-8"), "sha256")
