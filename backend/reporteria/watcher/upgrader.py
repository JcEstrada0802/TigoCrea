from reporteria.models import BroadcastSystem, AsRunLogFile, LogEntry

def upgrade(df_final, file_name, system_name, description, date):
    # 1. Buscar o crear el sistema
    system, _ = BroadcastSystem.objects.get_or_create(
        name=system_name, 
        description=description)

    # 2. Crear registro del archivo
    log_file = AsRunLogFile.objects.create(
        system=system,
        file_name=file_name,
        upload_date = date
    )

    # 3. Insertar cada fila como LogEntry
    entries = []
    for _, row in df_final.iterrows():
        entry = LogEntry(
            start_time=row['start_time'],
            end_time=row['end_time'],
            duration=row['duration'],
            title=row['title'],
            contents=row['content'],
            clip_name=row['clipname'],
            metadata=row['metadata'],
            event_type=row.get('event_type', None),
            log_file=log_file
        )
        entries.append(entry)

    # 4. Bulk insert para eficiencia
    LogEntry.objects.bulk_create(entries)

    print(f"✅ Insertados {len(entries)} eventos para archivo '{file_name}'")

    return log_file.id  # opcional: devolver el ID del archivo insertado
