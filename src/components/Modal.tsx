import React from 'react';
import { CloseIcon } from './icons';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in-fast p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative border border-slate-700 animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
        style={{animationDuration: '0.3s'}}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white hover:bg-slate-700 rounded-full p-1 transition"
          >
            <CloseIcon className="w-7 h-7" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;