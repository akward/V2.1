const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Gunakan environment variables dari Render
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

console.log('📊 Supabase Config:');
console.log('URL:', supabaseUrl ? '✅ Loaded' : '❌ Not loaded');
console.log('URL value:', supabaseUrl);
console.log('Key:', supabaseKey ? '✅ Loaded' : '❌ Not loaded');
console.log('Key preview:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'undefined');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    console.error('SUPABASE_URL:', supabaseUrl);
    console.error('SUPABASE_KEY:', supabaseKey ? '[HIDDEN]' : 'undefined');
    // Jangan exit di production, tapi kasih warning
    console.warn('⚠️ Continuing with missing credentials - this will cause errors!');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Test koneksi
async function testConnection() {
    try {
        console.log('📡 Testing Supabase connection...');
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('❌ Supabase connection failed:', error.message);
            console.error('Error details:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ Supabase connection successful!');
        }
    } catch (error) {
        console.error('❌ Supabase connection error:', error.message);
    }
}

testConnection();

module.exports = supabase;
