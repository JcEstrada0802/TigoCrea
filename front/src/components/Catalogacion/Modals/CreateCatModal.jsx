import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TagIcon, IdentificationIcon, Bars3BottomLeftIcon } from '@heroicons/react/24/outline';
import { SwatchIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

function CreateCatModal({ isOpen, onClose, onFinish }) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [nombre, setNombre] = useState('');
  const [idValue, setIdValue] = useState('');
  const [color, setColor] = useState('#2563EB'); 
  const [tipo, setTipo] = useState('');

  // Resetear el formulario cuando se abre
  useEffect(() => {
    if (isOpen) {
      setNombre('');
      setIdValue('');
      setColor('#2563EB');
      setTipo('');
    }
    
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(apiUrl + "/catalogo/createCategoria/", {
        nombre: nombre,
        codigo: idValue,
        color: color,
        tipo: tipo
      }, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      onClose();
      onFinish('success', 'Creación exitosa')
    } catch (error) {
      console.log(error);
      onClose();
      onFinish('error', 'Error al Crear la categoría');
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <StyledWrapper>
          <form className="form" onSubmit={handleSubmit}>
            <p className="title">
              <TagIcon className="icon" /> {/* Icono en el título */}
              Categoría de Contenido
            </p>
            
            <div className="form-grid">
              
              {/* --- FILA 1: NOMBRE, ID, COLOR (3 columnas) --- */}
              <label>
                <TagIcon className="input-icon" /> {/* Icono en el input */}
                <input
                  className="input"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
                <span>Nombre Categoría*</span>
              </label>

              <label>
                <IdentificationIcon className="input-icon" /> {/* Icono en el input */}
                <input
                  className="input"
                  type="text"
                  required
                  value={idValue}
                  onChange={(e) => setIdValue(e.target.value)}
                />
                <span>Id*</span>
              </label>
              
              {/* El input de color se alinea en la misma fila */}
              <label className="color-label">
                <SwatchIcon className="input-icon" /> {/* Icono en el input */}
                <input
                  type="color"
                  className="color-input"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </label>

              {/* --- FILA 2: TIPO (1 columna) --- */}
              <label className="full-width"> {/* Ocupa todo el ancho */}
                <Bars3BottomLeftIcon className="input-icon" /> {/* Icono en el input */}
                <select 
                  className="input" 
                  value={tipo} 
                  onChange={(e) => setTipo(e.target.value)}
                  required
                >
                  <option value="" disabled hidden></option>
                  <option value="Publicidad">Publicidad</option>
                  <option value="Programas">Programas</option>
                  <option value="Relleno">Relleno</option>
                </select>
                <span>Tipo de Categoría*</span>
              </label>
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
    max-width: 680px; /* MODAL MÁS GRANDE */
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
    padding-bottom: 15px; /* Más espacio abajo */
    border-bottom: 1px solid #e5e7eb; /* Línea divisoria */
  }

  .title .icon {
    width: 28px; /* Tamaño del icono del título */
    height: 28px;
    color: #2563eb; /* Color del icono del título */
    margin-right: 12px;
  }
  
  /* --- INICIO DE ESTILOS DEL FORMULARIO --- */

  .form-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* 3 columnas */
    gap: 25px 20px;
  }
  
  .form-grid .full-width {
    grid-column: 1 / -1; /* Este elemento ocupa todo el ancho */
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
    color: #9ca3af; /* Color gris */
    z-index: 1; /* Para que esté sobre el input */
  }

  .form label .input {
    background-color: #f9fafb; /* Fondo ligeramente gris para inputs */
    color: #1f2937;
    width: 100%;
    padding: 20px 10px 5px 40px; /* PADDING EXTRA PARA EL ICONO */
    outline: none;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: medium;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  
  .form label .input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 1px #2563eb;
  }
  
  .form label .input:focus + .input-icon,
  .form label .input:valid + .input-icon {
    color: #2563eb; /* Icono se vuelve azul al hacer foco */
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
  
  .form label select.input + .input-icon { /* Posicionamiento del icono para el select */
    top: 19px; /* Ajuste manual para el select */
    transform: none;
  }

  .form label span {
    color: #6b7281;
    position: absolute;
    left: 40px; /* Ajuste para el icono */
    top: 12.5px;
    font-size: 0.9em;
    transition: 0.3s ease;
    pointer-events: none;
    background-color: #f9fafb; /* Color de fondo de input */
    padding: 0 2px;
    z-index: 2; /* Para que esté sobre el icono y el input */
  }

  /* Animación para inputs */
  .form label .input:focus + span,
  .form label .input:valid + span {
    color: #2563eb;
    top: -8px;
    font-size: 0.75em;
    font-weight: 500;
    background-color: #fff; /* Asegura el fondo blanco al subir el label */
    left: 38px; /* Ajuste fino al subir */
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

  /* Estilos para el input de Color */
  .form label.color-label {
    position: relative; /* Aseguramos que sea relative para el span */
    display: flex;
    flex-direction: column;
    justify-content: flex-end; /* Para alinear el input con los otros */
  }
  
  .form label.color-label .input-icon {
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
  }

  .form .color-input {
    width: 100%;
    height: 48px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    cursor: pointer;
    background-color: #f9fafb;
    padding: 2px;
  }
  
  .form label.color-label .color-label-span {
    /* Este span es el label flotante para el color input */
    position: absolute;
    left: 40px;
    top: 12.5px;
    font-size: 0.9em;
    color: #6b7281;
    transition: 0.3s ease;
    pointer-events: none;
    background-color: #f9fafb;
    padding: 0 2px;
    z-index: 2;
  }

  /* El input de color no tiene :valid, así que solo reacciona al foco */
  .form .color-input:focus + .color-label-span {
    color: #2563eb;
    top: -8px;
    font-size: 0.75em;
    font-weight: 500;
    background-color: #fff;
    left: 38px;
  }

  /* --- FIN DE ESTILOS DE FORMULARIO --- */

  /* --- INICIO DE ESTILOS DE BOTONES --- */
  .button-group {
    display: flex;
    gap: 15px;
    margin-top: 20px; /* Más espacio */
    justify-content: flex-end;
    padding-top: 15px; /* Espacio antes de los botones */
    border-top: 1px solid #e5e7eb; /* Línea divisoria */
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
    background-color: #f3f4f6; /* Un gris más notorio */
  }
  /* --- FIN DE ESTILOS DE BOTONES --- */
`;

export default CreateCatModal;