import { createClient } from '@supabase/supabase-js';

// The user should replace these with their actual Supabase URL and Anon Key
// Add these to a .env file in the root directory:
// VITE_SUPABASE_URL=your_url
// VITE_SUPABASE_ANON_KEY=your_key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
