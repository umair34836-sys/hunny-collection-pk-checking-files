// Main Application JavaScript
import { db, auth } from './firebase-config.js';
import { collection, getDocs, getDoc, doc, query, orderBy, limit, addDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Check auth state
let currentUser = null;

// Global auth state listener
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateAuthLink(user);
    updateCartCount();
});

// Update auth link in header
function updateAuthLink(user) {
    const authLink = document.getElementById('auth-link');
    if (!authLink) return;

    if (user) {
        authLink.textContent = '👤 Account';
        authLink.href = param($m) '''' + '/' + [System.IO.Path]::GetFileNameWithoutExtension($m.Value.Trim('''')) + '''';
    } else {
        authLink.textContent = 'Login';
        authLink.href = param($m) '''' + '/' + [System.IO.Path]::GetFileNameWithoutExtension($m.Value.Trim('''')) + '''';
    }
}

// Perform logout
async function performLogout() {
    try {
        await signOut(auth);
        alert('Logged out successfully!');
        window.location.href = '/index';
    } catch (error) {
        alert('Error logging out: ' + error.message);
    }
}

// ========== BACKWARD COMPATIBILITY ==========
// Migrate old products (with only 'price' field) to new pricing structure
function migrateProductPricing(product) {
    // If product already has sellingPrice, it's already migrated
    if (product.sellingPrice !== undefined) {
        return {
            ...product,
            sellingPrice: product.sellingPrice,
            originalPrice: product.originalPrice || 0,
            costPrice: product.costPrice || 0
        };
    }
    
    // Migrate old product structure
    const price = product.price || 0;
    return {
        ...product,
        sellingPrice: price,
        originalPrice: Math.round(price * 1.3), // 30% higher as fake original price
        costPrice: 0, // Unknown cost price for old products
        price: price // Keep original for compatibility
    };
}

// Update cart count
export function updateCartCount() {
    const cartCountEl = document.getElementById('cart-count');
    if (!cartCountEl) return;
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    cartCountEl.textContent = count;
}

// Load categories
export async function loadCategories() {
    const container = document.getElementById('categories-container');
    if (!container) return;

    try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const categories = [];
        querySnapshot.forEach((doc) => {
            categories.push({ id: doc.id, ...doc.data() });
        });

        if (categories.length === 0) {
            container.innerHTML = '<p class="loading">Categories coming soon...</p>';
            return;
        }

        container.innerHTML = categories.map(cat => `
            <a href="/shop?category=${encodeURIComponent(cat.name)}" class="category-card">
                <div class="category-icon">🌸</div>
                <div class="category-name">${cat.name}</div>
            </a>
        `).join('');
    } catch (error) {
        // On slow internet, show friendly message instead of error
        if (error.code === 'unavailable' || error.message.includes('offline')) {
            container.innerHTML = '<p class="loading">Loading categories, please wait...</p>';
        } else {
            container.innerHTML = '<p class="loading">Categories coming soon...</p>';
        }
    }
}

// Load featured products
export async function loadFeaturedProducts(containerId = 'products-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(8));
        const querySnapshot = await getDocs(q);
        const products = [];
        querySnapshot.forEach((doc) => {
            products.push(migrateProductPricing({ id: doc.id, ...doc.data() }));
        });

        if (products.length === 0) {
            container.innerHTML = '<p class="loading">Products coming soon! Check back later.</p>';
            return;
        }

        container.innerHTML = products.map(product => {
            const sellingPrice = product.sellingPrice || product.price || 0;
            const originalPrice = product.originalPrice || 0;
            const discountPercent = originalPrice > sellingPrice ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;

            return `
                <a href="/product?id=${product.id}" class="product-card">
                    <div style="position: relative;">
                        <img src="${product.images?.[0] || 'https://via.placeholder.com/300x300/FFB6C1/333?text=No+Image'}"
                             alt="${product.name}" class="product-image">
                        ${discountPercent > 0 ? `<span class="discount-badge">🔥 ${discountPercent}% OFF</span>` : ''}
                    </div>
                    <div class="product-info">
                        <div class="product-category">${product.category}</div>
                        <div class="product-title">${product.name}</div>
                        <div class="product-price-group">
                            <span class="product-selling-price">Rs. ${sellingPrice.toLocaleString()}</span>
                            ${originalPrice > sellingPrice ? `<span class="product-original-price">Rs. ${originalPrice.toLocaleString()}</span>` : ''}
                        </div>
                    </div>
                </a>
            `;
        }).join('');
    } catch (error) {
        // On slow internet, keep loading state instead of showing error
        if (error.code === 'unavailable' || error.message.includes('offline')) {
            container.innerHTML = '<p class="loading">Loading products, please wait...</p>';
        } else {
            container.innerHTML = '<p class="loading">Products coming soon! Check back later.</p>';
        }
    }
}

