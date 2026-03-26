import datetime
import os
import shutil


DestinoBase = "C:\\Users\\TS-WORKFLOW\\Documents\\TigoBPlanning\\TigoCrea\\datasource\\"

def ejecutar_tarea():
    now = datetime.datetime.now()
    yesterday = now - datetime.timedelta(days=1)
    formato1 = yesterday.strftime('%Y%m%d')
    formato2 = yesterday.strftime('%Y_%m_%d')
    formato3 = yesterday.strftime('%d%m%Y')
    formato4 = yesterday.strftime('y%Ym%md%d')
    formato5 = yesterday.strftime('%d-%m-%Y')
    FechasAyer = [formato1, formato2, formato3, formato4, formato5]
    print(FechasAyer)
    buscar_archivo(FechasAyer,"X:\\AsrunLog",os.path.join(DestinoBase,"Air-manager"))
    buscar_archivo(FechasAyer,"T:\\ReportMarsis",os.path.join(DestinoBase,"Marsis-vix"))
    buscar_archivo(FechasAyer,"S:\\QC AsRun",os.path.join(DestinoBase,"Igson-cue"))
    #buscar_archivo(FechasAyer,FuenteBase+"Region+Player",DestinoBase+"Region+Player"))
    buscar_archivo(FechasAyer,"U:\\AsRunLogs",os.path.join(DestinoBase,"ProduccionTS+"))
    buscar_archivo(FechasAyer,"V:\\logs\\AsRun",os.path.join(DestinoBase,"Xpression"))


    # ------------------------- CASOS ESPECIALES ------------------------- 
    buscar_archivo(FechasAyer,"W:\\AsRunLog",DestinoBase) #Squid Files
    copiar_simple("R:\\DLG-TS+",os.path.join(DestinoBase,"Dlg-ts+"))
    copiar_simple("R:\\DLG-VIX",os.path.join(DestinoBase,"Dlg-vix"))


def mover_archivo(ruta_fuente_completa, ruta_destino_completa):
    try:
        os.makedirs(os.path.dirname(ruta_destino_completa), exist_ok=True)
        shutil.copy2(ruta_fuente_completa, ruta_destino_completa)
        print(f"COPIADO: {ruta_fuente_completa} -> {ruta_destino_completa}")
        return True
    
    except FileNotFoundError:
        print(f"ERROR: Archivo no encontrado en la fuente: {ruta_fuente_completa}")
        return False
    except Exception as e:
        print(f"ERROR al mover el archivo {ruta_fuente_completa}: {e}")
        return False
    
def copiar_simple(ruta_fuente, ruta_destino):
    try:
        archivos_csv = []
        for f in os.listdir(ruta_fuente):
            ruta_completa = os.path.join(ruta_fuente, f)
            if os.path.isfile(ruta_completa) and f.lower().endswith('.csv') and not f.startswith('.'):
                archivos_csv.append(f)

        if not archivos_csv:
            print(f"AVISO: No se encontraron archivos .csv en la fuente: {ruta_fuente}")
            return
            
        archivos_con_tiempo = []
        for nombre in archivos_csv:
            ruta_completa = os.path.join(ruta_fuente, nombre)
            archivos_con_tiempo.append((os.path.getmtime(ruta_completa), nombre))
            
        archivos_con_tiempo.sort()
        

        timestamp_reciente, archivo_mas_reciente = archivos_con_tiempo[-1]
        ruta_archivo_fuente = os.path.join(ruta_fuente, archivo_mas_reciente)
        ruta_archivo_destino = os.path.join(ruta_destino, archivo_mas_reciente)
        
        fecha_legible = datetime.datetime.fromtimestamp(timestamp_reciente)

        ruta_archivo_fuente = os.path.join(ruta_fuente, archivo_mas_reciente)
        ruta_archivo_destino = os.path.join(ruta_destino, archivo_mas_reciente)
        shutil.copy2(ruta_archivo_fuente, ruta_archivo_destino)
        print(f"COPIADO: {ruta_archivo_fuente} -> {ruta_archivo_destino}")
        
    except Exception as e:
        print(f"ERROR inesperado en copiar_simple para {ruta_fuente}: {e}")

def buscar_archivo(FechasAyer, ruta_fuente, ruta_destino):
    try:
        folder_path = os.path.basename(ruta_fuente)
        archivos_en_fuente = os.listdir(ruta_fuente)
        archivos_squid_encontrados = 0
        archivo_procesado = False
        es_squid = (folder_path == "AsRunLog")
        
        for formato in FechasAyer:
            if es_squid and archivos_squid_encontrados >= 2:
                break
            for nombre_archivo in archivos_en_fuente:
                if es_squid and archivos_squid_encontrados >= 2:
                    break

                if formato in nombre_archivo:
                    ruta_archivo_fuente = os.path.join(ruta_fuente, nombre_archivo)
                    ruta_archivo_destino = os.path.join(ruta_destino, nombre_archivo) 
                    if es_squid:
                        if nombre_archivo[-5]=="0":
                            ruta_archivo_destino = os.path.join(ruta_destino, "SquidPlus", nombre_archivo)
                        elif nombre_archivo[-5]=="1":
                            ruta_archivo_destino = os.path.join(ruta_destino, "SquidPlusLat", nombre_archivo)
                        else:
                            continue
                    if mover_archivo(ruta_archivo_fuente, ruta_archivo_destino):
                        archivo_procesado = True
                        if es_squid:
                            if es_squid: archivos_squid_encontrados += 1 
                            else: return
        if not archivo_procesado:
            print(f"AVISO: No se encontró ningún archivo con el patrón de fecha para {folder_path} en {ruta_fuente}")

    except FileNotFoundError:
        print(f"ERROR: Directorio de fuente no encontrado: {ruta_fuente}")
    except Exception as e:
        print(f"ERROR inesperado en procesar_directorio para {ruta_fuente}: {e}")

if __name__ == "__main__":
    ejecutar_tarea()