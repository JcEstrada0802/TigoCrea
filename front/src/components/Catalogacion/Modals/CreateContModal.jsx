import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  DocumentTextIcon,
  TagIcon, 
  IdentificationIcon, 
  Bars3BottomLeftIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

function CreateContModal({ isOpen, onClose, onFinish }) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [nombre, setNombre] = useState('');
  const [idValue, setIdValue] = useState('');
  const [categoria, setCategoria] = useState(''); 
  const [origen, setOrigen] = useState(''); 
  const [categoriasList, setCategoriasList] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setNombre('');
      setIdValue('');
      setCategoria('');
      setOrigen('');

      const fetchCategorias = async () => {
        try {
          const response = await axios.get(apiUrl + "/catalogo/getCategorias/", {
            headers: { Authorization: `Token ${token}` }
          });
          setCategoriasList(response.data);
        } catch (error) {
          console.error("Error al cargar categorías", error);
          setCategoriasList([]);
        }
      };

      fetchCategorias();
    }
  }, [isOpen, apiUrl, token]); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Enviamos al endpoint de crear Contenido
      const response = await axios.post(apiUrl + "/catalogo/createContenido/", {
        nombre: nombre,
        id_cont: idValue, // Asumiendo que Id* es el 'codigo'
        categoria: categoria, // Este es el ID de la categoría seleccionada
        origen: origen
      }, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      onClose();
      // Nuevos mensajes de éxito/error
      onFinish('success', 'Contenido creado con éxito');
    } catch (error) {
      console.log(error);
      onClose();
      onFinish('error', 'Error al crear el contenido');
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <StyledWrapper>
          <form className="form" onSubmit={handleSubmit}>
            <p className="title">
              {/* 5. Título e icono actualizados */}
              <DocumentTextIcon className="icon" />
              Crea Contenido
            </p>
            
            <div className="form-grid">
              
              {/* --- FILA 1: NOMBRE, CATEGORÍA, ID (3 columnas) --- */}
              
              {/* Campo Nombre */}
              <label>
                <TagIcon className="input-icon" />
                <input
                  className="input"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
                <span>Nombre*</span>
              </label>

              {/* Campo Categoría (Dropdown) */}
              <label>
                <Bars3BottomLeftIcon className="input-icon" />
                <select 
                  className="input" 
                  value={categoria} 
                  onChange={(e) => setCategoria(e.target.value)}
                  required
                >
                  <option value="" disabled hidden></option>
                  {/* Mapeamos la lista de categorías cargada */}
                  {categoriasList.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
                <span>Categoría*</span>
              </label>
              
              {/* Campo Id */}
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

              {/* --- FILA 2: ORIGEN (1 columna) --- */}
              <label className="full-width">
                <CircleStackIcon className="input-icon" />
                <select 
                  className="input" 
                  value={origen} 
                  onChange={(e) => setOrigen(e.target.value)}
                  required
                >
                  <option value="" disabled hidden></option>
                  <option value="LIVE-1">LIVE-1</option>
                  <option value="LIVE-2">LIVE-2</option>
                  <option value="SERVIDOR">SERVIDOR</option>
                </select>
                <span>Origen</span> {/* Lo pongo sin * asumiendo que es opcional como en la imagen */}
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
// 6. Copiados de CreateCatModal, pero eliminando los estilos
//    que ya no se usan (como .color-label)

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

  /* 7. Eliminamos todos los estilos de .color-label, .color-input, etc. */
  /*    ya que no se usan en este modal.                             */

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

export default CreateContModal;