// Load all products for shop page
export async function loadAllProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const products = [];
        querySnapshot.forEach((doc) => {
            products.push(migrateProductPricing({ id: doc.id, ...doc.data() }));
        });

        if (products.length === 0) {
            container.innerHTML = '<p class="loading">No products available</p>';
            return;
        }

        window.allProducts = products;
        renderProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = '<p class="loading">Error loading products</p>';
    }
}

// Render products helper
function renderProducts(products) {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = products.map(product => {
        const sellingPrice = product.sellingPrice || product.price || 0;
        const originalPrice = product.originalPrice || 0;
        const discountPercent = originalPrice > sellingPrice ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;
        
        return `
            <a href="/product?id=${product.id}" class="product-card">
                <div style="position: relative;">
                    <img src="${product.images?.[0] || 'https://via.placeholder.com/300x300/FFB6C1/333?text=No+Image'}"
                         alt="${product.name}" class="product-image">
                    ${discountPercent > 0 ? `<span class="discount-badge">🔥 ${discountPercent}% OFF</span>` : ''}
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <div class="product-title">${product.name}</div>
                    <div class="product-price-group">
                        <span class="product-selling-price">Rs. ${sellingPrice.toLocaleString()}</span>
                        ${originalPrice > sellingPrice ? `<span class="product-original-price">Rs. ${originalPrice.toLocaleString()}</span>` : ''}
                    </div>
                </div>
            </a>
        `;
    }).join('');
}

// Add to cart
export function addToCart(product, variant = {}, quantity = 1) {
    if (!currentUser) {
        alert('Please login to add items to cart');
        window.location.href = '/index';
        return false;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex(
        item => item.id === product.id && JSON.stringify(item.variant) === JSON.stringify(variant)
    );

    if (existingIndex > -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + quantity;
    } else {
        cart.push({ ...product, variant, quantity });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    return true;
}

// Get cart items
export function getCartItems() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

// Remove from cart
export function removeFromCart(index) {
    const cart = getCartItems();
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    if (window.renderCart) window.renderCart();
}

// Update cart quantity
export function updateCartQuantity(index, quantity) {
    const cart = getCartItems();
    if (quantity <= 0) {
        removeFromCart(index);
        return;
    }
    cart[index].quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    if (window.renderCart) window.renderCart();
}

// Render cart page
export function renderCartPage() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const totalFinalEl = document.getElementById('cart-total-final');
    if (!container) return;

    const cart = getCartItems();

    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart"><h2>Your cart is empty</h2><p class="loading">Add items to your cart to see them here</p><a href="/shop" class="btn-primary" style="display:inline-block;margin-top:20px;">Start Shopping</a></div>';
        if (totalEl) totalEl.textContent = '0';
        if (totalFinalEl) totalFinalEl.textContent = '0';
        return;
    }

    container.innerHTML = cart.map((item, index) => {
        const sellingPrice = item.sellingPrice || item.price || 0;
        return `
            <div class="cart-item">
                <img src="${item.images?.[0] || 'https://via.placeholder.com/100x100'}"
                     alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-category">${item.category}</p>
                    ${item.variant?.size ? `<p>Size: ${item.variant.size}</p>` : ''}
                    ${item.variant?.color ? `<p>Color: ${item.variant.color}</p>` : ''}
                    <p>Rs. ${sellingPrice.toLocaleString()} × ${item.quantity}</p>
                </div>
                <div class="cart-item-actions">
                    <button onclick="window.updateQuantity(${index}, ${item.quantity - 1})" class="btn-sm">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="window.updateQuantity(${index}, ${item.quantity + 1})" class="btn-sm">+</button>
                    <button onclick="window.removeFromCart(${index})" class="btn-sm btn-danger">Remove</button>
                </div>
            </div>
        `;
    }).join('');

    const total = cart.reduce((sum, item) => sum + (((item.sellingPrice || item.price) || 0) * (item.quantity || 1)), 0);
    if (totalEl) totalEl.textContent = total.toLocaleString();
    if (totalFinalEl) totalFinalEl.textContent = total.toLocaleString();
}

