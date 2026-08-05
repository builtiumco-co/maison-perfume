# ANTIGRAVITY PERFUME STORE
## Master Execution PRD

**Version:** 1.0  
**Date:** March 2026  
**Status:** Ready for Development  
**Base:** Palms Footwear Structure (Duplicated)

---

## 1. PROJECT OVERVIEW

**Antigravity** is a premium online perfume store using the proven **Palms Speed Run** architecture.

**What's Already Done:**
- ✅ Supabase project created
- ✅ Supabase connected to Antigravity via MCP
- ✅ Database tables replicated from Palms
- ✅ UI designs completed

**What Needs to Be Done:**
- Frontend HTML/CSS/JS with Antigravity UI
- Connect UI to Supabase via Antigravity MCP
- Admin dashboard with Antigravity branding
- Deploy to Vercel/Netlify

---

## 2. TECH STACK

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Supabase (PostgreSQL)
- **Database Connection:** Antigravity MCP (already configured)
- **Hosting:** Vercel or Netlify
- **Payments:** Paystack or Flutterwave
- **Email:** SendGrid
- **Messaging:** WhatsApp Business API

---

## 3. DATABASE TABLES (ALREADY CREATED)

Tables exist in Antigravity Supabase:

### orders
```
id (UUID)
customer_name (text)
customer_email (email)
customer_phone (text)
product_id (UUID)
quantity (number)
size (text) - e.g., "50ml", "100ml", "perfume spray"
total_amount (number)
delivery_fee (number)
payment_method (text) - "bank_transfer" or "card"
payment_status (text) - "pending", "completed", "failed"
order_status (text) - "pending", "packed", "shipped", "delivered"
delivery_address (text)
assigned_rider (UUID)
created_at (timestamp)
```

### products
```
id (UUID)
name (text) - e.g., "Rose Essence 100ml"
description (text)
price (number)
category (text) - "men", "women", "unisex"
quantity_in_stock (number)
sizes (JSONB) - {"50ml": 10, "100ml": 5}
images (text[]) - array of image URLs
is_active (boolean)
created_at (timestamp)
```

### riders
```
id (UUID)
name (text)
phone (text) - WhatsApp number
status (text) - "idle", "on_delivery", "unavailable"
service_area (text) - "Lagos Island", "Lekki", etc.
current_location (text)
is_active (boolean)
```

### settings
```
id (UUID)
store_name (text) - "Antigravity"
store_email (email)
delivery_fee (number)
whatsapp_number (text)
updated_at (timestamp)
```

---

## 4. FRONTEND PAGES TO BUILD

### 4.1 Customer Website

#### Homepage
- Custom Antigravity hero section (YOU HAVE THE UI)
- Navigation: HOME | SHOP | ABOUT | CONTACT
- Product categories: Men's | Women's | Unisex | New Arrivals
- Free shipping banner: "Free delivery on orders over ₦50,000"
- Search functionality
- Shopping cart icon

#### Product Listing Page
- Display products from `products` table
- Filter by category
- Sort by price, newest, best sellers
- Product cards: Image | Name | Price | In Stock badge
- Load from: `GET /orders` → products array

#### Product Detail Page
- Large product images
- Product name, price, description
- Size selector (50ml, 100ml, etc.)
- Stock status
- [Add to Cart] button
- Related products

#### Shopping Cart
- Mini cart or full page
- List items with quantity, price
- [Proceed to Checkout] button
- Estimate delivery

#### Checkout (Single Page)
- Contact: Email, Phone
- Delivery: Full Name, Address (autocomplete), City
- Payment: Bank Transfer or Card/Apple Pay
- Order Summary: Item Price + Delivery Fee = Total
- [Confirm & Pay] button

#### Order Confirmation
- Order ID, status, customer details
- Estimated delivery time
- Email confirmation sent

#### Admin Dashboard (Simple)
- Sidebar: Orders | Products | Settings
- Orders page: Table with all orders
- Products page: Grid of products
- Settings page: Store config form

---

### 4.2 Admin Website

#### Orders Page
- Table: Order ID | Customer | Product | Amount | Status | Action
- View order details
- Update status: Pending → Packed → Shipped → Delivered
- Assign rider
- Send WhatsApp message

#### Products Page
- Grid: Product cards
- Show: Name | Price | Stock | Edit/Delete buttons
- Update product info, images, stock levels

#### Settings Page
- Store Name
- Email Address
- Delivery Fee
- WhatsApp Number
- [Save Changes] button

---

## 5. IMPLEMENTATION CHECKLIST

### Phase 1: Frontend (Week 1-2)

#### Homepage
- [ ] Create HTML structure with Antigravity UI
- [ ] Connect to Supabase: `GET /rest/v1/products` → Display products
- [ ] Add navigation, hero section, search
- [ ] Mobile responsive

#### Product Pages
- [ ] Product listing page
  - [ ] Load products from Supabase
  - [ ] Filter by category
  - [ ] Add to cart functionality
- [ ] Product detail page
  - [ ] Display product details
  - [ ] Size selector
  - [ ] Add to cart
