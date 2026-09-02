from django.conf import settings
from django.db import models


class Grado(models.Model):
    """Catálogo de grados. Trae 8°-11° por fixture; el administrador puede agregar secciones
    (ej. "8B", "9C") desde el panel. No se crea desde el registro de estudiantes."""

    nombre = models.CharField(max_length=10, unique=True)
    descripcion = models.TextField(blank=True)
    orden = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["orden", "nombre"]

    def __str__(self):
        return self.nombre


class Estudiante(models.Model):
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="estudiante"
    )
    grado = models.ForeignKey(Grado, on_delete=models.PROTECT, related_name="estudiantes")
    fecha_ingreso = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario.get_full_name()} - {self.grado.nombre}"


class Profesor(models.Model):
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profesor"
    )
    especialidad = models.CharField(max_length=150, blank=True)
    grados = models.ManyToManyField(Grado, related_name="profesores", through="ProfesorGrado", blank=True)

    def __str__(self):
        return self.usuario.get_full_name()


class ProfesorGrado(models.Model):
    profesor = models.ForeignKey(Profesor, on_delete=models.CASCADE)
    grado = models.ForeignKey(Grado, on_delete=models.CASCADE)
    asignado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("profesor", "grado")

    def __str__(self):
        return f"{self.profesor} -> {self.grado}"
