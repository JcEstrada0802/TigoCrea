import axios from 'axios'

// CREACION DE EVENTOS EN LA DB (ARRASTRE DESDE EL BLOCKMANAGER)
export const createEventInDB = async (apiUrl, token, eventData) => {
  try {
    const response = await axios.post(`${apiUrl}/programacion/createEvent/`, {
      title: eventData.title,
      start: eventData.start,
      end: eventData.end,
      calendar_id: eventData.calendar_id,
      background_color: eventData.backgroundColor, 
      extended_props: eventData.extendedProps || {}
    }, {
      headers: { 'Authorization': `Token ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


// BULKF SAVE PARA COPIAR Y PEGAR (BLOQUE, DIA, SEMANA)
export const bulkCreateEventsInDB = async (apiUrl, token, eventsArray) => {
  try {
    const response = await axios.post(
      `${apiUrl}/programacion/bulkSave/`, 
      { eventos: eventsArray }, 
      { headers: { Authorization: `Token ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error en guardado masivo:", error);
    throw error;
  }
};

// RESIZE Y DRAG DE UN EVENTO
export const updateEventInDB = async (apiUrl, token, event) => {
  try {
    await axios.put(`${apiUrl}/programacion/updateEvent/${event.id}/`, {
      start: event.startStr,
      end: event.endStr,
      title: event.title,
      background_color: event.backgroundColor,
      extended_props: event.extendedProps
    }, {
      headers: { Authorization: `Token ${token}` }
    });
  } catch (error) {
    console.error("Error actualizando evento:", error);
    throw error;
  }
};

// ACTUALIZAR MUCHOS EVENTOS (SHIFT+DRAG)
export const bulkUpdateEventsInDB = async (apiUrl, token, eventsArray) => {
  try {
    await axios.put(`${apiUrl}/programacion/bulkUpdate/`, {
      eventos: eventsArray // Array de {id, start, end}
    }, {
      headers: { Authorization: `Token ${token}` }
    });
  } catch (error) {
    console.error("Error en actualización masiva:", error);
    throw error;
  }
};

// BORRADO MASIVO DE EVENTOS (PARA SOBRESCRIBIR AL PEGAR)
export const bulkDeleteEventsInDB = async (apiUrl, token, idsArray) => {
  try {
    const response = await axios.post(
      `${apiUrl}/programacion/bulkDelete/`, 
      { ids: idsArray }, 
      { headers: { Authorization: `Token ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error en borrado masivo:", error);
    throw error;
  }
};

export const createPlaylist = async (apiUrl, token, eventoId, items) => {
  const response = await axios.post(`${apiUrl}/programacion/savePlaylist/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify({
      evento_id: eventoId,
      items: items
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error en el servidor");
  }
  
  return await response.json();
};