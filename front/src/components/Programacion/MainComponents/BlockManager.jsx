import React, { useState, useEffect, useRef } from 'react';
import { Draggable } from '@fullcalendar/interaction';
import { FaPlus, FaFolder, FaFolderOpen } from 'react-icons/fa'; // Usando iconos pro
import { framesToFullCalendarDuration } from '../utils/DecodeTimes';
import './BlockManager.css';

const BlockManager = ({ categorias, createCat, createBlock }) => {
  const [openCategories, setOpenCategories] = useState({});
  const containerRef = useRef(null);

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
    </div>
  );
};

export default BlockManager;