import React, { useState, useEffect, useRef } from 'react';
import { PINTER_PRODUCTS } from './constants';
import { AppView, Session, CustomBrew, TrackedBeer } from './types';
import { supabase } from './supabaseClient';
import Header from './components/Header';
import FermentationTracker from './components/FermentationTracker';
import AbvCalculator from './components/AbvCalculator';
import CustomBrewsManager from './components/CustomBrewsManager';
import Footer from './components/Footer';
import Auth from './components/Auth';
import PasswordReset from './components/PasswordReset';
import Modal from './components/Modal';
import { BarrelIcon, WarningIcon } from './components/icons';
import { Database } from './database.types';

type DbBeer = Database['public']['Tables']['beers']['Row'];
type DbCustomBrew = Database['public']['Tables']['custom_brews']['Row'];

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [trackedBeers, setTrackedBeers] = useState<TrackedBeer[]>([]);
  const [customBrews, setCustomBrews] = useState<CustomBrew[]>([]);
  const [view, setView] = useState<keyof typeof AppView>('Tracker');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const prevSessionRef = useRef<Session | null>(null);
  useEffect(() => {
    prevSessionRef.current = session;
  });
  const prevSession = prevSessionRef.current;

  const syncLocalBeers = async (userId: string) => {
    const localBeers = trackedBeers.filter(b => b.status && !b.isCustom); // Only sync Pinter products
    if (localBeers.length > 0 && !isSyncing) {
      setIsSyncing(true);
      console.log('Syncing local beers to database...');
      const beersToInsert: Database['public']['Tables']['beers']['Insert'][] = localBeers.map(beer => ({
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
        is_custom: false,
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
        setShowAuthModal(false);
      } else if (_event === 'SIGNED_IN') {
        setIsPasswordRecovery(false);
        setShowAuthModal(false);
        setView('Tracker');
      } else if (_event === 'SIGNED_OUT') {
        setView('Tracker');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    if (!session?.user) return;
    await Promise.all([getBeers(), getCustomBrews()]);
  };

  useEffect(() => {
    const justLoggedIn = !prevSession && session;
    const justLoggedOut = prevSession && !session;

    if (justLoggedIn) {
      syncLocalBeers(session!.user.id).then(() => {
        fetchData();
      });
    } else if (justLoggedOut) {
      setTrackedBeers([]);
      setCustomBrews([]);
    } else if (session) { // Also handles initial load when session exists
      fetchData();
    }
  }, [session]);


  const getCustomBrews = async () => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from('custom_brews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCustomBrews((data as DbCustomBrew[]) || []);
    } catch (error) {
      console.error("Error fetching custom brews:", error);
    }
  };

  const getBeers = async () => {
    if (!session?.user) return;
    try {
      const { data: beersFromDb, error } = await supabase
        .from('beers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (beersFromDb) {
        // We need custom brews to be available for hydration
        const { data: latestCustomBrewsData } = await supabase.from('custom_brews').select('*');
        const latestCustomBrews = (latestCustomBrewsData as DbCustomBrew[]) || [];
        const customBrewsMap = new Map(latestCustomBrews.map(cb => [cb.id, cb]));

        const hydratedBeers = (beersFromDb as DbBeer[]).map((dbBeer): TrackedBeer | null => {
          let productInfo;
          let isCustom = dbBeer.is_custom;
          if (isCustom) {
            const customBrew = customBrewsMap.get(dbBeer.product_id);
            if(customBrew) {
              productInfo = {
                ...customBrew,
                brewingDays: customBrew.brewing_days,
                conditioningDays: customBrew.conditioning_days,
              }
            }
          } else {
            productInfo = PINTER_PRODUCTS.find(p => p.id === dbBeer.product_id);
          }

          if (!productInfo) return null;

          return {
            ...productInfo,
            trackingId: dbBeer.tracking_id,
            fermentationStartDate: dbBeer.fermentation_start_date,
            conditioningStartDate: dbBeer.conditioning_start_date,
            status: dbBeer.status as TrackedBeer['status'],
            kegColor: dbBeer.keg_color,
            kegNickname: dbBeer.keg_nickname,
            brewingDays: dbBeer.brewing_days, // Use days from the specific tracked beer
            conditioningDays: dbBeer.conditioning_days,
            isCustom: isCustom,
            id: dbBeer.product_id,
          };
        }).filter((b): b is TrackedBeer => b !== null);

        setTrackedBeers(hydratedBeers);
      }
    } catch (error) {
      console.error("Error fetching beers:", error);
    }
  };

  const addBeerToTrack = async (productId: string, kegColor: string, kegNickname: string, brewingDays: number, conditioningDays: number) => {
    const isCustom = customBrews.some(cb => cb.id === productId);
    let product;

    if (isCustom) {
      product = customBrews.find(p => p.id === productId)
    } else {
      product = PINTER_PRODUCTS.find(p => p.id === productId);
    }
      
    if (!product) return;

    if (session?.user) {
      const newBeerForDb: Database['public']['Tables']['beers']['Insert'] = {
        user_id: session.user.id,
        tracking_id: `${productId}-${Date.now()}`,
        product_id: productId,
        status: 'pending' as const,
        keg_color: kegColor,
        keg_nickname: kegNickname,
        brewing_days: brewingDays,
        conditioning_days: conditioningDays,
        is_custom: isCustom,
      };
      const { error } = await supabase.from('beers').insert([newBeerForDb]);
      if (error) {
        console.error("Error adding beer:", error);
      } else {
        getBeers();
      }
    } else if (!isCustom) { // Don't allow adding custom brews when logged out
      const pinterProduct = product as typeof PINTER_PRODUCTS[0];
      const newBeer: TrackedBeer = {
        ...pinterProduct,
        trackingId: `${productId}-${Date.now()}`,
        fermentationStartDate: null,
        conditioningStartDate: null,
        status: 'pending',
        kegColor,
        kegNickname,
        brewingDays,
        conditioningDays,
        isCustom: false,
      };
      setTrackedBeers(prev => [...prev, newBeer]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const updateBeer = async (updatedBeer: TrackedBeer) => {
    if (session?.user) {
      const beerForDb: Database['public']['Tables']['beers']['Update'] = {
        fermentation_start_date: updatedBeer.fermentationStartDate,
        conditioning_start_date: updatedBeer.conditioningStartDate,
        status: updatedBeer.status,
      };
      const { error } = await supabase.from('beers').update(beerForDb).eq('tracking_id', updatedBeer.trackingId);
      if (error) console.error("Error updating beer:", error);
      else getBeers(); // Refresh to ensure consistency
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

  // --- Custom Brew CRUD ---
  const addCustomBrew = async (brew: Omit<CustomBrew, 'id' | 'user_id' | 'created_at'>) => {
    if (!session?.user) return;
    const brewToInsert: Database['public']['Tables']['custom_brews']['Insert'] = { ...brew, user_id: session.user.id };
    const { error } = await supabase.from('custom_brews').insert([brewToInsert]);
    if (error) console.error("Error adding custom brew:", error);
    else getCustomBrews();
  };

  const updateCustomBrew = async (brew: CustomBrew) => {
    if (!session?.user) return;
    const { id, user_id, created_at, ...updateData } = brew;
    const { error } = await supabase.from('custom_brews').update(updateData).eq('id', id);
    if (error) console.error("Error updating custom brew:", error);
    else await fetchData(); // Refetch both to update tracked beers that use this custom brew
  };

  const deleteCustomBrew = async (id: string) => {
    if (!session?.user) return;
    // Check if brew is in use
    const isUsed = trackedBeers.some(b => b.isCustom && b.id === id);
    if (isUsed) {
      alert("Cannot delete a custom brew that is currently being tracked. Please remove the tracked brew first.");
      return;
    }
    const { error } = await supabase.from('custom_brews').delete().eq('id', id);
    if (error) console.error("Error deleting custom brew:", error);
    else getCustomBrews();
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
  
  const renderView = () => {
    switch(view) {
      case 'Tracker':
        return (
          <FermentationTracker
            trackedBeers={trackedBeers}
            customBrews={customBrews}
            onAddBeer={addBeerToTrack}
            onUpdateBeer={updateBeer}
            onRemoveBeer={removeBeer}
            isLoggedIn={!!session}
          />
        );
      case 'Calculator':
        return <AbvCalculator />;
      case 'CustomBrews':
        return (
          <CustomBrewsManager 
            customBrews={customBrews}
            onAddBrew={addCustomBrew}
            onUpdateBrew={updateCustomBrew}
            onDeleteBrew={deleteCustomBrew}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-200 font-sans flex flex-col">
      <Header session={session} onLogout={handleLogout} onLogin={() => setShowAuthModal(true)} />
      <main className="container mx-auto p-4 md:p-8 leading-relaxed flex-grow">
        
        {!session && trackedBeers.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-600 text-yellow-300 px-4 py-3 rounded-xl relative mb-6 flex items-center justify-between animate-fade-in-fast" role="alert">
            <div className="flex items-center">
              <WarningIcon className="w-6 h-6 mr-3 text-yellow-400" />
              <span className="font-semibold">You have unsaved brews. Login to save your progress and access custom brews.</span>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-yellow-500 text-slate-900 font-bold py-1.5 px-4 rounded-md hover:bg-yellow-400 transition"
            >
              Login / Sign Up
            </button>
          </div>
        )}

        <div className="mb-8 flex justify-center rounded-full bg-slate-800/80 p-1.5 max-w-xl mx-auto border border-slate-700">
          <button
            onClick={() => setView('Tracker')}
            className={`w-1/3 py-2.5 px-4 rounded-full text-lg font-semibold transition-all duration-300 ${view === 'Tracker' ? 'bg-cyan-500 text-slate-900 shadow-lg' : 'text-slate-300 hover:bg-slate-700/50'}`}
          >
            Tracker
          </button>
          <button
            onClick={() => setView('Calculator')}
            className={`w-1/3 py-2.5 px-4 rounded-full text-lg font-semibold transition-all duration-300 ${view === 'Calculator' ? 'bg-cyan-500 text-slate-900 shadow-lg' : 'text-slate-300 hover:bg-slate-700/50'}`}
          >
            Calculator
          </button>
          {session && (
            <button
              onClick={() => setView('CustomBrews')}
              className={`w-1/3 py-2.5 px-4 rounded-full text-lg font-semibold transition-all duration-300 ${view === 'CustomBrews' ? 'bg-cyan-500 text-slate-900 shadow-lg' : 'text-slate-300 hover:bg-slate-700/50'}`}
            >
              My Brews
            </button>
          )}
        </div>

        <div className="animate-slide-in-up" style={{ animationDelay: '100ms' }}>
          {renderView()}
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