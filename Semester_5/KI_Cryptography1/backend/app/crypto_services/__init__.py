"""crypto_services: enkripsi/dekripsi AES-256-CTR+HMAC, DES-CTR+HMAC, dan RC4.

Modul ini murni kripto: tidak mengimpor FastAPI, SQLite, maupun konfigurasi
aplikasi. Penyimpanan hasilnya (tabel `ciphertexts`) ada di `app/db/ciphertexts.py`.

Lapisan:
  aes256_ctr_hmac.py / des_ctr_hmac.py / rc4.py (+HMAC)   fungsi encrypt() & decrypt() per metode
  base.py        kontrak CipherSuite & EncryptedPayload
  registry.py    nama cipher -> CipherSuite
  keyring.py     turunan KEK & kunci blind index dari ROOT_KEY
  envelope.py    kunci data acak per ciphertext, dibungkus AES-GCM (wrapped_keys)
  service.py     CryptoService: seal() / open() / email_index()
"""

from .envelope import SealedCiphertext
from .errors import CryptoError, IntegrityError, KeyConfigError, UnknownCipherError
from .registry import CIPHER_NAMES, get_suite
from .service import CryptoService

__all__ = [
    "CIPHER_NAMES",
    "CryptoError",
    "CryptoService",
    "IntegrityError",
    "KeyConfigError",
    "SealedCiphertext",
    "UnknownCipherError",
    "get_suite",
]
