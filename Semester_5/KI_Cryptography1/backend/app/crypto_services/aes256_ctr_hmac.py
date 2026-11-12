"""AES-256 mode CTR + HMAC-SHA256 (encrypt-then-MAC).

Kunci data: 32 byte untuk AES + 32 byte untuk HMAC (dibuat acak per ciphertext
oleh lapisan envelope, bukan di sini). Nonce 8 byte + counter 64 bit.
"""

import secrets

from Crypto.Cipher import AES

from ._mac import compute_tag, verify_tag
from .base import CipherSuite, EncryptedPayload
from .timing import Timings, measure

NAME = "aes"
ENC_KEY_LEN = 32
MAC_KEY_LEN = 32
NONCE_LEN = 8


def encrypt(
    plaintext: bytes,
    enc_key: bytes,
    mac_key: bytes,
    aad: bytes = b"",
    *,
    timings: Timings | None = None,
) -> EncryptedPayload:
    nonce = secrets.token_bytes(NONCE_LEN)
    with measure("enc", timings):
        cipher = AES.new(enc_key, AES.MODE_CTR, nonce=nonce)
        ciphertext = cipher.encrypt(plaintext)
    with measure("hmac", timings):
        tag = compute_tag(mac_key, aad, nonce, ciphertext)
    return EncryptedPayload(nonce, ciphertext, tag)


def decrypt(
    payload: EncryptedPayload,
    enc_key: bytes,
    mac_key: bytes,
    aad: bytes = b"",
    *,
    timings: Timings | None = None,
) -> bytes:
    # Verifikasi HMAC dulu; ciphertext yang diubah tidak pernah didekripsi.
    with measure("hmac", timings):
        verify_tag(mac_key, aad, payload.nonce, payload.ciphertext, payload.tag)
    with measure("dec", timings):
        cipher = AES.new(enc_key, AES.MODE_CTR, nonce=payload.nonce)
        plaintext = cipher.decrypt(payload.ciphertext)
    return plaintext


SUITE = CipherSuite(NAME, ENC_KEY_LEN, MAC_KEY_LEN, encrypt, decrypt)
