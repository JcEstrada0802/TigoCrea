import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaTimes, FaLayerGroup, FaTrash, FaListOl, FaSave, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import CatalogManager from "../MainComponents/CatalogManager";
import { createPlaylist } from '../utils/EventService';

function FillBlockModal({ event, onClose, showAlert }) {
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

  // --- CÁLCULOS DE PLAYLIST CON END TIME ---
  const playlistConTiempos = useMemo(() => {
    let currentFrameOffset = 0;
    return playlist.map((item) => {
      const startTC = formatOffsetToTC(currentFrameOffset);
      const startTC_FF = currentFrameOffset;
      const endFrameOffset = currentFrameOffset + item.duracion;
      const endTC = formatOffsetToTC(endFrameOffset);
      
      const data = { 
        ...item, 
        startTC_FF,
        startTC, 
        endTC,
        // Inicializamos valores si no existen
        customID: item.customID || "",
        scotys: item.scotys || "Off"
      };
      
      currentFrameOffset = endFrameOffset;
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

  // --- HANDLERS DE EDICIÓN EN LÍNEA ---
  const updatePlaylistItem = (uid, field, value) => {
    setPlaylist(prev => prev.map(item => 
      item.uniqueId === uid ? { ...item, [field]: value } : item
    ));
  };

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
    setPlaylist(prev => [...prev, { 
      ...seg, 
      uniqueId: `${seg.id}-${Date.now()}-${Math.random()}`,
      customID: "",
      scotys: "Off"
    }]);
  }, []);

  const removeItem = useCallback((uid) => {
    setPlaylist(prev => prev.filter(item => item.uniqueId !== uid));
  }, []);

  const SavePlaylist = async() => {
    console.log("Saved:", playlistConTiempos)
    const dataToSave = playlistConTiempos.map((item, index) => ({
      segmento_id: item.id, // El ID de la tabla Segmento
      orden: index,
      start_relativo: item.startTC_FF,
      custom_id: item.customID,
      scotys: item.scotys,
      tape: item.tape,
      // Aquí podrías agregar tape y op_id si ya los tenés
    }));

    try {
      // Mandamos el ID del bloque (evento) y la lista de items
      const response = await createPlaylist(apiUrl, token, event.id, dataToSave);
      showAlert('success', 'Evento actualizado correctamente.');
      onClose();
    } catch (error) {
      showAlert('error', 'Error al actualizar el evento.');
    }
  }

  useEffect(() => {
  const loadSavedPlaylist = async () => {
    if (!event?.id) return;
    
    try {
      const response = await fetch(`${apiUrl}/programacion/getPlaylist/${event.id}/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      
      if (response.ok) {
        const savedData = await response.json();
        
        // Mapeamos para agregar el uniqueId que React necesita para el drag & drop
        const formattedPlaylist = savedData.map(item => ({
          ...item,
          uniqueId: `${item.id}-${Date.now()}-${Math.random()}`
          // No calculamos startTC/endTC aquí porque tu useMemo 'playlistConTiempos'
          // lo hará automáticamente al detectar que 'playlist' cambió.
        }));
        console.log("fetched: ", formattedPlaylist);
        setPlaylist(formattedPlaylist);
      }
    } catch (error) {
      console.error("Error al cargar la playlist guardada:", error);
    }
  };

  loadSavedPlaylist();
}, [event?.id, apiUrl, token]);

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans text-slate-700">
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
                      <th className="px-3 py-2 w-28 text-center">Start Time</th>
                      <th className="px-3 py-2 w-28 text-center">End Time</th>
                      <th className="px-3 py-2 w-28 text-right">Duración</th>
                      <th className="px-3 py-2">Título / ID Media</th>
                      <th className="px-2 py-2 w-16 text-center">ID</th>
                      <th className="px-2 py-2 w-20 text-center">Scotys</th>
                      <th className="px-2 py-2 w-10 text-center">Cat</th>
                      <th className="px-3 py-2 w-16 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {playlistConTiempos.map((item, index) => (
                      <tr key={item.uniqueId} className="group hover:bg-blue-50/40 dark:hover:bg-blue-900/5 transition-colors border-l-4" style={{ borderLeftColor: item.cat_color }}>
                        <td className="px-3 py-1.5 text-[9px] font-mono text-slate-400 text-center">{index + 1}</td>

                        <td className="px-3 py-1.5 font-mono text-[11px] font-bold text-blue-600 text-center">{item.startTC}</td>
                        <td className="px-3 py-1.5 font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 text-center">{item.endTC}</td>
                        <td className="px-3 py-1.5 text-right font-mono">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{item.duracion_tc}</span>
                            <span className="text-[8px] text-slate-400">{item.duracion} ff</span>
                          </div>
                        </td>
                        
                        <td className="px-3 py-1.5 truncate">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase truncate">{item.titulo}</span>
                            <span className="text-[8px] text-slate-400 font-mono">{item.id_media}</span>
                          </div>
                        </td>
                        {/* INPUT ID */}
                        <td className="px-2 py-1.5">
                          <input 
                            type="text"
                            value={item.customID}
                            onChange={(e) => updatePlaylistItem(item.uniqueId, 'customID', e.target.value)}
                            placeholder="---"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 text-[10px] font-mono text-center focus:outline-none focus:border-blue-500 dark:text-slate-200 transition-colors"
                          />
                        </td>

                        {/* DROPDOWN SCOTYS */}
                        <td className="px-2 py-1.5 text-center">
                          <select 
                            value={item.scotys}
                            onChange={(e) => updatePlaylistItem(item.uniqueId, 'scotys', e.target.value)}
                            className="bg-slate-100 dark:bg-slate-800 border-none rounded text-[9px] font-bold uppercase px-2 py-1 cursor-pointer focus:ring-1 focus:ring-blue-500 dark:text-slate-300"
                          >
                            <option value="On">On</option>
                            <option value="Off">Off</option>
                          </select>
                        </td>

                        <td className="px-2 py-1.5 text-center">
                          <div className="w-2.5 h-2.5 rounded-full mx-auto shadow-sm" style={{ backgroundColor: item.cat_color }} />
                        </td>

                        <td className="px-3 py-1.5 text-center">
                          <button 
                            onClick={() => removeItem(item.uniqueId)} 
                            className="p-1.5 bg-gray-200 dark:bg-slate-800 rounded group-hover:opacity-100 transition-all hover:bg-gray-300 dark:hover:bg-slate-700"
                          >
                            <FaTrash size={10} className="text-slate-500 hover:text-red-500 transition-colors"/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
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
            <button onClick={onClose} className="px-6 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 tracking-widest transition-colors">Cancelar</button>
            <button className="px-10 py-3 !bg-blue-600 !text-white rounded-lg shadow-xl shadow-blue-500/30 hover:!bg-blue-700 active:scale-95 transition-all flex items-center gap-3 font-black text-[10px] tracking-[0.2em]"
              onClick={SavePlaylist}>
              <FaSave size={14} /> Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FillBlockModal;