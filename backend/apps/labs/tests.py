from rest_framework import status
from rest_framework.test import APITestCase

from apps.academics.models import Estudiante, Grado
from apps.accounts.models import Rol, Usuario
from apps.content.models import Modulo, ModuloGrado

from .models import Laboratorio, ProgresoLaboratorio


class LabsTests(APITestCase):
    def setUp(self):
        self.grado8 = Grado.objects.create(nombre="8°", orden=1)
        self.grado10 = Grado.objects.create(nombre="10°", orden=3)
        modulo = Modulo.objects.create(nombre="Hardware")
        self.mg8 = ModuloGrado.objects.create(modulo=modulo, grado=self.grado8, orden=1)
        self.mg10 = ModuloGrado.objects.create(modulo=modulo, grado=self.grado10, orden=1)

        self.est8_usuario = Usuario.objects.create_user(
            email="est8@labvirtual.local", password="Clave12345", rol=Rol.ESTUDIANTE
        )
        self.estudiante8 = Estudiante.objects.create(usuario=self.est8_usuario, grado=self.grado8)

        self.quiz = Laboratorio.objects.create(
            modulo_grado=self.mg8,
            titulo="Quiz de hardware",
            tipo=Laboratorio.Tipo.QUIZ,
            configuracion={
                "preguntas": [
                    {
                        "id": 1,
                        "enunciado": "¿Cuál es un periférico de salida?",
                        "opciones": ["Mouse", "Monitor"],
                        "respuesta_correcta": "Monitor",
                        "puntaje": 1,
                    }
                ]
            },
        )
        self.lab_otro_grado = Laboratorio.objects.create(
            modulo_grado=self.mg10, titulo="Laboratorio de 10°", tipo=Laboratorio.Tipo.ENTREGA_ARCHIVO
        )

    def test_estudiante_no_ve_laboratorio_de_otro_grado_en_su_listado(self):
        self.client.force_authenticate(user=self.est8_usuario)
        response = self.client.get("/api/labs/mis-laboratorios/")
        titulos = [lab["titulo"] for lab in response.data]
        self.assertIn("Quiz de hardware", titulos)
        self.assertNotIn("Laboratorio de 10°", titulos)

    def test_estudiante_no_puede_iniciar_laboratorio_de_otro_grado(self):
        self.client.force_authenticate(user=self.est8_usuario)
        response = self.client.post(f"/api/labs/laboratorios/{self.lab_otro_grado.id}/iniciar/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_configuracion_de_quiz_oculta_respuesta_correcta_al_estudiante(self):
        self.client.force_authenticate(user=self.est8_usuario)
        response = self.client.get("/api/labs/mis-laboratorios/")
        quiz = next(lab for lab in response.data if lab["titulo"] == "Quiz de hardware")
        pregunta = quiz["configuracion"]["preguntas"][0]
        self.assertNotIn("respuesta_correcta", pregunta)

    def test_responder_quiz_autocalifica_y_marca_completado(self):
        self.client.force_authenticate(user=self.est8_usuario)
        response = self.client.post(
            f"/api/labs/laboratorios/{self.quiz.id}/responder/",
            {"respuestas": {"1": "Monitor"}},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["estado"], "completado")
        self.assertEqual(float(response.data["calificacion"]), 5.0)

        progreso = ProgresoLaboratorio.objects.get(estudiante=self.estudiante8, laboratorio=self.quiz)
        self.assertEqual(progreso.estado, ProgresoLaboratorio.Estado.COMPLETADO)
