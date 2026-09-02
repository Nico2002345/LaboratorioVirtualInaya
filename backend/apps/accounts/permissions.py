from rest_framework.permissions import BasePermission

from .models import Rol


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.rol == Rol.ADMIN)


class IsProfesor(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.rol == Rol.PROFESOR)


class IsEstudiante(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.rol == Rol.ESTUDIANTE)


class IsAdminOrProfesor(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.rol in (Rol.ADMIN, Rol.PROFESOR)
        )
