import ipaddress

from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import Rol
from apps.accounts.permissions import IsAdminOrProfesor

from .models import Laboratorio, ProgresoLaboratorio
from .serializers import LaboratorioEstudianteSerializer, LaboratorioSerializer, ProgresoLaboratorioSerializer


class LaboratorioViewSet(viewsets.ModelViewSet):
    """CRUD de laboratorios: admin en cualquier grado, profesor solo en los suyos."""

    serializer_class = LaboratorioSerializer
    permission_classes = [IsAdminOrProfesor]

    def get_queryset(self):
        qs = Laboratorio.objects.select_related("modulo_grado__modulo", "modulo_grado__grado")
        user = self.request.user
        if user.rol == Rol.PROFESOR:
            qs = qs.filter(modulo_grado__grado__in=user.profesor.grados.all())
        modulo_grado_id = self.request.query_params.get("modulo_grado")
        if modulo_grado_id:
            qs = qs.filter(modulo_grado_id=modulo_grado_id)
        return qs

    def _validar_grado_profesor(self, modulo_grado):
        user = self.request.user
        if user.rol == Rol.PROFESOR and modulo_grado.grado not in user.profesor.grados.all():
            raise PermissionDenied("No tienes asignado ese grado.")

    def perform_create(self, serializer):
        self._validar_grado_profesor(serializer.validated_data["modulo_grado"])
        serializer.save(creado_por=self.request.user)

    def perform_update(self, serializer):
        modulo_grado = serializer.validated_data.get("modulo_grado", serializer.instance.modulo_grado)
        self._validar_grado_profesor(modulo_grado)
        serializer.save()


def _get_estudiante_o_403(request):
    estudiante = getattr(request.user, "estudiante", None)
    if not estudiante:
        raise PermissionDenied("Solo para estudiantes.")
    return estudiante


class MisLaboratoriosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        estudiante = _get_estudiante_o_403(request)
        laboratorios = (
            Laboratorio.objects.filter(modulo_grado__grado=estudiante.grado, activo=True)
            .select_related("modulo_grado")
            .prefetch_related(
                Prefetch(
                    "progresos",
                    queryset=ProgresoLaboratorio.objects.filter(estudiante=estudiante),
                )
            )
        )
        return Response(LaboratorioEstudianteSerializer(laboratorios, many=True).data)


class IniciarLaboratorioView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        estudiante = _get_estudiante_o_403(request)
        laboratorio = get_object_or_404(
            Laboratorio, pk=pk, modulo_grado__grado=estudiante.grado, activo=True
        )
        progreso, creado = ProgresoLaboratorio.objects.get_or_create(
            estudiante=estudiante, laboratorio=laboratorio
        )
        if progreso.estado == ProgresoLaboratorio.Estado.NO_INICIADO:
            progreso.estado = ProgresoLaboratorio.Estado.EN_PROGRESO
            progreso.iniciado_en = timezone.now()
            progreso.save()
        return Response(ProgresoLaboratorioSerializer(progreso).data)


class ResponderQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        estudiante = _get_estudiante_o_403(request)
        laboratorio = get_object_or_404(
            Laboratorio,
            pk=pk,
            modulo_grado__grado=estudiante.grado,
            activo=True,
            tipo=Laboratorio.Tipo.QUIZ,
        )
        respuestas = request.data.get("respuestas")
        if not isinstance(respuestas, dict):
            raise ValidationError({"respuestas": "Debe ser un objeto {pregunta_id: respuesta}."})

        preguntas = laboratorio.configuracion.get("preguntas", [])
        total_puntaje = sum(p.get("puntaje", 1) for p in preguntas) or 1
        puntaje_obtenido = 0
        for pregunta in preguntas:
            pid = str(pregunta.get("id"))
            if str(respuestas.get(pid)) == str(pregunta.get("respuesta_correcta")):
                puntaje_obtenido += pregunta.get("puntaje", 1)

        calificacion = round((puntaje_obtenido / total_puntaje) * 5, 2)

        progreso, _ = ProgresoLaboratorio.objects.get_or_create(
            estudiante=estudiante, laboratorio=laboratorio
        )
        progreso.datos_estado = {"respuestas": respuestas}
        progreso.estado = ProgresoLaboratorio.Estado.COMPLETADO
        progreso.porcentaje = 100
        progreso.calificacion = calificacion
        if not progreso.iniciado_en:
            progreso.iniciado_en = timezone.now()
        progreso.completado_en = timezone.now()
        progreso.save()

        return Response(ProgresoLaboratorioSerializer(progreso).data)


