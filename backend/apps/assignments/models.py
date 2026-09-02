from django.conf import settings
from django.db import models

from apps.academics.models import Grado
from apps.labs.models import Laboratorio


class Actividad(models.Model):
    """Tarea evaluable de un grado; puede envolver un laboratorio o ser independiente."""

    grado = models.ForeignKey(Grado, on_delete=models.CASCADE, related_name="actividades")
    laboratorio = models.ForeignKey(
        Laboratorio, on_delete=models.SET_NULL, null=True, blank=True, related_name="actividades"
    )
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    instrucciones = models.TextField(blank=True)
    fecha_publicacion = models.DateTimeField(auto_now_add=True)
    fecha_entrega = models.DateTimeField(null=True, blank=True)
    puntaje_maximo = models.DecimalField(max_digits=5, decimal_places=2, default=5)
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        ordering = ["fecha_entrega", "titulo"]

    def __str__(self):
        return self.titulo


class Pregunta(models.Model):
    class Tipo(models.TextChoices):
        ABIERTA = "abierta", "Respuesta abierta"
        OPCION_MULTIPLE = "opcion_multiple", "Opción múltiple"
        VERDADERO_FALSO = "verdadero_falso", "Verdadero o falso"

    actividad = models.ForeignKey(Actividad, on_delete=models.CASCADE, related_name="preguntas")
    enunciado = models.TextField()
    tipo = models.CharField(max_length=20, choices=Tipo.choices, default=Tipo.ABIERTA)
    opciones = models.JSONField(default=list, blank=True)
    respuesta_correcta = models.CharField(max_length=200, blank=True)
    puntaje = models.DecimalField(max_digits=5, decimal_places=2, default=1)
    orden = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["orden", "id"]

    def __str__(self):
        return self.enunciado[:60]
