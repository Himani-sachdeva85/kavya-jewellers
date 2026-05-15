/**
 * Kavya Jewellers - Core Application Logic
 */

let visibleCount = 20;
const stepCount = 12;
const cartBadge = document.getElementById('cart-count');
const wishlistBadge = document.getElementById('wishlist-count');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadWishlist();
    renderCart(); // If on cart page
    updateBadges();

    // Infinite Scroll Implementation
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            if (visibleCount < PRODUCTS.length) {
                visibleCount += stepCount;
                loadProducts();
            }
        }
    });

    // Footer Reveal Animation
    const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.footer-col').forEach(col => {
        col.classList.add('reveal-col');
        footerObserver.observe(col);
    });

    // Sync static product heart icons
    syncHeartIcons();
});

/**
 * Sync heart icons for all product cards based on wishlist state
 */
function syncHeartIcons() {
    const wishlist = JSON.parse(localStorage.getItem('kavya_wishlist')) || [];
    document.querySelectorAll('.product-card[data-id]').forEach(card => {
        const id = parseInt(card.dataset.id);
        const heartIcon = card.querySelector('.btn-wishlist i');
        if (heartIcon) {
            const isIn = wishlist.includes(id);
            heartIcon.className = `${isIn ? 'fas' : 'far'} fa-heart`;
            heartIcon.style.color = isIn ? '#ff4d4d' : '';
        }
    });
}

/**
 * Render products to the grid
 */
function loadProducts() {
    const container = document.getElementById('product-grid');
    if (!container) return;

    const currentProducts = PRODUCTS.slice(0, visibleCount);
    const existingIds = Array.from(container.querySelectorAll('[data-id]')).map(el => el.dataset.id.toString());
    
    currentProducts.forEach(product => {
        if (!existingIds.includes(product.id.toString())) {
            const card = createProductCard(product);
            card.dataset.id = product.id;
            container.appendChild(card);
        }
    });
    
    if (typeof syncHeartIcons === 'function') syncHeartIcons();
}

/**
 * Create a product card element
 */
function createProductCard(p, showTags = true) {
    const div = document.createElement('div');
    div.className = 'product-card animate-fade-in';

    const wishlist = JSON.parse(localStorage.getItem('kavya_wishlist')) || [];
    const isInWishlist = wishlist.includes(p.id);

    div.innerHTML = `
        <div class="product-image">
            ${(showTags && p.featured) ? '<span class="new-tag">New Arrival</span>' : ''}
            <img src="${p.image}" alt="${p.name}" loading="lazy">
        </div>
        <div class="product-info">
            <p class="product-category">${p.category}</p>
            <h3 class="product-name">${p.name}</h3>
            <p class="product-price">₹${p.price.toLocaleString('en-IN')}</p>
        </div>
        <div class="product-actions">
            <button class="btn-add-cart" onclick="addToCart(${p.id})">Add to Cart</button>
            <button class="btn-wishlist" onclick="toggleWishlist(${p.id})">
                <i class="${isInWishlist ? 'fas' : 'far'} fa-heart" ${isInWishlist ? 'style="color: #ff4d4d;"' : ''}></i>
            </button>
        </div>
    `;

    return div;
}

/**
 * Filter Products by Category
 */
function filterByCategory(category) {
    visibleCount = 100; // Show all when filtering
    const container = document.getElementById('product-grid');
    if (!container) return;

    // Scroll to products
    container.scrollIntoView({ behavior: 'smooth' });

    const filtered = PRODUCTS.filter(p => 
        p.category.toLowerCase() === category.toLowerCase() || 
        p.type.toLowerCase().includes(category.toLowerCase()) ||
        p.name.toLowerCase().includes(category.toLowerCase())
    );
    container.innerHTML = '';
    
    filtered.forEach(p => {
        container.appendChild(createProductCard(p, false)); // No tags in filtered view
    });

    // Update section title if it exists
    const title = document.querySelector('.section-title + #product-grid')?.previousElementSibling;
    if (title && title.innerText === 'All Products') {
        title.innerText = `${category} Collection`;
    }
}

/**
 * Cart Functionality
 */
function addToCart(id) {
    let cart = JSON.parse(localStorage.getItem('kavya_cart')) || [];
    if (!cart.includes(id)) {
        cart.push(id);
        localStorage.setItem('kavya_cart', JSON.stringify(cart));
        updateBadges();
        showNotification("Item added to cart!");
    } else {
        showNotification("Item is already in cart");
    }
}

/**
 * Wishlist Functionality
 */
