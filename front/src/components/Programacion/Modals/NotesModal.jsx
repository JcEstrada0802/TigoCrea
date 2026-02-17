import React, { useState, useEffect } from 'react';
import './NotesModal.css';

const NotesModal = ({ hoverData, setHoverData, updateEventInDB, apiUrl, token }) => {
  const { x, y, event } = hoverData;
  // Estado local para que el input sea fluido al escribir
  const [localNota, setLocalNota] = useState("");

  // Sincronizar el estado local cuando cambia el evento seleccionado
  useEffect(() => {
    if (event) {
      setLocalNota(event.extendedProps.nota || "");
    }
  }, [event]);

  const handleChange = (e) => {
    const value = e.target.value;
    setLocalNota(value);
    // Actualizamos FullCalendar en tiempo real (visual)
    event.setExtendedProp('nota', value);
  };

  const handleBlur = async () => {
    try {
      await updateEventInDB(apiUrl, token, event);
      console.log("Nota guardada en DB");
    } catch (error) {
      console.error("Error al guardar nota:", error);
    }
  };

  return (
    <div 
      className="notes-mini-modal"
      style={{ top: y + 15, left: x + 15 }}
      onMouseEnter={() => setHoverData(prev => ({ ...prev, visible: true }))}
      onMouseLeave={() => setHoverData(prev => ({ ...prev, visible: false }))}
    >
      <div className="notes-container">
        <label htmlFor="nota-input">NOTAS:</label>
        <input 
          id="nota-input"
          type="text" 
          autoFocus
          placeholder="Ej: J1-ANT_MIX-11022026"
          value={localNota}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.target.blur(); // Guarda al presionar Enter
          }}
        />
      </div>
      <div className="modal-arrow"></div>
    </div>
  );
};

export default NotesModal;