import React from 'react';
import styled from 'styled-components';
import { ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, seccion, itemsSeleccionados }) => {
  if (!isOpen) return null;

  const mapaCascada = {
    categorias: ['Contenidos', 'Producciones', 'Segmentos'],
    contenidos: ['Producciones', 'Segmentos'],
    producciones: ['Segmentos'],
    segmentos: [],
  };

  const hijos = mapaCascada[seccion] || [];

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <StyledWrapper>
          <div className="form"> {/* Usamos la clase .form para heredar el layout */}
            <p className="title danger">
              <ExclamationTriangleIcon className="icon" />
              Confirmar Eliminación
            </p>

            <div className="content-body">
              <p className="description">
                Estás a punto de eliminar {itemsSeleccionados.length} {itemsSeleccionados.length === 1 ? 'item' : 'items'} de la sección <strong>{seccion.toUpperCase()}</strong>:
              </p>

              {/* Lista de items con scroll */}
              <div className="items-list">
                <ul>
                  {itemsSeleccionados.map((item) => (
                    <li key={item.id}>
                      <span className="bullet"></span>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Advertencia de Cascada */}
              {hijos.length > 0 && (
                <div className="cascade-warning">
                  <h4 className="warning-title">¡Atención! Acción en cascada</h4>
                  <p className="warning-text">
                    Esto también eliminará permanentemente todos los registros asociados en: 
                    <strong> {hijos.join(', ')}</strong>.
                  </p>
                </div>
              )}

              <p className="footer-note">¿Estás seguro? Esta acción no se puede deshacer.</p>
            </div>

            <div className="button-group">
              <button type="button" className="cancel" onClick={onClose}>
                CANCELAR
              </button>
              <button type="button" className="submit delete" onClick={onConfirm}>
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

// --- ESTILOS (Sincronizados con CreateCatModal) ---

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5); /* Sombreado igual al de categorías */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  backdrop-filter: blur(2px); /* Opcional: un toque de desenfoque suave */
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
`;

const StyledWrapper = styled.div`
  .form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 90vw;
    max-width: 500px;
    padding: 24px;
    background-color: #fff;
    border-radius: 20px;
  }

  .title {
    font-size: 22px;
    font-weight: 600;
    display: flex;
    align-items: center;
    color: #111827;
    padding-bottom: 15px;
    border-bottom: 1px solid #e5e7eb;
  }

  .title.danger .icon {
    width: 28px;
    height: 28px;
    color: #dc2626; /* Rojo para advertencia */
    margin-right: 12px;
  }

  .content-body {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .description {
    color: #4b5563;
    font-size: 15px;
  }

  .items-list {
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px;
    max-height: 120px;
    overflow-y: auto;
  }

  .items-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .items-list li {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #374151;
    margin-bottom: 4px;
  }

  .bullet {
    width: 6px;
    height: 6px;
    background-color: #dc2626;
    border-radius: 50%;
    margin-right: 10px;
  }

  .cascade-warning {
    background-color: #fff7ed;
    border-left: 4px solid #fb923c;
    padding: 12px;
    border-radius: 4px;
  }

  .warning-title {
    color: #9a3412;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .warning-text {
    color: #c2410c;
    font-size: 13px;
  }

  .footer-note {
    font-size: 13px;
    color: #6b7281;
    font-style: italic;
  }

  .button-group {
    display: flex;
    gap: 12px;
    margin-top: 10px;
    justify-content: flex-end;
    padding-top: 15px;
    border-top: 1px solid #e5e7eb;
  }

  .submit, .cancel {
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s;
  }

  .submit.delete {
    background-color: #dc2626;
    color: white;
    border: none;
    display: flex;
    align-items: center;
  }

  .submit.delete:hover {
    background-color: #b91c1c;
  }

  .btn-icon {
    width: 18px;
    height: 18px;
    margin-right: 8px;
  }

  .cancel {
    background-color: #fff;
    border: 1px solid #d1d5db;
    color: #374151;
  }

  .cancel:hover {
    background-color: #f3f4f6;
  }
`;

export default DeleteConfirmModal;