from django.db import models

from apps.academics.models import Estudiante, Profesor
from apps.assignments.models import Actividad, Pregunta


class Entrega(models.Model):
    class Estado(models.TextChoices):
        ENTREGADO = "entregado", "Entregado"
        TARDE = "tarde", "Entregado tarde"
        REVISADO = "revisado", "Revisado"

    actividad = models.ForeignKey(Actividad, on_delete=models.CASCADE, related_name="entregas")
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE, related_name="entregas")
    archivo = models.FileField(upload_to="entregas_actividad/%Y/%m/", null=True, blank=True)
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.ENTREGADO)
    fecha_entrega = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("actividad", "estudiante")

    def __str__(self):
        return f"{self.estudiante} - {self.actividad}"


class Respuesta(models.Model):
    entrega = models.ForeignKey(Entrega, on_delete=models.CASCADE, related_name="respuestas")
    pregunta = models.ForeignKey(Pregunta, on_delete=models.CASCADE, related_name="respuestas")
    contenido = models.TextField(blank=True)
    es_correcta = models.BooleanField(null=True, blank=True)

    class Meta:
        unique_together = ("entrega", "pregunta")

    def __str__(self):
        return f"{self.entrega} - {self.pregunta}"


class Calificacion(models.Model):
    entrega = models.OneToOneField(Entrega, on_delete=models.CASCADE, related_name="calificacion")
    profesor = models.ForeignKey(Profesor, on_delete=models.SET_NULL, null=True, related_name="calificaciones")
    nota = models.DecimalField(max_digits=5, decimal_places=2)
    observaciones = models.TextField(blank=True)
    fecha_calificacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.entrega} = {self.nota}"
