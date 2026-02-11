import React, { useState, useEffect, useRef } from 'react';
import { 
    FaTimes, 
    FaTag, 
    FaClock, 
    FaRegFileAlt, 
    FaLayerGroup, 
    FaSave, 
    FaSpinner 
} from 'react-icons/fa';
import axios from 'axios';

const CreateBlockModal = ({ isOpen, onClose, onFinish, config, categoriaId, categoriaNombre }) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    const [nombre, setNombre] = useState('');
    const [duracionTeorica, setDuracionTeorica] = useState('');
    const [notas, setNotas] = useState('');
    const [loading, setLoading] = useState(false);

    const modalRef = useRef(null);

    // Resetear formulario
    useEffect(() => {
        if (isOpen) {
            setNombre('');
            setDuracionTeorica('');
            setNotas('');
        }
    }, [isOpen]);

    // Cerrar al hacer clic fuera o Escape
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) onClose();
        };
        const handleEsc = (event) => {
            if (event.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await axios.post(`${apiUrl}/programacion/createBlock/`, {
                nombre,
                duracion_teorica: duracionTeorica,
                duracion_real: 0,
                notas,
                categoria_id: categoriaId
            }, {
                headers: { Authorization: `Token ${token}` }
            });

            onFinish('success', 'Bloque creado exitosamente');
            onClose();
        } catch (error) {
            const msg = error.response?.data?.error || 'Error al crear el bloque';
            onFinish('error', msg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div 
                ref={modalRef}
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
            >
                {/* Header */}
                <div className="relative p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-[#001EB4]">
                            <FaLayerGroup size={20} />
                        </div>
                        Nuevo Bloque de Contenido
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Nombre del Bloque */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <FaTag size={12} /> Nombre del Bloque*
                            </label>
                            <input 
                                type="text"
                                required
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                placeholder="Ej: Intro Noticiero PM"
                            />
                        </div>

                        {/* ID Categoría (Read Only) */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <FaLayerGroup size={12} /> Cat. ID
                            </label>
                            <input 
                                type="text"
                                value={categoriaNombre || ''}
                                readOnly
                                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed outline-none"
                            />
                        </div>

                        {/* Duración Teórica */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <FaClock size={12} /> Estimada(HH:MM:SS)*
                            </label>
                            <input 
                                type="text"
                                required
                                value={duracionTeorica}
                                onChange={(e) => setDuracionTeorica(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="HH:MM:SS"
                            />
                        </div>

                        {/* Placeholder para balancear grid o Notas */}
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <FaRegFileAlt size={12} /> Notas Adicionales
                            </label>
                            <textarea 
                                value={notas}
                                onChange={(e) => setNotas(e.target.value)}
                                rows="3"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="Información extra sobre el bloque..."
                            />
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="mt-10 flex gap-4 justify-end border-top pt-6 border-gray-50">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:!bg-red-600 hover:!text-white transition-all hover:!scale-105"
                        >
                            CANCELAR
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 !bg-[#001EB4] hover:!bg-[#44C8F5] text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                        >
                            {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                            {loading ? 'GUARDANDO...' : 'CREAR BLOQUE'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBlockModal;