from rest_framework import serializers

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


class ActividadSerializer(serializers.ModelSerializer):
    preguntas = PreguntaSerializer(many=True, read_only=True)

    class Meta:
        model = Actividad
        fields = [
            "id",
            "grado",
            "laboratorio",
            "titulo",
            "descripcion",
            "instrucciones",
            "fecha_publicacion",
            "fecha_entrega",
            "puntaje_maximo",
            "preguntas",
        ]
        read_only_fields = ["id", "fecha_publicacion"]
