from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ActividadViewSet, PreguntaViewSet

router = DefaultRouter()
router.register("actividades", ActividadViewSet, basename="actividad")
router.register("preguntas", PreguntaViewSet, basename="pregunta")

urlpatterns = [
    path("", include(router.urls)),
]
