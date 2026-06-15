// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Ersetze diese beiden Werte mit deinen echten Projektdaten aus den Supabase-Einstellungen (API -> Project URL & anon key)
const supabaseUrl = 'DEINE_SUPABASE_URL';
const supabaseAnonKey = 'DEIN_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);