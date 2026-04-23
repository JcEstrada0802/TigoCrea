
import React, { useState } from 'react'
import WorkingOnIt from './../../../public/WorkingOnIt.gif'


function PerfilMain() {
  return (
    <div className='w-full h-full flex justify-center items-center'>
      {/* 2. Lo usas en el src de un tag img */}
      <img src={WorkingOnIt} alt="Mi perfil animado" className="w-100 h-80" />
    </div>
  )
}

export default PerfilMain