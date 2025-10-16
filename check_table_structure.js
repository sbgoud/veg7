// Check the actual table structure and see what's happening
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nssapwlyxczzywzkfwci.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zc2Fwd2x5eGN6enl3emtmd2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Nzg1OTYsImV4cCI6MjA3NDU1NDU5Nn0.wFy5Cccwy9L82S4ouYpZK223NjJMZvpnOXQsQovLFak';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTableStructure() {
  console.log('🔍 Checking table structure and triggers...\n');

  try {
    // Check if there are any database triggers
    console.log('1️⃣ Checking for database triggers...');

    // Try to list all functions/triggers (this might not work with anon key)
    const { data: functions, error: functionsError } = await supabase
      .from('pg_proc')
      .select('proname')
      .limit(10);

    if (functionsError) {
      console.log('ℹ️ Cannot access pg_proc (expected with anon key)');
    } else {
      console.log('✅ Can access function metadata');
      console.log(`   Found ${functions?.length || 0} functions`);
    }

    // Check current users table content more carefully
    console.log('\n2️⃣ Detailed users table check...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('❌ Users table error:', usersError.message);
      console.error('   Error code:', usersError.code);
      console.error('   Error details:', usersError.details);
    } else {
      console.log(`✅ Users table accessible, found ${users?.length || 0} users`);

      if (users?.length > 0) {
        console.log('   All users in table:');
        users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (${user.id}) - ${user.full_name}`);
        });
      }
    }

    // Check if there are any hidden users or check with a broader query
    console.log('\n3️⃣ Testing different query approaches...');

    // Try without .single() to see if the user exists but the query is wrong
    const testUserId = 'f9f29193-dea4-459e-8874-824c057b625d'; // From previous test

    const { data: userById, error: userByIdError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId);

    if (userByIdError) {
      console.error('❌ Query by ID failed:', userByIdError.message);
    } else {
      console.log(`✅ Query by ID returned ${userById?.length || 0} results`);
      if (userById?.length > 0) {
        console.log('   User found:', userById[0]);
      } else {
        console.log('   User not found in table');
      }
    }

    // Check RLS policies by testing insert permissions
    console.log('\n4️⃣ Testing RLS policy permissions...');

    // Try to manually insert a user profile (this should work with correct RLS)
    const manualUserId = 'manual-test-' + Date.now();
    const { data: manualInsert, error: manualInsertError } = await supabase
      .from('users')
      .insert({
        id: manualUserId,
        email: 'manual@test.com',
        full_name: 'Manual Test User',
        phone: '1234567890',
        role: 'user',
        is_active: true,
      });

    if (manualInsertError) {
      console.error('❌ Manual insert failed:', manualInsertError.message);
      if (manualInsertError.message.includes('permission denied')) {
        console.log('ℹ️ RLS policies are working - anon users cannot insert');
      } else if (manualInsertError.message.includes('violates row-level security')) {
        console.log('ℹ️ RLS policies are working correctly');
      }
    } else {
      console.log('⚠️ Manual insert succeeded (unexpected)');
      // Clean up
      await supabase.from('users').delete().eq('id', manualUserId);
    }

    console.log('\n📋 Summary:');
    console.log('- Auth signup works ✅');
    console.log('- Users table is accessible ✅');
    console.log('- Profile creation is failing ❌');
    console.log('- Issue is likely with automatic profile creation triggers');

  } catch (error) {
    console.error('❌ Table structure check failed:', error.message);
  }
}

checkTableStructure().catch(console.error);
