from django.db.models import Prefetch
from rest_framework import generics, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from apps.accounts.models import Rol
from apps.accounts.permissions import IsAdminOrProfesor

from .models import Contenido, Material, Modulo, ModuloGrado
from .serializers import (
    ContenidoSerializer,
    MaterialSerializer,
    ModuloGradoConContenidosSerializer,
    ModuloGradoSerializer,
    ModuloSerializer,
)


class ModuloViewSet(viewsets.ModelViewSet):
    """Catálogo global de módulos. Administradores y profesores pueden gestionarlo por igual."""

    queryset = Modulo.objects.all()
    serializer_class = ModuloSerializer
    permission_classes = [IsAdminOrProfesor]


class ModuloGradoViewSet(viewsets.ModelViewSet):
    """Asignación de módulos a grados: admin sobre cualquier grado; profesor solo en sus grados asignados."""

    queryset = ModuloGrado.objects.select_related("modulo", "grado")
    serializer_class = ModuloGradoSerializer
    permission_classes = [IsAdminOrProfesor]

    def get_queryset(self):
        qs = super().get_queryset()
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
        serializer.save()

    def perform_update(self, serializer):
        grado = serializer.validated_data.get("grado", serializer.instance.grado)
        self._validar_grado_profesor(grado)
        serializer.save()

    def perform_destroy(self, instance):
        self._validar_grado_profesor(instance.grado)
        instance.delete()


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
                Prefetch(
                    "contenidos",
                    queryset=Contenido.objects.filter(publicado=True).prefetch_related("materiales"),
                )
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


class MaterialViewSet(viewsets.ModelViewSet):
    """CRUD de materiales de apoyo de un contenido: admin en cualquier grado, profesor en los suyos."""

    serializer_class = MaterialSerializer
    permission_classes = [IsAdminOrProfesor]

    def get_queryset(self):
        qs = Material.objects.select_related("contenido__modulo_grado__grado")
        user = self.request.user
        if user.rol == Rol.PROFESOR:
            qs = qs.filter(contenido__modulo_grado__grado__in=user.profesor.grados.all())
        contenido_id = self.request.query_params.get("contenido")
        if contenido_id:
            qs = qs.filter(contenido_id=contenido_id)
        return qs

    def _validar_grado_profesor(self, contenido):
        user = self.request.user
        if user.rol == Rol.PROFESOR and contenido.modulo_grado.grado not in user.profesor.grados.all():
            raise PermissionDenied("No tienes asignado ese grado.")

    def perform_create(self, serializer):
        self._validar_grado_profesor(serializer.validated_data["contenido"])
        serializer.save(subido_por=self.request.user)

    def perform_update(self, serializer):
        contenido = serializer.validated_data.get("contenido", serializer.instance.contenido)
        self._validar_grado_profesor(contenido)
        serializer.save()
