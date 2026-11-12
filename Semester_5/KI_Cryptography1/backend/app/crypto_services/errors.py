"""Exception khusus modul kripto. Tidak bergantung pada FastAPI maupun database."""


class CryptoError(Exception):
    """Akar semua error modul kripto."""


class IntegrityError(CryptoError):
    """HMAC atau tag GCM tidak cocok: data/kunci berubah atau konteksnya salah."""


class UnknownCipherError(CryptoError):
    """Nama cipher bukan salah satu dari 'aes', 'des', 'rc4'."""


class KeyConfigError(CryptoError):
    """ROOT_KEY kosong/terlalu pendek, atau versi kunci tidak tersedia."""
