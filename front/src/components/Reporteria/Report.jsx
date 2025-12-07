import React, { useState, useEffect, useMemo, useRef } from 'react';
import ExportModal from './ExportModal';
import axios from 'axios';
import { FaPlay, FaRedo, FaTimes, FaSpinner, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { TbDatabaseOff } from 'react-icons/tb';
import Alert from '../utils/Alert';
import ColumnsList from './ColumnsList';
import pollReportStatus from '../utils/PollReportStatus';



// ------------------------------- FUNCION PA FORMATEAR DATOS -------------------------------
const formatTimestamp = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    return date.toLocaleString('es-GT', options);
};

const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
// ------------------------------------------------------------------------------------------



const Report = ({ reporteId, onViewTable }) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [headers, setHeaders] = useState(['Inicio', 'Título', 'Clip Name', 'Duración', 'Tipo', 'Program Block', 'Sistema']);

    const columns = useMemo(() => headers.map(header => ({
        id: header.toLowerCase().replace(/\s+/g, '-'), 
        name: header,
    })), [headers]);

    const handleOrderChange = (newOrderedColumns) => {
        const newHeaders = newOrderedColumns.map(column => column.name);
        setHeaders(newHeaders);
    };
    // ------------------------------- ALERTAS -------------------------------
    const [showAlert, setShowAlert] = useState(false);
    const [tipo, setTipo] = useState('warning');
    const [mensaje, setMensaje] = useState('Reporte Vacio');

    // ------------------------- FILTROS POR DEFAULT -------------------------
    const now = new Date();
    const WeekInMs = 7*24*60*60*1000;
    const nowInMs = now.getTime();
    const oneWeekAgoInMs = nowInMs - WeekInMs;
    const oneWeekAgo = new Date(oneWeekAgoInMs);
    
    // --------------------------- ESTADOS REPORTE ---------------------------
    const [user, setUser] = useState({});
    const [reportInfo, setReportInfo] = useState(null);
    const [logs, setLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('filters');
    const [summary_logs, setSummary_logs] = useState([]);
    const [filters, setFilters] = useState({
        start_time_min: formatDateForInput(oneWeekAgo),
        start_time_max: formatDateForInput(now), 
        title: ''
    });
    
    // ------------------------ ESTADOS MAIN COMPONENT -----------------------
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState(null);


    // ------------------------- ESTADOS PAGINACION --------------------------
    const [currentPage, setCurrentPage] = useState(1);
    const [logsPerPage, setLogsPerPage] = useState(20);

    // ---------------------------- ESTADOS MODAL ----------------------------
    const[isModalOpen, setIsModalOpen] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const exportButtonRef = useRef(null);
    
    // ---------------------------- ESTADOS SCHEMA ---------------------------


    // ---------------------------- SETEAR REPORT ----------------------------
    useEffect(() => {
        const fetchReportData = async () => {
            if (!reporteId) {
                setIsLoading(false);
                setError('ID de reporte no proporcionado.');
                return;
            }
            try {
                const token = localStorage.getItem('token');
                
                const [reportResponse, userResponse] = await Promise.all([
                    axios.post(`${apiUrl}/reporteria/getReport/${reporteId}/`, {filters},{
                        headers: { Authorization: `Token ${token}` }
                    }),
                    axios.post(`${apiUrl}/reporteria/getUserContext/`, {}, {
                        headers: { Authorization: `Token ${token}` }
                    })
                ]);
                
                setReportInfo(reportResponse.data.report_info);
                setLogs(reportResponse.data.logs);
                setUser(userResponse.data);
                setError(null);
            } catch (err) {
                setError('No se pudieron cargar los datos del reporte. Por favor, intenta de nuevo.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReportData();
    }, [reporteId, apiUrl]);

    // -------------------------- MANEJO DE FILTROS --------------------------
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
        setCurrentPage(1);
    };

    // ------------------------------- FILTRAR -------------------------------
    async function filtrar() {
        try{
            const token = localStorage.getItem('token');
            const response = await axios.post(`${apiUrl}/reporteria/getReport/${reporteId}/`, 
                {filters},
                {
                    headers: { Authorization: `Token ${token}` }
                });
            setLogs(response.data.logs);
            if(response.data.logs.length==0){
                setTipo('warning');
                setMensaje('Sin resultados: ningún log coincide con los filtros aplicados.');
            }else{
                setTipo('success');
                setMensaje('Busqueda Exitosa');
            }
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 2500);
        }catch(error){
            setError('Error al aplicar los filtros.');
            console.error(error);
        }
    }
    // Display data
    function display(text, log) {
        switch (text) {
            case "Inicio":
                return formatTimestamp(log.start_time);
            case "Título":
                return log.title;
            case "Clip Name":
                return log.clip_name;
            case "Duración":
                return log.duration;
            case "Tipo":
                return log.event_type;
            case "Program Block":
                return log.metadata.program_block;
            case "Sistema":
                return log.sistema;
            default:
                break;
        }   
    }
    
    // ---------------------------------------- EXPORTAR ----------------------------------------

    const handleOpenExportModal = () => {
        if (exportButtonRef.current) {
            const rect = exportButtonRef.current.getBoundingClientRect();
            
            setModalPosition({
                top: rect.bottom + 8,
                left: rect.right
            });

            setIsModalOpen(true);
        }
    };

    async function exportar(filename, format) {
        setIsExporting(true);
        try {
            if (logs.length === 0) {
                setTipo('warning');
                setMensaje('No hay datos para generar el reporte');
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 2500);
                return;
            }

            const token = localStorage.getItem('token');

            // --- EXPORTACIÓN A PDF ---
            if (format === 'pdf') {
                const [sistemasResponse] = await Promise.all([
                    axios.get(apiUrl + "/reporteria/getSystems/", {
                        headers: { Authorization: `Token ${token}` }
                    })
                ]);

                
                const system_names = sistemasResponse.data
                    .filter(sistema => reportInfo.sistemas.includes(sistema.id))
                    .map(sistema => sistema.name);
                
                const logsForExport = logs.map(log => ({
                    ...log,
                    start_time: formatTimestamp(log.start_time)
                }));

                const response = await axios.post(
                    apiUrl + "/reporteria/exportReport/",
                    { 
                        filters,
                        logs: logsForExport,
                        report_title: filename,
                        export_date: new Date().toLocaleString(),
                        first_name: user.first_name,
                        last_name: user.last_name,
                        sistemas: system_names,
                        headers: headers
                    },
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const task_id = response.data.task_id;
                pollReportStatus(task_id, token, filename);

                // Hacer polling
                /*
                const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${filename}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);*/
            
            // --- EXPORTACIÓN A CSV ---
            } else if (format === 'csv') {
                const summaryRow = `"Total impactos: ${logs.length}"`;
                const csvHeaders = headers; 
                
                const columnAccessorMap = {
                    'Inicio': log => formatTimestamp(log.start_time),
                    'Título': log => log.title,
                    'Clip Name': log => log.clip_name,
                    'Duración': log => log.duration,
                    'Tipo': log => log.event_type,
                    'Program Block': log => log.metadata?.program_block || '',
                    'Sistema': log => log.sistema
                };

                const rows = logs.map(log => {
                    const rowData = csvHeaders.map(header => {
                        // Obtenemos la función para acceder al dato correcto y la llamamos
                        const accessor = columnAccessorMap[header];
                        const value = accessor ? accessor(log) : '';
                        
                        const stringValue = value === null || value === undefined ? '' : String(value);
                        return `"${stringValue.replace(/"/g, '""')}"`;
                    });
                    return rowData.join(',');
                });
                
                const csvContent = [
                    summaryRow,
                    '',
                    csvHeaders.join(','), 
                    ...rows
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${filename}.csv`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            }

        } catch (error) {
            console.error("Error al exportar el reporte:", error);
        } finally {
            setIsExporting(false);
        }
    }
    // ------------------------------------------------------------------------------------------

    // ---------------------------------- PAGINACIÓN DE LOGS ------------------------------------
    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * logsPerPage;
        const endIndex = startIndex + logsPerPage;
        return logs.slice(startIndex, endIndex);
    }, [logs, currentPage, logsPerPage]);

    const totalPages = Math.ceil(logs.length / logsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };
    
    const handleLogsPerPageChange = (e) => {
        setLogsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const resetear = () =>{
        setHeaders(['Inicio', 'Título', 'Clip Name', 'Duración', 'Tipo', 'Program Block', 'Sistema'])
    }
    // ------------------------------------------------------------------------------------------
    
    // ------------------------------------ Default Component -----------------------------------
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <FaSpinner className="w-12 h-12 text-blue-500 animate-spin" />
                    <p className="text-slate-600 font-medium">Cargando Reporte...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="p-8 bg-white rounded-lg shadow-md text-center">
                    <h3 className="text-xl font-bold text-red-600">Error</h3>
                    <p className="text-slate-600 mt-2">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full bg-slate-100 text-slate-800">
            <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm">
                <div className="flex items-center gap-4"> 
                    <div className="w-px h-8 bg-slate-200"></div>
                    <h1 className="text-xl font-semibold text-slate-700">
                        {reportInfo?.titulo || 'Reporte'}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button ref={exportButtonRef} onClick={handleOpenExportModal} disabled={isExporting} className="px-4 py-2 text-sm font-semibold text-white !bg-blue-800 border border-slate-300 rounded-md hover:!bg-sky-400 transition-all transform hover:scale-105 ">
                        {isExporting ? (
                            <FaSpinner className="animate-spin" />
                        ) : (
                            <>Export</>
                        )}
                    </button>
                    <button onClick={filtrar} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white !bg-blue-800 rounded-md hover:bg-blue-600 shadow-sm hover:shadow-md hover:!bg-sky-400 transition-all transform hover:scale-105">
                        <FaPlay className="w-4 h-4" />Run
                    </button>
                    <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors" onClick={resetear}><FaRedo className="w-5 h-5" /></button>
                    <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors hover:!bg-red-500 hover:!text-white" onClick={onViewTable}><FaTimes className="w-5 h-5" /></button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-72 bg-white border-r border-slate-200 p-4 flex flex-col gap-6">
                    <div className="flex items-center justify-around border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('filters')}
                            className={`w-full text-center py-2 font-semibold transition-colors ${
                                activeTab === 'filters'
                                    ? '!bg-blue-800 text-white border-b-2 text-blue-500'
                                    : 'text-slate-500 hover:text-blue-500 hover:bg-slate-50'
                            }`}
                        >
                            Filters
                        </button>
                        <button
                            onClick={() => setActiveTab('schema')}
                            className={`w-full text-center py-2 font-semibold transition-colors ${
                                activeTab === 'schema'
                                    ? '!bg-blue-800 text-white border-b-2 text-blue-500'
                                    : 'text-slate-500 hover:text-blue-500 hover:bg-slate-50'
                            }`}
                        >
                            Schema
                        </button>
                    </div>

                    {activeTab === 'schema' ? (
                        <div>
                                <ColumnsList 
                                    columns={columns} 
                                    onOrderChange={handleOrderChange}/>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Filtros del Reporte</h3>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label htmlFor="start_time_min" className="block text-sm font-medium text-slate-600 mb-1">Desde:</label>
                                    <input type="datetime-local" name="start_time_min" id="start_time_min" value={filters.start_time_min} onChange={handleFilterChange} className="w-full p-2 border border-slate-300 rounded-md text-sm" placeholder="dd/mm/yyyy, HH:MM:SS" />
                                </div>
                                <div>
                                    <label htmlFor="start_time_max" className="block text-sm font-medium text-slate-600 mb-1">Hasta:</label>
                                    <input type="datetime-local" name="start_time_max" id="start_time_max" value={filters.start_time_max} onChange={handleFilterChange} className="w-full p-2 border border-slate-300 rounded-md text-sm" placeholder="dd/mm/yyyy, HH:MM:SS" />
                                </div>
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-slate-600 mb-1">Cliente</label>
                                    <input type="text" name="title" id="title" value={filters.title} onChange={handleFilterChange} className="w-full p-2 border border-slate-300 rounded-md text-sm" placeholder="Buscar por Cliente..." />
                                </div>
                            </div>
                        </div>
                    )}
                </aside>

                <main className="flex-1 flex flex-col p-6 overflow-hidden min-w-0">
                    <div className="flex-1 overflow-x-auto bg-white shadow-md rounded-lg border border-slate-200">
                        <table className="w-full text-sm text-left table-fixed">
                            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                                <tr>
                                    {headers.map((column) => (
                                        <th key={column} className="p-3 font-semibold text-slate-600 tracking-wider w-1/5">{column}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {paginatedLogs.length > 0 ? (
                                    paginatedLogs.map((log) => (
                                        <tr key={log.id} className="border-b border-slate-200 last:border-b-0 hover:bg-sky-50 transition-colors">
                                            {/* Usamos el array de encabezados (headers) para generar las celdas <td> */}
                                            {headers.map((header, index) => (
                                                <td 
                                                    key={index} 
                                                    className={`p-3 text-slate-600 ${
                                                        // Aplicar estilos específicos basados en el índice (si es necesario)
                                                        index === 0 ? 'font-semibold text-slate-800' : 
                                                        index === 1 || index === 3 ? 'font-mono' : ''
                                                    }`}
                                                >
                                                    {/* La función 'display' debe manejar el valor basado en el nombre del encabezado (header) y el log */}
                                                    {display(header, log)}
                                                </td>
                                            ))}

                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center p-8">
                                            <div className="flex flex-col items-center gap-4">
                                                <TbDatabaseOff className="w-12 h-12 text-slate-300" />
                                                <p className="text-slate-500">No hay registros que coincidan con los filtros aplicados.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {logs.length > logsPerPage && (
                        <div className="flex justify-between items-center p-4 bg-white border-t border-slate-200 mt-4 rounded-b-lg shadow-md">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-600 text-sm">Registros por página:</span>
                                <select 
                                    value={logsPerPage} 
                                    onChange={handleLogsPerPageChange} 
                                    className="border border-slate-300 rounded-md p-1 text-sm"
                                >
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-slate-600">Página {currentPage} de {totalPages}</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handlePrevPage} 
                                        disabled={currentPage === 1}
                                        className={`p-2 rounded-md ${currentPage === 1 ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    <button 
                                        onClick={handleNextPage} 
                                        disabled={currentPage === totalPages}
                                        className={`p-2 rounded-md ${currentPage === totalPages ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                                    >
                                        <FaChevronRight />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            {showAlert && <Alert type={tipo} message={mensaje}/>}
            {isModalOpen && (
                <ExportModal 
                    onClose={() => setIsModalOpen(false)}
                    onExport={exportar} 
                    defaultFileName={`Reporte ${reportInfo?.titulo || ''}`.trim()}
                    position={modalPosition}
                />
            )}
        </div>
    );
};

export default Report;