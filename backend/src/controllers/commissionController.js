const supabase = require('../config/supabase');

const getCommissions = async (req, res) => {
    try {
        const { sellerId, month, year } = req.query;

        let query = supabase
            .from('commissions')
            .select('*, users(name)');

        if (sellerId) {
            query = query.eq('seller_id', sellerId);
        }
        if (month && year) {
            query = query.eq('month', parseInt(month))
                .eq('year', parseInt(year));
        }

        const { data: commissions, error } = await query;

        if (error) throw error;

        res.json({
            success: true,
            commissions
        });
    } catch (error) {
        console.error('Get commissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getMonthlyRevenue = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Month and year are required'
            });
        }

        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('total_price')
            .gte('created_at', `${year}-${month.padStart(2, '0')}-01`)
            .lt('created_at', `${year}-${month.padStart(2, '0')}-${new Date(year, month, 0).getDate() + 1}`);

        if (error) throw error;

        const total = transactions.reduce((sum, t) => sum + t.total_price, 0);

        res.json({
            success: true,
            revenue: total
        });
    } catch (error) {
        console.error('Get revenue error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = { getCommissions, getMonthlyRevenue };