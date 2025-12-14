// App State
const state = {
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    cart: []
};

const API_URL = '/api';

// Helper Functions
function showPage(pageName) {
    document.querySelectorAll('.content-page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`${pageName}-page`).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

    // Load page data
    loadPageData(pageName);
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(state.token && { 'Authorization': `Bearer ${state.token}` })
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: { ...headers, ...options.headers }
        });

        // Check content-type before parsing
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // If not JSON, get text to provide better error message
            const text = await response.text();
            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }
            throw new Error('Server returned non-JSON response');
        }

        if (!response.ok) {
            throw new Error(data.error || 'An error occurred');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Authentication
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        state.token = response.token;
        state.user = response.user;
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        document.getElementById('login-page').classList.remove('active');
        document.getElementById('app').classList.add('active');
        
        document.getElementById('user-name').textContent = response.user.full_name;
        document.getElementById('user-role').textContent = response.user.role;

        loadDashboard();
    } catch (error) {
        document.getElementById('login-error').textContent = error.message;
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.reload();
});

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.getAttribute('data-page');
        showPage(page);
    });
});

// Mobile menu toggle
document.getElementById('mobile-menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('active');
});

// Load Page Data
async function loadPageData(pageName) {
    switch (pageName) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'products':
            await loadProducts();
            break;
        case 'stock':
            await loadStockMovements();
            break;
        case 'sales':
            await loadPOSProducts();
            break;
        case 'reports':
            await loadProfitLossReport();
            break;
        case 'attendance':
            await loadAttendance();
            break;
        case 'users':
            await loadUsers();
            break;
    }
}

// Dashboard
async function loadDashboard() {
    try {
        const stats = await apiCall('/dashboard/stats');
        
        document.getElementById('stat-products').textContent = stats.total_products;
        document.getElementById('stat-low-stock').textContent = stats.low_stock_products;
        document.getElementById('stat-today-sales').textContent = formatCurrency(stats.today_sales_total);
        document.getElementById('stat-attendance').textContent = stats.today_attendance;
        document.getElementById('month-sales-total').textContent = formatCurrency(stats.month_sales_total);
        document.getElementById('month-sales-count').textContent = `${stats.month_sales_count} transactions`;

        const activities = await apiCall('/dashboard/recent-activities');
        const activitiesHtml = activities.map(activity => `
            <div class="activity-item">
                <div style="display: flex; justify-content: space-between;">
                    <div>
                        <strong>${activity.reference}</strong>
                        <div style="font-size: 12px; color: var(--text-secondary);">
                            by ${activity.user_name}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div>${activity.type === 'sale' ? formatCurrency(activity.amount) : activity.amount + ' units'}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">
                            ${formatDate(activity.created_at)}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        document.getElementById('recent-activities').innerHTML = activitiesHtml || '<p class="text-muted">No recent activities</p>';
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Products
async function loadProducts() {
    try {
        const products = await apiCall('/products');
        const tbody = document.getElementById('products-table-body');

        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No products found</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.sku}</td>
                <td>${product.name}</td>
                <td>${product.category || '-'}</td>
                <td>${formatCurrency(product.purchase_price)}</td>
                <td>${formatCurrency(product.selling_price)}</td>
                <td>${product.warehouse_stock}</td>
                <td>${product.cashier_stock}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Populate product selects
        const productOptions = products.map(p => 
            `<option value="${p.id}">${p.name} (${p.sku})</option>`
        ).join('');

        ['receive-product-select', 'transfer-product-select', 'adjust-product-select'].forEach(id => {
            document.getElementById(id).innerHTML = '<option value="">Select Product</option>' + productOptions;
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Add Product
document.getElementById('add-product-btn').addEventListener('click', () => {
    showModal('add-product-modal');
});

document.getElementById('add-product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        await apiCall('/products', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        closeModal('add-product-modal');
        e.target.reset();
        await loadProducts();
    } catch (error) {
        alert('Error adding product: ' + error.message);
    }
});

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        await apiCall(`/products/${id}`, { method: 'DELETE' });
        await loadProducts();
    } catch (error) {
        alert('Error deleting product: ' + error.message);
    }
}

// Stock Management
async function loadStockMovements() {
    try {
        const movements = await apiCall('/stock/movements');
        const tbody = document.getElementById('stock-movements-table-body');

        if (movements.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No stock movements found</td></tr>';
            return;
        }

        tbody.innerHTML = movements.map(movement => `
            <tr>
                <td>${formatDate(movement.created_at)}</td>
                <td>${movement.product_name} (${movement.sku})</td>
                <td><span class="badge badge-${movement.type === 'in' ? 'success' : movement.type === 'out' ? 'danger' : 'warning'}">${movement.type}</span></td>
                <td>${movement.from_location || '-'}</td>
                <td>${movement.to_location || '-'}</td>
                <td>${movement.quantity}</td>
                <td>${movement.user_name}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading stock movements:', error);
    }
}

document.getElementById('receive-stock-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        await apiCall('/stock/receive', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        closeModal('receive-stock-modal');
        e.target.reset();
        await loadStockMovements();
    } catch (error) {
        alert('Error receiving stock: ' + error.message);
    }
});

