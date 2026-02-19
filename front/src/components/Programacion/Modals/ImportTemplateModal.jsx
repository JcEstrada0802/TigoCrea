import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaDownload, FaCalendarAlt, FaLayerGroup } from 'react-icons/fa';
import axios from 'axios';

const ImportTemplateModal = ({ isVisible, onClose, onSave, position }) => {
  const [selectedCalendar, setSelectedCalendar] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [calendars, setCalendars] = useState([]);
  const [templates, setTemplates] = useState([]);
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const modalRef = useRef(null);

  // Carga de datos al abrir el modal
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            onClose();
        }
    };

    const handleEsc = (event) => {
            if (event.key === 'Escape') onClose();
        };

    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Token ${token}` };
        const [resTemplates, resCalendars] = await Promise.all([
          axios.get(`${apiUrl}/programacion/getTemplates/`, { headers }),
          axios.get(`${apiUrl}/programacion/getCalendars/`, { headers })
        ]);

        setTemplates(resTemplates.data);
        setCalendars(resCalendars.data);
      } catch (error) {
        console.error("Error cargando datos del modal:", error);
      }
    };

    fetchData();
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isVisible, apiUrl, token]);

  if (!isVisible) return null;

  const handleImportClick = () => {
    if (!selectedCalendar || !selectedTemplate) {
      alert("Por favor, selecciona el canal destino y la plantilla.");
      return;
    }

    const plantilla = templates.find(t => t.id == selectedTemplate);
    
    if (plantilla) {
      // Enviamos el ID del calendario y el array de eventos al padre
      onSave(selectedCalendar, plantilla.eventos);
      onClose(); 
    }
  };

  return (
      <div 
        ref={modalRef}
        className="fixed bg-white w-full max-w-sm p-6 rounded-2xl shadow-2xl border border-gray-100 transform transition-all z-[100]"
        style={{
          top: position?.top || '20%',  
          left: position?.left || '20%', 
        }}
      >
        {/* Header */}
        <div className="mb-5">
          <h2 className="text-md font-bold text-[#001EB4] flex items-center gap-2">
            <FaDownload size={14} /> Importar Parrilla
          </h2>
          <p className="text-[9px] text-gray-400 mt-0.5 uppercase font-black tracking-widest">
            Configuración
          </p>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          {/* Calendario Destino */}
          <div>
            <label className="flex items-center gap-2 text-[9px] font-black text-gray-400 mb-1.5 ml-1 tracking-tighter">
              <FaCalendarAlt className="text-blue-400" /> CANAL DESTINO
            </label>
            <select 
              value={selectedCalendar}
              onChange={(e) => setSelectedCalendar(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl text-[11px] font-bold text-gray-600 focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer"
            >
              <option value="">¿A qué canal?</option>
              {calendars.map(cal => (
                <option key={cal.id} value={cal.id}>{cal.name}</option>
              ))}
            </select>
          </div>

          {/* Plantilla Origen */}
          <div>
            <label className="flex items-center gap-2 text-[9px] font-black text-gray-400 mb-1.5 ml-1 tracking-tighter">
              <FaLayerGroup className="text-purple-400" /> PLANTILLA SEMANAL
            </label>
            <select 
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl text-[11px] font-bold text-gray-600 focus:ring-2 focus:ring-purple-400 outline-none cursor-pointer"
            >
              <option value="">Selecciona plantilla...</option>
              {templates.map(temp => (
                <option key={temp.id} value={temp.id}>{temp.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón Confirmar */}
        <button 
          onClick={handleImportClick}
          disabled={!selectedCalendar || !selectedTemplate}
          className="w-full mt-6 flex items-center justify-center gap-2 !bg-[#001EB4] text-white font-bold px-4 py-3 rounded-xl hover:!bg-[#44C8F5] transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          <FaDownload /> Importar
        </button>
      </div>
  );
};

export default ImportTemplateModal;