"""Pemetaan nama cipher -> CipherSuite. Satu-satunya tempat yang tahu daftar cipher."""

from . import aes256_ctr_hmac, des_ctr_hmac, rc4
from .base import CipherSuite
from .errors import UnknownCipherError

SUITES: dict[str, CipherSuite] = {
    suite.name: suite
    for suite in (aes256_ctr_hmac.SUITE, des_ctr_hmac.SUITE, rc4.SUITE)
}
CIPHER_NAMES: tuple[str, ...] = tuple(SUITES)  # ('aes', 'des', 'rc4')


def get_suite(name: str) -> CipherSuite:
    try:
        return SUITES[name]
    except KeyError:
        raise UnknownCipherError(
            f"Cipher '{name}' tidak dikenal; pilihan: {', '.join(CIPHER_NAMES)}"
        ) from None