- [ ] Shopping cart
  - [ ] Store in localStorage or Supabase cart table
  - [ ] Update quantities
  - [ ] Calculate total

#### Checkout
- [ ] Single page form
- [ ] Contact section (email, phone)
- [ ] Shipping section (name, address, city)
- [ ] Payment section (bank or card)
- [ ] Order summary
- [ ] [Confirm & Pay] button
  - [ ] Validate form
  - [ ] POST to Supabase: `INSERT INTO orders`
  - [ ] Trigger Paystack/Flutterwave iframe
  - [ ] Show confirmation page

#### Confirmation Page
- [ ] Show order ID, details, status
- [ ] Send email via SendGrid
- [ ] Redirect to homepage after 5 seconds

### Phase 2: Admin Dashboard (Week 2-3)

#### Dashboard Setup
- [ ] Create HTML/CSS for admin dashboard
- [ ] Sidebar navigation (Orders, Products, Settings)
- [ ] Top bar (logo, title, notifications, avatar)

#### Orders Page
- [ ] Load orders from Supabase: `GET /rest/v1/orders`
- [ ] Display in table
- [ ] Click row → modal shows order details
- [ ] Modal features:
  - [ ] Customer info
  - [ ] Delivery address (copy button)
  - [ ] Assign rider dropdown
  - [ ] [Send to WhatsApp] button
  - [ ] Status update buttons

#### Products Page
- [ ] Load products: `GET /rest/v1/products`
- [ ] Display as grid
- [ ] [Update Stock] button → modal
- [ ] Edit product button
- [ ] Delete product button

#### Settings Page
- [ ] Text inputs for store config
- [ ] Load current settings from Supabase
- [ ] [Save Changes] button
  - [ ] PATCH to Supabase: `UPDATE settings`
  - [ ] Show success toast

### Phase 3: Integrations (Week 3)

#### Payment Integration
- [ ] Implement Paystack/Flutterwave SDK
- [ ] Card payment button
- [ ] Webhook to confirm payment
- [ ] Update order status on success

#### WhatsApp Integration
- [ ] WhatsApp button on order modal
- [ ] Open pre-filled message with:
  - Order ID
  - Customer phone
  - Delivery address
  - Rider name

#### Email Integration
- [ ] SendGrid setup
- [ ] Order confirmation email template
- [ ] Shipped notification email
- [ ] Delivery confirmation email

#### Image Uploads
- [ ] Supabase Storage for product images
- [ ] Upload on product edit
- [ ] Display on product pages

### Phase 4: Deployment (Week 4)

#### Security
- [ ] Enable RLS on all tables
- [ ] Add Supabase security policies
- [ ] API key in environment variables
- [ ] CORS configured

#### Hosting
- [ ] Deploy to Vercel/Netlify
- [ ] Environment variables set
- [ ] HTTPS enforced
- [ ] Security headers configured

#### Testing
- [ ] Test on Chrome, Firefox, Safari
- [ ] Mobile responsiveness
- [ ] Payment flow
- [ ] Email notifications
- [ ] Order tracking

#### Launch
- [ ] Domain connected
- [ ] SSL certificate
- [ ] Monitoring/alerting set up
- [ ] Backup strategy
- [ ] Support documentation

---

## 6. SUPABASE MCP SETUP (ALREADY DONE)

Your Supabase is already connected via Antigravity MCP.

**To query in JavaScript:**
```javascript
// Already available via MCP
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true);

const { data: orders } = await supabase
  .from('orders')
  .select('*');

// Insert new order
const { data, error } = await supabase
  .from('orders')
  .insert([{
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    product_id: 'uuid-here',
    total_amount: 50000,
    order_status: 'pending'
  }]);
```

---

## 7. FILE STRUCTURE

```
antigravity/
├── index.html          (Homepage)
├── products.html       (Product listing)
├── product.html        (Product detail)
├── cart.html           (Shopping cart)
├── checkout.html       (Single-page checkout)
├── confirmation.html   (Order confirmation)
├── admin/
│   ├── dashboard.html  (Admin dashboard)
│   ├── orders.html     (Orders page)
│   ├── products.html   (Products page)
│   └── settings.html   (Settings page)
├── css/
│   ├── style.css       (Global styles)
│   ├── admin.css       (Admin styles)
│   └── responsive.css  (Mobile styles)
├── js/
│   ├── config.js       (Supabase config - YOUR CREDENTIALS)
│   ├── main.js         (Homepage logic)
│   ├── products.js     (Product logic)
│   ├── checkout.js     (Checkout logic)
│   ├── admin.js        (Admin logic)
│   └── utils.js        (Helper functions)
├── images/             (Product images, logos)
├── .env.local          (API keys - NEVER COMMIT)
└── package.json        (Dependencies)
```

---

## 8. CONFIGURATION

### Create .env.local (Never commit!)
```
SUPABASE_URL=https://your-antigravity-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PAYSTACK_PUBLIC_KEY=pk_live_...
SENDGRID_API_KEY=SG.xxxx...
WHATSAPP_API_TOKEN=xxxx...
```

