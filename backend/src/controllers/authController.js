const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('=================================');
        console.log('🔐 LOGIN ATTEMPT');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('=================================');

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // === METHOD 1: Query dengan filter (tanpa .single()) ===
        console.log('📊 Method 1: Query dengan filter');
        const { data: users, error: queryError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        console.log('📊 Query result:', {
            dataLength: users?.length || 0,
            error: queryError?.message || 'No error',
            data: users ? users.map(u => ({
                id: u.id,
                email: u.email,
                name: u.name,
                role: u.role,
                password_hash: u.password_hash
            })) : []
        });

        let user = null;

        if (users && users.length > 0) {
            user = users[0];
            console.log('✅ User found with filter query');
        } else {
            console.log('❌ No user found with filter query');
            
            // === METHOD 2: Coba dengan .single() ===
            console.log('📊 Method 2: Query dengan .single()');
            const { data: singleUser, error: singleError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();
            
            if (!singleError && singleUser) {
                user = singleUser;
                console.log('✅ User found with .single()');
            } else {
                console.log('❌ .single() error:', singleError?.message);
            }
        }

        // === METHOD 3: Bypass untuk Testing ===
        if (!user && email === 'owner@example.com' && password === 'owner123') {
            console.log('⚠️ USING BYPASS FOR TESTING');
            user = {
                id: 'bypass-id-' + Date.now(),
                email: 'owner@example.com',
                password_hash: 'owner123',
                role: 'owner',
                name: 'Owner Utama'
            };
        }

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
        console.log('Match:', user.password_hash === password ? '✅ YES' : '❌ NO');
        
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
            process.env.JWT_SECRET || 'fallback-secret-key',
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
