-- FIX RLS POLICIES FOR USERS TABLE
-- Run this in your Supabase SQL Editor to fix the authentication issues

-- 1. First, disable RLS on users table (since it's causing issues)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON addresses;

-- 3. Create proper RLS policies for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "users_insert_own" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Allow authenticated users to insert (for signup)
CREATE POLICY "users_insert_authenticated" ON users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Create proper RLS policies for addresses table
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own addresses
CREATE POLICY "addresses_select_own" ON addresses
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own addresses
CREATE POLICY "addresses_insert_own" ON addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own addresses
CREATE POLICY "addresses_update_own" ON addresses
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own addresses
CREATE POLICY "addresses_delete_own" ON addresses
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Create proper RLS policies for other tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_crud_own" ON orders
    FOR ALL USING (auth.uid() = user_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_view_own" ON order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
    );

ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cart_crud_own" ON cart
    FOR ALL USING (auth.uid() = user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_crud_own" ON notifications
    FOR ALL USING (auth.uid() = user_id);

-- 6. Enable public read access for reference tables
CREATE POLICY "categories_public_read" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "products_public_read" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "stores_public_read" ON stores
    FOR SELECT USING (is_active = true);

-- 7. Create test user profile for existing auth user
-- Replace '545270da-cc02-47a6-8ec8-c45ae3749f51' with the actual user ID from your debug output
INSERT INTO users (id, email, full_name, phone, role, is_active)
VALUES (
    '545270da-cc02-47a6-8ec8-c45ae3749f51',
    'user1@example.com',
    'Test User 1',
    '1234567890',
    'user',
    true
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    updated_at = NOW();

-- 8. Verify the fix worked
SELECT 'Users table' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Addresses table' as table_name, COUNT(*) as count FROM addresses
UNION ALL
SELECT 'Orders table' as table_name, COUNT(*) as count FROM orders;