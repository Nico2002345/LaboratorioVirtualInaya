"""Backend de correo que usa la API HTTPS de Resend en vez de SMTP.

Railway bloquea las conexiones SMTP salientes en los planes Free/Trial/Hobby
para prevenir spam, así que el backend SMTP estándar de Django no funciona
ahí. Resend (y servicios similares) exponen una API HTTPS, que sí funciona
en cualquier plan.
"""
import json
import urllib.error
import urllib.request

from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend

API_URL = "https://api.resend.com/emails"


class ResendEmailBackend(BaseEmailBackend):
    def send_messages(self, email_messages):
        if not email_messages:
            return 0

        enviados = 0
        for mensaje in email_messages:
            payload = json.dumps(
                {
                    "from": mensaje.from_email,
                    "to": list(mensaje.to),
                    "subject": mensaje.subject,
                    "text": mensaje.body,
                }
            ).encode()

            request = urllib.request.Request(
                API_URL,
                data=payload,
                headers={
                    "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                    "Content-Type": "application/json",
                    # Cloudflare (delante de la API de Resend) rechaza el User-Agent por
                    # defecto de urllib ("Python-urllib/3.x") como firma de bot (error 1010).
                    "User-Agent": "LaboratorioVirtual/1.0 (+https://resend.com)",
                },
                method="POST",
            )
            try:
                urllib.request.urlopen(request)
                enviados += 1
            except urllib.error.HTTPError as error:
                if not self.fail_silently:
                    detalle = error.read().decode(errors="replace")
                    raise RuntimeError(f"Resend respondió {error.code}: {detalle}") from error

        return enviados