function toggleWishlist(id) {
    let wishlist = JSON.parse(localStorage.getItem('kavya_wishlist')) || [];
    if (!wishlist.includes(id)) {
        wishlist.push(id);
        showNotification("Added to wishlist ❤️");
    } else {
        wishlist = wishlist.filter(item => item !== id);
        showNotification("Removed from wishlist");
    }
    localStorage.setItem('kavya_wishlist', JSON.stringify(wishlist));
    updateBadges();
    
    // Update the heart icon in the current grid
    const cards = document.querySelectorAll(`[data-id="${id}"]`);
    cards.forEach(card => {
        const heartIcon = card.querySelector('.btn-wishlist i');
        if (heartIcon) {
            const isNowIn = wishlist.includes(id);
            heartIcon.className = `${isNowIn ? 'fas' : 'far'} fa-heart`;
            heartIcon.style.color = isNowIn ? '#ff4d4d' : '';
        }
    });

    // If we are on the wishlist page, refresh the grid
    if (document.getElementById('wishlist-grid')) {
        loadWishlist();
    }
}

/**
 * Wishlist Rendering Logic
 */
function loadWishlist() {
    const container = document.getElementById('wishlist-grid');
    if (!container) return;

    const wishlistIds = JSON.parse(localStorage.getItem('kavya_wishlist')) || [];
    const emptyMsg = document.getElementById('empty-wishlist');

    if (wishlistIds.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        container.innerHTML = '';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    container.innerHTML = '';

    wishlistIds.forEach(id => {
        const p = PRODUCTS.find(product => product.id === id);
        if (p) {
            container.appendChild(createProductCard(p));
        }
    });
}

/**
 * Cart Rendering Logic (Centralized)
 */
function renderCart() {
    const container = document.getElementById('cart-items-list');
    const emptyMsg = document.getElementById('empty-cart');
    const content = document.getElementById('cart-content');
    if (!container) return;

    const cartIds = JSON.parse(localStorage.getItem('kavya_cart')) || [];
    
    if (cartIds.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        if (content) content.style.display = 'none';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    if (content) content.style.display = 'grid';
    container.innerHTML = '';

    let subtotal = 0;

    cartIds.forEach(id => {
        const p = PRODUCTS.find(product => product.id === id);
        if (p) {
            subtotal += p.price;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <img src="${p.image}" alt="${p.name}">
                <div class="cart-item-info">
                    <h4>${p.name}</h4>
                    <p style="font-size: 0.8rem; color: #888;">${p.category}</p>
                    <button class="btn-remove" onclick="removeFromCart(${p.id})">Remove</button>
                </div>
                <div class="cart-item-price">₹${p.price.toLocaleString('en-IN')}</div>
            `;
            container.appendChild(itemDiv);
        }
    });

    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    if (subtotalEl) subtotalEl.innerText = `₹${subtotal.toLocaleString('en-IN')}`;
    if (totalEl) totalEl.innerText = `₹${subtotal.toLocaleString('en-IN')}`;
}

function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('kavya_cart')) || [];
    cart = cart.filter(itemId => itemId !== id);
    localStorage.setItem('kavya_cart', JSON.stringify(cart));
    renderCart();
    updateBadges();
    showNotification("Item removed from cart");
}

function placeOrder() {
    const name = document.querySelector('input[placeholder="Full Name"]')?.value;
    if (!name) {
        showNotification("Please fill in your details");
        return;
    }
    showNotification("Order placed successfully! Thank you for shopping with Kavya Jewellers.");
    localStorage.removeItem('kavya_cart');
    setTimeout(() => window.location.href = 'index.html', 2000);
}

/**
 * Render Wishlist Items
 */
function loadWishlist() {
    const container = document.getElementById('wishlist-grid');
    const emptyMsg = document.getElementById('empty-wishlist');
    if (!container) return;

    const wishlistIds = JSON.parse(localStorage.getItem('kavya_wishlist')) || [];
    container.innerHTML = '';

    if (wishlistIds.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    const wishlistProducts = PRODUCTS.filter(p => wishlistIds.includes(p.id));

    wishlistProducts.forEach(product => {
        const card = createProductCard(product);
        // Change heart icon to solid if in wishlist
        const heartIcon = card.querySelector('.btn-wishlist i');
        if (heartIcon) {
            heartIcon.classList.remove('far');
            heartIcon.classList.add('fas');
            heartIcon.style.color = '#ff4d4d';
        }
        container.appendChild(card);
    });
}

/**
 * Update UI Badges
 */
function updateBadges() {
    const cart = JSON.parse(localStorage.getItem('kavya_cart')) || [];
    const wishlist = JSON.parse(localStorage.getItem('kavya_wishlist')) || [];

    if (cartBadge) {
        cartBadge.innerText = cart.length;
        if (cart.length > 0) cartBadge.classList.add('visible');
        else cartBadge.classList.remove('visible');
    }
    
    if (wishlistBadge) {
        wishlistBadge.innerText = wishlist.length;
        if (wishlist.length > 0) wishlistBadge.classList.add('visible');
        else wishlistBadge.classList.remove('visible');
    }
}

/**
 * Simple Notification System
 */
function showNotification(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #1A1A1A;
        color: white;
        padding: 12px 25px;
        border-radius: 5px;
        z-index: 9999;
        font-size: 0.9rem;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideIn 0.3s forwards;
    `;
    toast.innerText = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Keyframes for notification
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .animate-fade-in {
        animation: fadeIn 0.6s ease-out forwards;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);
