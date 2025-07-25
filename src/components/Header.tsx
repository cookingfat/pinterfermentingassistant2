import React from 'react';
import { BarrelIcon } from './icons';

const Header = () => {
  return (
    <header className="bg-slate-900/60 backdrop-blur-xl shadow-lg sticky top-0 z-20 border-b border-slate-700/50">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-center">
        <BarrelIcon className="w-10 h-10 text-cyan-400 mr-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-cyan-400 tracking-tight">
          My Pinter Assistant
        </h1>
      </div>
    </header>
  );
};

export default Header;