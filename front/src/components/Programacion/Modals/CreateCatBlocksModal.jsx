import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPlus, FaCheck } from 'react-icons/fa';

const CreateCatBlocksModal = ({ isVisible, onClose, onSave, position }) => {
    const [catName, setCatName] = useState('');
    const [catColor, setCatColor] = useState('#001EB4'); // Default Tigo Blue
    const modalRef = useRef(null);

    // Cerrar al hacer clic fuera o presionar Esc
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
        if (!catName.trim()) return alert("El nombre es obligatorio");
        onSave({ nombre: catName, color: catColor });
        setCatName(''); // Reset
        onClose();
    };

    return (
        <div 
            ref={modalRef} 
            className="fixed bg-white w-full max-w-sm p-6 rounded-2xl shadow-2xl border border-gray-100 transform transition-all z-[100]"
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
            <div className="mb-5">
                <h2 className="text-xl font-bold text-[#001EB4]">Nueva Categoría de Bloques</h2>
                <p className="text-xs text-gray-500 mt-1">Defina un grupo para sus bloques de programación.</p>
            </div>

            {/* Formulario */}
            <div className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Nombre de la Categoría
                    </label>
                    <input 
                        type="text" 
                        placeholder="Ej. Deportes, Cine, Promo..."
                        value={catName}
                        onChange={(e) => setCatName(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition-all"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Color de categoría
                    </label>
                    <div className="flex items-center gap-4">
                        <input 
                            type="color" 
                            value={catColor}
                            onChange={(e) => setCatColor(e.target.value)}
                            className="h-10 w-20 cursor-pointer rounded-lg border-none bg-transparent"
                        />
                        <span className="text-sm font-mono text-gray-500">{catColor.toUpperCase()}</span>
                    </div>
                </div>
            </div>

            {/* Botón Acción */}
            <div className="mt-8">
                <button 
                    onClick={handleSaveClick}
                    className="w-full flex items-center justify-center gap-2 !bg-[#001EB4] text-white font-bold px-4 py-3 rounded-xl hover:!bg-[#44C8F5] transition-all shadow-lg shadow-blue-100 hover:scale-105 transition-all"
                >
                    <FaCheck /> Crear Categoría
                </button>
            </div>
        </div>
    );
};

export default CreateCatBlocksModal;