import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaFilePdf, FaFileCsv, FaDownload, FaSpinner } from 'react-icons/fa';

const ExportModal = ({ onClose, onExport, defaultFileName, position }) => {
    const [fileName, setFileName] = useState(defaultFileName || 'reporte');
    const [format, setFormat] = useState('pdf');
    const [isExporting, setIsExporting] = useState(false);

    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('keydown', handleEsc);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);


    const handleExportClick = async () => {
        setIsExporting(true);
        await onExport(fileName, format); 
        setIsExporting(false);
        onClose();
    };

    return (
        <div 
            ref={modalRef} 
            className="fixed bg-white w-full max-w-sm p-6 rounded-2xl shadow-xl border border-gray-200 transform transition-all origin-top-right z-50"
            style={{
                top: position.top,  
                left: position.left, 
                transform: 'translateX(-100%)' 
            }}
        >
            
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                <FaTimes size={20} />
            </button>

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Exportar Reporte</h2>
                <p className="text-sm text-gray-500 mt-1">Elige un nombre y formato para tu archivo.</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label htmlFor="fileName" className="block text-sm font-semibold text-gray-600 mb-2">Nombre del Archivo</label>
                    <input 
                        type="text" 
                        id="fileName"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Formato</label>
                    <div className="flex space-x-2 rounded-lg bg-gray-100 p-1">
                        <button 
                            onClick={() => setFormat('pdf')}
                            disabled={isExporting}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all transition-transform transform hover:scale-105 disabled:cursor-not-allowed ${format === 'pdf' ? '!bg-red-500 text-white shadow' : 'text-gray-600 hover:!bg-gray-200 '}`}
                        ><FaFilePdf />PDF</button>
                        <button 
                            onClick={() => setFormat('csv')}
                            disabled={isExporting}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all transition-transform transform hover:scale-105 disabled:cursor-not-allowed ${format === 'csv' ? '!bg-green-500 text-white shadow' : 'text-gray-600 hover:!bg-gray-200'}`}
                        ><FaFileCsv />CSV</button>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <button 
                    onClick={handleExportClick}
                    disabled={isExporting}
                    className="w-full flex items-center justify-center gap-2 !bg-[#001EB4] text-white font-bold px-4 py-3 rounded-lg hover:!bg-sky-400  transition-transform transform hover:scale-105 disabled:!bg-gray-300 disabled:opacity-50"
                >
                    {isExporting ? <><FaSpinner className="animate-spin" />Exportando...</> : <><FaDownload />Exportar ahora</>}
                </button>
            </div>
        </div>
    );
};

export default ExportModal;