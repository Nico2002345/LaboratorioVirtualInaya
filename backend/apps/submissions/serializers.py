from rest_framework import serializers

from apps.academics.serializers import EstudianteSerializer
from apps.assignments.models import Actividad, Pregunta

from .models import Calificacion, Entrega, Respuesta


class CalificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calificacion
        fields = ["nota", "observaciones", "fecha_calificacion"]


class RespuestaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Respuesta
        fields = ["pregunta", "contenido", "es_correcta"]


class EntregaSerializer(serializers.ModelSerializer):
    """Uso administrativo (admin/profesor): entrega completa para revisar y calificar."""

    estudiante = EstudianteSerializer(read_only=True)
    respuestas = RespuestaSerializer(many=True, read_only=True)
    calificacion = CalificacionSerializer(read_only=True)

    class Meta:
        model = Entrega
        fields = [
            "id",
            "actividad",
            "estudiante",
            "archivo",
            "estado",
            "fecha_entrega",
            "respuestas",
            "calificacion",
        ]


class PreguntaEstudianteSerializer(serializers.ModelSerializer):
    """Vista del estudiante: sin respuesta_correcta."""

    class Meta:
        model = Pregunta
        fields = ["id", "enunciado", "tipo", "opciones", "puntaje", "orden"]


class MiEntregaSerializer(serializers.ModelSerializer):
    respuestas = RespuestaSerializer(many=True, read_only=True)
    calificacion = CalificacionSerializer(read_only=True)

    class Meta:
        model = Entrega
        fields = ["archivo", "estado", "fecha_entrega", "respuestas", "calificacion"]


class ActividadEstudianteSerializer(serializers.ModelSerializer):
    preguntas = PreguntaEstudianteSerializer(many=True, read_only=True)
    mi_entrega = serializers.SerializerMethodField()

    class Meta:
        model = Actividad
        fields = [
            "id",
            "titulo",
            "descripcion",
            "instrucciones",
            "laboratorio",
            "fecha_publicacion",
            "fecha_entrega",
            "puntaje_maximo",
            "preguntas",
            "mi_entrega",
        ]

    def get_mi_entrega(self, obj):
        entrega = obj.entregas.first()
        return MiEntregaSerializer(entrega).data if entrega else None
