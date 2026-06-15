// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Ersetze diese beiden Werte mit deinen echten Projektdaten aus den Supabase-Einstellungen (API -> Project URL & anon key)
const supabaseUrl = "https://cpuvameaqyylazwtasaq.supabase.co/";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwdXZhbWVhcXl5bGF6d3Rhc2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1Njc4MzMsImV4cCI6MjA5NjE0MzgzM30.hG6v4P_-TYWqFiAuc77OOtq2X3mrN0zxBoqDSNsdut4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);