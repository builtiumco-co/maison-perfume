# PALMS FOOTWEAR STORE
## E-Commerce Platform PRD 2026
### Complete Product Requirements Document

**Location:** Lagos, Nigeria  
**Date:** March 2026  
**Version:** 1.0

---

## 1. EXECUTIVE SUMMARY

Palms is a guest-first, frictionless e-commerce platform selling premium handmade footwear in Lagos, Nigeria. The platform eliminates traditional login workflows and uses a **"Speed Run"** checkout model where customers move directly from product selection to payment to delivery without account creation.

### 1.1 Vision

- Make buying premium footwear as frictionless as possible—no logins, no cart lingering, instant gratification.
- Empower local couriers with real-time order visibility and WhatsApp-based communication for seamless last-mile delivery.
- Provide admins with manual control over rider assignment (intentional human touch, not full automation).

### 1.2 Core Principles

- **Zero Login Friction:** Guest checkout only. No user accounts, password resets, or email confirmations.
- **Speed over Features:** One-page checkout. All steps (contact, address, payment) in a single form.
- **Manual Ops, Not Blind Automation:** Admins manually assign riders; WhatsApp is the bridge. This keeps operations visible and human-centered.
- **Real-Time Visibility:** Stock status, order status, and rider availability visible at every step.
- **Mobile-First Design:** Sticky CTAs, responsive imagery, touch-friendly inputs.

---

## 2. PRODUCT SCOPE

### 2.1 In Scope

- Guest-only checkout flow (no registration)
- Product catalog with images, pricing, and stock status
- Single-page checkout with contact, shipping, and payment
- Admin dashboard for orders, inventory, and rider management
- WhatsApp integration for courier communication
- Bank transfer and card/Apple Pay payment methods
- Email notifications for order confirmation and shipment

### 2.2 Out of Scope

- User accounts and customer portals
- Wishlists or saved items
- Returns/refunds management (Phase 2)
- Mobile app (web-only for MVP)
- Automated rider assignment or routing

---

## 3. CUSTOMER JOURNEY (THE SPEED RUN)

**From click to shipped in minutes. No friction. No waiting.**

### 3.1 Stage 1: Discovery

#### 3.1.1 Homepage Landing

- Customer arrives on homepage
- Sees top banner: **"Free shipping in Lagos today! 🚛"**
- Views hero image (lifestyle shot of footwear)
- Clicks **[Shop The Collection]** button or browses bento grid

#### 3.1.2 Browsing Categories

Customer views a 2x2 bento grid:

| Category | Description |
|----------|-------------|
| **Men's** | Large hero image with clickable overlay |
| **Women's** | Large hero image with clickable overlay |
| **New In** | Latest arrivals with new badge and hot-deal tag |
| **Classic Leather** | Signature styles, timeless appeal |

Below grid: 3-column scroll carousel of UGC photos ("How customers are wearing them").

### 3.2 Stage 2: Product Selection

#### 3.2.1 Product Page Layout

Customer clicks on a product category and lands on the product page.

#### 3.2.2 Image Gallery

- Vertical stack of 3–4 high-resolution product images
- Show side view, top view, and on-foot lifestyle shot
- Tap to zoom (pinch-to-zoom on mobile)

#### 3.2.3 Product Information

- **Product Title:** "Tan Leather Cross-Strap"
- **Price:** ₦45,000 (clearly displayed in Naira)
- **Brief Description:** "Handmade with premium leather. Crafted by local artisans. Each pair is unique."
- **Materials/Care Tips:** Collapsible section (optional)

#### 3.2.4 Size Selection

Horizontal scroll of sizes: 39, 40, 41, 42, 43, 44, 45

- Each size shows **"In Stock"** (green) or **"Sold Out"** (red, disabled)
- Selecting a size highlights it and activates the [Buy Now] button
- Out-of-stock sizes are grayed out and unclickable

#### 3.2.5 CTA Buttons

- **[Buy Now]** – Primary button (blue, large, sticky on mobile)
  - Takes customer straight to checkout with selected size pre-filled
- **[Add to Bag]** – Secondary button (ghost style, outline only)
  - Opens mini cart sidebar; customer can review before checkout

### 3.3 Stage 3: Single-Page Checkout

