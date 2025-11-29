from datetime import timedelta, datetime
from reporteria.models import AsRunLogFile
from zoneinfo import ZoneInfo
from .upgrader import upgrade
from pathlib import Path
import numpy as np
import pandas as pd
import csv
import time, os
import re

def is_file_processed(file_name: str) -> bool:
    """Verifica si un archivo ya tiene un registro en la base de datos."""
    return AsRunLogFile.objects.filter(file_name=file_name).exists()

# MAIN PROCESOR
def procesar_archivo(ruta: Path, system) -> dict:
    ext = os.path.splitext(ruta)[1].lower()
    file_name = os.path.basename(ruta)

    print(system)

    """if is_file_processed(file_name):
        print(f"[SKIP] Archivo '{file_name}' (de ayer) ya se encuentra procesado.")
        return"""
    

    for attempt in range(3):
        try:
            match system:
                case "Air-manager":             # LISTO
                    PAM(ruta)
                case "Dlg-ts+":                 # LISTO
                    PDLG(ruta, "DLG TS+")       
                case "Dlg-vix":                 # LISTO
                    PDLG(ruta, "DLG vix")     
                case "Igson-cue":               # LISTO
                    PCI(ruta)  
                case "Marsis-vix":              # LISTO
                    PFV(ruta, 'Marsis-vix')
                case "ProduccionTS+":           # LISTO
                    PRF(ruta, "MediaPlayTS+")
                case "Region+player":           # EN ESPERA DE ASRUNLOG
                    PRP(ruta)
                case "SquidPlus":               # LISTO
                    PSF(ruta, "Squid TS+")      
                case "SquidPlusLat":            # LISTO
                    PSF(ruta, "Squid Latino")   
                case "Xpression":               # LISTO
                    PXP(ruta)                   
                case "Youplay":                 # EN ESPERA DE ASRUNLOG
                    PUP(ruta)
            break  # si llega aquí, ya salió bien y rompemos el loop
        except UnicodeDecodeError as e:
            print(f"[WARN] Error de encoding en {ruta}, intento {attempt+1}/3")
            time.sleep(1)  # esperamos antes de reintentar
        except Exception as e:
            print(f"[ERROR] Falló procesar {ruta}: {e}")
            break

# PROCESS AIR MANAGER FILES
def PAM(ruta):
    file = os.path.basename(ruta)
    df_raw = pd.read_csv(
        ruta,
        sep="\t",
        engine="python",
        quoting=csv.QUOTE_NONE,
        header=None,
        dtype=str,
        keep_default_na=False,
        names=[
        "date", "start_time", "event_type","title", "raw_duration", "capa", "tape", "col8", "content", 
        "col10", "col11", "col12", "col13", "clipname", "col15", "col16", "col17", "col18", "col19",
        "col20", "col21", "col22", "col23", "col24", "program_block", "tipo"]
    )
    columnas_vacias = ["col8", "col10", "col11", "col12", "col13", "col15", "col16", "col17", "col18", "col19",
                       "col20", "col21", "col22", "col23", "col24"]
    df_raw = df_raw.drop(columns=columnas_vacias)

    # ------------------------------ TRABAJAR EL DATA FRAME ------------------------------
    df_raw["tmp"] = pd.to_datetime(
        df_raw["start_time"],
        format="%M:%S.%f",
        errors="coerce"
    )

    # Obtener Start_time y End_time bien formateados
    df_raw['start_time'] = pd.to_datetime(df_raw['date'] + ' ' + df_raw["start_time"]).dt.floor("s")
    df_raw['duration'] = df_raw['raw_duration'].str.split(";", expand=True)[0]
    df_raw['duration'] = pd.to_timedelta(df_raw['duration'])

    df_raw['end_time'] = (df_raw['start_time'] + df_raw['duration']).dt.floor("s")

    # Preparar columna de Metadata
    df_raw['metadata'] = df_raw.apply(lambda row: {
        "program_block": None if pd.isna(row['program_block']) or row['program_block'] is np.nan else row['program_block'],
        "capa": None if pd.isna(row['capa']) or row['capa'] is np.nan else row['capa'],
        "tape": None if pd.isna(row['tape']) or row['tape'] is np.nan else row['tape'],
        "tipo": None if pd.isna(row['tipo']) or row['tipo'] is np.nan else row['tipo'],
    }, axis=1)
    
    
    df_final = pd.DataFrame({
        'start_time': df_raw['start_time'],
        'end_time': df_raw['end_time'],
        'duration': df_raw['duration'],
        'title': df_raw['title'].str.replace('_', ' ').str.replace('-', ' '),
        'clipname': df_raw['clipname'].str.replace('_', ' ').str.replace('-', ' '),
        'content': df_raw['content'].str.replace('_', ' ').str.replace('-', ' '), 
        'event_type': df_raw['event_type'].str.replace('_', ' ').str.replace('-', ' '),
        'metadata': df_raw['metadata']
    })
    date = pd.Timestamp(datetime.now(tz=ZoneInfo("America/Guatemala"))).replace(microsecond=0).tz_localize(None)
    desc = "log de VSN-AirManager"
    upgrade(df_final, file, "VSN-AirManager", desc, date)  

