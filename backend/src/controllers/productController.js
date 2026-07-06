const supabase = require('../config/supabase');

const getProducts = async (req, res) => {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('name');

        if (error) throw error;

        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const addProduct = async (req, res) => {
    try {
        const { name, price, stock } = req.body;
        const userId = req.user.id;

        if (!name || !price || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Name, price, and stock are required'
            });
        }

        const { data: product, error } = await supabase
            .from('products')
            .insert({
                name,
                price: parseFloat(price),
                stock: parseInt(stock),
                created_by: userId
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            message: 'Product added successfully',
            product
        });
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const editProductPrice = async (req, res) => {
    try {
        const { id } = req.params;
        const { price } = req.body;

        if (price === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Price is required'
            });
        }

        const { data: product, error } = await supabase
            .from('products')
            .update({ price: parseFloat(price) })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Price updated successfully',
            product
        });
    } catch (error) {
        console.error('Edit price error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = { getProducts, addProduct, editProductPrice };