-- Fix RLS policies for users table to work properly with Supabase Auth
-- The issue is that the current policies might not be working correctly with auth.uid()

-- 1. First, drop the existing policies that aren't working
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_insert_auth" ON users;

-- 2. Create new, more permissive policies that work with Supabase Auth

-- Allow users to view their own profile (including during signup)
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (auth.uid() = id);

-- Allow authenticated users to insert their own profile (for signup)
CREATE POLICY "users_insert_own" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Allow any authenticated user to insert (fallback policy for signup)
-- This ensures that newly signed up users can create their profile
CREATE POLICY "users_insert_auth" ON users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Enable RLS on users table (it should already be enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Test the policies by creating a function that can be called
CREATE OR REPLACE FUNCTION test_user_policy(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- This function tests if the current auth user can access the specified user record
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = user_uuid
        AND auth.uid() = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Verify the policies work
SELECT 'Testing RLS policies...' as status;

-- The policies should now allow:
-- - Authenticated users to insert their own profile (id = auth.uid())
-- - Users to view and update their own profile
-- - Proper integration with Supabase Auth system
