from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CambiarPasswordView,
    ConfirmarResetPasswordView,
    EmailTokenObtainPairView,
    MeView,
    SolicitarResetPasswordView,
)

urlpatterns = [
    path("login/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("cambiar-password/", CambiarPasswordView.as_view(), name="cambiar_password"),
    path("olvide-password/", SolicitarResetPasswordView.as_view(), name="olvide_password"),
    path("restablecer-password/", ConfirmarResetPasswordView.as_view(), name="restablecer_password"),
]
