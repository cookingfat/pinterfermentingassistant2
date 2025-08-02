import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// IMPORTANT: Replace with your Supabase project's URL and Anon Key.
// You can get these from your Supabase project's API settings.
const supabaseUrl = 'https://zsiqsfcvcgnsravhypdd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXFzZmN2Y2duc3Jhdmh5cGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MjgxNzAsImV4cCI6MjA2OTIwNDE3MH0.fkqO94Lu9qVJKp-HrGfPEu5a4aXziEXCqsvWpMQVTqM';

if (supabaseUrl === 'https://zsiqsfcvcgnsravhypdd.supabase.co' || supabaseAnonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXFzZmN2Y2duc3Jhdmh5cGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MjgxNzAsImV4cCI6MjA2OTIwNDE3MH0.fkqO94Lu9qVJKp-HrGfPEu5a4aXziEXCqsvWpMQVTqM') {
    // This provides a warning in the console if the credentials are not updated.
    // It helps with initial setup and debugging.
    console.warn(`
      ********************************************************************************
      *                                                                              *
      *        SUPABASE IS NOT CONFIGURED!                                           *
      *                                                                              *
      *        Please update supabaseUrl and supabaseAnonKey in src/supabaseClient.ts *
      *        with your project's credentials from supabase.com.                    *
      *                                                                              *
      ********************************************************************************
    `);
}


export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
