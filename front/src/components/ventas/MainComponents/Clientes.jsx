import React, { useState } from 'react';
import { Search, Plus, User, Save, PenSquare, Phone, Mail, Trash2, ChevronRight } from 'lucide-react';

const mockClientes = [
  { id: 1, nombre: 'Acme Corp', email: 'acme@example.com', telefono: '+1 (555) 123-4567', status: 'Active', cliId: 'CLI-8492' },
  { id: 2, nombre: 'Globex Corporation', email: 'contact@globex.com', telefono: '+1 (555) 987-6543', status: 'Active', cliId: 'CLI-2231' },
  { id: 3, nombre: 'Initech Solutions', email: 'billing@initech.net', telefono: '+1 (555) 444-5555', status: 'Inactive', cliId: 'CLI-0092' },
];

const Clientes = () => {
  const [clientes, setClientes] = useState(mockClientes);
  const [selectedId, setSelectedId] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCliente = clientes.find(c => c.id === selectedId) || clientes[0];

  const toggleStatus = () => {
    if (!isEditing) return;
    setClientes(clientes.map(c => 
      c.id === selectedId ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c
    ));
  };

  return (
    <div className="flex h-full w-full bg-[#F3F4F9] overflow-hidden">
      
      {/* --- SIDEBAR IZQUIERDA --- */}
      <div className="w-[320px] bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Clientes</h2>
            <button className="!bg-[#001EB4] text-white p-2 rounded-md hover:!bg-blue-800 transition-colors">
              <Plus size={20} />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar clientes..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-6">
          {clientes.filter(c => c.nombre.toLowerCase().includes(searchTerm.toLowerCase())).map((cliente) => (
            <div 
              key={cliente.id}
              onClick={() => { setSelectedId(cliente.id); setIsEditing(false); }}
              className={`
                flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all
                ${selectedId === cliente.id 
                  ? 'border-[#001EB4] bg-blue-50/30' 
                  : 'border-transparent hover:bg-gray-50'}
              `}
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-4 text-gray-500">
                <User size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-800">{cliente.nombre}</h3>
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full mr-2 ${cliente.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-[11px] text-gray-500 uppercase tracking-wider">{cliente.status}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          ))}
        </div>
      </div>

      {/* --- CONTENIDO DERECHO --- */}
      <div className="flex-1 min-w-0 overflow-y-auto bg-gray-50">
        {/* Header Superior */}
        <div className="mx-auto p-8 max-w-5xl flex justify-between items-start">
          <div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedCliente.nombre}</h1>
              <p className="text-gray-500 mt-1">Editar Cliente</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="w-45 flex items-center gap-2 px-6 py-2 !bg-[#001EB4] text-white rounded-lg text-sm font-semibold hover:!bg-blue-800 transition-all shadow-sm"
          >
            {isEditing ? <><Save size={18} /> Save Changes</> : <><PenSquare size={18} /> Editar Cliente</>}
          </button>
        </div>

        {/* Formulario Principal */}
        <div className="px-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Información General</h2>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2">Nombre de la compañia</label>
                  <input 
                    disabled={!isEditing}
                    type="text" 
                    defaultValue={selectedCliente.nombre}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2">Email</label>
                  <input 
                    disabled={!isEditing}
                    type="email" 
                    defaultValue={selectedCliente.email}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2">Teléfono</label>
                  <input 
                    disabled={!isEditing}
                    type="text" 
                    defaultValue={selectedCliente.telefono}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2">Estado</label>
                  <div className="flex items-center gap-4 mt-2">
                    <div 
                      onClick={toggleStatus}
                      className={`
                        relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer
                        ${selectedCliente.status === 'Active' ? '!bg-[#001EB4]' : '!bg-gray-300'}
                        ${!isEditing && 'opacity-50 cursor-not-allowed'}
                      `}
                    >
                      <div className={`
                        absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 flex items-center justify-center
                        ${selectedCliente.status === 'Active' ? 'translate-x-6' : 'translate-x-0'}
                      `}>
                        {selectedCliente.status === 'Active' && <div className="w-2 h-2 rounded-full scale-50" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-8 mt-3 rounded-2xl border border-red-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-red-800">Danger Zone</h2>
              <p className="text-sm text-red-600 mt-1">Borrar permanentemente el cliente y data asociada.</p>
            </div>
            <button 
              className={`flex items-center gap-2 px-6 py-3 text-white rounded-lg font-bold hover:!bg-red-700 transition-all shadow-md text-sm
                          ${!isEditing ? '!bg-red-400':'!bg-red-600'}`}
              onClick={()=>{}}
              disabled={!isEditing}
            >
              <Trash2 size={18} /> Eliminar Agencia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clientes;