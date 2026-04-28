import React from 'react';
import { useState } from 'react';
import Agencias from './MainComponents/Agencias';
import Clientes from './MainComponents/Clientes';
import Paquetes from './MainComponents/Paquetes';
import Pautas from './MainComponents/Pautas';
import TabBar from './MainComponents/TabBar';
import Consolidado from './MainComponents/Consolidado';

function VentasMain() {
    const [Display, setDisplay] = useState('Agencias');
  return (
    <div className='w-full h-screen flex flex-col overflow-hidden bg-[#F8FAFC]'>
        <TabBar setter={setDisplay} activeTab={Display} />
        <div className='flex-1 overflow-hidden'>
          {Display==='Agencias' && (<Agencias/>)}
          {Display==='Clientes' && (<Clientes/>)}
          {Display==='Paquetes' && (<Paquetes/>)}
          {Display==='Pautas' && (<Pautas/>)}
          {Display==='Consolidado' && (<Consolidado/>)}
        </div>
    </div>
  )
}

export default VentasMain