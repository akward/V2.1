const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Pastikan membaca environment variable dengan benar
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('📊 Supabase Config:');
console.log('URL:', supabaseUrl ? '✅ Loaded' : '❌ Not loaded');
console.log('Key:', supabaseKey ? '✅ Loaded' : '❌ Not loaded');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials. Please check your .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('❌ Supabase connection failed:', error.message);
        } else {
            console.log('✅ Supabase connection successful!');
        }
    } catch (error) {
        console.error('❌ Supabase connection error:', error.message);
    }
}

testConnection();

module.exports = supabase;