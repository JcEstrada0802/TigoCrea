from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Categoria, Contenido, Produccion, Segmento
from django.db.models import Q
from backend.permissions import *
from .utils.timeToFrame import timecode_to_frames, frames_to_timecode
from .Serializers import CatalogoCompletoSerializer

# ---------------------- CREATE DE SECCIONES ----------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated & (IsAdminUser | IsOnAirLogger)])
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
            {"error": f"Ocurrió un error inesperado al procesar la solicitud, {e}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated & (IsAdminUser | IsOnAirLogger)])
def createContenido(request):
    try:
        nombre = request.data.get('nombre')
        id_cont = request.data.get('id_cont')
        categoria_id = request.data.get('categoria')
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
@permission_classes([IsAuthenticated & (IsAdminUser | IsOnAirLogger)])
def createProduccion(request):
    try:
        titulo = request.data.get('titulo')
        duracion_total = request.data.get('duracion_total')
        origen = request.data.get('origen')
        orden_pauta = request.data.get('orden_pauta')
        contenido_id = request.data.get('contenido_id')
        tipo = request.data.get('tipo')
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
        
        duracion_frames = timecode_to_frames(duracion_total)
        if duracion_frames is None:
            return Response(
                {"error": "Formato de duración inválido. Use HH:MM:SS:FF"},
                status=status.HTTP_400_BAD_REQUEST
            )
        produccion = Produccion.objects.create(
           titulo = titulo,
           duracion_total=duracion_frames,
           orden_pauta=orden_pauta,
           origen=origen,
           type=tipo,
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
@permission_classes([IsAuthenticated & (IsAdminUser | IsOnAirLogger)])
def createSegmento(request):
    try:
        titulo = request.data.get('titulo')
        id_media = request.data.get('id_media')
        duracion = request.data.get('duracion')
        tc_in = request.data.get('tc_in')
        tc_out = request.data.get('tc_out')
        produccion_id = request.data.get("produccion_id")
        notas = request.data.get("notas")
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

        tcs_to_validate = {
            "duración": duracion,
            "TC In": tc_in,
            "TC Out": tc_out
        }
        try:
            results = {k: timecode_to_frames(v) for k, v in tcs_to_validate.items()}
            for campo, valor_f in results.items():
                if valor_f is None:
                    return Response(
                        {"error": f"El formato de {campo} es inválido. Use HH:MM:SS:FF"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                input_original = str(tcs_to_validate[campo])
                if valor_f == 0 and input_original != "00:00:00:00":
                    return Response(
                        {"error": f"El valor de '{campo}' es inválido."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
            duracion_f = results["duración"]
            tc_in_f = results["TC In"]
            tc_out_f = results["TC Out"]
            if tc_out_f <= tc_in_f:
                 return Response(
                    {"error": "El TC Out debe ser mayor al TC In."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Exception as e:
            return Response(
                {"error": "Formato de TimeCode incorrecto. Use HH:MM:SS:FF"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        segmento = Segmento.objects.create(
            titulo=titulo,
            id_media=id_media,
            duracion= duracion_f,
            tc_in= tc_in_f,
            tc_out= tc_out_f,
            notas=notas,
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
        print(f"error al crear segmento {e}")
        return Response(
            {"error": f"Error al crear el segmento, {e}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ---------------------- GET DE SECCIONES ----------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated & (IsAdminUser | IsOnAirLogger)])
def getCategorias(request):
    try:
        categorias = request.data.get('categorias',[])
        if not isinstance(categorias, list) or not categorias:
            return Response(
                {"error":"Debe proporcionar una lista válida de IDs de categoría."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if categorias[0]!=0:
            cats = Categoria.objects.filter(id__in=categorias)
        else:
            cats = Categoria.objects.all()

        data = [
            {
                "id": cat.id,
                "id_cat": cat.id_cat,
                "nombre": cat.nombre,
                "color": cat.color,
                "tipo": cat.tipo
            } 
            for cat in cats
        ]
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": f"Ocurrió un error al obtener las categorías, {e}"}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated & (IsAdminUser | IsOnAirLogger)])
def getContenidos(request):
    try:
        categorias = request.data.get('categorias',[])
        contenidos = request.data.get('contenidos', [])
        if not isinstance(categorias, list) or not categorias:
            return Response({"error": "Debe proporcionar una lista válida de IDs de categoría."}, 
                            status=status.HTTP_400_BAD_REQUEST)
        if categorias[0]!=0:
            contenidos = Contenido.objects.filter(
                categoria__in=categorias
            ).select_related('categoria').order_by('nombre')
        else:
            contenidos = Contenido.objects.all()

        if not contenidos.exists():
            return Response(status=status.HTTP_204_NO_CONTENT)

        data = [
            {
                "id": contenido.id,
                "id_cont": contenido.id_cont,
                "nombre": contenido.nombre, # Nombre del Contenido
                "notas": contenido.notas,
                "id_categoria": contenido.categoria.id,
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
@permission_classes([IsAuthenticated & (IsAdminUser | IsOnAirLogger)])
def getContenido(request):
    try:
        contenidos = request.data.get('contenidos', [])
        if not isinstance(contenidos, list) or not contenidos:
            return Response({"error": "Debe proporcionar una lista válida de IDs de categoría."}, 
                            status=status.HTTP_400_BAD_REQUEST)
        if contenidos[0]!=0:
            conts = Contenido.objects.filter(id__in=contenidos)
        else:
            conts = Contenido.objects.all()

        data = [
            {
                "id": contenido.id,
                "id_cont": contenido.id_cont,
                "nombre": contenido.nombre, # Nombre del Contenido
                "notas": contenido.notas,
                "id_categoria": contenido.categoria.id,
                "categoria_nombre": contenido.categoria.nombre, # Campo de la tabla Categoria
                "categoria_color": contenido.categoria.color,   # Campo de la tabla Categoria
            } 
            for contenido in conts
        ]
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": f"Ocurrió un error al obtener los contenidos, {e}"}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated & (IsAdminUser | IsOnAirLogger)])
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
                "duracion_total": frames_to_timecode(produccion.duracion_total),
                "origen":produccion.origen, 
                "contenido_id": produccion.contenido.id,
                "orden_pauta": produccion.orden_pauta,
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
@permission_classes([IsAuthenticated & (IsAdminUser | IsOnAirLogger)])
def getProduccion(request):
    try:
        producciones = request.data.get('producciones', [])
        if not isinstance(producciones, list) or not producciones:
            return Response({"error": "Debe proporcionar una lista válida de IDs de categoría."}, 
                            status=status.HTTP_400_BAD_REQUEST)
        if producciones[0]!=0:
            prods = Produccion.objects.filter(id__in=producciones)
        else:
            prods = Produccion.objects.all()


        data = [
            {
                "id": produccion.id,
                "titulo": produccion.titulo,
                "duracion_total": frames_to_timecode(produccion.duracion_total),
                "origen":produccion.origen, 
                "tipo": produccion.type,
                "contenido_id": produccion.contenido.id,
                "orden_pauta": produccion.orden_pauta,
                "contenido_nombre": produccion.contenido.nombre, 
                "categoria_color": produccion.contenido.categoria.color,
            } 
            for produccion in prods
        ]
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": f"Ocurrió un error al obtener los contenidos, {e}"}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated & (IsAdminUser | IsOnAirLogger)])
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
                "duracion": frames_to_timecode(segmento.duracion),
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
    
@api_view(['POST'])
@permission_classes([IsAuthenticated & (IsAdminUser | IsOnAirLogger)])
def getSegmento(request):
    try:
        segmentos = request.data.get('segmentos', [])
        if not isinstance(segmentos, list) or not segmentos:
            return Response({"error": "Debe proporcionar una lista válida de IDs de segmentos."}, 
                            status=status.HTTP_400_BAD_REQUEST)
        if segmentos[0]!=0:
            segments = Segmento.objects.filter(id__in=segmentos)
        else:
            segments = Segmento.objects.all()

        data = [
            {
                "id": segment.id,
                "titulo": segment.titulo,
                "id_media": segment.id_media,
                "duracion": frames_to_timecode(segment.duracion),
                "origen":segment.produccion.origen, 
                "produccion_id": segment.produccion.id,
                "tc_in": frames_to_timecode(segment.tc_in),
                "tc_out": frames_to_timecode(segment.tc_out),
                "notas": segment.notas,
                "produccion_nombre": segment.produccion.titulo, 
                "categoria_color": segment.produccion.contenido.categoria.color,
            } 
            for segment in segments
        ]
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": f"Ocurrió un error al obtener los contenidos, {e}"}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ---------------------- DELETE DE SECCIONES ----------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated & (IsAdminUser | IsOnAirLogger)])
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

# ---------------------- UPDATE DE SECCIONES ----------------------
@api_view(['POST', 'PUT']) # Soporta ambos, aunque PUT es el estándar para actualizar
@permission_classes([IsAuthenticated & (IsAdminUser | IsOnAirLogger)])
def updateCategoria(request):
    try:
        categoria_id = request.data.get('id')
        nombre = request.data.get('nombre')
        color = request.data.get('color')
        tipo = request.data.get('tipo')
        codigo = request.data.get('codigo')

        if not categoria_id:
            return Response({"error": "Se requiere el ID de la categoría para actualizar."}, 
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            categoria = Categoria.objects.get(id=categoria_id)
        except Categoria.DoesNotExist:
            return Response({"error": "Categoría no encontrada."}, status=status.HTTP_404_NOT_FOUND)

        if Categoria.objects.filter(nombre=nombre).exclude(id=categoria_id).exists():
            return Response({"error": f"Ya existe otra categoría con el nombre: {nombre}."}, 
                            status=status.HTTP_409_CONFLICT)

        if Categoria.objects.filter(color=color).exclude(id=categoria_id).exists():
            return Response({"error": f"Ya existe otra categoría con el color HEX: {color}."}, 
                            status=status.HTTP_409_CONFLICT)
        
        if Categoria.objects.filter(id_cat=codigo).exclude(id=categoria_id).exists():
            return Response({"error": f"Ya existe otra categoría con el código: {codigo}."}, 
                            status=status.HTTP_409_CONFLICT)

        categoria.nombre = nombre
        categoria.color = color
        categoria.tipo = tipo
        categoria.id_cat = codigo
        categoria.save()

        return Response({
            "message": "Categoría actualizada exitosamente",
            "categoria": {
                "id": categoria.id,
                "nombre": categoria.nombre,
                "color": categoria.color,
                "tipo": categoria.tipo,
                "id_cat": categoria.id_cat
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error al actualizar categoría: {e}")
        return Response({"error": f"Ocurrió un error inesperado, {e}"}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST', 'PUT'])
@permission_classes([IsAuthenticated & (IsAdminUser | IsOnAirLogger)])
def updateContenido(request):
    try:
        id_db = request.data.get('id') # El ID primario de la DB
        nombre = request.data.get('nombre')
        id_cont = request.data.get('id_cont')
        categoria_id = request.data.get('categoria')
        notas = request.data.get('notas')

        if not id_db:
            return Response({"error": "Se requiere el ID para actualizar."}, 
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            contenido = Contenido.objects.get(id=id_db)
        except Contenido.DoesNotExist:
            return Response({"error": "Contenido no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        duplicado = Contenido.objects.filter(
            (Q(id_cont=id_cont) | Q(nombre=nombre))
        ).exclude(id=id_db).first()
        
        if duplicado:
            return Response(
                {"error": f"Ya existe otro contenido con el identificador: {id_cont} o el nombre: {nombre}"},
                status=status.HTTP_409_CONFLICT
            )

        try:
            categoria_obj = Categoria.objects.get(pk=categoria_id)
        except Categoria.DoesNotExist:
             return Response({"error": "La Categoría seleccionada no existe."}, 
                            status=status.HTTP_404_NOT_FOUND)

        contenido.nombre = nombre
        contenido.id_cont = id_cont
        contenido.categoria = categoria_obj
        contenido.notas = notas
        contenido.save()

        return Response({
            "message": "Contenido actualizado exitosamente",
            "contenido": {
                "id": contenido.id,
                "id_cont": contenido.id_cont,
                "nombre": contenido.nombre
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error al actualizar contenido: {e}")
        return Response({"error": "Ocurrió un error inesperado."}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST', 'PUT'])
@permission_classes([IsAuthenticated & (IsAdminUser | IsOnAirLogger)])
def updateProduccion(request):
    try:
        id_db = request.data.get('id') # ID primario de la producción
        id_prod = request.data.get('id_prod')
        titulo = request.data.get('titulo')
        duracion_total = request.data.get('duracion_total')
        origen = request.data.get('origen')
        tipo = request.data.get('tipo')
        ordenPauta = request.data.get('orden_pauta')
        contenido_id = request.data.get('contenido_id')

        if not id_db:
            return Response({"error": "Se requiere el ID para actualizar."}, 
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            produccion = Produccion.objects.get(id=id_db)
        except Produccion.DoesNotExist:
            return Response({"error": "Producción no encontrada."}, status=status.HTTP_404_NOT_FOUND)

        if Produccion.objects.filter(titulo=titulo).exclude(id=id_db).exists():
            return Response(
                {"error": f"Ya existe otra producción con el título: {titulo}"},
                status=status.HTTP_409_CONFLICT
            )

        try:
            contenido_obj = Contenido.objects.get(pk=contenido_id)
        except Contenido.DoesNotExist:
            return Response(
                {"error": f"El Contenido con ID {contenido_id} no existe."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        duracion_f = timecode_to_frames(duracion_total)
        if duracion_f is None:
            return Response(
                {"error": "Formato de duración inválido. Use HH:MM:SS:FF"},
                status=status.HTTP_400_BAD_REQUEST
            )

        produccion.titulo = titulo
        produccion.duracion_total = duracion_f
        produccion.origen = origen
        produccion.contenido = contenido_obj
        produccion.orden_pauta = ordenPauta
        produccion.type = tipo
        produccion.save()

        return Response({
            "message": "Producción actualizada exitosamente",
            "produccion": {
                "id": produccion.id,
                "titulo": produccion.titulo,
                "duracion_total": str(produccion.duracion_total)
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error al actualizar producción: {e}")
        return Response(
            {"error": "Ocurrió un error inesperado al procesar la solicitud."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['POST', 'PUT'])
@permission_classes([IsAuthenticated & (IsAdminUser | IsOnAirLogger)])
def updateSegmento(request):
    try:
        id_db = request.data.get('id')  # ID primario del segmento
        titulo = request.data.get('titulo')
        id_media = request.data.get('id_media')
        duracion = request.data.get('duracion')
        tc_in = request.data.get('tc_in')
        tc_out = request.data.get('tc_out')
        produccion_id = request.data.get("produccion_id")
        notas = request.data.get("notas")

        if not id_db:
            return Response({"error": "Se requiere el ID para actualizar."}, 
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            segmento = Segmento.objects.get(id=id_db)
        except Segmento.DoesNotExist:
            return Response({"error": "Segmento no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        
        tcs_to_validate = {
            "duración": duracion,
            "TC In": tc_in,
            "TC Out": tc_out
        }
        
        try:
            results = {k: timecode_to_frames(v) for k, v in tcs_to_validate.items()}
            
            for campo, valor_f in results.items():
                if valor_f is None:
                    return Response(
                        {"error": f"El formato de '{campo}' es inválido. Debe ser HH:MM:SS:FF"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                input_original = str(tcs_to_validate[campo])
                if valor_f == 0 and input_original != "00:00:00:00":
                    return Response(
                        {"error": f"El valor de '{campo}' es inválido."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            duracion_f = results["duración"]
            tc_in_f = results["TC In"]
            tc_out_f = results["TC Out"]

            # Validación lógica de tiempos
            if tc_out_f <= tc_in_f:
                return Response(
                    {"error": "El TC Out debe ser mayor al TC In."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Exception:
            return Response(
                {"error": "Error al procesar los TimeCodes. Verifique el formato."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Segmento.objects.filter(id_media=id_media).exclude(id=id_db).exists():
            return Response(
                {"error": f"Ya existe otro segmento con el ID Media: {id_media}"},
                status=status.HTTP_409_CONFLICT
            )

        try:
            produccion_obj = Produccion.objects.get(pk=produccion_id)
        except Produccion.DoesNotExist:
            return Response(
                {"error": "La Producción seleccionada no existe."},
                status=status.HTTP_404_NOT_FOUND
            )

        segmento.titulo = titulo
        segmento.id_media = id_media
        segmento.duracion = duracion_f
        segmento.tc_in = tc_in_f
        segmento.tc_out = tc_out_f
        segmento.notas = notas
        segmento.produccion = produccion_obj
        segmento.save()

        return Response({
            "message": "Segmento actualizado exitosamente",
            "segmento": {
                "id": segmento.id,
                "titulo": segmento.titulo,
                "id_media": segmento.id_media
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error al actualizar segmento: {e}")
        return Response(
            {"error": "Ocurrió un error inesperado al procesar la solicitud."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
# ------------------- GET DE CATALOGO COMPLETO -------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getFullCatalog(request):
    try:
        # Traemos categorías y pre-cargamos toda la cadena hacia abajo
        queryset = Categoria.objects.all().prefetch_related(
            'contenidos__producciones__segmentos'
        )
        
        serializer = CatalogoCompletoSerializer(queryset, many=True)
        return Response(serializer.data)
    
    except Exception as e:
        return Response({"error": str(e)}, status=500)