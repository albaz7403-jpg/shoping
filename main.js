// ============================================
// أفران ومخابز النصر - نقطة البداية الرئيسية
// ============================================

/**
 * تهيئة التطبيق
 */
async function initApp() {
    try {
        // Load all initial data
        await loadInitialData();
        
        // Update UI components
        updateCartCount();
        updateUIForUser();
        
        // Navigate to home page
        await navigateTo('home');
        
        console.log('✅ تطبيق أفران ومخابز النصر جاهز');
        console.log(`📦 المنتجات: ${products.length}`);
        console.log(`📂 الأقسام: ${categories.length}`);
        console.log(`📍 الفروع: ${branches.length}`);
        console.log(`🛒 السلة: ${cart.length} عناصر`);
        console.log(`💾 التخزين: ${useLocalStorage ? 'LocalStorage' : 'Firebase'}`);
    } catch (error) {
        console.error('❌ خطأ في تهيئة التطبيق:', error);
        document.getElementById('app').innerHTML = `
            <div class="page-container text-center">
                <h2>⚠️ حدث خطأ</h2>
                <p>يرجى تحديث الصفحة أو الاتصال بالدعم الفني</p>
                <button class="btn btn-primary mt-2" onclick="location.reload()">تحديث الصفحة</button>
            </div>
        `;
    }
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);

// معالجة الأخطاء العامة
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// تسجيل Service Worker للتطبيق التقدمي (PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            console.log('Service worker registration failed');
        });
    });
}