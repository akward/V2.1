const user = checkAuth();
if (user && user.role !== 'seller') {
    alert('Access denied: Seller only');
    window.location.href = 'login.html';
}

loadUserInfo();
let selectedProductId = null;
let currentTransaction = null;

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
        if (section === 'sales') loadSalesProducts();
    });
});

// Load dashboard
async function loadDashboard() {
    try {
        const transactions = await window.api.transaction.getTransactions();
        const totalSales = transactions.transactions.length;
        const totalRevenue = transactions.transactions.reduce((sum, t) => sum + t.total_price, 0);
        
        document.getElementById('mySales').textContent = totalSales;
        document.getElementById('myRevenue').textContent = `Rp ${totalRevenue.toLocaleString()}`;
        
        // Get commission
        const commissions = await window.api.commission.getCommissions(user.id);
        const totalCommission = commissions.commissions.reduce((sum, c) => sum + c.amount, 0);
        document.getElementById('myCommission').textContent = `Rp ${totalCommission.toLocaleString()}`;
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

// Load products for sales
async function loadSalesProducts() {
    try {
        const result = await window.api.product.getProducts();
        const container = document.getElementById('salesProductsList');
        container.innerHTML = '';
        
        result.products.forEach(product => {
            const col = document.createElement('div');
            col.className = 'col-md-6';
            col.innerHTML = `
                <div class="product-card" onclick="selectProduct('${product.id}')" data-product-id="${product.id}">
                    <h5>${product.name}</h5>
                    <div class="price">Rp ${product.price.toLocaleString()}</div>
                    <div class="stock">Stock: ${product.stock}</div>
                </div>
            `;
            container.appendChild(col);
        });
    } catch (error) {
        console.error('Error loading sales products:', error);
    }
}

// Select product for sale
function selectProduct(productId) {
    selectedProductId = productId;
    
    document.querySelectorAll('#salesProductsList .product-card').forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.productId === productId) {
            card.classList.add('selected');
        }
    });
    
    // Show selected product info
    const productCards = document.querySelectorAll('#salesProductsList .product-card');
    let productName = '';
    let productPrice = 0;
    let productStock = 0;
    
    productCards.forEach(card => {
        if (card.dataset.productId === productId) {
            productName = card.querySelector('h5').textContent;
            productPrice = parseFloat(card.querySelector('.price').textContent.replace('Rp ', '').replace(/,/g, ''));
            productStock = parseInt(card.querySelector('.stock').textContent.replace('Stock: ', ''));
        }
    });
    
    document.getElementById('selectedProductInfo').innerHTML = `
        <p><strong>${productName}</strong></p>
        <p>Price: Rp ${productPrice.toLocaleString()}</p>
        <p>Stock available: ${productStock}</p>
    `;
}

// Process sale
document.getElementById('saleForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!selectedProductId) {
        alert('Please select a product first');
        return;
    }
    
    const quantity = parseInt(document.getElementById('saleQuantity').value);
    const address = document.getElementById('saleAddress').value;
    
    if (!quantity || quantity < 1) {
        alert('Please enter a valid quantity');
        return;
    }
    
    if (!address.trim()) {
        alert('Please enter a delivery address');
        return;
    }
    
    try {
        const result = await window.api.transaction.createTransaction(
            selectedProductId,
            quantity,
            address
        );
        
        currentTransaction = result.transaction;
        alert('Sale completed successfully!');
        
        // Show receipt
        await showReceipt(result.transaction);
        
        // Reset form
        document.getElementById('saleQuantity').value = '';
        document.getElementById('saleAddress').value = '';
        document.getElementById('selectedProductInfo').innerHTML = '<p class="text-muted">No product selected</p>';
        selectedProductId = null;
        
        // Reload products
        loadSalesProducts();
        loadDashboard();
    } catch (error) {
        alert('Error processing sale: ' + error.message);
    }
});

// Show receipt
async function showReceipt(transaction) {
    try {
        // Get full transaction details
        const transactions = await window.api.transaction.getTransactions();
        const transactionData = transactions.transactions.find(t => t.id === transaction.id);
        
        if (!transactionData) return;
        
        const receiptHTML = `
            <div class="receipt-box mt-3">
                <h5>Receipt</h5>
                <pre>
================================
        RECEIPT
================================
Product: ${transactionData.products.name}
Quantity: ${transactionData.quantity}
Price: Rp ${transactionData.products.price.toLocaleString()}
Total: Rp ${transactionData.total_price.toLocaleString()}
Address: ${transactionData.address}
Seller: ${transactionData.users.name}
Date: ${new Date(transactionData.created_at).toLocaleString()}
================================
                </pre>
                <div class="mt-2">
                    <button class="btn btn-primary" onclick="window.print()">
                        <i class="bi bi-printer"></i> Print
                    </button>
                    <button class="btn btn-success" onclick="downloadReceipt()">
                        <i class="bi bi-file-pdf"></i> Download PDF
                    </button>
                </div>
            </div>
        `;
        
        // Remove old receipt
        const oldReceipt = document.getElementById('receiptContainer');
        if (oldReceipt) oldReceipt.remove();
        
        const receiptContainer = document.createElement('div');
        receiptContainer.id = 'receiptContainer';
        receiptContainer.innerHTML = receiptHTML;
        document.querySelector('#sales-section .row').appendChild(receiptContainer);
    } catch (error) {
        console.error('Error showing receipt:', error);
    }
}

// Download PDF receipt
async function downloadReceipt() {
    try {
        if (!currentTransaction) {
            alert('No transaction to download');
            return;
        }
        
        // Generate simple PDF using browser print
        const receiptBox = document.querySelector('.receipt-box');
        if (!receiptBox) return;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Receipt</title>
                    <style>
                        body { font-family: monospace; padding: 20px; }
                        .receipt-box { max-width: 600px; margin: 0 auto; }
                    </style>
                </head>
                <body>
                    ${receiptBox.innerHTML}
                    <script>
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 500);
                    <\/script>
                </body>
            </html>
        `);
        printWindow.document.close();
    } catch (error) {
        alert('Error downloading receipt: ' + error.message);
    }
}

// Initial load
loadDashboard();