from rest_framework import serializers

from apps.academics.serializers import GradoSerializer

from .models import Actividad, Pregunta


class PreguntaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pregunta
        fields = [
            "id",
            "actividad",
            "enunciado",
            "tipo",
            "opciones",
            "respuesta_correcta",
            "puntaje",
            "orden",
        ]


class LaboratorioResumenSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    titulo = serializers.CharField()
    tipo = serializers.CharField()


class ActividadSerializer(serializers.ModelSerializer):
    preguntas = PreguntaSerializer(many=True, read_only=True)
    grado_detalle = GradoSerializer(source="grado", read_only=True)
    laboratorio_detalle = LaboratorioResumenSerializer(source="laboratorio", read_only=True)

    class Meta:
        model = Actividad
        fields = [
            "id",
            "grado",
            "grado_detalle",
            "laboratorio",
            "laboratorio_detalle",
            "titulo",
            "descripcion",
            "instrucciones",
            "fecha_publicacion",
            "fecha_entrega",
            "puntaje_maximo",
            "preguntas",
        ]
        read_only_fields = ["id", "fecha_publicacion"]
