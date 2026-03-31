import React, { useState, useEffect, useRef } from 'react';
import { Draggable } from '@fullcalendar/interaction';
import { FaPlus, FaFolder, FaFolderOpen, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import EditCatModal from '../Modals/EditCatModal';
import { framesToFullCalendarDuration } from '../utils/DecodeTimes';
import ConfirmationAlert from '../../utils/ConfirmationAlert';
import './BlockManager.css';

const BlockManager = ({ categorias, createCat, createBlock, showAlert, reset }) => {
  const [openCategories, setOpenCategories] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [block, setBlock] = useState(''); 
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);
  // Estados para el borrado
  const [confirmConfig, setConfirmConfig] = useState({ 
    show: false, 
    message: '', 
    tipo: 'info', 
    id: null, 
    mode: 'cat',    // 'cat' o 'block'
    force: false 
  });

  // Función para cerrar el alert
  const closeConfirm = () => setConfirmConfig({ ...confirmConfig, show: false });

  useEffect(() => {
    let draggable = new Draggable(containerRef.current, {
      itemSelector: '.draggable-block',
      eventData: (eventEl) => {
        return {
          title: eventEl.getAttribute('data-title'),
          duration: eventEl.getAttribute('data-duration'),
          backgroundColor: eventEl.getAttribute('data-color'),
          borderColor: eventEl.getAttribute('data-color'),
          extendedProps: {
            blockId: eventEl.getAttribute('data-id'),
            duracion_ff: eventEl.getAttribute('data-ff')
          }
        };
      }
    });
    return () => draggable.destroy();
  }, [categorias]);

  const toggleCategory = (id) => {
    setOpenCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenEdit = (e, block) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setModalPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX + 30 
    });
    setBlock(block); 
    setShowModal(true);
  };

  const processDelete = async (id, isForce = false) => {
    closeConfirm(); // Cerramos el alert actual
    
    try {
      const url = `${import.meta.env.VITE_API_URL}/programacion/deleteBlockCat/${id}/${isForce ? '?force=true' : ''}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.status === 400 && data.error === 'protected_relation') {
        // Si tronó por protección, disparamos el alert de "Warning" para forzar
        setConfirmConfig({
          show: true,
          message: `${data.message} ¿Deseas borrar TODO el contenido de esta categoría?`,
          tipo: 'warning',
          id: id,
          force: true
        });
      } else if (response.ok) {
        showAlert('success', data.message || 'Eliminado correctamente');
        reset(); // Refresca la lista del catálogo
      }
    } catch (error) {
      showAlert('error', 'Error de conexión con el servidor');
    }
  };

  const handleDeleteBlock = (id) => {
    setConfirmConfig({
      show: true,
      message: `¿Estás seguro de eliminar este bloque del catálogo?`,
      tipo: 'warning',
      id: id,
      mode: 'block',
      force: false
    });
  };

  const processDeleteBlock = async (id) => {
    closeConfirm();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/programacion/deleteBlock/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        }
      });

      if (response.ok) {
        showAlert('success', 'Bloque eliminado correctamente');
        reset(); // Refresca el catálogo
      } else {
        showAlert('error', 'No se pudo eliminar el bloque');
      }
    } catch (error) {
      showAlert('error', 'Error de conexión');
    }
  };

  return (
    <div className="block-manager" ref={containerRef}>
      <div className="manager-header">
        <h3>Catálogo de Bloques</h3>
        <div className="search-container">
          <input type="text" placeholder="Buscar bloque..." className="search-bar" />
          <button className="add-button" onClick={(e) => createCat(e)} title="Nueva Categoría">
            <span>+</span>
          </button>
        </div>
      </div>

      <div className="categories-tree">
        {categorias.map(cat => (
          <div key={`cat-${cat.id}`} className="category-group">
            <div className="category-item-container">
              <div className="category-main-click" onClick={() => toggleCategory(cat.id)}>
                <span className="folder-icon">
                  {openCategories[cat.id] ? <FaFolderOpen /> : <FaFolder />}
                </span>
                <span className="category-name">{cat.nombre}</span>
              </div>
              
              {/* Grupo de indicadores y botón a la derecha */}
              <div className="category-actions">
                <div 
                  className="color-square" 
                  style={{ backgroundColor: cat.color }}
                  title={`Color: ${cat.color}`}
                ></div>
                {/* Agregar bloque */}
                <button 
                  className="add-block-btn" 
                  onClick={(e) => {
                    e.stopPropagation(); // Evita que se cierre la carpeta
                    createBlock(cat.id, cat.nombre); 
                  }}
                  title="Agregar bloque a esta categoría"
                >
                  <FaPlus size={10} />
                </button>
                
                {/* Editar bloque */}
                <button 
                  className="add-block-btn" 
                  onClick={(e) => handleOpenEdit(e, cat)} // 'item' es el objeto del bloque actual
                  title="Editar esta categoría"
                >
                  <FaPencilAlt size={10} />
                </button>
                
                {/* Borrar bloque */}
                <button 
                  className="add-block-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmConfig({
                      show: true,
                      message: `¿Estás seguro de eliminar la categoría ${cat.nombre}?`,
                      tipo: 'info',
                      id: cat.id,
                      force: false
                    });
                  }}
                >
                  <FaTrashAlt size={10} />
                </button>
              </div>
            </div>

            {openCategories[cat.id] && cat.bloques && (
              <div className="flex flex-col gap-1 mt-1 ml-4 border-l-2 border-gray-100 pl-2">
                {cat.bloques?.map((bloque, bIndex) => {
                  const durationStr = framesToFullCalendarDuration(bloque.duracion_teorica);
                  return (
                    <div
                      key={`block-${cat.id}-${bloque.id || bIndex}`}
                      className="draggable-block group flex items-center justify-between p-2 rounded-xl bg-white border border-gray-50 hover:border-blue-200 hover:shadow-sm transition-all cursor-grab active:cursor-grabbing"
                      data-id={bloque.id}
                      data-title={bloque.nombre}
                      data-duration={durationStr}
                      data-color={cat.color}
                      data-ff={bloque.duracion_teorica}
                    >
                      {/* Lado Izquierdo: Handle e Info */}
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-gray-300 text-xs shrink-0">⠿</span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-bold text-gray-700 truncate tracking-tight">
                            {bloque.nombre}
                          </span>
                          <span className="text-[9px] font-black text-blue-500/70 tabular-nums">
                            {durationStr}
                          </span>
                        </div>
                      </div>

                      {/* Lado Derecho: Acciones (Solo visibles en hover del padre) */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                          className="p-1.5 rounded-lg !text-gray-400 hover:!text-blue-600 hover:!bg-blue-50 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditBlock(e, bloque);
                          }}
                          title="Editar Bloque"
                        >
                          <FaPencilAlt size={10} />
                        </button>
                        
                        <button 
                          className="p-1.5 rounded-lg !text-gray-400 hover:!text-red-600 hover:!bg-red-50 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBlock(bloque.id);
                          }}
                          title="Eliminar Bloque"
                        >
                          <FaTrashAlt size={10} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      {confirmConfig.show && (
        <ConfirmationAlert 
          message={confirmConfig.message}
          tipo={confirmConfig.tipo}
          onCancel={closeConfirm}
          onConfirm={() => {
            if (confirmConfig.mode === 'block') {
              processDeleteBlock(confirmConfig.id);
            } else {
              processDelete(confirmConfig.id, confirmConfig.force);
            }
          }}
        />
      )}
      <EditCatModal
        isVisible={showModal}
        onFinish={showAlert}
        onClose={()=>setShowModal(false)}
        blockData={block}
        position={modalPosition}
        refresh={reset}
      />
    </div>
  );
};

export default BlockManager;

