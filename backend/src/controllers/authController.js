const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('=================================');
        console.log('🔐 LOGIN ATTEMPT');
        console.log('Email:', email);
        console.log('Password provided:', password ? 'Yes' : 'No');
        console.log('=================================');

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // === METHOD 1: Direct Query ke Supabase ===
        console.log('📊 Method 1: Direct query to Supabase');
        let user = null;
        let error = null;
        
        try {
            // Coba query langsung dengan filter
            const { data, error: queryError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email);
            
            console.log('📊 Query result:', {
                dataLength: data?.length || 0,
                error: queryError?.message || 'No error'
            });

            if (data && data.length > 0) {
                user = data[0];
                console.log('✅ User found with direct query');
            } else {
                console.log('❌ No user found with direct query');
            }
        } catch (queryErr) {
            console.error('❌ Direct query error:', queryErr.message);
        }

        // === METHOD 2: Fallback ke .single() ===
        if (!user) {
            console.log('📊 Method 2: Fallback to .single()');
            try {
                const { data, error: singleError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', email)
                    .single();
                
                if (!singleError && data) {
                    user = data;
                    console.log('✅ User found with .single()');
                }
            } catch (singleErr) {
                console.error('❌ .single() error:', singleErr.message);
            }
        }

        // === METHOD 3: Bypass untuk Testing ===
        if (!user && email === 'owner@example.com' && password === 'owner123') {
            console.log('⚠️ USING BYPASS FOR TESTING');
            user = {
                id: 'test-id-' + Date.now(),
                email: 'owner@example.com',
                password_hash: 'owner123',
                role: 'owner',
                name: 'Owner Utama'
            };
        }

        // Jika masih tidak ditemukan
        if (!user) {
            console.log('❌ User not found in database');
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Compare password
        console.log('🔑 Comparing passwords:');
        console.log('Database hash:', user.password_hash);
        console.log('Input password:', password);
        
        if (user.password_hash !== password) {
            console.log('❌ Password mismatch!');
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        console.log('✅ Login successful!');

        // Generate JWT
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role,
                name: user.name
            },
            process.env.JWT_SECRET || 'fallback-secret-key-change-this-in-production',
            { expiresIn: '7d' }
        );

        console.log('✅ Token generated successfully');
        console.log('=================================');

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error: ' + error.message
        });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, role')
            .eq('id', req.user.id)
            .single();

        if (error) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = { login, getCurrentUser };