def _verificar_direccionamiento_ip(configuracion, datos):
    red_str = configuracion.get("red")
    prefijo = configuracion.get("prefijo")
    gateway_esperado = configuracion.get("gateway_esperado")

    try:
        red = ipaddress.ip_network(f"{red_str}/{prefijo}", strict=True)
    except (ValueError, TypeError):
        raise ValidationError("Laboratorio mal configurado: red/prefijo inválidos.")

    ip_texto = str(datos.get("ip", "")).strip()
    mascara_texto = str(datos.get("mascara", "")).strip()
    gateway_texto = str(datos.get("gateway", "")).strip()

    resultado = {}

    try:
        ip_obj = ipaddress.ip_address(ip_texto)
        if ip_obj not in red:
            resultado["ip"] = {"correcto": False, "mensaje": f"La IP debe pertenecer a la red {red}."}
        elif ip_obj == red.network_address:
            resultado["ip"] = {
                "correcto": False,
                "mensaje": "Esa es la dirección de red, no se puede asignar a un equipo.",
            }
        elif ip_obj == red.broadcast_address:
            resultado["ip"] = {
                "correcto": False,
                "mensaje": "Esa es la dirección de broadcast, no se puede asignar a un equipo.",
            }
        elif gateway_esperado and str(ip_obj) == gateway_esperado:
            resultado["ip"] = {"correcto": False, "mensaje": "Esa dirección ya está asignada al gateway."}
        else:
            resultado["ip"] = {"correcto": True, "mensaje": "IP válida."}
    except ValueError:
        resultado["ip"] = {"correcto": False, "mensaje": "Formato de IP inválido."}

    mascara_esperada = str(red.netmask)
    resultado["mascara"] = {
        "correcto": mascara_texto == mascara_esperada,
        "mensaje": "Máscara correcta."
        if mascara_texto == mascara_esperada
        else f"La máscara para /{prefijo} es {mascara_esperada}.",
    }

    resultado["gateway"] = {
        "correcto": gateway_texto == gateway_esperado,
        "mensaje": "Gateway correcto." if gateway_texto == gateway_esperado else f"El gateway de esta red es {gateway_esperado}.",
    }

    correcto_total = all(campo["correcto"] for campo in resultado.values())
    return correcto_total, resultado


class VerificarDireccionamientoIPView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        estudiante = _get_estudiante_o_403(request)
        laboratorio = get_object_or_404(
            Laboratorio,
            pk=pk,
            modulo_grado__grado=estudiante.grado,
            activo=True,
            tipo=Laboratorio.Tipo.DIRECCIONAMIENTO_IP,
        )
        datos = request.data or {}
        correcto, resultado = _verificar_direccionamiento_ip(laboratorio.configuracion, datos)

        progreso, _ = ProgresoLaboratorio.objects.get_or_create(
            estudiante=estudiante, laboratorio=laboratorio
        )
        campos_correctos = sum(1 for c in resultado.values() if c["correcto"])
        progreso.datos_estado = {
            "ultimo_intento": {
                "ip": datos.get("ip", ""),
                "mascara": datos.get("mascara", ""),
                "gateway": datos.get("gateway", ""),
            },
            "resultado": resultado,
        }
        progreso.porcentaje = round((campos_correctos / 3) * 100)
        progreso.estado = (
            ProgresoLaboratorio.Estado.COMPLETADO if correcto else ProgresoLaboratorio.Estado.EN_PROGRESO
        )
        if correcto:
            progreso.calificacion = 5.0
            progreso.completado_en = timezone.now()
        if not progreso.iniciado_en:
            progreso.iniciado_en = timezone.now()
        progreso.save()

        return Response(
            {
                "correcto": correcto,
                "resultado": resultado,
                "progreso": ProgresoLaboratorioSerializer(progreso).data,
            }
        )


class EntregarArchivoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        estudiante = _get_estudiante_o_403(request)
        laboratorio = get_object_or_404(
            Laboratorio,
            pk=pk,
            modulo_grado__grado=estudiante.grado,
            activo=True,
            tipo=Laboratorio.Tipo.ENTREGA_ARCHIVO,
        )
        archivo = request.FILES.get("archivo")
        if not archivo:
            raise ValidationError({"archivo": "Este campo es obligatorio."})

        progreso, _ = ProgresoLaboratorio.objects.get_or_create(
            estudiante=estudiante, laboratorio=laboratorio
        )
        progreso.archivo_entrega = archivo
        progreso.estado = ProgresoLaboratorio.Estado.COMPLETADO
        progreso.porcentaje = 100
        if not progreso.iniciado_en:
            progreso.iniciado_en = timezone.now()
        progreso.completado_en = timezone.now()
        progreso.save()

        return Response(ProgresoLaboratorioSerializer(progreso).data)
