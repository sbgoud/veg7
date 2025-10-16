const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://your-project.supabase.co'; // Replace with your actual URL
const supabaseKey = 'your-anon-key'; // Replace with your actual anon key

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDummyData() {
  try {
    console.log('🌱 Starting to seed dummy data...');

    // 1. Create dummy riders (users with rider role)
    console.log('👨‍💼 Creating dummy riders...');
    
    const riders = [
      {
        full_name: 'Rajesh Kumar',
        email: 'rajesh.rider@veg7.com',
        phone: '+91-9876543210',
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
        phone: '+91-9876543211',
        vehicle_type: 'Scooter',
        vehicle_number: 'TS09CD5678',
        license_number: 'DL987654321',
        current_latitude: 17.36500,
        current_longitude: 78.56000,
        is_available: true,
        is_online: true,
        rating: 4.6,
        total_deliveries: 89
      },
      {
        full_name: 'Amit Singh',
        email: 'amit.rider@veg7.com',
        phone: '+91-9876543212',
        vehicle_type: 'Bike',
        vehicle_number: 'TS09EF9012',
        license_number: 'DL456789123',
        current_latitude: 17.35000,
        current_longitude: 78.54000,
        is_available: false, // This rider is busy
        is_online: true,
        rating: 4.9,
        total_deliveries: 203
      }
    ];

    const createdRiders = [];
    
    for (const riderData of riders) {
      // Create user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: riderData.email,
        password: 'rider123456',
        email_confirm: true
      });

      if (authError) {
        console.error('Error creating rider user:', authError);
        continue;
      }

      // Create user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: riderData.email,
          password_hash: 'supabase-managed',
          full_name: riderData.full_name,
          phone: riderData.phone,
          role: 'rider',
          is_active: true
        })
        .select()
        .single();

      if (userError) {
        console.error('Error creating user profile:', userError);
        continue;
      }

      // Create rider profile
      const { data: riderProfile, error: riderError } = await supabase
        .from('riders')
        .insert({
          user_id: authData.user.id,
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
        users: userData
      });

      console.log(`✅ Created rider: ${riderData.full_name}`);
    }

    // 2. Create dummy orders with different statuses
    console.log('📦 Creating dummy orders...');

    // First, get a sample user (assuming you have users in your system)
    const { data: sampleUsers, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'user')
      .limit(1);

    if (usersError || !sampleUsers || sampleUsers.length === 0) {
      console.log('⚠️ No users found. Creating a sample user first...');
      
      // Create a sample user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'testuser@veg7.com',
        password: 'user123456',
        email_confirm: true
      });

      if (authError) {
        console.error('Error creating sample user:', authError);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: 'testuser@veg7.com',
          password_hash: 'supabase-managed',
          full_name: 'Test User',
          phone: '+91-9876543213',
          role: 'user',
          is_active: true
        })
        .select()
        .single();

      if (userError) {
        console.error('Error creating sample user profile:', userError);
        return;
      }

      sampleUsers = [userData];
    }

    const userId = sampleUsers[0].id;

    // Create sample addresses
    const { data: addressData, error: addressError } = await supabase
      .from('addresses')
      .insert({
        user_id: userId,
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
      return;
    }

    // Create sample products if they don't exist
    const { data: existingProducts, error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(2);

    let productIds = [];
    if (productsError || !existingProducts || existingProducts.length === 0) {
      console.log('⚠️ No products found. Creating sample products...');
      
      // Create sample categories first
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .insert({
          name: 'Vegetables',
          description: 'Fresh vegetables',
          is_active: true
        })
        .select()
        .single();

      if (categoryError) {
        console.error('Error creating category:', categoryError);
        return;
      }

      // Create sample products
      const { data: newProducts, error: newProductsError } = await supabase
        .from('products')
        .insert([
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

      if (newProductsError) {
        console.error('Error creating products:', newProductsError);
        return;
      }

      productIds = newProducts.map(p => p.id);
    } else {
      productIds = existingProducts.map(p => p.id);
    }

    // Create orders with different statuses
    const orders = [
      {
        user_id: userId,
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
        user_id: userId,
        status: 'confirmed',
        total_amount: 90.00,
        delivery_fee: 0.00,
        tax_amount: 0.00,
        delivery_address_id: addressData.id,
        payment_status: 'pending',
        payment_method: 'cod',
        order_number: '12345679'
      },
      {
        user_id: userId,
        status: 'preparing',
        total_amount: 75.00,
        delivery_fee: 50.00,
        tax_amount: 0.00,
        delivery_address_id: addressData.id,
        payment_status: 'pending',
        payment_method: 'cod',
        order_number: '12345680'
      },
      {
        user_id: userId,
        status: 'out_for_delivery',
        total_amount: 120.00,
        delivery_fee: 0.00,
        tax_amount: 0.00,
        delivery_address_id: addressData.id,
        payment_status: 'pending',
        payment_method: 'cod',
        order_number: '12345681',
        rider_id: createdRiders[0].id // Assign first available rider
      },
      {
        user_id: userId,
        status: 'delivered',
        total_amount: 85.00,
        delivery_fee: 50.00,
        tax_amount: 0.00,
        delivery_address_id: addressData.id,
        payment_status: 'completed',
        payment_method: 'cod',
        order_number: '12345682',
        rider_id: createdRiders[1].id, // Assign second rider
        delivered_at: new Date().toISOString()
      }
    ];

    const createdOrders = [];

    for (const orderData of orders) {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
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
          product_id: productIds[0],
          quantity: 1,
          unit_price: 40.00,
          total_price: 40.00
        },
        {
          order_id: order.id,
          product_id: productIds[1],
          quantity: 1,
          unit_price: 25.00,
          total_price: 25.00
        }
      ];

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        continue;
      }

      createdOrders.push(order);
      console.log(`✅ Created order: #${orderData.order_number} (${orderData.status})`);
    }

    // 3. Update rider availability based on assignments
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

    console.log('🎉 Dummy data seeding completed successfully!');
    console.log(`📊 Created:`);
    console.log(`   - ${createdRiders.length} riders`);
    console.log(`   - ${createdOrders.length} orders`);
    console.log(`   - Multiple order items`);
    console.log(`   - Sample addresses and products`);

  } catch (error) {
    console.error('❌ Error seeding dummy data:', error);
  }
}

// Run the seeding function
seedDummyData();
