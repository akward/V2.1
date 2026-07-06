require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const commissionRoutes = require('./routes/commissionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files - Correct path
const frontendPath = path.join(__dirname, '../../frontend/public');
console.log('📁 Serving static files from:', frontendPath);

// Check if frontend path exists
if (!fs.existsSync(frontendPath)) {
    console.error('❌ Frontend path not found:', frontendPath);
    process.exit(1);
}

// Serve static files
app.use(express.static(frontendPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/commissions', commissionRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch all - serve login.html for SPA
app.get('*', (req, res) => {
    // Check if file exists
    const filePath = path.join(frontendPath, req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        res.sendFile(filePath);
    } else {
        // If file not found, serve login.html
        res.sendFile(path.join(frontendPath, 'login.html'));
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

app.listen(PORT, () => {
    console.log('🚀 Server running on port', PORT);
    console.log('📍 http://localhost:' + PORT);
    console.log('📁 Static files:', frontendPath);
});