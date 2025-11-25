from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .models import Categoria, Contenido, Produccion, Segmento

@api_view(['POST'])
@permission_classes([IsAdminUser])
def createCategoria(request):
    try:
        nombre = request.data.get('nombre')
        color = request.data.get('color')
        tipo = request.data.get('tipo')
        codigo = request.data.get('codigo')

        if not nombre or not color or not tipo:
            return Response(
                {"error": "Faltan campos. Se requieren 'nombre', 'color' y 'tipo'."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        if Categoria.objects.filter(nombre=nombre).exists():
            return Response(
                {"error": f"Ya existe una categoría con el nombre: {nombre}."},
                status=status.HTTP_409_CONFLICT # 409 Conflict indica recurso duplicado
            )
        if Categoria.objects.filter(color=color).exists():
            return Response(
                {"error": f"Ya existe una categoría con el color HEX: {color}."},
                status=status.HTTP_409_CONFLICT)
        categoria = Categoria.objects.create(
            nombre=nombre,
            color=color,
            tipo=tipo,
            id_cat=codigo)
        return Response({
            "message": "Categoría creada exitosamente",
            "categoria": {
                "id": categoria.id,
                "nombre": categoria.nombre,
                "color": categoria.color,
                "tipo": categoria.tipo,
                "id_cat": categoria.id_cat
            }
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        print(f"Error al crear categoría: {e}")
        return Response(
            {"error": "Ocurrió un error inesperado al procesar la solicitud."}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAdminUser])
def createContenido(request):
    try:
        nombre = request.data.get('nombre')
        id_cont = request.data.get('id_cont')
        categoria_id = request.data.get('categoria')

        if not nombre or not id_cont or not categoria_id:
            return Response(
                {"error": "Faltan campos. Se requieren 'nombre', 'id_cont' y 'categoria_id'."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if Contenido.objects.filter(nombre=nombre).exists():
            return Response(
                {"error": f"Ya existe un Contenido con el nombre: {nombre}."},
                status=status.HTTP_409_CONFLICT
            )
        
        if Contenido.objects.filter(id_cont=id_cont).exists():
            return Response(
                {"error": f"Ya existe un Contenido con el identificador: {id_cont}."},
                status=status.HTTP_409_CONFLICT
            )
            
        try:
            categoria_obj = Categoria.objects.get(pk=categoria_id)
        except Categoria.DoesNotExist:
             return Response(
                {"error": f"La Categoría con ID {categoria_id} no existe."},
                status=status.HTTP_404_NOT_FOUND
            )

        contenido = Contenido.objects.create(
            nombre=nombre,
            id_cont=id_cont,
            categoria=categoria_obj
        )

        return Response({
            "message": "Contenido creado exitosamente",
            "contenido": {
                "id": contenido.id,
                "id_cont": contenido.id_cont,
                "nombre": contenido.nombre,
                "categoria_id": contenido.categoria.id,
                "categoria_nombre": contenido.categoria.nombre
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"Error al crear contenido: {e}")
        return Response(
            {"error": "Ocurrió un error inesperado al procesar la solicitud."}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getCategorias(request):
    try:
        categorias = Categoria.objects.all()
        data = [
            {
                "id": categoria.id,
                "nombre": categoria.nombre,
                "color": categoria.color,
                "tipo": categoria.tipo
            } 
            for categoria in categorias
        ]
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": "Ocurrió un error al obtener las categorías."}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def getContenidos(request):
    try:
        categorias = request.data.get('categorias',[])
        if not isinstance(categorias, list) or not categorias:
            return Response({"error": "Debe proporcionar una lista válida de IDs de categoría."}, 
                            status=status.HTTP_400_BAD_REQUEST)
        contenidos = Contenido.objects.filter(
            categoria__in=categorias
        ).select_related('categoria').order_by('nombre')

        data = [
            {
                "id": contenido.id,
                "nombre": contenido.nombre, # Nombre del Contenido
                "categoria_nombre": contenido.categoria.nombre, # Campo de la tabla Categoria
                "categoria_color": contenido.categoria.color,   # Campo de la tabla Categoria
            } 
            for contenido in contenidos
        ]
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": "Ocurrió un error al obtener los contenidos."}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)