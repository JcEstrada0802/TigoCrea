import React, { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { exportGridToPDF } from '../utils/ExportGridPDF';
import ContextMenu from '../Modals/ContextMenu';
import EditBlockModal from '../Modals/EditBlockModal';
import { copyBlock, copyDay, copyWeek, pasteItems } from '../utils/ClipboardLogic';
import { bulkCreateEventsInDB, createEventInDB, bulkUpdateEventsInDB, updateEventInDB } from '../utils/EventService';
import './Calendario.css';
import axios from 'axios';
import pollReportStatus from '../../utils/PollReportStatus';

let lastProcessedTrigger = null;
let lastProcessedSaveTrigger = null;
let lastProcessedExportTrigger = null;

const CalendarioTigo = ({ id, zoom, clipboard, setClipboard, isCompact, importConfig, saveConfig, exportConfig }) => {
  const calendarRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null); // { x, y, event }
  const [editModal, setEditModal] = useState(null);     // { x, y, event }
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
    const isShiftPressed = info?.jsEvent?.shiftKey;
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
    const duration = newEnd.getTime() - newStart.getTime();
    
    const threshold = 10 * 60 * 1000; 
    let closestTime = null;
    let minDiff = threshold;

    allEvents.forEach(ev => {
      if (ev !== info.event) {
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

    if (closestTime) {
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
    try {
      const res = await axios.post(apiUrl + '/programacion/getEventsByCalendar/', {
        "calendar_id": selectedCalId
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

  const handlePasteAction = async(targetEvent) => {
    const calendarApi = calendarRef.current.getApi();
    const newEventsUI = pasteItems(new Date(targetEvent.start), clipboard, calendarApi);
    if (newEventsUI.length === 0) return;
    const dataToSave = newEventsUI.map(ev => ({
      title: ev.title,
      start: ev.start, // pasteItems ya calculó estas fechas
      end: ev.end,
      background_color: ev.backgroundColor,
      calendar_id: selectedCalId,
      extended_props: ev.extendedProps || {}
    }));
    try{
      await bulkCreateEventsInDB(apiUrl, token, dataToSave)
      fetchEvents();
    }catch(e){
      newEventsUI.forEach(ev => {
        const eventInCal = calendarApi.getEventById(ev.id);
        if (eventInCal) eventInCal.remove();
      });
      alert("Error al persistir el pegado");
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
    } catch (e) {
      info.event.remove();
      console.log(e)
      alert("Error al guardar en el servidor");
    }
  };

  const handleEventChange = async (info) => {
    const affectedEvents = handleEventPlacement(info);
    const isShiftPressed = info.jsEvent?.shiftKey;
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
        handlePasteAction({ start: calendarApi.view.activeStart });
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
        if (allEvents.length === 0) {
          alert("No hay eventos en esta semana para guardar como plantilla.");
          return;
        }

        // Calcular el Lunes de la semana actual visible
        const target = new Date(currentView.activeStart);
        const day = target.getDay();
        const diff = target.getDate() - day + (day === 0 ? -6 : 1);
        const mondayStart = new Date(target.setDate(diff));
        mondayStart.setHours(0, 0, 0, 0);

        const sourceMondayTimestamp = mondayStart.getTime();

        // Transformar eventos al formato estricto de Template
        const templateData = {
          type: "WEEK",
          sourceMonday: sourceMondayTimestamp,
          data: allEvents.map(ev => ({
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

        // Envío a la DB
        try {
          const payload = {
            nombre: saveConfig.templateName,
            eventos: templateData
          };
          
          await axios.post(`${apiUrl}/programacion/createTemplate/`, payload, {
            headers: { Authorization: `Token ${token}` }
          });
          
          alert(`Plantilla "${saveConfig.templateName}" guardada exitosamente.`);
        } catch (e) {
          console.error("Error al guardar plantilla:", e);
          alert("Error al persistir la plantilla en el servidor.");
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
          const filename = exportConfig.pdfName;
          const ejecutarExportacion = async () => {
              try {
                  const task_id = await exportGridToPDF(selectedCalIdRef.current,filename,calendarRef);
                  if (task_id) {
                      // Iniciamos el polling
                      pollReportStatus(task_id, token, filename);
                  }
              } catch (error) {
                  console.error("Error en el flujo de PDF:", error);
                  lastProcessedExportTrigger = null;
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
      console.error("Error al actualizar el bloque:", e);
      alert("No se pudo actualizar el nombre del bloque.");
    }
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

        nowIndicator={true}
        allDaySlot={false}
        slotDuration={zoom}
        snapDuration="00:05:00"
        eventOverlap={(stillEvent, movingEvent) => {
            return window.event?.shiftKey ? true : false;
          }}

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
            const slotEl = e.target.closest('.fc-timegrid-slot-lane') || e.target.closest('.fc-timegrid-slot');
            if (colEl) {
              const dateStr = colEl.getAttribute('data-date');
              const timeStr = slotEl?.getAttribute('data-time') || '00:00:00';
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
        />
      )}
    </div>
  );
};

export default CalendarioTigo;