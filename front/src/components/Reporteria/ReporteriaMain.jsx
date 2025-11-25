import React, { useState } from 'react'
import Sidebar from '../utils/Sidebar'
import SearchBar from './SearchBar'
import ReportsTable from './ReportsTable'
import Report from './Report'
import EditReport from './EditReport'

function ReporteriaMain() {
  const [estado, setEstado] = useState(1)
  const [reportId, setReportId] = useState(null); 
  const [filtro, setFiltro] = useState('');
  const [reportsRefreshKey, setReportsRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setReportsRefreshKey(prevKey => prevKey + 1);
  };

  function viewReport(id){
    setEstado(2);
    setReportId(id);
  }

  function viewTable() {
    setEstado(1);
  }
  function setSearch(filter){
    setFiltro(filter);
  }

  function editar(id){
    setEstado(3);
    setReportId(id);
  }

  return (
        <div className='w-full h-full'>
          {estado === 1 && (
            <>
            <SearchBar onSearch={setSearch} onReporteCreado={triggerRefresh}/>
            <ReportsTable onEditar={editar} onViewReport={viewReport} filtro={filtro} refreshTrigger={reportsRefreshKey}/>
            </>)}
          {estado === 2 && <Report reporteId={reportId}  onViewTable={viewTable} />}
          {estado === 3 && <EditReport reporteId={reportId} onSaving={viewTable} />}
        </div>
  )
}

export default ReporteriaMain