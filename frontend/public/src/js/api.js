// Gunakan relative path atau absolute path
const API_URL = window.location.origin + '/api';

console.log('🌐 API URL:', API_URL);

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// API helper
const api = {
    async request(endpoint, options = {}) {
        const url = `${API_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        console.log('📤 Request:', { url, method: options.method || 'GET' });

        try {
            const response = await fetch(url, config);
            console.log('📥 Response status:', response.status);
            
            // Handle non-JSON responses
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('❌ Non-JSON response:', text);
                throw new Error('Server returned non-JSON response');
            }

            const data = await response.json();
            console.log('📦 Response data:', data);

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error('❌ API Error:', error);
            throw error;
        }
    },

    get(endpoint) {
        return this.request(endpoint);
    },

    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
};

// ... rest of the code remains the same

// Auth API
const authAPI = {
    login(email, password) {
        return api.post('/auth/login', { email, password });
    },
    getCurrentUser() {
        return api.get('/auth/me');
    }
};

// User API
const userAPI = {
    addUser(email, name, password, role) {
        return api.post('/users', { email, name, password, role });
    },
    getUsersByRole(role) {
        return api.get(`/users/role/${role}`);
    },
    getUserById(id) {
        return api.get(`/users/${id}`);
    }
};

// Product API
const productAPI = {
    getProducts() {
        return api.get('/products');
    },
    addProduct(name, price, stock) {
        return api.post('/products', { name, price, stock });
    },
    editProductPrice(productId, price) {
        return api.put(`/products/${productId}/price`, { price });
    }
};

// Transaction API
const transactionAPI = {
    getTransactions() {
        return api.get('/transactions');
    },
    createTransaction(productId, quantity, address) {
        return api.post('/transactions', { productId, quantity, address });
    }
};

// Commission API
const commissionAPI = {
    getCommissions(sellerId, month, year) {
        let url = '/commissions';
        const params = new URLSearchParams();
        
        // Hanya kirim sellerId jika ada dan user adalah owner
        // Tapi biarkan server yang menentukan berdasarkan role
        if (sellerId) {
            params.append('sellerId', sellerId);
        }
        if (month) params.append('month', month);
        if (year) params.append('year', year);
        
        const query = params.toString();
        if (query) url += `?${query}`;
        
        return api.get(url);
    },
    getMonthlyRevenue(month, year) {
        return api.get(`/commissions/revenue?month=${month}&year=${year}`);
    }
};

// Export all APIs
window.api = {
    auth: authAPI,
    user: userAPI,
    product: productAPI,
    transaction: transactionAPI,
    commission: commissionAPI
};

console.log('✅ API loaded successfully');

// Loading indicator
let loadingCount = 0;

function showLoading() {
    loadingCount++;
    const el = document.getElementById('loadingIndicator');
    if (el) el.style.display = 'block';
}

function hideLoading() {
    loadingCount--;
    if (loadingCount <= 0) {
        loadingCount = 0;
        const el = document.getElementById('loadingIndicator');
        if (el) el.style.display = 'none';
    }
}

// Tambahkan di setiap request
async request(endpoint, options = {}) {
    showLoading();
    try {
        // ... existing code ...
    } finally {
        hideLoading();
    }
}
