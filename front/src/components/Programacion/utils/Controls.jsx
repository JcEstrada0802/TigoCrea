import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, LayoutGrid, Square, Columns, Grid2X2 } from 'lucide-react';

const Controls = ({ onZoomIn, onZoomOut, onReset, currentView, onChangeView }) => {
  
  // Función para ciclar entre vistas o mostrar el icono correcto
  const getViewIcon = () => {
    if (currentView === 1) return <Square size={14} />;
    if (currentView === 2) return <Columns size={14} />;
    return <Grid2X2 size={14} />;
  };

  return (
    /* Reducimos px-4 a px-2 y gap-2 a gap-1 para que respire dentro del óvalo */
    <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border border-gray-200 mt-4 w-full">
      
      {/* Grupo Zoom Out */}
      <button onClick={onZoomOut} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-all active:scale-90" title="Alejar">
        <ZoomOut size={14} />
      </button>
      <div className="w-[1px] h-3 bg-gray-200"></div>

      {/* Grupo Reset */}
      <button onClick={onReset} className="p-1.5 hover:bg-blue-50 rounded-full text-[#001EB4] transition-all active:rotate-[-45deg]" title="Resetear Zoom">
        <RotateCcw size={14} />
      </button>
      <div className="w-[1px] h-3 bg-gray-200"></div>

      {/* Grupo Zoom In */}
      <button onClick={onZoomIn} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-all active:scale-110" title="Acercar">
        <ZoomIn size={14} />
      </button>
      <div className="w-[1px] h-3 bg-gray-200"></div>

      {/* BOTÓN DE VISTAS (NUEVO) */}
      <button onClick={onChangeView} className="flex items-center gap-1.5 px-2 py-1 hover:bg-purple-50 rounded-full text-purple-600 transition-all active:scale-95" title="Cambiar Layout">
        {getViewIcon()}
      </button>
      
    </div>
  );
};

export default Controls;