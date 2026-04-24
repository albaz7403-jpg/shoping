// ============================================
// أفران ومخابز النصر - لوحة التحكم
// ============================================

/**
 * المصادقة وتسجيل الدخول
 */
function login() {
    const pass = document.getElementById('passwordInput').value;
    if (pass === '1234') {
        currentUser = 'admin';
        showToast('👑 تم تسجيل الدخول كمدير', 'success');
    } else if (pass === 'mazen') {
        currentUser = 'developer';
        showToast('💻 مرحباً مطور المتجر', 'success');
    } else {
        showToast('❌ كلمة مرور خاطئة', 'error');
        return;
    }
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    closeModal('loginModal');
    updateUIForUser();
    navigateTo('home');
}

/**
 * تسجيل الخروج
 */
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUIForUser();
    toggleSidebar();
    showToast('👋 تم تسجيل الخروج');
    navigateTo('home');
}

/**
 * فتح/إغلاق لوحة التحكم
 */
function toggleAdminPanel() {
    if (!currentUser || (currentUser !== 'admin' && currentUser !== 'developer')) {
        showToast('🔒 تحتاج صلاحيات المدير', 'error');
        return;
    }
    const panel = document.getElementById('adminPanel');
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) {
        renderAdminPanelContent('products');
    }
}

/**
 * تبديل تبويب لوحة التحكم
 */
function switchAdminTab(tab) {
    document.querySelectorAll('#adminTabs .tab').forEach(t => t.classList.remove('active'));
    const tabEl = document.querySelector(`#adminTabs .tab[onclick*="${tab}"]`);
    if (tabEl) tabEl.classList.add('active');
    renderAdminPanelContent(tab);
}

/**
 * عرض محتوى لوحة التحكم
 */
