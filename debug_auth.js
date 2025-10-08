// Comprehensive authentication debugging script
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nssapwlyxczzywzkfwci.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zc2Fwd2x5eGN6enl3emtmd2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Nzg1OTYsImV4cCI6MjA3NDU1NDU5Nn0.wFy5Cccwy9L82S4ouYpZK223NjJMZvpnOXQsQovLFak';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugAuth() {
  console.log('=== COMPREHENSIVE AUTH DEBUGGING ===\n');

  try {
    // Check existing users in the custom users table
    console.log('1. Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('Error checking users table:', usersError);
    } else {
      console.log(`Found ${users.length} users in custom users table:`);
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, Email: ${user.email}, Name: ${user.full_name}`);
      });
    }

    // Check if user1@example.com exists in auth
    console.log('\n2. Checking if user1@example.com exists in Supabase Auth...');
    try {
      const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();

      if (authUsersError) {
        console.log('Cannot check auth users (admin only):', authUsersError.message);
      } else {
        const user1Exists = authUsers.users.some(user => user.email === 'user1@example.com');
        console.log(`user1@example.com exists in auth: ${user1Exists}`);
      }
    } catch (error) {
      console.log('Auth admin check failed:', error.message);
    }

    // Try to sign in as user1@example.com
    console.log('\n3. Attempting to sign in as user1@example.com...');
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'user1@example.com',
        password: 'password123',
      });

      if (signInError) {
        console.log('Sign in failed:', signInError.message);

        // Try to create the user if it doesn't exist
        if (signInError.message.includes('Invalid login credentials')) {
          console.log('User doesn\'t exist, trying to create it...');

          const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: 'user1@example.com',
            password: 'password123',
            options: {
              data: {
                full_name: 'Test User 1',
                phone: '1234567890',
              }
            }
          });

          if (signupError) {
            console.error('Signup failed:', signupError.message);
          } else {
            console.log('User created successfully');
          }
        }
      } else {
        console.log('Sign in successful for user1@example.com');
        console.log('User ID:', signInData.user.id);

        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', signInData.user.id)
          .single();

        if (profileError) {
          console.log('Profile not found, creating it...');

          const { error: createError } = await supabase
            .from('users')
            .insert({
              id: signInData.user.id,
              email: 'user1@example.com',
              full_name: 'Test User 1',
              phone: '1234567890',
              role: 'user',
              is_active: true,
            });

          if (createError) {
            console.error('Error creating profile:', createError);
          } else {
            console.log('Profile created successfully');
          }
        } else {
          console.log('Profile exists:', profile.full_name);
        }
      }
    } catch (error) {
      console.error('Error during auth operations:', error);
    }

    // Final check of users table
    console.log('\n4. Final check of users table...');
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('*');

    if (!finalError) {
      console.log(`Final count: ${finalUsers.length} users`);
      finalUsers.forEach(user => {
        console.log(`  - ${user.email}: ${user.full_name}`);
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

debugAuth();