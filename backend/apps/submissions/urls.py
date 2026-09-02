from django.urls import path

from .views import CalificarEntregaView, EntregarActividadView, EntregasActividadView, MisActividadesView

urlpatterns = [
    path("mis-actividades/", MisActividadesView.as_view(), name="mis-actividades"),
    path("actividades/<int:pk>/entregar/", EntregarActividadView.as_view(), name="entregar-actividad"),
    path("actividades/<int:pk>/entregas/", EntregasActividadView.as_view(), name="entregas-actividad"),
    path("entregas/<int:pk>/calificar/", CalificarEntregaView.as_view(), name="calificar-entrega"),
]
