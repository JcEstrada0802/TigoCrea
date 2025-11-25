import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  // Iconos para el nuevo modal
  FilmIcon, // Para el título
  PencilIcon, // Para Título
  LinkIcon, // Para Media Id
  DocumentTextIcon, // Para Contenido Id
  ClockIcon, // Para Duración
  CircleStackIcon, // Para Origen
  SparklesIcon, // Para Evento
  CalendarDaysIcon, // Para Expiración
  HashtagIcon // Para Episodio
} from '@heroicons/react/24/outline';
import axios from 'axios';

function CreateProdModal({ isOpen, onClose, onFinish }) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // --- Estados para los campos de Producción ---
  const [titulo, setTitulo] = useState('');
  const [mediaId, setMediaId] = useState('');
  const [contenidoId, setContenidoId] = useState('');
  const [duracion, setDuracion] = useState('');
  const [origen, setOrigen] = useState('');
  const [evento, setEvento] = useState('');
  const [expiracion, setExpiracion] = useState('');
  const [episodio, setEpisodio] = useState('');

  // --- Estados para cargar los dropdowns ---
  const [contenidosList, setContenidosList] = useState([]);
  const [eventosList, setEventosList] = useState([]); // Asumiendo que 'Evento' es un dropdown

  // --- Resetear y Cargar Datos ---
  useEffect(() => {
    if (isOpen) {
      // 1. Resetea todos los campos
      setTitulo('');
      setMediaId('');
      setContenidoId('');
      setDuracion('');
      setOrigen('');
      setEvento('');
      setExpiracion('');
      setEpisodio('');

      // 2. Carga los datos para los dropdowns
      const fetchData = async () => {
        try {
          // Cargar Contenidos (como en CreateContModal)
          const contResponse = await axios.get(apiUrl + "/catalogo/getContenidos/", { // Asumiendo este endpoint
            headers: { Authorization: `Token ${token}` }
          });
          setContenidosList(contResponse.data);

          // Cargar Eventos (asumiendo un endpoint similar)
          const evtResponse = await axios.get(apiUrl + "/catalogo/getEventos/", { // Asumiendo este endpoint
            headers: { Authorization: `Token ${token}` }
          });
          setEventosList(evtResponse.data);

        } catch (error) {
          console.error("Error al cargar datos para el modal", error);
        }
      };

      fetchData();
    }
  }, [isOpen, apiUrl, token]);

  // --- Enviar Formulario ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(apiUrl + "/catalogo/createProduccion/", {
        titulo: titulo,
        media_id: mediaId, // Django prefiere snake_case
        contenido: contenidoId,
        duracion: duracion, // Asegúrate que tu backend pueda parsear esto (e.g., "00:56:58:18")
        origen: origen,
        evento: evento,
        expiracion: expiracion,
        episodio: episodio
      }, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      onClose();
      onFinish('success', 'Producción creada con éxito');
    } catch (error) {
      console.log(error);
      onClose();
      onFinish('error', 'Error al crear la producción');
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <StyledWrapper>
          <form className="form" onSubmit={handleSubmit}>
            <p className="title">
              <FilmIcon className="icon" />
              Creación de Producción
            </p>
            
            {/* Grid de 3 columnas */}
            <div className="form-grid">
              
              {/* --- FILA 1 --- */}
              <label>
                <PencilIcon className="input-icon" />
                <input
                  className="input"
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
                <span>Título*</span>
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
                <span>Media Id * (uri)</span>
              </label>

              <label>
                <DocumentTextIcon className="input-icon" />
                <select 
                  className="input" 
                  value={contenidoId} 
                  onChange={(e) => setContenidoId(e.target.value)}
                  required
                >
                  <option value="" disabled hidden></option>
                  {/* Mapeamos la lista de contenidos */}
                  {contenidosList.map((cont) => (
                    <option key={cont.id} value={cont.id}>{cont.nombre} ({cont.codigo})</option> // Asumiendo que 'codigo' es el ID
                  ))}
                </select>
                <span>Contenido Id*</span>
              </label>
              
              {/* --- FILA 2 --- */}
              <label>
                <ClockIcon className="input-icon" />
                <input
                  className="input"
                  type="text"
                  placeholder="00:00:00:00" // Placeholder para formato
                  required
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                />
                <span>Duración*</span>
              </label>

              <label>
                <CircleStackIcon className="input-icon" />
                <select 
                  className="input" 
                  value={origen} 
                  onChange={(e) => setOrigen(e.target.value)}
                  required
                >
                  <option value="" disabled hidden></option>
                  <option value="MEDIA">MEDIA</option>
                  <option value="LIVE-1">LIVE-1</option>
                  <option value="LIVE-2">LIVE-2</option>
                </select>
                <span>Origen</span>
              </label>

              <label>
                <SparklesIcon className="input-icon" />
                <select 
                  className="input" 
                  value={evento} 
                  onChange={(e) => setEvento(e.target.value)}
                  required
                >
                  <option value="" disabled hidden></option>
                  {/* Mapeamos la lista de eventos */}
                  {eventosList.map((evt) => (
                    <option key={evt.id} value={evt.id}>{evt.nombre}</option>
                  ))}
                </select>
                <span>Evento</span>
              </label>

              {/* --- FILA 3 --- */}
              {/* Input de Fecha (con label estático) */}
              <div className="date-label-static">
                <label className="static-floating-label">
                  <CalendarDaysIcon className="input-icon-static" />
                  Expiración
                </label>
                <input
                  type="date"
                  className="date-input"
                  value={expiracion}
                  onChange={(e) => setExpiracion(e.target.value)}
                />
              </div>

              {/* Input de Número (Episodio) */}
              <label>
                <HashtagIcon className="input-icon" />
                <input
                  className="input"
                  type="number"
                  min="0"
                  required
                  value={episodio}
                  onChange={(e) => setEpisodio(e.target.value)}
                />
                <span>Episodio*</span>
              </label>
              
              {/* Columna vacía (para mantener el grid) */}
              <div></div>

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
// (Copiados de CreateCatModal y CreateContModal)

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
  
  /* Ocultar spinners en inputs de tipo 'number' */
  .form label .input[type="number"]::-webkit-inner-spin-button,
  .form label .input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .form label .input[type="number"] {
    -moz-appearance: textfield;
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
  
  /* --- Estilos para el Input de Fecha (Label Estático) --- */
  .form .date-label-static {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
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

  .form .date-input {
    width: 100%;
    height: 48px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    cursor: pointer;
    background-color: #f9fafb;
    padding: 2px 10px; /* Padding para input de fecha */
    font-family: inherit; /* Hereda la fuente */
    font-size: medium; /* Tamaño de fuente consistente */
    color: #1f2937;
  }
  
  .form .date-input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 1px #2563eb;
  }
  /* --- Fin estilos de Fecha --- */

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

export default CreateProdModal;