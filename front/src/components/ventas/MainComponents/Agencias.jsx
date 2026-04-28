import React, { useState } from 'react';
import { Search, Plus, Trash2, Save, X, ChevronRight, PenSquare } from 'lucide-react';

const mockAgencias = [
  { id: 1, nombre: 'Nexus Global Media', color: '#FF5A5F', status: 'Active', contacto: 'Juan Perez', telefono: '5555-0123' },
  { id: 2, nombre: 'Elevation Partners', color: '#00A699', status: 'Active', contacto: 'Maria Garcia', telefono: '5555-0456' },
  { id: 3, nombre: 'Legacy Creative', color: '#767676', status: 'Inactive', contacto: 'Luis Rodriguez', telefono: '5555-0789' },
  { id: 4, nombre: 'Velocity Brand Works', color: '#FC642D', status: 'Active', contacto: 'Ana Morales', telefono: '5555-1011' },
];

const Agencias = () => {
  const [agencias, setAgencias] = useState(mockAgencias);
  const [selectedId, setSelectedId] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedAgencia = agencias.find(a => a.id === selectedId) || agencias[0];

  const EliminarAgencia = () =>{
    const nuevasAgencias = agencias.filter(agencia => agencia.id !== selectedId);
    setAgencias(nuevasAgencias);
    if (nuevasAgencias.length > 0) {
      setSelectedId(nuevasAgencias[0].id);
    } else {
      setSelectedId(null);
    } 
    setIsEditing(false); // Salir del modo edición
  }

  const toggleStatus = () => {
    if (!isEditing) return;

    const nuevasAgencias = agencias.map(agencia => {
      if (agencia.id === selectedId) {
        return {
          ...agencia,
          status: agencia.status === 'Active' ? 'Inactive' : 'Active'
        };
      }
      return agencia;
    });
    
    setAgencias(nuevasAgencias);
  };

  return (
    <div className="flex h-full w-full bg-[#F8FAFC] overflow-hidden">
      
      {/* --- SIDEBAR IZQUIERDA (30%) --- */}
      <div className="w-[320px] bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Agencias</h2>
            <button className="!bg-[#001EB4] text-white p-2 rounded-md hover:!bg-blue-800 transition-colors">
              <Plus size={20} />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar agencias..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-6">
          {agencias.filter(a => a.nombre.toLowerCase().includes(searchTerm.toLowerCase())).map((agencia) => (
            <div 
              key={agencia.id}
              onClick={() => { setSelectedId(agencia.id); setIsEditing(false); }}
              className={`
                flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all
                ${selectedId === agencia.id 
                  ? 'border-[#001EB4] bg-blue-50/30' 
                  : 'border-gray-100 hover:border-gray-300 bg-white shadow-sm'}
              `}
            >
              <div 
                className="w-10 h-10 rounded-lg mr-4 shadow-inner" 
                style={{ backgroundColor: agencia.color }}
              />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-800">{agencia.nombre}</h3>
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full mr-2 ${agencia.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-[11px] text-gray-500 uppercase tracking-wider">{agencia.status}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          ))}
        </div>
      </div>

      {/* --- CONTENIDO DERECHO (70%) --- */}
      <div className="flex-1 min-w-0 overflow-y-auto bg-gray-50">
        <div className="mx-auto p-8 max-w-5xl">
          {/* Header del Formulario */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedAgencia.nombre}</h1>
              <p className="text-gray-500 mt-1">Editar Agencia</p>
            </div>
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:!bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button 
                    className="flex items-center gap-2 px-6 py-2 !bg-[#001EB4] text-white rounded-lg text-sm font-semibold hover:!bg-blue-800 shadow-md transition-all"
                    onClick={() => setIsEditing(false)}
                  >
                    <Save size={18} /> Guardar Cambios
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-45 flex items-center gap-2 px-8 py-2 !bg-[#001EB4] text-white rounded-lg text-sm font-semibold hover:!bg-blue-800 transition-all shadow-md"
                >
                  <>
                   <PenSquare size={18} />Editar agencia
                  </>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Card: General Information */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="border-b border-gray-100 mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-8">Información General</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2">Nombre de la Agencia</label>
                  <input 
                    disabled={!isEditing}
                    type="text" 
                    defaultValue={selectedAgencia.nombre}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2">Color</label>
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg border border-gray-200 shadow-sm" style={{ backgroundColor: selectedAgencia.color }} />
                    <input 
                      disabled={!isEditing}
                      type="text" 
                      defaultValue={selectedAgencia.color}
                      className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2">Estado</p>
                    <p className="text-xs text-gray-500">Activar o desactivar agencia temporalmente</p>
                  </div>
                 <div 
                    onClick={toggleStatus}
                    className={`
                      relative w-14 h-7 rounded-full transition-all duration-300 cursor-pointer
                      ${selectedAgencia.status === 'Active' ? '!bg-[#001EB4]' : '!bg-gray-300'}
                      ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
                    `}
                  >
                    <div className={`
                      absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-300
                      ${selectedAgencia.status === 'Active' ? 'translate-x-7 ' : 'translate-x-0'}
                    `} />
                </div>
                </div>
              </div>
            </div>

            {/* Card: Contacto */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Contacto:</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2">Nombre</label>
                  <input 
                    disabled={!isEditing}
                    placeholder="Nombre del contacto"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2">Teléfono</label>
                  <input 
                    disabled={!isEditing}
                    placeholder="Número de teléfono"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                  />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 p-8 rounded-2xl border border-red-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-red-800">Danger Zone</h2>
                <p className="text-sm text-red-600 mt-1">Borrar permanentemente la Agencia y data asociada.</p>
              </div>
              <button 
                className={`flex items-center gap-2 px-6 py-3 text-white rounded-lg font-bold hover:!bg-red-700 transition-all shadow-md text-sm
                            ${!isEditing ? '!bg-red-400':'!bg-red-600'}`}
                onClick={EliminarAgencia}
                disabled={!isEditing}
              >
                <Trash2 size={18} /> Eliminar Agencia
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agencias;