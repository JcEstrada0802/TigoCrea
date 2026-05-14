import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FilmIcon,
  PencilIcon,
  ListBulletIcon,
  DocumentTextIcon,
  ClockIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

function CreateProdModal({ isOpen, onClose, onFinish, selectedCont, config }) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // Estados estrictamente basados en el modelo Produccion
  const [titulo, setTitulo] = useState('');
  const [contenidoId, setContenidoId] = useState('');
  const [duracion, setDuracion] = useState('00:00:00'); // Formato DurationField
  const [origen, setOrigen] = useState('');
  const [tipo, setTipo] = useState('');
  const [ordenPauta, setOrdenPauta] = useState('');
  const [contenidosList, setContenidosList] = useState([]);

  useEffect(() => {
    const prepareModal = async () => {
      if (!isOpen) return;

      try {
        const contResponse = await axios.post(apiUrl + "/catalogo/getContenidos/", 
          { categorias: [0] },
          { headers: { Authorization: `Token ${token}` } }
        );
        setContenidosList(contResponse.data);
        if (config.mode === "edit") {
          const response = await axios.post(apiUrl + "/catalogo/getProduccion/", 
            { producciones: config.id },
            { headers: { Authorization: `Token ${token}` } }
          );
          
          const prod = response.data[0];
          if (prod) {
            setTitulo(prod.titulo);
            setContenidoId(prod.contenido_id); 
            setOrigen(prod.origen);
            setDuracion(prod.duracion_total);
            setTipo(prod.tipo);
            setOrdenPauta(prod.orden_pauta || '');
          }
        } else {
          // Reset para creación
          setTitulo('');
          setContenidoId(selectedCont || '');
          setDuracion('00:00:00:00');
          setOrigen('');
          setTipo('');
          setOrdenPauta('');
        }
      } catch (error) {
        console.error("Error al preparar el modal:", error);
      }
    };

    prepareModal();
  }, [isOpen, config.id, config.mode, apiUrl, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Definimos si es actualización o creación
    const isUpdating = config.mode === "edit";
    const url = isUpdating 
      ? apiUrl + "/catalogo/updateProduccion/" 
      : apiUrl + "/catalogo/createProduccion/";

    try {
      const payload = {
        titulo: titulo,
        contenido_id: contenidoId, // ID de la Foreign Key
        duracion_total: duracion,  // String "HH:MM:SS"
        orden_pauta: ordenPauta,
        origen: origen,
        tipo: tipo
      };

      if (isUpdating) {
        payload.id = config.id[0];
      }

      await axios.post(url, payload, {
        headers: { Authorization: `Token ${token}` }
      });

      onClose();
      onFinish('success', isUpdating ? 'Producción actualizada con éxito' : 'Producción creada con éxito', 'producciones');

    } catch (error) {
      const mensajeError = error.response?.data?.error || 'Error al procesar la producción';
      
      console.error("Error en submit:", error);
      onFinish('error', mensajeError, 'producciones');
    }
  };

  const handleDuracionChange = (e) => {
    let input = e.target.value.replace(/\D/g, '').substring(0, 8);
    let formatted = "";
    if (input.length > 0) {
        // Horas
        formatted += input.substring(0, 2);
        if (input.length > 2) {
          // Minutos
          formatted += ":" + input.substring(2, 4);
          if (input.length > 4) {
              // Segundos
              formatted += ":" + input.substring(4, 6);
              if (input.length > 6) {
                  // Cuadros (Frames) - Usamos ":" o "." según prefieras
                  formatted += ":" + input.substring(6, 8);
              }
          }
        }
      }

      setDuracion(formatted);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <StyledWrapper>
          <form className="form" onSubmit={handleSubmit}>
            <p className="title">
              <FilmIcon className="icon" />
              Nueva Producción
            </p>
            
            <div className="form-grid">
              {/* Título */}
              <label className="full-width">
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

              {/* Contenido (Foreign Key) */}
              <label>
                <DocumentTextIcon className="input-icon" />
                <select 
                  className="input" 
                  value={contenidoId} 
                  onChange={(e) => setContenidoId(e.target.value)}
                  required
                >
                  <option value="" disabled hidden></option>
                  {contenidosList.map((cont) => (
                    <option key={cont.id} value={cont.id}>{cont.nombre}</option>
                  ))}
                </select>
                <span>Contenido*</span>
              </label>

              {/* Origen */}
              <label>
                <CircleStackIcon className="input-icon" />
                <select 
                  className="input" 
                  value={origen} 
                  onChange={(e) => setOrigen(e.target.value)}
                  required
                >
                  <option value="" disabled hidden></option>
                  <option value="Live-1">Live-1</option>
                  <option value="Live-2">Live-2</option>
                  <option value="Servidor">Servidor</option>
                </select>
                <span>Origen*</span>
              </label>

              {/* Tipo (Mapea a type) */}
              <label>
                <CircleStackIcon className="input-icon" />
                <select 
                  className="input" 
                  value={tipo} 
                  onChange={(e) => setTipo(e.target.value)}
                  required
                >
                  <option value="" disabled hidden></option>
                  <option value="PROGRAMA">PROGRAMA</option>
                  <option value="DEPORTE">DEPORTE</option>
                  <option value="ID">ID</option>
                  <option value="BUMPER">BUMPER</option>
                  <option value="PUBLICIDAD">PUBLICIDAD</option>
                  <option value="LIVE EVENT">LIVE EVENT</option>
                </select>
                <span>Tipo</span>
              </label>

              {/* Orden de Pauta */}
              <label>
                <ListBulletIcon className="input-icon" />
                <input
                  className="input"
                  type="text"
                  value={ordenPauta}
                  onChange={(e) => setOrdenPauta(e.target.value)}
                />
                <span>Orden Pauta</span>
              </label>

              {/* Duración (Mapea a DurationField) */}
              <label className="full-width">
                <ClockIcon className="input-icon" />
                <input
                  className="input"
                  type="text"
                  required
                  value={duracion}
                  onChange={handleDuracionChange}
                />
                <span>Duración Total (HH:MM:SS:FF)*</span>
              </label>
            </div>

            <div className="button-group">
              <button type="button" className="cancel" onClick={onClose}>
                CANCELAR
              </button>
              <button type="submit" className="submit">
                {config.mode=="create"? "GUARDAR": "ACTUALIZAR"}
              </button>
            </div>
          </form>
        </StyledWrapper>
      </ModalContent>
    </ModalOverlay>
  );
}

