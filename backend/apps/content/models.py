from django.conf import settings
from django.db import models

from apps.academics.models import Grado


class Modulo(models.Model):
    """Catálogo de áreas temáticas, reutilizable entre grados (ej. 'Redes' en 9° y en 10°)."""

    nombre = models.CharField(max_length=150, unique=True)
    descripcion = models.TextField(blank=True)
    icono = models.CharField(max_length=10, blank=True)

    class Meta:
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class ModuloGrado(models.Model):
    """Qué módulos aplican a qué grado, y en qué orden se muestran."""

    modulo = models.ForeignKey(Modulo, on_delete=models.CASCADE, related_name="grados_asignados")
    grado = models.ForeignKey(Grado, on_delete=models.CASCADE, related_name="modulos")
    orden = models.PositiveSmallIntegerField(default=0)

    class Meta:
        unique_together = ("modulo", "grado")
        ordering = ["orden", "modulo__nombre"]

    def __str__(self):
        return f"{self.modulo} - {self.grado}"


class Contenido(models.Model):
    modulo_grado = models.ForeignKey(ModuloGrado, on_delete=models.CASCADE, related_name="contenidos")
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    cuerpo = models.TextField(blank=True)
    orden = models.PositiveSmallIntegerField(default=0)
    publicado = models.BooleanField(default=True)
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["orden", "titulo"]

    def __str__(self):
        return self.titulo


class Material(models.Model):
    class Tipo(models.TextChoices):
        PDF = "pdf", "PDF"
        IMAGEN = "imagen", "Imagen"
        VIDEO = "video", "Video"
        ENLACE = "enlace", "Enlace"
        OTRO = "otro", "Otro"

    contenido = models.ForeignKey(
        Contenido, on_delete=models.CASCADE, related_name="materiales", null=True, blank=True
    )
    nombre = models.CharField(max_length=200)
    archivo = models.FileField(upload_to="materiales/%Y/%m/", null=True, blank=True)
    enlace = models.URLField(blank=True)
    tipo = models.CharField(max_length=10, choices=Tipo.choices, default=Tipo.OTRO)
    subido_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    subido_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre
