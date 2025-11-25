import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
// Importamos los iconos nuevos para Segmentos
import {
  RectangleStackIcon, // Para el título
  IdentificationIcon,
  CircleStackIcon, // Para Fuente
  LinkIcon, // Para Media Id
  ClockIcon, // Para Duración
  ArrowRightCircleIcon, // Para TC In
  ArrowLeftCircleIcon, // Para TC Out
  FilmIcon // Para Producción
} from '@heroicons/react/24/outline';
import axios from 'axios';

// 1. Renombramos el componente y añadimos la prop 'produccionSeleccionada'
function CreateSegModal({ isOpen, onClose, onFinish, produccionSeleccionada }) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // 2. Estados para los campos de Segmento
  const [idValue, setIdValue] = useState('');
  const [fuente, setFuente] = useState('');
  const [mediaId, setMediaId] = useState('');
  const [duracion, setDuracion] = useState('');
  const [tcIn, setTcIn] = useState('');
  const [tcOut, setTcOut] = useState('');
  // No necesitamos estado para 'produccion', ya que viene de las props

  // 3. Resetear el formulario cuando se abre
  useEffect(() => {
    if (isOpen) {
      setIdValue('');
      setFuente('');
      setMediaId('');
      setDuracion('');
      setTcIn('');
      setTcOut('');
    }
  }, [isOpen]);

  // 4. handleSubmit actualizado para crear un Segmento
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(apiUrl + "/catalogo/createSegmento/", {
        codigo: idValue,
        fuente: fuente,
        media_id: mediaId,
        duracion: duracion,
        tc_in: tcIn,
        tc_out: tcOut,
        produccion: produccionSeleccionada.id // <-- Se envía el ID de la producción padre
      }, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      onClose();
      onFinish('success', 'Segmento creado con éxito');
    } catch (error) {
      console.log(error);
      onClose();
      onFinish('error', 'Error al crear el segmento');
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <StyledWrapper>
          <form className="form" onSubmit={handleSubmit}>
            <p className="title">
              <RectangleStackIcon className="icon" /> {/* Icono y Título nuevo */}
              Creación de Segmento
            </p>
            
            <div className="form-grid">
              
              {/* --- FILA 1: Id, Fuente, Media Id --- */}
              <label>
                <IdentificationIcon className="input-icon" />
                <input
                  className="input"
                  type="text"
                  required
                  value={idValue}
                  onChange={(e) => setIdValue(e.target.value)}
                />
                <span>Id*</span>
              </label>
              
              <label>
                <CircleStackIcon className="input-icon" />
                <select 
                  className="input" 
                  value={fuente} 
                  onChange={(e) => setFuente(e.target.value)}
                  required
                >
                  <option value="" disabled hidden></option>
                  <option value="MEDIA">MEDIA</option>
                  <option value="LIVE-1">LIVE-1</option>
                  <option value="LIVE-2">LIVE-2</option>
                </select>
                <span>Fuente*</span>
              </label>

              <label>
                <LinkIcon className="input-icon" />
                <input
                  className="input"
                  type="text"
                  required
                  value={mediaId}
                  onChange={(e) => setMediaId(e.target.value)}
                />
                <span>Media Id*</span>
              </label>
              
              {/* --- FILA 2: TC In, TC Out, Duración --- */}
              <label>
                <ArrowRightCircleIcon className="input-icon" />
                <input
                  className="input"
                  type="text"
                  placeholder="00:00:00:00"
                  required
                  value={tcIn}
                  onChange={(e) => setTcIn(e.target.value)}
                />
                <span>TC In*</span>
              </label>

              <label>
                <ArrowLeftCircleIcon className="input-icon" />
                <input
                  className="input"
                  type="text"
                  placeholder="00:00:00:00"
                  required
                  value={tcOut}
                  onChange={(e) => setTcOut(e.target.value)}
                />
                <span>TC Out*</span>
              </label>

              <label>
                <ClockIcon className="input-icon" />
                <input
                  className="input"
                  type="text"
                  placeholder="00:00:00:00"
                  required
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                />
                <span>Duración*</span>
              </label>

              {/* --- FILA 3: Producción (Deshabilitado) --- */}
              <div className="full-width static-label"> {/* Usamos un label estático */}
                <label className="static-floating-label">
                  <FilmIcon className="input-icon-static" />
                  Producción
                </label>
                <input
                  className="input"
                  type="text"
                  // Usamos optional chaining (?) por si la prop viene vacía al inicio
                  value={produccionSeleccionada?.titulo || 'N/A'} 
                  disabled // <-- CAMPO DESHABILITADO
                />
              </div>

            </div>

            {/* --- BOTONES --- */}
            <div className="button-group">
              <button type="button" className="cancel" onClick={onClose}>
                CANCELAR
              </button>
              <button type="submit" className="submit">
                GUARDAR
              </button>
            </div>

          </form>
        </StyledWrapper>
      </ModalContent>
    </ModalOverlay>
  );
}

