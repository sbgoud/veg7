-- Check current RLS policies and table structure
-- Run this in your Supabase SQL Editor

-- 1. Check if RLS is enabled on users table
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'users';

-- 2. Check existing RLS policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'users';

-- 3. Check current users in the table
SELECT id, email, full_name, role, is_active, created_at
FROM users;

-- 4. Check if user1@example.com exists in auth.users (you can't query this directly, but you can check)
-- Instead, let's check if we can insert a test record

-- 5. Test current permissions by trying to insert a test user profile
-- (This will show us exactly what's failing)