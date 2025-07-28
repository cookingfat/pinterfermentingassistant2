

import React, { useState, useEffect } from 'react';
import { PINTER_PRODUCTS } from './constants';
import { AppView, Session } from './types';
import { supabase } from './supabaseClient';
import Header from './components/Header';
import FermentationTracker from './components/FermentationTracker';
import AbvCalculator from './components/AbvCalculator';
import Footer from './components/Footer';
import Auth from './components/Auth';
import PasswordReset from './components/PasswordReset';
import { BarrelIcon } from './components/icons';

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [trackedBeers, setTrackedBeers] = useState([]);
  const [view, setView] = useState(AppView.Tracker);

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      getBeers();
    } else {
      setTrackedBeers([]); // Clear beers on logout
    }
  }, [session]);

  const getBeers = async () => {
    try {
      const { data: beersFromDb, error } = await supabase
        .from('beers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (beersFromDb) {
        const hydratedBeers = beersFromDb.map(dbBeer => {
          const productInfo = PINTER_PRODUCTS.find(p => p.id === dbBeer.product_id);
          if (!productInfo) return null;

          return {
            ...productInfo,
            trackingId: dbBeer.tracking_id,
            fermentationStartDate: dbBeer.fermentation_start_date,
            conditioningStartDate: dbBeer.conditioning_start_date,
            status: dbBeer.status,
            kegColor: dbBeer.keg_color,
            kegNickname: dbBeer.keg_nickname,
            brewingDays: dbBeer.brewing_days,
            conditioningDays: dbBeer.conditioning_days,
          };
        }).filter(b => b !== null);

        setTrackedBeers(hydratedBeers);
      }
    } catch (error) {
      console.error("Error fetching beers:", error);
    }
  };

  const addBeerToTrack = async (productId, kegColor, kegNickname, brewingDays, conditioningDays) => {
    if (!session?.user) return;
    const product = PINTER_PRODUCTS.find(p => p.id === productId);
    if (product) {
      const newBeerForDb = {
        user_id: session.user.id,
        tracking_id: `${productId}-${Date.now()}`,
        product_id: productId,
        status: 'pending',
        keg_color: kegColor,
        keg_nickname: kegNickname,
        brewing_days: brewingDays,
        conditioning_days: conditioningDays,
      };
      const { error } = await supabase.from('beers').insert(newBeerForDb);
      if (error) {
        console.error("Error adding beer:", error);
      } else {
        getBeers();
      }
    }
  };

  const updateBeer = async (updatedBeer) => {
    if (!session?.user) return;
    const beerForDb = {
      product_id: updatedBeer.id,
      fermentation_start_date: updatedBeer.fermentationStartDate,
      conditioning_start_date: updatedBeer.conditioningStartDate,
      status: updatedBeer.status,
      keg_color: updatedBeer.kegColor,
      keg_nickname: updatedBeer.kegNickname,
      brewing_days: updatedBeer.brewingDays,
      conditioning_days: updatedBeer.conditioningDays,
    };
    const { error } = await supabase.from('beers').update(beerForDb).eq('tracking_id', updatedBeer.trackingId);
    if (error) {
      console.error("Error updating beer:", error);
    } else {
      getBeers();
    }
  };

  const removeBeer = async (trackingId) => {
    if (!session?.user) return;
    const { error } = await supabase.from('beers').delete().eq('tracking_id', trackingId);
    if (error) {
      console.error("Error removing beer:", error);
    } else {
      getBeers();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handlePasswordUpdated = () => {
    setIsPasswordRecovery(false);
  };
  
  if (loading) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center">
            <BarrelIcon className="w-16 h-16 text-cyan-400 mb-4 animate-pulse" />
            <h1 className="text-3xl font-bold text-slate-300">Loading your brews...</h1>
        </div>
    );
  }

  if (isPasswordRecovery) {
    return <PasswordReset onPasswordUpdated={handlePasswordUpdated} />;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-200 font-sans flex flex-col">
      <Header onLogout={handleLogout} />
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
