import traceback
from datetime import datetime, timedelta
from celery import shared_task
from django.template.loader import render_to_string
from weasyprint import HTML
from .models import Evento
import time as tm
import urllib.parse
from django.db.models import Prefetch
from .models import Evento, PlaylistItem
import io
from lxml import etree

@shared_task
def renderGridPDF(context):
    try:
        calendar_id = context.get('calendar_id')
        raw_start = context.get('start_date').split('T')[0] 
        start_dt = datetime.strptime(raw_start, '%Y-%m-%d')
        end_dt = start_dt + timedelta(days=7)

        eventos_queryset = Evento.objects.filter(
            calendario_id=calendar_id,
            start__range=[start_dt, end_dt]
        ).order_by('start')

        HOUR_HEIGHT = 42 
        dias_data = []
        nombres_dias = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SAB', 'DOM']
        for i in range(7):
            fecha_actual = (start_dt + timedelta(days=i)).date()
            eventos_del_dia = []
            
            for ev in eventos_queryset:
                if ev.start.date() == fecha_actual:
                    h = ev.start.hour 
                    m = ev.start.minute
                    
                    top_val = int((h + (m / 60)) * HOUR_HEIGHT)
                    duracion_horas = (ev.end - ev.start).total_seconds() / 3600
                    height_val = int(duracion_horas * HOUR_HEIGHT)
                    
                    eventos_del_dia.append({
                        'title': ev.title,
                        'time_range': f"{ev.start.strftime('%H:%M')} - {ev.end.strftime('%H:%M')}",
                        'top_style': f"{top_val}px",
                        'height_style': f"{height_val}px",
                        'color': ev.background_color or '#001EB4'
                    })
            dias_data.append({
                'nombre': f"{nombres_dias[i]} {fecha_actual.day}/{fecha_actual.month}",
                'eventos': eventos_del_dia
            })

        full_context = {
            **context,
            'dias': dias_data,
            'horas': [f"{h:02d}:{m:02d}" for h in range(24) for m in (0, 30)],
            'slot_height': f"{HOUR_HEIGHT / 2}px",
            'total_height': f"{24 * HOUR_HEIGHT}px"
        }

        html_string = render_to_string('grid_pdf.html', full_context)
        return HTML(string=html_string).write_pdf()

    except Exception as e:
        print(traceback.format_exc())
        raise e
    
@shared_task
def generate_castlist_xml(calendar_id, fecha):
    try:
        current_time = tm.time()
        eventos = Evento.objects.filter(
            calendario_id=calendar_id,
            start__date=fecha
        ).prefetch_related(
            Prefetch(
                'playlist_items', 
                queryset=PlaylistItem.objects.select_related('segmento').order_by('orden')
            )
        ).order_by('start')

        xml_lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            f'<castlist fps="30M" list_upload_time="{current_time}">'
        ]

        item_counter = 0

        for evento in eventos:
            group_name = urllib.parse.quote(evento.title)
            event_color = urllib.parse.quote(evento.background_color)

            for item in evento.playlist_items.all():
                uri = urllib.parse.quote(item.segmento.id_media)
                duration = item.segmento.duracion
                
                start_time = '00:00:00' if item_counter == 0 else ""
                start_date = fecha if item_counter == 0 else ""
                scoty = item.scotys
                scoty = "Show" if scoty == "On" else "Hide"
                op_id = item.custom_id
                tape = urllib.parse.quote(item.tape) if (item.tape!=None) else ""
                notas = urllib.parse.quote(item.segmento.notas) if (item.segmento.notas!=None) else ""
                type = urllib.parse.quote(item.segmento.produccion.type) if (item.segmento.produccion.type!=None) else ""
                
                item_xml = f'''  <item uri="{uri}"
            start_type="Seq"
            start_time="{start_time}"
            start_date="{start_date}"
            tc_orig=""
            in_point="0"
            out_point="{duration}"
            duration="{duration}"
            key1_mode="{scoty}"
            trans_mode="Cut"
            trans_speed="Cut"
            lead_out="0"
            title="{uri}"
            comment="{notas}"
            group="{group_name}"
            type="{type}"
            tape_name="{tape}" 
            item_id="{op_id}"
            item_color="{event_color}"
            end_mode="none"
            tape_type="digital">
    </item>'''
                #Adelantar Manejo de:
                    #type - Agregar al catalogo
                    #Scotys - key1_mode (show o hide)
                    #item_id - op_id
                    #tape_name - tape
                xml_lines.append(item_xml)
                item_counter += 1

        xml_lines.append('</castlist>')
        
        final_xml = "\n".join(xml_lines)
        
        xml_output = io.BytesIO()
        xml_output.write(final_xml.encode('utf-8'))
        xml_output.seek(0)
        return xml_output.getvalue()

    except Exception as e:
        print(f"Error en generate_castlist_xml: {e}")
        raise e    

    # 3. Aquí podrías guardar el archivo en disco o S3
    # Por ahora, Celery puede retornar el string o la ruta del archivo guardado
    #file_path = f"exports/playlist_{fecha}_{calendar_id}.xml"
    # (Aquí iría tu lógica de guardado: open(file_path, 'w').write(final_xml))