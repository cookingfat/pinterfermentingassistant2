import React, { useState, useEffect } from 'react';
import { CustomBrew } from '../types';
import Modal from './Modal';

interface CustomBrewFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<CustomBrew, 'id' | 'user_id' | 'created_at'> | CustomBrew) => void;
    initialData?: CustomBrew | null;
}

const GRADIENT_OPTIONS = [
    { id: 'gradient-1', class: 'bg-gradient-to-br from-purple-500 to-indigo-600' },
    { id: 'gradient-2', class: 'bg-gradient-to-br from-green-400 to-teal-500' },
    { id: 'gradient-3', class: 'bg-gradient-to-br from-yellow-400 to-orange-500' },
    { id: 'gradient-4', class: 'bg-gradient-to-br from-rose-500 to-pink-600' },
    { id: 'gradient-5', class: 'bg-gradient-to-br from-slate-700 to-slate-900' },
];

const CustomBrewFormModal: React.FC<CustomBrewFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [style, setStyle] = useState('');
    const [abv, setAbv] = useState('5.0');
    const [brewingDays, setBrewingDays] = useState('7');
    const [conditioningDays, setConditioningDays] = useState('7');
    const [backgroundGradient, setBackgroundGradient] = useState(GRADIENT_OPTIONS[0].id);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setDescription(initialData.description || '');
                setStyle(initialData.style || '');
                setAbv(String(initialData.abv));
                setBrewingDays(String(initialData.brewing_days));
                setConditioningDays(String(initialData.conditioning_days));
                setBackgroundGradient(initialData.background_gradient);
            } else {
                // Reset to defaults for new entry
                setName('');
                setDescription('');
                setStyle('');
                setAbv('5.0');
                setBrewingDays('7');
                setConditioningDays('7');
                setBackgroundGradient(GRADIENT_OPTIONS[0].id);
            }
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const brewData = {
            name,
            description,
            style,
            abv: Number(abv),
            brewing_days: Number(brewingDays),
            conditioning_days: Number(conditioningDays),
            background_gradient: backgroundGradient,
        };
        
        if (initialData) {
            onSubmit({ ...initialData, ...brewData });
        } else {
            onSubmit(brewData);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Custom Brew' : 'Add New Custom Brew'}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="brew-name" className="block text-base font-medium text-slate-300 mb-1">Name of Beer*</label>
                    <input id="brew-name" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., 'Sunset Haze'" className="w-full text-lg bg-slate-700/50 border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="brew-style" className="block text-base font-medium text-slate-300 mb-1">Style</label>
                        <input id="brew-style" type="text" value={style} onChange={e => setStyle(e.target.value)} placeholder="e.g., 'NEIPA'" className="w-full text-lg bg-slate-700/50 border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" />
                    </div>
                    <div>
                        <label htmlFor="brew-abv" className="block text-base font-medium text-slate-300 mb-1">ABV (%)*</label>
                        <input id="brew-abv" type="number" value={abv} onChange={e => setAbv(e.target.value)} required step="0.1" min="0" max="20" className="w-full text-lg bg-slate-700/50 border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" />
                    </div>
                </div>

                <div>
                    <label htmlFor="brew-desc" className="block text-base font-medium text-slate-300 mb-1">Description</label>
                    <textarea id="brew-desc" value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Tasting notes, etc." className="w-full text-lg bg-slate-700/50 border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="brewing-days" className="block text-base font-medium text-slate-300 mb-1">Brewing Days*</label>
                        <input id="brewing-days" type="number" value={brewingDays} onChange={e => setBrewingDays(e.target.value)} required min="1" className="w-full text-lg bg-slate-700/50 border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" />
                    </div>
                    <div>
                        <label htmlFor="conditioning-days" className="block text-base font-medium text-slate-300 mb-1">Conditioning Days*</label>
                        <input id="conditioning-days" type="number" value={conditioningDays} onChange={e => setConditioningDays(e.target.value)} required min="1" className="w-full text-lg bg-slate-700/50 border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" />
                    </div>
                </div>

                <div>
                    <label className="block text-base font-medium text-slate-300 mb-2">Background Gradient</label>
                    <div className="flex justify-around items-center gap-2">
                        {GRADIENT_OPTIONS.map(opt => (
                            <button
                                type="button"
                                key={opt.id}
                                onClick={() => setBackgroundGradient(opt.id)}
                                className={`w-full h-12 rounded-lg cursor-pointer transition-all duration-200 border-2 ${opt.class} ${backgroundGradient === opt.id ? 'ring-4 ring-offset-2 ring-offset-slate-800 ring-cyan-400 border-cyan-400' : 'border-slate-600 hover:border-slate-400'}`}
                                aria-label={`Select gradient ${opt.id}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={onClose} className="py-2.5 px-6 bg-slate-600 text-white text-base font-semibold rounded-lg hover:bg-slate-500 transition">
                        Cancel
                    </button>
                    <button type="submit" className="py-2.5 px-6 bg-cyan-500 text-slate-900 text-base font-bold rounded-lg hover:bg-cyan-400 transition">
                        {initialData ? 'Save Changes' : 'Add Custom Brew'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CustomBrewFormModal;
