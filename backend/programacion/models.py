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

class Template(models.Model):
    nombre = models.CharField(
        max_length=100, 
        verbose_name="Nombre de la Plantilla"
    )
    fecha_de_creacion = models.DateTimeField(
        auto_now_add=True, 
        verbose_name="Fecha de Creación"
    )
    # Almacena el array de eventos limpio que obtenemos de FullCalendar
    eventos = models.JSONField(
        verbose_name="Contenido de la Plantilla",
        help_text="Array de objetos JSON con la data de los bloques"
    )

    def __str__(self):
        return f"{self.nombre} - {self.fecha_de_creacion.strftime('%d/%m/%Y')}"

    class Meta:
        verbose_name = "Plantilla"
        verbose_name_plural = "Plantillas"
        ordering = ['-fecha_de_creacion']

class Calendario(models.Model):
    nombre = models.CharField(max_length=100) # Ej: "Tigo Sports 1"
    slug = models.SlugField(unique=True)     # Ej: "canal-1"

    def __str__(self):
        return self.nombre
    
class Evento(models.Model):
    calendario = models.ForeignKey(Calendario, on_delete=models.CASCADE, related_name='eventos')
    title = models.CharField(max_length=200)
    start = models.DateTimeField()
    end = models.DateTimeField()
    background_color = models.CharField(max_length=7, default='#001EB4')
    
    # Aquí guardamos el objeto con: categoria, contenido, produccion, etc.
    extended_props = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.title} - {self.calendario.nombre}"
    
class PlaylistItem(models.Model):
    # Relación al bloque (Evento) y al clip (Segmento)
    evento = models.ForeignKey('Evento', on_delete=models.CASCADE, related_name='playlist_items')
    segmento = models.ForeignKey('catalogo.Segmento', on_delete=models.CASCADE, related_name='usado_en_items')

    # El "Motor" de la lista
    orden = models.PositiveIntegerField(default=0)
    
    # El cálculo del inicio lo hacemos en el Save o al exportar
    # Guardarlo aquí ayuda a que el query sea flash
    start_time_ff = models.BigIntegerField(default=0) 

    # Los extras de negocio
    custom_id = models.CharField(max_length=100, blank=True, null=True)
    scotys = models.CharField(max_length=10, default="Off")
    
    # Los del jefe
    tape = models.CharField(max_length=255, blank=True, null=True)
    op_id = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['orden']