// --- ESTILOS FORMALES (Light Mode) ---
// (Copiados y adaptados)

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
`;

const StyledWrapper = styled.div`
  .form {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 90vw;
    max-width: 680px; /* Modal grande */
    padding: 24px;
    border-radius: 20px;
    position: relative;
    background-color: #fff;
    color: #1f2937;
  }

  .title {
    font-size: 24px;
    font-weight: 600;
    position: relative;
    display: flex;
    align-items: center;
    color: #111827;
    margin-bottom: 10px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e5e7eb;
  }

  .title .icon {
    width: 28px;
    height: 28px;
    color: #2563eb;
    margin-right: 12px;
  }
  
  /* --- ESTILOS DEL FORMULARIO --- */

  .form-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* 3 columnas */
    gap: 25px 20px;
  }
  
  .form-grid .full-width {
    grid-column: 1 / -1; /* Ocupa todo el ancho */
  }

  .form label {
    position: relative;
  }
  
  .form .input-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: #9ca3af;
    z-index: 1;
  }

  .form label .input {
    background-color: #f9fafb;
    color: #1f2937;
    width: 100%;
    padding: 20px 10px 5px 40px;
    outline: none;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: medium;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  
  /* --- Estilo para inputs deshabilitados --- */
  .form label .input:disabled,
  .form .static-label .input:disabled {
    background-color: #e5e7eb; /* Fondo gris */
    color: #6b7281; /* Texto gris */
    cursor: not-allowed;
  }

  .form label .input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 1px #2563eb;
  }
  
  .form label .input:focus ~ .input-icon {
    color: #2563eb;
  }

  .form label select.input {
    padding-top: 20px;
    padding-bottom: 5px;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23374151' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em;
  }
  
  .form label select.input + .input-icon {
    top: 19px;
    transform: none;
  }

  .form label span {
    color: #6b7281;
    position: absolute;
    left: 40px;
    top: 12.5px;
    font-size: 0.9em;
    transition: 0.3s ease;
    pointer-events: none;
    background-color: #f9fafb;
    padding: 0 2px;
    z-index: 2;
  }

  /* Animación para inputs */
  .form label .input:focus + span,
  .form label .input:valid + span {
    color: #2563eb;
    top: -8px;
    font-size: 0.75em;
    font-weight: 500;
    background-color: #fff;
    left: 38px;
  }
  
  .form label select:focus + span,
  .form label select:valid + span {
    color: #2563eb;
    top: -8px;
    font-size: 0.75em;
    font-weight: 500;
    background-color: #fff;
    left: 38px;
  }

  /* --- Estilos para Label Estático (para el campo deshabilitado) --- */
  .form .static-label {
    display: flex;
    flex-direction: column;
    justify-content: flex-end; 
    position: relative; /* Para el icono */
  }
  
  .form .static-floating-label {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #2563eb;
    font-size: 0.75em;
    font-weight: 500;
    margin-bottom: 4px;
    padding-left: 2px;
    background-color: transparent;
  }
  
  .form .static-floating-label .input-icon-static {
    width: 14px;
    height: 14px;
    color: #2563eb;
  }
  
  .form .static-label .input-icon {
    top: 36px; /* Posición del icono en el input estático */
  }

  /* --- ESTILOS DE BOTONES --- */
  .button-group {
    display: flex;
    gap: 15px;
    margin-top: 20px;
    justify-content: flex-end;
    padding-top: 15px;
    border-top: 1px solid #e5e7eb;
  }

  .submit, .cancel {
    flex: none;
    padding: 10px 16px;
    border: none;
    outline: none;
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    transition: 0.3s ease;
    cursor: pointer;
  }

  .submit {
    background-color: #2563eb;
    border: 1px solid #2563eb;
    color: #fff;
  }

  .submit:hover {
    background-color: #1d4ed8;
    border-color: #1d4ed8;
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

export default CreateSegModal;