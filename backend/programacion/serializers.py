from rest_framework import serializers
from .models import Bloque, BloqueCategoria, PlaylistItem
from catalogo.Serializers import SegmentoSerializer # Importamos el tuyo
from catalogo.utils.timeToFrame import frames_to_timecode

class BloqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bloque
        fields = ['id', 'nombre', 'duracion_teorica', 'duracion_real']

class CatalogCategoriaSerializer(serializers.ModelSerializer):
    # 'bloques' es el related_name que definiste en el modelo
    bloques = BloqueSerializer(many=True, read_only=True)

    class Meta:
        model = BloqueCategoria
        fields = ['id', 'nombre', 'color', 'bloques']

class PlaylistItemSerializer(serializers.ModelSerializer):
    # Traemos los datos técnicos usando tu serializer existente
    segmento_data = SegmentoSerializer(source='segmento', read_only=True)
    
    # Traemos los nombres de la jerarquía superior
    cat_color = serializers.ReadOnlyField(source='segmento.produccion.contenido.categoria.color')
    prod_titulo = serializers.ReadOnlyField(source='segmento.produccion.titulo')
    cont_nombre = serializers.ReadOnlyField(source='segmento.produccion.contenido.nombre')

    class Meta:
        model = PlaylistItem
        fields = [
            'id', # ID del item en pauta
            'orden',
            'start_time_ff',
            'custom_id',
            'scotys',
            'tape',
            'op_id',
            'segmento_data',
            'cat_color',
            'prod_titulo',
            'cont_nombre',
        ]

    def to_representation(self, instance):
        # 1. Obtenemos la representación base (con segmento_data anidado)
        representation = super().to_representation(instance)
        
        # 2. Sacamos segmento_data
        segmento_data = representation.pop('segmento_data')
        
        # 3. Metemos cada campo de segmento_data al nivel principal
        for key, value in segmento_data.items():
            representation[key] = value
            
        # 4. Ajustamos nombres para que coincidan con tu objeto de React (CamelCase)
        representation['customID'] = representation.pop('custom_id')
        representation['startTC_FF'] = representation.pop('start_time_ff')
        
        return representation

        