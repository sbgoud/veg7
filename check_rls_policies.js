// Check current RLS policies and permissions
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nssapwlyxczzywzkfwci.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zc2Fwd2x5eGN6enl3emtmd2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Nzg1OTYsImV4cCI6MjA3NDU1NDU5Nn0.wFy5Cccwy9L82S4ouYpZK223NjJMZvpnOXQsQovLFak';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRLSPolicies() {
  console.log('=== CHECKING RLS POLICIES ===\n');

  try {
    // Try to understand what RLS policies exist
    console.log('1. Testing direct insert to users table...');

    const { data, error } = await supabase
      .from('users')
      .insert({
        id: 'test-user-id-123',
        email: 'test@example.com',
        full_name: 'Test User',
        phone: '1234567890',
        role: 'user',
        is_active: true,
      });

    if (error) {
      console.log('Insert failed with error:', error.message);
      console.log('Error code:', error.code);
      console.log('Error details:', error.details);

      if (error.code === '42501') {
        console.log('This is an RLS policy violation');
      }
    } else {
      console.log('Insert succeeded (unexpected!)');
      console.log('Data:', data);
    }

    // Check if we can read from users table
    console.log('\n2. Testing read access to users table...');
    const { data: readData, error: readError } = await supabase
      .from('users')
      .select('*');

    if (readError) {
      console.log('Read failed:', readError.message);
    } else {
      console.log(`Read succeeded. Found ${readData.length} users`);
    }

    // Check what's in the users table currently
    console.log('\n3. Current users in table:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (!usersError) {
      console.log(`Total users: ${users.length}`);
      users.forEach(user => {
        console.log(`  - ${user.email}: ${user.full_name} (${user.id})`);
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkRLSPolicies();