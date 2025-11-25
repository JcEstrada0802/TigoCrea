from django.db import models

# Modelo: Categoria
class Categoria(models.Model):
    id_cat = models.CharField(max_length=10, unique=True)
    nombre = models.CharField(max_length=255, unique=True)
    color = models.CharField(max_length=7, unique=True) # Para guardar el HEX, e.g., #FFFFFF
    tipo = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'

# Modelo: Contenido
class Contenido(models.Model):
    id_cont = models.CharField(max_length=10, unique=True)
    nombre = models.CharField(max_length=255, unique=True)
    categoria = models.ForeignKey(
        Categoria, 
        on_delete=models.CASCADE, 
        related_name='contenidos'
    )

    def __str__(self):
        return self.nombre

# Modelo: Produccion
class Produccion(models.Model):
    id_prod = models.CharField(max_length=10, unique=True)
    titulo = models.CharField(max_length=255)
    media_id = models.CharField(max_length=255, help_text="Nombre del archivo de video/audio")
    contenido = models.ForeignKey(
        Contenido, 
        on_delete=models.CASCADE, 
        related_name='producciones'
    )
    duracion = models.DurationField() # Perfecto para 'interval'
    origen = models.CharField(max_length=100)
    logo = models.CharField(max_length=100, blank=True, null=True) # Opcional
    expiracion = models.DateField(blank=True, null=True) # Opcional
    episodio = models.IntegerField(blank=True, null=True) # Opcional

    def __str__(self):
        return self.titulo

    class Meta:
        verbose_name = 'Producción'
        verbose_name_plural = 'Producciones'

# Modelo: Segmento
class Segmento(models.Model):
    produccion = models.ForeignKey(
        Produccion, 
        on_delete=models.CASCADE, 
        related_name='segmentos'
    )
    
    # Aquí puedes agregar más campos después...
    # Ejemplo:
    # nombre_segmento = models.CharField(max_length=255, blank=True)
    # tiempo_inicio = models.DurationField(blank=True, null=True)

    def __str__(self):
        # Muestra el título de la producción y el ID del segmento
        return f"Segmento {self.id} de {self.produccion.titulo}"

    class Meta:
        verbose_name = 'Segmento'
        verbose_name_plural = 'Segmentos'