/**
 * Supabase Client
 * Database connection for flower persistence
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

/**
 * Get or create Supabase client
 */
export function getSupabase() {
    if (!supabase && supabaseUrl && supabaseKey) {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log('Supabase client initialized');
    }
    return supabase;
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured() {
    return !!(supabaseUrl && supabaseKey);
}