# PROCESS IGSON-CUE FILES 
def PCI(ruta):
    file = os.path.basename(ruta)

    for i in range(len(file)):
        if file[i] == 'y':
            YY = file[i+1:i+5]
            i+=5
        elif file[i] == 'm':
            MM = file[i+1:i+3]
            i+=3
        elif file[i]=='d':
            DD = file[i+1:i+3]
            i+=3

    df_raw = pd.read_csv(
        ruta,
        sep="\t",
        engine="python",
        skiprows=0, # Ajusta esto si tu archivo tiene un encabezado real
        quoting=csv.QUOTE_NONE,
        header=None,
        dtype=str,
        keep_default_na=True, # Permitimos NaN, son cruciales para la limpieza
        names=[f'col_{i}' for i in range(15)] # 15 nombres genéricos
    )

    df_cleaned = df_raw.apply(lambda x: pd.Series(x.dropna().values), axis=1)


    df_cleaned = df_cleaned.rename(columns={
        0: 'date_time',    # 2025-10-28 09:08:59
        1: 'player',       # A o B
        2: 'clip_name',    # LNF-CLAU25...
        3: 'clip_path'     # M:\EDICION-DR_PROJECT...
    })

    df_cleaned['metadata'] = df_cleaned.apply(lambda row: {
        "player": None if pd.isna(row['player']) or row['player'] is np.nan else row['player'],
        "program_block": extract_program_block(row['clip_path']),
    }, axis=1)

    df_final = pd.DataFrame({
        'start_time': df_cleaned['date_time'],
        'end_time': None,
        'duration': None,
        'title': df_cleaned['clip_name'].str.replace('_', ' ').str.replace('-', ' '), 
        'clipname': df_cleaned['clip_name'].str.replace('_', ' ').str.replace('-', ' '),
        'content': None, 
        'event_type': None,
        'metadata': df_cleaned['metadata']
    })

    date = pd.Timestamp(datetime.now(tz=ZoneInfo("America/Guatemala"))).replace(microsecond=0).tz_localize(None)
    desc = "log Igson-cue"

    upgrade(df_final, file, "Igson-cue", desc, date) 

# PROCESS DLG TS+/VIX
def PDLG(ruta, sistema):
    file = os.path.basename(ruta)
    df_raw = pd.read_csv(
        ruta, 
        sep=";",
        engine="python",
        quoting=csv.QUOTE_NONE,
        header=0,
        dtype=str,
        keep_default_na=False)
    
    # ----------------- RELACIONES -----------------
    # ObjectDescripton va pa la metadata
    # PageDescription es title
    # ObjectData es el clipname (basename)
    # DateTime es start_time

    df_raw["DateTime"] = pd.to_datetime(df_raw["DateTime"], format="%m/%d/%Y %I:%M:%S %p")
    df_raw["DateTime"] = df_raw["DateTime"].dt.strftime("%Y-%m-%d %H:%M:%S")

    df_raw["ObjectData"] = df_raw["ObjectData"].astype(str) \
    .str.replace("\\", "/", regex=False) \
    .apply(os.path.basename)
    print(df_raw['ObjectData'])

    df_raw['metadata'] = df_raw.apply(lambda row: {
        "ObjectDescription": None if pd.isna(row['ObjectDescription']) or row['ObjectDescription'] is np.nan else row['ObjectDescription'],
    }, axis=1)

    df_final = pd.DataFrame({
        'start_time': df_raw['DateTime'],
        'end_time': None,
        'duration': None,
        'title': df_raw['PageDescription'].str.replace('_', ' ').str.replace('-', ' '), 
        'clipname': df_raw['ObjectData'].str.replace('_', ' ').str.replace('-', ' '),
        'content': None, 
        'event_type': None,
        'metadata': df_raw['metadata']
    })

    date = pd.Timestamp(datetime.now(tz=ZoneInfo("America/Guatemala"))).replace(microsecond=0).tz_localize(None)
    desc = "log " + sistema
    upgrade(df_final, file, sistema, desc, date) 

