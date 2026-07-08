const supabase = require('../config/supabase');

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

        // === PERBAIKAN: Hitung tanggal dengan benar ===
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        
        // Validasi month (1-12)
        if (monthNum < 1 || monthNum > 12) {
            return res.status(400).json({
                success: false,
                message: 'Invalid month. Must be between 1 and 12'
            });
        }

        // Buat tanggal awal bulan (YYYY-MM-01)
        const startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
        
        // Hitung hari terakhir bulan dengan benar
        const lastDay = new Date(yearNum, monthNum, 0).getDate();
        const endDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        console.log('📅 Date range:', { startDate, endDate });

        // Query dengan range tanggal yang benar
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('total_price')
            .gte('created_at', startDate)
            .lte('created_at', endDate);

        if (error) {
            console.error('❌ Supabase error:', error);
            return res.status(500).json({
                success: false,
                message: 'Database error: ' + error.message
            });
        }

        const total = transactions.reduce((sum, t) => sum + t.total_price, 0);

        console.log('✅ Revenue calculated:', total);

        res.json({
            success: true,
            revenue: total,
            period: {
                month: monthNum,
                year: yearNum,
                startDate,
                endDate
            }
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
