import React, { useEffect, useState } from 'react';
import axios from 'axios';
// ¡OJO! Importé FiEdit3 para el título
import { FiFileText, FiEdit, FiShare2, FiSave, FiX, FiLoader, FiAlertTriangle, FiEdit3 } from 'react-icons/fi';
import Alert from '../utils/Alert';

function EditReport({ reporteId, onSaving }) {
    const [showAlert, setShowAlert] = useState(false);
    const [tipo, setTipo] = useState('success');
    const [mensaje, setMensaje] = useState('Reporte Actualizado, Redireccionando...')
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        sistemas: [],
    });

    const [allSistemas, setAllSistemas] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!reporteId) return;

        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);

            try {
                const [reportResponse, sistemasResponse] = await Promise.all([
                    axios.post(`${apiUrl}/reporteria/getReport/${reporteId}/`, {}, {
                        headers: { Authorization: `Token ${token}` }
                    }),
                    axios.get(`${apiUrl}/reporteria/getSystems/`, {
                        headers: { Authorization: `Token ${token}` }
                    })
                ]);
                
                setFormData(reportResponse.data.report_info || { titulo: '', descripcion: '', sistemas: [] });
                setAllSistemas(sistemasResponse.data);

            } catch (err) {
                console.error("Error al cargar los datos:", err);
                setError("No se pudieron cargar los datos del reporte. Inténtalo de nuevo.");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [reporteId, apiUrl, token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSistemaChange = (sistemaId) => {
        setFormData(prev => {
            const sistemasActuales = prev.sistemas;
            if (sistemasActuales.includes(sistemaId)) {
                return { ...prev, sistemas: sistemasActuales.filter(id => id !== sistemaId) };
            } else {
                return { ...prev, sistemas: [...sistemasActuales, sistemaId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            await axios.put(`${apiUrl}/reporteria/updateReport/${reporteId}/`, formData, {
                headers: { Authorization: `Token ${token}` }
            });
            setShowAlert(true);
            setTimeout(() => onSaving(), 2500);
            

        } catch (err) {
            console.error("Error al guardar el reporte:", err);
            setShowAlert(true);
            setTipo('error');
            setMensaje('Error al Editar Reporte');
            setTimeout(() => setShowAlert(false, 2500));
            setError("Error al guardar. Verifica los datos e inténtalo de nuevo.");
        } finally {
            setIsSaving(false);
            
        }
    };
    
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                <FiLoader className="animate-spin text-4xl text-[#001EB4]" />
                <p className="mt-4 text-lg">Cargando datos del reporte...</p>
            </div>
        );
    }
    
    if (error && !isSaving) { 
         return (
            <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-lg border border-red-200">
                <FiAlertTriangle className="text-4xl text-red-500" />
                <p className="mt-4 text-lg text-red-700">{error}</p>
                 <button 
                    onClick={onSaving} 
                    className="mt-6 flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                    <FiX className="mr-2" /> Volver
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl animate-fade-in">
            <h2 className="flex items-center text-2xl sm:text-3xl font-bold text-gray-800 mb-6 border-b-2 border-[#44C8F5] pb-3">
                <FiEdit3 className="mr-3 text-[#44C8F5]" />
                Editar Reporte
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="titulo" className="block text-sm font-semibold text-gray-600 mb-2">
                        Título del Reporte
                    </label>
                    <div className="relative">
                        <FiFileText className="absolute top-1/2 -translate-y-1/2 left-3 text-[#44C8F5]" />
                        <input
                            type="text"
                            id="titulo"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleInputChange}
                            placeholder="Escribe un título claro y descriptivo"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44C8F5] focus:border-[#001EB4] transition"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="descripcion" className="block text-sm font-semibold text-gray-600 mb-2">
                        Descripción
                    </label>
                    <div className="relative">
                        <FiEdit className="absolute top-4 left-3 text-[#44C8F5]" />
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleInputChange}
                            placeholder="Detalla aquí el contenido del reporte"
                            rows="4"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44C8F5] focus:border-[#001EB4] transition resize-y"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-3">
                        Sistemas Asociados
                    </label>
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 max-h-48 overflow-y-auto">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {allSistemas.map((sistema) => (
                                <label key={sistema.id} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-cyan-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.sistemas?.includes(sistema.id)}
                                        onChange={() => handleSistemaChange(sistema.id)}
                                        className="h-5 w-5 rounded border-gray-300 text-[#001EB4] focus:ring-[#44C8F5]"
                                    />
                                    <span className="text-gray-700 font-medium select-none">{sistema.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                
                {error && isSaving && (
                    <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg">
                        <FiAlertTriangle className="mr-3" /> {error}
                    </div>
                )}


                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onSaving}
                        disabled={isSaving}
                        className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                        <FiX className="mr-2" /> Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center justify-center px-6 py-2 !bg-[#001EB4] text-white font-semibold rounded-lg hover:!bg-sky-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#001EB4] transition-transform transform hover:scale-105 disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <FiLoader className="animate-spin mr-2" /> Guardando...
                            </>
                        ) : (
                            <>
                                <FiSave className="mr-2" /> Guardar Cambios
                            </>
                        )}
                    </button>
                </div>
            </form>
            {showAlert && <Alert type={tipo} message={mensaje}/>}
        </div>
    );
}

export default EditReport;