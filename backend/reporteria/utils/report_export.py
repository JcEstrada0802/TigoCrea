def build_report_data(logs, headers, sistemas):
    keys_map = {
        "SPOT TM": 0, "MEN+CINT TM": 1, "CINT TM": 2, "CAPS TM": 3,
        "GRAF TM": 4, "CROPL TM": 4, "PROP TM": 5, "RA TM": 4, "CORT TM": 6, "GRAF 3D TM": 4
    }

    summary_logs = [
        {"property": "SPOT", "contratado": 0, "transmitido": 0},
        {"property": "MEN+CINT", "contratado": 0, "transmitido": 0},
        {"property": "CINTILLO", "contratado": 0, "transmitido": 0},
        {"property": "CAPSULA", "contratado": 0, "transmitido": 0},
        {"property": "GRÁFICO", "contratado": 0, "transmitido": 0},
        {"property": "PROPIEDAD", "contratado": 0, "transmitido": 0},
        {"property": "SEGMENTOS", "contratado": 0, "transmitido": 0},
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