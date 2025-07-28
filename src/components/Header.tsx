import React from 'react';
import { BarrelIcon, LogoutIcon, LoginIcon } from './icons';
import { Session } from './../types';

interface HeaderProps {
    session: Session | null;
    onLogout: () => void;
    onLogin: () => void;
}

const Header: React.FC<HeaderProps> = ({ session, onLogout, onLogin }) => {
  return (
    <header className="bg-slate-900/60 backdrop-blur-xl shadow-lg sticky top-0 z-20 border-b border-slate-700/50">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
            <BarrelIcon className="w-10 h-10 text-cyan-400 mr-4" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-cyan-400 tracking-tight">
            My Pinter Assistant
            </h1>
        </div>

        {session ? (
            <button
                onClick={onLogout}
                className="flex items-center gap-2 bg-slate-700/80 hover:bg-red-500/80 text-slate-200 hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 border border-slate-600 hover:border-red-500"
                title="Logout"
            >
                <LogoutIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
            </button>
        ) : (
            <button
                onClick={onLogin}
                className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                title="Login or Sign Up"
            >
                <LoginIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Login / Sign Up</span>
            </button>
        )}
      </div>
    </header>
  );
};

export default Header;
