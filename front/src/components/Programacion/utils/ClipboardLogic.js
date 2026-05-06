export const copyBlock = (event) => {
  return {
    type: 'BLOCK',
    data: {
      title: event.title,
      duration: event.end - event.start,
      extendedProps: { ...event.extendedProps },
      backgroundColor: event.backgroundColor,
      borderColor: event.borderColor,
    }
  };
};

export const copyDay = (event, allEvents) => {
  const dayStr = event.startStr.split('T')[0];
  const dayEvents = allEvents.filter(ev => ev.startStr.startsWith(dayStr));
  
  return {
    type: 'DAY',
    sourceDate: dayStr,
    data: dayEvents.map(ev => ({
      title: ev.title,
      duration: ev.end - ev.start,
      // Offset: milisegundos desde el inicio de ese día (00:00:00)
      offset: ev.start - new Date(dayStr + 'T00:00:00'),
      extendedProps: { ...ev.extendedProps },
      backgroundColor: ev.backgroundColor,
    }))
  };
};

export const copyWeek = (event, allEvents) => {
  const eventDate = new Date(event.start);
  // Obtener el lunes de esa semana
  const dayOfWeek = eventDate.getDay(); // 0 (Dom) a 6 (Sab)
  const diff = eventDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(eventDate.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);

  // Filtrar eventos que caen en esa semana
  const weekEvents = allEvents.filter(ev => {
    const start = new Date(ev.start);
    return start >= monday && start < sunday;
  });

  return {
    type: 'WEEK',
    sourceMonday: monday.getTime(),
    data: weekEvents.map(ev => ({
      title: ev.title,
      duration: ev.end - ev.start,
      // Offset: milisegundos desde el lunes de esa semana
      offset: new Date(ev.start).getTime() - monday.getTime(),
      extendedProps: { ...ev.extendedProps },
      backgroundColor: ev.backgroundColor,
    }))
  };
};

// --- FUNCIÓN DE PEGADO ---

export const pasteItems = (targetDate, clipboard, calendarApi) => {
  if (!clipboard) return [];

  const newEvents = [];
  // Usamos una copia para no mutar el original por accidente
  const referenceDate = new Date(targetDate);

  if (clipboard.type === 'BLOCK') {
    // Para un bloque, pegamos exactamente donde se dio click
    const eventData = {
      title: clipboard.data.title,
      backgroundColor: clipboard.data.backgroundColor,
      id: 'temp-' + Date.now() + Math.random(),
      start: new Date(referenceDate),
      end: new Date(referenceDate.getTime() + clipboard.data.duration),
      extendedProps: clipboard.data.extendedProps
    };
    calendarApi.addEvent(eventData);
    newEvents.push(eventData);

  } else if (clipboard.type === 'DAY' || clipboard.type === 'WEEK') {
    let baseTime = new Date(referenceDate);

    if (clipboard.type === 'DAY') {
      // Normalizamos a las 00:00 del día donde se hizo click
      baseTime.setHours(0, 0, 0, 0);
    } else {
      // Normalizamos al Lunes 00:00 de la semana donde se hizo click
      const day = baseTime.getDay();
      const diff = baseTime.getDate() - day + (day === 0 ? -6 : 1);
      baseTime.setDate(diff);
      baseTime.setHours(0, 0, 0, 0);
    }

    clipboard.data.forEach((item, index) => {
      const eventData = {
        title: item.title,
        backgroundColor: item.backgroundColor,
        extendedProps: item.extendedProps,
        id: `temp-${Date.now()}-${index}`,
        // El offset se suma a la base normalizada (Lunes 00:00 o Día 00:00)
        start: new Date(baseTime.getTime() + item.offset),
        end: new Date(baseTime.getTime() + item.offset + item.duration)
      };
      calendarApi.addEvent(eventData);
      newEvents.push(eventData);
    });
  }

  return newEvents;
};