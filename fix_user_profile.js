// Fix user profile creation by using a direct approach
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nssapwlyxczzywzkfwci.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zc2Fwd2x5eGN6enl3emtmd2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Nzg1OTYsImV4cCI6MjA3NDU1NDU5Nn0.wFy5Cccwy9L82S4ouYpZK223NjJMZvpnOXQsQovLFak';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixUserProfile() {
  console.log('=== FIXING USER PROFILE CREATION ===\n');

  try {
    // First, sign in to get authenticated context
    console.log('1. Signing in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'user1@example.com',
      password: 'password123',
    });

    if (authError) {
      console.error('❌ Sign in failed:', authError.message);
      return;
    }

    console.log('✅ Sign in successful');
    console.log('Auth user ID:', authData.user.id);

    // The key insight: we need to use the auth user's actual ID
    const userId = authData.user.id;

    // Try creating the profile with the correct UUID format and authenticated context
    console.log('\n2. Creating user profile with authenticated context...');

    // First, let's check if the profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!checkError && existingProfile) {
      console.log('✅ Profile already exists:', existingProfile.full_name);
      return;
    }

    console.log('Profile doesn\'t exist, creating it...');

    // Create the profile with the exact format expected by RLS policies
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: userId, // This should match auth.uid()
        email: authData.user.email,
        full_name: authData.user.user_metadata?.full_name || 'Test User 1',
        phone: authData.user.user_metadata?.phone || '1234567890',
        role: 'user',
        is_active: true,
      })
      .select();

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message);
      console.error('Error code:', profileError.code);

      if (profileError.code === '42501') {
        console.log('RLS policy violation - trying alternative approach...');

        // Try using upsert instead of insert
        console.log('\n3. Trying upsert approach...');
        const { data: upsertData, error: upsertError } = await supabase
          .from('users')
          .upsert({
            id: userId,
            email: authData.user.email,
            full_name: authData.user.user_metadata?.full_name || 'Test User 1',
            phone: authData.user.user_metadata?.phone || '1234567890',
            role: 'user',
            is_active: true,
          })
          .select();

        if (upsertError) {
          console.error('❌ Upsert also failed:', upsertError.message);

          // Last resort: try to understand what the RLS policies actually allow
          console.log('\n4. Testing RLS policy requirements...');

          // Try with minimal data
          const { data: minimalData, error: minimalError } = await supabase
            .from('users')
            .insert({
              id: userId,
              email: authData.user.email,
              full_name: 'Test',
              role: 'user',
              is_active: true,
            })
            .select();

          if (minimalError) {
            console.error('❌ Minimal insert failed:', minimalError.message);
            console.log('This suggests the RLS policies are not working as expected');
          } else {
            console.log('✅ Minimal insert succeeded!');
          }

        } else {
          console.log('✅ Upsert succeeded!');
          console.log('Profile data:', upsertData);
        }
      }
    } else {
      console.log('✅ Profile created successfully!');
      console.log('Profile data:', profileData);
    }

    // Final verification
    console.log('\n5. Final verification...');
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('*');

    if (!finalError) {
      console.log(`Total users in table: ${finalUsers.length}`);
      finalUsers.forEach(user => {
        console.log(`  - ${user.email}: ${user.full_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixUserProfile();