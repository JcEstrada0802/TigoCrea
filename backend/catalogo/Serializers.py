from rest_framework import serializers
from .models import Categoria, Contenido, Produccion, Segmento
from .utils.timeToFrame import frames_to_timecode

class SegmentoSerializer(serializers.ModelSerializer):
    duracion_tc = serializers.SerializerMethodField()
    in_tc = serializers.SerializerMethodField()
    out_tc = serializers.SerializerMethodField()

    class Meta:
        model = Segmento
        fields = [
            'id', 
            'id_media', 
            'titulo', 
            'duracion',      # Frames originales (para cálculos)
            'duracion_tc',   # HH:MM:SS:FF (para vista)
            'tc_in',         # Frames in
            'in_tc',         # HH:MM:SS:FF (para vista)
            'tc_out',        # Frames out
            'out_tc',        # HH:MM:SS:FF (para vista)
            'notas'
        ]

    def get_duracion_tc(self, obj):
        return frames_to_timecode(obj.duracion)

    def get_in_tc(self, obj):
        return frames_to_timecode(obj.tc_in)

    def get_out_tc(self, obj):
        return frames_to_timecode(obj.tc_out)

class ProduccionSerializer(serializers.ModelSerializer):
    # Anidamos los segmentos que pertenecen a esta producción
    segmentos = SegmentoSerializer(many=True, read_only=True)

    class Meta:
        model = Produccion
        fields = ['id', 'titulo', 'origen', 'duracion_total', 'segmentos', 'orden_pauta']

class ContenidoSerializer(serializers.ModelSerializer):
    # Anidamos las producciones
    producciones = ProduccionSerializer(many=True, read_only=True)

    class Meta:
        model = Contenido
        fields = ['id', 'id_cont', 'nombre', 'producciones']

class CatalogoCompletoSerializer(serializers.ModelSerializer):
    # El nivel superior: Categoría anidando contenidos
    contenidos = ContenidoSerializer(many=True, read_only=True)

    class Meta:
        model = Categoria
        fields = ['id', 'id_cat', 'nombre', 'color', 'tipo', 'contenidos']