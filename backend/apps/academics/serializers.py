from django.db import transaction
from rest_framework import serializers

from apps.accounts.models import Rol, Usuario
from apps.accounts.serializers import UsuarioSerializer

from .models import Estudiante, Grado, Profesor, ProfesorGrado


class GradoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grado
        fields = ["id", "nombre", "descripcion", "orden"]


class EstudianteSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
    grado = GradoSerializer(read_only=True)

    class Meta:
        model = Estudiante
        fields = ["id", "usuario", "grado", "fecha_ingreso"]


class RegistroEstudianteSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    grado = serializers.PrimaryKeyRelatedField(queryset=Grado.objects.all())

    def validate_email(self, value):
        if Usuario.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Ya existe una cuenta con este correo.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        grado = validated_data.pop("grado")
        password = validated_data.pop("password")
        usuario = Usuario.objects.create_user(
            email=validated_data["email"],
            password=password,
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            rol=Rol.ESTUDIANTE,
        )
        estudiante = Estudiante.objects.create(usuario=usuario, grado=grado)
        return estudiante


class ProfesorGradoSerializer(serializers.ModelSerializer):
    grado = GradoSerializer(read_only=True)

    class Meta:
        model = ProfesorGrado
        fields = ["id", "grado", "asignado_en"]


class ProfesorSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
    grados = GradoSerializer(many=True, read_only=True)

    class Meta:
        model = Profesor
        fields = ["id", "usuario", "especialidad", "grados"]


class CrearProfesorSerializer(serializers.Serializer):
    """Uso exclusivo del administrador: crea la cuenta del profesor y sus grados asignados."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    especialidad = serializers.CharField(max_length=150, required=False, allow_blank=True)
    grados = serializers.PrimaryKeyRelatedField(queryset=Grado.objects.all(), many=True, required=False)

    def validate_email(self, value):
        if Usuario.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Ya existe una cuenta con este correo.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        grados = validated_data.pop("grados", [])
        password = validated_data.pop("password")
        usuario = Usuario.objects.create_user(
            email=validated_data["email"],
            password=password,
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            rol=Rol.PROFESOR,
            is_staff=True,
        )
        profesor = Profesor.objects.create(
            usuario=usuario, especialidad=validated_data.get("especialidad", "")
        )
        profesor.grados.set(grados)
        return profesor
