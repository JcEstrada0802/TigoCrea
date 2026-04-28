import React, { useState } from 'react';
// Importamos los iconos exactos que ya usás en tu Sidebar
import { Package, Users, Building, FileText, BarChart3 } from 'lucide-react';

const tabs = [
  { id: 'Agencias', label: 'Agencias', icon: Building }, // Usamos Building para Agencias
  { id: 'Clientes', label: 'Clientes', icon: Users },   // Icono de usuarios
  { id: 'Paquetes', label: 'Paquetes', icon: Package }, // Icono de caja/paquete
  { id: 'Pautas', label: 'Pautas', icon: FileText },   // Icono de documento
  { id: 'Consolidado', label: 'Consolidado', icon: BarChart3}
];

function TabBar({ setter }) {
  const [activeTab, setActiveTab] = useState('Agencias');

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setter(tabId);
  };

  return (
    <div className="w-full border-b border-gray-100 bg-white">
      <nav className="flex space-x-3 justify-center items-center py-4 h-full" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                flex items-center gap-2.5 py-2.5 px-5 rounded-lg font-semibold text-sm transition-all duration-200
                ${isActive 
                  ? '!bg-[#001EB4] text-white shadow-md' // ESTADO ACTIVO: Fondo Azul Tigo, Texto Blanco
                  : 'bg-gray-50 text-gray-700 hover:!bg-blue-[#001EB4] hover:!text-[#44C8F5] hover:shadow-md' // HOVER: Se vuelve Azul Tigo
                }
              `}
            >
              <Icon className={`size-5 ${isActive ? 'text-white' : 'text-blue-[#44C8F5]'}`} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default TabBar;