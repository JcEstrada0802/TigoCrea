import React, { useState, useEffect } from 'react'; // Importamos useState y useEffect
import styled from 'styled-components';
import { ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, seccion, itemsSeleccionados }) => {
  // 1. Estado para el texto de confirmación
  const [confirmText, setConfirmText] = useState('');

  // Limpiar el input cada vez que el modal se abre/cierra
  useEffect(() => {
    if (!isOpen) setConfirmText('');
  }, [isOpen]);

  if (!isOpen) return null;

  const mapaCascada = {
    categorias: ['Contenidos', 'Producciones', 'Segmentos'],
    contenidos: ['Producciones', 'Segmentos'],
    producciones: ['Segmentos'],
    segmentos: [],
  };

  const hijos = mapaCascada[seccion] || [];

  // 2. Lógica para habilitar el botón
  const isDisabled = confirmText !== 'ELIMINAR';

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <StyledWrapper>
          <div className="form">
            <p className="title danger">
              <ExclamationTriangleIcon className="icon" />
              Confirmar Eliminación
            </p>

            <div className="content-body">
              <p className="description">
                Estás a punto de eliminar {itemsSeleccionados.length} {itemsSeleccionados.length === 1 ? 'item' : 'items'} de <strong>{seccion.toUpperCase()}</strong>.
              </p>

              <div className="items-list">
                <ul>
                  {itemsSeleccionados.map((item) => (
                    <li key={item.id}><span className="bullet"></span>{item.label}</li>
                  ))}
                </ul>
              </div>

              {hijos.length > 0 && (
                <div className="cascade-warning">
                  <h4 className="warning-title">¡Atención! Acción en cascada</h4>
                  <p className="warning-text">
                    Se borrarán los registros asociados en: <strong>{hijos.join(', ')}</strong>.
                  </p>
                </div>
              )}

              {/* 3. Nuevo Input de Seguridad */}
              <div className="security-check">
                <label htmlFor="confirm-input">Escribe <strong>ELIMINAR</strong> para confirmar:</label>
                <input 
                  type="text" 
                  id="confirm-input"
                  placeholder="ELIMINAR" 
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="confirm-input"
                  autoComplete="off"
                />
              </div>

              <p className="footer-note text-center">Esta acción no se puede deshacer.</p>
            </div>

            <div className="button-group">
              <button type="button" className="cancel" onClick={onClose}>
                CANCELAR
              </button>
              <button 
                type="button" 
                className={`submit delete ${isDisabled ? 'disabled' : ''}`} 
                onClick={onConfirm}
                disabled={isDisabled} // 4. Habilitación del botón
              >
                <TrashIcon className="btn-icon" />
                ELIMINAR PERMANENTEMENTE
              </button>
            </div>
          </div>
        </StyledWrapper>
      </ModalContent>
    </ModalOverlay>
  );
};

// --- ESTILOS ACTUALIZADOS ---

const ModalOverlay = styled.div`
  position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center; z-index: 999; backdrop-filter: blur(2px);
`;

const ModalContent = styled.div`
  background: #fff; border-radius: 20px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
`;

const StyledWrapper = styled.div`
  .form { display: flex; flex-direction: column; gap: 15px; width: 90vw; max-width: 500px; padding: 24px; }
  .title { font-size: 20px; font-weight: 600; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; }
  .title.danger .icon { width: 26px; height: 26px; color: #dc2626; margin-right: 10px; }
  .content-body { display: flex; flex-direction: column; gap: 12px; }
  .description { color: #4b5563; font-size: 14px; }
  
  .items-list { 
    background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; 
    max-height: 100px; overflow-y: auto; 
  }
  .items-list li { display: flex; align-items: center; font-size: 13px; color: #374151; }
  .bullet { width: 5px; height: 5px; background-color: #dc2626; border-radius: 50%; margin-right: 8px; }

  .cascade-warning { background-color: #fff7ed; border-left: 4px solid #fb923c; padding: 10px; border-radius: 4px; }
  .warning-title { color: #9a3412; font-size: 13px; font-weight: 700; }
  .warning-text { color: #c2410c; font-size: 12px; }

  /* Estilos del Input de Seguridad */
  .security-check {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 5px;
  }
  .security-check label { font-size: 13px; color: #374151; }
  .confirm-input {
    padding: 10px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    outline: none;
    font-weight: 700;
    text-align: center;
    letter-spacing: 2px;
    transition: 0.3s;
  }
  .confirm-input:focus { border-color: #dc2626; background-color: #fef2f2; }

  .footer-note { font-size: 12px; color: #6b7281; font-style: italic; }

  .button-group { display: flex; gap: 12px; justify-content: flex-end; padding-top: 15px; border-top: 1px solid #e5e7eb; }
  .submit, .cancel { padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }

  .submit.delete { background-color: #dc2626; color: white; border: none; display: flex; align-items: center; }
  .submit.delete:hover { background-color: #b91c1c; }
  
  /* Estado Deshabilitado */
  .submit.delete.disabled {
    background-color: #fca5a5;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .btn-icon { width: 16px; height: 16px; margin-right: 8px; }
  .cancel { background-color: #fff; border: 1px solid #d1d5db; color: #374151; }
`;

export default DeleteConfirmModal;