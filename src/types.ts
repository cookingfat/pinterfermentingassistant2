
import type { Session } from '@supabase/supabase-js';

export const AppView = {
  Tracker: 'Tracker',
  Calculator: 'Calculator',
};

export type BeerStatus = 'pending' | 'fermenting' | 'conditioning' | 'ready';

export interface PinterProduct {
  id: string;
  name: string;
  style: string;
  abv: number;
  brewingDays: number;
  conditioningDays: number;
  description: string;
  imageUrl: string;
}

export interface TrackedBeer extends PinterProduct {
  trackingId: string;
  fermentationStartDate: string | null;
  conditioningStartDate: string | null;
  status: BeerStatus;
  kegColor: string;
  kegNickname: string;
}

export type { Session };
