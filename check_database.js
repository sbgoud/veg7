const { createClient } = require('@supabase/supabase-js');

// Use the same credentials from your app
const supabaseUrl = 'https://nssapwlyxczzywzkfwci.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zc2Fwd2x5eGN6enl3emtmd2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Nzg1OTYsImV4cCI6MjA3NDU1NDU5Nn0.wFy5Cccwy9L82S4ouYpZK223NjJMZvpnOXQsQovLFak';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log('=== CHECKING DATABASE STATE ===\n');

  try {
    // Check users table
    console.log('1. Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('Error checking users table:', usersError);
    } else {
      console.log(`Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, Email: ${user.email}, Name: ${user.full_name}`);
      });
    }

    console.log('\n2. Checking addresses table...');
    const { data: addresses, error: addressesError } = await supabase
      .from('addresses')
      .select('*');

    if (addressesError) {
      console.error('Error checking addresses table:', addressesError);
    } else {
      console.log(`Found ${addresses.length} addresses:`);
      addresses.forEach(address => {
        console.log(`  - ID: ${address.id}, User ID: ${address.user_id}, Type: ${address.type}`);
      });
    }

    console.log('\n3. Checking current auth user...');
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Error getting current user:', authError);
    } else if (currentUser) {
      console.log(`Current auth user: ${currentUser.id} (${currentUser.email})`);

      // Check if this user exists in users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error(`Profile not found for user ${currentUser.id}:`, profileError.message);
        console.log('This explains the foreign key error!');
      } else {
        console.log('User profile exists:', userProfile.full_name);
      }
    } else {
      console.log('No authenticated user found');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkDatabase();