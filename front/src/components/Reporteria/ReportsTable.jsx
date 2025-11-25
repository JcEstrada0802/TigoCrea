import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../authComponents/UseAuth';

const ReportsTable = ({ onViewReport, onEditar, filtro, refreshTrigger}) => {
    const { user } = useAuth();
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');
    const [reportes, setReportes] = useState([]);

    useEffect(() => {
        const getReportes = async () =>{
            const response = await axios.get(apiUrl+'/reporteria/getReports/',{
                headers:{
                    Authorization: `Token ${token}`
                }
            });
            setReportes(response.data);
        }
        getReportes();
    }, [filtro, refreshTrigger])

    const reports = useMemo(() => {
        return reportes.filter(report =>{
                    const titleMatch = report.titulo ? report.titulo.toLowerCase().includes(filtro.toLowerCase()) : true;
                    return titleMatch;
                })
    });

    return (
    <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Descripción</th>
            <th style={thStyle}></th>
            <th style={thStyle}></th>
            </tr>
        </thead>
        <tbody>
            {reports.map(reporte => (
            <tr key={reporte.id}>
                <td style={tdStyle}>{reporte.id}</td>
                <td style={tdStyle}>{reporte.titulo}</td>
                <td style={tdStyle}>{reporte.desc}</td>
                <td style={tdStyle}>
                    <button 
                        onClick={() => onViewReport(reporte.id)}
                        style={buttonStyle}
                    >
                        Ver
                    </button>
                </td>
                {(user.is_superuser && <td style={tdStyle}>
                    <button
                        onClick={() => onEditar(reporte.id)}
                        style={buttonStyle2}
                    >
                        Editar
                    </button>
                </td>)}
            </tr>
            ))}
        </tbody>
        </table>
    </div>
    );
    };

    const thStyle = {
    padding: '8px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd'
    };

    const tdStyle = {
    padding: '8px',
    borderBottom: '1px solid #eee'
    };

    const buttonStyle = {
    padding: '5px 10px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#001EB4',
    color: '#fff',
    cursor: 'pointer'
    };

    const buttonStyle2 = {
    padding: '5px 10px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#f59e0b',
    color: '#fff',
    cursor: 'pointer'
    };

export default ReportsTable;
