import math

def timecode_to_frames(tc_str):
    try:
        parts = tc_str.split(':')
        
        h = int(parts[0]) if len(parts) > 0 else 0
        m = int(parts[1]) if len(parts) > 1 else 0
        s = int(parts[2]) if len(parts) > 2 else 0
        f = int(parts[3]) if len(parts) > 3 else 0

        total_minutes = (60 * h) + m
        frame_number = ((total_minutes * 60 + s) * 30) + f

        drop_frames = 2 * (total_minutes - (total_minutes // 10))
        frame_number -= drop_frames

        return frame_number
    except Exception:
        return 0

def frames_to_timecode(frames):
    """
    Convierte cuadros totales a Timecode 29.97 Drop Frame (HH:MM:SS;FF).
    """
    # 1. Calculamos cuántos bloques de 10 minutos y cuántos minutos extra hay
    total_minutes = frames // 1798
    
    # 2. Aplicamos la lógica de Drop Frame:
    # Por cada 10 minutos (17982 frames), se "dropearon" 18 números (9 minutos x 2).
    # Excepto en el minuto 0, 10, 20... donde NO se dropean.
    
    drop_frames = 2 * (total_minutes - (total_minutes // 10))
    
    # Agregamos los cuadros para "saltar" las etiquetas inexistentes
    adjusted_frames = frames + drop_frames

    # 3. Cálculo estándar base 30 con los frames ajustados
    f = adjusted_frames % 30
    s = (adjusted_frames // 30) % 60
    m = (adjusted_frames // (30 * 60)) % 60
    h = (adjusted_frames // (30 * 3600)) % 24

    return f"{h:02d}:{m:02d}:{s:02d}:{f:02d}"