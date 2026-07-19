"""
Shared SlowAPI limiter instance.
Import `limiter` in both main.py (to register middleware) and
in any router that needs to apply @limiter.limit() decorators.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
