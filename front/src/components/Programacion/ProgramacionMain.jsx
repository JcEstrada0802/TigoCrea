import React from 'react';
import BlockManager from './MainComponents/BlockManager';
import CalendarioTigo from './MainComponents/Calendario';
import CreateCatBlocksModal from './Modals/CreateCatBlocksModal';
import CreateBlockModal from './Modals/CreateBlockModal';
import Controls from './utils/Controls';
import TemplateControls from './utils/TemplateControls';
import ImportTemplateModal from './Modals/ImportTemplateModal';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Alert from '../utils/Alert';

function ProgramacionMain() {
  // POSICION Y VISIBILIDAD DEL CREATE MODAL
  const [modalPos, setModalPos] = useState({ top: 0, left: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  // ALERTAS
  const [showAlert, setShowAlert] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipo, setTipo] = useState("");

  // DATOS DEL USUARIO
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  // DATOS DEL CATALOGO DE BLOQUES
  const [datos, setDatos] = useState([{}]);
  const [cat_id, setCatId] = useState(null);
  const [catName, setCatName] = useState("");

  // CONFIGURACION DEL ZOOM EN EL CALENDARIO
  const [slotSize, setSlotSize] = useState("00:15:00");
  const ZOOM_LEVELS = ["01:00:00", "00:30:00", "00:15:00", "00:05:00"];
  const [CalendarViews, setCalendarViews] = useState(1);

  // PORTAPAPELES UNIVERSAL, COPY-PASTE ENTRE CALENDARIOS E IMPORTACIONES
  const [universalCB, setUniversalCB] = useState(null);
  const [importConfig, setImportConfig] = useState(null);
  const [saveConfig, setSaveConfig] = useState(null);
  const [exportConfig, setExportConfig] = useState(null);
  
  // ------------------- SETEAR Y MOSTRAR ALERTAS --------------------
  function setAlert(type, message) {
    setMensaje(message)
    setTipo(type)
    setShowAlert(true)
    setTimeout(() => {setShowAlert(false)}, 2500)
  }

  // ------------------ SETEAR CATEGORIAS Y BLOQUES ------------------
  const fetchCatalog = async() =>{
    const response = await fetch(apiUrl + '/programacion/getProgCatalog/', {
      headers: { 'Authorization': `Token ${token}` }
    });
    const data = await response.json();
    setDatos(data);
  }

  useEffect(() => {
    fetchCatalog()
  },[isModalOpen])
  // -----------------------------------------------------------------
  // ------------------ CREAR CATEGORIAS DE BLOQUES ------------------
  const createCatBlock = async(data) => {
    try{
      const categoria = await axios.post(apiUrl + "/programacion/createBlockCat/",
        data,
        {
          headers: { Authorization: `Token ${token}` }
        }
      )
      fetchCatalog();
      setIsModalOpen(false)
      setMensaje("Categoría creada exitosamente")
      setTipo("success")
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 2500)
    }catch(err){
      setTipo("error")
      setMensaje(err.response.data.error)
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 2500)
      console.log("Error, ", err.response.data.error)
    }
  };
  // -----------------------------------------------------------------
  // -------------- MOSTRAR MODAL PARA CREAR CATEGORIAS --------------
  const handleAddClick = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setModalPos({ 
          top: rect.bottom + 10,
          left: rect.left 
      });
      setIsModalOpen(true);
  };

  const handleCreateBlock = (id, nombre) => {
    setIsBlockModalOpen(true)
    setCatId(id)
    setCatName(nombre)
  }

  const handleFinish = () => {
    fetchCatalog();
    setIsBlockModalOpen(false)
    setMensaje("Categoría creada exitosamente")
    setTipo("success")
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 2500)
  }
  // -----------------------------------------------------------------
  // ---------------- CONTROL DEL ZOOM DEL CALENDARIO ----------------
  const zoomIn = () => {
    setSlotSize(prevSize => {
      const currentIndex = ZOOM_LEVELS.indexOf(prevSize);
      // Para acercar (In), queremos ir hacia el final del array (donde los tiempos son menores)
      if (currentIndex < ZOOM_LEVELS.length - 1) {
        return ZOOM_LEVELS[currentIndex + 1];
      }
      return prevSize; // Ya estamos en el máximo detalle
    });
  };

  const zoomOut = () => {
    setSlotSize(prevSize => {
      const currentIndex = ZOOM_LEVELS.indexOf(prevSize);
      // Para alejar (Out), queremos ir hacia el inicio del array (donde los tiempos son mayores)
      if (currentIndex > 0) {
        return ZOOM_LEVELS[currentIndex - 1];
      }
      return prevSize; // Ya estamos en la vista más lejana
    });
  };

  const reset = () => {
    setSlotSize("00:15:00")
  }

  const onChangeView = () =>{
    setCalendarViews(prev => {
      if (prev === 1) return 2;
      if (prev === 2) return 3;
      return 1; // Si es 3 (o cualquier otro), vuelve a 1
    });
  }
  // -------------- IMPORTACION/EXPORTACION DE TEMPLATES -------------
  const ImportTemplate = (calendarId, events) => {
    setUniversalCB(events)
    setImportConfig({
      calendarId: calendarId,
      trigger: Date.now() 
    });
  }

  const SaveTemplate = (calendarId, templateName) => {
    setSaveConfig({
      calendarId: calendarId,
      templateName: templateName,
      trigger: Date.now()
    })
  }

  // -------------- EXPORTACION A PDF DE LA PARRILLA -------------
  const ExportToPDF = (calendarId, pdfName) => {
    setExportConfig({
      calendarId: calendarId,
      pdfName: pdfName,
      trigger: Date.now()
    })
  }

  const ExportToCLF = (nombre, fecha, calendario) =>{
    setExportConfig({
      clfName: nombre,
      fecha: fecha,
      calendarId: calendario
    })
  }

  return (
    <div style={{ 
        display: 'flex', 
        gap: '24px', 
        padding: '5px', 
        minHeight: '100%',
        boxSizing: 'border-box'
      }}>
        
        {/* Contenedor del Manager */}
        <aside style={{ width: '320px', display: 'flex', flexDirection: 'column', height: '95vh', padding: '10px', boxSizing: 'border-box'}}>
          <TemplateControls onConfirmImport={ImportTemplate} onConfirmExport={SaveTemplate} onConfirmPDF={ExportToPDF} onConfirmClf={ExportToCLF}/>
          <div style={{ flexGrow: 1, overflow: 'hidden' }}>
            <BlockManager categorias={datos} createCat={handleAddClick} createBlock={handleCreateBlock}/>
          </div>
          <Controls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={reset} currentView={CalendarViews} onChangeView={onChangeView}/>
        </aside>

        {/* Contenedor del Calendario */}
        <main className={`flex-1 grid gap-4 p-4 transition-all duration-300 ${
            CalendarViews === 1 ? 'grid-cols-1 single-view' : 
            CalendarViews === 2 ? 'grid-cols-2 view-multiple' : 
            'grid-cols-2 grid-rows-2 view-grid'
          }`}>
          {/* Renderizamos los calendarios según el estado */}
          {[...Array(CalendarViews === 3 ? 4 : CalendarViews)].map((_, index) => (
            <div key={index} className="min-h-0 min-w-0 bg-white rounded-xl shadow-inner border border-gray-200 overflow-hidden">
              <CalendarioTigo 
                id={`cal-${index}`} 
                zoom={slotSize} 
                clipboard={universalCB} 
                setClipboard={setUniversalCB} 
                isCompact={CalendarViews > 1} 
                importConfig={importConfig}
                saveConfig={saveConfig}
                exportConfig={exportConfig}
                showAlert={setAlert}/>
            </div>
          ))}
        </main>

        {/* MODALS PARA CREAR CATEGORIAS Y BLOQUES */}
        <CreateCatBlocksModal 
            isVisible={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            onSave={(data) => createCatBlock(data)}
            position={modalPos}
        />
        <CreateBlockModal 
          isOpen={isBlockModalOpen}
          onClose={() => setIsBlockModalOpen(false)}
          categoriaId={cat_id} 
          categoriaNombre={catName}
          config={{ mode: 'create' }}
          onFinish={handleFinish}
        />
        {/* MODALS PARA IMPORTA/EXPORTAR TEMPLATES */}
        {showAlert && <Alert type={tipo} message={mensaje}/>}
      </div>
  )
}

export default ProgramacionMain