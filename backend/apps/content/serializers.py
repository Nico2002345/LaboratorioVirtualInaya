from rest_framework import serializers

from apps.academics.models import Grado
from apps.academics.serializers import GradoSerializer

from .models import Contenido, Material, Modulo, ModuloGrado


class ModuloSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modulo
        fields = ["id", "nombre", "descripcion", "icono"]


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ["id", "contenido", "nombre", "archivo", "enlace", "tipo", "subido_en"]
        read_only_fields = ["id", "subido_en"]
        extra_kwargs = {"contenido": {"required": True}}

    def validate(self, attrs):
        archivo = attrs.get("archivo", getattr(self.instance, "archivo", None))
        enlace = attrs.get("enlace", getattr(self.instance, "enlace", ""))
        if not archivo and not enlace:
            raise serializers.ValidationError("Debes adjuntar un archivo o un enlace.")
        return attrs


class ContenidoSerializer(serializers.ModelSerializer):
    materiales = MaterialSerializer(many=True, read_only=True)

    class Meta:
        model = Contenido
        fields = [
            "id",
            "modulo_grado",
            "titulo",
            "descripcion",
            "cuerpo",
            "orden",
            "publicado",
            "materiales",
        ]
        read_only_fields = ["id"]


class ContenidoResumenSerializer(serializers.ModelSerializer):
    materiales = MaterialSerializer(many=True, read_only=True)

    class Meta:
        model = Contenido
        fields = ["id", "titulo", "descripcion", "cuerpo", "orden", "materiales"]


class ModuloGradoSerializer(serializers.ModelSerializer):
    modulo = ModuloSerializer(read_only=True)
    modulo_id = serializers.PrimaryKeyRelatedField(
        source="modulo", queryset=Modulo.objects.all(), write_only=True
    )
    grado = GradoSerializer(read_only=True)
    grado_id = serializers.PrimaryKeyRelatedField(
        source="grado", queryset=Grado.objects.all(), write_only=True
    )
    contenidos_count = serializers.SerializerMethodField()

    class Meta:
        model = ModuloGrado
        fields = ["id", "modulo", "modulo_id", "grado", "grado_id", "orden", "contenidos_count"]

    def get_contenidos_count(self, obj):
        return len(obj.contenidos.all())


class ModuloGradoConContenidosSerializer(ModuloGradoSerializer):
    contenidos = ContenidoResumenSerializer(many=True, read_only=True)

    class Meta(ModuloGradoSerializer.Meta):
        fields = ModuloGradoSerializer.Meta.fields + ["contenidos"]