// Make functions available globally
window.removeFromCart = removeFromCart;
window.updateQuantity = updateCartQuantity;
window.renderCart = renderCartPage;

// Load single product by ID (optimized: fetches ONLY one document from Firestore)
export async function loadProduct(productId) {
    const container = document.getElementById('product-detail');
    const pageTitle = document.getElementById('page-title');
    if (!container) {
        console.error('Product detail container not found');
        return;
    }

    console.log('Loading single product with ID:', productId);

    try {
        // Fetch ONLY the single product document by ID — no full collection scan
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.error('Product not found:', productId);
            container.innerHTML = `
                <div class="loading">
                    <h2>Product not found</h2>
                    <p>The product you're looking for doesn't exist or has been removed.</p>
                    <a href="/shop" class="btn-primary" style="display:inline-block;margin-top:20px;">Browse Shop</a>
                </div>
            `;
            return;
        }

        const product = migrateProductPricing({ id: docSnap.id, ...docSnap.data() });
        console.log('Found product:', product.name);

        if (pageTitle) {
            pageTitle.textContent = `${product.name} - Hunny Collection PK`;
        }

        // Update Open Graph meta tags for product sharing
        updateProductOGTags(product);

        window.currentProduct = product;
        let selectedSize = null;

        // Get images array
        const images = product.images || [product.image || 'https://via.placeholder.com/500x500'];
        const mainImage = images[0] || 'https://via.placeholder.com/500x500';

        // Calculate prices with discount
        const sellingPrice = product.sellingPrice || product.price || 0;
        const originalPrice = product.originalPrice || 0;
        const discountPercent = originalPrice > sellingPrice ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;
        const costPrice = product.costPrice || 0;
        const profit = sellingPrice - costPrice;

        // Render product — main image loads immediately, thumbnails use lazy loading
        container.innerHTML = `
            <div class="product-detail-grid">
                <div class="product-images">
                    <div class="product-image-wrapper">
                        <button class="gallery-nav gallery-prev" onclick="previousImage()" id="prev-btn" style="display: ${images.length > 1 ? 'flex' : 'none'};">‹</button>
                        <img src="${mainImage}" alt="${product.name}" class="product-main-image" id="main-image">
                        <button class="gallery-nav gallery-next" onclick="nextImage()" id="next-btn" style="display: ${images.length > 1 ? 'flex' : 'none'};">›</button>
                    </div>
                    <div class="image-counter" id="image-counter" style="${images.length > 1 ? '' : 'display: none;'}">1 / ${images.length}</div>
                    ${discountPercent > 0 ? `<span class="product-detail-discount-badge">🔥 ${discountPercent}% OFF</span>` : ''}
                    ${images.length > 1 ? `
                        <div class="product-thumbnails">
                            ${images.map((img, idx) => `
                                <img src="${idx === 0 ? img : ''}" data-full-src="${img}" class="product-thumbnail ${idx === 0 ? 'active' : ''}"
                                     onclick="window.lazyChangeImage('${img}', this)" loading="lazy">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="product-details">
                    <span class="badge">${product.category}</span>
                    <h1>${product.name}</h1>
                    <div class="product-detail-price-group">
                        <span class="product-detail-selling-price">Rs. ${sellingPrice.toLocaleString()}</span>
                        ${originalPrice > sellingPrice ? `<span class="product-detail-original-price">Rs. ${originalPrice.toLocaleString()}</span>` : ''}
                    </div>
                    ${discountPercent > 0 ? `<p class="discount-savings">You save Rs. ${(originalPrice - sellingPrice).toLocaleString()}!</p>` : ''}
                    ${product.description ? `<p class="description">${product.description}</p>` : ''}

                    ${product.variants?.length ? `
                        <div class="variant-group">
                            <label>Size:</label>
                            <div class="size-options">
                                ${product.variants.map(size => `
                                    <button class="size-btn" onclick="selectSize('${size}', this)">${size}</button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div class="quantity-group">
                        <label>Quantity:</label>
                        <input type="number" id="quantity" value="1" min="1" class="quantity-input">
                    </div>

                    <button onclick="addToCartClick()" class="btn-primary btn-large">Add to Cart</button>
                    <button onclick="buyNow()" class="btn-secondary btn-large">Buy Now</button>

                    <!-- Share Buttons -->
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid var(--border-color);">
                        <h4 style="margin-bottom: 10px; color: var(--text-dark);">Share This Product</h4>
                        <p style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 10px;">📸 Share product images, price & description</p>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <button onclick="shareProductWhatsApp('${product.id}', '${product.name}')" class="btn-sm" style="background: #25d366; color: white; border: none; cursor: pointer;">
                                📱 WhatsApp
                            </button>
                            <button onclick="shareProductFacebook('${product.id}')" class="btn-sm" style="background: #1877f2; color: white; border: none; cursor: pointer;">
                                📘 Facebook
                            </button>
                            <button onclick="copyProductLink('${product.id}')" class="btn-sm" style="background: #6c757d; color: white; border: none; cursor: pointer;">
                                🔗 Copy Link
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading product:', error);
        // On slow internet, keep showing loading state instead of error
        container.innerHTML = `
            <div class="loading" style="text-align:center;padding:60px 20px;">
                <div style="border:4px solid #f3f3f3;border-top:4px solid var(--dark-pink);border-radius:50%;width:50px;height:50px;animation:spin 1s linear infinite;margin:20px auto;"></div>
                <p style="color:var(--text-light);margin-top:15px;">Loading product details, please wait...</p>
                <button onclick="window.loadProduct('${productId}')" class="btn-primary" style="margin-top:15px;">Retry</button>
            </div>
        `;
    }
}

// Lazy change image — loads thumbnail src on first click
window.lazyChangeImage = function(imageUrl, thumbnail) {
    if (!thumbnail.src || thumbnail.src === '' || thumbnail.src === window.location.href) {
        thumbnail.src = thumbnail.getAttribute('data-full-src');
    }
    document.getElementById('main-image').src = imageUrl;
    document.querySelectorAll('.product-thumbnail').forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
};

// Change main image (backwards compatibility)
window.changeImage = (imageUrl, thumbnail) => {
    document.getElementById('main-image').src = imageUrl;
    document.querySelectorAll('.product-thumbnail').forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
};

// Update Open Graph meta tags for product sharing
function updateProductOGTags(product) {
    const productImage = product.images?.[0] || product.image || 'https://i.ibb.co/ymfRN5Lm/product.jpg';
    const productUrl = window.location.href.split('?')[0] + '?id=' + product.id;
    
    // Get prices with discount
    const sellingPrice = product.sellingPrice || product.price || 0;
    const originalPrice = product.originalPrice || 0;
    const discountPercent = originalPrice > sellingPrice ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;
    
    // Create price description with discount
    let priceDescription = '';
    if (discountPercent > 0) {
        priceDescription = `🔥 ${discountPercent}% OFF! Now Rs. ${sellingPrice.toLocaleString()} (Was Rs. ${originalPrice.toLocaleString()}). Save Rs. ${(originalPrice - sellingPrice).toLocaleString()}!`;
    } else {
        priceDescription = `Rs. ${sellingPrice.toLocaleString()}`;
    }

    // Update Open Graph / Facebook meta tags using element IDs
    const ogImageEl = document.getElementById('og-image');
    if (ogImageEl) {
        ogImageEl.setAttribute('content', productImage);
        console.log('Updated og:image to:', productImage);
    }

    const ogPriceEl = document.getElementById('og-price');
    if (ogPriceEl) {
        ogPriceEl.setAttribute('content', sellingPrice);
    }

    // Update other OG tags with discount info
    updateMetaTag('property', 'og:title', `${product.name} - ${discountPercent > 0 ? discountPercent + '% OFF!' : 'Rs. ' + sellingPrice.toLocaleString()}`);
    updateMetaTag('property', 'og:description', `Buy ${product.name} for ${priceDescription} at Hunny Collection PK. ${product.description ? product.description.substring(0, 100) : ''} Cash on Delivery available!`);
    updateMetaTag('property', 'og:url', productUrl);
    
    // Add price currency and amount
    updateMetaTag('property', 'product:price:amount', sellingPrice.toString());
    updateMetaTag('property', 'product:price:currency', 'PKR');
    
    // Add original price for discount
    if (originalPrice > sellingPrice) {
        updateMetaTag('property', 'product:sale_price', sellingPrice.toString());
        updateMetaTag('property', 'product:original_price', originalPrice.toString());
    }

    // Update Twitter meta tags using element IDs
    const twitterImageEl = document.getElementById('twitter-image');
    if (twitterImageEl) {
        twitterImageEl.setAttribute('content', productImage);
        console.log('Updated twitter:image to:', productImage);
    }

    updateMetaTag('name', 'twitter:title', `${product.name} - ${discountPercent > 0 ? discountPercent + '% OFF!' : 'Rs. ' + sellingPrice.toLocaleString()}`);
    updateMetaTag('name', 'twitter:description', `Buy ${product.name} for ${priceDescription} at Hunny Collection PK. COD available!`);
    updateMetaTag('name', 'twitter:url', productUrl);

    // Update canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
        canonicalLink.href = productUrl;
    }

    console.log('✅ OG tags updated for product:', product.name);
    console.log('   Image:', productImage);
    console.log('   Price:', sellingPrice);
    console.log('   Discount:', discountPercent > 0 ? discountPercent + '%' : 'None');
    console.log('   URL:', productUrl);
}

// Generate shareable link with product image for WhatsApp
function generateWhatsAppShareLink(product) {
    const productImage = product.images?.[0] || product.image || '';
    const productUrl = window.location.href.split('?')[0] + '?id=' + product.id;
    const price = (product.price || 0).toLocaleString();
    const description = product.description ? product.description.substring(0, 200) : '';
    
    // Create a rich message with product details
    const message = `🌸 *${product.name}*\n\n` +
                   `💰 *Price:* Rs. ${price}\n\n` +
                   `${description ? '📝 *Description:*\n' + description + '\n\n' : ''}` +
                   `🛍️ *Hunny Collection PK*\n` +
                   `🔗 Shop now: ${productUrl}\n\n` +
                   `${productImage ? `\n📸 Product Image: ${productImage}` : ''}`;
    
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

// Helper function to update meta tags
function updateMetaTag(attrName, attrValue, content) {
    let metaTag = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    
    if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute(attrName, attrValue);
        document.head.appendChild(metaTag);
    }
    
    metaTag.setAttribute('content', content);
}

// Global functions for product page
window.selectSize = (size, btn) => {
    window.selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
};

window.addToCartClick = () => {
    const quantity = parseInt(document.getElementById('quantity')?.value || 1);
    const variant = window.selectedSize ? { size: window.selectedSize } : {};
    
    if (addToCart(window.currentProduct, variant, quantity)) {
        alert('Added to cart!');
    }
};

window.buyNow = () => {
    window.addToCartClick();
    setTimeout(() => {
        window.location.href = '/checkout';
    }, 500);
};

// Share functions - Web Share API with images
window.shareProductWhatsApp = async function(productId, productName) {
    const product = window.currentProduct;

    if (!product) {
        alert('Product not loaded yet. Please wait a moment.');
        return;
    }

    const url = window.location.href.split('?')[0] + '?id=' + productId;
    
    // Get prices with discount
    const sellingPrice = product.sellingPrice || product.price || 0;
    const originalPrice = product.originalPrice || 0;
    const discountPercent = originalPrice > sellingPrice ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;
    const savings = originalPrice - sellingPrice;
    
    const description = product.description || '';
    const mainImage = product.images?.[0] || product.image || '';

    // Create formatted message with discount highlight
    let message = `🌸 *${product.name}*\n\n`;
    
    // Price display with discount highlight
    if (discountPercent > 0) {
        message += `🔥 *SPECIAL OFFER! ${discountPercent}% OFF* 🔥\n\n`;
        message += `💰 *Offer Price: Rs. ${sellingPrice.toLocaleString()}*\n`;
        message += `~~Rs. ${originalPrice.toLocaleString()}~~ (Original Price)\n`;
        message += `🎁 *You Save Rs. ${savings.toLocaleString()}!*\n\n`;
    } else {
        message += `💰 Price: Rs. ${sellingPrice.toLocaleString()}\n\n`;
    }
    
    message += `${description ? '📝 Description:\n' + description + '\n\n' : ''}`;
    message += `🛍️ *Hunny Collection PK*\n`;
    message += `✅ Cash on Delivery Available\n`;
    message += `🚚 Fast Shipping Across Pakistan\n\n`;
    message += `🔗 ${url}`;

    // Check if Web Share API is supported (mobile devices)
    if (navigator.share) {
        try {
            // Prepare share data
            const shareData = {
                title: `${product.name} - ${discountPercent > 0 ? discountPercent + '% OFF!' : 'Rs. ' + sellingPrice.toLocaleString()}`,
                text: message,
                url: url
            };

            // Try to share with image if supported
            if (mainImage && navigator.canShare) {
                // Show loading indicator
                console.log('🔄 Fetching product image for sharing...');

                try {
                    // Try multiple methods to fetch image

                    // Method 1: Direct fetch (works for CORS-enabled hosts)
                    let blob = null;
                    try {
                        const response = await fetch(mainImage, {
                            method: 'GET',
                            mode: 'cors',
                            credentials: 'omit'
                        });
                        if (response.ok) {
                            blob = await response.blob();
                        }
                    } catch (e) {
                        console.log('Direct fetch failed, trying proxy...');
                    }

                    // Method 2: Try CORS proxy if direct fails
                    if (!blob) {
                        const proxies = [
                            'https://corsproxy.io/?',
                            'https://api.allorigins.win/raw?url=',
                            'https://thingproxy.freeboard.io/fetch/'
                        ];

                        for (const proxy of proxies) {
                            try {
                                const imageUrl = proxy + encodeURIComponent(mainImage);
                                const response = await fetch(imageUrl, {
                                    method: 'GET',
                                    mode: 'cors'
                                });
                                if (response.ok) {
                                    blob = await response.blob();
                                    console.log('✅ Image fetched via proxy:', proxy);
                                    break;
                                }
                            } catch (e) {
                                console.log('Proxy failed:', proxy);
                                continue;
                            }
                        }
                    }

                    // Method 3: Convert to blob using canvas (last resort)
                    if (!blob) {
                        blob = await fetchImageAsBlob(mainImage);
                    }

                    if (blob && blob.size > 0) {
                        console.log('✅ Image fetched successfully, size:', blob.size, 'bytes');

                        // Create a file object
                        const file = new File([blob], 'product.jpg', {
                            type: 'image/jpeg'
                        });

                        // Check if we can share files
                        if (navigator.canShare({ files: [file] })) {
                            shareData.files = [file];
                            console.log('✅ Image sharing enabled!');
                        } else {
                            console.log('⚠️ File sharing not supported on this device');
                        }
                    } else {
                        throw new Error('Could not fetch image');
                    }
                } catch (imgError) {
                    console.warn('⚠️ Could not load image for sharing:', imgError.message);
                    console.log('Will share with text and link only');
                }
            }

            // Share using native Web Share API
            console.log('Sharing with Web Share API...');
            await navigator.share(shareData);
            console.log('✅ Shared successfully!');
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Share cancelled by user');
            } else {
                console.error('Share error:', error);
                // Fallback to WhatsApp web link
                fallbackWhatsAppShare(message);
            }
        }
    } else {
        // Fallback for desktop or unsupported browsers
        fallbackWhatsAppShare(message);
    }
};

// Helper function to fetch image as blob using canvas
async function fetchImageAsBlob(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Canvas to blob failed'));
                    }
                }, 'image/jpeg', 0.9);
            } catch (e) {
                reject(e);
            }
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = imageUrl;
    });
}

// Fallback function for desktop/unsupported browsers
function fallbackWhatsAppShare(message) {
    const whatsappUrl = 'https://wa.me/?text=' + encodeURIComponent(message);
    
    // Show a helpful dialog
    const userChoice = confirm(
        '📱 Web Share API is not supported on this device.\n\n' +
        'Would you like to open WhatsApp Web with your product details?\n\n' +
        '✅ Click OK to open WhatsApp\n' +
        '❌ Click Cancel to copy the message'
    );
    
    if (userChoice) {
        window.open(whatsappUrl, '_blank');
    } else {
        // Copy message to clipboard
        navigator.clipboard.writeText(message).then(() => {
            alert('✅ Message copied to clipboard!\n\nYou can now paste it in WhatsApp manually.');
        }).catch(() => {
            prompt('Copy this message:', message);
        });
    }
}

window.shareProductFacebook = function(productId) {
    const product = window.currentProduct;
    const url = window.location.href.split('?')[0] + '?id=' + productId;
    
    // Get prices with discount
    const sellingPrice = product.sellingPrice || product.price || 0;
    const originalPrice = product.originalPrice || 0;
    const discountPercent = originalPrice > sellingPrice ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;
    
    // Create share text with discount
    let shareText = '';
    if (discountPercent > 0) {
        shareText = `🔥 ${discountPercent}% OFF! ${product.name} - Now only Rs. ${sellingPrice.toLocaleString()} (Was Rs. ${originalPrice.toLocaleString()}). Save Rs. ${(originalPrice - sellingPrice).toLocaleString()}! `;
    } else {
        shareText = `${product.name} - Rs. ${sellingPrice.toLocaleString()} at Hunny Collection PK. `;
    }
    
    // Open Facebook share with custom text
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
};

window.copyProductLink = function(productId) {
    const product = window.currentProduct;
    const url = window.location.href.split('?')[0] + '?id=' + productId;
    
    // Get prices with discount
    const sellingPrice = product.sellingPrice || product.price || 0;
    const originalPrice = product.originalPrice || 0;
    const discountPercent = originalPrice > sellingPrice ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;
    const savings = originalPrice - sellingPrice;
    
    // Create formatted text with discount
    let copyText = '';
    if (discountPercent > 0) {
        copyText = `🔥 SPECIAL OFFER! ${discountPercent}% OFF 🔥\n\n`;
        copyText += `${product.name}\n`;
        copyText += `💰 Offer Price: Rs. ${sellingPrice.toLocaleString()}\n`;
        copyText += `~~Rs. ${originalPrice.toLocaleString()}~~ (Original Price)\n`;
        copyText += `🎁 You Save Rs. ${savings.toLocaleString()}!\n\n`;
    } else {
        copyText = `${product.name}\n`;
        copyText += `💰 Price: Rs. ${sellingPrice.toLocaleString()}\n\n`;
    }
    
    copyText += `🛍️ Hunny Collection PK\n`;
    copyText += `✅ Cash on Delivery Available\n`;
    copyText += `🚚 Fast Shipping Across Pakistan\n\n`;
    copyText += `🔗 ${url}`;
    
    navigator.clipboard.writeText(copyText).then(() => {
        alert('✅ Product details with price copied to clipboard!\n\n' + copyText);
    }).catch(() => {
        // Fallback for older browsers
        prompt('Copy this product details:', copyText);
    });
};

// Place order
export async function placeOrder(orderData) {
    try {
        await addDoc(collection(db, 'orders'), orderData);
        localStorage.removeItem('cart');
        updateCartCount();
        return { success: true };
    } catch (error) {
        console.error('Error placing order:', error);
        return { success: false, error: error.message };
    }
}

// Export for global use
window.updateCartCount = updateCartCount;
window.loadProduct = loadProduct;
window.selectSize = selectSize;
window.addToCartClick = addToCartClick;
window.buyNow = buyNow;

// Image gallery navigation (works with lazy-loaded thumbnails)
window.previousImage = function() {
    const thumbnails = document.querySelectorAll('.product-thumbnail');
    if (thumbnails.length === 0) return;

    // Find current active thumbnail
    let currentIndex = 0;
    thumbnails.forEach((t, i) => { if (t.classList.contains('active')) currentIndex = i; });

    const newIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
    const newThumb = thumbnails[newIndex];

    // Load image if not yet loaded
    if (!newThumb.src || newThumb.src === '' || newThumb.src === window.location.href) {
        newThumb.src = newThumb.getAttribute('data-full-src');
    }

    document.getElementById('main-image').src = newThumb.src;
    thumbnails.forEach(t => t.classList.remove('active'));
    newThumb.classList.add('active');

    const counter = document.getElementById('image-counter');
    if (counter) counter.textContent = `${newIndex + 1} / ${thumbnails.length}`;
};

window.nextImage = function() {
    const thumbnails = document.querySelectorAll('.product-thumbnail');
    if (thumbnails.length === 0) return;

    // Find current active thumbnail
    let currentIndex = 0;
    thumbnails.forEach((t, i) => { if (t.classList.contains('active')) currentIndex = i; });

    const newIndex = (currentIndex + 1) % thumbnails.length;
    const newThumb = thumbnails[newIndex];

    // Load image if not yet loaded
    if (!newThumb.src || newThumb.src === '' || newThumb.src === window.location.href) {
        newThumb.src = newThumb.getAttribute('data-full-src');
    }

    document.getElementById('main-image').src = newThumb.src;
    thumbnails.forEach(t => t.classList.remove('active'));
    newThumb.classList.add('active');

    const counter = document.getElementById('image-counter');
    if (counter) counter.textContent = `${newIndex + 1} / ${thumbnails.length}`;
};
