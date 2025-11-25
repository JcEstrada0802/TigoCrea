import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

const ClickablePointerSensor = class extends PointerSensor {
    static activators = [
        {
            eventName: 'onPointerDown',
            handler: ({ nativeEvent: event }) => {
                // Si el clic es en un botón o su ancestro más cercano es un botón, 
                // NO activamos el arrastre (retornamos false).
                // dnd-kit ofrece un método utilitario para esto.
                return !event.target.closest('button');
            },
        },
    ];
};


export const ColumnsList = ({ columns, onOrderChange }) => {
  const sensors = useSensors(
    useSensor(ClickablePointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = columns.findIndex((item) => item.id === active.id);
      const newIndex = columns.findIndex((item) => item.id === over.id);
      const newOrderedColumns = arrayMove(columns, oldIndex, newIndex);
      onOrderChange(newOrderedColumns);
    }
  };


  const handleRemove = (columnId, columnName) => (event) => {
      event.stopPropagation();

      const newOrderedColumns = columns.filter(column => column.id !== columnId);
      onOrderChange(newOrderedColumns);

      console.log(`Columna eliminada: ${columnName}`);
  };

  return (
    <div className="p-4 max-w-xs mx-auto">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Columns</h3>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={columns} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 mt-3">
            {columns.map(column => (
              <SortableItem key={column.id} id={column.id}>
                <div className="flex items-center justify-between p-2.5 bg-slate-100 rounded-md text-sm font-medium text-slate-700">
                  <span>{column.name}</span>
                  <button
                    onClick={handleRemove(column.id, column.name)}
                    className="p-1 ml-3 rounded-full text-slate-500 hover:text-red-600 hover:bg-red-100 transition-colors focus:outline-none"
                    aria-label={`Eliminar columna ${column.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default ColumnsList;