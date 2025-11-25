from django.urls import path
from . import views
from .views import getCategorias, createCategoria, getContenidos, createContenido



urlpatterns = [ path('getCategorias/', getCategorias, name='getCategorias'),
                path('getContenidos/', getContenidos, name='getContenidos'),
                path('createCategoria/', createCategoria, name='createCategoria'),
                path('createContenido/', createContenido, name='createContenido'),]
