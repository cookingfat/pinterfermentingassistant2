import React, { useState, useEffect, useMemo } from 'react';
import { PINTER_PRODUCTS } from '../constants';
import BeerCard from './BeerCard';
import Modal from './Modal';
import { AddIcon, BeerIcon } from './icons';
import { TrackedBeer, CustomBrew } from '../types';

type PinterProduct = typeof PINTER_PRODUCTS[0];

interface FermentationTrackerProps {
  trackedBeers: TrackedBeer[];
  customBrews: CustomBrew[];
  onAddBeer: (
    productId: string,
    kegColor: string,
    kegNickname: string,
    brewingDays: number,
    conditioningDays: number
  ) => void;
  onUpdateBeer: (beer: TrackedBeer) => void;
  onRemoveBeer: (trackingId: string) => void;
  isLoggedIn: boolean;
}

const FermentationTracker: React.FC<FermentationTrackerProps> = ({
  trackedBeers,
  customBrews,
  onAddBeer,
  onUpdateBeer,
  onRemoveBeer,
  isLoggedIn,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const allAvailableBrews = useMemo(() => {
    const customBrewsAsProducts = customBrews.map(cb => ({
        ...cb,
        brewingDays: cb.brewing_days,
        conditioningDays: cb.conditioning_days,
    }));
    return [...customBrewsAsProducts, ...PINTER_PRODUCTS];
  }, [customBrews]);

  const [selectedBeerId, setSelectedBeerId] = useState('');
  const [kegColor, setKegColor] = useState('black');
  const [kegNickname, setKegNickname] = useState('');

  const selectedProduct = useMemo(
    () => allAvailableBrews.find(p => p.id === selectedBeerId),
    [selectedBeerId, allAvailableBrews]
  );
  
  const [brewingDays, setBrewingDays] = useState(7);
  const [conditioningDays, setConditioningDays] = useState(5);

  // Update default days and selected ID when the available brews change
  useEffect(() => {
    if (allAvailableBrews.length > 0 && !selectedBeerId) {
        const firstBrew = allAvailableBrews[0];
        setSelectedBeerId(firstBrew.id);
        setBrewingDays(firstBrew.brewingDays);
        setConditioningDays(firstBrew.conditioningDays);
    }
  }, [allAvailableBrews, selectedBeerId]);

  // Update default days when the selected beer changes
  useEffect(() => {
    if (selectedProduct) {
      setBrewingDays(selectedProduct.brewingDays);
      setConditioningDays(selectedProduct.conditioningDays);
    }
  }, [selectedProduct]);

  useEffect(() => {
    // If the modal is opened, ensure the selected ID is valid
    if (isModalOpen && allAvailableBrews.length > 0) {
      const currentSelectionExists = allAvailableBrews.some(b => b.id === selectedBeerId);
      if (!currentSelectionExists) {
        setSelectedBeerId(allAvailableBrews[0].id);
      }
    }
  }, [isModalOpen, allAvailableBrews, selectedBeerId]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBeerId) {
      onAddBeer(selectedBeerId, kegColor, kegNickname, brewingDays, conditioningDays);
      setIsModalOpen(false);
      // Reset form to defaults for the next use
      const defaultProduct = allAvailableBrews[0];
      if (defaultProduct) {
        setSelectedBeerId(defaultProduct.id);
        setBrewingDays(defaultProduct.brewingDays);
        setConditioningDays(defaultProduct.conditioningDays);
      }
      setKegColor('black');
      setKegNickname('');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
         <div className="flex items-center">
            <BeerIcon className="w-10 h-10 text-cyan-400 mr-4" />
            <h2 className="text-4xl font-bold text-white">My Brews</h2>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-900 font-bold text-lg py-4 px-8 rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <AddIcon className="w-6 h-6 mr-2" />
          Start New Brew
        </button>
      </div>

      {trackedBeers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trackedBeers.map((beer, index) => (
            <div key={beer.trackingId} className="animate-slide-in-up" style={{ animationDelay: `${index * 100}ms`}}>
              <BeerCard beer={beer} onUpdate={onUpdateBeer} onRemove={onRemoveBeer} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-6 bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-700">
          <BeerIcon className="w-20 h-20 text-slate-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-slate-300">Your brew shelf is empty.</h3>
          <p className="text-slate-400 text-lg mt-2 max-w-sm mx-auto">Ready to craft your next masterpiece? Click "Start New Brew" to get going!</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Start a New Brew">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="beer-select" className="block text-lg font-medium text-slate-300 mb-2">
                Choose your Brew
              </label>
              <select
                id="beer-select"
                value={selectedBeerId}
                onChange={e => setSelectedBeerId(e.target.value)}
                className="w-full text-xl bg-slate-700/50 border-slate-600 rounded-lg p-4 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              >
                {isLoggedIn && customBrews.length > 0 && (
                  <optgroup label="My Custom Brews">
                    {customBrews.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.style || 'Custom'}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="Pinter Products">
                  {PINTER_PRODUCTS.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.style}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="brewing-days" className="block text-lg font-medium text-slate-300 mb-2">
                  Brewing Days
                </label>
                <input
                  id="brewing-days"
                  type="number"
                  min="1"
                  value={brewingDays}
                  onChange={e => setBrewingDays(Number(e.target.value))}
                  className="w-full text-xl bg-slate-700/50 border-slate-600 rounded-lg p-4 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
                <p className="text-sm text-slate-400 mt-1 pl-1">
                  Rec: {selectedProduct?.brewingDays}
                </p>
              </div>
              <div>
                <label htmlFor="conditioning-days" className="block text-lg font-medium text-slate-300 mb-2">
                  Conditioning Days
                </label>
                <input
                  id="conditioning-days"
                  type="number"
                  min="1"
                  value={conditioningDays}
                  onChange={e => setConditioningDays(Number(e.target.value))}
                  className="w-full text-xl bg-slate-700/50 border-slate-600 rounded-lg p-4 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
                <p className="text-sm text-slate-400 mt-1 pl-1">
                  Rec: {selectedProduct?.conditioningDays}
                </p>
              </div>
            </div>

            <div>
                <label className="block text-lg font-medium text-slate-300 mb-2">
                    Pinter Keg Colour
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {(['black', 'blue', 'red'] as const).map(color => {
                        const colorMap = {
                            black: { bg: 'bg-gray-800', border: 'border-gray-600', text: 'text-gray-200', ring: 'ring-gray-400' },
                            blue: { bg: 'bg-blue-600', border: 'border-blue-400', text: 'text-white', ring: 'ring-blue-300' },
                            red: { bg: 'bg-red-600', border: 'border-red-400', text: 'text-white', ring: 'ring-red-300' },
                        };
                        return (
                        <label key={color} className="cursor-pointer">
                            <input
                                type="radio"
                                name="keg-color"
                                value={color}
                                checked={kegColor === color}
                                onChange={() => setKegColor(color)}
                                className="sr-only"
                            />
                            <div
                                className={`p-3 rounded-lg text-center text-lg font-semibold transition-all duration-200 border-2 ${
                                    kegColor === color
                                    ? `${colorMap[color].bg} ${colorMap[color].border} ${colorMap[color].text} ring-2 ${colorMap[color].ring} ring-offset-2 ring-offset-slate-800`
                                    : `bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500`
                                }`}
                            >
                                {color.charAt(0).toUpperCase() + color.slice(1)}
                            </div>
                        </label>
                        );
                    })}
                </div>
            </div>

            <div>
              <label htmlFor="keg-nickname" className="block text-lg font-medium text-slate-300 mb-2">
                Pinter's Nickname (Optional)
              </label>
              <input
                id="keg-nickname"
                type="text"
                placeholder="e.g. &quot;Old Faithful&quot;"
                value={kegNickname}
                onChange={e => setKegNickname(e.target.value)}
                className="w-full text-xl bg-slate-700/50 border-slate-600 rounded-lg p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              />
            </div>
            
          </div>
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="py-2.5 px-6 bg-slate-600 text-white text-base font-semibold rounded-lg hover:bg-slate-500 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 bg-cyan-500 text-slate-900 text-base font-bold rounded-lg hover:bg-cyan-400 transition"
            >
              Add Brew
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FermentationTracker;