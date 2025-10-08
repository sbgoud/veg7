// Test user creation with real UUID
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabaseUrl = 'https://nssapwlyxczzywzkfwci.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zc2Fwd2x5eGN6enl3emtmd2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Nzg1OTYsImV4cCI6MjA3NDU1NDU5Nn0.wFy5Cccwy9L82S4ouYpZK223NjJMZvpnOXQsQovLFak';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRealUserCreation() {
  console.log('=== TESTING REAL USER CREATION ===\n');

  try {
    // First, sign in as the existing user
    console.log('1. Signing in as user1@example.com...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'user1@example.com',
      password: 'password123',
    });

    if (signInError) {
      console.error('Sign in failed:', signInError.message);
      return;
    }

    console.log('✅ Sign in successful');
    console.log('User ID:', signInData.user.id);
    console.log('User Email:', signInData.user.email);

    // Now try to create the user profile using the real UUID
    console.log('\n2. Creating user profile...');

    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: signInData.user.id, // Use the real UUID from auth
        email: signInData.user.email,
        full_name: signInData.user.user_metadata?.full_name || 'Test User 1',
        phone: signInData.user.user_metadata?.phone || '1234567890',
        role: 'user',
        is_active: true,
      })
      .select();

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message);
      console.error('Error code:', profileError.code);
      console.error('Error details:', profileError.details);

      if (profileError.code === '42501') {
        console.log('This confirms RLS policy violation');

        // Try to understand what policies exist
        console.log('\n3. Checking RLS policies...');

        // Try a simple select to see current policies
        const { data: selectData, error: selectError } = await supabase
          .from('users')
          .select('*')
          .limit(1);

        if (selectError) {
          console.log('Select failed:', selectError.message);
        } else {
          console.log('Select succeeded');
        }

        // Try to see if we can insert with different parameters
        console.log('\n4. Testing different insert approach...');

        // Maybe the issue is with the authenticated context
        // Let's try without being authenticated
        await supabase.auth.signOut();

        const { data: unauthData, error: unauthError } = await supabase
          .from('users')
          .insert({
            id: signInData.user.id,
            email: 'user1@example.com',
            full_name: 'Test User 1',
            phone: '1234567890',
            role: 'user',
            is_active: true,
          });

        if (unauthError) {
          console.log('Unauthenticated insert also failed:', unauthError.message);
        } else {
          console.log('Unauthenticated insert succeeded!');
        }

      }
    } else {
      console.log('✅ Profile created successfully!');
      console.log('Profile data:', profileData);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testRealUserCreation();