document.getElementById('transfer-stock-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        await apiCall('/stock/transfer', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        closeModal('transfer-stock-modal');
        e.target.reset();
        await loadStockMovements();
    } catch (error) {
        alert('Error transferring stock: ' + error.message);
    }
});

document.getElementById('adjust-stock-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        await apiCall('/stock/adjust', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        closeModal('adjust-stock-modal');
        e.target.reset();
        await loadStockMovements();
    } catch (error) {
        alert('Error adjusting stock: ' + error.message);
    }
});

// POS / Sales
async function loadPOSProducts() {
    try {
        const products = await apiCall('/products');
        const grid = document.getElementById('pos-products-grid');

        const availableProducts = products.filter(p => p.cashier_stock > 0);

        if (availableProducts.length === 0) {
            grid.innerHTML = '<p class="text-muted">No products available in cashier</p>';
            return;
        }

        grid.innerHTML = availableProducts.map(product => `
            <div class="product-item" onclick="addToCart(${product.id}, '${product.name}', ${product.selling_price}, ${product.cashier_stock})">
                <div class="name">${product.name}</div>
                <div class="price">${formatCurrency(product.selling_price)}</div>
                <div class="stock">${product.cashier_stock} in stock</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading POS products:', error);
    }
}

// Product search
document.getElementById('product-search').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll('.product-item').forEach(item => {
        const name = item.querySelector('.name').textContent.toLowerCase();
        item.style.display = name.includes(searchTerm) ? 'block' : 'none';
    });
});

function addToCart(productId, name, price, maxStock) {
    const existingItem = state.cart.find(item => item.product_id === productId);

    if (existingItem) {
        if (existingItem.quantity < maxStock) {
            existingItem.quantity++;
            existingItem.subtotal = existingItem.quantity * price;
        } else {
            alert('Not enough stock');
            return;
        }
    } else {
        state.cart.push({
            product_id: productId,
            name,
            unit_price: price,
            quantity: 1,
            subtotal: price
        });
    }

    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    
    if (state.cart.length === 0) {
        cartItems.innerHTML = '<p class="text-muted">Cart is empty</p>';
        document.getElementById('cart-total').textContent = formatCurrency(0);
        return;
    }

    cartItems.innerHTML = state.cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${formatCurrency(item.unit_price)}</div>
            </div>
            <div class="cart-item-quantity">
                <button onclick="changeQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity(${index}, 1)">+</button>
            </div>
            <div>${formatCurrency(item.subtotal)}</div>
            <i class="fas fa-times cart-item-remove" onclick="removeFromCart(${index})"></i>
        </div>
    `).join('');

    const total = state.cart.reduce((sum, item) => sum + item.subtotal, 0);
    document.getElementById('cart-total').textContent = formatCurrency(total);
}

function changeQuantity(index, change) {
    state.cart[index].quantity += change;
    
    if (state.cart[index].quantity <= 0) {
        state.cart.splice(index, 1);
    } else {
        state.cart[index].subtotal = state.cart[index].quantity * state.cart[index].unit_price;
    }
    
    updateCart();
}

function removeFromCart(index) {
    state.cart.splice(index, 1);
    updateCart();
}

document.getElementById('complete-sale-btn').addEventListener('click', async () => {
    if (state.cart.length === 0) {
        alert('Cart is empty');
        return;
    }

    const paymentMethod = document.getElementById('payment-method').value;
    const customerName = document.getElementById('customer-name').value;

    try {
        const response = await apiCall('/sales', {
            method: 'POST',
            body: JSON.stringify({
                items: state.cart,
                payment_method: paymentMethod,
                customer_name: customerName
            })
        });

        alert(`Sale completed!\nInvoice: ${response.invoice_number}\nTotal: ${formatCurrency(response.total_amount)}`);
        
        state.cart = [];
        updateCart();
        document.getElementById('customer-name').value = '';
        await loadPOSProducts();
    } catch (error) {
        alert('Error completing sale: ' + error.message);
    }
});

// Reports
async function loadProfitLossReport() {
    // Set default dates to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    document.getElementById('report-start-date').value = firstDay.toISOString().split('T')[0];
    document.getElementById('report-end-date').value = lastDay.toISOString().split('T')[0];

    await generateReport();
}

document.getElementById('generate-report-btn').addEventListener('click', generateReport);

async function generateReport() {
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;

    try {
        const report = await apiCall(`/dashboard/profit-loss?start_date=${startDate}&end_date=${endDate}`);

        document.getElementById('report-revenue').textContent = formatCurrency(report.revenue);
        document.getElementById('report-cost').textContent = formatCurrency(report.cost_of_goods);
        document.getElementById('report-gross-profit').textContent = formatCurrency(report.gross_profit);
        document.getElementById('report-expenses').textContent = formatCurrency(report.expenses);
        document.getElementById('report-net-profit').textContent = formatCurrency(report.net_profit);
        document.getElementById('report-margin').textContent = report.profit_margin + '%';

        // Color code net profit
        const netProfitEl = document.getElementById('report-net-profit');
        netProfitEl.className = report.net_profit >= 0 ? 'report-value text-green' : 'report-value text-red';
    } catch (error) {
        console.error('Error generating report:', error);
    }
}

// Attendance
async function loadAttendance() {
    try {
        const records = await apiCall('/attendance/today');
        const tbody = document.getElementById('attendance-table-body');

        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No attendance records today</td></tr>';
            return;
        }

        tbody.innerHTML = records.map(record => `
            <tr>
                <td>${record.full_name}</td>
                <td>${record.role}</td>
                <td>${formatDate(record.check_in)}</td>
                <td>${record.check_out ? formatDate(record.check_out) : '-'}</td>
                <td><span class="badge badge-${record.check_out ? 'success' : 'warning'}">${record.check_out ? 'Completed' : 'Active'}</span></td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading attendance:', error);
    }
}

document.getElementById('check-in-card').addEventListener('click', async () => {
    try {
        await apiCall('/attendance/check-in', { method: 'POST', body: JSON.stringify({}) });
        alert('Checked in successfully!');
        await loadAttendance();
    } catch (error) {
        alert('Error checking in: ' + error.message);
    }
});

document.getElementById('check-out-card').addEventListener('click', async () => {
    try {
        await apiCall('/attendance/check-out', { method: 'POST', body: JSON.stringify({}) });
        alert('Checked out successfully!');
        await loadAttendance();
    } catch (error) {
        alert('Error checking out: ' + error.message);
    }
});

// Users
async function loadUsers() {
    try {
        const users = await apiCall('/users');
        const tbody = document.getElementById('users-table-body');

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No users found</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.username}</td>
                <td>${user.full_name}</td>
                <td><span class="badge badge-success">${user.role}</span></td>
                <td>${user.email || '-'}</td>
                <td>${user.phone || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

document.getElementById('add-user-btn').addEventListener('click', () => {
    showModal('add-user-modal');
});

document.getElementById('add-user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        closeModal('add-user-modal');
        e.target.reset();
        await loadUsers();
    } catch (error) {
        alert('Error adding user: ' + error.message);
    }
});

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        await apiCall(`/users/${id}`, { method: 'DELETE' });
        await loadUsers();
    } catch (error) {
        alert('Error deleting user: ' + error.message);
    }
}

// Initialize app
if (state.token && state.user) {
    document.getElementById('login-page').classList.remove('active');
    document.getElementById('app').classList.add('active');
    document.getElementById('user-name').textContent = state.user.full_name;
    document.getElementById('user-role').textContent = state.user.role;
    loadDashboard();
}

// Make functions globally available in a namespace to avoid pollution
window.AppGrosir = {
    showModal,
    closeModal,
    deleteProduct,
    addToCart,
    changeQuantity,
    removeFromCart,
    deleteUser
};

// For backwards compatibility with inline event handlers
window.showModal = showModal;
window.closeModal = closeModal;
window.deleteProduct = deleteProduct;
window.addToCart = addToCart;
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;
window.deleteUser = deleteUser;
