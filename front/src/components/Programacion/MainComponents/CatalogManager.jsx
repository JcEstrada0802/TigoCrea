import React, { useState, useMemo, memo } from 'react';
import { FaFolder, FaFolderOpen, FaFilm, FaVideo, FaStepForward, FaSearch } from 'react-icons/fa';

// 1. Componente para el Item Final (El que se arrastra)
const DraggableSegment = memo(({ seg, catColor, prodTitulo, contNombre }) => (
  <div className="ml-4 border-l border-gray-300 dark:border-slate-600">
    <div 
      className="group flex items-center justify-between p-2 m-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded shadow-sm hover:border-blue-500 transition-all cursor-move active:scale-95"
      draggable
      onDragStart={(e) => {
        const data = { ...seg, cat_color: catColor, prod_titulo: prodTitulo, cont_nombre: contNombre };
        e.dataTransfer.setData("segmentData", JSON.stringify(data));
      }}
    >
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-0.5">
          <FaStepForward size={10}/>
          <span className="text-[9px] font-bold truncate opacity-60 uppercase">{seg.id_media}</span>
        </div>
        <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200 leading-tight truncate">{seg.titulo}</span>
        <span className="text-[9px] text-blue-600 dark:text-blue-400 font-mono mt-1">{seg.duracion_tc}</span>
      </div>
    </div>
  </div>
));

const CatalogManager = ({ datosCatalogo }) => {
  const [openItems, setOpenItems] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const toggle = (id) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 2. Filtrado optimizado: solo ocurre cuando escribís
  const filteredCatalog = useMemo(() => {
    if (!searchTerm) return datosCatalogo;
    // Lógica de filtrado profundo...
    return datosCatalogo.map(cat => ({
      ...cat,
      contenidos: cat.contenidos?.map(cont => ({
        ...cont,
        producciones: cont.producciones?.map(prod => ({
          ...prod,
          segmentos: prod.segmentos?.filter(s => 
            s.titulo.toLowerCase().includes(searchTerm) || 
            s.id_media.toLowerCase().includes(searchTerm)
          )
        })).filter(p => p.segmentos?.length > 0)
      })).filter(c => c.producciones?.length > 0)
    })).filter(cat => cat.contenidos?.length > 0);
  }, [searchTerm, datosCatalogo]);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 w-full overflow-hidden">
      <div className="p-4 bg-blue-700 dark:bg-blue-900 shadow-md">
        <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2"><FaFilm /> Catálogo</h4>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-400"><FaSearch size={12} /></span>
          <input 
            type="text" 
            placeholder="Buscar clip..." 
            className="w-full pl-8 pr-2 py-1.5 text-xs rounded border-none bg-white dark:bg-slate-800 dark:text-gray-200"
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {filteredCatalog.map(cat => (
          <div key={`cat-${cat.id}`} className="mb-1">
            <div className="flex items-center p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-800 rounded transition-colors" onClick={() => toggle(`cat-${cat.id}`)}>
              <span className="mr-2" style={{ color: cat.color }}>
                {openItems[`cat-${cat.id}`] ? <FaFolderOpen size={14}/> : <FaFolder size={14}/>}
              </span>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate flex-1">{cat.nombre}</span>
            </div>

            {/* Solo renderiza el contenido si está abierto o si hay una búsqueda activa */}
            {(openItems[`cat-${cat.id}`] || searchTerm) && cat.contenidos?.map(cont => (
              <div key={`cont-${cont.id}`} className="ml-4 border-l border-gray-300 dark:border-slate-600">
                <div className="flex items-center p-1.5 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-800 rounded" onClick={() => toggle(`cont-${cont.id}`)}>
                  <FaFilm className="text-gray-400 mr-2 ml-2" size={12}/>
                  <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 truncate">{cont.nombre}</span>
                </div>

                {(openItems[`cont-${cont.id}`] || searchTerm) && cont.producciones?.map(prod => (
                  <div key={`prod-${prod.id}`} className="ml-4 border-l border-gray-300 dark:border-slate-600">
                    <div className="flex items-center p-1.5 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-800 rounded" onClick={() => toggle(`prod-${prod.id}`)}>
                      <FaVideo className="text-blue-500 mr-2 ml-2" size={11}/>
                      <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 flex-1 truncate">{prod.titulo}</span>
                    </div>

                    {(openItems[`prod-${prod.id}`] || searchTerm) && prod.segmentos?.map(seg => (
                      <DraggableSegment 
                        key={seg.id} 
                        seg={seg} 
                        catColor={cat.color} 
                        prodTitulo={prod.titulo} 
                        contNombre={cont.nombre} 
                      />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CatalogManager;