// Test script to verify signup functionality works end-to-end
// This simulates what happens when a user clicks the signup button

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nssapwlyxczzywzkfwci.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zc2Fwd2x5eGN6enl3emtmd2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Nzg1OTYsImV4cCI6MjA3NDU1NDU5Nn0.wFy5Cccwy9L82S4ouYpZK223NjJMZvpnOXQsQovLFak';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignupFlow() {
  console.log('🧪 Testing complete signup flow...\n');

  // Generate a unique test email to avoid conflicts (using Gmail format)
  const timestamp = Date.now();
  const testEmail = `testuser${timestamp}@gmail.com`;
  const testPassword = 'TestPass123!';
  const testName = 'Test User';
  const testPhone = '1234567890';

  console.log(`📧 Test credentials: ${testEmail}`);

  try {
    // Step 1: Test Supabase Auth signup
    console.log('1️⃣ Testing Supabase Auth signup...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testName,
          phone: testPhone,
        }
      }
    });

    if (authError) {
      console.error('❌ Auth signup failed:', authError.message);
      return false;
    }

    console.log('✅ Auth signup successful');
    console.log(`   User ID: ${authData.user?.id}`);

    // Step 2: Wait a moment for auth to process
    console.log('⏳ Waiting for auth processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Check if user profile was created in custom users table
    console.log('2️⃣ Checking user profile creation...');
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user?.id)
      .single();

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message);

      // Try to check if it was a permission issue
      if (profileError.message.includes('permission denied')) {
        console.log('ℹ️  This might be an RLS policy issue');
      }

      return false;
    }

    console.log('✅ User profile created successfully');
    console.log(`   Name: ${profile.full_name}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   Phone: ${profile.phone}`);
    console.log(`   Role: ${profile.role}`);

    // Step 4: Test sign in to verify everything works
    console.log('3️⃣ Testing sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);
      return false;
    }

    console.log('✅ Sign in successful');

    // Step 5: Verify we can access user profile after sign in
    console.log('4️⃣ Verifying profile access after sign in...');
    const { data: profileAfterSignIn, error: profileAfterError } = await supabase
      .from('users')
      .select('*')
      .eq('id', signInData.user?.id)
      .single();

    if (profileAfterError) {
      console.error('❌ Profile access after sign in failed:', profileAfterError.message);
      return false;
    }

    console.log('✅ Profile access verified');

    // Step 6: Clean up - sign out
    console.log('🧹 Cleaning up...');
    await supabase.auth.signOut();
    console.log('✅ Cleanup completed');

    return true;

  } catch (error) {
    console.error('❌ Signup flow test failed:', error.message);
    return false;
  }
}

async function main() {
  const success = await testSignupFlow();

  if (success) {
    console.log('\n🎉 SIGNUP FUNCTIONALITY IS WORKING PERFECTLY!');
    console.log('✅ Your React Native app signup button should work correctly now.');
  } else {
    console.log('\n❌ Signup functionality still has issues.');
    console.log('🔧 Please check the database schema and RLS policies.');
  }
}

main().catch(console.error);
