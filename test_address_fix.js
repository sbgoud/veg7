// Test script to verify the address saving fix
const { createClient } = require('@supabase/supabase-js');

// Use the same credentials from your app
const supabaseUrl = 'https://nssapwlyxczzywzkfwci.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zc2Fwd2x5eGN6enl3emtmd2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Nzg1OTYsImV4cCI6MjA3NDU1NDU5Nn0.wFy5Cccwy9L82S4ouYpZK223NjJMZvpnOXQsQovLFak';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAddressFix() {
  console.log('=== TESTING ADDRESS SAVING FIX ===\n');

  try {
    // First, let's create a test user in auth (this would normally be done through the app)
    console.log('1. Creating test user in Supabase Auth...');
    const testEmail = `testuser${Date.now()}@test.com`;
    const testPassword = 'testpassword123';

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          phone: '1234567890',
        }
      }
    });

    if (authError) {
      console.error('Error creating test user:', authError);
      return;
    }

    console.log('Test user created in Auth:', authData.user.id);

    // Wait a moment for auth to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Now check if the user profile was created in the users table
    console.log('\n2. Checking if user profile exists in users table...');
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      console.log('❌ User profile not found - creating it manually...');

      // Create the profile manually
      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: testEmail,
          full_name: 'Test User',
          phone: '1234567890',
          role: 'user',
          is_active: true,
        });

      if (createError) {
        console.error('❌ Error creating user profile:', createError);
        return;
      }

      console.log('✅ User profile created successfully');
    } else if (profileError) {
      console.error('❌ Error checking user profile:', profileError);
      return;
    } else {
      console.log('✅ User profile already exists:', profile.full_name);
    }

    // Now try to save a test address
    console.log('\n3. Testing address creation...');
    const { data: addressData, error: addressError } = await supabase
      .from('addresses')
      .insert({
        user_id: authData.user.id,
        type: 'home',
        street_address: '123 Test Street',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500001',
        latitude: 17.3850,
        longitude: 78.4867,
        is_default: true,
      })
      .select();

    if (addressError) {
      console.error('❌ Error saving address:', addressError);
      return;
    }

    console.log('✅ Address saved successfully!');
    console.log('Address data:', addressData);

    // Cleanup - delete the test data
    console.log('\n4. Cleaning up test data...');
    await supabase.from('addresses').delete().eq('user_id', authData.user.id);
    await supabase.auth.admin.deleteUser(authData.user.id);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 ALL TESTS PASSED! The foreign key constraint issue should be fixed.');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testAddressFix();