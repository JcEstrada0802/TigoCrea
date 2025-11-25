from django.apps import AppConfig
import threading
import os


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'reporteria'

    def ready(self):
        if os.environ.get("RUN_MAIN") == "true":  # Evita que corra en cada reload de dev
            from .watcher import watcher
            threading.Thread(target=watcher.watcher, daemon=True).start()

    
