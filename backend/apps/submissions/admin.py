from django.contrib import admin

from .models import Calificacion, Entrega, Respuesta


class RespuestaInline(admin.TabularInline):
    model = Respuesta
    extra = 0


@admin.register(Entrega)
class EntregaAdmin(admin.ModelAdmin):
    list_display = ("estudiante", "actividad", "estado", "fecha_entrega")
    list_filter = ("estado", "actividad__grado")
    inlines = [RespuestaInline]


@admin.register(Calificacion)
class CalificacionAdmin(admin.ModelAdmin):
    list_display = ("entrega", "nota", "profesor", "fecha_calificacion")
