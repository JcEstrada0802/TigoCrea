import React, { useState } from 'react';
import CreateReportModal from './CreateReportModal';
import Alert from '../utils/Alert';
import { useAuth } from '../authComponents/UseAuth';

const SearchBar = ({ onSearch, onReporteCreado }) => {
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [showModal, setShowModal] = useState(false);
  const abrirModal = () => setShowModal(true);
  const cerrarModal = () => setShowModal(false);
  const [tipo, setTipo] = useState('success');
  const [mensaje, setMensaje] = useState('Reporte Creado Correctamente');
  const [showAlert, setShowAlert] = useState(false);

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
    onSearch(event.target.value);
  };

  const handleReporteCreado = () =>{
    cerrarModal();

    if (onReporteCreado) {
        onReporteCreado();
    }

    setTipo('success');
    setMensaje('Reporte Creado Correctamente');
    setShowAlert(true); 
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  }

  const handleReporteNoCreado = () =>{
    cerrarModal();
    setTipo('error');
    setMensaje('Error al crear reporte');
    setShowAlert(true); 
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  }

  return (
    <div className="w-full p-5 shadow-md shadow-blue-200/50 rounded-md h-1/10">
        <div className="flex items-center flex-grow bg-gray-100 rounded-md">
            <button className="p-2 text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
            <input
            type="text"
            placeholder="Search by text"
            value={searchValue}
            onChange={handleSearchChange}
            className="flex-grow py-2 px-2 text-sm bg-gray-100 placeholder-gray-400 focus:outline-none"
            />
            <button className="p-2 text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-filter"><path d="M22 3H2l8 11.23a2 2 0 0 1 0 2.54L12 21h0a2 2 0 0 0 2-2V7.5a2 2 0 0 1 .5-1.4l1.24-1.3A2 2 0 0 0 16 4.63V3.6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2z"/></svg>
            </button>
            {(user.is_superuser && <button 
                className="!bg-blue-800 text-white font-bold py-2 px-4 rounded !hover:bg-sky-400 transition-colors"
                onClick={abrirModal}
                >
                + New
            </button>)}
            <CreateReportModal isOpen={showModal} onClose={cerrarModal} onReporteCreado={handleReporteCreado} noCreado={handleReporteNoCreado}/>
            {showAlert && <Alert type={tipo} message={mensaje}/>}
        </div>
    </div>
  );
};

export default SearchBar;