import React, { useState, useEffect, useRef } from 'react';
import { PINTER_PRODUCTS } from './constants';
import { AppView, Session } from './types';
import { supabase } from './supabaseClient';
import Header from './components/Header';
import FermentationTracker from './components/FermentationTracker';
import AbvCalculator from './components/AbvCalculator';
import Footer from './components/Footer';
import Auth from './components/Auth';
import PasswordReset from './components/PasswordReset';
import Modal from './components/Modal';
import { BarrelIcon, WarningIcon } from './components/icons';

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [trackedBeers, setTrackedBeers] = useState<any[]>([]);
  const [view, setView] = useState(AppView.Tracker);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const prevSessionRef = useRef<Session | null>(null);
  useEffect(() => {
    prevSessionRef.current = session;
  });
  const prevSession = prevSessionRef.current;

  const syncLocalBeers = async (userId: string) => {
    const localBeers = trackedBeers.filter(b => b.status); // A simple check to see if it's a beer object
    if (localBeers.length > 0 && !isSyncing) {
      setIsSyncing(true);
      console.log('Syncing local beers to database...');
      const beersToInsert = localBeers.map(beer => ({
        user_id: userId,
        tracking_id: beer.trackingId,
        product_id: beer.id,
        status: beer.status || 'pending',
        keg_color: beer.kegColor,
        keg_nickname: beer.kegNickname,
        brewing_days: beer.brewingDays,
        conditioning_days: beer.conditioningDays,
        fermentation_start_date: beer.fermentationStartDate,
        conditioning_start_date: beer.conditioningStartDate,
      }));
      await supabase.from('beers').insert(beersToInsert);
      setIsSyncing(false);
    }
  };

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
        setShowAuthModal(false);
      } else if (event === 'SIGNED_IN') {
        setIsPasswordRecovery(false);
        setShowAuthModal(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const justLoggedIn = !prevSession && session;
    const justLoggedOut = prevSession && !session;

    if (justLoggedIn) {
      syncLocalBeers(session!.user.id).then(() => {
        getBeers();
      });
    } else if (justLoggedOut) {
      setTrackedBeers([]);
    } else if (session && prevSession === undefined) {
      getBeers();
    }
  }, [session, prevSession]);

  const getBeers = async () => {
    if (!session?.user) return;
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

  const addBeerToTrack = async (productId: string, kegColor: string, kegNickname: string, brewingDays: number, conditioningDays: number) => {
    const product = PINTER_PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    if (session?.user) {
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
    } else {
      const newBeer = {
        ...product,
        trackingId: `${productId}-${Date.now()}`,
        fermentationStartDate: null,
        conditioningStartDate: null,
        status: 'pending',
        kegColor,
        kegNickname,
        brewingDays,
        conditioningDays,
      };
      setTrackedBeers(prev => [...prev, newBeer]);
    }
  };

  const updateBeer = async (updatedBeer: any) => {
    if (session?.user) {
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
      if (error) console.error("Error updating beer:", error);
      else getBeers();
    } else {
      setTrackedBeers(prev => prev.map(b => b.trackingId === updatedBeer.trackingId ? updatedBeer : b));
    }
  };

  const removeBeer = async (trackingId: string) => {
    if (session?.user) {
      const { error } = await supabase.from('beers').delete().eq('tracking_id', trackingId);
      if (error) console.error("Error removing beer:", error);
      else getBeers();
    } else {
      setTrackedBeers(prev => prev.filter(b => b.trackingId !== trackingId));
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

  return (
    <div className="min-h-screen bg-transparent text-slate-200 font-sans flex flex-col">
      <Header session={session} onLogout={handleLogout} onLogin={() => setShowAuthModal(true)} />
      <main className="container mx-auto p-4 md:p-8 leading-relaxed flex-grow">
        
        {!session && trackedBeers.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-600 text-yellow-300 px-4 py-3 rounded-xl relative mb-6 flex items-center justify-between animate-fade-in-fast" role="alert">
            <div className="flex items-center">
              <WarningIcon className="w-6 h-6 mr-3 text-yellow-400" />
              <span className="font-semibold">You have unsaved brews. Login to save your progress.</span>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-yellow-500 text-slate-900 font-bold py-1.5 px-4 rounded-md hover:bg-yellow-400 transition"
            >
              Login / Sign Up
            </button>
          </div>
        )}

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

      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} title="My Pinter Assistant">
        <Auth />
      </Modal>
    </div>
  );
};

export default App;
