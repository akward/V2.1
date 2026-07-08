const supabase = require('../config/supabase');

const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;

        console.log('📊 Getting users with role:', role);

        if (!['owner', 'admin', 'seller'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be owner, admin, or seller'
            });
        }

        // Query dengan error handling yang lebih baik
        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, email, role, created_at')
            .eq('role', role)
            .order('name');

        if (error) {
            console.error('❌ Supabase error:', error);
            return res.status(500).json({
                success: false,
                message: 'Database error: ' + error.message
            });
        }

        console.log('✅ Users found:', users?.length || 0);

        res.json({
            success: true,
            users: users || []
        });
    } catch (error) {
        console.error('❌ Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error: ' + error.message
        });
    }
};

const addUser = async (req, res) => {
    try {
        const { email, name, password, role } = req.body;

        console.log('📊 Adding user:', { email, name, role });

        if (!email || !name || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (!['owner', 'admin', 'seller'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create user
        const { data: user, error } = await supabase
            .from('users')
            .insert({
                email,
                name,
                password_hash: password,
                role
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Insert error:', error);
            return res.status(500).json({
                success: false,
                message: 'Database error: ' + error.message
            });
        }

        console.log('✅ User created:', user.id);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('❌ Add user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error: ' + error.message
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, role, created_at')
            .eq('id', id)
            .single();

        if (error || !user) {
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

module.exports = { addUser, getUsersByRole, getUserById };
