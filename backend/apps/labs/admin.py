from django.contrib import admin

from .models import Laboratorio, ProgresoLaboratorio


@admin.register(Laboratorio)
class LaboratorioAdmin(admin.ModelAdmin):
    list_display = ("titulo", "modulo_grado", "tipo", "activo", "fecha_limite")
    list_filter = ("tipo", "activo", "modulo_grado__grado")
    search_fields = ("titulo",)


@admin.register(ProgresoLaboratorio)
class ProgresoLaboratorioAdmin(admin.ModelAdmin):
    list_display = ("estudiante", "laboratorio", "estado", "porcentaje", "calificacion")
    list_filter = ("estado", "laboratorio__modulo_grado__grado")
