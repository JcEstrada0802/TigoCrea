import React, { useEffect, useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import CreateCatModal from './Modals/CreateCatModal';
import CreateContModal from './Modals/CreateContModal';
import CreateProdModal from './Modals/CreateProdModal';
import CreateSegModal from './Modals/CreateSegModal';
import DeleteConfirmModal from './Modals/DeleteModals/DeleteConfirmModal';
import axios from 'axios';
import Alert from '../utils/Alert';
import { useSelection } from './Hooks/UseSelection';
import { useAuth } from '../authComponents/UseAuth';



function ColumnaPanel({ title, items, onAdd, onEdit, onDelete, onSelect}) {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Título de la Columna */}
      <h3 className="text-center text-sm font-bold text-indigo-900 tracking-wider mb-2 uppercase">
        {title}
      </h3>

      {/* Contenedor de la Caja */}
      <div className="border-2 border-indigo-900 rounded-lg flex flex-col h-full max-h-[80vh] bg-gray-50 shadow-sm">
        {/* Barra de Iconos */}
        <div className="flex justify-end items-center space-x-2 p-2 border-b !border-gray-300">
          <button 
            onClick={onAdd} 
            className="p-1.5 bg-blue-500 text-gray rounded-full hover:bg-blue-600 transition-colors"
            aria-label="Agregar"
          >
            <PlusIcon className="h-4 w-4" /> 
          </button>
          <button 
            onClick={onEdit} 
            className="p-1.5 bg-blue-500 text-gray rounded-full hover:bg-blue-600 transition-colors"
            aria-label="Editar"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button 
            onClick={onDelete} 
            className="p-1.5 bg-blue-500 text-gray rounded-full hover:bg-blue-600 transition-colors"
            aria-label="Eliminar"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Lista de Contenido (Scrollable) */}
        <div className="flex-grow overflow-y-auto p-3">
          {items.length === 0 ? (
            <p className="text-gray-400 text-sm text-center pt-4">No hay contenido</p>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id} className="flex items-center space-x-2 p-1 rounded hover:bg-gray-100">
                  <input
                    type="checkbox"
                    id={`${title}-${item.id}`}
                    onChange={(e) => {
                      onSelect(item.id, e.target.checked); 
                    }}
                    className="h-4 w-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div
                    className="w-8 h-4 rounded-sm border border-gray-300"
                    style={{ backgroundColor: item.color }}
                    title={item.color}
                  ></div>
                  <label 
                    htmlFor={`${title}-${item.id}`} 
                    className="text-sm text-indigo-900 select-none cursor-pointer"
                  >
                    {item.label}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL (LAYOUT) ---
export default function PanelPrincipal() {
  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  // Estados para Modals
  const [showCatModal, setShowCatModal] = useState(false);
  const [showContModal, setShowContModal] = useState(false);
  const [showProdModal, setShowProdModal] = useState(false);
  const [showSegModal, setShowSegModal] = useState(false);

  // Estados para Alert
  const [showAlert, setShowAlert] = useState(false);
  const [mensaje, setMensaje] = useState('Evento creado');
  const [tipo, setTipo] = useState('success');
  
  // Estados de Categorias/Contenidos/Produccion
  const [categorias, setCategorias] = useState([]);
  const [contenidos, setContenidos] = useState([]);
  const [producciones, setProducciones] = useState([]);
  const [segmentos, setSegmentos] = useState([]); 

  const [columnas, setColumnas] = useState([
    { title: 'CATEGORÍA', items: [], addFunc: setShowCatModal },
    { title: 'CONTENIDO', items: [], addFunc: setShowContModal },
    { title: 'PRODUCCIÓN', items: [], addFunc: setShowProdModal },
    { title: 'SEGMENTACIÓN', items: [], addFunc: setShowSegModal },
  ]);

  // Estados de Selección
  const [selectedCategorias, toggleCategory, setSelectedCategorys] = useSelection();
  const [selectedContenidos, toggleContenido, setSelectedContenidos] = useSelection();
  const [selectedProducciones, toggleProduccion, setSelectedProducciones] = useSelection();
  const [selectedSegmentos, toggleSegmento, setSelectedSegmentos] = useSelection();

  // Estado para Manejar la eliminación de secciones
  const [deleteModalConfig, setDeleteModalConfig] = useState({ 
    open: false, 
    seccion: '', 
    items: [] 
  });

  // ------------------------- LIMPIEZA DE SELECTEDS -------------------------
  useEffect(() => {
    const idsVigentes = contenidos.map(c => c.id);
    setSelectedContenidos(prev => prev.filter(id => idsVigentes.includes(id)));
  }, [contenidos]);

  useEffect(() => {
    const idsVigentes = producciones.map(p => p.id);
    setSelectedProducciones(prev => prev.filter(id => idsVigentes.includes(id)));
  }, [producciones]);

  useEffect(() => {
    const idsVigentes = segmentos.map(s => s.id);
    setSelectedSegmentos(prev => prev.filter(id => idsVigentes.includes(id)));
  }, [segmentos]);
  // -------------------------------------------------------------------------

  // Fetchear Categorias
  const fetchCategorias = async () => {
      try{
        const response = await axios.get(apiUrl+'/catalogo/getCategorias/', {
          headers: { Authorization: `Token ${token}` }
        });
        const formattedCategorias = response.data.map(cat => ({
          id: cat.id,
          label: cat.nombre,
          color: cat.color
        }));
        setCategorias(formattedCategorias);
      }catch(e){
        console.log(e);
      }
    }
  
  // Fetchear Contenidos
  const fetchContenidos = async () => {
    try{
      const response = await axios.post(apiUrl+'/catalogo/getContenidos/',{
        categorias: selectedCategorias
      },{
        headers:{Authorization: `Token ${token}`,
                'Content-Type': 'application/json'
        }
      })
      const formattedContenidos = response.data.map(cont => ({
          id: cont.id,
          label: cont.nombre,
          color: cont.categoria_color
        }));
      setContenidos(formattedContenidos);
    }catch(e){

    }
  }

  // Fetchear Producciones
  const fetchProducciones = async () => {
    try{
      const response = await axios.post(apiUrl+'/catalogo/getProducciones/',{
        contenidos: selectedContenidos
      },{
        headers:{Authorization: `Token ${token}`,
                'Content-Type': 'application/json'
        }
      })
      const formattedProducciones = response.data.map(prod => ({
        id: prod.id,
        label: prod.titulo,
        color: prod.categoria_color
      }));
      setProducciones(formattedProducciones);
    }catch(e){

    }
  }

  const fetchSegmentos = async () => {
    try{
      const response = await axios.post(apiUrl+'/catalogo/getSegmentos/',{
        producciones: selectedProducciones
      },{
        headers:{Authorization: `Token ${token}`,
                'Content-Type': 'application/json'
        }
      })
      const formattedSegmentos = response.data.map(seg => ({
        id: seg.id,
        label: seg.titulo,
        color: seg.categoria_color
      }));
      setSegmentos(formattedSegmentos);
    }catch(e){

    }
  }

  // -------------------- ELIMINAR SECCIONES DEL CATALOGO --------------------
  const onDelete = (seccion, listaCompleta, idsSeleccionados) =>{
    console.log(seccion,": ", idsSeleccionados)
    const items = listaCompleta.filter(i => idsSeleccionados.includes(i.id));
    if (items.length === 0) return; // O mandar un alert de "Seleccioná algo pa"
    
    setDeleteModalConfig({ open: true, seccion, items });
  }

  const handleDeleteConfirm = async () => {
    const { seccion, items } = deleteModalConfig;
    const idsAEliminar = items.map(i => i.id);
    const endpoints = {
      'categorias': '/catalogo/deleteCategorias/',
      'contenidos': '/catalogo/deleteContenidos/',
      'producciones': '/catalogo/deleteProducciones/',
      'segmentos': '/catalogo/deleteSegmentos/'
    };

    try {
      await axios.post(`${apiUrl}${endpoints[seccion]}`, 
        { ids: idsAEliminar }, 
        { headers: { Authorization: `Token ${token}` } }
      );
      setDeleteModalConfig({ ...deleteModalConfig, open: false });
      handleTerminate('success', `${items.length} items eliminados correctamente`, seccion);
      limpiarSelecciones(seccion);

    } catch (error) {
      console.error("Error al eliminar:", error);
      handleTerminate('error', 'No se pudieron eliminar los elementos', seccion);
    }
  };

  const limpiarSelecciones = (seccion) => {
    if (seccion === 'categorias') setSelectedCategorys([]);
    if (seccion === 'contenidos') setSelectedContenidos([]);
    if (seccion === 'producciones') setSelectedProducciones([]);
    if (seccion === 'segmentos') setSelectedSegmentos([]);
  };
  // -------------------------------------------------------------------------

  // Fetchear Categorias
  useEffect(() => {
    fetchCategorias();
  },[])

  // Fetchear Contenidos
  useEffect(() => {
    if(selectedCategorias.length !== 0){
      fetchContenidos();
    }else{
      setContenidos([]);
      setSelectedContenidos([]);
    }
  },[selectedCategorias])

  // Fetchear Producciones
  useEffect(() => {
    if(selectedContenidos.length !== 0){
      fetchProducciones();
    }else{
      setProducciones([])
      setSelectedProducciones([])
    }
  },[selectedContenidos])

  // Fetchear Segmentos
  useEffect(() => {
    if(selectedProducciones.length !== 0){
      fetchSegmentos();
    }else{
      setSegmentos([])
      setSelectedSegmentos([])
    }
  },[selectedProducciones])

  useEffect(() => {
      setColumnas([
        { title: 'CATEGORÍA', items: categorias, addFunc: setShowCatModal, selFunc:  toggleCategory, delFunc: () => {onDelete('categorias', categorias, selectedCategorias)}},
        { title: 'CONTENIDO', items: contenidos, addFunc: setShowContModal, selFunc: toggleContenido, delFunc: () => {onDelete('contenidos', contenidos, selectedContenidos)}},
        { title: 'PRODUCCIÓN', items: producciones, addFunc: setShowProdModal, selFunc: toggleProduccion, delFunc: () => {onDelete('producciones', producciones, selectedProducciones)}},
        { title: 'SEGMENTACIÓN', items: segmentos, addFunc: setShowSegModal, selFunc: toggleSegmento, delFunc: () => {onDelete('segmentos', segmentos, selectedSegmentos)}},
      ]);
  }, [categorias, contenidos, producciones, segmentos, selectedCategorias, selectedContenidos, selectedProducciones, selectedSegmentos]);

  const cerrar = (setter) => {
    setter(false);
  };

  const handleTerminate = (type, message, tag) =>{
    const fetchMap = {
      'segmentos': fetchSegmentos,
      'producciones': fetchProducciones,
      'contenidos': fetchContenidos,
      'categorias': fetchCategorias
    };

    fetchMap[tag]?.();

    setMensaje(message);
    setTipo(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2500);

  }

  return (
    <div className="h-screen w-full bg-gray-50 p-6 overflow-hidden">
      <div className="grid h-full grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columnas.map((col) => (
          <ColumnaPanel 
            key={col.title} 
            title={col.title} 
            items={col.items} 
            onAdd={col.addFunc}
            onSelect={col.selFunc}
            onDelete={col.delFunc}
          />
        ))}
      </div>
      <CreateCatModal isOpen={showCatModal} onClose={() => cerrar(setShowCatModal)} onFinish={handleTerminate} mode={'create'}/>
      <CreateContModal isOpen={showContModal} onClose={() => cerrar(setShowContModal)} onFinish={handleTerminate} selectedCat={selectedCategorias.at(-1)}/>
      <CreateProdModal isOpen={showProdModal} onClose={() => cerrar(setShowProdModal)} onFinish={handleTerminate} selectedCont={selectedContenidos.at(-1)}/>
      <CreateSegModal isOpen={showSegModal} onClose={() => cerrar(setShowSegModal)} onFinish={handleTerminate} selectedProd={selectedProducciones.at(-1)}/>
      <DeleteConfirmModal 
        isOpen={deleteModalConfig.open} 
        onClose={() => setDeleteModalConfig({ ...deleteModalConfig, open: false })} 
        onConfirm={handleDeleteConfirm} // Esta es la función que hará el axios.delete
        seccion={deleteModalConfig.seccion} 
        itemsSeleccionados={deleteModalConfig.items} 
      />
      {showAlert && <Alert type={tipo} message={mensaje}/>}
    </div>
  );
}