# PROCESS FILES FOR VIX
def PFV(ruta, sistema):
    file = os.path.basename(ruta)
    fecha_str = file.rsplit('.', 1)[0]
    date_match = re.search(r'(\d{8})', fecha_str)
    
    if not date_match:
        print(f"Advertencia: No se pudo extraer la fecha AAAAMMDD del nombre del archivo '{file}'. Usando la fecha actual.")
        base_date = datetime.now().date()
    else:
        base_date_str = date_match.group(1)
        try:
            base_date = datetime.strptime(base_date_str, '%Y%m%d').date()
        except ValueError:
            print(f"Error: La fecha '{base_date_str}' no es un formato AAAAMMDD válido. Usando la fecha actual.")
            base_date = datetime.now().date()

    print(f"Usando fecha base: {base_date}")

    df_raw = pd.read_csv(ruta, skiprows=1, header=None, names=[
        "log_time", "id", "start_time_raw", "title", "raw_duration",
        "event_type", "notes", "metadata_1", "status"
    ])

    df_raw['clean_start_time'] = df_raw['start_time_raw'].apply(clean_start_time)
    df_raw['duration_td'] = df_raw['raw_duration'].apply(parse_duration_to_timedelta)

    df_raw['start_time'] = pd.NaT
    df_raw['end_time'] = pd.NaT
    
    
    for idx, row in df_raw.iterrows():
        time_str = row['clean_start_time']
        duration_td = row['duration_td']
        
        if time_str is None:
            continue
            
        current_date = base_date
        start_dt_candidate = pd.to_datetime(f"{current_date} {time_str}")

        if idx == 0:
            log_time_dt = pd.to_datetime(f"{base_date} {row['log_time']}")
            if start_dt_candidate > log_time_dt and log_time_dt.hour < 5: # Hora temprana del log (ej. antes de las 5am)
                current_date = base_date - timedelta(days=1)
                start_dt_candidate = pd.to_datetime(f"{current_date} {time_str}")

        df_raw.at[idx, 'start_time'] = start_dt_candidate
        end_dt = start_dt_candidate + duration_td
        df_raw.at[idx, 'end_time'] = end_dt
        previous_end_time = end_dt

    df_final = pd.DataFrame({
        'start_time': df_raw['start_time'],
        'end_time': df_raw['end_time'],
        'duration': df_raw['raw_duration'].str.split(':').str[:3].str.join(':'),
        'title': df_raw['title'].str.replace('_', ' ').str.replace('-', ' '),
        'clipname': df_raw['title'].str.replace('_', ' ').str.replace('-', ' '),
        'content': df_raw['event_type'].str.replace('_', ' ').str.replace('-', ' '),
        'event_type': df_raw['event_type'].str.replace('_', ' ').str.replace('-', ' '),
        'metadata': df_raw.apply(lambda row: {
            "notes": None if pd.isna(row['notes']) or row['notes'] is np.nan else row['notes'],
            "metadata_1": None if pd.isna(row['metadata_1']) or row['metadata_1'] is np.nan else row['metadata_1'],
            "status": None if pd.isna(row['status']) or row['status'] is np.nan else row['status']
        }, axis=1)
    })
    
    date_proc = pd.Timestamp(datetime.now(tz=ZoneInfo("America/Guatemala"))).replace(microsecond=0).tz_localize(None)
    desc = "log " + sistema
    upgrade(df_final, file, sistema, desc, date_proc)

# PROCESS SQUID FILES
def PSF(ruta, sistema):
    file = os.path.basename(ruta)

    col_widths = [18, 30, 30, 3, 31]  # ejemplo: ajustá según tu archivo
    df_raw = pd.read_fwf(
        ruta,
        widths=col_widths,
        header=None,
        dtype=str,
        names=["date","title","clipname","channel","time_info"]
    )

    #Start_time
    df_raw['start_time'] = df_raw['time_info'].str[8:22]
    df_raw['start_time'] = pd.to_datetime(df_raw['start_time'], format="%d%m%Y%H%M%S", errors='coerce')

    #Duration / End_time
    df_raw['duration'] = df_raw['time_info'].str[22:26].astype(int)
    df_raw['duration'] = pd.to_timedelta(df_raw['duration'], unit='s')
    df_raw['end_time'] = df_raw['start_time'] + df_raw['duration']
    df_raw['duration'] = df_raw['duration'].apply(lambda x: str(x).split()[-1])

    #Metada just channel
    df_raw['metadata'] = df_raw.apply(lambda row: {
        "channel": None if pd.isna(row['channel']) or row['channel'] is np.nan else row['channel']}, axis=1)

    df_final = pd.DataFrame({
        'start_time': df_raw['start_time'],
        'end_time': df_raw['end_time'],
        'duration': df_raw['duration'],
        'title': df_raw['title'].str.replace('_', ' ').str.replace('-', ' '),
        'clipname': df_raw['clipname'].str.replace('_', ' ').str.replace('-', ' '),
        'content': None, 
        'event_type': None,
        'metadata': df_raw['metadata']
    })

    date = pd.Timestamp(datetime.now(tz=ZoneInfo("America/Guatemala"))).replace(microsecond=0).tz_localize(None)
    desc = "log " + sistema
    upgrade(df_final, file, sistema, desc, date)

