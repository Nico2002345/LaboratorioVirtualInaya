from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import CambiarPasswordView, EmailTokenObtainPairView, MeView

urlpatterns = [
    path("login/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("cambiar-password/", CambiarPasswordView.as_view(), name="cambiar_password"),
]