async function renderAdminPanelContent(tab = 'products') {
    const content = document.getElementById('adminContent');
    if (!content) return;
    
    // Refresh data
    products = await getData('products', products);
    categories = await getData('categories', categories);
    branches = await getData('branches', branches);
    const orders = await getData('orders', []);
    const complaints = await getData('complaints', []);
    const videos = await getData('videos', []);
    
    switch(tab) {
        case 'products':
            content.innerHTML = `
                <div class="admin-section">
                    <h3>➕ إضافة منتج جديد</h3>
                    <select id="prodCategory" class="admin-select">
                        ${categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
                    </select>
                    <input id="newProdName" placeholder="اسم المنتج" class="admin-input">
                    <input id="newProdPrice" placeholder="السعر (رقم)" class="admin-input" type="number">
                    <input id="newProdImg" placeholder="رابط الصورة" class="admin-input" value="https://placehold.co/300x300/8d6e63/fff?text=🍰">
                    <textarea id="newProdDesc" placeholder="وصف المنتج" class="form-textarea" rows="2" style="margin: 6px 0;"></textarea>
                    <input id="newProdSizes" placeholder="الأحجام (مفصولة بفواصل)" class="admin-input" value="وسط,كبير">
                    <input id="newProdStock" placeholder="الكمية المتاحة" class="admin-input" type="number" value="10">
                    <input id="newProdIngredients" placeholder="المكونات (مفصولة بفواصل)" class="admin-input" value="طحين,سكر,بيض">
                    <button class="admin-btn" onclick="addProduct()">➕ إضافة المنتج</button>
                </div>
                <div class="admin-section">
                    <h3>📦 المنتجات الحالية (${products.length})</h3>
                    ${products.map(p => `
                        <div class="admin-list-item">
                            <span>${p.name} - ${p.price} ${storeInfo.currency} | المخزون: ${p.stock}</span>
                            <div class="admin-list-actions">
                                <button class="admin-btn" onclick="editProduct('${p.id}')">✏️</button>
                                <button class="admin-btn admin-btn-danger" onclick="deleteProduct('${p.id}')">🗑️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            break;
            
        case 'categories':
            content.innerHTML = `
                <div class="admin-section">
                    <h3>➕ إضافة قسم جديد</h3>
                    <input id="newCatName" placeholder="اسم القسم" class="admin-input">
                    <input id="newCatImg" placeholder="رابط الصورة" class="admin-input" value="https://placehold.co/150x150/ffb74d/fff?text=🍕">
                    <input id="newCatDesc" placeholder="وصف القسم" class="admin-input">
                    <button class="admin-btn" onclick="addCategory()">➕ إضافة القسم</button>
                </div>
                <div class="admin-section">
                    <h3>📂 الأقسام الحالية</h3>
                    ${categories.map(c => `
                        <div class="admin-list-item">
                            <span>${c.name} (${products.filter(p => p.category === c.name).length} منتج)</span>
                            <button class="admin-btn admin-btn-danger" onclick="deleteCategory('${c.id}')">🗑️</button>
                        </div>
                    `).join('')}
                </div>
            `;
            break;
            
        case 'orders':
            content.innerHTML = `
                <div class="admin-section">
                    <h3>📋 الطلبات (${orders.length})</h3>
                    ${orders.length === 0 ? '<p>لا توجد طلبات</p>' : 
                    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(o => `
                        <div class="admin-list-item">
                            <div>
                                <strong>${o.id}</strong> - ${o.customer?.name || 'غير معروف'}
                                <br><small>${o.total} ${storeInfo.currency} | ${new Date(o.createdAt).toLocaleDateString('ar-SA')}</small>
                                <br><span class="status-badge status-${o.status || 'pending'}">${getStatusText(o.status)}</span>
                            </div>
                            <div class="admin-list-actions">
                                <select onchange="updateOrderStatus('${o.id}', this.value)" class="admin-select" style="width: auto; display: inline;">
                                    <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
                                    <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>مؤكد</option>
                                    <option value="preparing" ${o.status === 'preparing' ? 'selected' : ''}>قيد التحضير</option>
                                    <option value="delivering" ${o.status === 'delivering' ? 'selected' : ''}>قيد التوصيل</option>
                                    <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>تم التوصيل</option>
                                    <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>ملغي</option>
                                </select>
                                <button class="admin-btn admin-btn-danger btn-sm" onclick="deleteOrder('${o.id}')">🗑️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            break;
            
        case 'videos':
            content.innerHTML = `
                <div class="admin-section">
                    <button class="admin-btn admin-btn-success" onclick="showAddVideoForm()">
                        ➕ إضافة فيديو جديد
                    </button>
                </div>
                <div class="admin-section">
                    <h3>🎬 الفيديوهات (${videos.length})</h3>
                    ${videos.length === 0 ? '<p class="text-center">لا توجد فيديوهات حالياً</p>' : 
                    videos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(v => `
                        <div class="admin-list-item">
                            <div>
                                <strong>${v.type === 'youtube' ? '🎬 يوتيوب' : '📁 من الجهاز'}</strong> - ${v.title}
                                ${v.description ? `<br><small style="color: #666;">${v.description}</small>` : ''}
                                <br><small style="color: #999;">📅 ${new Date(v.createdAt).toLocaleString('ar-SA')}</small>
                            </div>
                            <div class="admin-list-actions">
                                <button class="admin-btn admin-btn-danger btn-sm" onclick="deleteVideo('${v.id}')">🗑️ حذف</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            break;
            
        case 'branches':
            content.innerHTML = `
                <div class="admin-section">
                    <button class="admin-btn admin-btn-success" onclick="openBranchForm()">➕ إضافة فرع جديد</button>
                </div>
                <div class="admin-section">
                    <h3>📍 الفروع الحالية (${branches.length})</h3>
                    ${branches.map(b => `
                        <div class="admin-list-item">
                            <span><i class="fas fa-map-pin"></i> ${b.name} - ${b.address}</span>
                            <button class="admin-btn admin-btn-danger" onclick="deleteBranch('${b.id}')">🗑️</button>
                        </div>
                    `).join('')}
                </div>
            `;
            break;
            
        case 'settings':
            const isDev = currentUser === 'developer';
            content.innerHTML = `
                ${isDev ? `
                <div class="admin-section">
                    <h3>⚙️ إعدادات المتجر (مطور)</h3>
                    <label>اسم المتجر</label>
                    <input id="devStoreName" class="admin-input" value="${storeInfo.name}">
                    <label>رابط الشعار</label>
                    <input id="devStoreLogo" class="admin-input" value="${storeInfo.logo}">
                    <label>رقم الهاتف</label>
                    <input id="devStorePhone" class="admin-input" value="${storeInfo.phone}">
                    <label>رسوم التوصيل (${storeInfo.currency})</label>
                    <input id="devDeliveryFee" class="admin-input" type="number" value="${storeInfo.deliveryFee}">
                    <label>الحد الأدنى للطلب المجاني (${storeInfo.currency})</label>
                    <input id="devMinOrder" class="admin-input" type="number" value="${storeInfo.minOrder}">
                    <button class="admin-btn" onclick="updateStoreSettings()">💾 حفظ الإعدادات</button>
                </div>
                ` : ''}
                <div class="admin-section">
                    <h3>📊 إحصائيات المتجر</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px;">
                        <div style="background: #fff3e0; padding: 14px; border-radius: 16px; text-align: center;">
                            <div style="font-size: 2rem;">📦</div>
                            <div style="font-weight: 700;">${products.length}</div>
                            <div style="font-size: 0.75rem; color: #666;">منتج</div>
                        </div>
                        <div style="background: #e8f5e9; padding: 14px; border-radius: 16px; text-align: center;">
                            <div style="font-size: 2rem;">📂</div>
                            <div style="font-weight: 700;">${categories.length}</div>
                            <div style="font-size: 0.75rem; color: #666;">قسم</div>
                        </div>
                        <div style="background: #e3f2fd; padding: 14px; border-radius: 16px; text-align: center;">
                            <div style="font-size: 2rem;">📍</div>
                            <div style="font-weight: 700;">${branches.length}</div>
                            <div style="font-size: 0.75rem; color: #666;">فرع</div>
                        </div>
                        <div style="background: #fce4ec; padding: 14px; border-radius: 16px; text-align: center;">
                            <div style="font-size: 2rem;">📋</div>
                            <div style="font-weight: 700;">${orders.length}</div>
                            <div style="font-size: 0.75rem; color: #666;">طلب</div>
                        </div>
                        <div style="background: #fff8e1; padding: 14px; border-radius: 16px; text-align: center;">
                            <div style="font-size: 2rem;">🎬</div>
                            <div style="font-weight: 700;">${videos.length}</div>
                            <div style="font-size: 0.75rem; color: #666;">فيديو</div>
                        </div>
                        <div style="background: #f3e5f5; padding: 14px; border-radius: 16px; text-align: center;">
                            <div style="font-size: 2rem;">💬</div>
                            <div style="font-weight: 700;">${complaints.length}</div>
                            <div style="font-size: 0.75rem; color: #666;">شكوى</div>
                        </div>
                    </div>
                </div>
                <div class="admin-section">
                    <h3>💬 الشكاوى الواردة</h3>
                    ${complaints.length === 0 ? '<p>لا توجد شكاوى</p>' : complaints.map(c => `
                        <div class="admin-list-item">
                            <div>
                                <strong>${c.name}</strong> - ${c.phone || ''}
                                <br><small>${c.text}</small>
                                <br><small style="color: var(--gray);">${new Date(c.createdAt).toLocaleString('ar-SA')}</small>
                            </div>
                            <button class="admin-btn admin-btn-danger btn-sm" onclick="deleteComplaint('${c.id}')">🗑️</button>
                        </div>
                    `).join('')}
                </div>
            `;
            break;
    }
}

