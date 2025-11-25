import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import axios from 'axios';

function CreateReportModal({ isOpen, onClose, onReporteCreado, noCreado}) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [systems, setSystems] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedSystems, setSelectedSystems] = useState([]);
  const token = localStorage.getItem("token");

  const handleSubmit = async(e) => {
    e.preventDefault();
    try{ 
      const response = await axios.post(apiUrl + "/reporteria/createReport/",{
          titulo: titulo,
          sistemas: selectedSystems,
          descripcion: desc
        }, {
          headers: {
            Authorization: `Token ${token}`
          }
      })
      onReporteCreado();
    }catch(error){
      console.log(error)
      noCreado();
    }
  }

  const getSystems = async () =>{
      try{
        const response = await axios.get(apiUrl + "/reporteria/getSystems/", {
          headers: {
            Authorization: `Token ${token}`
          }
        });
        return(response.data);
      }catch{
        alert('Error al obtener Sistemas');
        return[];
      }
    };

  useEffect(() => {
    if (!isOpen) return
    const fetchSystems = async () => {
      setSystems(await getSystems());  
    };
    fetchSystems();
  }, [isOpen]);

  const handleSystemChange = (systemId) => {
    if (selectedSystems.includes(systemId)) {
      setSelectedSystems(selectedSystems.filter(id => id !== systemId));
    } else {
      setSelectedSystems([...selectedSystems, systemId]);
    }
  };

if (!isOpen) return null;
return (
  <ModalOverlay onClick={onClose}>
    <ModalContent onClick={(e) => e.stopPropagation()}>
      <StyledWrapper>
        <form className="form" onSubmit={handleSubmit}>
          <p className="title">Reporte Nuevo</p>
          <label>
            <input 
              className="input" 
              type="text" 
              required 
              value={titulo} 
              onChange={(e) => setTitulo(e.target.value)}
            />
            <span>Título</span>
          </label>
          <div className="checkbox-group">
            <span className="checkbox-group-title">Sistemas</span>
            <div className="checkbox-grid">
              {systems.map((system) => (
                <label key={system.id} className="checkbox-label">
                  <input 
                    type="checkbox"
                    value={system.id}
                    checked={selectedSystems.includes(system.id)}
                    onChange={() => handleSystemChange(system.id)}
                  />
                  {system.name}
                </label>
              ))}
            </div>
          </div>
          <label>
            <input 
              className="input" 
              type="text" 
              required 
              value={desc} 
              onChange={(e) => setDesc(e.target.value)}
            />
            <span>Descripcion</span>
          </label>
          <button type="submit" className="submit">
            Crear Reporte
          </button>
          
        </form>
      </StyledWrapper>
    </ModalContent>
  </ModalOverlay>
);
}

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContent = styled.div`
  background: transparent;
  border-radius: 10px;
`;

const StyledWrapper = styled.div`
  .form {
    display: flex;
    flex-direction: column;
    gap: 20px; /* Un poco más de espacio vertical */
    width: 90vw;
    max-width: 450px; /* Un poco más de ancho para que quepan 3 columnas */
    padding: 20px;
    border-radius: 20px;
    position: relative;
    background-color: #1a1a1a;
    color: #fff;
    border: 1px solid #333;
  }

  .title {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -1px;
    position: relative;
    display: flex;
    align-items: center;
    padding-left: 30px;
    color: #44C8F5;
    margin-bottom: 10px; /* Espacio extra debajo del título */
  }
  
  /* ... (el resto de tus estilos .title::before, .flex, etc. se quedan igual) ... */
  
  .title::before,
  .title::after {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    border-radius: 50%;
    left: 0px;
    background-color: #44C8F5;
  }

  .title::after {
    animation: pulse 1s linear infinite;
  }

  .form label {
    position: relative;
    /* Quitamos flex:1 para que no se aplique a los labels de los checkboxes */
  }

  .form label .input {
    background-color: #333;
    color: #fff;
    width: 100%;
    padding: 20px 10px 5px 10px;
    outline: none;
    border: 1px solid rgba(105, 105, 105, 0.397);
    border-radius: 10px;
    font-size: medium;
  }
  
  /* ... (el resto de tus estilos de input/span se quedan igual) ... */

  .form label span {
    color: rgba(255, 255, 255, 0.5);
    position: absolute;
    left: 10px;
    top: 0px;
    font-size: 0.9em;
    transition: 0.3s ease;
    pointer-events: none;
  }

  .form label .input:focus + span,
  .form label .input:valid + span {
    color: #44C8F5;
    top: 0px;
    font-size: 0.7em;
    font-weight: 600;
  }

  .form label .input:placeholder-shown + span {
    top: 12.5px;
    font-size: 0.9em;
  }

  /* --- INICIO DE ESTILOS PARA EL GRID DE CHECKBOXES --- */
  
  .checkbox-group-title {
    display: block;
    margin-bottom: 10px;
    color: #aaa;
    font-size: 0.9em;
    padding-left: 5px;
  }
  
  .checkbox-grid {
    display: grid;
    /* Crea 3 columnas de ancho igual */
    grid-template-columns: repeat(3, 1fr);
    gap: 10px 15px; /* 10px de espacio vertical, 15px horizontal */
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 0.9em;
  }

  /* --- FIN DE ESTILOS PARA EL GRID --- */

  .submit {
    border: none;
    outline: none;
    padding: 10px;
    border-radius: 10px;
    color: #fff;
    font-size: 16px;
    transition: 0.3s ease;
    background-color: #001EB4;
    cursor: pointer; /* Añadido para que se vea como un botón */
  }

  .submit:hover {
    background-color: #44C8F5;
  }

  @keyframes pulse {
    from {
      transform: scale(0.9);
      opacity: 1;
    }
    to {
      transform: scale(1.8);
      opacity: 0;
    }
  }
`;

export default CreateReportModal