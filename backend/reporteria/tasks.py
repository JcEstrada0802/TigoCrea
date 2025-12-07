import os
from weasyprint import HTML
from datetime import datetime
from celery import shared_task
from django.template.loader import render_to_string
from django.core.files.storage import default_storage

@shared_task
def renderPDF(context):
        # 1. Renderiza la plantilla HTML con el contexto
        html_string = render_to_string('report_pdf.html', context)

        # 2. Crea el objeto HTML con WeasyPrint
        html_content = HTML(string=html_string)
        
        # 3. Genera el PDF y lo guarda en memoria
        pdf_file = html_content.write_pdf()

        return pdf_file
