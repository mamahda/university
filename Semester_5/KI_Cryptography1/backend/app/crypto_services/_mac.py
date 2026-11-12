"""HMAC-SHA256 untuk skema encrypt-then-MAC (dipakai AES, DES, dan RC4).

Yang diautentikasi: panjang AAD + AAD + nonce + ciphertext. Panjang AAD
disertakan supaya batas antara AAD dan nonce tidak ambigu.
"""

import hmac
import struct

from .errors import IntegrityError

TAG_LEN = 32


def compute_tag(mac_key: bytes, aad: bytes, nonce: bytes, ciphertext: bytes) -> bytes:
    mac = hmac.new(mac_key, digestmod="sha256")
    mac.update(struct.pack(">Q", len(aad)))
    mac.update(aad)
    mac.update(nonce)
    mac.update(ciphertext)
    return mac.digest()


def verify_tag(
    mac_key: bytes, aad: bytes, nonce: bytes, ciphertext: bytes, tag: bytes
) -> None:
    """Lempar IntegrityError jika tag tidak cocok (perbandingan constant-time)."""
    expected = compute_tag(mac_key, aad, nonce, ciphertext)
    if not hmac.compare_digest(expected, tag):
        raise IntegrityError("HMAC tidak cocok: data rusak atau diubah")
