from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.db import models


class Rol(models.TextChoices):
    ADMIN = "admin", "Administrador"
    PROFESOR = "profesor", "Profesor"
    ESTUDIANTE = "estudiante", "Estudiante"


class UsuarioManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("El usuario debe tener un correo electrónico")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("rol", Rol.ESTUDIANTE)
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("rol", Rol.ADMIN)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("El superusuario debe tener is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("El superusuario debe tener is_superuser=True")
        return self._create_user(email, password, **extra_fields)


class Usuario(AbstractUser):
    """Usuario único de la plataforma; el campo `rol` define su tipo."""

    username = None
    email = models.EmailField("correo electrónico", unique=True)
    rol = models.CharField(max_length=20, choices=Rol.choices)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UsuarioManager()

    def __str__(self):
        return f"{self.get_full_name() or self.email} ({self.get_rol_display()})"

    @property
    def es_admin(self):
        return self.rol == Rol.ADMIN

    @property
    def es_profesor(self):
        return self.rol == Rol.PROFESOR

    @property
    def es_estudiante(self):
        return self.rol == Rol.ESTUDIANTE
