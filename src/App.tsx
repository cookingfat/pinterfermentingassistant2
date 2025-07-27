
import React, { useState, useEffect } from 'react';
import { PINTER_PRODUCTS } from './constants';
import { AppView, Session, TrackedBeer } from './types';
import { supabase } from './supabaseClient';
import Header from './components/Header';
import FermentationTracker from './components/FermentationTracker';
import AbvCalculator from './components/AbvCalculator';
import Footer from './components/Footer';
import Auth from './components/Auth';
import PasswordReset from './components/PasswordReset';
import { BarrelIcon } from './components/icons';
import Modal from './components/Modal';

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [trackedBeers, setTrackedBeers] = useState<TrackedBeer[]>([]);
  const [view, setView] = useState(AppView.Tracker);

  const getBeersFromLocalStorage = (): TrackedBeer[] => {
    try {
      const localBeersJson = localStorage.getItem('pinter-tracked-beers');
      return localBeersJson ? JSON.parse(localBeersJson) : [];
    } catch (error) {
      console.error("Error parsing local beers:", error);
      return [];
    }
  };

  const updateLocalStorageAndState = (newBeers: TrackedBeer[]) => {
    const sortedBeers = [...newBeers].sort((a, b) => {
      const timeA = parseInt(a.trackingId.split('-').pop() || '0', 10);
      const timeB = parseInt(b.trackingId.split('-').pop() || '0', 10);
      return timeB - timeA;
    });
    localStorage.setItem('pinter-tracked-beers', JSON.stringify(sortedBeers));
    setTrackedBeers(sortedBeers);
  };

  const getBeersFromSupabase = async () => {
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
        }).filter((b): b is TrackedBeer => b !== null);

        setTrackedBeers(hydratedBeers);
      }
    } catch (error) {
      console.error("Error fetching beers from Supabase:", error);
    }
  };

  const migrateLocalBeersToSupabase = async (localBeers: TrackedBeer[], userId: string) => {
    const beersForDb = localBeers.map(beer => ({
      user_id: userId,
      tracking_id: beer.trackingId,
      product_id: beer.id,
      status: beer.status,
      keg_color: beer.kegColor,
      keg_nickname: beer.kegNickname,
      brewing_days: beer.brewingDays,
      conditioning_days: beer.conditioningDays,
      fermentation_start_date: beer.fermentationStartDate,
      conditioning_start_date: beer.conditioningStartDate,
    }));

    if (beersForDb.length > 0) {
      const { error } = await supabase.from('beers').upsert(beersForDb as any, { onConflict: 'tracking_id' });
      if (error) {
        console.error("Error migrating beers:", error);
      } else {
        localStorage.removeItem('pinter-tracked-beers');
      }
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await getBeersFromSupabase();
      } else {
        setTrackedBeers(getBeersFromLocalStorage());
      }
      setLoading(false);
    };

    initializeApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
        setIsAuthModalOpen(false);
        setSession(null);
      } else {
        setSession(session);
      }
      
      if (event === 'SIGNED_IN' && session) {
        setLoading(true);
        const localBeers = getBeersFromLocalStorage();
        if (localBeers.length > 0) {
          await migrateLocalBeersToSupabase(localBeers, session.user.id);
        }
        await getBeersFromSupabase();
        setIsAuthModalOpen(false);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setTrackedBeers([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const addBeerToTrack = async (productId: string, kegColor: string, kegNickname: string, brewingDays: number, conditioningDays: number) => {
    const product = PINTER_PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const newBeer: TrackedBeer = {
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

    if (session?.user) {
      const newBeerForDb = {
        user_id: session.user.id,
        tracking_id: newBeer.trackingId,
        product_id: productId,
        status: 'pending',
        keg_color: kegColor,
        keg_nickname: kegNickname,
        brewing_days: brewingDays,
        conditioning_days: conditioningDays,
        fermentation_start_date: newBeer.fermentationStartDate,
        conditioning_start_date: newBeer.conditioningStartDate,
      };
      const { error } = await supabase.from('beers').insert(newBeerForDb as any);
      if (error) {
        console.error("Error adding beer:", error);
      } else {
        await getBeersFromSupabase();
      }
    } else {
      const currentBeers = getBeersFromLocalStorage();
      updateLocalStorageAndState([newBeer, ...currentBeers]);
    }
  };

  const updateBeer = async (updatedBeer: TrackedBeer) => {
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
      const { error } = await supabase.from('beers').update(beerForDb as any).eq('tracking_id', updatedBeer.trackingId);
      if (error) {
        console.error("Error updating beer:", error);
      } else {
        await getBeersFromSupabase();
      }
    } else {
      const currentBeers = getBeersFromLocalStorage();
      const updatedBeersList = currentBeers.map(b => b.trackingId === updatedBeer.trackingId ? updatedBeer : b);
      updateLocalStorageAndState(updatedBeersList);
    }
  };

  const removeBeer = async (trackingId: string) => {
    if (session?.user) {
      const { error } = await supabase.from('beers').delete().eq('tracking_id', trackingId);
      if (error) {
        console.error("Error removing beer:", error);
      } else {
        await getBeersFromSupabase();
      }
    } else {
      const currentBeers = getBeersFromLocalStorage();
      const updatedBeersList = currentBeers.filter(b => b.trackingId !== trackingId);
      updateLocalStorageAndState(updatedBeersList);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handlePasswordUpdated = () => {
    setIsPasswordRecovery(false);
    // User will be sent back to login, handled by auth state change
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
      <Header 
        session={session}
        onLogin={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout} 
      />
      <main className="container mx-auto p-4 md:p-8 leading-relaxed flex-grow">
        {!session && trackedBeers.length > 0 && (
            <div className="mb-8 text-center">
                <div className="bg-yellow-900/40 text-yellow-300 p-4 rounded-xl border border-yellow-700/60 inline-flex items-center justify-center gap-4 animate-fade-in-fast">
                <p>You have unsaved brews! <button onClick={() => setIsAuthModalOpen(true)} className="font-bold underline hover:text-white transition-colors">Sign up or Log in</button> to save your progress.</p>
                </div>
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
      <Modal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        title={session ? 'Logged In' : 'Login or Sign Up'}
      >
        <Auth />
      </Modal>
    </div>
  );
};

export default App;
