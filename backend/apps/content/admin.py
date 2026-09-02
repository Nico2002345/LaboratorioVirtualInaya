from django.contrib import admin

from .models import Contenido, Material, Modulo, ModuloGrado


@admin.register(Modulo)
class ModuloAdmin(admin.ModelAdmin):
    list_display = ("nombre", "icono")
    search_fields = ("nombre",)


@admin.register(ModuloGrado)
class ModuloGradoAdmin(admin.ModelAdmin):
    list_display = ("modulo", "grado", "orden")
    list_filter = ("grado",)
    ordering = ("grado", "orden")


@admin.register(Contenido)
class ContenidoAdmin(admin.ModelAdmin):
    list_display = ("titulo", "modulo_grado", "publicado", "orden")
    list_filter = ("modulo_grado__grado", "publicado")
    search_fields = ("titulo",)


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ("nombre", "tipo", "contenido", "subido_en")
    list_filter = ("tipo",)
