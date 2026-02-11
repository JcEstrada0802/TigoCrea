from rest_framework import serializers
from .models import Bloque, BloqueCategoria

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