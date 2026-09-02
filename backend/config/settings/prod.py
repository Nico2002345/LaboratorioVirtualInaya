from .base import *  # noqa: F401,F403

DEBUG = False

if not ALLOWED_HOSTS:  # noqa: F405
    raise RuntimeError("DJANGO_ALLOWED_HOSTS debe estar definido en producción")

# Por defecto en False: muchos despliegues escolares corren en LAN sin TLS propio.
# Activar estas variables de entorno cuando haya HTTPS (ej. detrás de un proxy con certificado).
SECURE_SSL_REDIRECT = os.environ.get("DJANGO_SECURE_SSL_REDIRECT", "False") == "True"  # noqa: F405
SESSION_COOKIE_SECURE = os.environ.get("DJANGO_SESSION_COOKIE_SECURE", "False") == "True"  # noqa: F405
CSRF_COOKIE_SECURE = os.environ.get("DJANGO_CSRF_COOKIE_SECURE", "False") == "True"  # noqa: F405
