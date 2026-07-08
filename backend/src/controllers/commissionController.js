const supabase = require('../config/supabase');

const getCommissions = async (req, res) => {
    try {
        const { sellerId, month, year } = req.query;
        const userRole = req.user.role;
        const userId = req.user.id;

        console.log('📊 Getting commissions:', { sellerId, month, year, userRole, userId });

        let query = supabase
            .from('commissions')
            .select('*, users(name)');

        // Owner bisa melihat semua komisi
        if (userRole === 'owner') {
            if (sellerId) {
                query = query.eq('seller_id', sellerId);
            }
        } 
        // Seller hanya bisa melihat komisinya sendiri
        else if (userRole === 'seller') {
            query = query.eq('seller_id', userId);
        } 
        // Admin tidak punya akses ke komisi
        else {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view commissions'
            });
        }

        // Filter by month and year (optional)
        if (month && year) {
            query = query.eq('month', parseInt(month))
                .eq('year', parseInt(year));
        }

        const { data: commissions, error } = await query;

        if (error) {
            console.error('❌ Supabase error:', error);
            return res.status(500).json({
                success: false,
                message: 'Database error: ' + error.message
            });
        }

        console.log('✅ Commissions found:', commissions?.length || 0);

        res.json({
            success: true,
            commissions: commissions || []
        });
    } catch (error) {
        console.error('❌ Get commissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error: ' + error.message
        });
    }
};

const getMonthlyRevenue = async (req, res) => {
    try {
        const { month, year } = req.query;

        console.log('📊 Getting monthly revenue:', { month, year });

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Month and year are required'
            });
        }

        // Hanya owner yang bisa melihat revenue
        if (req.user.role !== 'owner') {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view revenue'
            });
        }

        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('total_price')
            .gte('created_at', `${year}-${month.padStart(2, '0')}-01`)
            .lt('created_at', `${year}-${month.padStart(2, '0')}-${new Date(year, month, 0).getDate() + 1}`);

        if (error) {
            console.error('❌ Supabase error:', error);
            return res.status(500).json({
                success: false,
                message: 'Database error: ' + error.message
            });
        }

        const total = transactions.reduce((sum, t) => sum + t.total_price, 0);

        res.json({
            success: true,
            revenue: total
        });
    } catch (error) {
        console.error('❌ Get revenue error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error: ' + error.message
        });
    }
};

module.exports = { getCommissions, getMonthlyRevenue };
