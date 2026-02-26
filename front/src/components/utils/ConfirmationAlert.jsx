import React from 'react';

const variants = {
  info: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    border: 'border-blue-500 dark:border-blue-700',
    text: 'text-blue-900 dark:text-blue-100',
    icon: 'text-blue-600',
    btnConfirm: 'bg-blue-600 hover:bg-blue-700',
    btnCancel: 'border-blue-600 text-blue-600 hover:bg-blue-200'
  },
  warning: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    border: 'border-yellow-500 dark:border-yellow-700',
    text: 'text-yellow-900 dark:text-yellow-100',
    icon: 'text-yellow-600',
    btnConfirm: 'bg-yellow-600 hover:bg-yellow-700',
    btnCancel: 'border-yellow-600 text-yellow-600 hover:bg-yellow-200'
  },
};

const ConfirmationAlert = ({ message, tipo = 'info', onConfirm, onCancel }) => {

  if (!message) return null;

  const style = variants[tipo] || variants.info;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        role="alert"
        className={`${style.bg} border-l-4 ${style.border} ${style.text} p-4 rounded-lg shadow-2xl flex flex-col max-w-md w-full transition duration-300 ease-in-out scale-100`}
      >
        <div className="flex items-center mb-4">
          <svg
            stroke="currentColor"
            viewBox="0 0 24 24"
            fill="none"
            className={`h-6 w-6 flex-shrink-0 mr-3 ${style.icon}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-sm font-bold uppercase tracking-wider">Confirmar Acción</p>
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold">{message}</p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className={`px-4 py-1.5 text-xs font-bold rounded-full border-2 transition-colors ${style.btnCancel}`}
          >
            CANCELAR
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-1.5 text-xs font-bold rounded-full text-white shadow-md transition-colors ${style.btnConfirm}`}
          >
            CONFIRMAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationAlert;