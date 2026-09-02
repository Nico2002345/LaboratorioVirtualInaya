from django.contrib import admin

from .models import Estudiante, Grado, Profesor, ProfesorGrado


@admin.register(Grado)
class GradoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "orden")
    ordering = ("orden",)


class ProfesorGradoInline(admin.TabularInline):
    model = ProfesorGrado
    extra = 1


@admin.register(Estudiante)
class EstudianteAdmin(admin.ModelAdmin):
    list_display = ("usuario", "grado", "fecha_ingreso")
    list_filter = ("grado",)
    search_fields = ("usuario__email", "usuario__first_name", "usuario__last_name")


@admin.register(Profesor)
class ProfesorAdmin(admin.ModelAdmin):
    list_display = ("usuario", "especialidad")
    search_fields = ("usuario__email", "usuario__first_name", "usuario__last_name")
    inlines = [ProfesorGradoInline]