# PROCESS XPRESSION FILES
def PXP(ruta):
    file = os.path.basename(ruta)

    pd.set_option('display.max_rows', None)
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', 120)       # ancho total de la "tabla" en consola
    pd.set_option('display.max_colwidth', 15) # ancho máximo de cada columna
    pd.set_option('display.expand_frame_repr', False)
    
    df_raw = pd.read_csv(
        ruta,
        sep="\t",
        engine="python",
        skiprows=2,
        quoting=csv.QUOTE_NONE,
        header=None,
        dtype=str,
        keep_default_na=True,
        names=[
            "time_info",
            "end_time",
            "itemid",       #dropear
            "group",
            "fbid",         #dropear
            "capa",         #dropear
            "title",
            "sceneuid",     #dropear
            "thumbhash",    #dropear
            "clipname"
        ]
    )
    df_raw = df_raw.drop(columns=['itemid','fbid','sceneuid','thumbhash'])

    df_raw['start_time'] = df_raw['time_info'].apply(extract_start_time)
    df_raw['start_time'] = pd.to_datetime(df_raw['start_time'], format="%d-%m-%Y %H:%M:%S.%f", errors='coerce').dt.floor("s")
    df_raw['end_time'] = pd.to_datetime(df_raw['end_time'], format="%d-%m-%Y %H:%M:%S.%f", errors='coerce').dt.floor("s")
    df_raw = df_raw.dropna(subset=['start_time'])
    df_raw['duration'] = df_raw['end_time'] - df_raw['start_time']
    df_raw['duration'] = df_raw['duration'].apply(lambda x: str(x).split()[-1] if pd.notna(x) else None)


    df_raw['metadata'] = df_raw.apply(lambda row: {
        "program_block": None if pd.isna(row['group']) or row['group'] is np.nan else row['group']}, axis=1)

    df_final = pd.DataFrame({
        'start_time': df_raw['start_time'],
        'end_time': df_raw['end_time'],
        'duration': df_raw['duration'],
        'title': df_raw['title'].str.replace('_', ' ').str.replace('-', ' '),
        'clipname': df_raw['clipname'].str.replace('_', ' ').str.replace('-', ' '),
        'content': df_raw['clipname'].str.replace('_', ' ').str.replace('-', ' '), 
        'event_type': None,
        'metadata': df_raw['metadata']
    })

    date = pd.Timestamp(datetime.now(tz=ZoneInfo("America/Guatemala"))).replace(microsecond=0).tz_localize(None)
    desc = "log Xpression"
    upgrade(df_final, file, "Xpression", desc, date)

