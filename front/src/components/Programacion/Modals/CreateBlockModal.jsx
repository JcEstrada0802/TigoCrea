import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
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

const CreateBlockModal = ({ isOpen, onClose, onFinish, config, categoriaId, categoriaNombre, showAlert}) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    const [nombre, setNombre] = useState('');
    const [duracionTeorica, setDuracionTeorica] = useState('00:00:00');
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
        const durationToSeconds = (hms) => {
            const [hours, minutes, seconds] = hms.split(':').map(Number);
            return (hours * 3600) + (minutes * 60) + (seconds || 0);
        };

        // 2. Validación: ¿Es un formato válido y mayor a 5 minutos?
        const totalSeconds = durationToSeconds(duracionTeorica);
        const MIN_SECONDS = 300; // 5 minutos exactos

        if (isNaN(totalSeconds) || totalSeconds < MIN_SECONDS) {
            showAlert('error', 'La duración debe ser mayor a 5 minutos')
            return; // Detenemos el envío
        }
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

    const handleDuracionChange = (e) => {
        let input = e.target.value.replace(/\D/g, '').substring(0, 6);
        let formatted = "";
        if (input.length > 0) {
            formatted += input.substring(0, 2);
            if (input.length > 2) {
                formatted += ":" + input.substring(2, 4);
                if (input.length > 4) {
                    formatted += ":" + input.substring(4, 6);
                }
            }
        }

        setDuracionTeorica(formatted);
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
                        <StyledInputGroup className="relative">
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                                <FaClock size={12} /> Duración Estimada
                            </label>
                            <div className="relative">
                                <input 
                                type="text"
                                required
                                value={duracionTeorica}
                                onChange={handleDuracionChange}
                                className="input-field w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                placeholder=" " 
                                />
                                <span className="floating-label">(HH:MM:SS)*</span>
                            </div>
                        </StyledInputGroup>

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

const StyledInputGroup = styled.div`
  position: relative;
  margin-top: 10px;

  .input-field {
    transition: all 0.3s ease;
    border: 1px solid #e5e7eb;
  }

  /* El Span (Label flotante) */
  .floating-label {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    background-color: #f9fafb; /* Color del fondo del input */
    padding: 0 4px;
    color: #9ca3af;
    font-size: 0.9em;
    pointer-events: none;
    transition: all 0.3s ease;
    z-index: 10;
  }

  /* Animación: Cuando el input tiene foco O no está vacío */
  .input-field:focus + .floating-label,
  .input-field:not(:placeholder-shown) + .floating-label {
    top: -0px; /* Lo sube al borde superior */
    left: 12px;
    font-size: 0.75em;
    color: #2563eb;
    font-weight: 600;
    background-color: white; /* Para que "corte" la línea del borde */
  }

  .input-field:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }
`;

export default CreateBlockModal;