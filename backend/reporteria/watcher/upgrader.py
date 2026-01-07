from reporteria.models import BroadcastSystem, LogEntry
import pandas as pd

def upgrade(df_final, log_file_obj, system_name, description):
    entries = []
    for _, row in df_final.iterrows():
        # Validar que start_time no sea NaT de Pandas
        start = row['start_time'] if pd.notna(row['start_time']) else None
        
        entries.append(LogEntry(
            start_time=start,
            end_time=row['end_time'] if pd.notna(row['end_time']) else None,
            duration=row['duration'],
            title=row['title'],
            contents=row['content'],
            clip_name=row['clipname'],
            metadata=row['metadata'],
            event_type=row.get('event_type'),
            log_file=log_file_obj
        ))

    # 3. Bulk insert
    LogEntry.objects.bulk_create(entries)
    print(f"✅ Insertados {len(entries)} eventos para '{log_file_obj.file_name}'")