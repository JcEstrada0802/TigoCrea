import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Save, Copy, List, ChevronRight } from 'lucide-react';

const mockPaquetes = [
  { 
    id: 1, 
    nombre: 'Plan Mundialista 2026', 
    status: 'Activo', 
    items: [
      { id: 101, tipo: 'Spots (30s)', cantidad: 100, precio: 1000 },
      { id: 102, tipo: 'Cintillos', cantidad: 50, precio: 500 }
    ],
    lastModified: 'Hoy'
  },
  { id: 2, nombre: 'Apertura 2024 Base', status: 'Activo', items: [], lastModified: '12 Oct' },
  { id: 3, nombre: 'Paquete Digital Plus', status: 'Activo', items: [], lastModified: '05 Oct' },
];

const Paquetes = () => {
  const [paquetes, setPaquetes] = useState(mockPaquetes);
  const [selectedId, setSelectedId] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedPaquete = paquetes.find(p => p.id === selectedId) || paquetes[0];

  // Función para agregar una fila vacía al paquete actual
  const agregarItem = () => {
    const nuevoItem = { id: Date.now(), tipo: 'Spots (30s)', cantidad: 1, precio: 0 };
    setPaquetes(paquetes.map(p => 
      p.id === selectedId ? { ...p, items: [...p.items, nuevoItem] } : p
    ));
  };

  // Función para actualizar valores de un ítem específico
  const actualizarItem = (itemId, campo, valor) => {
    setPaquetes(paquetes.map(p => {
      if (p.id === selectedId) {
        return {
          ...p,
          items: p.items.map(item => 
            item.id === itemId ? { ...item, [campo]: valor } : item
          )
        };
      }
      return p;
    }));
  };

  // Función para eliminar un ítem
  const eliminarItem = (itemId) => {
    setPaquetes(paquetes.map(p => 
      p.id === selectedId ? { ...p, items: p.items.filter(item => item.id !== itemId) } : p
    ));
  };

  // Cálculo del gran total
  const totalGeneral = selectedPaquete.items.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);

  return (
    <div className="flex h-full w-full bg-[#F8FAFC] overflow-hidden text-gray-800">
      
      {/* --- SIDEBAR IZQUIERDA --- */}
      <div className="w-[320px] bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Paquetes</h2>
            <button className="!bg-[#001EB4] text-white p-2 rounded-md hover:!bg-blue-800 transition-all">
              <Plus size={20} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Filtrar paquetes..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-6">
          {paquetes.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
            <div 
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedId === p.id ? 'border-[#001EB4] bg-blue-50/30' : 'border-gray-100 bg-white shadow-sm'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-bold truncate max-w-[180px]">{p.nombre}</h3>
                <span className="text-[10px] bg-blue-100 text-[#001EB4] px-2 py-0.5 rounded font-bold uppercase">{p.status}</span>
              </div>
              <div className="flex items-center text-gray-500 text-[11px] mb-3">
                <List size={12} className="mr-1" /> {p.items.length} items
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[10px] text-gray-400">Ult. modif: {p.lastModified}</span>
                <span className="font-bold text-sm">Q {p.items.reduce((acc, i) => acc + (i.cantidad * i.precio), 0).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- CONTENIDO DERECHO --- */}
      <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
        {/* Header fijo */}
        <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-2xl font-bold">{selectedPaquete.nombre}</h1>
          <div className="flex gap-3">
            <button className="w-45 flex items-center gap-2 px-4 py-2 !bg-[#001EB4] text-white rounded-lg text-sm font-bold hover:!bg-blue-800">
              <Save size={18} /> Editar template
            </button>
          </div>
        </div>

        <div className="p-8 max-w-6xl w-full mx-auto space-y-8 flex-1">
          <section>
            <h2 className="text-lg font-bold mb-6">Estructura del Paquete</h2>
            
            {/* Headers de la tabla dinámica */}
            <div className="flex gap-4 px-6 mb-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <div className="text-left">Tipo de Elemento</div>
              <div>Cantidad</div>
              <div>Precio Unitario</div>
              <div>Subtotal</div>
              <div></div>
            </div>

            {/* Filas dinámicas */}
            <div className="space-y-4">
              {selectedPaquete.items.map((item) => (
                <div key={item.id} className="flex gap-4 px-6 mb-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <select 
                    value={item.tipo}
                    onChange={(e) => actualizarItem(item.id, 'tipo', e.target.value)}
                    className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Spots (30s)</option>
                    <option>Cintillos</option>
                    <option>Cortinillas</option>
                    <option>Menciones</option>
                  </select>

                  <input 
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => actualizarItem(item.id, 'cantidad', parseInt(e.target.value) || 0)}
                    className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm text-center focus:outline-none"
                  />

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Q</span>
                    <input 
                      type="number"
                      value={item.precio}
                      onChange={(e) => actualizarItem(item.id, 'precio', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-right focus:outline-none"
                    />
                  </div>

                  <div className="text-right font-bold text-sm pr-2">
                    Q {(item.cantidad * item.precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>

                  <button onClick={() => eliminarItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              {/* Botón Agregar Item */}
              <button 
                onClick={agregarItem}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-[#001EB4] font-bold text-sm hover:border-[#001EB4] hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> AGREGAR ITEM
              </button>
            </div>
          </section>

          {/* Footer de Resumen */}
          <div className="bg-[#E9F0FF] p-8 rounded-2xl flex justify-between items-center border border-blue-100">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Resumen</p>
              <h3 className="text-xl font-bold text-gray-800">Valor Total del Paquete</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-[#001EB4] mb-1">Moneda Base: GTQ</p>
              <h2 className="text-4xl font-black text-[#001EB4]">Q {totalGeneral.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paquetes;