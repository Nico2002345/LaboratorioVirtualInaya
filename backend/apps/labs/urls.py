from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    EntregarArchivoView,
    IniciarLaboratorioView,
    LaboratorioViewSet,
    MisLaboratoriosView,
    ResponderQuizView,
    VerificarCodigoView,
    VerificarDireccionamientoIPView,
    VerificarEnsambleView,
)

router = DefaultRouter()
router.register("laboratorios", LaboratorioViewSet, basename="laboratorio")

urlpatterns = [
    path("mis-laboratorios/", MisLaboratoriosView.as_view(), name="mis-laboratorios"),
    path("laboratorios/<int:pk>/iniciar/", IniciarLaboratorioView.as_view(), name="lab-iniciar"),
    path("laboratorios/<int:pk>/responder/", ResponderQuizView.as_view(), name="lab-responder"),
    path("laboratorios/<int:pk>/entregar/", EntregarArchivoView.as_view(), name="lab-entregar"),
    path(
        "laboratorios/<int:pk>/verificar-ip/",
        VerificarDireccionamientoIPView.as_view(),
        name="lab-verificar-ip",
    ),
    path(
        "laboratorios/<int:pk>/verificar-ensamble/",
        VerificarEnsambleView.as_view(),
        name="lab-verificar-ensamble",
    ),
    path(
        "laboratorios/<int:pk>/verificar-codigo/",
        VerificarCodigoView.as_view(),
        name="lab-verificar-codigo",
    ),
    path("", include(router.urls)),
]
