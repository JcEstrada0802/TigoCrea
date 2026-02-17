import React, { useState } from 'react';
import { Download, Save } from 'lucide-react';
import { FaFilePdf } from 'react-icons/fa';
import ImportTemplateModal from '../Modals/ImportTemplateModal';
import CreateTemplateModal from '../Modals/CreateTemplateModal';

const TemplateControls = ({ onConfirmImport, onConfirmExport }) => {
  const [showImport, setShowImport] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [modalPos, setModalPos] = useState({ top: 0, left: 0 });
  

  const handleOpen = (e, setter) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setModalPos({
      top: rect.bottom + 8, // 8px de margen
      left: rect.left
    });
    setter(true);
  };
  

  return (
    <div className="relative">
      <div className="flex items-center bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-full shadow-sm border border-gray-100 gap-1 w-full justify-between mb-4">
        {/* Botón Importar (Plantilla) */}
        <button 
          onClick={(e)=> handleOpen(e, setShowImport)} 
          className="flex items-center gap-1 px-2 py-1 hover:bg-green-50 rounded-full text-green-600 transition-all active:scale-95 font-bold text-[10px] whitespace-nowrap"
        >
          <Download size={18} />
        </button>

        <div className="w-[1px] h-3 bg-gray-200"></div>

        {/* Botón Guardar (Plantilla) */}
        <button 
          onClick={(e)=> handleOpen(e, setShowSave)} 
          className="flex items-center gap-1 px-2 py-1 hover:bg-blue-50 rounded-full text-[#001EB4] transition-all active:scale-95 font-bold text-[10px] whitespace-nowrap"
        >
          <Save size={18} />
        </button>

        <div className="w-[1px] h-3 bg-gray-200"></div>

        {/* Botón Guardar (Exportar PDF) */}
        <button 
          onClick={(e)=> handleOpen(e, setShowExport)} 
          className="flex items-center gap-1 px-2 py-1 hover:bg-blue-50 rounded-full text-[#001EB4] transition-all active:scale-95 font-bold text-[10px] whitespace-nowrap"
        >
          <FaFilePdf size={18} />
        </button>
      </div>

      {/* Renderizamos el Modal aquí mismo */}
      <ImportTemplateModal 
        isVisible={showImport}
        onClose={() => setShowImport(false)}
        onSave={onConfirmImport}
        position={modalPos}
      />

      <CreateTemplateModal
        isVisible={showSave}
        onClose={()=>setShowSave(false)}
        onSave={onConfirmExport}
        position={modalPos}
      />
    </div>
  );
};
export default TemplateControls;