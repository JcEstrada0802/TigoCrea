from timecode import Timecode

def frames_to_timecode(frames):
    # '29.97' activa automáticamente la lógica Drop Frame
    # Sumamos 1 porque la librería cuenta desde 1 por defecto para el primer frame
    tc = Timecode('29.97', frames=frames + 1)
    tc = str(tc).replace(';',':')
    return tc

def timecode_to_frames(tc_str, framerate=29.97):
    try:
        parts = tc_str.replace(';', ':').split(':')
        h, m, s, f = map(int, parts)

        # IDENTIFICACIÓN DE CASO ESPECIAL (Drop Frame)
        # Si NO es minuto múltiplo de 10 (m%10 != 0)
        # Y el usuario puso segundos 0 y frames 0 o 1
        if m % 10 != 0 and s == 0 and f < 2:
            # "Corregimos" la intención: 
            # El usuario escribió 00:45:00:00 pero quiere 45 min reales.
            # En 29.97 DF, el primer frame del minuto 45 es el :02.
            f = 2 

        # Cálculo de Heidelberger inverso
        total_minutes = (60 * h) + m
        # (h*3600 + m*60 + s) * 30 + f  <-- Esto es la etiqueta plana
        frame_number = ((h * 3600 + m * 60 + s) * 30 + f)
        
        # Restamos los frames que el Drop Frame "se saltó"
        drop_frames = 2 * (total_minutes - (total_minutes // 10))
        
        return int(frame_number - drop_frames)
    except:
        return 0

"""def timecode_to_frames(tc_str):
    # Convierte el string de vuelta a frames (0-based)
    tc = Timecode('29.97', tc_str)
    return tc.frame_number"""