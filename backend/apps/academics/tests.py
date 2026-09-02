from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import Rol, Usuario

from .models import Estudiante, Grado, Profesor


class AcademicsPermisosTests(APITestCase):
    def setUp(self):
        self.grado8 = Grado.objects.create(nombre="8°", orden=1)
        self.grado9 = Grado.objects.create(nombre="9°", orden=2)

        self.admin = Usuario.objects.create_superuser(email="admin@labvirtual.local", password="Clave12345")

        self.profesor_usuario = Usuario.objects.create_user(
            email="prof@labvirtual.local", password="Clave12345", rol=Rol.PROFESOR
        )
        self.profesor = Profesor.objects.create(usuario=self.profesor_usuario)
        self.profesor.grados.set([self.grado8])

        self.estudiante8_usuario = Usuario.objects.create_user(
            email="est8@labvirtual.local", password="Clave12345", rol=Rol.ESTUDIANTE
        )
        self.estudiante8 = Estudiante.objects.create(usuario=self.estudiante8_usuario, grado=self.grado8)

        self.estudiante9_usuario = Usuario.objects.create_user(
            email="est9@labvirtual.local", password="Clave12345", rol=Rol.ESTUDIANTE
        )
        Estudiante.objects.create(usuario=self.estudiante9_usuario, grado=self.grado9)

    def test_registro_publico_crea_estudiante_con_el_grado_elegido(self):
        response = self.client.post(
            "/api/academics/estudiantes/registro/",
            {
                "email": "nuevo@labvirtual.local",
                "password": "Clave12345",
                "first_name": "Luis",
                "last_name": "Gomez",
                "grado": self.grado9.id,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        creado = Usuario.objects.get(email="nuevo@labvirtual.local")
        self.assertEqual(creado.rol, Rol.ESTUDIANTE)
        self.assertEqual(creado.estudiante.grado, self.grado9)

    def test_editar_grado_requiere_admin(self):
        self.client.force_authenticate(user=self.profesor_usuario)
        response = self.client.patch(f"/api/academics/grados/{self.grado8.id}/", {"descripcion": "x"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(f"/api/academics/grados/{self.grado8.id}/", {"descripcion": "x"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_profesor_solo_ve_estudiantes_de_sus_grados_asignados(self):
        self.client.force_authenticate(user=self.profesor_usuario)
        response = self.client.get("/api/academics/estudiantes/")
        emails = [e["usuario"]["email"] for e in response.data["results"]]
        self.assertIn("est8@labvirtual.local", emails)
        self.assertNotIn("est9@labvirtual.local", emails)

    def test_admin_ve_estudiantes_de_todos_los_grados(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/academics/estudiantes/")
        emails = [e["usuario"]["email"] for e in response.data["results"]]
        self.assertIn("est8@labvirtual.local", emails)
        self.assertIn("est9@labvirtual.local", emails)

    def test_alternar_activo_requiere_admin(self):
        self.client.force_authenticate(user=self.profesor_usuario)
        response = self.client.post(f"/api/academics/estudiantes/{self.estudiante8.id}/alternar_activo/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.admin)
        response = self.client.post(f"/api/academics/estudiantes/{self.estudiante8.id}/alternar_activo/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.estudiante8_usuario.refresh_from_db()
        self.assertFalse(self.estudiante8_usuario.is_active)
