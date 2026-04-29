def build_report_data(logs, headers, sistemas):
    keys_map = {
        "SP TM": 0,             #SPOT
        "M+C TM": 1,            #MEN+CINT
        "M+CG TM": 1,           #MEN+CINT GRABADO
        "CIN TM": 2,            #CINTILLO
        "CAPS TM": 3,
        "GRAF TM": 4,           #GRAFICO
        "CRL TM": 4,            #CROP-L
        "RA TM": 4,             #REALIDAD
        "GRAF 3D TM": 4,        #GRAFICO 3D
        "LM TM": 4,             #LOGO MARCADOR
        "CUP TM": 4,            #CINTILLO UP
        "PROP TM": 5,           #PROPIEDAD
        "COR TM": 6,            #CORTINILLA
        "SEG TM": 6,            #SEGMENTO
        "SJP TM": 6,            #SEGMENTO JDP
        "PP TM": 7,             #PRODUCT PLACEMENT
        "PPS TM": 7,            #PRODUCT PLACEMENT SHOW
        "FT TM": 8,             #FULLTRACK
        "FTS TM": 9,            #FULLTRACK SEDE
    }

    summary_logs = [
        {"property": "SPOT", "contratado": 0, "transmitido": 0},
        {"property": "MEN+CINT", "contratado": 0, "transmitido": 0},
        {"property": "CINTILLO", "contratado": 0, "transmitido": 0},
        {"property": "CAPSULA", "contratado": 0, "transmitido": 0},
        {"property": "GRÁFICO", "contratado": 0, "transmitido": 0},
        {"property": "PROPIEDAD", "contratado": 0, "transmitido": 0},
        {"property": "SEGMENTOS", "contratado": 0, "transmitido": 0},
        {"property": "PRODUCT", "contratado": 0, "transmitido": 0},
        {"property": "FULL TRACK", "contratado": 0, "transmitido": 0},
        {"property": "FULL TRACK SEDE", "contratado": 0, "transmitido": 0},
    ]

    column_key_map = {
            'Inicio': 'start_time',
            'Título': 'title',
            'Clip Name': 'clip_name',
            'Duración': 'duration',
            'Tipo': 'event_type',
            'Sistema': 'sistema',
            'Program Block': lambda log: log.get('metadata', {}).get('program_block', '')
        }
    
    for log in logs:
            log['start_time'] = log['start_time'].split(', ')[0]
            title = log.get('title', '').upper()
            clipname = log.get('clip_name',  '').upper()
            for key, index in keys_map.items():
                if ((key in title) or (key in clipname)):
                    summary_logs[index]['transmitido'] += 1
                    break

    summary_logs = [
        s for s in summary_logs
        if s['transmitido'] or s['contratado']
    ]

    ordered_logs = []
    for log in logs:
        row = []
        for h in headers:
            mapper = column_key_map.get(h)
            if callable(mapper):
                row.append(mapper(log))
            elif mapper:
                row.append(log.get(mapper, ''))
            else:
                row.append('')
        ordered_logs.append(row)

    return ordered_logs, summary_logs, ','.join(sistemas)