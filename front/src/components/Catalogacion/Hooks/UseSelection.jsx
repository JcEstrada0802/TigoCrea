import { useState } from 'react';

export function useSelection() {
  const [selected, setSelected] = useState([]);
  const toggle = (id, checked) => {
    setSelected(prev => {
        if (checked) {
            return prev.includes(id) ? prev : [...prev, id]; 
        } else {
            return prev.filter(v => v !== id);
        }
    });
  }
  return [selected, toggle];
}