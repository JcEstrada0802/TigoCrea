from django.db import models
from datetime import timedelta


# Modelo: Categoria
class Categoria(models.Model):
    id = models.BigAutoField(primary_key=True)
    id_cat = models.CharField(max_length=10, unique=True)
    nombre = models.CharField(max_length=25, unique=True)
    color = models.CharField(max_length=7, unique=True) # HEX para FullCalendar
    tipo = models.CharField(max_length=25)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'

# Modelo: Contenido
class Contenido(models.Model):
    id = models.BigAutoField(primary_key=True)
    id_cont = models.CharField(max_length=10, unique=True)
    nombre = models.CharField(max_length=25, unique=True)
    orden_pauta = models.CharField(max_length=255, blank=True, null=True)
    notas = models.CharField(max_length=255, blank=True, null=True)
    categoria = models.ForeignKey(
        Categoria, 
        on_delete=models.CASCADE, 
        related_name='contenidos'
    )

    def __str__(self):
        return self.nombre

# Modelo: Produccion
class Produccion(models.Model):
    id = models.BigAutoField(primary_key=True)
    # id_prod = models.CharField(max_length=10, unique=True)
    titulo = models.CharField(max_length=50)
    duracion_total = models.BigIntegerField(default=0) # Mapea a interval
    origen = models.CharField(
        max_length=20, 
        help_text="Live-1, Live-2, Servidor"
    )
    contenido = models.ForeignKey(
        Contenido, 
        on_delete=models.CASCADE, 
        related_name='producciones'
    )
    type = models.CharField(max_length=255, default="")

    def __str__(self):
        return self.titulo

    class Meta:
        verbose_name = 'Producción'
        verbose_name_plural = 'Producciones'

# Modelo: Segmento
class Segmento(models.Model):
    id = models.BigAutoField(primary_key=True)
    titulo = models.CharField(max_length=100, default='PENDIENTE')
    id_media= models.CharField(max_length=255, default='PENDIENTE')
    duracion = models.BigIntegerField(default=0)
    tc_in = models.BigIntegerField(default=0)
    tc_out = models.BigIntegerField(default=0)
    notas = models.CharField(max_length=255, blank=True, null=True) # REMOVER ESTE CAMPO
    
    produccion = models.ForeignKey(
        Produccion, 
        on_delete=models.CASCADE, 
        related_name='segmentos'
    )

    def __str__(self):
        return f"Segmento {self.id_seg} de {self.produccion.titulo}"

    class Meta:
        verbose_name = 'Segmento'
        verbose_name_plural = 'Segmentos'