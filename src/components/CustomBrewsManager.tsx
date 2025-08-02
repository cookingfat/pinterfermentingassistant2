import React, { useState } from 'react';
import { CustomBrew } from '../types';
import { AddIcon, BeerIcon, WarningIcon } from './icons';
import CustomBrewCard from './CustomBrewCard';
import Modal from './Modal';
import CustomBrewFormModal from './CustomBrewFormModal';

interface CustomBrewsManagerProps {
    customBrews: CustomBrew[];
    onAddBrew: (brew: Omit<CustomBrew, 'id' | 'user_id' | 'created_at'>) => void;
    onUpdateBrew: (brew: CustomBrew) => void;
    onDeleteBrew: (id: string) => void;
}

const MAX_CUSTOM_BREWS = 9;

const CustomBrewsManager: React.FC<CustomBrewsManagerProps> = ({
    customBrews,
    onAddBrew,
    onUpdateBrew,
    onDeleteBrew,
}) => {
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingBrew, setEditingBrew] = useState<CustomBrew | null>(null);
    const [deletingBrew, setDeletingBrew] = useState<CustomBrew | null>(null);

    const handleAddNew = () => {
        setEditingBrew(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (brew: CustomBrew) => {
        setEditingBrew(brew);
        setIsFormModalOpen(true);
    };

    const handleDeleteConfirm = (brew: CustomBrew) => {
        setDeletingBrew(brew);
    };

    const handleDelete = () => {
        if (deletingBrew) {
            onDeleteBrew(deletingBrew.id);
            setDeletingBrew(null);
        }
    };

    const handleFormSubmit = (brewData: Omit<CustomBrew, 'id' | 'user_id' | 'created_at'> | CustomBrew) => {
        if ('id' in brewData) {
            onUpdateBrew(brewData as CustomBrew);
        } else {
            onAddBrew(brewData as Omit<CustomBrew, 'id' | 'user_id' | 'created_at'>);
        }
        setIsFormModalOpen(false);
    };

    const canAddMore = customBrews.length < MAX_CUSTOM_BREWS;

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex items-center">
                    <BeerIcon className="w-10 h-10 text-cyan-400 mr-4" />
                    <h2 className="text-4xl font-bold text-white">My Custom Brews</h2>
                </div>
                <div className="relative group">
                    <button
                        onClick={handleAddNew}
                        disabled={!canAddMore}
                        className="flex items-center bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-900 font-bold text-lg py-4 px-8 rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        <AddIcon className="w-6 h-6 mr-2" />
                        Add New Custom Brew
                    </button>
                    {!canAddMore && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 text-sm font-medium text-white bg-slate-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            You have reached the maximum of {MAX_CUSTOM_BREWS} custom brews.
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-700"></div>
                        </div>
                    )}
                </div>
            </div>

            {customBrews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {customBrews.map((brew, index) => (
                        <div key={brew.id} className="animate-slide-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                            <CustomBrewCard brew={brew} onEdit={handleEdit} onDelete={handleDeleteConfirm} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 px-6 bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-700">
                    <BeerIcon className="w-20 h-20 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-slate-300">No custom brews yet.</h3>
                    <p className="text-slate-400 text-lg mt-2 max-w-sm mx-auto">Click 'Add New Custom Brew' to design your first beer recipe!</p>
                </div>
            )}
            
            <CustomBrewFormModal 
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingBrew}
            />

            <Modal isOpen={!!deletingBrew} onClose={() => setDeletingBrew(null)} title="Delete Custom Brew?">
                <div className="text-center">
                    <WarningIcon className="w-20 h-20 text-red-500 mx-auto mb-5" />
                    <p className="text-xl text-slate-300 mb-8">
                        Are you sure you want to delete "{deletingBrew?.name}"? This cannot be undone.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <button onClick={() => setDeletingBrew(null)} className="py-3 px-8 text-lg font-semibold bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition">
                            Cancel
                        </button>
                        <button onClick={handleDelete} className="py-3 px-8 text-lg font-bold bg-red-600 text-white rounded-lg hover:bg-red-500 transition">
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CustomBrewsManager;