/**
 * الحصول على نص حالة الطلب
 */
function getStatusText(status) {
    const statusMap = {
        'pending': 'قيد الانتظار',
        'confirmed': 'مؤكد',
        'preparing': 'قيد التحضير',
        'delivering': 'قيد التوصيل',
        'delivered': 'تم التوصيل',
        'cancelled': 'ملغي'
    };
    return statusMap[status] || status || 'غير معروف';
}

/**
 * عمليات المنتجات
 */
async function addProduct() {
    const category = document.getElementById('prodCategory').value;
    const name = document.getElementById('newProdName').value.trim();
    const price = parseInt(document.getElementById('newProdPrice').value) || 0;
    const img = document.getElementById('newProdImg').value.trim();
    const description = document.getElementById('newProdDesc').value.trim();
    const sizes = document.getElementById('newProdSizes').value.split(',').map(s => s.trim()).filter(s => s);
    const stock = parseInt(document.getElementById('newProdStock').value) || 0;
    const ingredients = document.getElementById('newProdIngredients').value.split(',').map(s => s.trim()).filter(s => s);
    
    if (!name || !price) {
        showToast('⚠️ الاسم والسعر مطلوبان', 'error');
        return;
    }
    
    const product = { name, price, img, category, description, stock, sizes, ingredients };
    await addDocument('products', product);
    products = await getData('products');
    
    showToast('✅ تم إضافة المنتج', 'success');
    renderAdminPanelContent('products');
}

