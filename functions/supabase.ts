import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials');
}

// Cliente para operaciones normales
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente para operaciones administrativas
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey); 