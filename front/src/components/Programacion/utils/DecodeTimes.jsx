const framesToFullCalendarDuration = (frames) => {
    let total_minutes = Math.floor(frames / 1798);
    let drop_frames = 2 * (total_minutes - Math.floor(total_minutes / 10));
    let adjusted_frames = frames + drop_frames;

    let f = adjusted_frames % 30;
    let s = Math.floor(adjusted_frames / 30) % 60;
    let m = Math.floor(adjusted_frames / (30 * 60)) % 60;
    let h = Math.floor(adjusted_frames / (30 * 3600)) % 24;

    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    // }:${f.toString().padStart(2, '0')
};

export {framesToFullCalendarDuration};