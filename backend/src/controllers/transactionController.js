const supabase = require('../config/supabase');

const getTransactions = async (req, res) => {
    try {
        let query = supabase
            .from('transactions')
            .select('*, products(name, price), users(name)')
            .order('created_at', { ascending: false });

        // Filter by seller if seller role
        if (req.user.role === 'seller') {
            query = query.eq('seller_id', req.user.id);
        }

        const { data: transactions, error } = await query;

        if (error) throw error;

        res.json({
            success: true,
            transactions
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const createTransaction = async (req, res) => {
    try {
        const { productId, quantity, address } = req.body;
        const sellerId = req.user.id;

        if (!productId || !quantity || !address) {
            return res.status(400).json({
                success: false,
                message: 'Product ID, quantity, and address are required'
            });
        }

        // Get product
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (productError || !product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }

        const totalPrice = product.price * quantity;

        // Create transaction
        const { data: transaction, error: transactionError } = await supabase
            .from('transactions')
            .insert({
                product_id: productId,
                seller_id: sellerId,
                quantity: parseInt(quantity),
                total_price: totalPrice,
                address
            })
            .select()
            .single();

        if (transactionError) throw transactionError;

        // Update stock
        const { error: updateError } = await supabase
            .from('products')
            .update({ stock: product.stock - quantity })
            .eq('id', productId);

        if (updateError) throw updateError;

        // Create commission (10%)
        const commissionAmount = totalPrice * 0.1;
        const date = new Date();
        const { error: commissionError } = await supabase
            .from('commissions')
            .insert({
                seller_id: sellerId,
                transaction_id: transaction.id,
                amount: commissionAmount,
                month: date.getMonth() + 1,
                year: date.getFullYear()
            });

        if (commissionError) throw commissionError;

        res.status(201).json({
            success: true,
            message: 'Transaction created successfully',
            transaction
        });
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = { getTransactions, createTransaction };