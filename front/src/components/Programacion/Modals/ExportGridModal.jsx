import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaCheck, FaCalendarAlt } from 'react-icons/fa';
import { FaFilePdf, FaPencilAlt } from 'react-icons/fa';
import axios from 'axios';

const ExportGridModal = ({ isVisible, onClose, onExport, position }) => {
    const [selectedCalendar, setSelectedCalendar] = useState('');
    const [calendars, setCalendars] = useState([]);

    const [pdfName, setpdfName] = useState('');
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');
    const modalRef = useRef(null);

    useEffect(() => {
        if (!isVisible) return;
        
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        const handleEsc = (event) => {
            if (event.key === 'Escape') onClose();
        };

        const fetchData = async() => {
            try{
                const calendarios = await axios.get(`${apiUrl}/programacion/getCalendars/`, {
                    headers: {'Authorization': `Token ${token}`}
                })
                setCalendars(calendarios.data);
            }catch(error){
                console.log("Error cargando datos al modal, ", error)
            }
        };
        fetchData();
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const handleSaveClick = () => {
        if (!pdfName.trim()) return alert("El nombre de la plantilla es obligatorio");
        onExport(selectedCalendar, pdfName);
        setpdfName(''); // Reset
        onClose();
    };

    return (
        <div 
            ref={modalRef} 
            className="fixed bg-white w-full max-w-sm p-6 rounded-2xl shadow-2xl border border-gray-100 transform transition-all z-[2000]"
            style={{
                top: position?.top || '20%',  
                left: position?.left || '20%', 
            }}
        >

            {/* Header */}
            <div className="mb-5 flex items-start gap-3">
                <div className="p-3 bg-blue-50 rounded-xl text-[#001EB4]">
                    <FaFilePdf size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[#001EB4]">Exportar parrilla a PDF</h2>
                    <p className="text-xs text-gray-500 mt-1">Exporte la parrilla que ve en el calendario a un PDF para compartir.</p>
                </div>
            </div>

            {/* Formulario */}
            <div className="space-y-4">
                <div>
                    <label className="flex items-center gap-2 text-[9px] font-black text-gray-400 mb-1.5 ml-1 tracking-tighter">
                        <FaPencilAlt className="text-blue-400" /> Nombre del PDF
                    </label>
                    <input 
                        autoFocus
                        type="text" 
                        placeholder="Ej. Parrilla Normal, Parrilla Tigo, Especial..."
                        value={pdfName}
                        onChange={(e) => setpdfName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl text-[11px] font-bold text-gray-600 focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer"
                    />
                </div>
            </div>

            <div>
                <label className="flex items-center gap-2 text-[9px] font-black text-gray-400 mb-1.5 ml-1 tracking-tighter">
                    <FaCalendarAlt className="text-blue-400" /> CANAL
                </label>
                <select 
                    value={selectedCalendar}
                    onChange={(e) => setSelectedCalendar(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl text-[11px] font-bold text-gray-600 focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer"
                >
                    <option value="">¿Desde qué canal?</option>
                    {calendars.map(cal => (
                    <option key={cal.id} value={cal.id}>{cal.name}</option>
                    ))}
                </select>
            </div>

            {/* Botón Acción */}
            <div className="mt-8">
                <button 
                    onClick={handleSaveClick}
                    disabled={!pdfName.trim()}
                    className="w-full flex items-center justify-center gap-2 !bg-[#001EB4] text-white font-bold px-4 py-3 rounded-xl hover:!bg-[#44C8F5] transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                    <FaCheck /> Exportar
                </button>
            </div>
        </div>
    );
};

export default ExportGridModal;