from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied

from apps.accounts.models import Rol
from apps.accounts.permissions import IsAdminOrProfesor

from .models import Actividad, Pregunta
from .serializers import ActividadSerializer, PreguntaSerializer


class ActividadViewSet(viewsets.ModelViewSet):
    """CRUD de actividades: admin en cualquier grado, profesor solo en los suyos."""

    serializer_class = ActividadSerializer
    permission_classes = [IsAdminOrProfesor]

    def get_queryset(self):
        qs = Actividad.objects.select_related("grado", "laboratorio").prefetch_related("preguntas")
        user = self.request.user
        if user.rol == Rol.PROFESOR:
            qs = qs.filter(grado__in=user.profesor.grados.all())
        grado_id = self.request.query_params.get("grado")
        if grado_id:
            qs = qs.filter(grado_id=grado_id)
        return qs

    def _validar_grado_profesor(self, grado):
        user = self.request.user
        if user.rol == Rol.PROFESOR and grado not in user.profesor.grados.all():
            raise PermissionDenied("No tienes asignado ese grado.")

    def perform_create(self, serializer):
        self._validar_grado_profesor(serializer.validated_data["grado"])
        serializer.save(creado_por=self.request.user)

    def perform_update(self, serializer):
        grado = serializer.validated_data.get("grado", serializer.instance.grado)
        self._validar_grado_profesor(grado)
        serializer.save()


class PreguntaViewSet(viewsets.ModelViewSet):
    """CRUD de preguntas de una actividad: mismo alcance por grado que ActividadViewSet."""

    serializer_class = PreguntaSerializer
    permission_classes = [IsAdminOrProfesor]

    def get_queryset(self):
        qs = Pregunta.objects.select_related("actividad__grado")
        user = self.request.user
        if user.rol == Rol.PROFESOR:
            qs = qs.filter(actividad__grado__in=user.profesor.grados.all())
        actividad_id = self.request.query_params.get("actividad")
        if actividad_id:
            qs = qs.filter(actividad_id=actividad_id)
        return qs

    def _validar_grado_profesor(self, actividad):
        user = self.request.user
        if user.rol == Rol.PROFESOR and actividad.grado not in user.profesor.grados.all():
            raise PermissionDenied("No tienes asignado ese grado.")

    def perform_create(self, serializer):
        self._validar_grado_profesor(serializer.validated_data["actividad"])
        serializer.save()

    def perform_update(self, serializer):
        actividad = serializer.validated_data.get("actividad", serializer.instance.actividad)
        self._validar_grado_profesor(actividad)
        serializer.save()
