from django.conf import settings
from django.db import models

from apps.academics.models import Estudiante
from apps.content.models import ModuloGrado


class Laboratorio(models.Model):
    class Tipo(models.TextChoices):
        QUIZ = "quiz", "Cuestionario"
        ENTREGA_ARCHIVO = "entrega_archivo", "Entrega de archivo"
        ENSAMBLE_PC = "ensamble_pc", "Ensamble de computador"
        DIRECCIONAMIENTO_IP = "direccionamiento_ip", "Direccionamiento IP"
        EDITOR_WEB = "editor_web", "Editor HTML/CSS/JS"
        SIMULADOR_BD = "simulador_bd", "Simulador de base de datos"

    modulo_grado = models.ForeignKey(ModuloGrado, on_delete=models.CASCADE, related_name="laboratorios")
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    objetivo = models.TextField(blank=True)
    instrucciones = models.TextField(blank=True)
    tipo = models.CharField(max_length=30, choices=Tipo.choices)
    configuracion = models.JSONField(default=dict, blank=True)
    fecha_limite = models.DateTimeField(null=True, blank=True)
    activo = models.BooleanField(default=True)
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["fecha_limite", "titulo"]

    def __str__(self):
        return self.titulo


class ProgresoLaboratorio(models.Model):
    class Estado(models.TextChoices):
        NO_INICIADO = "no_iniciado", "No iniciado"
        EN_PROGRESO = "en_progreso", "En progreso"
        COMPLETADO = "completado", "Completado"

    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE, related_name="progresos")
    laboratorio = models.ForeignKey(Laboratorio, on_delete=models.CASCADE, related_name="progresos")
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.NO_INICIADO)
    porcentaje = models.PositiveSmallIntegerField(default=0)
    datos_estado = models.JSONField(default=dict, blank=True)
    archivo_entrega = models.FileField(upload_to="entregas_lab/%Y/%m/", null=True, blank=True)
    calificacion = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    iniciado_en = models.DateTimeField(null=True, blank=True)
    completado_en = models.DateTimeField(null=True, blank=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("estudiante", "laboratorio")

    def __str__(self):
        return f"{self.estudiante} - {self.laboratorio} ({self.estado})"
