import React from 'react';
import { CoffeeIcon } from './icons';

const Footer = () => {
  return (
    <footer className="text-center p-6 text-base text-slate-500 border-t border-slate-800 mt-12">
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <p className="text-slate-400 mb-3">
            If you found the app helpful and wish to support me, feel free to buy me a coffee.
          </p>
          <a
            href="https://buymeacoffee.com/peterharpham"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Buy me a coffee"
            title="Buy me a coffee"
            className="inline-block bg-slate-800 hover:bg-yellow-500/20 text-yellow-400 hover:text-yellow-300 transition-all p-3 rounded-full group border border-slate-700 hover:border-yellow-600 duration-300"
          >
            <CoffeeIcon className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />
          </a>
        </div>
        
        <div className="pt-6">
          <p>Pinter Fermentation Assistant - Brew with confidence.</p>
          <p>Built by Peter Harpham - Copyright 2025.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