### Update config.js
```javascript
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

## 9. KEY DIFFERENCES FROM PALMS

| Palms (Footwear) | Antigravity (Perfume) |
|---|---|
| Sizes: 39-45 (shoes) | Sizes: 50ml, 100ml (spray bottles) |
| Categories: Men's, Women's | Categories: Men's, Women's, Unisex |
| Free shipping in Lagos | Free shipping on orders over ₦50,000 |
| Handmade artisan focus | Premium fragrance focus |
| Hero: Lifestyle shoe photo | Hero: Premium perfume bottle photo |
| Admin assigns riders | Admin assigns riders (SAME) |

**Database Changes Needed:**
1. Update `products.size` to accommodate ml measurements
2. Update category options to include "Unisex"
3. Update `settings.delivery_fee` default
4. Update all copy/branding to Antigravity

---

## 10. DEVELOPMENT WORKFLOW

### Day 1-2: Homepage
```bash
1. Create index.html with Antigravity UI
2. Style with CSS (you have the design)
3. Connect to Supabase: fetch products
4. Test locally: npm start or python -m http.server
```

### Day 3-4: Product Pages
```bash
1. products.html (listing)
2. product.html (detail)
3. Cart functionality (localStorage)
4. Add to cart button logic
```

### Day 5-6: Checkout
```bash
1. checkout.html (single page form)
2. Form validation
3. Supabase INSERT order
4. Paystack/Flutterwave integration
5. Confirmation page
```

### Day 7-8: Admin
```bash
1. admin/dashboard.html
2. Orders table
3. Products grid
4. Settings form
5. Modal for order details
```

### Day 9-10: Integrations & Polish
```bash
1. Email notifications (SendGrid)
2. WhatsApp waybill
3. Mobile responsive testing
4. Security hardening
5. Deployment prep
```

---

## 11. TESTING CHECKLIST

Before deploying:

**Frontend:**
- [ ] All pages load without errors
- [ ] Products display correctly
- [ ] Add to cart works
- [ ] Checkout form validates
- [ ] Payment gateway works (test mode)
- [ ] Confirmation page shows
- [ ] Mobile responsive (375px, 768px, 1024px)

**Admin:**
- [ ] Orders display
- [ ] Can update status
- [ ] Can assign rider
- [ ] Settings save
- [ ] WhatsApp button opens message
- [ ] Mobile responsive

**Integration:**
- [ ] Emails sent on order
- [ ] WhatsApp messages send
- [ ] Payment confirms
- [ ] Order status updates

**Security:**
- [ ] No API keys in frontend code
- [ ] HTTPS enforced
- [ ] RLS policies working
- [ ] Rate limiting active

---

## 12. DEPLOYMENT

### Vercel
```bash
1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables
4. Deploy automatically
```

### Netlify
```bash
1. Push to GitHub
2. Connect to Netlify
3. Set build command: (none, static files)
4. Set publish directory: ./ (or root)
5. Add environment variables
6. Deploy
```

### Domain Setup
```bash
1. Buy domain (Namecheap, GoDaddy)
2. Point nameservers to Vercel/Netlify
3. SSL certificate (auto-generated)
4. Wait 24-48 hours for DNS to propagate
```

---

## 13. LAUNCH CHECKLIST

- [ ] All pages built and tested
- [ ] Admin dashboard functional
- [ ] Payments working
- [ ] Emails sending
- [ ] WhatsApp integration working
- [ ] Security hardened
- [ ] RLS policies enabled
- [ ] Rate limiting configured
- [ ] Monitoring/alerting set up
- [ ] Backups configured
- [ ] Domain set up
- [ ] HTTPS working
- [ ] Mobile responsive
- [ ] Legal pages (Privacy, Terms)
- [ ] Support email configured
- [ ] Team trained

---

## 14. POST-LAUNCH

**Week 1:**
- Monitor for errors
- Fix bugs reported by users
- Check payment transactions
- Monitor server performance

**Month 1:**
- Review analytics
- Get user feedback
- Plan Phase 2 features
- Document learnings

**Ongoing:**
- Update dependencies
- Monitor security
- Optimize performance
- Add features based on feedback

---

## 15. SUCCESS CRITERIA

✅ **Go-Live:**
- 0 critical bugs
- 99% uptime
- Payment success rate > 95%
- All emails sending
- WhatsApp working

✅ **Month 1:**
- 100+ orders
- Customer retention > 20%
- Page load time < 2 seconds
- Mobile conversion > 60%

✅ **Month 3:**
- 500+ orders
- Positive customer reviews
- Zero security incidents
- Admin dashboard used daily

---

## NEXT STEPS

1. **This Week:**
   - Finalize Antigravity UI designs
   - Set up development environment
   - Start building homepage

2. **Next Week:**
   - Complete all customer pages
   - Begin admin dashboard
   - Test Supabase integration

3. **Week 3:**
   - Finish admin dashboard
   - Integrate payments
   - Integrate email/WhatsApp

4. **Week 4:**
   - Final testing
   - Deploy to production
   - Launch! 🚀

---

**Antigravity is ready to execute. All infrastructure is in place. Just build the UI and connect to Supabase.** ✅
