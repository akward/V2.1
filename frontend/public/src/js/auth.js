// Handle login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const alert = document.getElementById('alert');
    const loginBtn = document.getElementById('loginBtn');
    const loginText = document.getElementById('loginText');
    const loginSpinner = document.getElementById('loginSpinner');
    
    alert.style.display = 'none';
    loginBtn.disabled = true;
    loginText.textContent = 'Loading...';
    loginSpinner.style.display = 'inline-block';
    
    try {
        const result = await window.api.auth.login(email, password);
        
        if (result.success) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            
            // Redirect based on role
            const role = result.user.role;
            if (role === 'owner') {
                window.location.href = '/owner.html';
            } else if (role === 'admin') {
                window.location.href = '/admin.html';
            } else if (role === 'seller') {
                window.location.href = '/seller.html';
            }
        } else {
            alert.textContent = result.message || 'Login failed';
            alert.style.display = 'block';
        }
    } catch (error) {
        alert.textContent = 'Error: ' + error.message;
        alert.style.display = 'block';
    } finally {
        loginBtn.disabled = false;
        loginText.textContent = 'Login';
        loginSpinner.style.display = 'none';
    }
});

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user.id) {
        window.location.href = '/login.html';
        return null;
    }
    
    return user;
}

// Load user info
function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    
    if (userNameEl) userNameEl.textContent = user.name || 'User';
    if (userEmailEl) userEmailEl.textContent = user.email || '';
}

console.log('✅ Auth loaded successfully');