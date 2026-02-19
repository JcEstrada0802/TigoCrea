import traceback
from datetime import datetime, timedelta
from celery import shared_task
from django.template.loader import render_to_string
from weasyprint import HTML
from .models import Evento
from datetime import time

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