**No login. No account creation. All in one form.**

#### 3.3.1 Checkout Form Layout

Single form with three logical sections (but NOT separate steps/pages):

##### Step 1: Contact Information

- **Label:** "Your Details"
- **[Email Address]** – Text input, required. Used for order confirmation.
  - Placeholder: "you@example.com"
  - Validation: Standard email regex
- **[Phone Number]** – Tel input, required. Used by courier to contact customer.
  - Placeholder: "+234 701 234 5678"
  - Validation: Nigerian phone format (starts with +234 or 0)

##### Step 2: Shipping Address

- **Label:** "Delivery Address"
- **[Full Name]** – Text input, required
  - Placeholder: "Chioma Okafor"
- **[Address Search]** – Autocomplete input, required
  - Uses Google Places API or local maps provider (Mapbox)
  - Shows suggestions as user types (e.g., "Lekki Phase 1, Lagos")
  - Returns: Full address string and latitude/longitude for courier navigation
  - Fallback: If autocomplete fails, allow manual text entry
- **[City Select]** – Dropdown, required
  - Options: Lagos Mainland, Lagos Island, Ikoyi, Lekki, Surulere, Yaba, etc.
  - Used to determine delivery fee and courier availability

##### Step 3: Payment Method

- **Label:** "How will you pay?"
- **Radio button toggle:**
  - **Option A: Bank Transfer** – Shows bank details (hardcoded) for manual transfer
  - **Option B: Card / Apple Pay** – Embedded Paystack or Flutterwave iframe

#### 3.3.2 Order Summary Bar

Sticky bar at bottom showing:

- **Item Price:** ₦45,000
- **Delivery Fee:** ₦2,500 (varies by city)
- **Total:** ₦47,500 (bold, large)

#### 3.3.3 The CTA Button

- **Button text:** [Confirm & Pay]
- **Color:** Bright blue (#0066CC)
- **Disabled until** all required fields are filled
- **On click:** Validates form → Creates order → Initiates payment → Redirects to confirmation

#### 3.3.4 Order Confirmation

After successful payment:

- Confirmation page shows: Order ID, item, size, delivery address, total paid
- Confirmation email sent with same details
- Message: "Your order is being packed. You'll get an update soon!"

---

## 4. ADMIN BACK-END (THE COMMAND CENTER)

Admins manage inventory, assign riders, and track orders in real-time.

### 4.1 Admin Dashboard Overview

#### 4.1.1 KPI Bar (Top of Dashboard)

Four key metrics in large, color-coded cards:

| Metric | Value | Refresh Rate |
|--------|-------|--------------|
| Total Sales Today | ₦185,500 | Every 60 seconds |
| Pending Orders | 12 | Live |
| Active Carts | 3 | Live |
| In Stock Items | 847 | Every 5 minutes |

#### 4.1.2 Recent Orders Table

Shows last 10–15 orders with:

| Order ID | Customer | Time | Status | Action |
|----------|----------|------|--------|--------|
| #ORD-001234 | Chioma O. | 14:32 (Today) | Paid - Awaiting Dispatch | View |
| #ORD-001233 | Adebayo M. | 13:15 (Today) | Shipped | View |

#### 4.1.3 "The Hustle" Alert Section

Red alert list of orders that have been paid but not yet assigned to a courier. Shows:

- Order ID
- Customer name
- Time since payment
- Quick action: **[Assign Rider]** button

### 4.2 Inventory Management

#### 4.2.1 The Size Matrix Grid

Displays stock levels for each product by size:

| Product | Size 40 | Size 41 | Size 42 | Size 43 |
|---------|---------|---------|---------|---------|
| Tan Leather Cross-Strap | 12 | 8 | **0 🚨** | 5 |

Red background and alert icon (🚨) for items with 0 stock.

#### 4.2.2 Quick Actions per Product

- **[Edit Price]** – Update product price
- **[Duplicate Product]** – Clone product to create color/style variants
- **[Hide from Store]** – Temporarily remove from storefront (stock not deleted)
- **[Restock Alert]** – Manually update stock counts

### 4.3 Order Management (The Core)

#### 4.3.1 Order Detail View

When admin clicks "View" on an order, a modal or new page opens showing:

- **Product Name:** "Tan Leather Cross-Strap"
- **Size:** 43
- **Quantity:** 1
- **Price:** ₦45,000
- **Delivery Fee:** ₦2,500
- **Total:** ₦47,500
- **Payment Status:** Paid ✓
- **Order Status:** Packed | Shipped | Delivered

#### 4.3.2 Customer & Address

- **Customer Email:** chioma@example.com
- **Phone:** +234 701 234 5678
- **Full Address:** 12 Admiralty Way, Lekki Phase 1, Lagos
- **Coordinates:** (6.4265, 3.5252)
- **Copy Address to Clipboard** button (one-click, pre-selects for rider)

#### 4.3.3 Manual Rider Assignment (The Manual Override)

This is where the manual control happens:

- **Dropdown:** [Select Rider]
  - Shows available riders with status: Akin (Idle), Musa (On Delivery), Zainab (Idle)
  - Each rider shows location (e.g., "Lekki") and current deliveries
- **Button:** [Assign & Notify Rider]
  - On click: Order status → "Assigned to Akin" | Email notification sent to customer

#### 4.3.4 Logistics Bridge: WhatsApp Integration

Core feature: WhatsApp as the operational layer

- **Button:** [Send Waybill to WhatsApp]
- **On click:** Opens WhatsApp Web with pre-filled message to rider:

```
Hi Akin! 📦 New delivery:

Order #ORD-001234
Customer: Chioma Okafor
Address: 12 Admiralty Way, Lekki Phase 1, Lagos
Phone: +234 701 234 5678
Item: Tan Leather Cross-Strap (Size 43)
Fee: ₦2,500
📍 [Google Maps Link]
```

- **Rider confirms** via WhatsApp → Admin sees status: "Rider Confirmed"

#### 4.3.5 Order Status Transitions

Admin can manually update order status:

- **[Mark as Shipped]**
  - Status → "Shipped"
  - Email to customer: "Your order is on the way!"

- **[Mark as Delivered]**
  - Status → "Delivered"
  - Email to customer: "Your order has been delivered!"

---

## 5. BACKEND ARCHITECTURE & LOGIC

### 5.1 Tech Stack

- **Frontend:** React/Next.js + Tailwind CSS
- **Backend:** Node.js/Express or Python (FastAPI)
- **Database:** PostgreSQL (Supabase) for relational data
- **Payments:** Paystack or Flutterwave API
- **Maps:** Google Places API or Mapbox
- **Messaging:** WhatsApp Business API (or Twilio)
- **Email:** SendGrid or Mailgun for transactional emails

### 5.2 Database Schema (Core Tables)

#### 5.2.1 Products

```
id (UUID)
name (String)
description (Text)
price (Decimal)
category (String: Men's, Women's, New In, Classic)
images (Array of URLs)
is_active (Boolean)
created_at, updated_at (Timestamps)
```

#### 5.2.2 Inventory

```
id (UUID)
product_id (Foreign key → Products)
size (Integer: 39, 40, 41, ..., 45)
quantity_in_stock (Integer)
reserved (Integer, for pending orders)
updated_at (Timestamp)
```

#### 5.2.3 Orders

```
id (UUID / Order ID: ORD-XXXXXX)
product_id, size, quantity
customer_email, customer_phone
delivery_address, city
total_amount, delivery_fee
payment_method (bank_transfer / card)
payment_status (pending, completed, failed)
order_status (pending, packed, shipped, delivered, cancelled)
assigned_rider_id (Foreign key → Riders)
created_at, updated_at
```

#### 5.2.4 Riders

```
id (UUID)
name (String)
phone (String, WhatsApp)
status (idle, on_delivery, unavailable)
service_area (Lagos Mainland, Lekki, Ikoyi, etc.)
current_location (lat, lng)
is_active (Boolean)
```

### 5.3 API Endpoints (Backend Routes)

#### 5.3.1 Product Endpoints

- `GET /api/products` – List all active products
- `GET /api/products/:id` – Get single product with inventory
- `GET /api/products/:id/availability` – Check size availability

#### 5.3.2 Checkout & Order Endpoints

- `POST /api/orders` – Create new order
  - Required fields: product_id, size, customer_email, phone, address, city, payment_method
  - Returns: order_id, total, payment_link (if card/Apple Pay)

- `POST /api/orders/:id/confirm-payment` – Webhook from payment provider
  - Updates payment_status → completed
  - Triggers email confirmation
  - Creates Supabase event for admin notifications

- `GET /api/orders/:id` – Retrieve order details (public, no auth needed for guest)

#### 5.3.3 Admin & Rider Management Endpoints

- `GET /api/admin/dashboard` – KPI stats
- `GET /api/admin/orders` – List all orders (auth required)
- `PATCH /api/admin/orders/:id/assign-rider` – Assign rider to order
- `PATCH /api/admin/orders/:id/status` – Update order status (packed, shipped, delivered)
- `GET /api/admin/inventory` – Get product inventory matrix
- `PATCH /api/admin/inventory/:id` – Update stock
- `GET /api/admin/riders` – List available riders with status

### 5.4 Hidden Logic: A–Z Flow (Step-by-Step)

This is the operational heartbeat of Palms:

1. Customer lands on homepage, browses products, selects size, clicks [Buy Now]
2. Redirects to checkout page (product_id + size pre-filled)
3. Customer fills: email, phone, full name, address, city, payment method
4. Clicks [Confirm & Pay]
5. Frontend → POST /api/orders with all form data
6. Backend: Validates address (geocoding), reserves inventory, creates order record (status: pending)
7. If payment method = card: Returns payment link (Paystack/Flutterwave iframe) | Customer pays
8. If payment method = bank transfer: Shows transfer details → Customer pays manually → Webhook (manual trigger by admin) confirms payment
9. Payment provider → Webhook → /api/orders/:id/confirm-payment
10. Backend: Updates order.payment_status → completed
11. Supabase publishes real-time event: "new_paid_order"
12. Admin dashboard listens → Alert appears in "The Hustle" section (red, blinking)
13. SendGrid → Email confirmation sent to customer with order details
14. Admin packs the footwear in warehouse
15. Admin clicks [Assign Rider] → Selects "Akin" from dropdown
16. Backend: Updates order.assigned_rider_id = akin_uuid, order.order_status = assigned
17. Admin clicks [Send Waybill to WhatsApp]
18. Opens WhatsApp Web with pre-filled waybill message (order ID, customer details, address, fee, maps link)
19. Akin confirms via WhatsApp: "Got it! Picking up now"
20. Admin clicks [Mark as Shipped]
21. Backend: order.order_status → shipped
22. SendGrid → Email to customer: "Your order is on the way! Rider: Akin"
23. Akin delivers to customer → Confirms via WhatsApp
24. Admin clicks [Mark as Delivered]
25. Backend: order.order_status → delivered, inventory deducted
26. SendGrid → Email to customer: "Your order has been delivered!"
27. Order complete. ✨

---

## 6. PAYMENT FLOWS

### 6.1 Card / Apple Pay Flow

- Customer selects [Card/Apple Pay] at checkout
- Clicks [Confirm & Pay]
- Redirects to embedded Paystack/Flutterwave iframe
- Customer enters card details or uses Apple Pay
- Payment provider confirms → Webhook to /api/orders/:id/confirm-payment
- Backend updates order status, sends confirmations

### 6.2 Bank Transfer Flow

- Customer selects [Bank Transfer] at checkout
- Clicks [Confirm & Pay]
- Shown hardcoded bank account details (copy-able)
- Order marked as "Awaiting Transfer"
- Customer transfers money to account
- Admin reviews payment in bank dashboard, clicks [Confirm Transfer] or [Mark as Paid]
- Backend: Updates order.payment_status → completed, triggers flow as above

---

## 7. EMAIL COMMUNICATIONS

### 7.1 Transactional Emails (SendGrid)

#### 7.1.1 Order Confirmation Email

Sent immediately after payment confirmation

- **Subject:** "Your Palms Order Confirmed #ORD-001234"
- **Body:** Order ID, item, size, price, delivery address, estimated delivery time
- **CTA:** [Track Your Order] (links to public order tracking page if available)

#### 7.1.2 Shipped Notification

Sent when admin clicks [Mark as Shipped]

- **Subject:** "Your order is on the way! 🚗"
- **Body:** Rider name, rider phone, estimated delivery time

#### 7.1.3 Delivery Confirmation

Sent when order marked as delivered

- **Subject:** "Your Palms have arrived! ✨"
- **Body:** Thank you message, care tips, feedback CTA

---

## 8. UX/UI SPECIFICATIONS

### 8.1 Design System

#### 8.1.1 Color Palette

| Name | Hex | Usage | RGB |
|------|-----|-------|-----|
| Primary Blue | #0066CC | CTAs, Links | 0, 102, 204 |
| Success Green | #00AA00 | In Stock, Delivered | 0, 170, 0 |
| Warning Orange | #FF9900 | Pending, Assigned | 255, 153, 0 |
| Danger Red | #CC0000 | Sold Out, Alert | 204, 0, 0 |
| Dark Gray | #333333 | Body text | 51, 51, 51 |
| Medium Gray | #555555 | Secondary text | 85, 85, 85 |
| Light Gray | #888888 | Labels, hints | 136, 136, 136 |

#### 8.1.2 Typography

- **Font Family:** Inter or Arial (sans-serif, modern, readable on mobile)
- **H1:** 32px, bold, #2E75B6 (page titles)
- **H2:** 24px, bold, #333333 (section headings)
- **H3:** 18px, bold, #555555 (subsection headings)
- **Body:** 14px, regular, #555555 (body copy)
- **Labels:** 12px, regular, #888888 (form labels, captions)

#### 8.1.3 Spacing & Layout

- **Base unit:** 8px
- **Padding:** 16px, 24px, 32px (multiples of 8)
- **Margin:** 16px, 24px, 32px
- **Border radius:** 4px (inputs), 8px (cards/buttons)
- **Breakpoints:** Mobile (320px), Tablet (768px), Desktop (1024px)

### 8.2 Mobile-First Approach

- Design for 375px width first (iPhone 11)
- Touch targets: min 44x44px (accessibility)
- Sticky CTAs at bottom on mobile (not scrolled out of view)
- Single-column layout for checkout
- Vertical stack of images (not carousel)
- Maximum line length: 60-70 characters on mobile

---

## 9. PERFORMANCE & SECURITY

### 9.1 Performance Targets

- **Page Load Time:** < 2 seconds on 4G
- **Checkout Completion:** < 90 seconds from click to confirmation
- **Admin dashboard refresh:** < 1 second
- **Image optimization:** WebP + lazy loading
- **Real-time updates:** WebSockets or Supabase real-time subscriptions

### 9.2 Security Requirements

- **HTTPS** for all traffic
- **Payment data PCI-DSS** compliant (handled by Paystack/Flutterwave, never stored locally)
- **Validate all user inputs** (email, phone, address, payment)
- **Rate limiting** on API endpoints (prevent brute force, DDoS)
- **Admin auth:** Strong password, 2FA (optional for Phase 2)
- **Log all transactions** for audit trail
- **CORS** properly configured
- **Sensitive data** (rider phone, customer email) encrypted at rest

---

## 10. SUCCESS METRICS & KPIs

### 10.1 Customer Metrics

- **Conversion Rate:** % of visitors → orders (target: 3-5%)
- **Cart Abandonment:** % of started checkouts not completed (target: < 40%)
- **Average Order Value (AOV):** ₦45,000 baseline
- **Time to Purchase:** Average time from landing to order completion (target: < 3 minutes)
- **Mobile conversion rate:** Track separately (should be 80%+ of total traffic)
- **Repeat customer rate:** (Phase 2 KPI)

### 10.2 Operational Metrics

- **Order Fulfillment Time:** Time from payment → shipped (target: < 2 hours)
- **Delivery Time:** Time from shipped → delivered (target: < 24 hours in Lagos)
- **Inventory Accuracy:** % of orders fulfilled vs. stockouts (target: 99%)
- **Rider Utilization:** % of assigned orders actually picked up and delivered
- **On-time Delivery Rate:** % of orders delivered within promised time window

### 10.3 Financial Metrics

- **Daily Revenue:** Sum of all paid orders
- **Payment Success Rate:** % of attempted payments → completed (target: > 95%)
- **Chargeback Rate:** (target: < 0.5%)
- **Delivery Cost per Order:** ₦2,500 (fixed, adjust if needed)
- **Gross Margin:** Revenue - COGS - Delivery Cost

---

## 11. PRODUCT ROADMAP

### 11.1 Phase 1 (MVP – Month 1–2)

- Public homepage + product page
- Single-page checkout (guest only)
- Payment integration (Paystack + manual bank transfer)
- Admin dashboard (orders + inventory)
- WhatsApp waybill integration
- Email confirmations (SendGrid)
- Basic analytics (KPI dashboard)
- Mobile responsiveness

### 11.2 Phase 2 (Enhancements – Month 3–4)

- Order tracking page (public, no auth)
- SMS notifications (for non-email customers)
- Rider app (basic: accept/complete deliveries)
- Returns/refunds workflow
- Promotional codes (voucher system)
- Customer reviews/UGC section
- Advanced analytics (cohort analysis, CAC)

### 11.3 Phase 3 (Scale – Month 5+)

- Mobile app (iOS/Android)
- Subscription/loyalty program
- Multi-location support (expand beyond Lagos)
- Marketplace integration (Jumia, Amazon)
- Automated rider assignment (ML-based routing)
- Live delivery tracking (customer sees rider on map)
- Rider ratings system

---

## 12. ASSUMPTIONS & RISKS

### 12.1 Assumptions

- Customers have smartphone access (primary device for shopping)
- Stable internet connectivity (4G/WiFi) in Lagos
- Customers trust WhatsApp as primary communication channel
- Admin team available 9 AM–7 PM daily (single shift)
- Rider pool (3–5 active riders) sufficient for 10–20 orders/day
- Payment providers (Paystack/Flutterwave) have < 1% downtime
- Address autocomplete APIs available and reliable in Lagos

### 12.2 Key Risks & Mitigations

#### Risk: Payment Gateway Downtime

**Mitigation:** Integrate bank transfer as fallback; manual admin confirmation; retry logic

#### Risk: Rider No-Shows

**Mitigation:** WhatsApp confirmation workflow; backup rider pool; delivery deadline alerts

#### Risk: Inventory Stockouts

**Mitigation:** Real-time stock tracking; alert system; manual size blocking; pre-orders for popular items

#### Risk: Poor Address Data Quality

**Mitigation:** Address autocomplete validation; fallback manual entry; rider contact pre-delivery to confirm location

#### Risk: High Cart Abandonment

**Mitigation:** Optimize checkout speed; reduce form fields; clear pricing upfront; recovery email (Phase 2)

#### Risk: Courier/Rider Fraud

**Mitigation:** Photo proof of delivery; customer confirmation via WhatsApp; payment-on-delivery option (Phase 2)

---

## 13. APPENDIX

### 13.1 Glossary

- **Speed Run:** Guest-only, frictionless checkout flow with no account creation
- **The Hustle:** Admin alert section showing unpacked, paid orders waiting for courier assignment
- **Waybill:** Delivery instruction document with order and customer details, sent to rider via WhatsApp
- **Guest Order:** Order placed without account or login; only requires email + phone
- **Rider:** Courier/delivery agent responsible for last-mile delivery
- **Bento Grid:** 2x2 grid layout of product categories on homepage
- **Order Status:** Current state of order (pending, packed, shipped, delivered, cancelled)

### 13.2 Future Enhancements (Ideas for Post-Launch)

- Automatic rider assignment using geolocation + ML clustering
- Live delivery tracking (customer sees rider location on map in real-time)
- Rider ratings system (quality control & performance metrics)
- Subscription/VIP memberships (free shipping for repeat customers)
- Product recommendations (AI-based, "Customers also bought...")
- Pre-order system for upcoming styles
- Social commerce integration (TikTok Shop, Instagram Checkout)
- Augmented Reality (AR) try-on feature
- Seasonal campaigns and flash sales
- Customer feedback system (NPS, CSAT surveys)

### 13.3 Document Info

- **Product Owner:** [Name/Role]
- **Engineering Lead:** [Name/Role]
- **Design Lead:** [Name/Role]
- **Document Version:** 1.0
- **Date:** March 2026
- **Last Updated:** March 18, 2026

---

**END OF DOCUMENT**
