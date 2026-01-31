import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  RectangleStackIcon,
  IdentificationIcon,
  LinkIcon,
  ClockIcon,
  ArrowRightCircleIcon,
  ArrowLeftCircleIcon,
  FilmIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

function CreateSegModal({ isOpen, onClose, onFinish, selectedProd, config }) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // Estados basados en el modelo Segmento
  const [titulo, setTitulo] = useState('');
  const [idMedia, setIdMedia] = useState('');
  const [duracion, setDuracion] = useState('00:00:00:00');
  const [tcIn, setTcIn] = useState('00:00:00:00');
  const [tcOut, setTcOut] = useState('00:00:00:00');
  const [notas, setNotas] = useState('');
  
  // Estado para la lista de producciones y selección
  const [produccionesList, setProduccionesList] = useState([]);
  const [selectedProduccionId, setSelectedProduccionId] = useState('');


  useEffect(() => {
  const prepareModal = async () => {
    if (!isOpen) return;

    try {
      // 1. CARGAR LISTA DE PRODUCCIONES PRIMERO
      // Esto asegura que el select tenga opciones antes de setear el ID
      const resProd = await axios.post(apiUrl + "/catalogo/getProducciones/", {
        contenidos: [0]
      }, {
        headers: { Authorization: `Token ${token}` }
      });
      setProduccionesList(resProd.data);

      // 2. LOGICA SEGÚN MODO
      if (config.mode === "create") {
        setTitulo('');
        setIdMedia('');
        setDuracion('00:00:00:00');
        setTcIn('00:00:00:00');
        setTcOut('00:00:00:00');
        setNotas('');
        setSelectedProduccionId(selectedProd || '');
      } 
      else if (config.mode === "edit") {
        const response = await axios.post(apiUrl + "/catalogo/getSegmento/", {
          segmentos: config.id 
        }, {
          headers: { Authorization: `Token ${token}` }
        });

        const seg = response.data[0];
        if (seg) {
          setTitulo(seg.titulo);
          setIdMedia(seg.id_media);
          setSelectedProduccionId(seg.produccion_id);
          setNotas(seg.notas);
          setDuracion(seg.duracion);
          setTcIn(seg.tc_in);
          setTcOut(seg.tc_out);
        }
      }
    } catch (error) {
      console.error("Error al preparar el modal de segmentos:", error);
    }
  };

  prepareModal();
}, [isOpen, config.id, config.mode, selectedProd, apiUrl, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isUpdating = config.mode === "edit";
    const url = isUpdating 
      ? apiUrl + "/catalogo/updateSegmento/" 
      : apiUrl + "/catalogo/createSegmento/";

    try {
      const payload = {
        titulo: titulo,
        id_media: idMedia,
        duracion: duracion, // "HH:MM:SS"
        tc_in: tcIn,       // "HH:MM:SS"
        tc_out: tcOut,     // "HH:MM:SS"
        produccion_id: selectedProduccionId,
        notas: notas || ''
      };

      if (isUpdating) {
        payload.id = config.id[0];
      }

      await axios.post(url, payload, {
        headers: { Authorization: `Token ${token}` }
      });

      onClose();
      onFinish('success', isUpdating ? 'Segmento actualizado' : 'Segmento creado', 'segmentos');
      
    } catch (error) {
      const mensajeError = error.response?.data?.error || 'Error al guardar el segmento';
      console.error(error);
      onFinish('error', mensajeError, 'segmentos');
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <StyledWrapper>
          <form className="form" onSubmit={handleSubmit}>
            <p className="title">
              <RectangleStackIcon className="icon" />
              Nuevo Segmento
            </p>
            
            <div className="form-grid">
              {/* Titulo */}
              <label className="full-width">
                <IdentificationIcon className="input-icon" />
                <input
                  className="input"
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
                <span>Titulo*</span>
              </label>

              {/* Producción (Relación) */}
              <label className="full-width">
                <FilmIcon className="input-icon" />
                <select 
                  className="input"
                  required
                  value={selectedProduccionId}
                  onChange={(e) => setSelectedProduccionId(e.target.value)}
                  disabled={!!selectedProd?.id}
                >
                  <option value="" disabled hidden></option>
                  {produccionesList.map((prod) => (
                    <option key={prod.id} value={prod.id}>{prod.label || prod.titulo}</option>
                  ))}
                </select>
                <span>Producción*</span>
              </label>

              {/* ID Media */}
              <label className="full-width">
                <LinkIcon className="input-icon" />
                <input
                  className="input"
                  type="text"
                  required
                  value={idMedia}
                  onChange={(e) => setIdMedia(e.target.value)}
                />
                <span>ID Media*</span>
              </label>
              
              {/* TC In */}
              <label>
                <ArrowRightCircleIcon className="input-icon" />
                <input
                  className="input"
                  type="text"
                  required
                  value={tcIn}
                  onChange={(e) => setTcIn(e.target.value)}
                />
                <span>TC In (HH:MM:SS:FF)*</span>
              </label>

              {/* TC Out */}
              <label>
                <ArrowLeftCircleIcon className="input-icon" />
                <input
                  className="input"
                  type="text"
                  required
                  value={tcOut}
                  onChange={(e) => setTcOut(e.target.value)}
                />
                <span>TC Out (HH:MM:SS:FF)*</span>
              </label>

              {/* Duración */}
              <label>
                <ClockIcon className="input-icon" />
                <input
                  className="input"
                  type="text"
                  required
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                />
                <span>Duración*</span>
              </label>

              {/* Notas */}
              <label>
                <PencilSquareIcon className="input-icon" />
                <input
                  className="input"
                  type="text"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                />
                <span>Notas</span>
              </label>
            </div>

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

const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center; z-index: 999;
`;
const ModalContent = styled.div`
  background: #fff; border-radius: 10px; box-shadow: 0 10px 15px rgba(0,0,0,0.1);
`;
const StyledWrapper = styled.div`
  .form { display: flex; flex-direction: column; gap: 20px; width: 90vw; max-width: 600px; padding: 24px; border-radius: 20px; background-color: #fff; }
  .title { font-size: 24px; font-weight: 600; display: flex; align-items: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; }
  .title .icon { width: 28px; height: 28px; color: #2563eb; margin-right: 12px; }
  .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px 20px; }
  .form-grid .full-width { grid-column: 1 / -1; }
  .form label { position: relative; }
  .form .input-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; color: #9ca3af; z-index: 1; }
  .form label .input { background: #f9fafb; width: 100%; padding: 20px 10px 5px 40px; border: 1px solid #d1d5db; border-radius: 8px; outline: none; font-size: medium; }
  .form label .input:disabled { background-color: #f3f4f6; color: #9ca3af; cursor: not-allowed; }
  .form label span { position: absolute; left: 40px; top: 12.5px; color: #6b7281; transition: 0.3s; pointer-events: none; }
  .form label .input:focus + span, .form label .input:valid + span, .form label .input:disabled + span { top: -8px; font-size: 0.75em; background: #fff; left: 38px; color: #2563eb; font-weight: 500; }
  .button-group { display: flex; gap: 15px; justify-content: flex-end; border-top: 1px solid #e5e7eb; padding-top: 15px; }
  .submit { background: #2563eb; color: white; padding: 10px 16px; border-radius: 8px; cursor: pointer; border: none; font-weight: bold; }
  .cancel { background: white; border: 1px solid #d1d5db; padding: 10px 16px; border-radius: 8px; cursor: pointer; color: #374151; font-weight: bold; }
`;

export default CreateSegModal;