require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'MISSING');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing credentials!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        console.log('📡 Attempting to connect...');
        
        // Test dengan query sederhana
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('❌ Connection failed:', error.message);
            console.error('Error details:', error);
            return;
        }
        
        console.log('✅ Connection successful!');
        console.log('📊 Data:', data);
        
        // Coba insert test user
        const { data: user, error: insertError } = await supabase
            .from('users')
            .insert({
                email: 'test@example.com',
                password_hash: 'test123',
                role: 'seller',
                name: 'Test User'
            })
            .select();
        
        if (insertError) {
            console.log('⚠️ Insert test failed (mungkin user sudah ada):', insertError.message);
        } else {
            console.log('✅ Test user created:', user);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    }
}

testConnection();