"""RC4-drop3072 + HMAC-SHA256; pembacaan ciphertext RC4 lama tetap didukung."""

from Crypto.Cipher import ARC4

from .base import CipherSuite, EncryptedPayload
from ._mac import compute_tag, verify_tag
from .errors import IntegrityError
from .timing import Timings, measure

NAME = "rc4"
ENC_KEY_LEN = 16
MAC_KEY_LEN = 32
DROP_BYTES = 3072


def encrypt(
    plaintext: bytes,
    enc_key: bytes,
    mac_key: bytes,
    aad: bytes = b"",
    *,
    timings: Timings | None = None,
) -> EncryptedPayload:
    if len(mac_key) != MAC_KEY_LEN:
        raise ValueError("RC4 baru membutuhkan kunci HMAC 32 byte")
    with measure("enc", timings):
        ciphertext = ARC4.new(enc_key, drop=DROP_BYTES).encrypt(plaintext)
    with measure("hmac", timings):
        tag = compute_tag(mac_key, aad, b"", ciphertext)
    return EncryptedPayload(None, ciphertext, tag)


def decrypt(
    payload: EncryptedPayload,
    enc_key: bytes,
    mac_key: bytes = b"",
    aad: bytes = b"",
    *,
    timings: Timings | None = None,
) -> bytes:
    # Panjang kunci terbungkus diautentikasi GCM, sehingga tag kosong tidak bisa menurunkan format baru ke format lama.
    if not mac_key:
        if payload.tag:
            raise IntegrityError("Format RC4 lama tidak sesuai")
        with measure("dec", timings):
            plaintext = ARC4.new(enc_key).decrypt(payload.ciphertext)
        return plaintext
    with measure("hmac", timings):
        verify_tag(mac_key, aad, b"", payload.ciphertext, payload.tag)
    with measure("dec", timings):
        plaintext = ARC4.new(enc_key, drop=DROP_BYTES).decrypt(payload.ciphertext)
    return plaintext


SUITE = CipherSuite(NAME, ENC_KEY_LEN, MAC_KEY_LEN, encrypt, decrypt)
