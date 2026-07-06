require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? supabaseKey.substring(0, 30) + '...' : 'MISSING');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing credentials!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        console.log('📡 Attempting to connect...');
        
        // Test query
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(5);
        
        if (error) {
            console.error('❌ Connection failed:', error.message);
            console.error('Error details:', error);
            return;
        }
        
        console.log('✅ Connection successful!');
        console.log('📊 Users found:', data?.length || 0);
        console.log('📊 Sample data:', data);
        
        // If no users, insert test user
        if (!data || data.length === 0) {
            console.log('📝 No users found. Creating test user...');
            
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert({
                    email: 'owner@example.com',
                    password_hash: 'owner123',
                    role: 'owner',
                    name: 'Owner Utama'
                })
                .select();
            
            if (insertError) {
                console.error('❌ Failed to create user:', insertError.message);
            } else {
                console.log('✅ Test user created:', newUser);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    }
}

testConnection();