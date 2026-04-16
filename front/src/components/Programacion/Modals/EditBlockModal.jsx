import React, { useState, useEffect, useRef } from 'react';
import { FaCheck, FaPencilAlt, FaClock, FaStickyNote } from 'react-icons/fa';
import { framesToFullCalendarDuration } from '../utils/DecodeTimes';

const EditBlockModal = ({ isVisible, onClose, onSave, position, blockData }) => {
    const [nombre, setNombre] = useState('');
    const [duracion, setDuracion] = useState('00:00:00');
    const [notas, setNotas] = useState('');
    const modalRef = useRef(null);
    const [adjustedPosition, setAdjustedPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (isVisible && position && modalRef.current) {
            const modalRect = modalRef.current.getBoundingClientRect();
            const margin = 20; // Espacio mínimo con el borde de la pantalla

            let top = position.top;
            let left = position.left;

            // Ajuste Vertical: Si se sale por abajo, súbelo
            if (top + modalRect.height > window.innerHeight) {
                top = window.innerHeight - modalRect.height - margin;
            }

            // Ajuste Horizontal: Si se sale por la derecha, muévelo a la izquierda
            if (left + modalRect.width > window.innerWidth) {
                left = window.innerWidth - modalRect.width - margin;
            }

            // Evitar que se salga por arriba (si la pantalla es muy pequeña)
            top = Math.max(margin, top);
            left = Math.max(margin, left);

            setAdjustedPosition({ top, left });
        }
    }, [isVisible, position]);

    // Cargar datos del bloque cuando el modal se hace visible
    useEffect(() => {
        if (isVisible && blockData) {
            setNombre(blockData.nombre || '');
            setDuracion(framesToFullCalendarDuration(blockData.duracion_teorica) || '00:00:00');
            setNotas(blockData.notas || '');
        }
    }, [isVisible, blockData]);

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
        // Validación de duración mínima (5 minutos = 300 segundos)
        const parts = duracion.split(':').map(Number);
        const totalSeconds = (parts[0] * 3600) + (parts[1] * 60) + (parts[2] || 0);

        if (!nombre.trim()) return alert("El nombre es obligatorio");
        if (isNaN(totalSeconds) || totalSeconds < 300) {
            return alert("La duración mínima debe ser de 00:05:00");
        }

        onSave({ 
            id: blockData.id, 
            nombre: nombre, 
            duracion_teorica: duracion, 
            notas: notas 
        });
        onClose();
    };

    return (
        <div 
            ref={modalRef} 
            className="fixed bg-white w-full max-w-sm p-6 rounded-2xl shadow-2xl border border-gray-100 transform transition-all z-[2000]"
            style={{
                top: `${adjustedPosition.top}px`,  
                left: `${adjustedPosition.left}px`,
            }}
        >
            {/* Header */}
            <div className="mb-5 flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-[#001EB4]">
                    <FaPencilAlt size={18} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[#001EB4]">Editar Bloque</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Ajuste los detalles técnicos del bloque.</p>
                </div>
            </div>

            {/* Formulario */}
            <div className="space-y-4">
                {/* Nombre */}
                <div>
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                        <FaPencilAlt className="text-blue-400" size={10} /> Nombre del Bloque
                    </label>
                    <input 
                        type="text" 
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all text-sm font-bold text-gray-600"
                    />
                </div>

                {/* Duración */}
                <div>
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                        <FaClock className="text-blue-400" size={10} /> Duración (HH:MM:SS)
                    </label>
                    <input 
                        type="text" 
                        placeholder="00:00:00"
                        value={duracion}
                        onChange={(e) => setDuracion(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all text-sm font-mono font-bold text-gray-600"
                    />
                </div>

                {/* Notas */}
                <div>
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                        <FaStickyNote className="text-blue-400" size={10} /> Notas Adicionales
                    </label>
                    <textarea 
                        rows="3"
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all text-sm font-medium text-gray-600 resize-none"
                        placeholder="Instrucciones para el operador..."
                    />
                </div>
            </div>

            {/* Botón Acción */}
            <div className="mt-8 flex gap-3">
                <button 
                    onClick={onClose}
                    className="flex-1 bg-gray-100 text-gray-500 font-bold px-4 py-3 rounded-xl hover:bg-gray-200 transition-all active:scale-95 text-sm"
                >
                    Cancelar
                </button>
                <button 
                    onClick={handleSaveClick}
                    className="flex-[2] flex items-center justify-center gap-2 !bg-[#001EB4] text-white font-bold px-4 py-3 rounded-xl hover:!bg-[#44C8F5] transition-all shadow-lg shadow-blue-100 active:scale-95 text-sm"
                >
                    <FaCheck /> Actualizar Bloque
                </button>
            </div>
        </div>
    );
};

export default EditBlockModal;