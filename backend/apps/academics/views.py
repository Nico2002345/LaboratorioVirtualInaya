from rest_framework import generics, permissions, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import Rol
from apps.accounts.permissions import IsAdmin, IsAdminOrProfesor

from .models import Estudiante, Grado, Profesor
from .serializers import (
    CrearProfesorSerializer,
    EstudianteSerializer,
    GradoSerializer,
    ProfesorSerializer,
    RegistroEstudianteSerializer,
)


class GradoViewSet(viewsets.ReadOnlyModelViewSet):
    """Catálogo de grados. Lectura pública: se necesita antes de iniciar sesión (registro)."""

    queryset = Grado.objects.all()
    serializer_class = GradoSerializer
    permission_classes = [AllowAny]


class RegistroEstudianteView(generics.CreateAPIView):
    serializer_class = RegistroEstudianteSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        estudiante = serializer.save()
        return Response(
            EstudianteSerializer(estudiante).data,
            status=201,
        )


class MiPerfilEstudianteView(generics.RetrieveAPIView):
    serializer_class = EstudianteSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return Estudiante.objects.select_related("usuario", "grado").get(usuario=self.request.user)


class EstudianteViewSet(viewsets.ReadOnlyModelViewSet):
    """Admin ve todos los estudiantes (filtrables por grado); profesor solo los de sus grados."""

    serializer_class = EstudianteSerializer
    permission_classes = [IsAdminOrProfesor]

    def get_queryset(self):
        qs = Estudiante.objects.select_related("usuario", "grado")
        user = self.request.user
        if user.rol == Rol.PROFESOR:
            qs = qs.filter(grado__in=user.profesor.grados.all())
        grado_id = self.request.query_params.get("grado")
        if grado_id:
            qs = qs.filter(grado_id=grado_id)
        return qs.order_by("grado__orden", "usuario__last_name")


class ProfesorViewSet(viewsets.ModelViewSet):
    """Gestión de profesores: solo el administrador crea/edita."""

    queryset = Profesor.objects.select_related("usuario").prefetch_related("grados")
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.action == "create":
            return CrearProfesorSerializer
        return ProfesorSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profesor = serializer.save()
        return Response(ProfesorSerializer(profesor).data, status=201)


class MisGradosProfesorView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.rol != Rol.PROFESOR:
            return Response({"detail": "Solo para profesores."}, status=403)
        grados = request.user.profesor.grados.all()
        return Response(GradoSerializer(grados, many=True).data)
