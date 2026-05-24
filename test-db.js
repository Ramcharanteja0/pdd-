import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hpdnuczygunnkndzklaik.supabase.co';
const supabaseKey = 'sb_publishable_Wlvq-QD7k68Vi_LNEi9mWA_UiarPpgX';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase Connection...');
  try {
    const { data, error } = await supabase.from('alerts').select('*');
    if (error) throw error;
    
    console.log('✅ Connection Successful!');
    console.log(`✅ Found ${data.length} alerts in the database.`);
    data.forEach((alert, i) => {
      console.log(`   ${i + 1}. [${alert.type.toUpperCase()}] ${alert.title} in ${alert.zone}`);
    });
    console.log('\nEverything is running perfectly!');
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
  }
}

testConnection();
