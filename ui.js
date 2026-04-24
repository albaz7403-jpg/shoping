// ============================================
// أفران ومخابز النصر - واجهة المستخدم
// ============================================

/**
 * التنقل بين الصفحات
 */
async function navigateTo(page, param = null) {
    currentPage = page;
    const app = document.getElementById('app');
    
    switch(page) {
        case 'home':
            await renderHome();
            break;
        case 'products':
            await renderAllProducts();
            break;
        case 'category':
            await renderCategoryPage(param);
            break;
        case 'videos':
            await renderVideosPage();
            break;
        case 'about':
            renderStaticPage('من نحن', '🍞 أفران ومخابز النصر تأسست عام 1990 لتقديم ألذ المخبوزات والحلويات الشرقية والغربية بأعلى معايير الجودة. نستخدم أجود المكونات الطبيعية ونلتزم بأعلى معايير النظافة والجودة.');
            break;
        case 'return':
            renderStaticPage('سياسة الاسترجاع', '🔄 يمكن استرجاع المنتج خلال 24 ساعة من الاستلام بشرط سلامة المنتج وعدم فتحه. يتم استرداد المبلغ كاملاً خلال 3-5 أيام عمل.');
            break;
        case 'privacy':
            renderStaticPage('سياسة الخصوصية', '🔒 نحن نحافظ على سرية بياناتك الشخصية ولا نشاركها مع أي طرف ثالث. تستخدم البيانات فقط لتحسين تجربتك وتوصيل طلباتك.');
            break;
        default:
            await renderHome();
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * عرض الصفحة الرئيسية
 */
async function renderHome() {
    const app = document.getElementById('app');
    const topProducts = products.filter(p => p.stock > 0).slice(0, 8);
    
    app.innerHTML = `
        <div class="page-container">
            <div class="search-section">
                <div class="search-box">
                    <input type="text" id="searchInput" placeholder="🔍 ابحث عن منتج...">
                    <button onclick="performSearch()"><i class="fas fa-search"></i> بحث</button>
                </div>
            </div>
            
            <div class="section-header">
                <h2 class="section-title">🍰 الأكثر مبيعاً</h2>
                <div class="slider-controls">
                    <button class="slider-btn" onclick="slideSlider('productSlider', -250)"><i class="fas fa-chevron-right"></i></button>
                    <button class="slider-btn" onclick="slideSlider('productSlider', 250)"><i class="fas fa-chevron-left"></i></button>
                </div>
            </div>
            <div class="slider-container">
                <div class="products-slider" id="productSlider">
                    ${topProducts.map(p => productCardHTML(p)).join('')}
                </div>
            </div>
            <div class="text-center">
                <button class="view-all-btn" onclick="navigateTo('products')">
                    عرض جميع المنتجات <i class="fas fa-arrow-left"></i>
                </button>
            </div>
            
            <h2 class="section-title" style="margin-top: 32px;">📂 أقسام المتجر</h2>
            <div class="categories-grid">
                ${categories.map(c => `
                    <div class="category-card" onclick="navigateTo('category', '${c.name}')">
                        <img src="${c.img}" alt="${c.name}">
                        <h3>${c.name}</h3>
                        <div class="count">${products.filter(p => p.category === c.name).length} منتج</div>
                    </div>
                `).join('')}
            </div>
            
            <!-- قسم الفيديوهات في الصفحة الرئيسية -->
            <div class="section-header" style="margin-top: 32px;">
                <h2 class="section-title">🎬 فيديوهات</h2>
                <button class="view-all-btn" onclick="navigateTo('videos')">
                    عرض الكل <i class="fas fa-arrow-left"></i>
                </button>
            </div>
            <div class="video-grid" id="homeVideos"></div>
            
            ${(currentUser === 'admin' || currentUser === 'developer') ? `
            <div class="marquee">
                <span>👑 لوحة تحكم المدير متاحة - اضغط على أيقونة ⚙️ للوصول السريع</span>
            </div>
            ` : `
            <div class="marquee">
                <span>شكراً لزيارة متجر ${storeInfo.name} - توصيل مجاني للطلبات فوق ${storeInfo.minOrder} ${storeInfo.currency} 🧁✨</span>
            </div>
            `}
        </div>
    `;
    
    // تحميل الفيديوهات في الصفحة الرئيسية
    setTimeout(async () => {
        const videos = await getData('videos', []);
        const homeVideos = videos.slice(0, 3); // عرض 3 فيديوهات فقط
        const container = document.getElementById('homeVideos');
        if (container && homeVideos.length > 0) {
            container.innerHTML = homeVideos.map(v => videoCardHTML(v)).join('');
        } else if (container) {
            container.innerHTML = '<p class="text-center" style="color: #999;">لا توجد فيديوهات بعد</p>';
        }
    }, 100);
}

/**
 * عرض جميع المنتجات
 */
async function renderAllProducts() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="page-container">
            <div class="section-header">
                <h2 class="section-title">📦 جميع المنتجات</h2>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <select class="form-select" id="categoryFilter" onchange="filterProducts()" style="max-width: 180px;">
                        <option value="">كل الأقسام</option>
                        ${categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
                    </select>
                    <select class="form-select" id="sortOrder" onchange="filterProducts()" style="max-width: 150px;">
                        <option value="name">الاسم</option>
                        <option value="price-asc">السعر: منخفض لأعلى</option>
                        <option value="price-desc">السعر: أعلى لمنخفض</option>
                    </select>
                </div>
            </div>
            <div class="products-grid" id="allProductsGrid">
                ${products.map(p => productCardHTML(p)).join('')}
            </div>
            <div class="text-center mt-2">
                <button class="btn btn-secondary" onclick="navigateTo('home')">
                    <i class="fas fa-arrow-right"></i> العودة للرئيسية
                </button>
            </div>
        </div>
    `;
}

/**
 * تصفية المنتجات
 */
function filterProducts() {
    const catFilter = document.getElementById('categoryFilter')?.value || '';
    const sortOrder = document.getElementById('sortOrder')?.value || 'name';
    let filtered = [...products];
    
    if (catFilter) {
        filtered = filtered.filter(p => p.category === catFilter);
    }
    
    if (sortOrder === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    } else {
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    }
    
    const grid = document.getElementById('allProductsGrid');
    if (grid) {
        grid.innerHTML = filtered.map(p => productCardHTML(p)).join('');
    }
}

/**
 * عرض صفحة قسم معين
 */
async function renderCategoryPage(catName) {
    const app = document.getElementById('app');
    const catProducts = products.filter(p => p.category === catName);
    app.innerHTML = `
        <div class="page-container">
            <div class="section-header">
                <h2 class="section-title">${catName}</h2>
                <button class="btn btn-secondary btn-sm" onclick="navigateTo('home')">
                    <i class="fas fa-arrow-right"></i> العودة
                </button>
            </div>
            <div class="products-grid">
                ${catProducts.length > 0 ? catProducts.map(p => productCardHTML(p)).join('') : '<p class="text-center">لا توجد منتجات في هذا القسم حالياً</p>'}
            </div>
        </div>
    `;
}

/**
 * عرض صفحة الفيديوهات
 */
async function renderVideosPage() {
    const app = document.getElementById('app');
    const videos = await getData('videos', []);
    
    app.innerHTML = `
        <div class="page-container">
            <div class="section-header">
                <h2 class="section-title">🎬 فيديوهات منتجاتنا</h2>
                ${(currentUser === 'admin' || currentUser === 'developer') ? `
                <button class="btn btn-primary btn-sm" onclick="showAddVideoForm()">
                    <i class="fas fa-plus"></i> إضافة فيديو
                </button>
                ` : ''}
            </div>
            
            ${videos.length === 0 ? `
            <div class="text-center" style="padding: 40px;">
                <i class="fas fa-video" style="font-size: 4rem; color: #ddd; margin-bottom: 16px;"></i>
                <p>لا توجد فيديوهات حالياً</p>
            </div>
            ` : `
            <div class="video-grid">
                ${videos.map(v => videoCardHTML(v)).join('')}
            </div>
            `}
            
            <div class="section-header" style="margin-top: 32px;">
                <h2 class="section-title">📤 شاركنا فيديو</h2>
            </div>
            
            <!-- قسم رفع الفيديو -->
            <div class="upload-section" id="uploadSection" onclick="document.getElementById('videoFileInput').click()">
                <div class="upload-icon">📹</div>
                <h3>ارفع فيديو من هاتفك</h3>
                <p>شاركنا تجربتك مع منتجاتنا! يمكنك رفع فيديو من هاتفك</p>
                <p style="font-size: 0.75rem; color: #999;">الصيغ المدعومة: MP4, WebM, MOV | الحد الأقصى: 50MB</p>
                <button class="upload-btn">
                    <i class="fas fa-cloud-upload-alt"></i> اختر فيديو
                </button>
                <input type="file" id="videoFileInput" accept="video/*" style="display: none;" 
                       onchange="handleVideoUpload(event)" capture="environment">
                <div class="upload-progress" id="uploadProgress">
                    <div class="upload-progress-bar" id="uploadProgressBar"></div>
                </div>
                <div class="upload-status" id="uploadStatus"></div>
            </div>
            
            <div id="uploadedVideoPreview" style="margin-top: 16px; display: none;">
                <h3>🎥 معاينة الفيديو:</h3>
                <div class="video-card" style="max-width: 500px; margin: 0 auto;">
                    <div class="video-wrapper">
                        <video id="videoPreview" controls></video>
                    </div>
                    <div class="video-info">
                        <div class="form-group">
                            <label>عنوان الفيديو</label>
                            <input type="text" id="videoTitle" class="form-input" placeholder="أدخل عنواناً للفيديو">
                        </div>
                        <div class="form-group">
                            <label>وصف (اختياري)</label>
                            <input type="text" id="videoDescription" class="form-input" placeholder="وصف مختصر">
                        </div>
                        <button class="btn btn-primary btn-block" onclick="saveUploadedVideo()">
                            <i class="fas fa-save"></i> حفظ الفيديو
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="text-center mt-2">
                <button class="btn btn-secondary" onclick="navigateTo('home')">
                    <i class="fas fa-arrow-right"></i> العودة للرئيسية
                </button>
            </div>
        </div>
    `;
    
    // إعداد السحب والإفلات بعد تحميل الصفحة
    setTimeout(setupDragAndDrop, 200);
}

/**
 * عرض صفحة ثابتة
 */
function renderStaticPage(title, content) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="page-container text-center" style="max-width: 700px; margin: 40px auto;">
            <h2 style="font-size: 2rem; margin-bottom: 20px;">${title}</h2>
            <p style="line-height: 2; font-size: 1.05rem; color: var(--gray);">${content}</p>
            <button class="btn btn-primary mt-2" onclick="navigateTo('home')">
                <i class="fas fa-home"></i> العودة للرئيسية
            </button>
        </div>
    `;
}

/**
 * توليد HTML بطاقة المنتج
 */
function productCardHTML(p) {
    const isOutOfStock = p.stock <= 0;
    const isWishlisted = wishlist.some(w => w.id === p.id);
    const sizes = p.sizes || [];
    
    return `
        <div class="product-card" id="product-${p.id}">
            ${isWishlisted ? `<div class="wishlist-btn active" onclick="toggleWishlist('${p.id}')"><i class="fas fa-heart"></i></div>` 
              : `<div class="wishlist-btn" onclick="toggleWishlist('${p.id}')"><i class="far fa-heart"></i></div>`}
            ${p.stock > 0 && p.stock <= 3 ? `<div class="product-badge">🔥 عرض</div>` : ''}
            ${isOutOfStock ? `<div class="product-out-of-stock">نفذت الكمية</div>` : ''}
            <img src="${p.img || 'https://placehold.co/300x300/eee/aaa?text=📦'}" alt="${p.name}" loading="lazy">
            <h3>${p.name}</h3>
            ${p.description ? `<p class="description">${p.description}</p>` : ''}
            <div class="price">${p.price} ${storeInfo.currency}</div>
            <div class="stock-info ${p.stock <= 0 ? 'out' : p.stock <= 3 ? 'low' : ''}">
                ${p.stock > 0 ? `✅ ${p.stock} قطعة متاحة` : '❌ غير متوفر'}
            </div>
            ${sizes.length > 0 ? `
            <div class="size-options" id="sizes-${p.id}">
                ${sizes.map((s, i) => `<button class="size-btn ${i === 0 ? 'selected' : ''}" onclick="selectSize('${p.id}', '${s}', this)">${s}</button>`).join('')}
            </div>
            ` : ''}
            <div class="quantity-control">
                <button class="qty-btn" onclick="changeQty('${p.id}', -1)">-</button>
                <span class="qty-value" id="qty-${p.id}">1</span>
                <button class="qty-btn" onclick="changeQty('${p.id}', 1)">+</button>
            </div>
            <button class="add-to-cart-btn" onclick="addToCart('${p.id}')" ${isOutOfStock ? 'disabled' : ''}>
                ${isOutOfStock ? 'غير متوفر' : '🛒 أضف للسلة'}
            </button>
        </div>
    `;
}

/**
 * توليد HTML بطاقة الفيديو
 */
function videoCardHTML(video) {
    const isYouTube = video.type === 'youtube';
    const isLocal = video.type === 'local';
    
    return `
        <div class="video-card" id="video-${video.id}">
            <div class="video-wrapper">
                ${isYouTube ? `
                    <iframe src="https://www.youtube.com/embed/${video.youtubeId}?rel=0" 
                            title="${video.title}" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                    </iframe>
                ` : ''}
                ${isLocal ? `
                    <video controls preload="metadata" poster="${video.thumbnail || ''}">
                        <source src="${video.url}" type="video/mp4">
                        متصفحك لا يدعم تشغيل الفيديو
                    </video>
                ` : ''}
            </div>
            <div class="video-info">
                <h3>${video.title}</h3>
                ${video.description ? `<p>${video.description}</p>` : ''}
                <div class="video-date">📅 ${new Date(video.createdAt).toLocaleDateString('ar-SA')}</div>
            </div>
            ${(currentUser === 'admin' || currentUser === 'developer') ? `
            <div class="video-actions">
                <button class="btn btn-danger btn-sm btn-block" onclick="deleteVideo('${video.id}')">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </div>
            ` : ''}
        </div>
    `;
}

/**
 * عرض نموذج إضافة فيديو (للمدير)
 */
function showAddVideoForm() {
    const app = document.getElementById('app');
    
    const formHTML = `
        <div class="modal active" id="addVideoModal" onclick="if(event.target === this) this.remove()">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>➕ إضافة فيديو جديد</h2>
                    <button class="modal-close" onclick="document.getElementById('addVideoModal').remove()">&times;</button>
                </div>
                
                <div class="admin-section">
                    <h3>🎬 إضافة من يوتيوب</h3>
                    <div class="form-group">
                        <label>رابط فيديو يوتيوب</label>
                        <input type="text" id="youtubeUrl" class="form-input" 
                               placeholder="https://www.youtube.com/watch?v=... أو https://youtu.be/...">
                    </div>
                    <div class="form-group">
                        <label>عنوان الفيديو</label>
                        <input type="text" id="youtubeTitle" class="form-input" placeholder="عنوان وصفي للفيديو">
                    </div>
                    <div class="form-group">
                        <label>وصف (اختياري)</label>
                        <input type="text" id="youtubeDescription" class="form-input" placeholder="وصف مختصر">
                    </div>
                    <button class="btn btn-primary btn-block" onclick="addYouTubeVideo()">
                        <i class="fab fa-youtube"></i> إضافة فيديو يوتيوب
                    </button>
                </div>
                
                <div class="admin-section" style="margin-top: 16px;">
                    <h3>📁 أو ارفع فيديو من جهازك</h3>
                    <p style="font-size: 0.85rem; color: var(--gray); margin-bottom: 12px;">
                        يمكنك رفع فيديو مباشرة من هاتفك أو كمبيوترك
                    </p>
                    <input type="file" id="adminVideoFile" accept="video/*" class="form-input" 
                           onchange="handleAdminVideoSelect(event)">
                    <div id="adminVideoPreview" style="margin-top: 12px; display: none;">
                        <video id="adminVideoPlayer" controls style="width: 100%; max-height: 200px; border-radius: 12px;"></video>
                        <div class="form-group" style="margin-top: 12px;">
                            <label>عنوان الفيديو</label>
                            <input type="text" id="adminVideoTitle" class="form-input" placeholder="عنوان الفيديو">
                        </div>
                        <button class="btn btn-success btn-block" onclick="saveAdminVideo()">
                            <i class="fas fa-save"></i> حفظ الفيديو
                        </button>
                    </div>
                </div>
                
                <button class="btn btn-secondary btn-block btn-sm mt-2" 
                        onclick="document.getElementById('addVideoModal').remove()">إلغاء</button>
            </div>
        </div>
    `;
    
    app.insertAdjacentHTML('beforeend', formHTML);
}

/**
 * استخراج معرف فيديو يوتيوب من الرابط
 */
function extractYouTubeId(url) {
    if (!url) return null;
    
    // أنماط روابط يوتيوب المختلفة
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([^&]+)/,
        /(?:youtu\.be\/)([^?]+)/,
        /(?:youtube\.com\/embed\/)([^?]+)/,
        /(?:youtube\.com\/shorts\/)([^?]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    
    return null;
}

/**
 * إضافة فيديو يوتيوب
 */
async function addYouTubeVideo() {
    const url = document.getElementById('youtubeUrl').value.trim();
    const title = document.getElementById('youtubeTitle').value.trim();
    const description = document.getElementById('youtubeDescription').value.trim();
    
    if (!url) {
        showToast('⚠️ الرجاء إدخال رابط الفيديو', 'error');
        return;
    }
    
    const youtubeId = extractYouTubeId(url);
    if (!youtubeId) {
        showToast('⚠️ رابط يوتيوب غير صالح', 'error');
        return;
    }
    
    if (!title) {
        showToast('⚠️ الرجاء إدخال عنوان الفيديو', 'error');
        return;
    }
    
    const video = {
        type: 'youtube',
        youtubeId,
        title,
        description: description || '',
        thumbnail: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${youtubeId}`
    };
    
    await addDocument('videos', video);
    
    // إزالة المودال
    const modal = document.getElementById('addVideoModal');
    if (modal) modal.remove();
    
    showToast('✅ تم إضافة الفيديو بنجاح', 'success');
    
    // تحديث الصفحة
    await renderVideosPage();
}

/**
 * معالجة رفع الفيديو من المستخدم
 */
function handleVideoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // التحقق من نوع الملف
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|avi)$/i)) {
        showToast('⚠️ صيغة الفيديو غير مدعومة. الصيغ المدعومة: MP4, WebM, MOV', 'error');
        return;
    }
    
    // التحقق من الحجم (50MB)
    if (file.size > 50 * 1024 * 1024) {
        showToast('⚠️ حجم الفيديو كبير جداً. الحد الأقصى 50 ميجابايت', 'error');
        return;
    }
    
    // معاينة الفيديو
    const videoPreview = document.getElementById('videoPreview');
    const previewContainer = document.getElementById('uploadedVideoPreview');
    const uploadSection = document.getElementById('uploadSection');
    
    if (videoPreview && previewContainer && uploadSection) {
        videoPreview.src = URL.createObjectURL(file);
        previewContainer.style.display = 'block';
        uploadSection.style.opacity = '0.6';
    }
    
    // تخزين الملف للاستخدام لاحقاً
    window.selectedVideoFile = file;
    
    showToast('✅ تم اختيار الفيديو. أضف عنواناً واحفظه', 'success');
}

/**
 * حفظ الفيديو المرفوع من المستخدم
 */
async function saveUploadedVideo() {
    const file = window.selectedVideoFile;
    const title = document.getElementById('videoTitle')?.value.trim();
    const description = document.getElementById('videoDescription')?.value.trim();
    
    if (!file) {
        showToast('⚠️ الرجاء اختيار فيديو أولاً', 'error');
        return;
    }
    
    if (!title) {
        showToast('⚠️ الرجاء إدخال عنوان للفيديو', 'error');
        return;
    }
    
    // إنشاء رابط مؤقت للفيديو
    const videoUrl = URL.createObjectURL(file);
    
    const video = {
        type: 'local',
        title,
        description: description || '',
        url: videoUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
    };
    
    await addDocument('videos', video);
    
    showToast('✅ تم حفظ الفيديو بنجاح', 'success');
    
    // إعادة تعيين النموذج
    const previewContainer = document.getElementById('uploadedVideoPreview');
    const uploadSection = document.getElementById('uploadSection');
    const fileInput = document.getElementById('videoFileInput');
    
    if (previewContainer) previewContainer.style.display = 'none';
    if (uploadSection) uploadSection.style.opacity = '1';
    if (fileInput) fileInput.value = '';
    
    const titleInput = document.getElementById('videoTitle');
    const descInput = document.getElementById('videoDescription');
    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
    
    window.selectedVideoFile = null;
    
    // تحديث الصفحة
    await renderVideosPage();
}

/**
 * معالجة اختيار فيديو من الأدمن
 */
function handleAdminVideoSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const player = document.getElementById('adminVideoPlayer');
    const preview = document.getElementById('adminVideoPreview');
    
    if (player && preview) {
        player.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    }
    
    window.adminVideoFile = file;
}

/**
 * حفظ فيديو الأدمن
 */
async function saveAdminVideo() {
    const file = window.adminVideoFile;
    const title = document.getElementById('adminVideoTitle')?.value.trim();
    
    if (!file) {
        showToast('⚠️ الرجاء اختيار فيديو', 'error');
        return;
    }
    
    if (!title) {
        showToast('⚠️ الرجاء إدخال عنوان', 'error');
        return;
    }
    
    const videoUrl = URL.createObjectURL(file);
    
    const video = {
        type: 'local',
        title,
        description: '',
        url: videoUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
    };
    
    await addDocument('videos', video);
    
    // إزالة المودال
    const modal = document.getElementById('addVideoModal');
    if (modal) modal.remove();
    
    showToast('✅ تم حفظ الفيديو', 'success');
    await renderVideosPage();
}

/**
 * حذف فيديو
 */
async function deleteVideo(id) {
    if (confirm('هل أنت متأكد من حذف هذا الفيديو؟')) {
        await deleteDocument('videos', id);
        showToast('🗑️ تم حذف الفيديو');
        await renderVideosPage();
    }
}

/**
 * دعم السحب والإفلات للفيديو
 */
function setupDragAndDrop() {
    const uploadSection = document.getElementById('uploadSection');
    if (!uploadSection) return;
    
    uploadSection.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadSection.classList.add('dragover');
    });
    
    uploadSection.addEventListener('dragleave', () => {
        uploadSection.classList.remove('dragover');
    });
    
    uploadSection.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadSection.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('video/')) {
            const input = document.getElementById('videoFileInput');
            const dt = new DataTransfer();
            dt.items.add(file);
            input.files = dt.files;
            handleVideoUpload({ target: { files: [file] } });
        }
    });
}

/**
 * تحديث واجهة المستخدم حسب حالة المستخدم
 */
function updateUIForUser() {
    const isLoggedIn = currentUser && typeof currentUser === 'object';
    const isAdmin = currentUser === 'admin' || currentUser === 'developer';
    const isDev = currentUser === 'developer';

    document.getElementById('sidebarLoginBtn').style.display = (isLoggedIn || isAdmin) ? 'none' : 'block';
    document.getElementById('sidebarLogoutBtn').style.display = (isLoggedIn || isAdmin) ? 'block' : 'none';
    document.getElementById('adminToggleBtn').style.display = isAdmin ? 'flex' : 'none';
    
    // Update sidebar user info
    const userInfo = document.getElementById('sidebarUserInfo');
    if (userInfo) {
        if (isAdmin) {
            userInfo.innerHTML = `
                <div class="user-avatar"><i class="fas fa-crown"></i></div>
                <div>
                    <div style="font-weight: 700;">${isDev ? 'مطور المتجر' : 'مدير المتجر'}</div>
                    <div style="font-size: 0.75rem; color: var(--success);">مسجل الدخول</div>
                </div>`;
        } else if (isLoggedIn) {
            userInfo.innerHTML = `
                <div class="user-avatar"><i class="fas fa-user"></i></div>
                <div>
                    <div style="font-weight: 700;">${currentUser.name || 'مستخدم'}</div>
                    <div style="font-size: 0.75rem; color: var(--success);">مسجل الدخول</div>
                </div>`;
        }
    }

    // Update store display
    document.getElementById('storeNameDisplay').textContent = storeInfo.name;
    const logoEl = document.getElementById('storeLogo');
    if (logoEl) logoEl.src = storeInfo.logo;
}

/**
 * عرض إشعار منبثق
 */
function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.background = type === 'success' ? 'var(--success)' : 
                            type === 'error' ? 'var(--danger)' : '#333';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/**
 * تحديث عدد عناصر السلة
 */
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const el = document.getElementById('cartCount');
    if (el) {
        el.textContent = count;
        el.style.display = count > 0 ? 'flex' : 'none';
    }
}

/**
 * فتح/إغلاق القائمة الجانبية
 */
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}

/**
 * فتح/إغلاق المودالات
 */
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
}

function openSupportModal() {
    document.getElementById('supportModal').classList.add('active');
}

function openWishlistModal() {
    const list = document.getElementById('wishlistItems');
    if (wishlist.length === 0) {
        list.innerHTML = '<p class="text-center">قائمة المفضلة فارغة 💔</p>';
    } else {
        list.innerHTML = wishlist.map(p => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${p.name}</div>
                    <div class="cart-item-price">${p.price} ${storeInfo.currency}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="btn btn-primary btn-sm" onclick="addToCart('${p.id}'); closeModal('wishlistModal')">أضف للسلة</button>
                    <button class="cart-remove-btn" onclick="toggleWishlist('${p.id}'); openWishlistModal()"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }
    document.getElementById('wishlistModal').classList.add('active');
}

/**
 * تفاعلات المنتج
 */
function selectSize(productId, size, btn) {
    const container = document.getElementById(`sizes-${productId}`);
    if (container) {
        container.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    }
}

function changeQty(productId, delta) {
    const qtyEl = document.getElementById(`qty-${productId}`);
    if (qtyEl) {
        let qty = parseInt(qtyEl.textContent) + delta;
        if (qty < 1) qty = 1;
        if (qty > 10) qty = 10;
        qtyEl.textContent = qty;
    }
}

function getSelectedSize(productId) {
    const container = document.getElementById(`sizes-${productId}`);
    if (container) {
        const selected = container.querySelector('.size-btn.selected');
        return selected ? selected.textContent : null;
    }
    return null;
}

function getQuantity(productId) {
    const qtyEl = document.getElementById(`qty-${productId}`);
    return qtyEl ? parseInt(qtyEl.textContent) : 1;
}

/**
 * البحث عن المنتجات
 */
function performSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    const query = input.value.trim().toLowerCase();
    
    if (!query) {
        navigateTo('products');
        return;
    }
    
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.description && p.description.toLowerCase().includes(query)) ||
        p.category.toLowerCase().includes(query)
    );
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="page-container">
            <div class="search-section">
                <div class="search-box">
                    <input type="text" id="searchInput" placeholder="🔍 ابحث عن منتج..." value="${query}">
                    <button onclick="performSearch()"><i class="fas fa-search"></i> بحث</button>
                </div>
            </div>
            <h2 class="section-title">🔍 نتائج البحث عن "${query}"</h2>
            <div class="products-grid">
                ${filtered.length > 0 ? filtered.map(p => productCardHTML(p)).join('') : '<p class="text-center">لا توجد نتائج</p>'}
            </div>
            <button class="btn btn-secondary mt-2" onclick="navigateTo('home')">
                <i class="fas fa-arrow-right"></i> العودة
            </button>
        </div>
    `;
}

/**
 * تحريك السلايدر
 */
function slideSlider(sliderId, amount) {
    const slider = document.getElementById(sliderId);
    if (slider) {
        slider.scrollBy({ left: amount, behavior: 'smooth' });
    }
}

/**
 * إرسال شكوى
 */
async function submitComplaint() {
    const name = document.getElementById('complaintName').value.trim();
    const phone = document.getElementById('complaintPhone').value.trim();
    const text = document.getElementById('complaintText').value.trim();
    
    if (!text) {
        showToast('⚠️ الرجاء كتابة الشكوى', 'error');
        return;
    }
    
    const complaint = {
        name: name || 'مجهول',
        phone: phone || 'غير محدد',
        text,
        status: 'new'
    };
    
    await addDocument('complaints', complaint);
    closeModal('supportModal');
    showToast('✅ تم إرسال شكواك. سنتواصل معك قريباً', 'success');
    
    // Clear form
    document.getElementById('complaintName').value = '';
    document.getElementById('complaintPhone').value = '';
    document.getElementById('complaintText').value = '';
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});