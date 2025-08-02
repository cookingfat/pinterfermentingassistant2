import React, { useState, useMemo, useEffect } from 'react';
import Timer from './Timer';
import Modal from './Modal';
import { CalendarIcon, FridgeIcon, TrashIcon, WarningIcon, InfoIcon, PlayIcon } from './icons';
import { TrackedBeer } from '../types';

interface BeerCardProps {
  beer: TrackedBeer;
  onUpdate: (beer: TrackedBeer) => void;
  onRemove: (trackingId: string) => void;
}

const BeerCard: React.FC<BeerCardProps> = ({ beer, onUpdate, onRemove }) => {
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [fermentationTimerExpired, setFermentationTimerExpired] = useState(false);

  const recommendedConditioningDate = useMemo(() => {
    if (!beer.fermentationStartDate) return null;
    const startDate = new Date(beer.fermentationStartDate);
    startDate.setDate(startDate.getDate() + beer.brewingDays);
    return startDate;
  }, [beer.fermentationStartDate, beer.brewingDays]);

  const conditioningEndDate = useMemo(() => {
    if (!beer.conditioningStartDate) return null;
    const startDate = new Date(beer.conditioningStartDate);
    startDate.setDate(startDate.getDate() + beer.conditioningDays);
    return startDate;
  }, [beer.conditioningStartDate, beer.conditioningDays]);

  const isEarly = useMemo(() => {
    if (fermentationTimerExpired) return false;
    if (!recommendedConditioningDate) return true; // Should not happen in 'fermenting' state
    return new Date() < recommendedConditioningDate;
  }, [recommendedConditioningDate, fermentationTimerExpired]);

  useEffect(() => {
    if (recommendedConditioningDate && new Date() >= recommendedConditioningDate) {
      setFermentationTimerExpired(true);
    }
  }, [recommendedConditioningDate]);

  const handleStartBrewing = () => {
    onUpdate({
      ...beer,
      status: 'fermenting',
      fermentationStartDate: new Date().toISOString(),
    });
  };

  const handleStartConditioning = () => {
    onUpdate({
      ...beer,
      status: 'conditioning',
      conditioningStartDate: new Date().toISOString(),
    });
    setIsWarningModalOpen(false);
  };

  const attemptStartConditioning = () => {
    if (isEarly) {
      setIsWarningModalOpen(true);
    } else {
      handleStartConditioning();
    }
  };

  const handleRemove = () => {
    onRemove(beer.trackingId);
    setIsDeleteModalOpen(false);
  };
  
  const getStatusBadge = () => {
    const baseClasses = "px-3 py-1 text-sm font-bold rounded-full shadow-md";
    switch (beer.status) {
      case 'pending':
        return <span className={`${baseClasses} bg-slate-600 text-white`}>Ready to Brew</span>;
      case 'fermenting':
        return <span className={`${baseClasses} bg-blue-500 text-white`}>Fermenting</span>;
      case 'conditioning':
        return <span className={`${baseClasses} bg-teal-500 text-white`}>Conditioning</span>;
      case 'ready':
         return <span className={`${baseClasses} bg-green-500 text-white`}>Ready!</span>;
      default:
        return null;
    }
  }

  const backgroundClasses: {[key: string]: string} = {
    'gradient-1': 'bg-gradient-to-br from-purple-500 to-indigo-600',
    'gradient-2': 'bg-gradient-to-br from-green-400 to-teal-500',
    'gradient-3': 'bg-gradient-to-br from-yellow-400 to-orange-500',
    'gradient-4': 'bg-gradient-to-br from-rose-500 to-pink-600',
    'gradient-5': 'bg-gradient-to-br from-slate-700 to-slate-900',
  };

  return (
    <div className="relative rounded-2xl shadow-xl overflow-hidden h-[28rem] transition-all duration-300 border border-slate-700 hover:border-cyan-400/50 hover:shadow-cyan-400/10 group">
      {/* Background Image or Gradient */}
      {beer.isCustom && beer.background_gradient ? (
        <div className={`absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105 ${backgroundClasses[beer.background_gradient] || backgroundClasses['gradient-5']}`} />
      ) : beer.imageUrl ? (
        <img src={beer.imageUrl} alt={beer.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
      ) : (
        <div className={`absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105 ${backgroundClasses['gradient-5']}`} />
      )}

      {/* Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent"></div>
      
      {/* Content Container */}
      <div className="relative z-10 p-5 flex flex-col h-full">
        {/* Card Header: Controls + Status Badge */}
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
                <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 bg-black/40 rounded-full text-slate-300 hover:bg-red-500 hover:text-white transition-colors duration-200" title="Delete Brew">
                    <TrashIcon className="w-5 h-5" />
                </button>
                <button onClick={() => setIsInfoModalOpen(true)} className="p-2 bg-black/40 rounded-full text-slate-300 hover:bg-cyan-500 hover:text-white transition-colors duration-200" title="View Info">
                    <InfoIcon className="w-5 h-5" />
                </button>
            </div>
            {getStatusBadge()}
        </div>

        {/* Top Content */}
        <div>
          <h3 className="text-3xl font-bold text-white shadow-black [text-shadow:_2px_2px_6px_var(--tw-shadow-color)] line-clamp-2">{beer.name}</h3>
          
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg text-slate-300 shadow-black [text-shadow:_1px_1px_3px_var(--tw-shadow-color)]">{beer.style} - {beer.abv}% ABV</p>
            {beer.kegColor && (
              <div className="text-right">
                  <div className="flex items-center gap-2 justify-end" title={`${beer.kegColor} Keg`}>
                      <span className={`w-4 h-4 rounded-full border-2 ${
                          beer.kegColor === 'black' ? 'bg-gray-700 border-gray-500' :
                          beer.kegColor === 'blue' ? 'bg-blue-500 border-blue-300' :
                          'bg-red-500 border-red-300'
                      }`}></span>
                      <span className="text-base font-semibold text-slate-200 capitalize shadow-black [text-shadow:_1px_1px_3px_var(--tw-shadow-color)]">{beer.kegColor} Keg</span>
                  </div>
                  {beer.kegNickname && (
                      <p className="text-sm text-slate-400 italic shadow-black [text-shadow:_1px_1px_3px_var(--tw-shadow-color)]">"{beer.kegNickname}"</p>
                  )}
              </div>
            )}
          </div>
          
          {beer.status === 'fermenting' && beer.fermentationStartDate && (
            <div className="space-y-2 text-base text-slate-200 mb-2 opacity-90">
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2.5 flex-shrink-0" />
                  <span>Started: {new Date(beer.fermentationStartDate).toLocaleDateString()}</span>
                </div>
            </div>
          )}
        </div>

        {/* Bottom Content (pushed down by mt-auto) */}
        <div className="mt-auto">
            {beer.status === 'pending' && (
              <div className="space-y-4">
                <button
                    onClick={handleStartBrewing}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold py-3.5 px-4 rounded-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    <PlayIcon className="w-6 h-6 mr-2" />
                    Start Brewing
                </button>
              </div>
            )}
            {beer.status === 'fermenting' && recommendedConditioningDate && (
              <div className="space-y-4">
                  <Timer
                      expiryTimestamp={recommendedConditioningDate}
                      onExpire={() => setFermentationTimerExpired(true)}
                      title="Ready for conditioning in..."
                  />
                  <button
                      onClick={attemptStartConditioning}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold py-3.5 px-4 rounded-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                      <FridgeIcon className="w-6 h-6 mr-2" />
                      Start Conditioning
                  </button>
              </div>
            )}
            {beer.status === 'conditioning' && conditioningEndDate && (
              <Timer
                expiryTimestamp={conditioningEndDate}
                onExpire={() => onUpdate({ ...beer, status: 'ready' })}
                title="Ready to drink in..."
              />
            )}
            {beer.status === 'ready' && (
              <div className="text-center font-bold text-green-400 text-2xl bg-green-500/10 py-3 rounded-lg">
                🍻 Cheers! Your beer is ready!
              </div>
            )}
          </div>
      </div>

      {/* Warning Modal */}
      <Modal isOpen={isWarningModalOpen} onClose={() => setIsWarningModalOpen(false)} title="Are you sure?">
        <div className="text-center">
            <WarningIcon className="w-20 h-20 text-sky-400 mx-auto mb-5" />
          <p className="text-xl text-slate-300 mb-2">
            This brew might not be ready for conditioning.
          </p>
          <p className="text-lg text-slate-400 mb-8">
            Conditioning early can affect the final taste and ABV.
          </p>
          <div className="flex justify-center space-x-4">
            <button onClick={() => setIsWarningModalOpen(false)} className="py-3 px-8 text-lg font-semibold bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition">
              Cancel
            </button>
            <button onClick={handleStartConditioning} className="py-3 px-8 text-lg font-bold bg-sky-500 text-slate-900 rounded-lg hover:bg-sky-400 transition">
              Continue Anyway
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Brew?">
        <div className="text-center">
          <WarningIcon className="w-20 h-20 text-red-500 mx-auto mb-5" />
          <p className="text-xl text-slate-300 mb-8">
            Are you sure you want to remove "{beer.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-center space-x-4">
            <button onClick={() => setIsDeleteModalOpen(false)} className="py-3 px-8 text-lg font-semibold bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition">
              Cancel
            </button>
            <button onClick={handleRemove} className="py-3 px-8 text-lg font-bold bg-red-600 text-white rounded-lg hover:bg-red-500 transition">
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Info Modal */}
      <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title={`About ${beer.name}`}>
        <div className="space-y-4">
            <p className="text-lg leading-relaxed text-slate-300 whitespace-pre-wrap max-h-80 overflow-y-auto pr-2">
                {beer.description || 'No description available for this beer.'}
            </p>
            <div className="flex justify-end pt-2">
                 <button
                    onClick={() => setIsInfoModalOpen(false)}
                    className="py-2.5 px-6 bg-slate-600 text-white text-base font-semibold rounded-lg hover:bg-slate-500 transition"
                >
                    Close
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default BeerCard;
