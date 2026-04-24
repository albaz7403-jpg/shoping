// ============================================
// أفران ومخابز النصر - طبقة البيانات
// ============================================

/**
 * استرجاع البيانات من Firebase أو localStorage
 * @param {string} collection - اسم المجموعة
 * @param {Array} defaultValue - القيمة الافتراضية
 * @returns {Promise<Array>} البيانات المسترجعة
 */
async function getData(collection, defaultValue = []) {
    if (!useLocalStorage && db) {
        try {
            const snapshot = await db.collection(collection).get();
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Cache in localStorage as backup
            localStorage.setItem(collection, JSON.stringify(data));
            return data;
        } catch (e) {
            console.log(`Firebase read error for ${collection}, falling back to localStorage`);
        }
    }
    
    // Fallback to localStorage
    const data = localStorage.getItem(collection);
    return data ? JSON.parse(data) : defaultValue;
}

/**
 * حفظ البيانات في localStorage (وFirebase إن أمكن)
 * @param {string} collection - اسم المجموعة
 * @param {Array} data - البيانات المراد حفظها
 */
async function saveData(collection, data) {
    localStorage.setItem(collection, JSON.stringify(data));
    
    if (!useLocalStorage && db) {
        try {
            const batch = db.batch();
            const snapshot = await db.collection(collection).get();
            
            // Delete all existing docs
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            // Add all new docs
            data.forEach(item => {
                const docRef = db.collection(collection).doc(item.id || Date.now().toString());
                batch.set(docRef, item);
            });
            
            await batch.commit();
        } catch (e) {
            console.log(`Firebase write error for ${collection}`, e);
        }
    }
}

/**
 * إضافة مستند جديد
 * @param {string} collection - اسم المجموعة
 * @param {Object} doc - المستند المراد إضافته
 * @returns {Promise<Object>} المستند المضاف مع ID
 */
async function addDocument(collection, doc) {
    const data = await getData(collection);
    doc.id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    doc.createdAt = doc.createdAt || new Date().toISOString();
    data.push(doc);
    await saveData(collection, data);
    
    if (!useLocalStorage && db) {
        try {
            await db.collection(collection).doc(doc.id).set(doc);
        } catch (e) {
            console.log(`Firebase add error for ${collection}`, e);
        }
    }
    
    return doc;
}

/**
 * تحديث مستند موجود
 * @param {string} collection - اسم المجموعة
 * @param {string} id - معرف المستند
 * @param {Object} updates - التحديثات
 */
async function updateDocument(collection, id, updates) {
    const data = await getData(collection);
    const index = data.findIndex(d => d.id === id);
    
    if (index !== -1) {
        data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
        await saveData(collection, data);
    }
    
    if (!useLocalStorage && db) {
        try {
            await db.collection(collection).doc(id).update(updates);
        } catch (e) {
            console.log(`Firebase update error for ${collection}`, e);
        }
    }
}

/**
 * حذف مستند
 * @param {string} collection - اسم المجموعة
 * @param {string} id - معرف المستند
 */
async function deleteDocument(collection, id) {
    let data = await getData(collection);
    data = data.filter(d => d.id !== id);
    await saveData(collection, data);
    
    if (!useLocalStorage && db) {
        try {
            await db.collection(collection).doc(id).delete();
        } catch (e) {
            console.log(`Firebase delete error for ${collection}`, e);
        }
    }
}

/**
 * تحميل البيانات الأولية
 */
async function loadInitialData() {
    categories = await getData('categories', [
        { id: '1', name: 'كيك', img: 'https://placehold.co/150x150/f48fb1/fff?text=🎂', description: 'كيكات طازجة يومياً' },
        { id: '2', name: 'معجنات', img: 'https://placehold.co/150x150/ffe082/fff?text=🥐', description: 'معجنات مخبوزة' },
        { id: '3', name: 'حلويات شرقية', img: 'https://placehold.co/150x150/bcaaa4/fff?text=🍬', description: 'حلويات تقليدية' }
    ]);
    
    products = await getData('products', [
        { id: '1', name: 'كيكة العسل', price: 95, img: 'https://placehold.co/300x300/f9a825/fff?text=🍯', category: 'كيك', description: 'كيكة عسل طبيعي مع طبقات الكريمة', stock: 15, sizes: ['وسط', 'كبير'], ingredients: ['عسل', 'طحين', 'بيض', 'كريمة'] },
        { id: '2', name: 'تشيز كيك', price: 110, img: 'https://placehold.co/300x300/ffccbc/fff?text=🧀', category: 'كيك', description: 'تشيز كيك نيويورك أصلي', stock: 8, sizes: ['صغير', 'وسط', 'كبير'], ingredients: ['جبن', 'بسكويت', 'زبدة', 'سكر'] },
        { id: '3', name: 'كرواسون', price: 15, img: 'https://placehold.co/300x300/ffb74d/fff?text=🥐', category: 'معجنات', description: 'كرواسون زبدة طازج', stock: 30, sizes: ['عادي', 'كبير'], ingredients: ['طحين', 'زبدة', 'خميرة'] },
        { id: '4', name: 'بقلاوة', price: 75, img: 'https://placehold.co/300x300/8d6e63/fff?text=🥮', category: 'حلويات شرقية', description: 'بقلاوة فستق حلبي', stock: 12, sizes: ['نصف كيلو', 'كيلو'], ingredients: ['فستق', 'عسل', 'جلاش'] }
    ]);
    
    branches = await getData('branches', [
        { id: '1', name: 'الفرع الرئيسي', address: 'شارع الملك فهد، الرياض', lat: 24.7136, lng: 46.6753, phone: '0112345678' },
        { id: '2', name: 'فرع جدة', address: 'طريق المدينة، جدة', lat: 21.4858, lng: 39.1925, phone: '0123456789' }
    ]);
    
    // Load store info
    const savedStoreInfo = localStorage.getItem('storeInfo');
    if (savedStoreInfo) {
        storeInfo = { ...storeInfo, ...JSON.parse(savedStoreInfo) };
    }
    
    // Load cart and wishlist from localStorage
    cart = JSON.parse(localStorage.getItem('cart') || '[]');
    wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
}