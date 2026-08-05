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
    let cart = JSON.parse(localStorage.getItem('antigravity_cart') || '[]');
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
                    const gender = activeBtn ? activeBtn.textContent.toLowerCase() : 'all';
                    let genderFilter = 'all';
                    if (gender.includes('unisex')) genderFilter = 'unisex';
                    else if (gender.includes('men')) genderFilter = 'men';
                    else if (gender.includes('women')) genderFilter = 'women';
                    loadShopProducts(genderFilter);
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

        const grid = document.querySelector('.product-grid');
        if (!error && featuredProducts && grid) {
            grid.innerHTML = '';
            featuredProducts.forEach(product => {
                const card = document.createElement('div');
                card.className = 'collection-card';
                card.style.cursor = 'pointer';
                card.innerHTML = `
                    <img src="${escapeHTML(product.main_image)}" alt="${escapeHTML(product.name)}" class="collection-img">
                    <div class="collection-overlay">
                        <h3 class="collection-name">${escapeHTML(product.name)}</h3>
                    </div>
                `;
                card.addEventListener('click', () => { window.location.href = 'shop.html'; });
                grid.appendChild(card);
            });
            revealElements();
        }
    }

    async function loadShopProducts(gender = 'all') {
        let query = supabaseClient.from('products').select('*');
        if (gender !== 'all') query = query.eq('gender', gender);

        const { data: products, error } = await query.order('created_at', { ascending: false });

        const grid = document.querySelector('.products-grid');
        if (!error && grid) {
            grid.innerHTML = '';
            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <div class="product-img-wrapper">
                        <img src="${escapeHTML(product.main_image)}" alt="${escapeHTML(product.name)}">
                    </div>
                    <div class="product-info">
                        <div>
                            <h3 class="product-name">${escapeHTML(product.name)}</h3>
                            <span class="product-category">${escapeHTML(product.category || 'Footwear')}</span>
                        </div>
                        <span class="product-price">₦${Number(product.price).toLocaleString()}</span>
                    </div>
                `;
                card.addEventListener('click', () => openProductModal(product));
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
        document.getElementById('modal-description').textContent = product.description || 'Experience the pinnacle of luxury with our signature slides. Crafted with meticulous attention to detail and premium materials for unparalleled comfort.';

        // SIZES LOGIC
        const sizeContainer = document.getElementById('modal-size-container');
        const sizeGrid = document.getElementById('modal-size-grid');
        if (sizeContainer && sizeGrid) {
            sizeGrid.innerHTML = '';
            if (product.sizes && product.sizes.trim() !== '') {
                const sizesArr = product.sizes.split(',').map(s => s.trim()).filter(s => s);
                if (sizesArr.length > 0) {
                    sizeContainer.style.display = 'block';
                    sizesArr.forEach(size => {
                        const btn = document.createElement('button');
                        btn.className = 'size-btn';
                        btn.textContent = size;
                        btn.onclick = () => {
                            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                            btn.classList.add('active');
                            selectedSize = size;
                        };
                        sizeGrid.appendChild(btn);
                    });
                } else {
                    sizeContainer.style.display = 'none';
                }
            } else {
                sizeContainer.style.display = 'none';
            }
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
            if (currentModalProduct.sizes && currentModalProduct.sizes.trim() !== '') {
                const arr = currentModalProduct.sizes.split(',').filter(s => s.trim());
                if (arr.length > 0 && !selectedSize) {
                    const sb = document.getElementById('modal-size-grid');
                    if (sb) {
                        sb.style.transform = 'translateY(-5px)';
                        setTimeout(() => sb.style.transform = '', 200);
                    }
                    alert('Please select your preferred size to continue. 🖤');
                    return;
                }
            }
            addToCart(currentModalProduct, selectedSize);
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    function addToCart(product, size) {
        const cartItem = { ...product };
        if (size) cartItem.name = `${product.name} (${size})`;
        cart.push(cartItem);
        localStorage.setItem('antigravity_cart', JSON.stringify(cart));
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

    // Filter Logic for Shop Page
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const btnText = btn.textContent.toLowerCase();
            let gender = 'all';
            if (btnText.includes('unisex')) gender = 'unisex';
            else if (btnText.includes('men')) gender = 'men';
            else if (btnText.includes('women')) gender = 'women';
            loadShopProducts(gender);
        });
    });

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
                background: white;
                z-index: 10000;
                box-shadow: -10px 0 30px rgba(0,0,0,0.1);
                transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                display: flex;
                flex-direction: column;
            }
            .cart-sidebar.active { right: 0; }
            .cart-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.4);
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
                border-bottom: 1px solid #eee;
            }
            .cart-sidebar-header h2 { font-family: 'Outfit'; font-size: 1.5rem; font-weight: 800; letter-spacing: 0.05em; margin: 0; }
            .cart-sidebar-header button { background: none; border: none; font-size: 2.5rem; cursor: pointer; color: #999; transition: 0.3s; line-height: 1; margin-top: -5px; }
            .cart-sidebar-header button:hover { color: black; transform: scale(1.1); }
            
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
            .cart-item-sidebar img { width: 90px; height: 90px; object-fit: contain; background: #f9f9f9; border-radius: 12px; padding: 10px; }
            .cart-item-sidebar-info { flex: 1; }
            .cart-item-sidebar-info h4 { font-family: 'Outfit'; font-size: 1.1rem; font-weight: 700; margin-bottom: 5px; text-transform: uppercase; margin-top: 0; }
            .cart-item-sidebar-info p { font-family: 'Outfit'; font-weight: 600; color: #666; font-size: 0.95rem; margin: 0; }
            
            .cart-sidebar-footer {
                padding: 30px;
                border-top: 1px solid #eee;
                background: #fafafa;
            }
            .cart-sidebar-total { display: flex; justify-content: space-between; font-weight: 800; font-size: 1.4rem; margin-bottom: 25px; font-family: 'Outfit'; }
            .sidebar-checkout-btn {
                width: 100%;
                padding: 20px;
                background: black;
                color: white;
                border: none;
                border-radius: 12px;
                font-weight: 700;
                font-size: 1.1rem;
                letter-spacing: 0.1em;
                cursor: pointer;
                transition: 0.3s;
            }
            .sidebar-checkout-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.1);
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
                localStorage.setItem('antigravity_cart', JSON.stringify(cart));
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
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) return;

        const nav = document.querySelector('.nav');

        const burger = document.createElement('button');
        burger.className = 'mobile-menu-btn';
        burger.innerHTML = `
            <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        `;

        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu-overlay';
        
        const mobileBackdrop = document.createElement('div');
        mobileBackdrop.className = 'mobile-backdrop';
        let links = '';
        if (nav) {
            nav.querySelectorAll('a').forEach(a => {
                links += `<a href="${a.href}" class="${a.className}">${a.textContent}</a>`;
            });
        } else {
            links = `
                <a href="index.html" class="nav-link">HOME</a>
                <a href="shop.html" class="nav-link">SHOP</a>
                <a href="about.html" class="nav-link">ABOUT US</a>
                <a href="contact.html" class="nav-link">CONTACT</a>
            `;
        }

        mobileMenu.innerHTML = `
            <div class="mobile-menu-header">
                <h2>ANTIGRAVITY</h2>
                <button class="close-mobile-btn" style="font-weight: 300;">&times;</button>
            </div>
            <div class="mobile-menu-links">
                ${links}
            </div>
        `;

        document.body.appendChild(mobileBackdrop);
        document.body.appendChild(mobileMenu);
        headerActions.insertBefore(burger, headerActions.firstChild);

        const style = document.createElement('style');
        style.textContent = `
            .mobile-menu-btn { display: none; background: none; border: none; cursor: pointer; padding: 5px; color: var(--primary); margin-right: 15px; }
            .mobile-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 10000; opacity: 0; pointer-events: none; transition: 0.4s; }
            .mobile-backdrop.active { opacity: 1; pointer-events: all; }
            .mobile-menu-overlay { position: fixed; top: 0; right: 0; width: 85vw; max-width: 400px; height: 100vh; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); z-index: 10001; display: flex; flex-direction: column; transform: translateX(100%); transition: 0.5s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: -20px 0 40px rgba(0,0,0,0.08); border-left: 1px solid rgba(255,255,255,0.4); }
            .mobile-menu-overlay.active { transform: translateX(0); }
            .mobile-menu-header { display: flex; justify-content: space-between; align-items: center; padding: 35px 40px; border-bottom: 1px solid rgba(0,0,0,0.05); }
            .mobile-menu-header h2 { font-family: 'Outfit'; font-size: 1.5rem; font-weight: 800; letter-spacing: 0.15em; margin: 0; }
            .close-mobile-btn { background: none; border: none; font-size: 3rem; color: #999; cursor: pointer; line-height: 1; margin-top: -5px; transition: 0.3s; }
            .close-mobile-btn:hover { color: black; transform: rotate(90deg) scale(1.1); }
            .mobile-menu-links { display: flex; flex-direction: column; gap: 35px; padding: 60px 40px; }
            .mobile-menu-links a { font-family: 'Outfit'; font-size: 1.8rem; font-weight: 700; text-decoration: none; color: black; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; transition: 0.3s; position: relative; width: fit-content; }
            .mobile-menu-links a::after { content: ''; position: absolute; bottom: -8px; left: 0; width: 0; height: 2px; background: black; transition: 0.3s; }
            .mobile-menu-links a:hover, .mobile-menu-links a.active { opacity: 1; transform: translateX(15px); }
            .mobile-menu-links a:hover::after, .mobile-menu-links a.active::after { width: 100%; }
            @media (max-width: 768px) { .mobile-menu-btn { display: block; } }
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

    console.log('Top Slides - Checkout and Cart Logic Initialized. 🖤');
    revealElements();
    initHeroSwiper();
    injectCartSidebar();
    injectMobileMenu();
});