async function deleteProduct(id) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        await deleteDocument('products', id);
        products = await getData('products');
        renderAdminPanelContent('products');
        showToast('🗑️ تم حذف المنتج');
    }
}

async function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const newName = prompt('اسم المنتج:', product.name);
    if (newName === null) return;
    const newPrice = prompt('السعر:', product.price);
    if (newPrice === null) return;
    const newStock = prompt('المخزون:', product.stock);
    if (newStock === null) return;
    
    await updateDocument('products', id, {
        name: newName,
        price: parseInt(newPrice) || product.price,
        stock: parseInt(newStock) || product.stock
    });
    
    products = await getData('products');
    renderAdminPanelContent('products');
    showToast('✅ تم تحديث المنتج', 'success');
}

/**
 * عمليات الأقسام
 */
async function addCategory() {
    const name = document.getElementById('newCatName').value.trim();
    const img = document.getElementById('newCatImg').value.trim();
    const description = document.getElementById('newCatDesc').value.trim();
    
    if (!name) {
        showToast('⚠️ اسم القسم مطلوب', 'error');
        return;
    }
    
    await addDocument('categories', { name, img, description });
    categories = await getData('categories');
    renderAdminPanelContent('categories');
    showToast('✅ تم إضافة القسم', 'success');
}

async function deleteCategory(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    if (products.some(p => p.category === category.name)) {
        showToast('⚠️ لا يمكن حذف قسم يحتوي على منتجات', 'error');
        return;
    }
    if (confirm('هل أنت متأكد؟')) {
        await deleteDocument('categories', id);
        categories = await getData('categories');
        renderAdminPanelContent('categories');
        showToast('🗑️ تم حذف القسم');
    }
}

/**
 * عمليات الطلبات
 */
async function updateOrderStatus(orderId, newStatus) {
    await updateDocument('orders', orderId, { status: newStatus });
    showToast('✅ تم تحديث حالة الطلب', 'success');
}

async function deleteOrder(id) {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
        await deleteDocument('orders', id);
        renderAdminPanelContent('orders');
        showToast('🗑️ تم حذف الطلب');
    }
}

/**
 * عمليات الفروع
 */
