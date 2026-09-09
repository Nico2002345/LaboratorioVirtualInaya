from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Rol, Usuario


class LoginTests(APITestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="ana@labvirtual.local", password="Clave12345", rol=Rol.ESTUDIANTE,
            first_name="Ana", last_name="Ruiz",
        )

    def test_login_correcto_devuelve_tokens_con_rol(self):
        response = self.client.post(
            "/api/auth/login/", {"email": "ana@labvirtual.local", "password": "Clave12345"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertEqual(response.data["usuario"]["rol"], Rol.ESTUDIANTE)

    def test_login_con_password_incorrecta_falla(self):
        response = self.client.post(
            "/api/auth/login/", {"email": "ana@labvirtual.local", "password": "incorrecta"}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_requiere_autenticacion(self):
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_autenticado_devuelve_datos_propios(self):
        self.client.force_authenticate(user=self.usuario)
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "ana@labvirtual.local")


class ResetPasswordTests(APITestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="ana@labvirtual.local", password="Clave12345", rol=Rol.ESTUDIANTE,
            first_name="Ana", last_name="Ruiz",
        )

    def test_solicitar_reset_con_email_existente_envia_correo(self):
        response = self.client.post("/api/auth/olvide-password/", {"email": "ana@labvirtual.local"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("ana@labvirtual.local", mail.outbox[0].to)

    def test_solicitar_reset_con_email_inexistente_no_revela_nada(self):
        response = self.client.post("/api/auth/olvide-password/", {"email": "nadie@labvirtual.local"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)

    def test_confirmar_reset_con_token_valido_cambia_password(self):
        uid = urlsafe_base64_encode(force_bytes(self.usuario.pk))
        token = default_token_generator.make_token(self.usuario)

        response = self.client.post(
            "/api/auth/restablecer-password/",
            {"uid": uid, "token": token, "password_nueva": "NuevaClave123"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.usuario.refresh_from_db()
        self.assertTrue(self.usuario.check_password("NuevaClave123"))

    def test_confirmar_reset_con_token_invalido_falla(self):
        uid = urlsafe_base64_encode(force_bytes(self.usuario.pk))

        response = self.client.post(
            "/api/auth/restablecer-password/",
            {"uid": uid, "token": "token-invalido", "password_nueva": "NuevaClave123"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
