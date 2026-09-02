from django.contrib import admin

from .models import Actividad, Pregunta


class PreguntaInline(admin.TabularInline):
    model = Pregunta
    extra = 1


@admin.register(Actividad)
class ActividadAdmin(admin.ModelAdmin):
    list_display = ("titulo", "grado", "laboratorio", "fecha_entrega", "puntaje_maximo")
    list_filter = ("grado",)
    search_fields = ("titulo",)
    inlines = [PreguntaInline]


@admin.register(Pregunta)
class PreguntaAdmin(admin.ModelAdmin):
    list_display = ("enunciado", "actividad", "tipo", "puntaje", "orden")
    list_filter = ("tipo", "actividad__grado")
