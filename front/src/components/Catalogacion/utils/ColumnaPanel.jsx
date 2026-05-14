import React from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

export default function ColumnaPanel({ title, items, onAdd, onEdit, onDelete, onSelect}) {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Título de la Columna */}
      <h3 className="text-center text-sm font-bold text-indigo-900 tracking-wider mb-2 uppercase">
        {title}
      </h3>

      {/* Contenedor de la Caja */}
      <div className="border-2 border-indigo-900 rounded-lg flex flex-col h-full max-h-[80vh] bg-gray-50 shadow-sm">
        {/* Barra de Iconos */}
        <div className="flex justify-end items-center space-x-2 p-2 border-b !border-gray-300">
          <button 
            onClick={onAdd} 
            className="p-1.5 bg-blue-500 text-gray rounded-full hover:bg-blue-600 transition-colors"
            aria-label="Agregar"
          >
            <PlusIcon className="h-4 w-4" /> 
          </button>
          <button 
            onClick={onEdit} 
            className="p-1.5 bg-blue-500 text-gray rounded-full hover:bg-blue-600 transition-colors"
            aria-label="Editar"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button 
            onClick={onDelete} 
            className="p-1.5 bg-blue-500 text-gray rounded-full hover:bg-blue-600 transition-colors"
            aria-label="Eliminar"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Lista de Contenido (Scrollable) */}
        <div className="flex-grow overflow-y-auto p-3">
          {items.length === 0 ? (
            <p className="text-gray-400 text-sm text-center pt-4">No hay contenido</p>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id} 
                  onClick={() => {
                    // Buscamos el checkbox por ID y simulamos el click para que cambie
                    const cb = document.getElementById(`${title}-${item.id}`);
                    if (cb) cb.click();
                  }}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-200 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    id={`${title}-${item.id}`}
                    onClick={(e) => e.stopPropagation()} 
                    onChange={(e) => {
                      onSelect(item.id, e.target.checked); 
                    }}
                    className="h-4 w-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <div
                    className="w-8 h-4 rounded-sm border border-gray-300"
                    style={{ backgroundColor: item.color }}
                    title={item.color}
                  ></div>
                  <label 
                    htmlFor={`${title}-${item.id}`} 
                    className="text-sm text-indigo-900 select-none cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.label}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}