-- Verify that the users table fix worked
-- Generated: 2025-10-02

-- 1. Check current schema
SELECT 'Schema verification - password_hash should be nullable:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'password_hash';

-- 2. Check RLS policies are working
SELECT 'RLS Policies verification:' as info;
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- 3. Check existing users
SELECT 'Existing users in table:' as info;
SELECT id, email, full_name, role, is_active, created_at
FROM users
ORDER BY created_at DESC;

-- 4. Test if we can create a new user profile (using a different email)
SELECT 'Testing user profile creation with new email:' as info;

-- Use a different email for testing (using a fixed test ID)
INSERT INTO users (id, email, full_name, phone, role, is_active)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'testuser_verify@example.com',
    'Test User Verify',
    '9876543210',
    'user',
    true
);

-- 5. Verify the test user was created
SELECT 'Test user verification:' as info;
SELECT id, email, full_name FROM users
WHERE email LIKE 'testuser%@example.com'
ORDER BY created_at DESC
LIMIT 1;

-- 6. Summary
SELECT '=== FIX VERIFICATION SUMMARY ===' as summary;
SELECT
    'Schema Fixed' as check,
    CASE WHEN is_nullable = 'YES'
         THEN '✅ PASS'
         ELSE '❌ FAIL'
    END as status
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'password_hash';

-- Count total users
SELECT 'Total Users' as check, COUNT(*) as count FROM users;