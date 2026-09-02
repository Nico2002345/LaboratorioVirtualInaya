import json

from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import Rol
from apps.accounts.permissions import IsAdminOrProfesor
from apps.assignments.models import Actividad, Pregunta

from .models import Calificacion, Entrega, Respuesta
from .serializers import ActividadEstudianteSerializer, EntregaSerializer, MiEntregaSerializer


def _get_estudiante_o_403(request):
    estudiante = getattr(request.user, "estudiante", None)
    if not estudiante:
        raise PermissionDenied("Solo para estudiantes.")
    return estudiante


def _validar_grado_profesor(request, grado):
    user = request.user
    if user.rol == Rol.PROFESOR and grado not in user.profesor.grados.all():
        raise PermissionDenied("No tienes asignado ese grado.")


class MisActividadesView(ListAPIView):
    serializer_class = ActividadEstudianteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        estudiante = _get_estudiante_o_403(self.request)
        return (
            Actividad.objects.filter(grado=estudiante.grado)
            .select_related("laboratorio")
            .prefetch_related(
                "preguntas",
                Prefetch(
                    "entregas",
                    queryset=Entrega.objects.filter(estudiante=estudiante).prefetch_related(
                        "respuestas", "calificacion"
                    ),
                ),
            )
        )


class EntregarActividadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        estudiante = _get_estudiante_o_403(request)
        actividad = get_object_or_404(Actividad, pk=pk, grado=estudiante.grado)

        respuestas_raw = request.data.get("respuestas", "{}")
        if isinstance(respuestas_raw, str):
            try:
                respuestas = json.loads(respuestas_raw)
            except json.JSONDecodeError:
                raise ValidationError({"respuestas": "JSON inválido."})
        else:
            respuestas = respuestas_raw
        if not isinstance(respuestas, dict):
            raise ValidationError({"respuestas": "Debe ser un objeto {pregunta_id: contenido}."})

        entrega, _ = Entrega.objects.get_or_create(actividad=actividad, estudiante=estudiante)

        archivo = request.FILES.get("archivo")
        if archivo:
            entrega.archivo = archivo

        if actividad.fecha_entrega and timezone.now() > actividad.fecha_entrega:
            entrega.estado = Entrega.Estado.TARDE
        else:
            entrega.estado = Entrega.Estado.ENTREGADO
        entrega.save()

        for pregunta in actividad.preguntas.all():
            pid = str(pregunta.id)
            if pid not in respuestas:
                continue
            contenido = str(respuestas[pid])
            es_correcta = None
            if pregunta.tipo in (Pregunta.Tipo.OPCION_MULTIPLE, Pregunta.Tipo.VERDADERO_FALSO):
                es_correcta = contenido == pregunta.respuesta_correcta
            Respuesta.objects.update_or_create(
                entrega=entrega, pregunta=pregunta, defaults={"contenido": contenido, "es_correcta": es_correcta}
            )

        entrega.refresh_from_db()
        return Response(MiEntregaSerializer(entrega).data)


class EntregasActividadView(ListAPIView):
    """Admin/profesor: lista las entregas de una actividad para revisarlas."""

    serializer_class = EntregaSerializer
    permission_classes = [IsAdminOrProfesor]

    def get_queryset(self):
        actividad = get_object_or_404(Actividad, pk=self.kwargs["pk"])
        _validar_grado_profesor(self.request, actividad.grado)
        return (
            Entrega.objects.filter(actividad=actividad)
            .select_related("estudiante__usuario", "estudiante__grado", "calificacion")
            .prefetch_related("respuestas")
        )


class CalificarEntregaView(APIView):
    permission_classes = [IsAdminOrProfesor]

    def post(self, request, pk):
        entrega = get_object_or_404(Entrega.objects.select_related("actividad"), pk=pk)
        _validar_grado_profesor(request, entrega.actividad.grado)

        nota = request.data.get("nota")
        if nota is None:
            raise ValidationError({"nota": "Este campo es obligatorio."})

        profesor = getattr(request.user, "profesor", None)
        Calificacion.objects.update_or_create(
            entrega=entrega,
            defaults={
                "profesor": profesor,
                "nota": nota,
                "observaciones": request.data.get("observaciones", ""),
            },
        )
        entrega.estado = Entrega.Estado.REVISADO
        entrega.save()

        return Response(EntregaSerializer(entrega).data)
