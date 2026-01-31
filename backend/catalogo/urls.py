from django.urls import path
from . import views
from .views import *



urlpatterns = [ path('getCategorias/', getCategorias, name='getCategorias'),                    # GET
                path('getContenidos/', getContenidos, name='getContenidos'),
                path('getContenido/', getContenido, name='getContenido'),
                path('getProducciones/', getProducciones, name='getProducciones'),
                path('getProduccion/', getProduccion, name='getProduccion'),
                path('getSegmentos/', getSegmentos, name='getSegmentos'),
                path('getSegmento/', getSegmento, name='getSegmento'),
                path('createCategoria/', createCategoria, name='createCategoria'),              # CREATE
                path('createContenido/', createContenido, name='createContenido'),
                path('createProduccion/', createProduccion, name='createProduccion'),
                path('createSegmento/', createSegmento, name='createSegmento'),
                path('deleteCategorias/', delete_item_catalogo, name='deleteCategorias'),       # DELETE
                path('deleteContenidos/', delete_item_catalogo, name='deleteContenidos'),
                path('deleteProducciones/', delete_item_catalogo, name='deleteProducciones'),
                path('deleteSegmentos/', delete_item_catalogo, name='deleteSegmentos'),
                path('updateCategoria/', updateCategoria, name='updateCategorias'),             # UPDATE
                path('updateContenido/', updateContenido, name='updateContenido'),
                path('updateProduccion/', updateProduccion, name='updateProduccion'),
                path('updateSegmento/', updateSegmento, name='updateSegmento'),]          

