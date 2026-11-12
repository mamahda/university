"""Instance Limiter bersama, dipakai main.py dan router yang perlu rate limit."""

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import get_settings

limiter = Limiter(key_func=get_remote_address, storage_uri=get_settings().ratelimit_storage_uri)
