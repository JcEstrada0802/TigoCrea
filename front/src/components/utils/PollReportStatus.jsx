const DJANGO_SERVER_URL = import.meta.env.VITE_DJANGO_SERVER;
const API_URL = import.meta.env.VITE_API_URL;
const POLLING_INTERVAL = 10000; // 10 segundos
import axios from "axios";

function pollReportStatus(task_id, token, title) {
    
    localStorage.setItem('pending_report_task_id', task_id);
    const intervalId = setInterval(async () => {
        
        console.log(`Consultando estado para Task ID: ${task_id}...`);
        
        try {
            const statusResponse = await axios.get(
                `${API_URL}/reporteria/getReportStatus/?taskId=${task_id}`,
                { headers: { Authorization: `Token ${token}` } }
            );

            const currentStatus = statusResponse.data.status
            if (currentStatus === 'SUCCESS' || currentStatus === 'FAILURE') {
                clearInterval(intervalId); // DETENEMOS EL POLLING
                if (currentStatus === 'SUCCESS') {
                    const respuesta = await axios.get(
                        `${API_URL}/reporteria/getReportPDF/?titulo=${title}&taskId=${task_id}`,
                        { 
                            headers: { Authorization: `Token ${token}` },
                            responseType: 'blob'
                        }
                    );
                    const url = window.URL.createObjectURL(new Blob([respuesta.data], {type: 'application/pdf'}));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `${title}.pdf`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);
                } else {
                    console.log("F Bro")
                }

            } else {
                console.log(`Estado: ${currentStatus}. Reintentando en 10 segundos.`);
            }

        } catch (error) {
            clearInterval(intervalId);
            console.error("Error al consultar el estado:", error);
        }

    }, POLLING_INTERVAL);
    
    // Opcional: Retornar el ID del intervalo si necesitas manejarlo externamente
    return intervalId; 
}

export default pollReportStatus;