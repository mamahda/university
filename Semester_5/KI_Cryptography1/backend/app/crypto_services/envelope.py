"""Envelope encryption: kunci data acak per ciphertext, dibungkus dengan KEK.

Alur seal:
  1. Buat kunci data acak (enc_key || mac_key) sesuai kebutuhan cipher.
  2. Enkripsi plaintext dengan cipher tsb (+ HMAC bila ada).
  3. Bungkus kunci data dengan AES-256-GCM memakai KEK -> wrapped_keys + wrap_tag.

Semua kolom hasilnya sama dengan tabel `ciphertexts`. Konteks (mis. id item)
masuk ke AAD HMAC dan AAD GCM, sehingga ciphertext tidak bisa dipindah ke item
lain tanpa terdeteksi (untuk cipher ber-HMAC dan untuk pembungkus kunci).
"""

import secrets
from dataclasses import dataclass

from Crypto.Cipher import AES

from .base import CipherSuite, EncryptedPayload
from .errors import IntegrityError
from .timing import Timings, measure

WRAP_NONCE_LEN = 12
WRAP_TAG_LEN = 16


@dataclass(frozen=True)
class SealedCiphertext:
    cipher: str
    nonce: bytes | None
    wrap_nonce: bytes
    wrapped_keys: bytes
    wrap_tag: bytes
    key_version: int
    hmac_tag: bytes
    ciphertext: bytes


def build_aad(context: str, cipher: str, key_version: int) -> bytes:
    return f"{context}|{cipher}|{key_version}".encode("utf-8")


def wrap_keys(kek: bytes, keys: bytes, aad: bytes) -> tuple[bytes, bytes, bytes]:
    """AES-256-GCM. Kembalikan (wrap_nonce, wrapped_keys, wrap_tag)."""
    wrap_nonce = secrets.token_bytes(WRAP_NONCE_LEN)
    gcm = AES.new(kek, AES.MODE_GCM, nonce=wrap_nonce, mac_len=WRAP_TAG_LEN)
    gcm.update(aad)
    wrapped, tag = gcm.encrypt_and_digest(keys)
    return wrap_nonce, wrapped, tag


def unwrap_keys(
    kek: bytes, wrap_nonce: bytes, wrapped: bytes, tag: bytes, aad: bytes
) -> bytes:
    gcm = AES.new(kek, AES.MODE_GCM, nonce=wrap_nonce, mac_len=WRAP_TAG_LEN)
    gcm.update(aad)
    try:
        return gcm.decrypt_and_verify(wrapped, tag)
    except ValueError as exc:
        raise IntegrityError(
            "Kunci data gagal dibuka: tag pembungkus tidak cocok"
        ) from exc


def _split(keys: bytes, suite: CipherSuite) -> tuple[bytes, bytes]:
    return keys[: suite.enc_key_len], keys[suite.enc_key_len :]


def seal(
    suite: CipherSuite,
    plaintext: bytes,
    *,
    kek: bytes,
    key_version: int,
    context: str,
    timings: Timings | None = None,
) -> SealedCiphertext:
    aad = build_aad(context, suite.name, key_version)
    keys = secrets.token_bytes(suite.enc_key_len + suite.mac_key_len)
    enc_key, mac_key = _split(keys, suite)
    payload = suite.encrypt(plaintext, enc_key, mac_key, aad, timings=timings)
    with measure("wrap", timings):
        wrap_nonce, wrapped, wrap_tag = wrap_keys(kek, keys, aad)
    return SealedCiphertext(
        cipher=suite.name,
        nonce=payload.nonce,
        wrap_nonce=wrap_nonce,
        wrapped_keys=wrapped,
        wrap_tag=wrap_tag,
        key_version=key_version,
        hmac_tag=payload.tag,
        ciphertext=payload.ciphertext,
    )


def open_sealed(
    suite: CipherSuite,
    sealed: SealedCiphertext,
    *,
    kek: bytes,
    context: str,
    timings: Timings | None = None,
) -> bytes:
    aad = build_aad(context, suite.name, sealed.key_version)
    keys = unwrap_keys(
        kek, sealed.wrap_nonce, sealed.wrapped_keys, sealed.wrap_tag, aad
    )
    enc_key, mac_key = _split(keys, suite)
    payload = EncryptedPayload(sealed.nonce, sealed.ciphertext, sealed.hmac_tag)
    return suite.decrypt(payload, enc_key, mac_key, aad, timings=timings)