def PRF(ruta, sistema):
    file = os.path.basename(ruta)
    
    with open(ruta, 'r') as f:
        # Usamos .read() para leer todo el contenido de una vez, y luego .splitlines()
        # para manejar mejor posibles saltos de línea inconsistentes o incompletos
        log_data = f.read().splitlines()

    parsed_records = []
    
    # Expresión regular SÚPER ROBUSTA:
    # 1. Captura el título (non-greedy: .*?) hasta que encuentra la palabra Started o Stopped.
    # 2. Permite cualquier número de espacios o separadores (coma, guión) entre el título/status y el anclaje 'Playing in Channel'.
    regex = re.compile(
        r'Clip:\s*(?P<title>.*?)\s*(?:Started|Stopped)\s*-\s*Playing\s*in\s*Channel\s*(?P<channel>[A-Z])\s*-\s*(?P<timestamp>\d{2}-\d{2}-\d{4}\s\d{2}:\d{2}:\d{2})'
    )
    # Nota: Si los logs tienen una coma después del status, podríamos añadir:
    # r'Clip:\s*(?P<title>.*?),\s*(?:Started|Stopped)\s*-\s*Playing...'
    # Pero el patrón de la línea indica que NO hay coma después del status:
    # '...Stopped - Playing...' 

    for line in log_data:
        # Quitar espacios y citas si están presentes al final de la línea.
        clean_line = re.sub(r'\$', '', line).strip()
        
        match = regex.search(clean_line)
        
        if match:
            data = match.groupdict()
            
            # Limpieza final del título, eliminando comas o espacios al final
            title_clean = re.sub(r',\s*$', '', data['title']).strip()
            
            try:
                # El formato de fecha es consistente: 'DD-MM-YYYY HH:MM:SS'
                timestamp_dt = datetime.strptime(data['timestamp'], '%d-%m-%Y %H:%M:%S')
                
                parsed_records.append({
                    'start_time': timestamp_dt,
                    'end_time': timestamp_dt,
                    'duration': '00:00:00',
                    'title_raw': title_clean,
                    'channel': data['channel'],
                })
            except ValueError:
                # Si la fecha falla (raro, pero posible)
                continue

    if not parsed_records:
        print(f"Advertencia: El archivo '{file}' no contenía registros válidos.")
        # Retornamos un DataFrame vacío para no romper el flujo
        return pd.DataFrame() 

    df_raw = pd.DataFrame(parsed_records)
    
    df_final = pd.DataFrame({
        'start_time': df_raw['start_time'],
        'end_time': df_raw['end_time'],
        'duration': df_raw['duration'],
        
        'title': df_raw['title_raw'].str.replace('_', ' ').str.replace('-', ' '),
        'clipname': df_raw['title_raw'].str.replace('_', ' ').str.replace('-', ' '),
        
        'content': None,
        'event_type': None,
        
        'metadata': df_raw.apply(lambda row: {
            "channel": row['channel']
        }, axis=1)
    })

    date_proc = pd.Timestamp(datetime.now(tz=ZoneInfo("America/Guatemala"))).replace(microsecond=0).tz_localize(None)
    desc = "log " + sistema
    upgrade(df_final, file, sistema, desc, date_proc)

# PROCESS UPLAY FILES
def PUP(ruta):
    pass

# PROCESS REGIONPLAYER
def PRP(ruta):
    file = os.path.basename(ruta)

# ---------- FUNCIONES PARA LIMPIAR DATOS -----------


# FUNCIÓN PARA OBTENER EL PB DE IGSONCUE
def extract_program_block(path_string):
    if pd.isna(path_string) or path_string is None:
        return None
    
    # Normaliza las barras (Windows usa \) y divide
    # La lista será: ['M:', 'MEDIA-PLAYER', 'TSN', '20']
    parts = path_string.replace('\\', '/').split('/')
    
    # Quitamos partes vacías o el nombre del archivo si existiera
    parts = [p for p in parts if p.strip()]

    # El programa/bloque suele ser la segunda carpeta más cercana al final
    # Ejemplo: parts[-2]
    # Si la lista tiene al menos dos elementos, devolvemos el penúltimo
    if len(parts) >= 2:
        return parts[2]
    elif len(parts) == 1:
        return parts[0] # Solo por si acaso la ruta es muy corta
    else:
        return None

# FUNCIÓN PARA FORMATEAR EL DURATION DE MARSIS
def parse_duration_to_timedelta(duration_str):
    if pd.isna(duration_str) or duration_str is None:
        return timedelta(seconds=0)
    try:
        parts = re.split(r'[:.]', str(duration_str))
        
        if len(parts) >= 3:
            h = int(parts[0])
            m = int(parts[1])
            s = int(parts[2])
            return timedelta(hours=h, minutes=m, seconds=s)
        else:
            return timedelta(seconds=0)
    except Exception as e:
        return timedelta(seconds=0)

# FUNCIÓN PARA LIMPIAR START_TIME DE MARSIS
def clean_start_time(time_str):
    if pd.isna(time_str) or time_str is None:
        return None
    match = re.search(r'(\d{2}:\d{2}:\d{2})', str(time_str))
    return match.group(1) if match else None

def extract_start_time(time_info_str):
    """Extrae el start_time de 'log_time: start_time' o devuelve None si falla."""
    if isinstance(time_info_str, str) and ': ' in time_info_str:
        # Si contiene el separador esperado, extrae la parte posterior
        return time_info_str.split(": ", 1)[1]
    # Si no es un string o no tiene el formato, devuelve None
    return None