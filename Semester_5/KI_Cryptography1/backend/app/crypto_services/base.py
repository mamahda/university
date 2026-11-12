"""Kontrak bersama untuk ketiga metode enkripsi.

Setiap file cipher (aes256_ctr_hmac, des_ctr_hmac, rc4) mengekspor satu objek
`CipherSuite` bernama `SUITE`. Lapisan di atasnya (envelope/service) hanya
bergantung pada kontrak ini, bukan pada detail tiap algoritma, sehingga
menambah atau mengganti cipher tidak menyentuh kode lain.
"""

from collections.abc import Callable
from dataclasses import dataclass


@dataclass(frozen=True)
class EncryptedPayload:
    """Hasil enkripsi satu pesan.

    nonce: None untuk RC4 (stream cipher tanpa nonce).
    tag:   HMAC-SHA256 (32 byte) untuk ketiga cipher.
    """

    nonce: bytes | None
    ciphertext: bytes
    tag: bytes


@dataclass(frozen=True)
class CipherSuite:
    """Deskripsi satu metode enkripsi.

    enc_key_len / mac_key_len: panjang kunci data yang dibutuhkan (byte).
    mac_key_len = 0 berarti tidak ada HMAC (tidak dipakai cipher bawaan).
    encrypt(plaintext, enc_key, mac_key, aad) -> EncryptedPayload
    decrypt(payload, enc_key, mac_key, aad)   -> plaintext; IntegrityError jika HMAC gagal
    """

    name: str
    enc_key_len: int
    mac_key_len: int
    encrypt: Callable[..., EncryptedPayload]
    decrypt: Callable[..., bytes]

    @property
    def authenticated(self) -> bool:
        return self.mac_key_len > 0
