from rest_framework import status
from rest_framework.test import APITestCase

from apps.academics.models import Estudiante, Grado, Profesor
from apps.accounts.models import Rol, Usuario
from apps.assignments.models import Actividad, Pregunta

from .models import Entrega


class SubmissionsTests(APITestCase):
    def setUp(self):
        self.grado8 = Grado.objects.create(nombre="8°", orden=1)
        self.grado9 = Grado.objects.create(nombre="9°", orden=2)

        self.profesor_usuario = Usuario.objects.create_user(
            email="prof@labvirtual.local", password="Clave12345", rol=Rol.PROFESOR
        )
        self.profesor = Profesor.objects.create(usuario=self.profesor_usuario)
        self.profesor.grados.set([self.grado8])

        self.est_usuario = Usuario.objects.create_user(
            email="est@labvirtual.local", password="Clave12345", rol=Rol.ESTUDIANTE
        )
        self.estudiante = Estudiante.objects.create(usuario=self.est_usuario, grado=self.grado8)

        self.actividad = Actividad.objects.create(grado=self.grado8, titulo="Evaluación", puntaje_maximo=5)
        self.pregunta = Pregunta.objects.create(
            actividad=self.actividad,
            enunciado="¿2 + 2?",
            tipo=Pregunta.Tipo.OPCION_MULTIPLE,
            opciones=["3", "4"],
            respuesta_correcta="4",
            puntaje=1,
        )

        self.actividad_otro_grado = Actividad.objects.create(grado=self.grado9, titulo="Otra", puntaje_maximo=5)

    def test_estudiante_entrega_y_opcion_multiple_se_autocalifica(self):
        self.client.force_authenticate(user=self.est_usuario)
        response = self.client.post(
            f"/api/submissions/actividades/{self.actividad.id}/entregar/",
            {"respuestas": f'{{"{self.pregunta.id}": "4"}}'},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        respuesta = response.data["respuestas"][0]
        self.assertTrue(respuesta["es_correcta"])

    def test_profesor_no_puede_calificar_entrega_fuera_de_su_grado(self):
        entrega = Entrega.objects.create(actividad=self.actividad_otro_grado, estudiante=self.estudiante)
        self.client.force_authenticate(user=self.profesor_usuario)
        response = self.client.post(
            f"/api/submissions/entregas/{entrega.id}/calificar/", {"nota": 5, "observaciones": ""}
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_profesor_puede_calificar_entrega_de_su_grado(self):
        entrega = Entrega.objects.create(actividad=self.actividad, estudiante=self.estudiante)
        self.client.force_authenticate(user=self.profesor_usuario)
        response = self.client.post(
            f"/api/submissions/entregas/{entrega.id}/calificar/", {"nota": 4.5, "observaciones": "Bien"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["estado"], "revisado")
