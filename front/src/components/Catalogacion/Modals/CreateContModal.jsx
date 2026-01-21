import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  DocumentTextIcon,
  TagIcon, 
  IdentificationIcon, 
  Bars3BottomLeftIcon,
  ListBulletIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

function CreateContModal({ isOpen, onClose, onFinish, selectedCat }) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // Estados basados estrictamente en el modelo Contenido
  const [nombre, setNombre] = useState('');
  const [idCont, setIdCont] = useState('');
  const [categoria, setCategoria] = useState(''); 
  const [ordenPauta, setOrdenPauta] = useState('');
  const [notas, setNotas] = useState('');
  const [categoriasList, setCategoriasList] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setNombre('');
      setIdCont('');
      setCategoria(selectedCat || '');
      setOrdenPauta('');
      setNotas('');

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
      await axios.post(apiUrl + "/catalogo/createContenido/", {
        nombre: nombre,
        id_cont: idCont,
        categoria: categoria, // ID de la Foreign Key
        orden_pauta: ordenPauta,
        notas: notas
      }, {
        headers: { Authorization: `Token ${token}` }
      });
      onClose();
      onFinish('success', 'Contenido creado con éxito', 'contenidos');
    } catch (error) {
      console.log(error);
      onFinish('error', 'Error al crear el contenido', 'contenidos');
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <StyledWrapper>
          <form className="form" onSubmit={handleSubmit}>
            <p className="title">
              <DocumentTextIcon className="icon" />
              Nuevo Contenido
            </p>
            
            <div className="form-grid">
              {/* Nombre */}
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

              {/* ID Contenido (id_cont) */}
              <label>
                <IdentificationIcon className="input-icon" />
                <input
                  className="input"
                  type="text"
                  required
                  value={idCont}
                  onChange={(e) => setIdCont(e.target.value)}
                />
                <span>ID Contenido*</span>
              </label>

              {/* Categoría */}
              <label>
                <Bars3BottomLeftIcon className="input-icon" />
                <select 
                  className="input" 
                  value={categoria} 
                  onChange={(e) => setCategoria(e.target.value)}
                  required
                >
                  <option value="" disabled hidden></option>
                  {categoriasList.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
                <span>Categoría*</span>
              </label>

              {/* Orden Pauta */}
              <label className="full-width">
                <ListBulletIcon className="input-icon" />
                <input
                  className="input"
                  type="text"
                  value={ordenPauta}
                  onChange={(e) => setOrdenPauta(e.target.value)}
                />
                <span>Orden Pauta</span>
              </label>

              {/* Notas */}
              <label className="full-width">
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

// Los estilos se mantienen igual a tu configuración original
const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center; z-index: 999;
`;
const ModalContent = styled.div`
  background: #fff; border-radius: 10px;
`;
const StyledWrapper = styled.div`
  .form { display: flex; flex-direction: column; gap: 20px; width: 90vw; max-width: 680px; padding: 24px; background: #fff; border-radius: 20px; }
  .title { font-size: 24px; font-weight: 600; display: flex; align-items: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; }
  .title .icon { width: 28px; height: 28px; color: #2563eb; margin-right: 12px; }
  .form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px 20px; }
  .form-grid .full-width { grid-column: 1 / -1; }
  .form label { position: relative; }
  .form .input-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; color: #9ca3af; }
  .form label .input { background: #f9fafb; width: 100%; padding: 20px 10px 5px 40px; border: 1px solid #d1d5db; border-radius: 8px; outline: none; }
  .form label .input:focus { border-color: #2563eb; }
  .form label span { position: absolute; left: 40px; top: 12.5px; color: #6b7281; transition: 0.3s; pointer-events: none; }
  .form label .input:focus + span, .form label .input:valid + span { top: -8px; font-size: 0.75em; background: #fff; left: 38px; color: #2563eb; }
  .button-group { display: flex; gap: 15px; justify-content: flex-end; border-top: 1px solid #e5e7eb; padding-top: 15px; }
  .submit { background: #2563eb; color: white; padding: 10px 16px; border-radius: 8px; cursor: pointer; border: none; }
  .cancel { background: white; border: 1px solid #d1d5db; padding: 10px 16px; border-radius: 8px; cursor: pointer; }
`;

export default CreateContModal;