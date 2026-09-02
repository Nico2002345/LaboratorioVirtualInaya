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
