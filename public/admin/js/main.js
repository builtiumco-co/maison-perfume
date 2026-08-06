// MAISON ÉLIXIR | Admin Dashboard Logic
// Security Enforcement (HTTPS Only)
if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    window.location.replace(`https:${window.location.href.substring(window.location.protocol.length)}`);
}

document.addEventListener('DOMContentLoaded', async () => {
    // 0. AUTH PROTECTION & SUPABASE INITIALIZATION
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

    // 0. AUTH PROTECTION + 10 MINUTE SESSION TIMEOUT
    const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes in ms

    async function checkAuth() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
            window.location.href = 'login.html';
            return false;
        }

        const lastAction = localStorage.getItem('admin_last_action');
        const now = Date.now();

        if (lastAction && (now - lastAction > SESSION_TIMEOUT)) {
            await supabaseClient.auth.signOut();
            localStorage.removeItem('admin_last_action');
            alert('Session expired due to 10 minutes of inactivity. Please login again.');
            window.location.href = 'login.html';
            return false;
        }

        localStorage.setItem('admin_last_action', now);
        return true;
    }

    // Refresh activity timestamp on user interaction
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(type => {
        document.addEventListener(type, () => {
            if (localStorage.getItem('admin_last_action')) {
                localStorage.setItem('admin_last_action', Date.now());
            }
        });
    });

    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;

    console.log('Admin Dashboard Initialized. 🚀');

    // Handle Logout
    document.getElementById('logout-btn')?.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        window.location.href = 'login.html';
    });

    // 1. Navigation & Page Switching
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    const pageSections = document.querySelectorAll('.page-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = item.getAttribute('data-page');

            // Update Active Nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Show Corresponding Section
            pageSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${targetPage}-page`) {
                    section.classList.add('active');
                }
            });

            // Update URL hash without jumping
            history.pushState(null, null, `#${targetPage}`);

            // Refresh Data on Load
            if (targetPage === 'orders') loadOrders();
            if (targetPage === 'products') loadProducts();
            if (targetPage === 'inventory') loadInventory();
        });
    });

    // Handle initial load based on hash
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
        const targetNav = document.querySelector(`.nav-item[data-page="${initialHash}"]`);
        if (targetNav) targetNav.click();
    }

    // Date Filter Initialization (Defaults to Today)
    const dateFilter = document.getElementById('order-date-filter');
    if (dateFilter) {
        dateFilter.valueAsDate = new Date();
        dateFilter.addEventListener('change', () => loadOrders());
    }

    // Initial Load
    loadOrders();
    loadProducts();
    loadLocations();
    loadCategories();
    setupSubscriptions();

    // 3. REAL-TIME SUBSCRIPTIONS
    function setupSubscriptions() {
        supabaseClient
            .channel('any')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, loadProducts)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, loadOrders)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'locations' }, loadLocations)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, loadCategories)
            .subscribe();
    }

    let allOrders = []; // Cache for viewing details

    // 4. ORDERS MANAGEMENT
    async function loadOrders() {
        const filterEl = document.getElementById('order-date-filter');
        const selectedDate = filterEl ? filterEl.value : null;

        let query = supabaseClient
            .from('orders')
            .select('*')
            .eq('is_paid', true);

        if (selectedDate) {
            const startOfDay = `${selectedDate}T00:00:00.000Z`;
            const endOfDay = `${selectedDate}T23:59:59.999Z`;
            query = query.gte('created_at', startOfDay).lte('created_at', endOfDay);
        }

        const { data: orders, error } = await query.order('created_at', { ascending: false });

        if (error) return console.error('Error:', error);
        allOrders = orders || [];
        renderOrders(allOrders);
    }

    function renderOrders(orders) {
        const tbody = document.getElementById('orders-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!orders || orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:#888;">No paid orders found for this date.</td></tr>`;
            return;
        }

        orders.forEach(order => {
            const displayId = order.order_id || order.id.substring(0, 8);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${escapeHTML(displayId)}</td>
                <td>${escapeHTML(order.customer_name)}</td>
                <td>${escapeHTML(order.product_name)}</td>
                <td>₦${Number(order.total_amount).toLocaleString()}</td>
                <td><span class="status-tag ${escapeHTML(order.order_status || 'pending')}">${escapeHTML(order.order_status || 'pending')}</span></td>
                <td>
                    <div class="flex-row-gap-8">
                        <select class="status-select" data-id="${escapeHTML(order.id)}">
                            <option value="pending" ${order.order_status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="packed" ${order.order_status === 'packed' ? 'selected' : ''}>Packed</option>
                            <option value="shipped" ${order.order_status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${order.order_status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        </select>
                        <button class="btn btn-small view-order-btn" data-id="${escapeHTML(order.id)}">View</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add Listeners for View Buttons
        document.querySelectorAll('.view-order-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const order = allOrders.find(o => o.id === id);
                if (order) openOrderModal(order);
            });
        });

        // Add Listeners for Status Selects
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async () => {
                const id = select.getAttribute('data-id');
                const newStatus = select.value;

                const { error } = await supabaseClient
                    .from('orders')
                    .update({ order_status: newStatus })
                    .eq('id', id);

                if (error) {
                    alert('Error updating status: ' + error.message);
                    loadOrders(); // Refresh to revert UI on error
                }
            });
        });
    }

    const orderModal = document.getElementById('view-order-modal');
    function openOrderModal(order) {
        const titleEl = document.getElementById('view-order-title');
        if (titleEl) titleEl.textContent = `Order #${order.order_id || order.id.substring(0, 8)}`;
        
        document.getElementById('v-customer').textContent = order.customer_name || 'N/A';
        document.getElementById('v-contact').textContent = `${order.customer_email || ''} / ${order.customer_phone || ''}`;
        document.getElementById('v-whatsapp').textContent = order.is_whatsapp ? '✅ Consent Given' : '❌ No Consent';
        document.getElementById('v-address').textContent = order.customer_address || 'N/A';
        document.getElementById('v-region').textContent = order.delivery_location || 'N/A';
        document.getElementById('v-product').textContent = order.product_name || 'N/A';
        document.getElementById('v-total').textContent = Number(order.total_amount || 0).toLocaleString();
        
        const deliveryElem = document.getElementById('v-delivery-fee');
        if (deliveryElem) {
            deliveryElem.textContent = Number(order.delivery_fee || 0).toLocaleString();
        }

        document.getElementById('v-ref').textContent = order.payment_reference || 'N/A';

        orderModal.classList.add('active');
    }

    document.getElementById('close-view-order')?.addEventListener('click', () => {
        orderModal.classList.remove('active');
    });

    // 5. PRODUCTS MANAGEMENT
    async function loadProducts() {
        const { data: products, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return console.error('Error loading products:', error);
        renderProducts(products || []);
        renderInventory(products || []);
    }

    async function loadInventory() {
        const { data: products, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('name');
        if (!error && products) renderInventory(products);
    }

    function renderInventory(products) {
        const tbody = document.getElementById('inventory-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (!products || products.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:40px; color:#888;">No products in inventory yet. Click "+ Add New Product" to get started!</td></tr>`;
            return;
        }

        products.forEach(product => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHTML(product.name)}</strong></td>
                <td>₦${Number(product.price).toLocaleString()}</td>
                <td>
                    <input type="number" 
                           class="stock-input" 
                           value="${product.quantity_in_stock || 0}" 
                           data-id="${escapeHTML(product.id)}">
                </td>
                <td>
                    <span class="status-tag ${product.quantity_in_stock > 0 ? 'delivered' : 'pending'}">
                        ${product.quantity_in_stock > 0 ? 'ACTIVE' : 'OUT OF STOCK'}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add Listeners for Immediate Stock Update
        document.querySelectorAll('.stock-input').forEach(input => {
            input.addEventListener('change', async () => {
                const id = input.getAttribute('data-id');
                const newValue = parseInt(input.value);

                if (isNaN(newValue)) return;

                const { error } = await supabaseClient
                    .from('products')
                    .update({ quantity_in_stock: newValue })
                    .eq('id', id);

                if (error) {
                    alert('Error updating stock: ' + error.message);
                    loadInventory();
                }
            });
        });
    }

    let allProducts = []; // Local cache for editing

    function renderProducts(products) {
        allProducts = products;
        const grid = document.getElementById('products-admin-grid');
        if (!grid) return;
        grid.innerHTML = '';

        if (!products || products.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #FFF; border-radius: 24px;">
                    <h3 style="font-size: 1.4rem; font-weight:700; margin-bottom: 10px;">No Products Found</h3>
                    <p style="color: #666; margin-bottom: 20px;">Your product catalog is empty. Click below to add your first luxury fragrance.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('open-add-product-modal').click()">+ Add First Product</button>
                </div>
            `;
            return;
        }

        products.forEach((product) => {
            const card = document.createElement('div');
            card.className = 'product-admin-card';
            card.innerHTML = `
                <div class="product-admin-info">
                    <img class="product-thumb" src="${escapeHTML(product.main_image || '../assets/images/hero_iris.jpg')}" alt="${escapeHTML(product.name)}">
                    <h3>${escapeHTML(product.name)}</h3>
                    <p class="product-admin-price">₦${Number(product.price).toLocaleString()}</p>
                    <div class="stock-status">
                      <span class="stock-count">Stock: ${product.quantity_in_stock || 0}</span>
                      ${product.is_featured ? '<span class="status-tag delivered">Featured</span>' : ''}
                    </div>
                </div>
                <div class="product-admin-actions">
                    <button class="btn btn-outline edit-product" style="flex:1" data-id="${escapeHTML(product.id)}">Edit</button>
                    <button class="btn btn-small delete-product text-danger bg-danger-light" data-id="${escapeHTML(product.id)}">Delete</button>
                </div>
            `;
            grid.appendChild(card);
        });

        // Add Listeners for Edit Buttons
        document.querySelectorAll('.edit-product').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const product = allProducts.find(p => p.id === id);
                if (!product) return;

                document.getElementById('modal-title').textContent = 'Edit Product';
                document.getElementById('p-id').value = product.id;
                document.getElementById('p-name').value = product.name;
                document.getElementById('p-price').value = product.price;
                document.getElementById('p-main-image').value = product.main_image || '';
                document.getElementById('p-other-images').value = (product.other_images || []).join(', ');
                document.getElementById('p-sizes').value = product.sizes || '100ml';
                document.getElementById('p-description').value = product.description || '';
                
                const mainPreview = document.getElementById('main-img-preview');
                const mainStatus = document.getElementById('main-img-status');
                if (mainPreview && product.main_image) {
                    mainPreview.src = product.main_image;
                    mainPreview.style.display = 'block';
                    if (mainStatus) {
                        if (product.main_image.startsWith('data:image')) mainStatus.innerHTML = '<span style="color:#27AE60">✓ Using Optimized Image</span>';
                        else mainStatus.textContent = 'Using basic URL link';
                    }
                }
                document.getElementById('p-gender').value = product.gender || 'men';
                document.getElementById('p-category').value = product.category || '';
                document.getElementById('p-stock').value = product.quantity_in_stock || 0;
                document.getElementById('p-featured').checked = product.is_featured || false;

                renderCategoryCheckboxes(product.category || '');
                addProductModal.classList.add('active');
            });
        });

        // Add Listeners for Delete Buttons
        document.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const product = allProducts.find(p => p.id === id);
                if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                    const { error } = await supabaseClient.from('products').delete().eq('id', id);
                    if (error) alert('Error deleting: ' + error.message);
                }
            });
        });
    }

    // === IMAGE OPTIMIZER ALGORITHM ===
    async function optimizeImage(url) {
        if (!url || typeof url !== 'string' || !url.startsWith('http')) return url;
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                try {
                    const TARGET_SIZE = 800;
                    const canvas = document.createElement("canvas");
                    canvas.width = TARGET_SIZE;
                    canvas.height = TARGET_SIZE;
                    const ctx = canvas.getContext("2d");
                    let sWidth = img.width, sHeight = img.height, sx = 0, sy = 0;
                    if (sWidth > sHeight) { sx = (sWidth - sHeight) / 2; sWidth = sHeight; } 
                    else { sy = (sHeight - sWidth) / 2; sHeight = sWidth; }
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = "high";
                    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, TARGET_SIZE, TARGET_SIZE);
                    resolve(canvas.toDataURL("image/webp", 0.85));
                } catch (e) { resolve(url); }
            };
            img.onerror = () => resolve(url);
            img.src = url;
        });
    }

    const mainImgInput = document.getElementById('p-main-image');
    const mainImgStatus = document.getElementById('main-img-status');
    const mainImgPreview = document.getElementById('main-img-preview');
    
    mainImgInput?.addEventListener('input', async () => {
        let url = mainImgInput.value.trim();
        if (!url) {
            if (mainImgPreview) mainImgPreview.style.display = 'none';
            if (mainImgStatus) mainImgStatus.textContent = "We'll automatically fetch, crop, and optimize it.";
            return;
        }
        if (url.startsWith('data:image')) {
            if (mainImgPreview) { mainImgPreview.src = url; mainImgPreview.style.display = 'block'; }
            if (mainImgStatus) mainImgStatus.innerHTML = '<span style="color:#27AE60">✓ Using Optimized Image</span>';
            return;
        }
        if (mainImgStatus) mainImgStatus.innerHTML = '<span style="color:var(--primary)">Optimizing...</span>';
        const base64 = await optimizeImage(url);
        if (base64 !== url) {
            mainImgInput.value = base64;
            if (mainImgPreview) { mainImgPreview.src = base64; mainImgPreview.style.display = 'block'; }
            if (mainImgStatus) mainImgStatus.innerHTML = '<span style="color:#27AE60">✓ Standardized to 800x800 WEBP</span>';
        } else {
            if (mainImgPreview) { mainImgPreview.src = url; mainImgPreview.style.display = 'block'; }
            if (mainImgStatus) mainImgStatus.innerHTML = '<span style="color:#E74C3C">Kept original URL link</span>';
        }
    });

    // Modal Logic
    const addProductModal = document.getElementById('add-product-modal');
    const openModalBtn = document.getElementById('open-add-product-modal');
    const closeModalBtn = document.querySelector('.close-modal');

    openModalBtn?.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Add New Product';
        addProductForm.reset();
        document.getElementById('p-id').value = '';
        if (mainImgPreview) {
            mainImgPreview.style.display = 'none';
            mainImgPreview.src = '';
        }
        if (mainImgStatus) mainImgStatus.textContent = "We'll automatically fetch, crop, and optimize it.";
        renderCategoryCheckboxes('');
        addProductModal.classList.add('active');
    });
    closeModalBtn?.addEventListener('click', () => addProductModal.classList.remove('active'));

    // Handle Product Form Submit
    const addProductForm = document.getElementById('add-product-form');
    addProductForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Saving...';

        const formData = new FormData(addProductForm);
        const productId = formData.get('id');

        // Gather checked categories
        const checkedCategories = Array.from(document.querySelectorAll('.p-category-checkbox:checked'))
            .map(cb => cb.value)
            .join(', ');

        const productData = {
            name: formData.get('name'),
            price: Number(formData.get('price')),
            main_image: formData.get('main_image'),
            other_images: (formData.get('other_images') || '').split(',').map(u => u.trim()).filter(u => u !== ""),
            description: formData.get('description'),
            gender: formData.get('gender') || 'men',
            category: checkedCategories || formData.get('category') || 'EAU DE PARFUM',
            sizes: formData.get('sizes') || '100ml',
            quantity_in_stock: Number(formData.get('quantity_in_stock') || 0),
            is_featured: formData.get('is_featured') === 'on'
        };

        if (productId) productData.id = productId;

        const { error } = await supabaseClient.from('products').upsert([productData]);

        btn.disabled = false;
        btn.textContent = productId ? 'Update Product' : 'Create Product';

        if (error) {
            alert('Error saving product: ' + error.message);
        } else {
            addProductForm.reset();
            addProductModal.classList.remove('active');
            loadProducts();
        }
    });

    // 6. SETTINGS MANAGEMENT
    const settingsForm = document.getElementById('settings-form');
    settingsForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusEl = document.getElementById('save-status');
        const formData = new FormData(settingsForm);

        const settingsData = {
            store_name: formData.get('store_name'),
            store_email: formData.get('store_email'),
            delivery_fee: formData.get('delivery_fee'),
            whatsapp_number: formData.get('whatsapp_number'),
            updated_at: new Date().toISOString()
        };

        statusEl.textContent = 'Saving...';
        const { error } = await supabaseClient.from('settings').upsert(settingsData);

        if (error) {
            statusEl.textContent = 'Error: ' + error.message;
            statusEl.className = 'save-status error';
        } else {
            statusEl.textContent = 'Saved successfully!';
            statusEl.className = 'save-status success';
        }
    });

    // 7. LOCATIONS MANAGEMENT
    async function loadLocations() {
        const { data: locations, error } = await supabaseClient
            .from('locations')
            .select('*')
            .order('name', { ascending: true });

        if (error) return console.error('Error loading locations:', error);
        renderLocations(locations || []);
    }

    function renderLocations(locations) {
        const tbody = document.getElementById('locations-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!locations || locations.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#888;">No custom delivery locations configured.</td></tr>`;
            return;
        }

        locations.forEach(loc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHTML(loc.name)}</td>
                <td>₦${Number(loc.fee).toLocaleString()}</td>
                <td><button class="btn btn-small delete-location text-danger" style="background:none; border:none; cursor:pointer;" data-id="${escapeHTML(loc.id)}">Delete</button></td>
            `;
            tbody.appendChild(tr);
        });

        // Add Listeners for Delete Buttons
        document.querySelectorAll('.delete-location').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const errMsg = document.getElementById('location-error-msg');
                if (errMsg) errMsg.style.display = 'none';

                if (confirm('Delete this location?')) {
                    const { error } = await supabaseClient
                        .from('locations')
                        .delete()
                        .eq('id', id);
                    if (error) {
                        if (errMsg) { errMsg.style.display = 'block'; errMsg.textContent = 'Deletion Blocked: ' + error.message; }
                        else alert('Error deleting: ' + error.message);
                    } else {
                        loadLocations();
                    }
                }
            });
        });
    }

    // Add Location Handler
    document.getElementById('add-location-btn')?.addEventListener('click', async () => {
        const errMsg = document.getElementById('location-error-msg');
        if (errMsg) errMsg.style.display = 'none';

        const name = prompt('Enter Location Name (e.g., Abuja):');
        if (!name) return;
        const fee = prompt('Enter Delivery Fee (₦):');
        if (isNaN(fee) || fee === null) {
            if (errMsg) { errMsg.style.display = 'block'; errMsg.textContent = 'Failed: Please enter a valid number for fee'; }
            else alert('Please enter a valid number for fee');
            return;
        }

        const { error } = await supabaseClient
            .from('locations')
            .insert([{ name, fee: Number(fee) }]);

        if (error) {
            if (errMsg) { errMsg.style.display = 'block'; errMsg.textContent = 'Database Issue: ' + error.message; }
            else alert('Error adding location: ' + error.message);
        } else {
            loadLocations();
        }
    });

    // 7b. CATEGORIES MANAGEMENT
    let storeCategories = ['Eau de Parfum', 'Extrait de Parfum', 'Eau de Toilette', 'Discovery Sets', 'Body Oil'];

    async function loadCategories() {
        const { data: categories, error } = await supabaseClient
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (!error && categories && categories.length > 0) {
            storeCategories = categories.map(c => c.name);
            renderCategoriesTable(categories);
        } else {
            const fallbackObjects = storeCategories.map((name, index) => ({ id: `cat-${index}`, name }));
            renderCategoriesTable(fallbackObjects);
        }
    }

    function renderCategoriesTable(categories) {
        const tbody = document.getElementById('categories-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        categories.forEach(cat => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHTML(cat.name)}</strong></td>
                <td><button class="btn btn-small delete-category text-danger" style="background:none; border:none; cursor:pointer;" data-name="${escapeHTML(cat.name)}" data-id="${escapeHTML(cat.id || '')}">Delete</button></td>
            `;
            tbody.appendChild(tr);
        });

        // Add Delete Handlers
        document.querySelectorAll('.delete-category').forEach(btn => {
            btn.addEventListener('click', async () => {
                const name = btn.getAttribute('data-name');
                const id = btn.getAttribute('data-id');
                const errMsg = document.getElementById('category-error-msg');
                if (errMsg) errMsg.style.display = 'none';

                if (confirm(`Delete category "${name}"?`)) {
                    if (id && !id.startsWith('cat-')) {
                        const { error } = await supabaseClient.from('categories').delete().eq('id', id);
                        if (error && errMsg) {
                            errMsg.style.display = 'block';
                            errMsg.textContent = 'Deletion issue: ' + error.message;
                        }
                    }
                    storeCategories = storeCategories.filter(c => c !== name);
                    loadCategories();
                }
            });
        });
    }

    function renderCategoryCheckboxes(selectedCategoriesString = '') {
        const container = document.getElementById('product-categories-checkboxes');
        if (!container) return;
        container.innerHTML = '';

        const selectedList = (selectedCategoriesString || '')
            .split(',')
            .map(s => s.trim().toLowerCase());

        storeCategories.forEach((catName) => {
            const isChecked = selectedList.includes(catName.toLowerCase());
            const label = document.createElement('label');
            label.className = 'category-checkbox-item';
            label.innerHTML = `
                <input type="checkbox" value="${escapeHTML(catName)}" class="p-category-checkbox" ${isChecked ? 'checked' : ''}>
                <span>${escapeHTML(catName)}</span>
            `;
            container.appendChild(label);
        });
    }

    // Add Category Handler
    document.getElementById('add-category-btn')?.addEventListener('click', async () => {
        const errMsg = document.getElementById('category-error-msg');
        if (errMsg) errMsg.style.display = 'none';

        const name = prompt('Enter New Category Name (e.g., Extrait de Parfum):');
        if (!name || !name.trim()) return;

        const newCatName = name.trim();
        if (!storeCategories.includes(newCatName)) {
            storeCategories.push(newCatName);
        }

        const { error } = await supabaseClient.from('categories').insert([{ name: newCatName }]);
        loadCategories();
    });

    // 8. MESSAGING CENTER LOGIC
    let currentMsgOrder = null;
    let storeSettings = null;

    async function fetchSettings() {
        const { data, error } = await supabaseClient.from('settings').select('*').single();
        if (!error && data) storeSettings = data;
        else storeSettings = { whatsapp_number: '+2348000000000', store_email: 'contact@maisonelixir.com', store_name: 'MAISON ÉLIXIR' };
    }
    fetchSettings();

    const msgTabs = document.querySelectorAll('.msg-tab');
    const msgPreview = document.getElementById('msg-preview');
    const searchInput = document.getElementById('msg-search-id');
    const riderInputs = document.getElementById('rider-inputs');

    msgTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            msgTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const activeTab = tab.getAttribute('data-tab');

            if (riderInputs) riderInputs.style.display = activeTab === 'update' ? 'grid' : 'none';

            updateTemplate(activeTab);
        });
    });

    searchInput?.addEventListener('input', async (e) => {
        const id = e.target.value.trim();
        if (id.length < 3) return;

        const { data, error } = await supabaseClient
            .from('orders')
            .select('*')
            .or(`order_id.ilike.%${id}%,id.eq.${id},id.ilike.%${id}%`)
            .limit(1)
            .single();

        if (!error && data) {
            currentMsgOrder = data;
            const activeTab = document.querySelector('.msg-tab.active')?.getAttribute('data-tab') || 'confirmation';
            updateTemplate(activeTab);
        }
    });

    document.getElementById('rider-name')?.addEventListener('input', () => updateTemplate('update'));
    document.getElementById('rider-phone')?.addEventListener('input', () => updateTemplate('update'));

    function updateTemplate(activeTab) {
        if (!currentMsgOrder || !storeSettings) return;

        const vars = {
            name: currentMsgOrder.customer_name,
            order_id: currentMsgOrder.order_id || currentMsgOrder.id.substring(0, 8),
            item_list: currentMsgOrder.product_name,
            item_name: currentMsgOrder.product_name,
            count: 1,
            total: Number(currentMsgOrder.total_amount).toLocaleString(),
            location: currentMsgOrder.delivery_location || 'Lagos',
            biz_whatsapp: storeSettings.whatsapp_number,
            biz_email: storeSettings.store_email,
            brand_name: storeSettings.store_name,
            site_link: window.location.origin
        };

        const riderName = document.getElementById('rider-name')?.value || '[Rider Name]';
        const riderPhone = document.getElementById('rider-phone')?.value || '[Rider Phone]';

        let template = "";
        if (activeTab === 'confirmation') {
            template = `Hello ${vars.name}! 👋 Your order #${vars.order_id} has been received. Fragrance: ${vars.item_list}. Total Paid: ₦${vars.total}. We are preparing your order for dispatch! ✨`;
        } else if (activeTab === 'update') {
            template = `Hi ${vars.name}! Your order #${vars.order_id} (${vars.item_name}) is on the way to ${vars.location}. Rider Details: Name: ${riderName}, Phone: ${riderPhone}. Contact: ${vars.biz_whatsapp} / ${vars.biz_email}.`;
        } else if (activeTab === 'success') {
            template = `Delivered! ✨ Hope you enjoy your new fragrance, ${vars.name}. Order more at: ${vars.site_link}. Contact: ${vars.biz_whatsapp} / ${vars.biz_email}.`;
        }

        if (msgPreview) {
            msgPreview.value = template;
            const charCount = document.getElementById('char-count');
            if (charCount) charCount.textContent = `${template.length} characters`;
        }
    }

    document.getElementById('open-whatsapp-btn')?.addEventListener('click', () => {
        if (!currentMsgOrder) return alert('Please search for an order first');
        const phone = (currentMsgOrder.customer_phone || '').replace(/[^\d+]/g, '');
        const text = encodeURIComponent(msgPreview ? msgPreview.value : '');
        window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    });

    document.getElementById('copy-msg-btn')?.addEventListener('click', () => {
        if (!msgPreview) return;
        msgPreview.select();
        document.execCommand('copy');
        alert('Message copied to clipboard!');
    });
});
