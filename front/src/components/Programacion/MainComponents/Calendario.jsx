import React, { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { exportGridToPDF, exportPlaylistToCLF } from '../utils/ExportService';
import ContextMenu from '../Modals/ContextMenu';
import EditBlockModal from '../Modals/EditEventModal';
import FillBlockModal from '../Modals/FillBlockModal';
import { copyBlock, copyDay, copyWeek, pasteItems } from '../utils/ClipboardLogic';
import { bulkCreateEventsInDB, createEventInDB, bulkUpdateEventsInDB, updateEventInDB, bulkDeleteEventsInDB } from '../utils/EventService';
import './Calendario.css';
import axios from 'axios';
import pollReportStatus from '../../utils/PollReportStatus';
import { Calendar } from 'lucide-react';

let lastProcessedTrigger = null;
let lastProcessedSaveTrigger = null;
let lastProcessedExportTrigger = null;

const CalendarioTigo = ({ id, zoom, clipboard, setClipboard, isCompact, importConfig, saveConfig, exportConfig, showAlert }) => {
  const calendarRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null); // { x, y, event }
  const [editModal, setEditModal] = useState(null);     // { x, y, event }
  const [fillModal, setFillModal] = useState(null);
  const [eventos, setEventos] = useState({});
  
  // ESTADOS PARA SELECCIONAR CALENDARIO
  const [selectedCalId, setSelectedCalId] = useState(1);
  const [availableCalendars, setAvailableCalendars] = useState([]); 
  const selectedCalIdRef = useRef(selectedCalId);

  // DATOS DEL USUARIO
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  // --- LÓGICA DE MAGNETISMO (IMÁN) ---
  const handleEventPlacement = (info) => {
    // #################################################################################
    const isShiftPressed = info?.jsEvent?.shiftKey || window.event?.shiftKey || false;
    if (isShiftPressed) {
      const deltaMs = (info.delta.days * 86400000) + info.delta.milliseconds;
      
      const calendarApi = info.view.calendar;
      const viewStart = info.view.activeStart;
      const viewEnd = info.view.activeEnd;
      const otherEvents = calendarApi.getEvents().filter(ev => 
        ev.id !== info.event.id && 
        ev.start >= viewStart && 
        ev.start <= viewEnd
      );
      otherEvents.forEach(ev => {
        const newStart = new Date(ev.start.getTime() + deltaMs);
        const newEnd = new Date(ev.end.getTime() + deltaMs);
        ev.setDates(newStart, newEnd, { maintainDuration: true });
      });
      return otherEvents; 
    }
    // #################################################################################
    const allEvents = info.view.calendar.getEvents();
    const newStart = info.event.start;
    const newEnd = info.event.end;
    if (!newStart || !newEnd) return [];
    const duration = newEnd.getTime() - newStart.getTime();
    
    const threshold = 10 * 60 * 1000; 
    let closestTime = null;
    let minDiff = threshold;

    allEvents.forEach(ev => {
      if (ev !== info.event && ev.start && ev.end) {
        const diffDown = Math.abs(newStart - ev.end);
        if (diffDown < minDiff) {
          minDiff = diffDown;
          closestTime = { type: 'down', time: ev.end };
        }
        const diffUp = Math.abs(newEnd - ev.start);
        if (diffUp < minDiff) {
          minDiff = diffUp;
          closestTime = { type: 'up', time: ev.start };
        }
      }
    });

    if (closestTime && closestTime.time) {
      if (closestTime.type === 'down') {
        const adjustedEnd = new Date(closestTime.time.getTime() + duration);
        info.event.setDates(closestTime.time, adjustedEnd);
      } else {
        const adjustedStart = new Date(closestTime.time.getTime() - duration);
        info.event.setDates(adjustedStart, closestTime.time);
      }
    } else {
      const roundedStart = new Date(newStart);
      roundedStart.setSeconds(0);
      roundedStart.setMilliseconds(0);
      const roundedEnd = new Date(roundedStart.getTime() + duration);
      
      info.event.setDates(roundedStart, roundedEnd);
    }
    return [];
  };

  // --- FUNCION PARA FETCHEAR EVENTS ---
  const fetchEvents = async () => {
    // Obtenemos la API del calendario desde la referencia
    const calendarApi = calendarRef.current?.getApi();
    
    // Si el calendario aún no carga, no hacemos nada
    if (!calendarApi) return;

    // Extraemos las fechas que el usuario está viendo actualmente
    const { activeStart, activeEnd } = calendarApi.view;

    try {
      const res = await axios.post(apiUrl + '/programacion/getEventsByCalendar/', {
        "calendar_id": selectedCalId,
        "start_date": activeStart.toISOString(), // "2026-03-05T00:00:00.000Z"
        "end_date": activeEnd.toISOString()
      }, {
        headers: { Authorization: `Token ${token}` }
      });

      if (res.data && res.data.eventos) {
        setEventos(res.data.eventos);
      }
    } catch (e) {
      console.error("Error cargando eventos, ", e);
    }
  }

  // --- HANDLERS DE ACCIONES (COPY/PASTE) ---
  const handleCopyAction = (type, event) => {
    const calendarApi = calendarRef.current.getApi();
    const allEvents = calendarApi.getEvents();
    let result;
    if (type === 'BLOCK') result = copyBlock(event);
    if (type === 'DAY') result = copyDay(event, allEvents);
    if (type === 'WEEK') result = copyWeek(event, allEvents);
    setClipboard(result);
  };

  const handlePasteAction = async (targetEvent) => {
    const calendarApi = calendarRef.current.getApi();
    
    // NORMALIZAR RANGO (Lunes a Lunes o Día completo) ---
    let pasteStart = new Date(targetEvent.start);
    let pasteEnd = new Date(pasteStart);

    if (clipboard.type === 'WEEK') {
      // Forzar el inicio al Lunes 00:00:00 de esa semana
      const day = pasteStart.getDay();
      const diff = pasteStart.getDate() - day + (day === 0 ? -6 : 1);
      pasteStart = new Date(pasteStart.setDate(diff));
      pasteStart.setHours(0, 0, 0, 0);

      // El fin es exactamente 7 días después
      pasteEnd = new Date(pasteStart);
      pasteEnd.setDate(pasteStart.getDate() + 7);

    } else if (clipboard.type === 'DAY') {
      // Forzar el inicio a las 00:00:00 de ese día
      pasteStart.setHours(0, 0, 0, 0);
      pasteEnd = new Date(pasteStart);
      pasteEnd.setDate(pasteStart.getDate() + 1);
    } else {
      // Si es un bloque solo, no definimos rango de borrado masivo
      pasteEnd = null; 
    }

    // --- LIMPIEZA DE LA SEMANA/DÍA EN DB Y UI ---
    if (pasteEnd) {
      const existingEvents = calendarApi.getEvents().filter(ev => {
        return ev.start >= pasteStart && ev.start < pasteEnd;
      });

      if (existingEvents.length > 0) {
        const idsToDelete = existingEvents.map(ev => ev.id);
        
        try {
          // Borramos en el servidor usando tu nuevo servicio
          await bulkDeleteEventsInDB(apiUrl, token, idsToDelete);
          
          // Borramos de la interfaz
          existingEvents.forEach(ev => ev.remove());
        } catch (e) {
          console.error("Error limpiando eventos previos", e);
          showAlert('error', 'No se pudieron limpiar los eventos existentes antes de pegar.');
          return; // Abortamos para no pegar encima si el borrado falló
        }
      }
    }

    // --- PEGADO DE NUEVOS EVENTOS ---
    // Usamos targetEvent.start original, pasteItems ya sabe buscar el lunes internamente
    const newEventsUI = pasteItems(new Date(targetEvent.start), clipboard, calendarApi);
    
    if (newEventsUI.length === 0) return;

    // Preparamos el payload para el bulkSave
    const dataToSave = newEventsUI.map(ev => {
      const extraProps = ev.extendedProps || {};
      return{
        title: ev.title,
        start: ev.start.toISOString(), 
        end: ev.end.toISOString(),
        background_color: ev.backgroundColor,
        calendar_id: selectedCalId,
        extended_props: {
          ...extraProps,
          lleno: extraProps.lleno ?? false
        }
      }
    });

    try {
      const data = await bulkCreateEventsInDB(apiUrl, token, dataToSave);
      
      // Refrescamos todo para asegurar que los IDs de la DB queden vinculados a la UI
      setTimeout(() => {
        fetchEvents(); 
      }, 500);
      showAlert('success', 'Eventos pegados exitosamente'); //VERIFICAR ERROR ACA
    } catch (e) {
      console.error("Error al persistir el pegado:", e);
      // Revertimos el cambio visual si la DB falló
      newEventsUI.forEach(ev => {
        const eventInCal = calendarApi.getEventById(ev.id);
        if (eventInCal) eventInCal.remove();
      });
      showAlert('error', "Error al guardar los nuevos eventos en el servidor.");
    }
  };

  // --- LÓGICA DE NAVEGACIÓN ---
  const handleDateClick = (arg) => {
    if (arg.view.type === 'dayGridMonth') {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView('timeGridDay', arg.dateStr);
      calendarApi.scrollToTime('07:00:00');
    }
  };

  // --- LÓGICA DE CREACIÓN DE EVENTOS ---
  const handleEventReceive = async (info) => {
    handleEventPlacement(info);
    const nuevoEvento = {
      title: info.event.title,
      start: info.event.startStr,
      end: info.event.endStr,
      calendar_id: selectedCalId,
      backgroundColor: info.event.backgroundColor,
      extendedProps: info.event.extendedProps 
    };

    try {
      const dataSaved = await createEventInDB(apiUrl, token, nuevoEvento);
      info.event.setProp('id', dataSaved.id);
      setEventos(prev => [...prev, {
        ...dataSaved, // Trae el ID, title, start, end, extendedProps, etc.
        id: String(dataSaved.id) // Lo aseguramos como String para el match del LED
      }]);
    } catch (e) {
      info.event.remove();
      console.log(e)
      showAlert('error', 'Error creando evento,');
    }
  };

  const handleEventChange = async (info) => {
    const affectedEvents = handleEventPlacement(info);
    const isShiftPressed = info?.jsEvent?.shiftKey || window.event?.shiftKey || false;
    try {
      if (isShiftPressed && affectedEvents && affectedEvents.length > 0) {
        const bulkData = affectedEvents.map(ev => ({
          id: ev.id,
          start: ev.startStr,
          end: ev.endStr
        }));
        // Añadimos el evento que arrastramos manualmente
        bulkData.push({
          id: info.event.id,
          start: info.event.startStr,
          end: info.event.endStr
        });
        await bulkUpdateEventsInDB(apiUrl, token, bulkData);
      } else {
        // PERSISTENCIA INDIVIDUAL (DRAG NORMAL O RESIZE)
        await updateEventInDB(apiUrl, token, info.event);
        fetchEvents();
      }
    } catch (e) {
      // Si la red falla, revertimos el movimiento en el calendario
      info.revert();
      console.error("Error al persistir cambios:", e);
      alert("No se pudo guardar el cambio. El evento ha vuelto a su posición original.");
    }
  };

  // FETCHEAR CANALES DISPONIBLES
  useEffect(() => {
    const fetchCanales = async () => {
      try {
        const res = await axios.get(`${apiUrl}/programacion/getCalendars/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setAvailableCalendars(res.data);
      } catch (e) { console.error("Error cargando canales", e); }
    };
    fetchCanales();
  }, []);

  // SETEAR CALENDARIO SELECCIONADO
  useEffect(() => {
    fetchEvents();
  }, [selectedCalId]);
  
  // IMPORTAR PLANTILLA AL CALENDARIO
  useEffect(() => {
    if (importConfig && String(importConfig.calendarId) === String(selectedCalId) && importConfig.trigger !== lastProcessedTrigger) {
      lastProcessedTrigger = importConfig.trigger;
      console.log("Yo lo agarro primero (Instancia:", id, ")");
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
        try{
          handlePasteAction({ start: calendarApi.view.activeStart });
          showAlert('success','Plantilla importada exitosamente.');
        }catch(e){
          console.log("Error: ", e);
          showAlert('error', 'Error al importar plantilla.');
        }
      }
    }
  }, [importConfig]);

  // EXPORTAR PLANTILLA DEL CALENDARIO
  useEffect(() => {
    if (saveConfig && 
        String(saveConfig.calendarId) === String(selectedCalId) && 
        saveConfig.trigger !== lastProcessedSaveTrigger) {
      
      // Bloqueamos para evitar doble guardado
      lastProcessedSaveTrigger = saveConfig.trigger;

      const ejecutarGuardado = async () => {
        const calendarApi = calendarRef.current?.getApi();
        if (!calendarApi) return;

        const currentView = calendarApi.view;
        const allEvents = calendarApi.getEvents();

        const viewStart = currentView.activeStart; // Lunes 00:00
        const viewEnd = currentView.activeEnd;

        const eventsInView = allEvents.filter(ev => {
          return ev.start >= viewStart && ev.start < viewEnd;
        });

        if (eventsInView.length === 0) {
          showAlert('warning', 'No hay eventos en esta semana para guardar como plantilla');
          return;
        }

        // Calcular el Lunes de la semana actual visible
        const target = new Date(viewStart);
        const day = target.getDay();
        const diff = target.getDate() - day + (day === 0 ? -6 : 1);
        const mondayStart = new Date(target.setDate(diff));
        mondayStart.setHours(0, 0, 0, 0);

        const sourceMondayTimestamp = mondayStart.getTime();

        // Transformar eventos al formato estricto de Template
        const templateData = {
          type: "WEEK",
          sourceMonday: sourceMondayTimestamp,
          data: eventsInView.map(ev => ({
            title: ev.title,
            duration: ev.end.getTime() - ev.start.getTime(),
            offset: ev.start.getTime() - sourceMondayTimestamp,
            backgroundColor: ev.backgroundColor,
            extendedProps: {
              blockId: ev.extendedProps?.blockId || null,
              duracion_ff: ev.extendedProps?.duracion_ff || null
            }
          }))
        };
        console.log(templateData)

        // Envío a la DB
        try {
          const payload = {
            nombre: saveConfig.templateName,
            eventos: templateData
          };
          
          await axios.post(`${apiUrl}/programacion/createTemplate/`, payload, {
            headers: { Authorization: `Token ${token}` }
          });
          
          showAlert('success', `Plantilla "${saveConfig.templateName}" guardada exitosamente.`)
        } catch (e) {
          console.error("Error al guardar plantilla:", e);
          showAlert('error', "Error al guardar la plantilla en el servidor. ")
          // Si falló, liberamos el trigger por si el usuario quiere reintentar
          lastProcessedSaveTrigger = null; 
        }
      };

      ejecutarGuardado();
    }
  }, [saveConfig]);

  // EXPORTAR PARRILLA A PDF
  useEffect(() => {
      selectedCalIdRef.current = selectedCalId;
  }, [selectedCalId]);

  useEffect(() => {
      if (exportConfig && 
          String(exportConfig.calendarId) === String(selectedCalIdRef.current) && 
          exportConfig.trigger !== lastProcessedExportTrigger) {
          lastProcessedExportTrigger = exportConfig.trigger;

          const token = localStorage.getItem('token');
          let filename
          let extension
          const ejecutarExportacion = async () => {
              try {
                  let task_id
                  if(exportConfig.pdfName){
                    extension = "pdf"
                    filename = exportConfig.pdfName;
                    task_id = await exportGridToPDF(selectedCalIdRef.current, filename, calendarRef);
                    showAlert('success', 'PDF exportando, por favor espere...');
                  }else if(exportConfig.clfName){
                    extension = "clf"
                    filename = exportConfig.clfName;
                    const fecha = exportConfig.fecha;
                    const calendarId = exportConfig.calendarId;
                    try {
                        task_id = await exportPlaylistToCLF(filename, fecha, calendarId);
                        showAlert('success', 'Exportación iniciada con éxito.');
                    } catch (error) {
                        if (error.message === "Bloques incompletos") {
                            showAlert('error', `No se puede exportar. Faltan llenar: ${error.bloques.join(', ')}`);
                        } else {
                            showAlert('error', 'Ocurrió un error inesperado al exportar.');
                        }
                    }
                  }
                  if (task_id) {
                      // Iniciamos el polling
                      pollReportStatus(task_id, token, filename, extension);
                  }
              } catch (error) {
                  console.error("Error en el flujo de PDF:", error);
                  lastProcessedExportTrigger = null;
                  showAlert('error', 'Error al exportar el PDF.');
              }
          };
          ejecutarExportacion();
      }
  }, [exportConfig]);

  const handleSaveBlockName = async (blockId, newName) => {
    try {
      await axios.put(`${apiUrl}/programacion/updateEvent/${blockId}/`, 
        { title: newName }, // O 'title' según se llame tu columna en public.programacion_bloque
        { headers: { Authorization: `Token ${token}` } }
      );
      
      // Esto refresca los eventos en el calendario automáticamente
      fetchEvents(); 
    } catch (e) {
      showAlert('error', e.reponse.data.error)
      console.error("Error al actualizar el bloque:", e);
      alert("No se pudo actualizar el nombre del bloque.");
    }
  };

  const handleDeleteBlock = async(blockId) => {
    try { 
      await axios.delete(`${apiUrl}/programacion/deleteEvent/${blockId}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      
      // Esto refresca los eventos en el calendario automáticamente
      fetchEvents(); 
      showAlert('success', 'Evento eliminado exitosamente.')
    } catch (e) {
      const mensajeDeError = e.response?.data?.error || "No se pudo eliminar el bloque.";
      showAlert('error', mensajeDeError)
    }
  }

  const renderEventContent = (eventInfo) => {
    const estaLleno = eventInfo.event.extendedProps.lleno;
    
    // Formateamos las horas para que se vean limpias (ej: 07:30 - 08:00)
    const startTime = eventInfo.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const endTime = eventInfo.event.end?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    return (
      <div className="custom-event-container" style={{ fontSize: '0.75rem', lineHeight: '1.1' }}>
        <div className="event-title" style={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          fontWeight: '500'
        }}>
          <span className={`led-indicator ${estaLleno ? 'led-green' : 'led-red'}`}></span>
          {eventInfo.event.title}
        </div>
        <div className="event-top-row" style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
          <b className="event-time" style={{ color: '#FFF', fontSize: '0.62rem', fontWeight: '400'}}>
            {startTime} {endTime ? `- ${endTime}` : ''}
          </b>
        </div>
      </div>
    );
  };

  const updateEventInState = (eventId, updatedProps) => {
    setEventos(prev => prev.map(ev => {
      if (String(ev.id) === String(eventId)) {
        return {
          ...ev,
          lastUpdated: Date.now(),
          extendedProps: {
            ...ev.extendedProps,
            ...updatedProps
          }
        };
      }
      return ev;
    }));
  };

  return (
    <div className='calendar-container'>
      <div className="channel-selector-header-center">
        <select 
          value={selectedCalId}
          onChange={(e) => setSelectedCalId(e.target.value)}
          className="channel-select-header"
        >
          <option value="" disabled>Canal</option>
          {availableCalendars.map(cal => (
            <option key={cal.id} value={cal.id}>{cal.name}</option>
          ))}
        </select>
      </div>
      <FullCalendar
        key={selectedCalId}
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        eventContent={renderEventContent} // <-- Aquí sucede la magia
        aspectRatio={isCompact ? 0.5 : 1.35}
        initialView="timeGridWeek"
        firstDay={1}
        locale="es"
        height="100%"

        // Arreglar problemas de visualizacion de bloques
        slotEventOverlap={false} // Evita que se encimen o se pongan de lado si el slot es grande
        eventOrder="start"       // Fuerza a que respeten estrictamente el orden de inicio
        eventMinWidth={0}        // Permite que el evento ocupe todo el ancho aunque sea corto
        displayEventTime={true}

        // Multiple Views
        handleWindowResize={true} 
        expandRows={true}      // Esto obliga a las filas a repartirse el espacio

        stickyHeaderDates={true}
        editable={true}
        
        // Eventos iniciales
        events={eventos}
        datesSet={(dateInfo) => {
          // Cada vez que cambien las fechas, ejecutamos el fetch
          fetchEvents();
        }}

        nowIndicator={true}
        allDaySlot={false}
        slotDuration={zoom}
        snapDuration="00:05:00"
        eventOverlap={() => {return window.event?.shiftKey ? true : false;}}

        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridDay,timeGridWeek,dayGridMonth'
        }}

        // CLICK DERECHO EN VACIO PARA PEGAR
        viewDidMount={(info) => {
          info.el.addEventListener("contextmenu", (e) => {
            if (e.target.closest('.fc-event')) return; 
            e.preventDefault();
            e.stopPropagation();

            const colEl = e.target.closest('.fc-timegrid-col') || e.target.closest('.fc-daygrid-day');
            // Esta es la parte clave: buscamos el carril del slot (lane) o el slot mismo
            const slotEl = e.target.closest('.fc-timegrid-slot-lane') || e.target.closest('.fc-timegrid-slot');

            if (colEl) {
              const dateStr = colEl.getAttribute('data-date');
              // Si el slot no existe (clic en bordes), forzamos la búsqueda en el elemento padre del target
              const effectiveSlot = slotEl || e.target.parentElement?.closest('.fc-timegrid-slot-lane');
              const timeStr = effectiveSlot?.getAttribute('data-time') || '00:00:00';
              
              const finalDate = new Date(`${dateStr}T${timeStr}`);

              if (!isNaN(finalDate.getTime())) {
                setContextMenu({
                  x: e.clientX,
                  y: e.clientY,
                  event: { start: finalDate, isBlankSpace: true }
                });
              }
            }
          });
        }}

        // CLICK DERECHO EN BLOQUES PARA COPIAR
        eventDidMount={(info) => {
          info.el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            setContextMenu({
              x: e.clientX,
              y: e.clientY,
              event: info.event
            });
          });
        }}
        
        // CLICK IZQUIERDO + CTRL PARA EDITAR EVENTO
        eventClick={(clickInfo) => {
          // Detectamos Ctrl + Click Izquierdo
          if (clickInfo.jsEvent.ctrlKey || clickInfo.jsEvent.metaKey) {
            clickInfo.jsEvent.preventDefault();
            
            setEditModal({
              show: true,
              x: clickInfo.jsEvent.clientX,
              y: clickInfo.jsEvent.clientY,
              event: {
                id: clickInfo.event.id,
                title: clickInfo.event.title
              }
            });
          }else{
            setFillModal({
              show: true,
              event: {
                id: clickInfo.event.id,
                title: clickInfo.event.title,
                start: clickInfo.event.start,
                end: clickInfo.event.end,
                duracion_teorica_ff: clickInfo.event.extendedProps.duracion_ff
              }
            })
          }
        }}

        // CLICK IZQUIERDO PARA NAVEGAR (Month to Day)
        dateClick={handleDateClick}
        
        // Configuración de visualización
        buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' }}
        slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        eventReceive={handleEventReceive}
        eventDrop={handleEventChange}
        eventResize={handleEventChange}
        eventResizableFromStart={false}
        eventDurationEditable={true}
      />

      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x}
          y={contextMenu.y}
          event={contextMenu.event}
          clipboard={clipboard}
          onClose={() => setContextMenu(null)}
          onCopy={(type, ev) => {
             handleCopyAction(type, ev);
             setContextMenu(null);
          }}
          onPaste={(ev) => {
             handlePasteAction(ev);
             setContextMenu(null);
          }}
        />
      )}
      {editModal?.show && (
        <EditBlockModal 
          x={editModal.x} 
          y={editModal.y} 
          event={editModal.event} 
          onClose={() => setEditModal({ ...editModal, show: false })}
          onSave={handleSaveBlockName}
          onDelete={handleDeleteBlock}
        />
      )}
      {fillModal?.show && (
        <FillBlockModal 
          event={fillModal.event}
          onClose={()=> setFillModal({...fillModal, show: false})}
          showAlert={showAlert}
          updateEventState={updateEventInState}
        />
      )}
    </div>
  );
};

export default CalendarioTigo;