const { createClient } = require('@supabase/supabase-js');

// Your Supabase configuration
const supabaseUrl = 'https://nssapwlyxczzywzkfwci.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zc2Fwd2x5eGN6enl3emtmd2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Nzg1OTYsImV4cCI6MjA3NDU1NDU5Nn0.wFy5Cccwy9L82S4ouYpZK223NjJMZvpnOXQsQovLFak';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedSimpleData() {
  try {
    console.log('🌱 Starting to seed simple dummy data...');

    // 1. Create a test user first
    console.log('👤 Creating test user...');
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'testuser@veg7.com',
      password: 'testuser123',
    });

    if (authError) {
      console.log('User might already exist:', authError.message);
    }

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('No user found, creating one...');
      // Try to sign in with existing user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'testuser@veg7.com',
        password: 'testuser123',
      });
      
      if (signInError) {
        console.error('Error signing in:', signInError);
        return;
      }
    }

    const currentUser = user || (await supabase.auth.getUser()).data.user;
    
    if (!currentUser) {
      console.error('No user available for seeding');
      return;
    }

    // Create user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .upsert({
        id: currentUser.id,
        email: currentUser.email,
        password_hash: 'supabase-managed',
        full_name: 'Test User',
        phone: '+91-9876543210',
        role: 'user',
        is_active: true
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating user profile:', profileError);
    } else {
      console.log('✅ User profile created/updated');
    }

    // 2. Create sample address
    console.log('🏠 Creating sample address...');
    
    const { data: addressData, error: addressError } = await supabase
      .from('addresses')
      .upsert({
        user_id: currentUser.id,
        type: 'home',
        street_address: '123 Main Street, Near City Mall',
        landmark: 'Opposite Metro Station',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500001',
        latitude: 17.36500,
        longitude: 78.56000,
        is_default: true
      })
      .select()
      .single();

    if (addressError) {
      console.error('Error creating address:', addressError);
    } else {
      console.log('✅ Address created/updated');
    }

    // 3. Create sample products
    console.log('🥬 Creating sample products...');
    
    // First create a category
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .upsert({
        name: 'Vegetables',
        description: 'Fresh vegetables',
        is_active: true
      })
      .select()
      .single();

    if (categoryError) {
      console.error('Error creating category:', categoryError);
    } else {
      console.log('✅ Category created/updated');
    }

    // Create products
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .upsert([
        {
          name: 'Fresh Tomatoes',
          description: 'Fresh red tomatoes',
          price: 40.00,
          weight: 1,
          unit: 'kg',
          image_url: 'https://images.unsplash.com/photo-1546470427-5c1b0b0b0b0b?w=400',
          category_id: categoryData.id,
          stock_quantity: 100,
          is_active: true
        },
        {
          name: 'Green Onions',
          description: 'Fresh green onions',
          price: 25.00,
          weight: 1,
          unit: 'kg',
          image_url: 'https://images.unsplash.com/photo-1546470427-5c1b0b0b0b0c?w=400',
          category_id: categoryData.id,
          stock_quantity: 50,
          is_active: true
        }
      ])
      .select();

    if (productsError) {
      console.error('Error creating products:', productsError);
    } else {
      console.log('✅ Products created/updated');
    }

    // 4. Create sample riders
    console.log('🚚 Creating sample riders...');
    
    const riders = [
      {
        full_name: 'Rajesh Kumar',
        email: 'rajesh.rider@veg7.com',
        phone: '+91-9876543211',
        vehicle_type: 'Bike',
        vehicle_number: 'TS09AB1234',
        license_number: 'DL123456789',
        current_latitude: 17.35878,
        current_longitude: 78.5534077,
        is_available: true,
        is_online: true,
        rating: 4.8,
        total_deliveries: 156
      },
      {
        full_name: 'Suresh Patel',
        email: 'suresh.rider@veg7.com',
        phone: '+91-9876543212',
        vehicle_type: 'Scooter',
        vehicle_number: 'TS09CD5678',
        license_number: 'DL987654321',
        current_latitude: 17.36500,
        current_longitude: 78.56000,
        is_available: true,
        is_online: true,
        rating: 4.6,
        total_deliveries: 89
      }
    ];

    const createdRiders = [];

    for (const riderData of riders) {
      // Create rider user profile
      const { data: riderUser, error: riderUserError } = await supabase
        .from('users')
        .upsert({
          email: riderData.email,
          password_hash: 'supabase-managed',
          full_name: riderData.full_name,
          phone: riderData.phone,
          role: 'rider',
          is_active: true
        })
        .select()
        .single();

      if (riderUserError) {
        console.error('Error creating rider user:', riderUserError);
        continue;
      }

      // Create rider profile
      const { data: riderProfile, error: riderError } = await supabase
        .from('riders')
        .upsert({
          user_id: riderUser.id,
          vehicle_type: riderData.vehicle_type,
          vehicle_number: riderData.vehicle_number,
          license_number: riderData.license_number,
          current_latitude: riderData.current_latitude,
          current_longitude: riderData.current_longitude,
          is_available: riderData.is_available,
          is_online: riderData.is_online,
          rating: riderData.rating,
          total_deliveries: riderData.total_deliveries
        })
        .select()
        .single();

      if (riderError) {
        console.error('Error creating rider profile:', riderError);
        continue;
      }

      createdRiders.push({
        ...riderProfile,
        users: riderUser
      });

      console.log(`✅ Created rider: ${riderData.full_name}`);
    }

    // 5. Create sample orders
    console.log('📦 Creating sample orders...');
    
    const orders = [
      {
        user_id: currentUser.id,
        status: 'placed',
        total_amount: 65.00,
        delivery_fee: 50.00,
        tax_amount: 0.00,
        delivery_address_id: addressData.id,
        payment_status: 'pending',
        payment_method: 'cod',
        order_number: '12345678',
        special_instructions: 'Please deliver after 6 PM'
      },
      {
        user_id: currentUser.id,
        status: 'out_for_delivery',
        total_amount: 120.00,
        delivery_fee: 0.00,
        tax_amount: 0.00,
        delivery_address_id: addressData.id,
        payment_status: 'pending',
        payment_method: 'cod',
        order_number: '12345679',
        rider_id: createdRiders[0]?.id
      },
      {
        user_id: currentUser.id,
        status: 'delivered',
        total_amount: 85.00,
        delivery_fee: 50.00,
        tax_amount: 0.00,
        delivery_address_id: addressData.id,
        payment_status: 'completed',
        payment_method: 'cod',
        order_number: '12345680',
        rider_id: createdRiders[1]?.id,
        delivered_at: new Date().toISOString()
      }
    ];

    const createdOrders = [];

    for (const orderData of orders) {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .upsert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        continue;
      }

      // Create order items
      const orderItems = [
        {
          order_id: order.id,
          product_id: productsData[0].id,
          quantity: 1,
          unit_price: 40.00,
          total_price: 40.00
        },
        {
          order_id: order.id,
          product_id: productsData[1].id,
          quantity: 1,
          unit_price: 25.00,
          total_price: 25.00
        }
      ];

      const { error: itemsError } = await supabase
        .from('order_items')
        .upsert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        continue;
      }

      createdOrders.push(order);
      console.log(`✅ Created order: #${orderData.order_number} (${orderData.status})`);
    }

    // 6. Update rider availability for assigned orders
    console.log('🔄 Updating rider availability...');
    
    for (const order of createdOrders) {
      if (order.rider_id) {
        const { error: updateError } = await supabase
          .from('riders')
          .update({ is_available: false })
          .eq('id', order.rider_id);

        if (updateError) {
          console.error('Error updating rider availability:', updateError);
        } else {
          console.log(`✅ Marked rider as busy for order #${order.order_number}`);
        }
      }
    }

    console.log('🎉 Simple dummy data seeding completed successfully!');
    console.log(`📊 Created:`);
    console.log(`   - 1 test user`);
    console.log(`   - 1 sample address`);
    console.log(`   - 1 category`);
    console.log(`   - 2 products`);
    console.log(`   - ${createdRiders.length} riders`);
    console.log(`   - ${createdOrders.length} orders`);
    console.log(`   - Multiple order items`);

    console.log('\n🔑 Test User Credentials:');
    console.log('   Email: testuser@veg7.com');
    console.log('   Password: testuser123');

  } catch (error) {
    console.error('❌ Error seeding dummy data:', error);
  }
}

// Run the seeding function
seedSimpleData();
