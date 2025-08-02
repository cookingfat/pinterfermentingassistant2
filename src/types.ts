import type { Session } from '@supabase/supabase-js';

export const AppView = {
  Tracker: 'Tracker',
  Calculator: 'Calculator',
  CustomBrews: 'CustomBrews',
};

export type { Session };

export interface CustomBrew {
  id: string; // UUID from DB
  user_id: string;
  created_at: string;
  name: string;
  description?: string | null;
  style?: string | null;
  abv: number;
  brewing_days: number;
  conditioning_days: number;
  background_gradient: string;
}

export interface TrackedBeer {
    id: string; // product id from PINTER_PRODUCTS or custom_brews
    trackingId: string; // unique tracking id from beers table
    name: string;
    style?: string | null;
    abv: number;
    description?: string | null;
    imageUrl?: string;
    isCustom: boolean;

    // From custom brew, for card background
    background_gradient?: string;

    // Tracking progress
    fermentationStartDate: string | null;
    conditioningStartDate: string | null;
    status: 'pending' | 'fermenting' | 'conditioning' | 'ready';
    
    // Keg info
    kegColor: string | null;
    kegNickname: string | null;

    // Timing info (can be customized per-brew)
    brewingDays: number;
    conditioningDays: number;
}