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
    catId: null, 
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
          catId: id,
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
                      catId: cat.id,
                      force: false
                    });
                  }}
                >
                  <FaTrashAlt size={10} />
                </button>
              </div>
            </div>

            {openCategories[cat.id] && cat.bloques && (
              <div className="blocks-list">
                {cat.bloques?.map(bloque => {
                  const durationStr = framesToFullCalendarDuration(bloque.duracion_teorica);
                  return (
                    <div
                      key={`block-${cat.id}-${bloque.id || bIndex}`}
                      className="draggable-block"
                      data-id={bloque.id}
                      data-title={bloque.nombre}
                      data-duration={durationStr}
                      data-color={cat.color}
                      data-ff={bloque.duracion_teorica}
                    >
                      <span className="block-drag-handle">⠿</span>
                      <div className="block-info">
                        <span className="block-name">{bloque.nombre}</span>
                        <span className="block-duration">
                          {durationStr}
                        </span>
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
          onConfirm={() => processDelete(confirmConfig.catId, confirmConfig.force)}
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