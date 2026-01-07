import os
import time
from pathlib import Path
from watchdog.events import FileSystemEventHandler
# IMPORTANTE: Cambiamos el Observer normal por el PollingObserver
from watchdog.observers.polling import PollingObserver as Observer
from decouple import config
from .processors import procesar_archivo

WATCH_FOLDERS = [
    Path(config('SERVER_PATH') + "/Air-manager"),
    Path(config('SERVER_PATH') + "/Dlg-ts+"),
    Path(config('SERVER_PATH') + "/Dlg-vix"),
    Path(config('SERVER_PATH') + "/Igson-cue"),
    Path(config('SERVER_PATH') + "/Marsis-vix"),
    Path(config('SERVER_PATH') + "/ProduccionTS+"),
    Path(config('SERVER_PATH') + "/Region+player"),
    Path(config('SERVER_PATH') + "/SquidPlus"),
    Path(config('SERVER_PATH') + "/SquidPlusLat"),
    Path(config('SERVER_PATH') + "/Xpression"),
    Path(config('SERVER_PATH') + "/Youplay"),
]

class MyHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory: return
        
        # Ignorar archivos temporales de sistema
        if event.src_path.endswith(('.tmp', '.crdownload')): return

        time.sleep(3) # Tiempo de gracia para que el archivo se suelte
        procesar_archivo(Path(event.src_path), os.path.basename(os.path.dirname(event.src_path)))

def watcher():
    observer = Observer(timeout=2) # Scaneo cada 2 seg
    for folder in WATCH_FOLDERS:
        if not os.path.exists(folder): os.makedirs(folder, exist_ok=True)
        observer.schedule(MyHandler(), str(folder), recursive=False)
    
    observer.start()
    print("🚀 Watcher iniciado con protección anti-duplicados")
    try:
        while True: time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()