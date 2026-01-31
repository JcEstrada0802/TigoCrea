from django.db import models
from django.core.validators import MinValueValidator

class BloqueCategoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True, verbose_name="Nombre de Categoría")
    # Para que en React uses un ColorPicker y se vea igual que el item_color del .clf
    color = models.CharField(
        max_length=7, 
        default='#3b82f6', 
        help_text="Color en formato HEX (ej: #FF5733)"
    )

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Categoría de Bloque"
        verbose_name_plural = "Categorías de Bloques"

class Bloque(models.Model):
    nombre = models.CharField(max_length=200, verbose_name="Nombre del Bloque")
    categoria = models.ForeignKey(
        BloqueCategoria, 
        on_delete=models.PROTECT, 
        related_name='bloques'
    )
    
    # Duración Teórica (Lo que debería durar el bloque en la parrilla)
    # Se guarda en cuadros (frames) para mantener la precisión SMPTE
    duracion_teorica = models.BigIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Duración Teórica (Frames)"
    )
    
    # Duración Real (Suma de los segmentos hijos)
    duracion_real = models.BigIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Duración Real (Frames)"
    )

    # Metadata extra para el .clf
    notas = models.TextField(blank=True, null=True, help_text="Comentarios para el operador")

    def __str__(self):
        return f"{self.nombre} [{self.categoria.nombre}]"

    class Meta:
        verbose_name = "Bloque"
        verbose_name_plural = "Bloques"
        ordering = ['nombre']
