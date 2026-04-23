import React from 'react';
import { useState } from 'react';
import Agencias from './MainComponents/Agencias';
import Clientes from './MainComponents/Clientes';
import Paquetes from './MainComponents/Paquetes';
import Pautas from './MainComponents/Pautas';
import TabBar from './MainComponents/TabBar';

function VentasMain() {
    const [Display, setDisplay] = useState('Agencias');
  return (
    <div className='w-full h-full'>
        <TabBar setter={setDisplay} activeTab={Display} />
        {Display==='Agencias' && (<Agencias/>)}
        {Display==='Clientes' && (<Clientes/>)}
        {Display==='Paquetes' && (<Paquetes/>)}
        {Display==='Pautas' && (<Pautas/>)}
    </div>
  )
}

export default VentasMain