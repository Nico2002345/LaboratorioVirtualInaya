from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ContenidoViewSet, MisModulosView, ModuloGradoViewSet, ModuloViewSet

router = DefaultRouter()
router.register("modulos", ModuloViewSet, basename="modulo")
router.register("modulo-grado", ModuloGradoViewSet, basename="modulo-grado")
router.register("contenidos", ContenidoViewSet, basename="contenido")

urlpatterns = [
    path("mis-modulos/", MisModulosView.as_view(), name="mis-modulos"),
    path("", include(router.urls)),
]
