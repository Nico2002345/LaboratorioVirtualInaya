from django.db.models import Prefetch
from rest_framework import generics, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from apps.accounts.models import Rol
from apps.accounts.permissions import IsAdmin, IsAdminOrProfesor

from .models import Contenido, Modulo, ModuloGrado
from .serializers import (
    ContenidoSerializer,
    ModuloGradoConContenidosSerializer,
    ModuloGradoSerializer,
    ModuloSerializer,
)


class ModuloViewSet(viewsets.ModelViewSet):
    """Catálogo global de módulos. Solo el administrador lo gestiona; profesores pueden consultarlo."""

    queryset = Modulo.objects.all()
    serializer_class = ModuloSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsAdminOrProfesor()]
        return [IsAdmin()]


class ModuloGradoViewSet(viewsets.ModelViewSet):
    """Asignación de módulos a grados. Solo el administrador la gestiona."""

    queryset = ModuloGrado.objects.select_related("modulo", "grado")
    serializer_class = ModuloGradoSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsAdminOrProfesor()]
        return [IsAdmin()]

    def get_queryset(self):
        qs = super().get_queryset()
        grado_id = self.request.query_params.get("grado")
        if grado_id:
            qs = qs.filter(grado_id=grado_id)
        return qs


class MisModulosView(generics.ListAPIView):
    """Módulos del grado del estudiante autenticado, con sus contenidos publicados."""

    serializer_class = ModuloGradoConContenidosSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        estudiante = getattr(self.request.user, "estudiante", None)
        if not estudiante:
            return ModuloGrado.objects.none()
        return (
            ModuloGrado.objects.select_related("modulo", "grado")
            .prefetch_related(
                Prefetch("contenidos", queryset=Contenido.objects.filter(publicado=True))
            )
            .filter(grado=estudiante.grado)
        )


class ContenidoViewSet(viewsets.ModelViewSet):
    """CRUD de contenidos: admin sobre cualquier grado; profesor solo en sus grados asignados."""

    serializer_class = ContenidoSerializer
    permission_classes = [IsAdminOrProfesor]

    def get_queryset(self):
        qs = Contenido.objects.select_related("modulo_grado__modulo", "modulo_grado__grado")
        user = self.request.user
        if user.rol == Rol.PROFESOR:
            qs = qs.filter(modulo_grado__grado__in=user.profesor.grados.all())
        modulo_grado_id = self.request.query_params.get("modulo_grado")
        if modulo_grado_id:
            qs = qs.filter(modulo_grado_id=modulo_grado_id)
        return qs

    def _validar_grado_profesor(self, modulo_grado):
        user = self.request.user
        if user.rol == Rol.PROFESOR and modulo_grado.grado not in user.profesor.grados.all():
            raise PermissionDenied("No tienes asignado ese grado.")

    def perform_create(self, serializer):
        self._validar_grado_profesor(serializer.validated_data["modulo_grado"])
        serializer.save(creado_por=self.request.user)

    def perform_update(self, serializer):
        modulo_grado = serializer.validated_data.get("modulo_grado", serializer.instance.modulo_grado)
        self._validar_grado_profesor(modulo_grado)
        serializer.save()
