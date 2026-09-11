from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Avatar, Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ["id", "email", "first_name", "last_name", "rol", "is_active", "date_joined", "avatar", "apodo"]
        read_only_fields = fields


class ActualizarPerfilSerializer(serializers.Serializer):
    avatar = serializers.ChoiceField(choices=Avatar.choices, required=False)
    apodo = serializers.CharField(max_length=30, allow_blank=True, required=False)

    def save(self):
        usuario = self.context["request"].user
        for campo, valor in self.validated_data.items():
            setattr(usuario, campo, valor)
        usuario.save(update_fields=list(self.validated_data.keys()))
        return usuario


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Login con email + password; agrega el rol al payload del token."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["rol"] = user.rol
        token["nombre"] = user.get_full_name() or user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["usuario"] = UsuarioSerializer(self.user).data
        return data


class CambiarPasswordSerializer(serializers.Serializer):
    password_actual = serializers.CharField(write_only=True)
    password_nueva = serializers.CharField(write_only=True)

    def validate_password_actual(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("La contraseña actual es incorrecta.")
        return value

    def validate_password_nueva(self, value):
        validate_password(value, user=self.context["request"].user)
        return value

    def save(self):
        user = self.context["request"].user
        user.set_password(self.validated_data["password_nueva"])
        user.save(update_fields=["password"])
        return user


class SolicitarResetPasswordSerializer(serializers.Serializer):
    """Envía un correo con el enlace de recuperación, si el correo está registrado.

    No revela si el correo existe o no: siempre responde igual desde la vista,
    para evitar que se use este endpoint para enumerar usuarios registrados.
    """

    email = serializers.EmailField()

    def save(self):
        try:
            usuario = Usuario.objects.get(email__iexact=self.validated_data["email"])
        except Usuario.DoesNotExist:
            return

        uid = urlsafe_base64_encode(force_bytes(usuario.pk))
        token = default_token_generator.make_token(usuario)
        enlace = f"{settings.FRONTEND_URL}/restablecer-password?uid={uid}&token={token}"

        send_mail(
            subject="Recupera tu contraseña - Laboratorio Virtual",
            message=(
                f"Hola {usuario.get_full_name() or usuario.email},\n\n"
                "Recibimos una solicitud para restablecer tu contraseña. "
                f"Haz clic en el siguiente enlace para crear una nueva:\n\n{enlace}\n\n"
                "Si tú no solicitaste este cambio, puedes ignorar este correo."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[usuario.email],
            fail_silently=False,
        )


class ConfirmarResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password_nueva = serializers.CharField(write_only=True)

    def validate(self, attrs):
        try:
            pk = urlsafe_base64_decode(attrs["uid"]).decode()
            usuario = Usuario.objects.get(pk=pk)
        except (Usuario.DoesNotExist, ValueError, TypeError, OverflowError):
            raise serializers.ValidationError("El enlace de recuperación no es válido.")

        if not default_token_generator.check_token(usuario, attrs["token"]):
            raise serializers.ValidationError("El enlace de recuperación no es válido o ha expirado.")

        validate_password(attrs["password_nueva"], user=usuario)
        attrs["usuario"] = usuario
        return attrs

    def save(self):
        usuario = self.validated_data["usuario"]
        usuario.set_password(self.validated_data["password_nueva"])
        usuario.save(update_fields=["password"])
        return usuario
