const user = checkAuth();
if (user && user.role !== 'admin') {
    alert('Access denied: Admin only');
    window.location.href = 'login.html';
}

loadUserInfo();

// Navigation
document.querySelectorAll('.sidebar .nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        const section = this.dataset.section;
        document.querySelectorAll('[id$="-section"]').forEach(el => el.style.display = 'none');
        document.getElementById(`${section}-section`).style.display = 'block';
        
        if (section === 'dashboard') loadDashboard();
        if (section === 'products') loadProducts();
        if (section === 'warehouse') loadWarehouse();
    });
});

// Load dashboard
async function loadDashboard() {
    try {
        const products = await window.api.product.getProducts();
        const sellers = await window.api.user.getUsersByRole('seller');
        
        document.getElementById('totalProducts').textContent = products.products.length;
        document.getElementById('totalSellers').textContent = sellers.users.length;
        
        const totalValue = products.products.reduce((sum, p) => sum + (p.price * p.stock), 0);
        document.getElementById('totalStockValue').textContent = `Rp ${totalValue.toLocaleString()}`;
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load products
async function loadProducts() {
    try {
        const result = await window.api.product.getProducts();
        const container = document.getElementById('productsList');
        container.innerHTML = '';
        
        result.products.forEach(product => {
            const col = document.createElement('div');
            col.className = 'col-md-4';
            col.innerHTML = `
                <div class="product-card">
                    <h5>${product.name}</h5>
                    <div class="price">Rp ${product.price.toLocaleString()}</div>
                    <div class="stock">Stock: ${product.stock}</div>
                </div>
            `;
            container.appendChild(col);
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Load warehouse
async function loadWarehouse() {
    try {
        const result = await window.api.product.getProducts();
        const tbody = document.getElementById('warehouseBody');
        tbody.innerHTML = '';
        
        result.products.forEach(product => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${product.name}</td>
                <td>Rp ${product.price.toLocaleString()}</td>
                <td>${product.stock}</td>
                <td>Rp ${(product.price * product.stock).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="openEditPrice('${product.id}', ${product.price})">
                        Edit Price
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading warehouse:', error);
    }
}

// Edit price
function openEditPrice(productId, currentPrice) {
    document.getElementById('editProductId').value = productId;
    document.getElementById('editProductPrice').value = currentPrice;
    const modal = new bootstrap.Modal(document.getElementById('editPriceModal'));
    modal.show();
}

async function savePriceEdit() {
    const productId = document.getElementById('editProductId').value;
    const newPrice = parseFloat(document.getElementById('editProductPrice').value);
    
    try {
        await window.api.product.editProductPrice(productId, newPrice);
        const modal = bootstrap.Modal.getInstance(document.getElementById('editPriceModal'));
        modal.hide();
        loadWarehouse();
        alert('Price updated successfully!');
    } catch (error) {
        alert('Error updating price: ' + error.message);
    }
}

// Add product
document.getElementById('addProductForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    
    try {
        await window.api.product.addProduct(name, price, stock);
        alert('Product added successfully!');
        document.getElementById('addProductForm').reset();
        loadDashboard();
        loadProducts();
        loadWarehouse();
    } catch (error) {
        alert('Error adding product: ' + error.message);
    }
});

// Add seller
document.getElementById('addSellerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('sellerName').value;
    const email = document.getElementById('sellerEmail').value;
    const password = document.getElementById('sellerPassword').value;
    
    try {
        await window.api.user.addUser(email, name, password, 'seller');
        alert('Seller added successfully!');
        document.getElementById('addSellerForm').reset();
        loadDashboard();
    } catch (error) {
        alert('Error adding seller: ' + error.message);
    }
});

// Initial load
loadDashboard();