from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    EstudianteViewSet,
    GradoViewSet,
    MiPerfilEstudianteView,
    MisGradosProfesorView,
    ProfesorViewSet,
    RegistroEstudianteView,
)

router = DefaultRouter()
router.register("grados", GradoViewSet, basename="grado")
router.register("estudiantes", EstudianteViewSet, basename="estudiante")
router.register("profesores", ProfesorViewSet, basename="profesor")

urlpatterns = [
    path("estudiantes/registro/", RegistroEstudianteView.as_view(), name="registro-estudiante"),
    path("estudiantes/me/", MiPerfilEstudianteView.as_view(), name="mi-perfil-estudiante"),
    path("profesores/mis-grados/", MisGradosProfesorView.as_view(), name="mis-grados-profesor"),
    path("", include(router.urls)),
]
