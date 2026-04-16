from django.shortcuts import render
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import ProtectedError, Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .models import BloqueCategoria, Bloque, Template, Calendario, Evento, PlaylistItem
from .serializers import *
from catalogo.utils.timeToFrame import timecode_to_frames
from backend.permissions import *
from .tasks import renderGridPDF, generate_castlist_xml
from datetime import datetime
from celery.result import AsyncResult
from django.http import HttpResponse

import os
import base64
from django.conf import settings

#----------------------- CARGAR BASE64 IMG PARA PDF -----------------------
logo_path = os.path.join(settings.BASE_DIR, 'imgs', 'logo.png')
with open(logo_path, "rb") as image_file:
    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
#--------------------------------------------------------------------------

# ------------------------------- CRUD DE CATBLOCKS -------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated & (IsAdLogger | IsOnAirLogger | IsAdminUser)])
def createBlockCat(request):
    try:
        nombre = request.data.get('nombre')
        color = request.data.get('color')
        if not nombre or not color:
            return Response({
                "error": "Faltan campos. Se requieren: 'nombre' y 'color'."
            }, status=status.HTTP_400_BAD_REQUEST)
        if(BloqueCategoria.objects.filter(nombre=nombre).exists()):
            return Response({
                "error": f"Error, Ya existe una categoria con nombre: {nombre}"
            }, status=status.HTTP_409_CONFLICT)
        if(BloqueCategoria.objects.filter(color=color).exists()):
            return Response({
                "error": f"Error, Ya existe una categoría con ese color"
            }, status=status.HTTP_409_CONFLICT)
        categoria_bloque = BloqueCategoria.objects.create(
            nombre=nombre,
            color=color
        )
        return Response({
            "mensaje": "Categoria de bloque creada exitosamente.",
            "categoria_bloque": {
                "id": categoria_bloque.id,
                "nombre": categoria_bloque.nombre,
                "color": categoria_bloque.color
            }
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({
            "error": f"Ocurrio un error inesperado al crear la categoría de blques, {e}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated & (IsAdLogger | IsOnAirLogger | IsAdminUser)])
def updateBlockCat(request, pk):
    categoria = get_object_or_404(BloqueCategoria, pk=pk)
    serializer = CatalogCategoriaSerializer(categoria, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated & (IsAdLogger | IsOnAirLogger | IsAdminUser)])
def deleteBlockCat(request, pk):
    categoria = get_object_or_404(BloqueCategoria, pk=pk)
    force_delete = request.query_params.get('force') == 'true'
    try:
        if force_delete:
            categoria.bloques.all().delete()
            categoria.delete()
            return Response({"message": "Categoría y sus bloques eliminados"}, status=status.HTTP_200_OK)
        else:
            categoria.delete()
            return Response({"message": "Categoría eliminada correctamente"}, status=status.HTTP_200_OK)

    except ProtectedError:
        conteo_bloques = categoria.bloques.count()
        return Response({
            "error": "protected_relation",
            "message": f"Esta categoría tiene {conteo_bloques} bloques asociados.",
            "conteo": conteo_bloques
        }, status=status.HTTP_400_BAD_REQUEST)

# ------------------------------- CRUD DE BLOQUES -------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated & (IsAdLogger | IsOnAirLogger | IsAdminUser)])
def createBlock(request):
    try:
        data = request.data
        nombre = data.get('nombre')
        tc_teorico = data.get('duracion_teorica') 
        tc_real = data.get('duracion_real')
        notas = data.get('notas', '')
        categoria_id = data.get('categoria_id')
        print(tc_teorico)
        if not all([nombre, tc_teorico, categoria_id]):
            return Response({
                "error": "Faltan campos obligatorios: nombre, duracion_teorica (TC) y categoria_id."
            }, status=status.HTTP_400_BAD_REQUEST)
        try:
            categoria = BloqueCategoria.objects.get(id=categoria_id)
        except BloqueCategoria.DoesNotExist:
            return Response({"error": "La categoría especificada no existe."}, status=status.HTTP_404_NOT_FOUND)
        frames_teoricos = timecode_to_frames(tc_teorico+":00")
        frames_reales = timecode_to_frames(tc_real+"00") if tc_real else 0
        nuevo_bloque = Bloque.objects.create(
            nombre=nombre,
            duracion_teorica=frames_teoricos,
            duracion_real=frames_reales,
            notas=notas,
            categoria=categoria
        )

        return Response({
            "mensaje": "Bloque creado exitosamente.",
            "bloque": {
                "id": nuevo_bloque.id,
                "nombre": nuevo_bloque.nombre,
                "duracion_frames": nuevo_bloque.duracion_teorica,
                "categoria": categoria.nombre
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({
            "error": f"Error inesperado: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated & (IsAdLogger | IsOnAirLogger | IsAdminUser)])
def updateBlock(request, pk):
    bloque = get_object_or_404(Bloque, pk=pk)
    data = request.data.copy() # Hacemos una copia para poder modificar los valores

    # Si viene la duración, hay que convertirla a frames (integer)
    tc_teorico = data.get('duracion_teorica')
    if tc_teorico:
        try:
            # Aplicamos tu lógica: sumamos ":00" para los cuadros y convertimos
            # Asumimos que el frontend manda HH:MM:SS
            frames_teoricos = timecode_to_frames(tc_teorico + ":00")
            data['duracion_teorica'] = frames_teoricos
        except Exception as e:
            return Response({"error": f"Formato de tiempo inválido: {str(e)}"}, 
                            status=status.HTTP_400_BAD_REQUEST)

    # Ahora el serializador ya recibe un entero en lugar de un string
    serializer = BloqueSerializer(bloque, data=data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated & (IsAdLogger | IsOnAirLogger | IsAdminUser)])
def deleteBlock(request, pk):
    bloque = get_object_or_404(Bloque, pk=pk)
    bloque.delete()
    return Response({"message" : "Bloque eliminado correctamente"},
                    status=status.HTTP_200_OK)

# ------------------------------- CATALOGO DE BLOQUES -------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated & (IsAdLogger | IsOnAirLogger | IsAdminUser)])
def getProgCatalog(request):
    try:
        categorias = BloqueCategoria.objects.all().prefetch_related('bloques')
        
        serializer = CatalogCategoriaSerializer(categorias, many=True)
        
        return Response(serializer.data)
    except Exception as e:
        return Response({
            "error": f"Error al obtener el catálogo: {str(e)}"
        }, status=500)
    
# ------------------------------ CATALOGO DE TEMPLATES -----------------------------  
@api_view(['GET'])
@permission_classes([IsAuthenticated & (IsAdLogger | IsOnAirLogger | IsAdminUser)])
def getTemplates(request):
    try:
        templates = Template.objects.all()
        if not templates.exists():
            return Response([], status=status.HTTP_200_OK)
        data = [
            {
                "id": t.id,
                "name": t.nombre,
                "eventos": t.eventos,
                "fecha": t.fecha_de_creacion.strftime('%d/%m/%Y %H:%M')
            } 
            for t in templates
        ]
        
        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": f"Error al obtener plantillas: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['POST'])
@permission_classes([IsAuthenticated & (IsAdLogger | IsOnAirLogger | IsAdminUser)])
def createTemplate(request):
    try:
        nombre = request.data.get('nombre')
        eventos_json = request.data.get('eventos')

        if not nombre or not eventos_json:
            return Response(
                {"error": "El nombre y los eventos son obligatorios."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Creamos el registro en la DB
        # Django se encarga de convertir el dict de Python a JSONB en Postgres
        nuevo_template = Template.objects.create(
            nombre=nombre,
            eventos=eventos_json,
            fecha_de_creacion=timezone.now()
        )

        return Response({
            "message": "Plantilla guardada exitosamente",
            "id": nuevo_template.id
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"Error al crear plantilla: {str(e)}")
        return Response(
            {"error": "Ocurrió un error interno en el servidor"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ------------------------------ CATALOGO DE CALENDARS -----------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated & (IsAdLogger | IsOnAirLogger | IsAdminUser)])
def getCalendars(request):
    try:
        calendarios = Calendario.objects.all()
        if not calendarios.exists():
            return Response([], status=status.HTTP_200_OK)
        data = [
            {
                "id": c.id,
                "name": c.nombre,
                "slug": c.slug
            }
            for c in calendarios
        ]
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"error": f"Error al obtener los calendarios: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
# ------------------------ OBTENER EVENTOS DE CALENDAR BY ID -----------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated & (IsAdLogger | IsOnAirLogger | IsAdminUser)])
def getEventsByCalendar(request):
    calendar_id = request.data.get('calendar_id')
    start_date = request.data.get('start_date')
    end_date = request.data.get('end_date')
    if not calendar_id:
        return Response({"error": "Falta el id del calendario"}, status=400)
    
    try:
        calendario = Calendario.objects.get(id=calendar_id)
        # Traemos todos los eventos vinculados a ese calendario
        eventos_qs = Evento.objects.filter(calendario=calendario)
        
        if start_date and end_date:
            eventos_qs = eventos_qs.filter(
                start__lt=end_date, 
                end__gt=start_date
            )

        # Formateamos para FullCalendar
        eventos_data = []
        for ev in eventos_qs:
            eventos_data.append({
                "id": ev.id,
                "title": ev.title,
                "start": ev.start.isoformat(),
                "end": ev.end.isoformat(),
                "backgroundColor": ev.background_color,
                "extendedProps": ev.extended_props 
            })

        return Response({
            "id": calendario.id,
            "name": calendario.nombre,
            "slug": calendario.slug,
            "eventos": eventos_data
        }, status=200)
        
    except Calendario.DoesNotExist:
        return Response({"error": "Calendario no encontrado"}, status=404)

# ---------------------------- CREATE/COPY/PASTE EVENTOS ---------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated & (IsAdLogger | IsOnAirLogger | IsAdminUser)])
def createEvent(request):
    data = request.data
    try:
        title = data.get('title')
        start = data.get('start')
        end = data.get('end')
        background_color = data.get('background_color', '#001EB4')
        extended_props = data.get('extended_props', {})
        calendario_id = data.get('calendar_id')


        if not calendario_id or not title or not start or not end or not background_color:
            return Response({"error": "Faltan campos, Campos requeridos: 'title', 'start', 'end', 'background_color', 'extended_props', 'calendario_id' "}, status=status.HTTP_400_BAD_REQUEST)

        nuevo_evento = Evento.objects.create(
            title=title,
            start=start,
            end=end,
            background_color=background_color,
            extended_props=extended_props,
            calendario_id=calendario_id # Django mapea el FK automáticamente
        )

        return Response({
            "id": nuevo_evento.id,
            "title": nuevo_evento.title,
            "start": nuevo_evento.start,
            "end": nuevo_evento.end,
            "backgroundColor": nuevo_evento.background_color,
            "extendedProps": nuevo_evento.extended_props,
            "message": "Evento creado exitosamente"
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"Error en createEvent: {str(e)}")
        return Response({"error": "Error interno del servidor"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated & (IsAdLogger | IsOnAirLogger | IsAdminUser)])
def bulkSave(request):
    eventos_data = request.data.get('eventos', [])
    if not eventos_data:
        return Response({"error": "No hay datos"}, status=400)

    try:
        eventos_a_crear = []
        for item in eventos_data:
            eventos_a_crear.append(Evento(
                title=item.get('title'),
                start=item.get('start'),
                end=item.get('end'),
                background_color=item.get('background_color'),
                extended_props=item.get('extended_props', {}),
                calendario_id=item.get('calendar_id')
            ))
        
        Evento.objects.bulk_create(eventos_a_crear)
        
        return Response({"message": f"{len(eventos_a_crear)} eventos creados"}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['PUT'])
@permission_classes([IsAuthenticated & (IsAdLogger | IsOnAirLogger | IsAdminUser)])
def updateEvent(request, pk):
    try:
        # Buscamos el evento por el ID que viene en la URL
        evento = Evento.objects.get(pk=pk)
        data = request.data

        # Actualizamos los campos
        # Usamos .get(campo, valor_actual) para no borrar datos si no vienen en el JSON
        start_val = data.get('start', evento.start)
        end_val = data.get('end', evento.end)
        evento.title = data.get('title', evento.title)
        evento.background_color = data.get('background_color', evento.background_color)
        evento.extended_props = data.get('extended_props', evento.extended_props)
        inicio = datetime.fromisoformat(start_val) if isinstance(start_val, str) else start_val
        fin = datetime.fromisoformat(end_val) if isinstance(end_val, str) else end_val
        evento.start = inicio
        evento.end = fin
        duracion = fin - inicio
        total_seconds = int(duracion.total_seconds())
        horas = total_seconds // 3600
        minutos = (total_seconds % 3600) // 60
        segundos = total_seconds % 60
        tc = f"{horas:02}:{minutos:02}:{segundos:02}:00"
        duracion_ff = timecode_to_frames(tc)
        evento.extended_props["duracion_ff"] = str(duracion_ff)
        evento.save()
        return Response({
            "message": "Evento actualizado correctamente",
            "id": evento.id
        }, status=status.HTTP_200_OK)

    except Evento.DoesNotExist:
        return Response({"error": "El evento no existe"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ---------------------- ACTUALIZACIÓN MASIVA (Shift + Drag) ----------------------
@api_view(['PUT'])
@permission_classes([IsAuthenticated & (IsAdLogger | IsOnAirLogger | IsAdminUser)])
def bulkUpdate(request):
    eventos_data = request.data.get('eventos', [])
    
    if not eventos_data:
        return Response({"error": "No se enviaron eventos para actualizar"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Usamos una transacción atómica: o se actualizan TODOS o NINGUNO
        with transaction.atomic():
            for item in eventos_data:
                # Actualizamos directamente en la DB usando el ID que viene en el objeto
                Evento.objects.filter(pk=item['id']).update(
                    start=item['start'],
                    end=item['end']
                )
        
        return Response({
            "message": f"Se actualizaron {len(eventos_data)} eventos exitosamente"
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error en bulkUpdate: {str(e)}")
        return Response({"error": "Error al procesar la actualización masiva"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['DELETE', 'POST'])
@permission_classes([IsAuthenticated & (IsAdLogger | IsOnAirLogger | IsAdminUser)])
def bulkDelete(request):
    try:
        ids = request.data.get('ids')
        if ids is None:
            return Response({'error': 'Faltan campos, campos requeridos: "ids.'},status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(ids, list):
            return Response({'error': 'el campo "ids" debe ser una lista/array.'}, status=status.HTTP_400_BAD_REQUEST)
        if not ids:
            return Response({'message': 'No se proporcionaron IDs para eliminar.'}, status=status.HTTP_200_OK)
        deleted_count, _ = Evento.objects.filter(id__in=ids).delete()
        return Response({
            "message": f'Se eliminaron {deleted_count} eventos exitosamente.',
            "deleted_count": deleted_count
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ---------------------------- EXPORTAR PARRILLA A PDF ----------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated & (IsAdLogger | IsOnAirLogger | IsAdminUser)])
def exportGridPDF(request):
    try:
        # 1. Recibimos los parámetros mínimos
        calendar_id = request.data.get('calendar_id')
        report_title = request.data.get('filename', 'Parrilla de Programación')
        start_date = request.data.get('start_date')  # ISO String desde el front
        end_date = request.data.get('end_date')      # ISO String desde el front

        # 2. Obtenemos datos del usuario para el encabezado
        user = request.user
        first_name = user.first_name if user.first_name else user.username
        last_name = user.last_name if user.last_name else ""

        # 3. Preparación del contexto para la tarea de Celery
        # Nota: Aquí no mandamos los logs todavía, los buscaremos dentro de la Task
        # para que el paso de datos a Celery sea ligero.
        context = {
            'calendar_id': calendar_id,
            'report_title': report_title,
            'start_date': start_date,
            'end_date': end_date,
            'export_date': datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
            'first_name': first_name,
            'last_name': last_name,
            'logo_data': encoded_string
        }
        # 4. Mandamos a Celery (renderGridPDF será tu nueva tarea)
        # Esta tarea se encargará de hacer el Queryset y armar el PDF
        task = renderGridPDF.delay(context)

        return Response(
            {
                "message": "Generando el PDF de la parrilla...",
                "task_id": task.id
            },
            status=status.HTTP_202_ACCEPTED
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated & (IsAdLogger | IsOnAirLogger | IsAdminUser)])
def deleteEvent(request, pk):
    try:
        # 1. Buscamos el bloque
        evento = Evento.objects.get(pk=pk)
        
        # 2. Validación: ¿El bloque es del pasado? (Opcional)
        # Si la fecha del bloque es menor a hoy, bloqueamos el borrado
        if evento.start.date() < timezone.now().date() and not request.user.is_superuser:
            return Response(
                {"error": "No puedes borrar bloques de días pasados."}, 
                status=status.HTTP_403_FORBIDDEN)

        # 3. Proceder con el borrado
        evento.delete()
        
        return Response(
            {"message": "Bloque eliminado exitosamente"}, 
            status=status.HTTP_200_OK
        )

    except Evento.DoesNotExist:
        return Response(
            {"error": "El bloque no existe o ya fue eliminado."}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": f"Error inesperado: {str(e)}"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
# ------------------ Guatdar playlist de un evento en especifico ------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated & (IsAdLogger | IsOnAirLogger | IsAdminUser)])
def savePlaylist(request):
    try:
        evento_id = request.data.get("evento_id")
        items = request.data.get("items",[])
        if not evento_id:
            return Response({"error", "Falta 'evento_id'"},
                            status=status.HTTP_400_BAD_REQUEST)
        with transaction.atomic():

            evento = Evento.objects.filter(id=evento_id).first()
            PlaylistItem.objects.filter(evento=evento).delete()

            if not evento:
                return Response({"error": "El evento no existe"}, status=status.HTTP_404_NOT_FOUND)
        
            items_a_crear = []
            for item in items:
                items_a_crear.append(PlaylistItem(
                    evento = evento,
                    segmento_id = item.get('segmento_id'),
                    orden = item.get('orden'),
                    tape = item.get('tape'),
                    start_time_ff = item.get('start_relativo'),
                    custom_id = item.get('custom_id'),
                    scotys = item.get('scotys'),
                    # AGREGAR TAPE Y OP_ID EN UN FUTURO
                ))

            PlaylistItem.objects.bulk_create(items_a_crear)
            total_frames_reales = PlaylistItem.objects.filter(evento=evento).aggregate(
                total=Sum('segmento__duracion')
            )['total'] or 0

            bloque_id = evento.extended_props.get('bloque_id')
            duracion_teorica = int(evento.extended_props.get('duracion_ff', 0))
            
            if bloque_id:
                bloque = Bloque.objects.filter(id=bloque_id).first()
                if bloque:
                    duracion_teorica = bloque.duracion_teorica

            if not isinstance(evento.extended_props, dict):
                evento.extended_props = {}
            
            MARGEN_TOLERANCIA_FRAMES = 3596
            diferencia = abs(total_frames_reales - duracion_teorica)
            print(diferencia)
            evento.extended_props['lleno'] = diferencia <= MARGEN_TOLERANCIA_FRAMES
            
            # Guardamos solo el campo necesario para no afectar otros props
            evento.save(update_fields=['extended_props'])
        return Response({
            "message": f"{len(items_a_crear)} items creados",
            "info": {
                "esta_lleno": evento.extended_props['lleno'],
                "total_reales": total_frames_reales,
                "duracion_teorica": duracion_teorica,
                "diferencia": total_frames_reales - duracion_teorica
            }
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {"error": f"Error inesperado: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# ------------------ Obtener playlist de un Evento en especifico ------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated & (IsAdLogger | IsOnAirLogger | IsAdminUser)])
def getPlaylist(request, pk):
    try:
        # 1. Verificamos si el evento existe
        evento = Evento.objects.filter(id=pk).first()
        if not evento:
            return Response({"error": "El bloque de programación no existe."}, 
                            status=status.HTTP_404_NOT_FOUND)
        
        # 2. Jalamos los items. 
        # Usamos select_related para traer de un solo golpe la info del segmento,
        # producción, contenido y categoría (evita el problema N+1).
        items = PlaylistItem.objects.filter(evento=evento).select_related(
            'segmento__produccion__contenido__categoria'
        ).order_by('orden')

        # 3. Serializamos la lista de items
        serializer = PlaylistItemSerializer(items, many=True)

        # 4. Retornamos la data nítida para React
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        # Corregí el error de sintaxis en tu diccionario de error (usabas coma en vez de dos puntos)
        return Response(
            {"error": f"Error inesperado al obtener la playlist: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['POST'])
@permission_classes([IsAuthenticated & (IsAdLogger | IsOnAirLogger | IsAdminUser)])
def exportPlaylist(request):
    fecha = request.data.get('fecha')
    calendar_id = request.data.get('calendar_id')
    
    if not calendar_id:
        return Response({"error","Faltan campos. Campos necesarios: 'calendar_id', 'fecha'"},
                        status=status.HTTP_400_BAD_REQUEST)
    try:
        # Mandamos a llamar la tarea de Celery de forma asíncrona
        # .delay() es lo que mete la tarea a la cola (Redis/RabbitMQ)
        task = generate_castlist_xml.delay(calendar_id, fecha)

        return Response({
            "message": "Exportación iniciada en segundo plano.",
            "task_id": task.id
        }, status=status.HTTP_202_ACCEPTED)

    except Exception as e:
        return Response({"error", "Error inesperado en el servidor."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@permission_classes([AllowAny])
def getPlaylistCLF(request):
    try:
        titulo = request.query_params.get('titulo')
        task_id = request.query_params.get('taskId')
        print("taskID: ", task_id)
        task = AsyncResult(task_id)
        clf_binary = task.result

        fecha_archivo = "export"
        if task.args and len(task.args) > 1:
            fecha_archivo = task.args[1]

        response = HttpResponse(clf_binary, content_type='application/xml')
        response['Content-Disposition'] = f'attachment; filename="{titulo}_{fecha_archivo}.clf"'
        return response

    except Exception as e:
        return Response(
            {'error': str(e), 'message': 'No se pudo consultar el estado de la tarea.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    