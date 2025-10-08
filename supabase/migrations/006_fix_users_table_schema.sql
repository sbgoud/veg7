-- Fix users table schema to make password_hash nullable
-- Since we're using Supabase Auth, we don't need password_hash in our custom users table

-- 1. Check current schema
SELECT 'Current users table schema:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 2. Make password_hash nullable since we use Supabase Auth
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 3. Update the existing user profile creation to work without password_hash
-- First, drop the old policies that aren't working
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;

-- 4. Create working RLS policies
SELECT 'Creating new RLS policies:' as info;

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
CREATE POLICY "users_insert_auth" ON users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. Create test user profile (without password_hash)
SELECT 'Creating test user profile:' as info;

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

-- 6. Verify the fix worked
SELECT 'Verification - Users table:' as info;
SELECT id, email, full_name, role, is_active FROM users WHERE email = 'user1@example.com';

SELECT 'Total users:' as info, COUNT(*) as count FROM users;

-- 7. Show updated schema
SELECT 'Updated schema verification:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'password_hash';