// Check authentication
const user = checkAuth();
if (user && user.role !== 'owner') {
    alert('Access denied: Owner only');
    window.location.href = '/login.html';
}

loadUserInfo();

// Navigation
document.querySelectorAll('.sidebar .nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        const section = this.dataset.section;
        document.querySelectorAll('.section-content').forEach(el => el.style.display = 'none');
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) targetSection.style.display = 'block';
        
        if (section === 'dashboard') loadDashboard();
        if (section === 'revenue') loadRevenue();
        if (section === 'seller-commissions') loadCommissions();
        if (section === 'warehouse') loadWarehouse();
    });
});

// Load dashboard
async function loadDashboard() {
    try {
        const products = await window.api.product.getProducts();
        const sellers = await window.api.user.getUsersByRole('seller');
        const transactions = await window.api.transaction.getTransactions();
        
        document.getElementById('totalProducts').textContent = products.products.length;
        document.getElementById('totalSellers').textContent = sellers.users.length;
        
        const total = transactions.transactions.reduce((sum, t) => sum + t.total_price, 0);
        document.getElementById('totalRevenue').textContent = `Rp ${total.toLocaleString()}`;
        
        // Get total commissions
        const commissions = await window.api.commission.getCommissions();
        const totalCommission = commissions.commissions.reduce((sum, c) => sum + c.amount, 0);
        document.getElementById('totalCommissions').textContent = `Rp ${totalCommission.toLocaleString()}`;
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load revenue
async function loadRevenue() {
    try {
        const month = document.getElementById('monthSelect').value;
        const year = document.getElementById('yearSelect').value;
        const result = await window.api.commission.getMonthlyRevenue(month, year);
        document.getElementById('revenueDisplay').textContent = `Rp ${result.revenue.toLocaleString()}`;
    } catch (error) {
        console.error('Error loading revenue:', error);
    }
}

// Load commissions
async function loadCommissions() {
    try {
        const result = await window.api.commission.getCommissions();
        const tbody = document.getElementById('commissionBody');
        tbody.innerHTML = '';
        
        if (result.commissions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No commissions found</td></tr>';
            return;
        }
        
        for (const commission of result.commissions) {
            const tr = document.createElement('tr');
            const date = new Date(commission.created_at);
            tr.innerHTML = `
                <td>${commission.users?.name || 'Unknown'}</td>
                <td><strong>Rp ${commission.amount.toLocaleString()}</strong></td>
                <td>${commission.month}</td>
                <td>${commission.year}</td>
                <td>${date.toLocaleDateString()}</td>
            `;
            tbody.appendChild(tr);
        }
    } catch (error) {
        console.error('Error loading commissions:', error);
    }
}

// Load warehouse
async function loadWarehouse() {
    try {
        const result = await window.api.product.getProducts();
        const tbody = document.getElementById('warehouseBody');
        tbody.innerHTML = '';
        
        if (result.products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No products in warehouse</td></tr>';
            return;
        }
        
        result.products.forEach(product => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${product.name}</strong></td>
                <td>Rp ${product.price.toLocaleString()}</td>
                <td><span class="badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}">${product.stock}</span></td>
                <td>Rp ${(product.price * product.stock).toLocaleString()}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading warehouse:', error);
    }
}

// Add admin
document.getElementById('addAdminForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('adminName').value;
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const confirmPassword = document.getElementById('adminPasswordConfirm').value;
    
    if (password !== confirmPassword) {
        alert('Password tidak cocok!');
        return;
    }
    
    if (password.length < 6) {
        alert('Password minimal 6 karakter!');
        return;
    }
    
    try {
        await window.api.user.addUser(email, name, password, 'admin');
        alert('✅ Admin berhasil ditambahkan!');
        document.getElementById('addAdminForm').reset();
        loadDashboard();
    } catch (error) {
        alert('❌ Error adding admin: ' + error.message);
    }
});

// Populate year select
const yearSelect = document.getElementById('yearSelect');
if (yearSelect) {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 5; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

// Initial load
loadDashboard();

console.log('✅ Owner loaded successfully');