function openBranchForm() {
    document.getElementById('branchFormModal').classList.add('active');
    document.getElementById('branchNameInput').value = '';
    document.getElementById('branchAddressInput').value = '';
    document.getElementById('branchPhoneInput').value = '';
    
    setTimeout(() => {
        if (mapsInitialized['branchForm']) {
            mapsInitialized['branchForm'].remove();
        }
        const map = L.map('branchFormMap').setView([24.7136, 46.6753], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        tempMarker = L.marker([24.7136, 46.6753], { draggable: true }).addTo(map);
        map.on('click', e => tempMarker.setLatLng(e.latlng));
        mapsInitialized['branchForm'] = map;
    }, 200);
}

async function saveNewBranch() {
    const name = document.getElementById('branchNameInput').value.trim();
    const address = document.getElementById('branchAddressInput').value.trim();
    const phone = document.getElementById('branchPhoneInput').value.trim();
    
    if (!name || !address) {
        showToast('⚠️ املأ جميع الحقول المطلوبة', 'error');
        return;
    }
    
    const pos = tempMarker ? tempMarker.getLatLng() : { lat: 24.7136, lng: 46.6753 };
    
    const branch = { name, address, phone, lat: pos.lat, lng: pos.lng };
    await addDocument('branches', branch);
    branches = await getData('branches');
    
    closeModal('branchFormModal');
    showToast('✅ تم إضافة الفرع بنجاح', 'success');
    renderAdminPanelContent('branches');
}

async function deleteBranch(id) {
    if (confirm('هل أنت متأكد من حذف هذا الفرع؟')) {
        await deleteDocument('branches', id);
        branches = await getData('branches');
        renderAdminPanelContent('branches');
        showToast('🗑️ تم حذف الفرع');
    }
}

/**
 * عرض فروع المتجر
 */
function openBranchesModal() {
    document.getElementById('branchesModal').classList.add('active');
    
    setTimeout(() => {
        if (!mapsInitialized['branches']) {
            const map = L.map('branchesMap').setView([24.0, 45.0], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map);
            
            branches.forEach(b => {
                L.marker([b.lat, b.lng]).addTo(map)
                    .bindPopup(`<b>${b.name}</b><br>${b.address}<br>📞 ${b.phone || 'غير محدد'}`);
            });
            
            mapsInitialized['branches'] = map;
        }
        
        document.getElementById('branchesList').innerHTML = branches.map(b => `
            <div class="admin-list-item">
                <span><i class="fas fa-map-pin" style="color: var(--primary);"></i> ${b.name}</span>
                <span style="font-size: 0.85rem;">${b.address}</span>
                <span style="font-size: 0.8rem;">📞 ${b.phone || ''}</span>
            </div>
        `).join('');
    }, 200);
}

/**
 * حذف فيديو
 */
async function deleteVideo(id) {
    if (confirm('هل أنت متأكد من حذف هذا الفيديو؟')) {
        await deleteDocument('videos', id);
        showToast('🗑️ تم حذف الفيديو');
        renderAdminPanelContent('videos');
    }
}

/**
 * حذف شكوى
 */
async function deleteComplaint(id) {
    if (confirm('حذف هذه الشكوى؟')) {
        await deleteDocument('complaints', id);
        renderAdminPanelContent('settings');
        showToast('🗑️ تم حذف الشكوى');
    }
}

/**
 * تحديث إعدادات المتجر (للمطور فقط)
 */
function updateStoreSettings() {
    if (currentUser !== 'developer') return;
    
    storeInfo.name = document.getElementById('devStoreName').value || storeInfo.name;
    storeInfo.logo = document.getElementById('devStoreLogo').value || storeInfo.logo;
    storeInfo.phone = document.getElementById('devStorePhone').value || storeInfo.phone;
    storeInfo.deliveryFee = parseInt(document.getElementById('devDeliveryFee').value) || storeInfo.deliveryFee;
    storeInfo.minOrder = parseInt(document.getElementById('devMinOrder').value) || storeInfo.minOrder;
    
    localStorage.setItem('storeInfo', JSON.stringify(storeInfo));
    updateUIForUser();
    showToast('✅ تم حفظ الإعدادات', 'success');
}