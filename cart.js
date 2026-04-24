// ============================================
// أفران ومخابز النصر - إدارة السلة والمفضلة
// ============================================

/**
 * إضافة منتج للسلة
 */
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock <= 0) {
        showToast('❌ المنتج غير متوفر حالياً', 'error');
        return;
    }
    
    const size = getSelectedSize(productId);
    const quantity = getQuantity(productId);
    
    // Check if already in cart with same size
    const existingIndex = cart.findIndex(c => c.id === productId && c.size === size);
    if (existingIndex !== -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            img: product.img,
            size: size,
            quantity: quantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`✅ تمت إضافة "${product.name}" للسلة`, 'success');
    
    // Reset quantity display
    const qtyEl = document.getElementById(`qty-${productId}`);
    if (qtyEl) qtyEl.textContent = '1';
}

/**
 * فتح مودال السلة
 */
function openCartModal() {
    const list = document.getElementById('cartItemsList');
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cart.length === 0) {
        list.innerHTML = '<p class="text-center">🛒 السلة فارغة</p>';
        checkoutForm.style.display = 'none';
        checkoutBtn.style.display = 'none';
        document.getElementById('cartTotal').innerHTML = '';
    } else {
        list.innerHTML = cart.map((item, i) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    ${item.size ? `<div class="cart-item-size">الحجم: ${item.size}</div>` : ''}
                    <div class="cart-item-price">${item.price} ${storeInfo.currency} × ${item.quantity}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateCartItemQty(${i}, -1)">-</button>
                    <span style="font-weight: 700;">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartItemQty(${i}, 1)">+</button>
                    <button class="cart-remove-btn" onclick="removeFromCart(${i})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const delivery = subtotal >= storeInfo.minOrder ? 0 : storeInfo.deliveryFee;
        const total = subtotal + delivery;
        
        document.getElementById('cartTotal').innerHTML = `
            <div>المجموع: <strong>${subtotal} ${storeInfo.currency}</strong></div>
            ${delivery > 0 ? `<div>التوصيل: <strong>${delivery} ${storeInfo.currency}</strong></div>` : '<div style="color: var(--success);">✅ توصيل مجاني</div>'}
            <div style="font-size: 1.4rem; margin-top: 8px;">الإجمالي: <strong>${total} ${storeInfo.currency}</strong></div>
        `;
        
        checkoutBtn.style.display = 'block';
        checkoutBtn.disabled = false;
        checkoutBtn.onclick = proceedToCheckout;
        checkoutForm.style.display = 'none';
    }
    
    document.getElementById('cartModal').classList.add('active');
}

/**
 * تحديث كمية عنصر في السلة
 */
function updateCartItemQty(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    openCartModal();
}

/**
 * حذف عنصر من السلة
 */
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    openCartModal();
}

/**
 * متابعة لعملية الدفع
 */
function proceedToCheckout() {
    if (cart.length === 0) return;
    document.getElementById('checkoutForm').style.display = 'block';
    document.getElementById('checkoutBtn').textContent = '✅ تأكيد الطلب';
    document.getElementById('checkoutBtn').onclick = placeOrder;
}

/**
 * تقديم الطلب
 */
async function placeOrder() {
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    const notes = document.getElementById('orderNotes').value.trim();
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    if (!name || !phone || !address) {
        showToast('⚠️ الرجاء ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = subtotal >= storeInfo.minOrder ? 0 : storeInfo.deliveryFee;
    const total = subtotal + delivery;
    
    const order = {
        customer: { name, phone, address },
        items: [...cart],
        subtotal,
        delivery,
        total,
        notes,
        paymentMethod,
        status: 'pending'
    };
    
    await addDocument('orders', order);
    
    // Update product stock
    for (const item of cart) {
        const product = products.find(p => p.id === item.id);
        if (product) {
            product.stock = Math.max(0, product.stock - item.quantity);
        }
    }
    await saveData('products', products);
    
    // Clear cart
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    closeModal('cartModal');
    showToast('🎉 تم تقديم الطلب بنجاح! رقم الطلب: ' + order.id, 'success');
    
    // Refresh page
    await navigateTo('home');
}

/**
 * إضافة/إزالة من المفضلة
 */
async function toggleWishlist(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const index = wishlist.findIndex(w => w.id === productId);
    if (index === -1) {
        wishlist.push(product);
        showToast('❤️ تمت الإضافة للمفضلة', 'success');
    } else {
        wishlist.splice(index, 1);
        showToast('تمت الإزالة من المفضلة');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    // Refresh current view
    if (currentPage === 'products') await renderAllProducts();
    else if (currentPage === 'home') await renderHome();
    else if (currentPage === 'category') {
        const catName = document.querySelector('.section-title')?.textContent;
        if (catName) await renderCategoryPage(catName);
    }
}