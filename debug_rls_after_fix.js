// Debug script to check what happens after RLS policy fix
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nssapwlyxczzywzkfwci.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zc2Fwd2x5eGN6enl3emtmd2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Nzg1OTYsImV4cCI6MjA3NDU1NDU5Nn0.wFy5Cccwy9L82S4ouYpZK223NjJMZvpnOXQsQovLFak';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugAfterFix() {
  console.log('🔍 Debugging after RLS policy fix...\n');

  try {
    // Test 1: Check current users in the table
    console.log('1️⃣ Checking current users in table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('❌ Error checking users:', usersError.message);
    } else {
      console.log(`✅ Found ${users?.length || 0} users in table`);
      if (users?.length > 0) {
        console.log('   Recent users:');
        users.slice(-3).forEach(user => {
          console.log(`   - ${user.email}: ${user.full_name} (${user.id})`);
        });
      }
    }

    // Test 2: Try a fresh signup
    console.log('\n2️⃣ Testing fresh signup...');
    const testEmail = `debug_test_${Date.now()}@gmail.com`;
    const testPassword = 'TestPass123!';

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Debug Test User',
          phone: '1234567890',
        }
      }
    });

    if (authError) {
      console.error('❌ Auth signup failed:', authError.message);
      return;
    }

    console.log('✅ Auth signup successful');
    console.log(`   User ID: ${authData.user?.id}`);

    // Test 3: Wait and check multiple times
    console.log('\n3️⃣ Checking profile creation over time...');

    for (let i = 1; i <= 5; i++) {
      console.log(`   Attempt ${i}/5...`);
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.log(`   ❌ Attempt ${i}: ${profileError.message}`);
      } else {
        console.log(`   ✅ Attempt ${i}: Profile found!`);
        console.log(`      Email: ${profile.email}`);
        console.log(`      Name: ${profile.full_name}`);
        break;
      }
    }

    // Test 4: Check if we can access the profile after signing in
    console.log('\n4️⃣ Testing profile access after sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);
    } else {
      console.log('✅ Sign in successful');

      const { data: profileAfterSignIn, error: profileAfterError } = await supabase
        .from('users')
        .select('*')
        .eq('id', signInData.user?.id)
        .single();

      if (profileAfterError) {
        console.error('❌ Profile access after sign in failed:', profileAfterError.message);
      } else {
        console.log('✅ Profile accessible after sign in');
        console.log(`   Name: ${profileAfterSignIn.full_name}`);
        console.log(`   Email: ${profileAfterSignIn.email}`);
      }
    }

    // Clean up
    await supabase.auth.signOut();

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugAfterFix().catch(console.error);
