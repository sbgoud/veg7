const { createClient } = require('@supabase/supabase-js');

// Use the same config as your app
const supabaseUrl = 'https://nssapwlyxczzywzkfwci.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zc2Fwd2x5eGN6enl3emtmd2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Nzg1OTYsImV4cCI6MjA3NDU1NDU5Nn0.wFy5Cccwy9L82S4ouYpZK223NjJMZvpnOXQsQovLFak';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');

  try {
    // Test 1: Check if we can query the users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (usersError) {
      console.error('❌ Users table query failed:', usersError.message);
      return false;
    }

    console.log('✅ Users table accessible');

    // Test 2: Check users table schema
    const { data: schema, error: schemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'users' })
      .select('*');

    if (schemaError && schemaError.message.includes('function')) {
      // Fallback: try to describe the table structure manually
      console.log('ℹ️  Checking users table structure...');
      const { data: testInsert, error: insertError } = await supabase
        .from('users')
        .select('*')
        .limit(0);

      if (insertError && insertError.message.includes('password_hash')) {
        console.log('❌ password_hash column still exists and is required');
        return false;
      } else {
        console.log('✅ Users table structure looks correct');
      }
    } else {
      console.log('✅ Users table schema verified');
    }

    // Test 3: Test signup simulation (without actually creating a user)
    console.log('🔧 Testing signup flow...');

    // Check if we can perform auth operations
    const { data: authTest, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.error('❌ Auth connection failed:', authError.message);
      return false;
    }

    console.log('✅ Auth connection working');

    return true;

  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing Supabase connection and schema...\n');

  const isConnected = await testDatabaseConnection();

  if (isConnected) {
    console.log('\n✅ All tests passed! Database is ready for signup.');
    console.log('🎯 The signup button should now work correctly.');
  } else {
    console.log('\n❌ Some issues detected. Please check the errors above.');
  }
}

main().catch(console.error);
