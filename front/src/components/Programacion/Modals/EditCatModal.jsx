import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { FaCheck, FaPencilAlt, FaPalette } from 'react-icons/fa';
import { updateCatBlock } from '../utils/CatalogService';

const EditCatModal = ({ isVisible, onClose, onFinish, blockData, position, refresh }) => {
    const [nombre, setNombre] = useState('');
    const [color, setColor] = useState('#2563EB');
    const [adjustedPos, setAdjustedPos] = useState({ top: 0, left: 0 });
    const modalRef = useRef(null);
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (isVisible && blockData) {
            setNombre(blockData.nombre || '');
            setColor(blockData.color || '#2563EB');
        }
    }, [isVisible, blockData]);

    useLayoutEffect(() => {
        if (isVisible && position && modalRef.current) {
            const rect = modalRef.current.getBoundingClientRect();
            const margin = 15;
            
            let finalTop = position.top;
            let finalLeft = position.left;

            // Si se sale por abajo
            if (finalTop + rect.height > window.innerHeight) {
                finalTop = window.innerHeight - rect.height - margin;
            }

            // Si se sale por la derecha
            if (finalLeft + rect.width > window.innerWidth) {
                finalLeft = window.innerWidth - rect.width - margin;
            }

            // Evitar que se salga por arriba o izquierda (casos extremos)
            finalTop = Math.max(margin, finalTop);
            finalLeft = Math.max(margin, finalLeft);

            setAdjustedPos({ top: finalTop, left: finalLeft });
        }
    }, [isVisible, position]);

    // Close on click outside or ESC
    useEffect(() => {
        if (!isVisible) return;
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const handleUpdate = async() => {
        try{
            const data = {
                id: blockData.id,
                nombre: nombre,
                color: color,
            }
            const response = await updateCatBlock(apiUrl, token, data);
            onFinish('success', 'Se modificó la categoría');
            refresh();
            onClose();
        }catch(error){
            onFinish('error', 'Error al modificar categoría');
            onClose();
            console.error("No se pudo actualizar:", error);
        }
    };

    return (
        <div 
            ref={modalRef} 
            className="fixed bg-white w-64 p-5 rounded-2xl shadow-2xl border border-gray-100 z-[2000]"
            style={{
                top: `${adjustedPos.top}px`,  
                left: `${adjustedPos.left}px`,
                visibility: adjustedPos.top === 0 ? 'hidden' : 'visible'
            }}
        >
            <div className="flex items-center gap-2 mb-4 text-[#001EB4]">
                <FaPencilAlt size={14} />
                <h2 className="font-bold text-sm">Editar Categoría</h2>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Nombre</label>
                    <input 
                        type="text" 
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 rounded-xl text-[11px] font-bold text-gray-600 focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                </div>

                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Color</label>
                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl">
                        <input 
                            type="color" 
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-8 h-8 border-none rounded-lg cursor-pointer bg-transparent"
                        />
                        <span className="text-[9px] font-mono font-bold text-gray-400">{color}</span>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleUpdate}
                className="w-full mt-5 flex items-center justify-center gap-2 !bg-[#001EB4] text-white text-xs font-bold py-2.5 rounded-xl hover:!bg-[#44C8F5] transition-all active:!scale-95"
            >
                <FaCheck /> ACTUALIZAR
            </button>
        </div>
    );
};

export default EditCatModal;