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
            console.log('❌ Email or password missing');
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Get user from database
        console.log('📊 Querying Supabase for user:', email);
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        console.log('📊 Query result:', {
            userFound: !!user,
            error: error?.message || 'No error',
            userData: user ? {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                password_hash: user.password_hash
            } : null
        });

        if (error || !user) {
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
        console.log('=================================');
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