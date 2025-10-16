const { createClient } = require('@supabase/supabase-js');

// Your Supabase configuration
const supabaseUrl = 'https://nssapwlyxczzywzkfwci.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zc2Fwd2x5eGN6enl3emtmd2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Nzg1OTYsImV4cCI6MjA3NDU1NDU5Nn0.wFy5Cccwy9L82S4ouYpZK223NjJMZvpnOXQsQovLFak';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addOrderNumberColumn() {
  try {
    console.log('🔧 Adding order_number column to orders table...');

    // Execute SQL to add the column
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(20);
        CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
      `
    });

    if (error) {
      console.error('Error adding column:', error);
      
      // Try alternative approach - create orders without order_number first
      console.log('🔄 Trying alternative approach...');
      
      // Create sample orders without order_number
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('No user found, signing in...');
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
        console.error('No user available');
        return;
      }

      // Get address
      const { data: addressData, error: addressError } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', currentUser.id)
        .single();

      if (addressError) {
        console.error('Error getting address:', addressError);
        return;
      }

      // Get products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id')
        .limit(2);

      if (productsError) {
        console.error('Error getting products:', productsError);
        return;
      }

      // Get riders
      const { data: ridersData, error: ridersError } = await supabase
        .from('riders')
        .select('id')
        .limit(2);

      if (ridersError) {
        console.error('Error getting riders:', ridersError);
        return;
      }

      // Create orders without order_number
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
          rider_id: ridersData[0]?.id
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
          rider_id: ridersData[1]?.id,
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
          .insert(orderItems);

        if (itemsError) {
          console.error('Error creating order items:', itemsError);
          continue;
        }

        createdOrders.push(order);
        console.log(`✅ Created order: ${order.id} (${orderData.status})`);
      }

      console.log('🎉 Orders created successfully without order_number column!');
      console.log(`📊 Created ${createdOrders.length} orders`);

    } else {
      console.log('✅ Successfully added order_number column');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the function
addOrderNumberColumn();
