const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Gunakan SUPABASE_URL dan SUPABASE_ANON_KEY
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

console.log('📊 Supabase Config:');
console.log('URL:', supabaseUrl ? '✅ Loaded' : '❌ Not loaded');
console.log('Key:', supabaseKey ? '✅ Loaded' : '❌ Not loaded');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
