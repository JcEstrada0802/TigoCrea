import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import ConfirmationAlert from '../../utils/ConfirmationAlert';

const EditEventModal = ({ x, y, event, onClose, onSave, onDelete }) => {
  const [nombre, setNombre] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleConfirmDelete = () => {
    onDelete(event.id);
    setShowDeleteConfirm(false);
    onClose();
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
          <div className="flex items-center gap-2">
            <span className="text-blue-500">ID: {event.id}</span>
            <span className="text-gray-300">|</span>
            <span>Editar Bloque</span>
          </div>
          
          {/* Botón Eliminar con ! en hover */}
          <button 
            onClick={() => {setShowDeleteConfirm(true)}}
            className="p-1.5 text-gray-400 hover:!text-red-500 hover:!bg-red-50 rounded-lg transition-colors group"
            title="Eliminar bloque"
          >
            <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
          </button>
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
              className="flex-1 px-3 py-1.5 text-[12px] font-medium text-gray-400 hover:!bg-gray-100 rounded-lg transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 text-[12px] font-bold text-white !bg-blue-600 hover:!bg-blue-500 rounded-lg shadow-md shadow-blue-500/20 transition-all"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
      {showDeleteConfirm && (
        <ConfirmationAlert
          tipo="warning"
          message={`¿Desea eliminar el bloque "${nombre}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => {setShowDeleteConfirm(false); onClose()}}
        />
      )}
    </>
  );
};

export default EditEventModal;