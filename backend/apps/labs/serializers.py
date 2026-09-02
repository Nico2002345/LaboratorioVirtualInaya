from rest_framework import serializers

from .models import Laboratorio, ProgresoLaboratorio


class LaboratorioSerializer(serializers.ModelSerializer):
    """Uso administrativo (admin/profesor): incluye la configuración completa, con respuestas correctas."""

    class Meta:
        model = Laboratorio
        fields = [
            "id",
            "modulo_grado",
            "titulo",
            "descripcion",
            "objetivo",
            "instrucciones",
            "tipo",
            "configuracion",
            "fecha_limite",
            "activo",
            "creado_en",
        ]
        read_only_fields = ["id", "creado_en"]


class ProgresoLaboratorioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgresoLaboratorio
        fields = [
            "estado",
            "porcentaje",
            "calificacion",
            "archivo_entrega",
            "datos_estado",
            "iniciado_en",
            "completado_en",
        ]


def _configuracion_sin_respuestas(laboratorio):
    """Oculta las respuestas correctas de un quiz antes de enviarlo al estudiante."""
    if laboratorio.tipo != Laboratorio.Tipo.QUIZ:
        return laboratorio.configuracion
    config = laboratorio.configuracion or {}
    preguntas = config.get("preguntas", [])
    preguntas_publicas = [
        {k: v for k, v in p.items() if k != "respuesta_correcta"} for p in preguntas
    ]
    return {**config, "preguntas": preguntas_publicas}


class LaboratorioEstudianteSerializer(serializers.ModelSerializer):
    """Vista del estudiante: sin respuestas correctas, con su propio progreso incluido."""

    configuracion = serializers.SerializerMethodField()
    mi_progreso = serializers.SerializerMethodField()

    class Meta:
        model = Laboratorio
        fields = [
            "id",
            "titulo",
            "descripcion",
            "objetivo",
            "instrucciones",
            "tipo",
            "configuracion",
            "fecha_limite",
            "mi_progreso",
        ]

    def get_configuracion(self, obj):
        return _configuracion_sin_respuestas(obj)

    def get_mi_progreso(self, obj):
        progreso = obj.progresos.first()
        if not progreso:
            return {"estado": ProgresoLaboratorio.Estado.NO_INICIADO, "porcentaje": 0}
        return ProgresoLaboratorioSerializer(progreso).data
