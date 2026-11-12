"""Fasad kripto: satu objek yang dipegang aplikasi.

CryptoService tidak tahu soal SQLite, FastAPI, ataupun .env. Ia hanya menerima
ROOT_KEY dan daftar cipher yang aktif.
"""

from collections.abc import Sequence

from . import envelope
from .envelope import SealedCiphertext
from .errors import KeyConfigError
from .keyring import Keyring
from .registry import CIPHER_NAMES, get_suite
from .timing import Timings


class CryptoService:
    def __init__(
        self,
        root_key: str,
        *,
        key_version: int = 1,
        ciphers: Sequence[str] = CIPHER_NAMES,
    ) -> None:
        self._keyring = Keyring(root_key, key_version)
        self.ciphers: tuple[str, ...] = tuple(dict.fromkeys(ciphers))
        if not self.ciphers:
            raise KeyConfigError("Minimal satu cipher harus aktif")
        for name in self.ciphers:
            get_suite(name)  # UnknownCipherError kalau salah ketik
        self.key_version = key_version

    def seal(
        self,
        plaintext: bytes,
        *,
        cipher: str,
        context: str,
        timings: Timings | None = None,
    ) -> SealedCiphertext:
        """Enkripsi `plaintext` dengan `cipher`. `context` = id item."""
        return envelope.seal(
            get_suite(cipher),
            plaintext,
            kek=self._keyring.kek(self.key_version),
            key_version=self.key_version,
            context=context,
            timings=timings,
        )

    def open(
        self, sealed: SealedCiphertext, *, context: str, timings: Timings | None = None
    ) -> bytes:
        """Dekripsi; IntegrityError kalau HMAC/tag tidak cocok."""
        return envelope.open_sealed(
            get_suite(sealed.cipher),
            sealed,
            kek=self._keyring.kek(sealed.key_version),
            context=context,
            timings=timings,
        )

    def email_index(self, email: str) -> bytes:
        """Blind index email (sudah dinormalisasi: strip + lowercase)."""
        return self._keyring.blind_index(email.strip().lower())
