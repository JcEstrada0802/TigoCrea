import React from 'react';

const ContextMenu = ({ x, y, onClose, onCopy, onPaste, clipboard, event }) => {
  // Verificamos si el clic fue en un espacio vacío (sin evento real)
  const isBlank = !event || event.isBlankSpace;

  return (
    <>
      {/* Overlay invisible para cerrar al hacer clic fuera */}
      <div 
        className="fixed inset-0 z-[9998]" 
        onClick={onClose} 
        onContextMenu={(e) => { e.preventDefault(); onClose(); }}
      />
      
      {/* El Menú - Redondito y compacto */}
      <div 
        className="fixed z-[9999] w-44 bg-white/95 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-2xl py-1.5 flex flex-col overflow-hidden"
        style={{ top: y, left: x }}
      >
        <div className="px-3 py-1 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
          ClipBoard
        </div>

        {/* Botón: Copiar Bloque */}
        <button 
          disabled={isBlank}
          onClick={() => { onCopy('BLOCK', event); onClose(); }}
          className={`flex items-center px-3 py-1.5 !text-[13px] transition-all duration-200 text-left mx-1 rounded-lg
            ${isBlank 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:!bg-blue-600 hover:text-white'}`}
        >
          <span className="mr-2 text-sm">📋</span> Copiar Bloque
        </button>

        {/* Botón: Copiar Día */}
        <button 
          disabled={isBlank}
          onClick={() => { onCopy('DAY', event); onClose(); }}
          className={`flex items-center px-3 py-1.5 !text-[13px] transition-all duration-200 text-left mx-1 rounded-lg
            ${isBlank 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:!bg-blue-600 hover:text-white'}`}
        >
          <span className="mr-2 text-sm">📅</span> Copiar Día
        </button>

        {/* Botón: Copiar Semana */}
        <button 
          disabled={isBlank}
          onClick={() => { onCopy('WEEK', event); onClose(); }}
          className={`flex items-center px-3 py-1.5 !text-[13px] transition-all duration-200 text-left mx-1 rounded-lg
            ${isBlank 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:!bg-blue-600 hover:text-white'}`}
        >
          <span className="mr-2 text-sm">🗓️</span> Copiar Semana
        </button>

        <div className="my-1 border-t border-gray-50" />

        {/* Botón: Pegar (Este sí funciona en espacios blancos si hay algo en clipboard) */}
        <button 
          disabled={!clipboard}
          onClick={() => { onPaste(event); onClose(); }}
          className={`flex items-center px-3 py-1.5 !text-[13px] text-left transition-all duration-200 mx-1 rounded-lg
            ${clipboard 
              ? 'text-blue-600 bg-blue-50 hover:!bg-blue-600 hover:text-white font-semibold' 
              : 'text-gray-300 cursor-not-allowed'}`}
        >
          <span className="mr-2 text-sm">📥</span> 
          Pegar {clipboard?.type === 'BLOCK' ? 'Bloque' : 'Todo'}
        </button>
      </div>
    </>
  );
};

export default ContextMenu;