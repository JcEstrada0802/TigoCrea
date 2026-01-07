# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from .models import BroadcastSystem, Reportes, AsRunLogFile, LogEntry
from .permissions import IsSuperUser
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .utils.report_export import build_report_data

# Prueba con Celery
from .tasks import renderPDF
from celery.result import AsyncResult

import os
import base64
from django.conf import settings
from django.http import HttpResponse

from io import BytesIO


#----------------------- CARGAR BASE64 IMG PARA PDF -----------------------
logo_path = os.path.join(settings.BASE_DIR, 'imgs', 'logo.png')
with open(logo_path, "rb") as image_file:
    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
#--------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getSystems(request):
    systems = BroadcastSystem.objects.all()
    data = [
        {
            "id": system.id,
            "name": system.name,
            "description": system.description
        } 
        for system in systems
    ]
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAdminUser])  # Solo superuser puede crear reportes
def crearReporte(request):
    try:
        titulo = request.data.get('titulo')
        sistemas = request.data.get('sistemas')
        descripcion = request.data.get('descripcion')

        if not titulo or not sistemas:
            return Response({"error": "Faltan campos"}, status=status.HTTP_400_BAD_REQUEST)

        reporte = Reportes.objects.create(
            titulo=titulo,
            sistemas=sistemas,
            descripcion=descripcion
        )

        return Response({
            "message": "Reporte creado exitosamente",
            "reporte": {
                "id": reporte.id,
                "titulo": reporte.titulo,
                "sistemas": reporte.sistemas
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getReports(request):
    try:
        reportes = Reportes.objects.all().order_by('id')
        data = [
            {
                "id":reporte.id,
                "titulo": reporte.titulo,
                "desc": reporte.descripcion
            }
            for reporte in reportes
        ]
        return Response(data)
    
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    request.user.auth_token.delete()  # elimina el token del user
    return Response({"message": "Sesión cerrada"}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated]) 
def getReport(request, report_id):
    try:
        reporte = get_object_or_404(Reportes, id=report_id)
        
        filters = request.data.get('filters', {})

        system_ids = reporte.sistemas
        log_files = AsRunLogFile.objects.filter(system_id__in=system_ids)
        log_file_ids = log_files.values_list('id', flat=True)
        logs_queryset = LogEntry.objects.filter(log_file_id__in=log_file_ids).exclude(Q(title='empty') | Q(title='')).distinct()

        if filters.get('start_time_min'):
            logs_queryset = logs_queryset.filter(start_time__gte=filters['start_time_min'])
        if filters.get('start_time_max'):
            logs_queryset = logs_queryset.filter(start_time__lte=filters['start_time_max'])
        if filters.get('title'):
            logs_queryset = logs_queryset.filter(Q(title__icontains=filters['title']) | Q(clip_name__icontains=filters['title']))

        logs_queryset = logs_queryset.order_by('-start_time').select_related('log_file__system')

        serialized_logs = [{
            'id': log.id, 'start_time': log.start_time, 'end_time': log.end_time,
            'duration': str(log.duration) if log.duration is not None else "", 'title': log.title, 'contents': log.contents,
            'clip_name': log.clip_name, 'metadata': log.metadata, 'event_type': log.event_type,
            'sistema': log.log_file.system.name
        } for log in logs_queryset]
        
        response_data = {
            'report_info': {
                'id': reporte.id,
                'titulo': reporte.titulo,
                'descripcion': reporte.descripcion,
                'sistemas': reporte.sistemas,
            },
            'logs': serialized_logs,
        }
        return Response(response_data, status=status.HTTP_200_OK)

    except Reportes.DoesNotExist:
        return Response({"error": "Reporte no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response({"error": "Ocurrió un error al procesar la solicitud."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def getReportDetail(request, report_id):
    try:
        reporte = get_object_or_404(Reportes, id=report_id)
        response_data = {
            'report_info': {
                'id': reporte.id,
                'titulo': reporte.titulo,
                'descripcion': reporte.descripcion,
                'sistemas': reporte.sistemas,
            }
        }
        return Response(response_data, status=status.HTTP_200_OK)

    except Reportes.DoesNotExist:
        return Response({"error": "Reporte no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response({"error": "Ocurrió un error al procesar la solicitud."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def exportReportPDF(request):
    try:
        logs = request.data.get('logs', [])
        report_title = request.data.get('report_title')
        export_date = request.data.get('export_date', 'N/A')
        first_name = request.data.get('first_name', 'N/A')
        last_name = request.data.get('last_name', 'N/A')
        sistemas = request.data.get('sistemas', 'N/A')
        

        total_transmitido = request.data.get('total_transmitido', len(logs))
        total_contratado = request.data.get('total_contratado', '0')                #PENDIENTE DE AGREGAR AL PDF
        porcentaje_diferencia = request.data.get('porcentaje_diferencia', '0')      #PENDIENTE DE AGREGAR AL PDF

        default_headers = ['Inicio', 'Título', 'Clip Name', 'Duración', 'Tipo', 'Program Block', 'Sistema']
        headers = request.data.get('headers', default_headers)
        nombres = ','.join(sistemas)

        ordered_logs, summary_logs, nombres = build_report_data(
            logs, headers, sistemas
        )

        context = {
            'logs': ordered_logs, 
            'headers': headers, 
            'report_title': report_title,
            'export_date': export_date,
            'logo_data': encoded_string,
            'first_name': first_name,
            'last_name': last_name,
            'nombres': nombres,
            'total_logs': len(logs), 
            'total_contratado': total_contratado,
            'total_transmitido': total_transmitido,
            'porcentaje_diferencia': porcentaje_diferencia,
            'summary_logs': summary_logs,
        }
        task = renderPDF.delay(context)

        return Response(
            {
                "message" : "Celery Esta Exportando el PDF",
                "task_id" : task.id
            },
            status=status.HTTP_202_ACCEPTED
        )

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response(
            {"error": e},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def getUserContext(request):
    try:
        user = request.user
        
        user_info = {
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "is_superuser": user.is_superuser,
            "is_staff": user.is_staff,
            "is_active": user.is_active,
            "groups": list(user.groups.values_list('name', flat=True)),
        }

        return Response(user_info, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateReport(request, report_id):
    try:
        # 1. Encontrar el reporte que se quiere editar usando el ID de la URL
        reporte = Reportes.objects.get(pk=report_id)
    except Reportes.DoesNotExist:
        # Si no se encuentra, devolver un error 404
        return Response({'error': 'El reporte no fue encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    # 2. Obtener los datos enviados desde React (formData)
    data = request.data
    
    # 3. Actualizar los campos del modelo con los nuevos datos
    # Usamos .get() para evitar errores si una llave no viene en los datos
    reporte.titulo = data.get('titulo', reporte.titulo)
    reporte.descripcion = data.get('descripcion', reporte.descripcion)
    reporte.sistemas = data.get('sistemas', reporte.sistemas)
    
    # Guardamos los cambios de los campos simples
    reporte.save()

    return Response({'message': 'Reporte actualizado exitosamente'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getReportStatus(request):
    try:
        task_id = request.query_params.get('taskId')
        task = AsyncResult(task_id)
        current_status = task.state
        response_data = {
            'task_id': task_id,
            'status': current_status,
            'message': 'Reporte en progreso'
        }

        if current_status == 'SUCCESS':
            response_data['message'] = 'Reporte generado con éxito.'
        elif current_status == 'FAILURE':
            response_data['message'] = f'Error en la generación del reporte: {task.info}'
        elif current_status in ('PENDING', 'STARTED', 'RETRY'):
            pass
        else:
            response_data['message'] = f'Estado de tarea desconocido: {current_status}'

        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e), 'message': 'No se pudo consultar el estado de la tarea.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getReportPDF(request):
    try:
        title = request.query_params.get('titulo')
        task_id = request.query_params.get('taskId')
        task = AsyncResult(task_id)
        pdf_file = task.result
        response = HttpResponse(pdf_file, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{title}.pdf"'
        return response

    except Exception as e:
        return Response(
            {'error': str(e), 'message': 'No se pudo consultar el estado de la tarea.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )