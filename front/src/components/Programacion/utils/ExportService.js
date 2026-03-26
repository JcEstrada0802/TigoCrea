import axios from 'axios';
import { Triangle } from 'lucide-react';

const apiUrl = import.meta.env.VITE_API_URL;

const exportGridToPDF = async (calendarId, pdfName, calendarRef) => {
    const token = localStorage.getItem('token');

    try {
        const calendarApi = calendarRef.current?.getApi();
        if (!calendarApi) throw new Error("No se pudo acceder a la API del calendario");
        const start = calendarApi.view.activeStart.toISOString();
        const end = calendarApi.view.activeEnd.toISOString();

        const response = await axios.post(
            `${apiUrl}/programacion/exportGridPDF/`,
            { 
                calendar_id: calendarId,
                filename: pdfName,
                start_date: start,
                end_date: end
            },
            { 
                headers: { 
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                } 
            }
        );

        return response.data.task_id; 

    } catch (error) {
        console.error("Error en exportGridToPDF: ", error);
        throw error; // Re-lanzamos para que el componente decida qué mostrar
    }
};

const exportPlaylistToCLF = async(clfName, fecha, calendarId) => {
    const token = localStorage.getItem('token')
    try{
        const response = await axios.post(
            `${apiUrl}/programacion/exportPLaylist/`,
            { 
                calendar_id: calendarId,
                filename: clfName,
                fecha: fecha
            },
            { 
                headers: { 
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                } 
            }
        );
        return response.data.task_id; 
    }catch (error){
        console.error("Error en exportPlaylistToCLF: ", error);
        throw error;
    }
}

export {exportGridToPDF, exportPlaylistToCLF}