const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center; z-index: 999;
`;
const ModalContent = styled.div`
  background: #fff; border-radius: 10px; box-shadow: 0 10px 15px rgba(0,0,0,0.1);
`;
const StyledWrapper = styled.div`
  .form { display: flex; flex-direction: column; gap: 20px; width: 90vw; max-width: 600px; padding: 24px; background: #fff; border-radius: 20px; }
  .title { font-size: 24px; font-weight: 600; display: flex; align-items: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; }
  .title .icon { width: 28px; height: 28px; color: #2563eb; margin-right: 12px; }
  .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px 20px; }
  .form-grid .full-width { grid-column: 1 / -1; }
  .form label { position: relative; }
  .form .input-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; color: #9ca3af; z-index: 1; }
  .form label .input { background: #f9fafb; width: 100%; padding: 20px 10px 5px 40px; border: 1px solid #d1d5db; border-radius: 8px; outline: none; font-size: medium; }
  .form label .input:focus { border-color: #2563eb; }
  .form label span { position: absolute; left: 40px; top: 12.5px; color: #6b7281; transition: 0.3s; pointer-events: none; }
  .form label .input:focus + span, .form label .input:valid + span { top: -8px; font-size: 0.75em; background: #fff; left: 38px; color: #2563eb; font-weight: 500; }
  .button-group { display: flex; gap: 15px; justify-content: flex-end; border-top: 1px solid #e5e7eb; padding-top: 15px; }
  .submit { background: #2563eb; color: white; padding: 10px 16px; border-radius: 8px; cursor: pointer; border: none; }
  .cancel { background: white; border: 1px solid #d1d5db; padding: 10px 16px; border-radius: 8px; cursor: pointer; color: #374151; }
`;

export default CreateProdModal;