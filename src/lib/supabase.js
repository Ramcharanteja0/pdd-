import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hpdnuczygunkndzklaik.supabase.co';
const supabaseKey = 'sb_publishable_Wlvq-QD7k68Vi_LNEi9mWA_UiarPpgX';

export const supabase = createClient(supabaseUrl, supabaseKey);
