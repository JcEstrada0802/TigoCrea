import React, { useEffect, useState } from 'react';
import CreateCatModal from './Modals/CreateCatModal';
import CreateContModal from './Modals/CreateContModal';
import CreateProdModal from './Modals/CreateProdModal';
import CreateSegModal from './Modals/CreateSegModal';
import DeleteConfirmModal from './Modals/DeleteModals/DeleteConfirmModal';
import axios from 'axios';
import Alert from '../utils/Alert';
import { useSelection } from './Hooks/UseSelection';
import { useAuth } from '../authComponents/UseAuth';
import ColumnaPanel from './utils/ColumnaPanel';

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

  // ------------- ESTADO PARA MANEJAR LA SELECCIÓn DE SECCIONES -------------
  const [selectedCategorias, toggleCategory, setSelectedCategorys] = useSelection();
  const [selectedContenidos, toggleContenido, setSelectedContenidos] = useSelection();
  const [selectedProducciones, toggleProduccion, setSelectedProducciones] = useSelection();
  const [selectedSegmentos, toggleSegmento, setSelectedSegmentos] = useSelection();
  // -------------------------------------------------------------------------

  // ------------ ESTADO PARA MANEJAR LA ELIMINACIÓN DE SECCIONES ------------
  const [deleteModalConfig, setDeleteModalConfig] = useState({ 
    open: false, 
    seccion: '', 
    items: [] 
  });
  // -------------------------------------------------------------------------

  // -------------- ESTADO PARA MANEJAR LA EDICIÓN DE SECCIONES --------------
  const [editModalConfig, setEditModalConfig] = useState({ 
    mode: '', 
    id: [0] 
  });
  // -------------------------------------------------------------------------

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

  // -------------------------- FETCH DE CONTENIDOS --------------------------
  // Fetchear Categorias
  const fetchCategorias = async () => {
      try{
        const response = await axios.post(apiUrl+'/catalogo/getCategorias/', {
          categorias:[0]
        },{
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
  // -------------------------------------------------------------------------


  // -------------------- ELIMINAR SECCIONES DEL CATALOGO --------------------
  const onDelete = (seccion, listaCompleta, idsSeleccionados) =>{
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
        { seccion: seccion,
          ids: idsAEliminar, }, 
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

  // --------------------- EDITAR SECCIONES DEL CATALOGO ---------------------
  const onOpen = (mode, seccion) =>{
    try {
      const seleccionMap = {
        "categoria": selectedCategorias,
        "contenido": selectedContenidos,
        "produccion": selectedProducciones,
        "segmento": selectedSegmentos
      };

      const modalMap = {
        "categoria": setShowCatModal,
        "contenido": setShowContModal,
        "produccion": setShowProdModal,
        "segmento": setShowSegModal
      };

      const listaSeleccionada = seleccionMap[seccion] || [];
      const idParaEditar = listaSeleccionada.at(-1);

      if (!idParaEditar && mode === "edit") {
        console.warn(`No hay ningún item seleccionado en ${seccion} para editar.`);
        return;
      }

      setEditModalConfig({ 
        mode: mode, 
        id: [idParaEditar] 
      });
      
      if (modalMap[seccion]) {
        modalMap[seccion](true);
      }
    } catch (error) {
      console.error(`Error al abrir el modal de ${seccion}:`, error);
    }
  }

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
        { 
          title: 'CATEGORÍA', 
          items: categorias, 
          addFunc: () => {onOpen("create","categoria")}, 
          onEdit: () => {onOpen("edit","categoria")}, 
          selFunc:  toggleCategory, 
          delFunc: () => {onDelete('categorias', categorias, selectedCategorias)}},
        { 
          title: 'CONTENIDO', 
          items: contenidos, 
          addFunc: () => {onOpen("create","contenido")}, 
          onEdit: () => {onOpen("edit","contenido")}, 
          selFunc: toggleContenido, 
          delFunc: () => {onDelete('contenidos', contenidos, selectedContenidos)}},
        { 
          title: 'PRODUCCIÓN', 
          items: producciones, 
          addFunc: () => {onOpen("create","produccion")}, 
          onEdit: () => {onOpen("edit","produccion")}, 
          selFunc: toggleProduccion, 
          delFunc: () => {onDelete('producciones', producciones, selectedProducciones)}},
        { 
          title: 'SEGMENTACIÓN', 
          items: segmentos, 
          addFunc: () => {onOpen("create","segmento")}, 
          onEdit: () => {onOpen("edit","segmento")}, 
          selFunc: toggleSegmento, 
          delFunc: () => {onDelete('segmentos', segmentos, selectedSegmentos)}},
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
            onEdit={col.onEdit}
            onSelect={col.selFunc}
            onDelete={col.delFunc}
          />
        ))}
      </div>
      <CreateCatModal isOpen={showCatModal} onClose={() => cerrar(setShowCatModal)} onFinish={handleTerminate} config={editModalConfig}/>
      <CreateContModal isOpen={showContModal} onClose={() => cerrar(setShowContModal)} onFinish={handleTerminate} selectedCat={selectedCategorias.at(-1)} config={editModalConfig}/>
      <CreateProdModal isOpen={showProdModal} onClose={() => cerrar(setShowProdModal)} onFinish={handleTerminate} selectedCont={selectedContenidos.at(-1)} config={editModalConfig}/>
      <CreateSegModal isOpen={showSegModal} onClose={() => cerrar(setShowSegModal)} onFinish={handleTerminate} selectedProd={selectedProducciones.at(-1)} config={editModalConfig}/>
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