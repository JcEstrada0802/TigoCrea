import React from 'react';

const variants = {
  // Estilo "Info" azul: bg claro, acento azul intenso
  info: {
    // Fondo claro con borde redondeado y acento izquierdo azul
    //
    bg: '!bg-blue-50 dark:!bg-slate-800',
    border: '!border-blue-600',
    text: '!text-slate-800 dark:!text-blue-100',
    icon: 'text-blue-600',
    // Botones con estilo info
    btnConfirm: '!bg-blue-600 hover:!bg-blue-700',
    btnCancel: '!border-blue-600 !text-blue-600 hover:!bg-blue-100 dark:hover:!bg-slate-700'
  },
  // Estilo "Warning" amarillo: bg claro, acento amarillo/naranja
  warning: {
    bg: '!bg-yellow-50 dark:!bg-slate-800',
    border: '!border-yellow-500',
    text: '!text-slate-800 dark:!text-yellow-100',
    icon: 'text-yellow-600',
    // Botones con estilo warning
    btnConfirm: '!bg-yellow-600 hover:!bg-yellow-700',
    btnCancel: '!border-yellow-600 !text-yellow-600 hover:!bg-yellow-100 dark:hover:!bg-slate-700'
  },
};

const ConfirmationAlert = ({ message, tipo = 'info', onConfirm, onCancel }) => {
  if (!message) return null;

  const style = variants[tipo] || variants.info;

  return (
    <div className="fixed top-6 left-0 right-0 z-[10001] flex justify-center px-4 pointer-events-none">
      <div
        role="alert"
        className={`${style.bg} border-l-4 ${style.border} p-3 rounded-xl shadow-2xl flex flex-col gap-2 max-w-sm w-full pointer-events-auto backdrop-blur-md border border-white/20 animate-in fade-in slide-in-from-top-2 duration-300`}
      >
        {/* Nivel 1: Mensaje más compacto */}
        <div className="flex items-start gap-2.5">
          <div className={`${style.icon} mt-0.5 flex-shrink-0`}>
            <svg stroke="currentColor" viewBox="0 0 24 24" fill="none" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </div>
          <div className={`${style.text} flex-1`}>
            <p className="text-[12px] font-bold leading-tight">
              {message}
            </p>
          </div>
        </div>

        {/* Nivel 2: Botones pequeños y estilizados */}
        <div className="flex justify-end items-center gap-2 mt-1">
          <button
            onClick={onCancel}
            className={`!px-3 !py-1 text-[9px] font-black tracking-widest rounded-lg transition-all ${style.btnCancel}`}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`!px-3 !py-1 text-[9px] font-black tracking-widest !text-white rounded-lg shadow-md transition-all ${style.btnConfirm}`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationAlert;