from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer
from django.db import IntegrityError
from .processors import procesar_archivo
from decouple import config
from pathlib import Path
import os
import time

WATCH_FOLDERS = [
    Path(config('SERVER_PATH')+"/Air-manager"),
    Path(config('SERVER_PATH')+"/Dlg-ts+"),
    Path(config('SERVER_PATH')+"/Dlg-vix"),
    Path(config('SERVER_PATH')+"/Igson-cue"),
    Path(config('SERVER_PATH')+"/Marsis-vix"),
    Path(config('SERVER_PATH')+"/ProduccionTS+"),
    Path(config('SERVER_PATH')+"/Region+player"),
    Path(config('SERVER_PATH')+"/SquidPlus"),
    Path(config('SERVER_PATH')+"/SquidPlusLat"),
    Path(config('SERVER_PATH')+"/Xpression"),
    Path(config('SERVER_PATH')+"/Youplay"),
]

class MyHandler(FileSystemEventHandler):
    def on_created(self, event):
        file_path = event.src_path
        folder_path = os.path.dirname(file_path)
        folder_name = os.path.basename(folder_path)
        procesar_archivo(file_path, folder_name)
        time.sleep(1)
        # ext = os.path.splitext(file_path)[1].lower() Puede servir pa mas tarde xd

def watcher():
    observers = []
    for folder in WATCH_FOLDERS:
        if not os.path.exists(folder):
            os.makedirs(folder)
        handler = MyHandler()
        observer = Observer()
        observer.schedule(handler, folder, recursive=False)
        observer.start()
        observers.append(observer)

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        for observer in observers:
            observer.stop()
        for observer in observers:
            observer.join()