import React from 'react';
import { CustomBrew } from '../types';
import { PencilIcon, TrashIcon } from './icons';

interface CustomBrewCardProps {
    brew: CustomBrew;
    onEdit: (brew: CustomBrew) => void;
    onDelete: (brew: CustomBrew) => void;
}

const CustomBrewCard: React.FC<CustomBrewCardProps> = ({ brew, onEdit, onDelete }) => {
    
    const backgroundClasses: {[key: string]: string} = {
        'gradient-1': 'from-purple-500 to-indigo-600',
        'gradient-2': 'from-green-400 to-teal-500',
        'gradient-3': 'from-yellow-400 to-orange-500',
        'gradient-4': 'from-rose-500 to-pink-600',
        'gradient-5': 'from-slate-700 to-slate-900',
    };
    
    const gradient = backgroundClasses[brew.background_gradient] || backgroundClasses['gradient-5'];

    return (
        <div className={`relative rounded-2xl shadow-xl overflow-hidden p-6 flex flex-col h-72 bg-gradient-to-br ${gradient} border border-slate-700`}>
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                 <button onClick={() => onEdit(brew)} className="p-2 bg-black/30 rounded-full text-slate-200 hover:bg-white/30 hover:text-white transition-colors duration-200" title="Edit Brew">
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onDelete(brew)} className="p-2 bg-black/30 rounded-full text-slate-200 hover:bg-red-500 hover:text-white transition-colors duration-200" title="Delete Brew">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
            
            <div className="flex-grow flex flex-col justify-between">
                <div>
                    <h3 className="text-3xl font-bold text-white shadow-black [text-shadow:_1px_1px_4px_var(--tw-shadow-color)] line-clamp-2">{brew.name}</h3>
                    <p className="text-lg font-medium text-white/80 shadow-black [text-shadow:_1px_1px_2px_var(--tw-shadow-color)]">{brew.style || 'Custom Style'}</p>
                </div>

                <div className="mt-auto space-y-3">
                    <div className="flex justify-between items-baseline bg-black/20 backdrop-blur-sm rounded-lg py-2 px-3">
                        <span className="text-base font-semibold text-white/90">ABV</span>
                        <span className="text-2xl font-bold text-white">{brew.abv.toFixed(1)}%</span>
                    </div>
                     <div className="flex justify-around items-center text-center bg-black/20 backdrop-blur-sm rounded-lg py-2 px-3">
                        <div>
                           <span className="text-2xl font-bold text-white">{brew.brewing_days}</span>
                           <span className="block text-xs font-semibold uppercase text-white/80">Brew Days</span>
                        </div>
                         <div>
                           <span className="text-2xl font-bold text-white">{brew.conditioning_days}</span>
                           <span className="block text-xs font-semibold uppercase text-white/80">Condition Days</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomBrewCard;
