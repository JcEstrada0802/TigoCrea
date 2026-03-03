import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaTimes, FaLayerGroup, FaTrash, FaListOl, FaSave, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import CatalogManager from "../MainComponents/CatalogManager";

function FillBlockModal({ event, onClose }) {
  const [datosCatalogo, setDatosCatalogo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playlist, setPlaylist] = useState([]);
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  // --- LÓGICA DE TIEMPO DROP FRAME ---
  const formatOffsetToTC = useCallback((frames) => {
    const absFrames = Math.abs(frames);
    const total_minutes = Math.floor(absFrames / 1798);
    const drop_frames = 2 * (total_minutes - Math.floor(total_minutes / 10));
    const adjusted_frames = absFrames + drop_frames;

    const f = adjusted_frames % 30;
    const s = Math.floor(adjusted_frames / 30) % 60;
    const m = Math.floor(adjusted_frames / (30 * 60)) % 60;
    const h = Math.floor(adjusted_frames / (30 * 3600)) % 24;

    const tc = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${f.toString().padStart(2, '0')}`;
    return frames < 0 ? `-${tc}` : tc;
  }, []);

  // --- CÁLCULOS DE PLAYLIST ---
  const playlistConTiempos = useMemo(() => {
    let currentFrameOffset = 0;
    return playlist.map((item) => {
      const startTC = formatOffsetToTC(currentFrameOffset);
      const data = { ...item, startTC };
      currentFrameOffset += item.duracion;
      return data;
    });
  }, [playlist, formatOffsetToTC]);

  const stats = useMemo(() => {
    const realFF = playlist.reduce((acc, item) => acc + item.duracion, 0);
    const teoricoFF = event?.duracion_teorica_ff || 0;
    const diferenciaFF = teoricoFF - realFF;

    return {
      realTC: formatOffsetToTC(realFF),
      realFF: realFF,
      teoricoTC: formatOffsetToTC(teoricoFF),
      diferenciaTC: formatOffsetToTC(diferenciaFF),
      diferenciaFF: diferenciaFF,
      estado: diferenciaFF < 0 ? 'OVER' : diferenciaFF === 0 ? 'PERFECT' : 'GAP'
    };
  }, [playlist, event, formatOffsetToTC]);

  // --- FETCH CATALOGO ---
  useEffect(() => {
    const fetchRealCatalog = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/catalogo/getFullCatalog`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          }
        });
        const data = await response.json();
        setDatosCatalogo(data);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    if (token) fetchRealCatalog();
  }, [apiUrl, token]);

  const handleAddSegment = useCallback((seg) => {
    setPlaylist(prev => [...prev, { ...seg, uniqueId: `${seg.id}-${Date.now()}-${Math.random()}` }]);
  }, []);

  const removeItem = useCallback((uid) => {
    setPlaylist(prev => prev.filter(item => item.uniqueId !== uid));
  }, []);

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[95vw] h-[92vh] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-slate-700">
        
        {/* HEADER */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/20"><FaLayerGroup size={18} /></div>
            <div>
              <h2 className="text-sm font-black text-slate-700 dark:text-white uppercase tracking-tighter">
                Editor de Bloque <span className="text-blue-500 mx-1">/</span> {event?.title}
              </h2>
              <div className="flex gap-4 mt-0.5 font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                <span>INICIO: {event?.start ? new Date(event.start).toLocaleTimeString() : '--:--'}</span>
                <span className="bg-slate-200 dark:bg-slate-700 px-2 rounded text-slate-600 dark:text-slate-300">DURACIÓN TEÓRICA: {stats.teoricoTC}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-all p-2"><FaTimes size={20} /></button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* CATALOGO */}
          <div className="w-[350px] border-r border-slate-100 dark:border-slate-800">
            {loading ? <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-t-blue-600" /></div> 
            : <CatalogManager datosCatalogo={datosCatalogo} onAddSegment={handleAddSegment} />}
          </div>

          {/* PLAYLIST GRID */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 overflow-y-auto custom-scrollbar"
               onDragOver={(e) => e.preventDefault()}
               onDrop={(e) => {
                 e.preventDefault();
                 const data = e.dataTransfer.getData("segmentData");
                 if (data) handleAddSegment(JSON.parse(data));
               }}>
            {playlist.length === 0 ? (
              <div className="h-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center opacity-40">
                <FaListOl size={40} className="mb-4 text-slate-300" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Arrastra clips aquí</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 font-mono text-[9px] text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2 w-10 text-center">#</th>
                      <th className="px-3 py-2 w-28">Start Time</th>
                      <th className="px-2 py-2 w-8 text-center">Cat</th>
                      <th className="px-3 py-2">Title / ID Media</th>
                      <th className="px-3 py-2 w-28 text-right">Duration</th>
                      <th className="px-3 py-2 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {playlistConTiempos.map((item, index) => (
                      <tr key={item.uniqueId} className="group hover:bg-blue-50/40 dark:hover:bg-blue-900/5 transition-colors border-l-4" style={{ borderLeftColor: item.cat_color }}>
                        <td className="px-3 py-1.5 text-[9px] font-mono text-slate-400 text-center">{index + 1}</td>
                        <td className="px-3 py-1.5 font-mono text-[11px] font-bold text-blue-600">{item.startTC}</td>
                        <td className="px-2 py-1.5 text-center"><div className="w-2 h-2 rounded-full mx-auto" style={{ backgroundColor: item.cat_color }} /></td>
                        <td className="px-3 py-1.5 truncate">
                          <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase truncate">{item.titulo}</span>
                          <span className="text-[8px] text-slate-400 font-mono">{item.id_media}</span></div>
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono"><div className="flex flex-col"><span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{item.duracion_tc}</span>
                        <span className="text-[8px] text-slate-400">{item.duracion} ff</span></div></td>
                        <td className="px-3 py-1.5 text-center"><button onClick={() => removeItem(item.uniqueId)} className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><FaTrash size={10} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER - COMPARATIVA TÉCNICA */}
        <div className="px-8 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-inner">
          <div className="flex gap-10">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Duración Real</span>
              <span className="text-2xl font-mono font-black text-slate-800 dark:text-white leading-none">{stats.realTC}</span>
            </div>

            <div className="flex flex-col border-l border-slate-100 dark:border-slate-800 pl-10">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Diferencia (Gap/Overlap)</span>
              <div className={`flex items-center gap-2 text-2xl font-mono font-black leading-none ${stats.estado === 'OVER' ? 'text-red-500' : stats.estado === 'PERFECT' ? 'text-green-500' : 'text-amber-500'}`}>
                {stats.diferenciaTC}
                {stats.estado === 'OVER' ? <FaExclamationTriangle size={14}/> : stats.estado === 'PERFECT' ? <FaCheckCircle size={14}/> : null}
              </div>
              <span className="text-[9px] font-bold text-slate-400 font-mono mt-1">{stats.diferenciaFF} FF</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-6 py-2 text-[10px] font-bold !text-slate-400 hover:!text-slate-600 tracking-widest">Cancelar</button>
            <button className="px-10 py-3 !bg-blue-600 !text-white rounded-lg shadow-xl shadow-blue-500/30 hover:!bg-blue-700 active:scale-95 transition-all flex items-center gap-3 font-black text-[10px] tracking-[0.2em]"
                    onClick={() => console.log("GUARDAR:", playlist)}>
              <FaSave size={14} /> Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FillBlockModal;