import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaCheck, FaCalendarAlt } from 'react-icons/fa';

const CreateTemplateModal = ({ isVisible, onClose, onSave, position }) => {
    const [templateName, setTemplateName] = useState('');
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
        
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('keydown', handleEsc);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const handleSaveClick = () => {
        if (!templateName.trim()) return alert("El nombre de la plantilla es obligatorio");
        onSave(templateName);
        setTemplateName(''); // Reset
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
            {/* Botón Cerrar */}
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                <FaTimes size={18} />
            </button>

            {/* Header */}
            <div className="mb-5 flex items-start gap-3">
                <div className="p-3 bg-blue-50 rounded-xl text-[#001EB4]">
                    <FaCalendarAlt size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[#001EB4]">Guardar Plantilla</h2>
                    <p className="text-xs text-gray-500 mt-1">Guarde la configuración de esta semana para usarla después.</p>
                </div>
            </div>

            {/* Formulario */}
            <div className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Nombre de la Plantilla
                    </label>
                    <input 
                        autoFocus
                        type="text" 
                        placeholder="Ej. Semana Normal, Promo Tigo, Especial..."
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all text-sm font-medium"
                    />
                </div>
            </div>

            {/* Botón Acción */}
            <div className="mt-8">
                <button 
                    onClick={handleSaveClick}
                    disabled={!templateName.trim()}
                    className="w-full flex items-center justify-center gap-2 !bg-[#001EB4] text-white font-bold px-4 py-3 rounded-xl hover:!bg-[#44C8F5] transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                    <FaCheck /> Guardar Semana Actual
                </button>
            </div>
        </div>
    );
};

export default CreateTemplateModal;