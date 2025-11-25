from django.db import models

# -------------------------------------------------------------------
# Broadcast Systems
# -------------------------------------------------------------------
class BroadcastSystem(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)  # version eliminada

    class Meta:
        db_table = 'broadcast_systems'

    def __str__(self):
        return self.name


# -------------------------------------------------------------------
# AsRun Log Files
# -------------------------------------------------------------------
class AsRunLogFile(models.Model):
    system = models.ForeignKey(BroadcastSystem, on_delete=models.RESTRICT, related_name='log_files')
    file_name = models.CharField(max_length=255)
    upload_date = models.DateTimeField(auto_now_add=True)  # timestamptz
    processed_by = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'asrun_log_files'

    def __str__(self):
        return self.file_name


# -------------------------------------------------------------------
# Log Entries
# -------------------------------------------------------------------
class LogEntry(models.Model):
    start_time = models.DateTimeField()  # timestamptz
    end_time = models.DateTimeField(blank=True, null=True)  # timestamptz
    duration = models.DurationField(blank=True, null=True)  # interval
    title = models.CharField(max_length=255)
    contents = models.TextField(blank=True, null=True)
    clip_name = models.CharField(max_length=255, blank=True, null=True)
    metadata = models.JSONField(blank=True, null=True)  # JSONB
    event_type = models.CharField(max_length=100, blank=True, null=True)
    log_file = models.ForeignKey(AsRunLogFile, on_delete=models.CASCADE, related_name='entries')

    class Meta:
        db_table = 'log_entries'

    def __str__(self):
        return f"{self.title} ({self.start_time})"
    
# -------------------------------------------------------------------
# Log Entries
# -------------------------------------------------------------------

class Reportes(models.Model):
    id = models.AutoField(primary_key=True)  # serial autoincremental
    titulo = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    sistemas = models.JSONField()  # guarda un array de strings

    class Meta:
        db_table = 'reportes'
    
    def __str__(self):
        return self.titulo

