
import React, { useState, useEffect } from 'react';
import { PINTER_PRODUCTS } from './constants';
import { AppView } from './types';
import Header from './components/Header';
import FermentationTracker from './components/FermentationTracker';
import AbvCalculator from './components/AbvCalculator';
import Footer from './components/Footer';

const App = () => {
  const [trackedBeers, setTrackedBeers] = useState([]);
  const [view, setView] = useState(AppView.Tracker);

  useEffect(() => {
    try {
      const savedBeersJSON = localStorage.getItem('pinterTrackedBeers');
      if (savedBeersJSON) {
        const savedBeers = JSON.parse(savedBeersJSON);
        
        // Hydrate saved beers with the latest data from constants to prevent stale data
        const hydratedBeers = savedBeers.map(savedBeer => {
          const productInfo = PINTER_PRODUCTS.find(p => p.id === savedBeer.id);
          if (productInfo) {
            // Merge fresh product info with user's saved progress
            return {
              ...productInfo, // Fresh data from constants
              trackingId: savedBeer.trackingId,
              fermentationStartDate: savedBeer.fermentationStartDate,
              conditioningStartDate: savedBeer.conditioningStartDate,
              status: savedBeer.status,
              kegColor: savedBeer.kegColor,
              kegNickname: savedBeer.kegNickname,
            };
          }
          // If a product was removed from constants, we filter it out
          return null; 
        }).filter(b => b !== null);

        setTrackedBeers(hydratedBeers);
      }
    } catch (error) {
      console.error("Failed to load or hydrate beers from local storage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('pinterTrackedBeers', JSON.stringify(trackedBeers));
    } catch (error) {
      console.error("Failed to save beers to local storage", error);
    }
  }, [trackedBeers]);

  const addBeerToTrack = (productId, kegColor, kegNickname) => {
    const product = PINTER_PRODUCTS.find(p => p.id === productId);
    if (product) {
      const newBeer = {
        ...product,
        trackingId: `${productId}-${Date.now()}`,
        fermentationStartDate: null,
        conditioningStartDate: null,
        status: 'pending',
        kegColor: kegColor,
        kegNickname: kegNickname,
      };
      setTrackedBeers(prevBeers => [...prevBeers, newBeer]);
    }
  };

  const updateBeer = (updatedBeer) => {
    setTrackedBeers(prevBeers =>
      prevBeers.map(beer => (beer.trackingId === updatedBeer.trackingId ? updatedBeer : beer))
    );
  };

  const removeBeer = (trackingId) => {
    setTrackedBeers(prevBeers => prevBeers.filter(beer => beer.trackingId !== trackingId));
  };


  return (
    <div className="min-h-screen bg-transparent text-slate-200 font-sans flex flex-col">
      <Header />
      <main className="container mx-auto p-4 md:p-8 leading-relaxed flex-grow">
        <div className="mb-8 flex justify-center rounded-full bg-slate-800/80 p-1.5 max-w-md mx-auto border border-slate-700">
          <button
            onClick={() => setView(AppView.Tracker)}
            className={`w-1/2 py-2.5 px-4 rounded-full text-lg font-semibold transition-all duration-300 ${view === AppView.Tracker ? 'bg-cyan-500 text-slate-900 shadow-lg' : 'text-slate-300 hover:bg-slate-700/50'}`}
          >
            Fermentation Tracker
          </button>
          <button
            onClick={() => setView(AppView.Calculator)}
            className={`w-1/2 py-2.5 px-4 rounded-full text-lg font-semibold transition-all duration-300 ${view === AppView.Calculator ? 'bg-cyan-500 text-slate-900 shadow-lg' : 'text-slate-300 hover:bg-slate-700/50'}`}
          >
            ABV Calculator
          </button>
        </div>

        <div className="animate-slide-in-up" style={{ animationDelay: '100ms' }}>
          {view === AppView.Tracker ? (
            <FermentationTracker
              trackedBeers={trackedBeers}
              onAddBeer={addBeerToTrack}
              onUpdateBeer={updateBeer}
              onRemoveBeer={removeBeer}
            />
          ) : (
            <AbvCalculator />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
