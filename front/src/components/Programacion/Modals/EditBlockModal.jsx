import React, { useState, useEffect } from 'react';

const EditBlockModal = ({ x, y, event, onClose, onSave }) => {
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    if (event) setNombre(event.title || '');
  }, [event]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nombre.trim()) {
      onSave(event.id, nombre);
      onClose();
    }
  };

  return (
    <>
      {/* Overlay para cerrar */}
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      
      {/* El Modal - Estilo ContextMenu */}
      <div 
        className="fixed z-[9999] w-64 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-2xl p-4 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
        style={{ top: y, left: x }}
      >
        <div className="px-1 py-1 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 flex justify-between items-center">
          <span>Editar Bloque</span>
          <span className="text-blue-500">ID: {event.id}</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            autoFocus
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[13px] text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="Nombre del bloque..."
          />
          
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-1.5 text-[12px] font-medium text-gray-400 hover:!bg-gray-200 rounded-lg transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 text-[12px] font-bold text-white !bg-blue-600 hover:!bg-[#44C8F5] rounded-lg shadow-lg shadow-blue-500/30 transition-all"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditBlockModal;