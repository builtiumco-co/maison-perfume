document.addEventListener('DOMContentLoaded', () => {
    // 1. SUPABASE INITIALIZATION
    const SUPABASE_URL = 'https://myrqlqstzakmnxfenlzg.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cnFscXN0emFrbW54ZmVubHpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NzczMTAsImV4cCI6MjEwMTQ1MzMxMH0.OovcIHrIY30kAVs2CU1DI6nhU6tpVpD0N4QHTSAY2ss';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // XSS Protection: HTML Escaping helper
    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }


    // Style for dynamic size buttons
    const sizeStyles = document.createElement('style');
    sizeStyles.textContent = `
        .size-btn { padding: 12px 20px; font-family: 'Outfit'; border: 1px solid #ddd; background: transparent; border-radius: 8px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: 0.3s; color: #333; flex-shrink: 0; min-width: 50px; text-align: center; margin-right: 5px;}
        .size-btn:hover { border-color: black; }
        .size-btn.active { background: black; color: white; border-color: black; }
    `;
    document.head.appendChild(sizeStyles);

    // 2. CART STATE
    let cart = JSON.parse(localStorage.getItem('maison_elixir_cart') || '[]');
    updateCartIcon();

    // 3. DYNAMIC LOADING & REALTIME
    if (document.querySelector('.collections-grid')) loadHomepageProducts();
    if (document.querySelector('.products-grid')) loadShopProducts();
    setupSubscriptions();

    function setupSubscriptions() {
        supabaseClient
            .channel('any-public')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
                if (document.querySelector('.collections-grid')) loadHomepageProducts();
                if (document.querySelector('.products-grid')) {
                    // Get current filter
                    const activeBtn = document.querySelector('.filter-btn.active');
                    const text = activeBtn ? activeBtn.textContent.toLowerCase() : 'all';
                    let categoryFilter = 'all';
                    if (text.includes('extrait')) categoryFilter = 'Extrait de Parfum';
                    else if (text.includes('parfum')) categoryFilter = 'Eau de Parfum';
                    else if (text.includes('toilette')) categoryFilter = 'Eau de Toilette';
                    loadShopProducts(categoryFilter);
                }
            })
            .subscribe();
    }

    async function loadHomepageProducts() {
        const { data: featuredProducts, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('is_featured', true)
            .limit(3);

        const grid = document.querySelector('.product-grid-redesigned') || document.querySelector('.product-grid');
        if (!error && grid) {
            grid.innerHTML = '';
            if (!featuredProducts || featuredProducts.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #666;">
                        <p style="font-size: 1.1rem; opacity: 0.75; font-family: var(--font-serif); font-style: italic;">No featured fragrances listed yet. Add products from the Admin Portal to display them here.</p>
                    </div>
                `;
                return;
            }
            featuredProducts.forEach(product => {
                const card = document.createElement('div');
                card.className = grid.classList.contains('product-grid-redesigned') ? 'product-card-redesigned' : 'product-card';
                card.style.cursor = 'pointer';
                if (grid.classList.contains('product-grid-redesigned')) {
                    card.innerHTML = `
                        <div class="product-image-container">
                            <div class="bestseller-badge">BESTSELLER</div>
                            <img src="${escapeHTML(product.main_image)}" alt="${escapeHTML(product.name)}" class="product-img-redesigned">
                            <button class="btn-wishlist-redesigned" aria-label="Add to Wishlist">
                                <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                            </button>
                            <button class="btn-quick-add">QUICK ADD</button>
                        </div>
                        <div class="product-details-redesigned">
                            <h3 class="product-name-redesigned">${escapeHTML(product.name)}</h3>
                            <p class="product-note">${escapeHTML(product.category || 'Eau de Parfum')} | ${escapeHTML(product.sizes || '100ml')}</p>
                            <div class="product-price-redesigned">₦${Number(product.price).toLocaleString()}</div>
                            <span class="link-underline">View Details</span>
                        </div>
                    `;
                } else {
                    card.innerHTML = `
                        <div class="product-display">
                            <div class="badge-bestseller">BESTSELLER</div>
                            <button class="btn-wishlist">
                                <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                            </button>
                            <img src="${escapeHTML(product.main_image)}" alt="${escapeHTML(product.name)}">
                        </div>
                        <div class="product-info">
                            <h3>${escapeHTML(product.name)}</h3>
                            <p class="product-price">₦${Number(product.price).toLocaleString()}</p>
                        </div>
                    `;
                }

                card.addEventListener('click', (e) => {
                    if (e.target.closest('.btn-wishlist') || e.target.closest('.btn-wishlist-redesigned')) {
                        e.stopPropagation();
                        return;
                    }
                    openProductModal(product);
                });
                grid.appendChild(card);
            });
            revealElements();
        }
    }

    async function loadShopProducts(categoryFilter = 'all') {
        let query = supabaseClient.from('products').select('*');
        if (categoryFilter && categoryFilter !== 'all') {
            query = query.ilike('category', `%${categoryFilter}%`);
        }

        const { data: products, error } = await query.order('created_at', { ascending: false });

        const grid = document.querySelector('.products-grid');
        if (!error && grid) {
            grid.innerHTML = '';
            if (!products || products.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px; color: var(--primary);">
                        <p style="font-size: 1.2rem; opacity: 0.75; font-family: var(--font-serif); font-style: italic;">Our catalog is currently empty. New fragrance arrivals will appear here once added from the Admin Portal.</p>
                    </div>
                `;
                return;
            }
            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <div class="product-display">
                        <div class="badge-bestseller">BESTSELLER</div>
                        <button class="btn-wishlist">
                            <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        </button>
                        <img src="${escapeHTML(product.main_image)}" alt="${escapeHTML(product.name)}">
                    </div>
                    <div class="product-info">
                        <h3>${escapeHTML(product.name)}</h3>
                        <p class="product-price">₦${Number(product.price).toLocaleString()}</p>
                    </div>
                `;
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.btn-wishlist')) {
                        e.stopPropagation();
                        const path = e.target.closest('.btn-wishlist').querySelector('path');
                        if (path.style.fill === 'rgb(26, 26, 26)') {
                            path.style.fill = 'none';
                        } else {
                            path.style.fill = '#1A1A1A';
                        }
                        return;
                    }
                    openProductModal(product);
                });
                grid.appendChild(card);
            });
            revealElements();
        }
    }

    // 4. PRODUCT MODAL & CART LOGIC
    const modal = document.getElementById('product-details-modal');
    const closeBtn = document.getElementById('close-details-modal');
    const addCartBtn = document.querySelector('.add-cart-btn');
    let currentModalProduct = null;
    let selectedSize = null;

    function openProductModal(product) {
        if (!modal) return;
        currentModalProduct = product;
        selectedSize = null;

        // Set Main Details
        document.getElementById('main-product-img').src = product.main_image;
        document.getElementById('modal-name').textContent = product.name;
        document.getElementById('modal-category').textContent = product.category || (product.gender + "'s Slide");
        const formattedPrice = `₦${Number(product.price).toLocaleString()}`;
        document.getElementById('modal-price').textContent = formattedPrice;
        document.getElementById('btn-price-display').textContent = formattedPrice;
        document.getElementById('modal-description').textContent = product.description || 'Experience the pinnacle of luxury with our signature fragrance. Crafted with rare botanical extracts, rich essential oils, and meticulous artistry for an unforgettable sillage.';

        // BOTTLE VOLUME LOGIC
        selectedSize = product.sizes || '100ml';
        const sizeContainer = document.getElementById('modal-size-container');
        if (sizeContainer) {
            sizeContainer.innerHTML = `<div style="font-size: 0.85rem; font-weight: 700; color: #C5A880; text-transform: uppercase; letter-spacing: 0.1em;">VOLUME: ${escapeHTML(selectedSize)}</div>`;
            sizeContainer.style.display = 'block';
        }

        // Setup Gallery
        const thumbRow = document.getElementById('thumbnail-row');
        thumbRow.innerHTML = '';
        const allImages = [product.main_image, ...(product.other_images || [])];

        allImages.forEach((imgUrl, index) => {
            if (!imgUrl) return;
            const thumb = document.createElement('img');
            thumb.src = imgUrl;
            thumb.className = `thumb-img ${index === 0 ? 'active' : ''}`;

            const handleImageSwitch = () => {
                const mainImg = document.getElementById('main-product-img');
                mainImg.style.opacity = '0';
                setTimeout(() => {
                    document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                    mainImg.src = imgUrl;
                    mainImg.style.opacity = '1';
                }, 150);
            };

            thumb.addEventListener('mousedown', handleImageSwitch);
            thumb.addEventListener('touchstart', handleImageSwitch, { passive: true });
            thumbRow.appendChild(thumb);
        });

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    addCartBtn?.addEventListener('click', () => {
        if (currentModalProduct) {
            addToCart(currentModalProduct, selectedSize || currentModalProduct.sizes || '100ml');
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    function addToCart(product, size) {
        const cartItem = { ...product };
        if (size) cartItem.name = `${product.name} (${size})`;
        cart.push(cartItem);
        localStorage.setItem('maison_elixir_cart', JSON.stringify(cart));
        updateCartIcon();
        if (typeof renderCartSidebar === 'function') {
            renderCartSidebar();
            openCartSidebar();
        }
    }

    function updateCartIcon() {
        const countBadge = document.getElementById('cart-count');
        if (countBadge) {
            countBadge.textContent = cart.length;
            countBadge.style.display = cart.length > 0 ? 'flex' : 'none';
        }
    }

    closeBtn?.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // 5. UI INTERACTIONS
    function revealElements() {
        const reveals = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                }
            });
        }, { threshold: 0.1 });

        reveals.forEach(element => {
            observer.observe(element);
        });
    }

    // Dynamic Live Categories Loader for Shop Page
    async function loadLiveCategories() {
        const filtersContainer = document.getElementById('shop-filters-container') || document.querySelector('.shop-filters');
        if (!filtersContainer) return;

        // Fetch live categories from Supabase categories table
        const { data: dbCategories } = await supabaseClient
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        let categoryList = ['Eau de Parfum', 'Extrait de Parfum', 'Eau de Toilette', 'Discovery Sets', 'Body Oil'];
        if (dbCategories && dbCategories.length > 0) {
            categoryList = dbCategories.map(c => c.name);
        }

        filtersContainer.innerHTML = '';

        // Add 'ALL' Button
        const allBtn = document.createElement('button');
        allBtn.className = 'filter-btn active';
        allBtn.textContent = 'ALL';
        allBtn.setAttribute('data-category', 'all');
        filtersContainer.appendChild(allBtn);

        // Add Dynamic Category Buttons
        categoryList.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.textContent = cat.toUpperCase();
            btn.setAttribute('data-category', cat);
            filtersContainer.appendChild(btn);
        });

        // Add Click Listener to all filter buttons
        filtersContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                filtersContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const cat = btn.getAttribute('data-category');
                loadShopProducts(cat);
            });
        });
    }
    loadLiveCategories();

    // Parallax effect for the hero image
    const productImg = document.querySelector('.product-img');
    if (productImg) {
        document.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth / 2 - e.pageX) / 40;
            const y = (window.innerHeight / 2 - e.pageY) / 40;
            productImg.style.transform = `translateX(${x}px) translateY(${y}px)`;
        });
    }

    // 6. HERO SWIPER
    function initHeroSwiper() {
        const swiper = document.querySelector('.hero-image-swiper');
        const nextBtn = document.querySelector('.next-hero');
        const prevBtn = document.querySelector('.prev-hero');
        const numDisplay = document.getElementById('hero-num');
        if (!swiper) return;

        const images = swiper.querySelectorAll('.hero-img');
        if (images.length < 2) return;

        let currentIndex = 0;

        function updateSwiper(newIndex) {
            images[currentIndex].classList.remove('active');
            currentIndex = newIndex;
            images[currentIndex].classList.add('active');

            // Update counter "01 / 03"
            if (numDisplay) {
                numDisplay.textContent = `0${currentIndex + 1} / 0${images.length}`;
            }
        }

        nextBtn?.addEventListener('click', () => {
            let nextIndex = (currentIndex + 1) % images.length;
            updateSwiper(nextIndex);
        });

        prevBtn?.addEventListener('click', () => {
            let nextIndex = (currentIndex - 1 + images.length) % images.length;
            updateSwiper(nextIndex);
        });

        // Still keep slow auto-switch if no interaction, or remove it?
        // Let's remove auto-switch to be safe since user was specific.
    }

    // 7. CART SIDEBAR LOGIC
    function injectCartSidebar() {
        const sidebarHTML = `
            <div id="cart-sidebar" class="cart-sidebar">
                <div class="cart-sidebar-header">
                    <h2>YOUR BAG</h2>
                    <button id="close-cart-btn">&times;</button>
                </div>
                <div id="cart-items-container" class="cart-items-container"></div>
                <div class="cart-sidebar-footer">
                    <div class="cart-sidebar-total">
                        <span>Total:</span>
                        <span id="cart-sidebar-total-amount">₦0</span>
                    </div>
                    <button id="sidebar-checkout-btn" class="sidebar-checkout-btn">CHECKOUT</button>
                </div>
            </div>
            <div id="cart-overlay" class="cart-overlay"></div>
        `;
        document.body.insertAdjacentHTML('beforeend', sidebarHTML);

        document.getElementById('close-cart-btn').addEventListener('click', closeCartSidebar);
        document.getElementById('cart-overlay').addEventListener('click', closeCartSidebar);
        document.getElementById('sidebar-checkout-btn').addEventListener('click', () => {
            window.location.href = 'cart.html';
        });

        const style = document.createElement('style');
        style.textContent = `
            .cart-sidebar {
                position: fixed;
                top: 0;
                right: -450px;
                width: 450px;
                max-width: 100vw;
                height: 100vh;
                background: #0E0C0A;
                color: var(--primary);
                z-index: 10000;
                box-shadow: -10px 0 30px rgba(0,0,0,0.3);
                transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                display: flex;
                flex-direction: column;
                border-left: 1px solid rgba(255, 255, 255, 0.08);
            }
            .cart-sidebar.active { right: 0; }
            .cart-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.6);
                backdrop-filter: blur(4px);
                z-index: 9999;
                opacity: 0;
                pointer-events: none;
                transition: 0.3s;
            }
            .cart-overlay.active { opacity: 1; pointer-events: all; }
            .cart-sidebar-header {
                padding: 30px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }
            .cart-sidebar-header h2 { font-family: var(--font-serif); font-size: 1.6rem; font-weight: 400; letter-spacing: 0.05em; margin: 0; }
            .cart-sidebar-header button { background: none; border: none; font-size: 2.5rem; cursor: pointer; color: #999; transition: 0.3s; line-height: 1; margin-top: -5px; }
            .cart-sidebar-header button:hover { color: var(--accent); transform: scale(1.1); }
            
            .cart-items-container {
                flex: 1;
                overflow-y: auto;
                padding: 30px;
                display: flex;
                flex-direction: column;
                gap: 25px;
            }
            .cart-item-sidebar {
                display: flex;
                gap: 20px;
                align-items: center;
            }
            .cart-item-sidebar img { width: 90px; height: 90px; object-fit: contain; background: #1D1915; border-radius: 12px; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.05); }
            .cart-item-sidebar-info { flex: 1; }
            .cart-item-sidebar-info h4 { font-family: var(--font-serif); font-size: 1.2rem; font-weight: 400; margin-bottom: 5px; margin-top: 0; color: var(--primary); }
            .cart-item-sidebar-info p { font-family: 'Outfit'; font-weight: 600; color: var(--text-muted); font-size: 0.95rem; margin: 0; }
            
            .cart-sidebar-footer {
                padding: 30px;
                border-top: 1px solid rgba(255, 255, 255, 0.08);
                background: #110F0D;
            }
            .cart-sidebar-total { display: flex; justify-content: space-between; font-weight: 800; font-size: 1.4rem; margin-bottom: 25px; font-family: 'Outfit'; }
            .sidebar-checkout-btn {
                width: 100%;
                padding: 20px;
                background: var(--accent);
                color: #0E0C0A;
                border: none;
                border-radius: 12px;
                font-weight: 700;
                font-size: 1.1rem;
                letter-spacing: 0.1em;
                cursor: pointer;
                transition: 0.3s;
            }
            .sidebar-checkout-btn:hover {
                background: var(--accent-dark);
                transform: translateY(-3px);
                box-shadow: 0 10px 20px rgba(197, 168, 128, 0.2);
            }
            .sidebar-checkout-btn:disabled { opacity: 0.5; pointer-events: none; }
        `;
        document.head.appendChild(style);

        document.querySelectorAll('.cart-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openCartSidebar();
            });
        });

        renderCartSidebar();
    }

    function openCartSidebar() {
        renderCartSidebar();
        document.getElementById('cart-sidebar').classList.add('active');
        document.getElementById('cart-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCartSidebar() {
        document.getElementById('cart-sidebar').classList.remove('active');
        document.getElementById('cart-overlay').classList.remove('active');
        document.body.style.overflow = '';
    }

    function renderCartSidebar() {
        const container = document.getElementById('cart-items-container');
        if (!container) return;
        
        container.innerHTML = '';
        let total = 0;
        
        if (cart.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999; margin-top: 50px;">Your bag is empty.</p>';
            document.getElementById('sidebar-checkout-btn').disabled = true;
        } else {
            document.getElementById('sidebar-checkout-btn').disabled = false;
            cart.forEach((item, index) => {
                total += Number(item.price);
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item-sidebar';
                itemEl.innerHTML = `
                    <img src="${escapeHTML(item.main_image)}" alt="${escapeHTML(item.name)}">
                    <div class="cart-item-sidebar-info">
                        <h4>${escapeHTML(item.name)}</h4>
                        <p>₦${Number(item.price).toLocaleString()}</p>
                        <button class="remove-item-btn" data-index="${index}" style="background:none; border:none; color:#E74C3C; font-size:0.85rem; font-weight:600; cursor:pointer; padding:0; margin-top:8px; text-decoration:underline;">Remove</button>
                    </div>
                `;
                container.appendChild(itemEl);
            });
        }

        document.getElementById('cart-sidebar-total-amount').textContent = `₦${total.toLocaleString()}`;

        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                cart.splice(idx, 1);
                localStorage.setItem('maison_elixir_cart', JSON.stringify(cart));
                updateCartIcon();
                renderCartSidebar();
                
                if (window.location.pathname.includes('cart.html') && typeof populateReview === 'function') {
                    if (cart.length === 0) {
                        alert('Your cart is empty. Redirecting to shop...');
                        window.location.href = 'shop.html';
                    } else {
                        populateReview();
                        const bagCountElem = document.getElementById('bag-count');
                        if (bagCountElem) bagCountElem.textContent = cart.length;
                    }
                }
            });
        });
    }

        // 8. MOBILE HAMBURGER MENU
    function injectMobileMenu() {
        const burger = document.getElementById('mobile-menu-trigger');
        if (!burger) return;

        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu-overlay';
        
        const mobileBackdrop = document.createElement('div');
        mobileBackdrop.className = 'mobile-backdrop';
        
        const links = `
            <a href="index.html" class="nav-link">HOME</a>
            <a href="shop.html" class="nav-link">SHOP</a>
            <a href="about.html" class="nav-link">HOUSE</a>
            <a href="about.html" class="nav-link">JOURNAL</a>
            <a href="contact.html" class="nav-link">CONTACT</a>
            <a href="shop.html" class="nav-link">WISHLIST</a>
            <a href="admin/login.html" class="nav-link">ACCOUNT</a>
        `;

        mobileMenu.innerHTML = `
            <div class="mobile-menu-header">
                <h2>MAISON ÉLIXIR</h2>
                <button class="close-mobile-btn" aria-label="Close Menu">&times;</button>
            </div>
            <div class="mobile-menu-links">
                ${links}
            </div>
        `;

        document.body.appendChild(mobileBackdrop);
        document.body.appendChild(mobileMenu);

        const style = document.createElement('style');
        style.textContent = `
            .mobile-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 10000; opacity: 0; pointer-events: none; transition: 0.4s ease; }
            .mobile-backdrop.active { opacity: 1; pointer-events: all; }
            .mobile-menu-overlay { position: fixed; top: 0; left: 0; width: 85vw; max-width: 360px; height: 100vh; background: #0A0A0A; z-index: 10001; display: flex; flex-direction: column; transform: translateX(-100%); transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 20px 0 40px rgba(0,0,0,0.7); border-right: 1px solid rgba(197,168,128,0.2); color: #F4EFE6; }
            .mobile-menu-overlay.active { transform: translateX(0); }
            .mobile-menu-header { display: flex; justify-content: space-between; align-items: center; padding: 25px 24px; border-bottom: 1px solid rgba(255,255,255,0.08); }
            .mobile-menu-header h2 { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 700; letter-spacing: 0.1em; margin: 0; color: #F4EFE6; }
            .close-mobile-btn { background: none; border: none; font-size: 2.2rem; color: #C5A880; cursor: pointer; line-height: 1; transition: 0.3s; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }
            .close-mobile-btn:hover { color: white; transform: rotate(90deg); }
            .mobile-menu-links { display: flex; flex-direction: column; gap: 4px; padding: 24px; }
            .mobile-menu-links a { font-family: 'Outfit', sans-serif; font-size: 1.1rem; font-weight: 700; text-decoration: none; color: #F4EFE6; text-transform: uppercase; letter-spacing: 0.1em; padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.05); transition: 0.3s ease; }
            .mobile-menu-links a:hover, .mobile-menu-links a.active { color: #C5A880; transform: translateX(8px); }
        `;
        document.head.appendChild(style);

        const closeMenu = () => { 
            mobileMenu.classList.remove('active'); 
            mobileBackdrop.classList.remove('active'); 
            document.body.style.overflow = ''; 
        };

        burger.addEventListener('click', () => { 
            mobileMenu.classList.add('active'); 
            mobileBackdrop.classList.add('active'); 
            document.body.style.overflow = 'hidden'; 
        });
        
        mobileMenu.querySelector('.close-mobile-btn').addEventListener('click', closeMenu);
        mobileBackdrop.addEventListener('click', closeMenu);
    }

    // 9. NETLIFY AJAX NEWSLETTER SUBMISSION
    document.querySelectorAll('.newsletter-form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            if (!btn) return;
            const originalText = btn.textContent;
            
            btn.textContent = 'WAIT...';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            const formData = new FormData(form);
            const searchParams = new URLSearchParams();
            for (const pair of formData) {
                searchParams.append(pair[0], pair[1]);
            }

            fetch('/', {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: searchParams.toString()
            })
            .then(res => {
                if (res.ok) {
                    btn.textContent = 'SUBSCRIBED! 🖤';
                    btn.style.opacity = '1';
                    btn.style.backgroundColor = '#27AE60';
                    btn.style.color = 'white';
                    btn.style.borderColor = '#27AE60';
                    form.reset();
                    
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.backgroundColor = '';
                        btn.style.color = '';
                        btn.style.borderColor = '';
                        btn.disabled = false;
                    }, 4000);
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .catch((error) => {
                btn.textContent = 'ERROR';
                btn.style.opacity = '1';
                btn.style.backgroundColor = '#E74C3C';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.backgroundColor = '';
                    btn.disabled = false;
                }, 3000);
            });
        });
    });

    console.log('Maison Élixir - Checkout and Cart Logic Initialized. 🖤');
    revealElements();
    initHeroSwiper();
    injectCartSidebar();
    injectMobileMenu();
});
