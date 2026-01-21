from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .models import Categoria, Contenido, Produccion, Segmento
from django.db.models import Q

# ---------------------- CREATE DE SECCIONES ----------------------
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
        orden_pauta = request.data.get('orden_pauta')
        notas = request.data.get('notas')

        if not nombre or not id_cont or not categoria_id:
            return Response(
                {"error": "Faltan campos. Se requieren 'nombre', 'id_cont' y 'categoria_id'."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if Contenido.objects.filter(Q(id_cont=id_cont) | Q(nombre=nombre)).exists():
            return Response(
                {"error": f"Ya existe un Contenido con el identificador: {id_cont} o con el nombre: {nombre}"},
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
            orden_pauta=orden_pauta,
            notas=notas,
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

@api_view(['POST'])
@permission_classes([IsAdminUser])
def createProduccion(request):
    try:
        titulo = request.data.get('titulo')
        duracion_total = request.data.get('duracion_total')
        origen = request.data.get('origen')
        contenido_id = request.data.get('contenido_id')
        if not titulo or not duracion_total or not origen or not contenido_id:
            return Response(
                {"error": "Faltan campos, se requieren: id_prod, titulo, duracion_total, origen, contenido_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if Produccion.objects.filter(Q(titulo=titulo)).exists():
            return Response(
                {"error":"Ya existe una produccion con ese Título"},
                status=status.HTTP_409_CONFLICT
            )
        
        try:
            contenido_obj = Contenido.objects.get(pk=contenido_id)
        except Contenido.DoesNotExist:
            return Response(
                {"error": f"El Contenido con ID {contenido_id} no existe."},
                status=status.HTTP_404_NOT_FOUND
            )

        produccion = Produccion.objects.create(
           titulo = titulo,
           duracion_total=duracion_total,
           origen=origen,
           contenido=contenido_obj
        )

        return Response({
            "message": "Producción creada exitosamente",
            "contenido": {
                "id": produccion.id,
                "nombre": produccion.titulo,
                "contenid_id": produccion.contenido.id,
                "categoria_nombre": produccion.contenido.nombre
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"Error al crear produccion: {e}")
        return Response(
            {"error": f"Ocurrió un error inesperado al procesar la solicitud, {e}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAdminUser])
def createSegmento(request):
    try:
        titulo = request.data.get('titulo')
        id_media = request.data.get('id_media')
        duracion = request.data.get('duracion')
        tc_in = request.data.get('tc_in')
        tc_out = request.data.get('tc_out')
        produccion_id = request.data.get("produccion_id")
        if not id_media or not duracion or not tc_in or not tc_out:
            return Response(
                {"error":"Faltan Campos, se requieren: id_seg, id_media, duracion, tc_in, tc_out."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if Segmento.objects.filter(Q(id_media=id_media)).exists():
            return Response(
                {"error":"Ya existe un segmento con se id o con ese media id."},
                status=status.HTTP_409_CONFLICT
            )
        try:
            produccion_obj = Produccion.objects.get(pk=produccion_id)
        except Produccion.DoesNotExist:
            return Response(
                {"error": f"El Contenido con ID {produccion_id} no existe."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        segmento = Segmento.objects.create(
            titulo=titulo,
            id_media=id_media,
            duracion=duracion,
            tc_in=tc_in,
            tc_out=tc_out,
            produccion=produccion_obj
        )

        return Response({
            "message": "Segmento creada exitosamente",
            "contenido": {
                "id": segmento.id,
                "id_media": segmento.id_media,
                "produccion_id": segmento.produccion.id,
                "produccion_titulo": segmento.produccion.titulo
            }
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        print(f"Error al crear segmento {e}")
        return Response(
            {"Error": f"Ocurrió un error inesperado al procesar la solicitud, {e}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ---------------------- GET DE SECCIONES ----------------------
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
        if categorias[0]!=0:
            contenidos = Contenido.objects.filter(
                categoria__in=categorias
            ).select_related('categoria').order_by('nombre')
        else:
            contenidos = Contenido.objects.all()

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
        return Response({"error": f"Ocurrió un error al obtener los contenidos, {e}"}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def getProducciones(request):
    try:
        contenidos = request.data.get('contenidos',[])
        if not isinstance(contenidos, list) or not contenidos:
            return Response({"error": "Debe proporcionar una lista válida de IDs de Contenido."}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        if contenidos[0]!=0:
            producciones = Produccion.objects.filter(
                contenido__in=contenidos
            ).select_related('contenido').order_by('titulo')
        else:
            producciones = Produccion.objects.all()

        data = [
            {
                "id": produccion.id,
                "titulo": produccion.titulo,
                "duracion_total":produccion.duracion_total,
                "origen":produccion.origen, 
                "contenido_nombre": produccion.contenido.nombre, 
                "categoria_color": produccion.contenido.categoria.color,
            } 
            for produccion in producciones
        ]
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": f"Ocurrió un error al obtener los producciones, {e}"}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def getSegmentos(request):
    try:
        producciones = request.data.get('producciones',[])
        if not isinstance(producciones, list) or not producciones:
            return Response({"error": "Debe proporcionar una lista válida de IDs de producción."}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        if producciones[0]!=0:
            segmentos = Segmento.objects.filter(
                produccion__in=producciones
            ).select_related('produccion').order_by('id_media')
        else:
            segmentos = Segmento.objects.all()

        data = [
            {
                "id": segmento.id,
                "titulo": segmento.titulo,
                "id_media": segmento.id_media,
                "duracion":segmento.duracion,
                "origen":segmento.produccion.origen, 
                "produccion_nombre": segmento.produccion.titulo, 
                "categoria_color": segmento.produccion.contenido.categoria.color,
            } 
            for segmento in segmentos
        ]
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": f"Ocurrió un error al obtener los segmentos, {e}"}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# ---------------------- DELETE DE SECCIONES ----------------------
@api_view(['POST'])
@permission_classes([IsAdminUser])
def delete_item_catalogo(request):
    # Ahora esperamos recibir 'ids' y también la 'seccion'
    seccion = request.data.get('seccion') 
    ids = request.data.get('ids', [])

    # 1. Diccionario que mapea el texto al Modelo real
    mapa_modelos = {
        'categorias': Categoria,
        'contenidos': Contenido,
        'producciones': Produccion,
        'segmentos': Segmento
    }

    try:
        # 2. Validaciones básicas
        if seccion not in mapa_modelos:
            return Response({"error": "Sección no válida"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not isinstance(ids, list) or not ids:
            return Response({"error": "Se requieren IDs en formato lista"}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Obtenemos la clase del modelo según la sección
        modelo_clase = mapa_modelos[seccion]

        # 4. Borramos (Igual que antes, pero dinámico)
        eliminados, _ = modelo_clase.objects.filter(id__in=ids).delete()

        return Response(
            {"message": f"Se eliminaron {eliminados} elementos de {seccion} correctamente"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        print(f"Error al eliminar en {seccion}: {e}")
        return Response(
            {"error": f"Error interno al procesar la eliminación: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAdminUser])
def deleteCategorias(request):
    try:
        ids = request.data.get('ids')
        
        return Response(
            {"Todo bien": f"nitido {ids}"},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        print(f"Error, al procesar la solicitu, {e}")
        return Response(
            {"error": f"Error al Elminar las categorias, {e}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAdminUser])
def deleteContenidos(request):
    pass

@api_view(['POST'])
@permission_classes([IsAdminUser])
def deleteProducciones(request):
    try:
        ids = request.data.get('ids', [])
        if not isinstance(ids, list) or not ids:
            return Response(
                {"error": "Faltan Campos, se necesita ids"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        eliminados, _ = Produccion.objects.filter(id__in=ids).delete()
        return Response(
            {"message": f"Se eliminaron {eliminados} producciones correctamente"},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        print(f"Error, al procesar la solicitu, {e}")
        return Response(
            {"error": f"Error al Elminar las producciones, {e}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAdminUser])
def deleteSegmentos(request):
    try:
        ids = request.data.get('ids', [])
        if not isinstance(ids, list) or not ids:
            return Response(
                {"error": "Faltan Campos, se necesita ids"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        eliminados, _ = Segmento.objects.filter(id__in=ids).delete()
        return Response(
            {"message": f"Se eliminaron {eliminados} segmentos correctamente"},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        print(f"Error, al procesar la solicitu, {e}")
        return Response(
            {"error": f"Error al Elminar los Segmentos, {e}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )