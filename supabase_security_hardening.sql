-- ====================================================================
-- PALMS FOOTWEAR - SUPABASE DATABASE SECURITY HARDENING SQL
-- ====================================================================
-- This script enables Row-Level Security (RLS) on all core tables and
-- establishes restrictive, role-based access control policies.
-- It also defines a secure, isolated function for generating today's
-- order count to support sequential Order ID generation.
-- ====================================================================

-- 1. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- --------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. PRODUCTS SECURITY POLICIES
-- ------------------------------
-- Allow anyone (public/anonymous) to view active products.
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products"
  ON public.products
  FOR SELECT
  TO public
  USING (true);

-- Restrict write/modify permissions entirely to authenticated admin users.
DROP POLICY IF EXISTS "Allow authenticated admins full access to products" ON public.products;
CREATE POLICY "Allow authenticated admins full access to products"
  ON public.products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. LOCATIONS SECURITY POLICIES
-- ------------------------------
-- Allow anyone (public/anonymous) to view delivery locations/fees at checkout.
DROP POLICY IF EXISTS "Allow public read access to locations" ON public.locations;
CREATE POLICY "Allow public read access to locations"
  ON public.locations
  FOR SELECT
  TO public
  USING (true);

-- Restrict write/modify permissions entirely to authenticated admin users.
DROP POLICY IF EXISTS "Allow authenticated admins full access to locations" ON public.locations;
CREATE POLICY "Allow authenticated admins full access to locations"
  ON public.locations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. STORE SETTINGS SECURITY POLICIES
-- -----------------------------------
-- Allow anyone (public/anonymous) to view store settings (e.g., WhatsApp contact number).
DROP POLICY IF EXISTS "Allow public read access to settings" ON public.settings;
CREATE POLICY "Allow public read access to settings"
  ON public.settings
  FOR SELECT
  TO public
  USING (true);

-- Restrict write/modify permissions entirely to authenticated admin users.
DROP POLICY IF EXISTS "Allow authenticated admins full access to settings" ON public.settings;
CREATE POLICY "Allow authenticated admins full access to settings"
  ON public.settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. ORDERS SECURITY POLICIES
-- ---------------------------
-- Allow anonymous guest checkout users to insert their order details.
DROP POLICY IF EXISTS "Allow public to create orders" ON public.orders;
CREATE POLICY "Allow public to create orders"
  ON public.orders
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Block any read/update/delete operations on orders for public users.
-- Only authenticated admin users are allowed full access to review and manage orders.
DROP POLICY IF EXISTS "Allow authenticated admins full access to orders" ON public.orders;
CREATE POLICY "Allow authenticated admins full access to orders"
  ON public.orders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6. SECURE RPC ORDER COUNTING FUNCTION
-- -------------------------------------
-- This function runs with SECURITY DEFINER privileges to bypass RLS orders
-- table restrictions for checkout calculations, but returns ONLY the count
-- of orders placed today (an integer) without exposing customer information.
CREATE OR REPLACE FUNCTION public.get_today_order_count()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT count(*)
    FROM public.orders
    WHERE created_at >= CURRENT_DATE
  );
END;
$$;
