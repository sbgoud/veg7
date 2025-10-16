import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../services/auth/AuthContext';
import { supabase } from '../../services/api/supabase';
// import RazorpayCheckout from 'react-native-razorpay'; // Disabled for COD focus

type CheckoutScreenNavigationProp = StackNavigationProp<any, 'Checkout'>;

interface Props {
  navigation: CheckoutScreenNavigationProp;
}

interface Address {
  id: string;
  type: string;
  street_address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    name: string;
    price: number;
    weight: number;
    unit: string;
    image_url: string;
  };
}

const CheckoutScreen: React.FC<Props> = ({ navigation }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('cod');
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    } else {
      navigation.goBack();
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load addresses
      const { data: addressesData, error: addressesError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (addressesError) {
        console.error('Error loading addresses:', addressesError);
      } else {
        setAddresses(addressesData || []);
        // Select default address
        const defaultAddress = addressesData?.find(addr => addr.is_default);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        }
      }

      // Load cart items
      const { data: cartData, error: cartError } = await supabase
        .from('cart')
        .select(`
          *,
          products (
            name,
            price,
            weight,
            unit,
            image_url
          )
        `)
        .eq('user_id', user.id);

      if (cartError) {
        console.error('Error loading cart:', cartError);
      } else {
        setCartItems(cartData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load checkout data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.products.price * item.quantity);
    }, 0);
  };

  const calculateDeliveryFee = () => {
    // Simple delivery fee calculation
    const subtotal = calculateSubtotal();
    if (subtotal >= 500) return 0; // Free delivery above ₹500
    return 50; // ₹50 delivery fee
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDeliveryFee();
  };

  const handlePayment = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    try {
      setIsProcessing(true);

      // Create order in database first
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'placed',
          total_amount: calculateTotal(),
          delivery_fee: calculateDeliveryFee(),
          delivery_address_id: selectedAddress.id,
          payment_status: 'pending',
          payment_method: paymentMethod,
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        Alert.alert('Error', 'Failed to create order');
        return;
      }

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.products.price,
        total_price: item.products.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        Alert.alert('Error', 'Failed to create order items');
        return;
      }

      // Cash on Delivery - Focus on COD only
      // Update order status
      await supabase
        .from('orders')
        .update({
          payment_status: 'pending',
          status: 'confirmed',
        })
        .eq('id', orderData.id);

      // Clear cart
      await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);

      Alert.alert(
        'Order Placed Successfully! 🎉',
        `Your order has been confirmed!\n\nOrder ID: #${orderData.id.slice(-8)}\nAmount: ₹${calculateTotal().toFixed(2)}\nPayment: Cash on Delivery\n\nYou can track your order in the Orders section.`,
        [
          {
            text: 'View Orders',
            onPress: () => navigation.navigate('Orders'),
          },
        ]
      );
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment Failed', 'Payment could not be processed');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <TouchableOpacity
      style={[
        styles.addressItem,
        selectedAddress?.id === item.id && styles.selectedAddressItem,
      ]}
      onPress={() => setSelectedAddress(item)}
    >
      <View style={styles.addressHeader}>
        <Text style={styles.addressType}>{item.type.toUpperCase()}</Text>
        {item.is_default && (
          <Text style={styles.defaultBadge}>DEFAULT</Text>
        )}
      </View>
      <Text style={styles.addressText}>
        {item.street_address}
        {item.landmark && `, ${item.landmark}`}
      </Text>
      <Text style={styles.addressLocation}>
        {item.city}, {item.state} - {item.pincode}
      </Text>
    </TouchableOpacity>
  );

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemHeader}>
        <Text style={styles.cartItemName}>{item.products.name}</Text>
        <Text style={styles.cartItemPrice}>₹{(item.products.price * item.quantity).toFixed(2)}</Text>
      </View>
      <Text style={styles.cartItemDetails}>
        {item.quantity} x ₹{item.products.price} per {item.products.weight}{item.products.unit}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading checkout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please login to checkout</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('AuthModal')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Address Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          {addresses.length > 0 ? (
            <FlatList
              data={addresses}
              renderItem={renderAddressItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          ) : (
            <TouchableOpacity
              style={styles.addAddressButton}
              onPress={() => navigation.navigate('Address')}
            >
              <Text style={styles.addAddressText}>Add Delivery Address</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal ({cartItems.length} items):</Text>
            <Text style={styles.priceValue}>₹{calculateSubtotal().toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee:</Text>
            <Text style={[
              styles.priceValue,
              calculateDeliveryFee() === 0 && styles.freeDelivery
            ]}>
              {calculateDeliveryFee() === 0 ? 'FREE' : `₹${calculateDeliveryFee()}`}
            </Text>
          </View>
          {calculateDeliveryFee() > 0 && (
            <View style={styles.freeDeliveryNote}>
              <Text style={styles.freeDeliveryText}>
                💡 Add ₹{(500 - calculateSubtotal()).toFixed(2)} more for FREE delivery!
              </Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>₹{calculateTotal().toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Method - COD Only */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <View style={[styles.paymentMethodItem, styles.selectedPaymentMethod]}>
            <View style={styles.paymentMethodContent}>
              <Text style={styles.paymentMethodIcon}>💰</Text>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodName}>Cash on Delivery</Text>
                <Text style={styles.paymentMethodDesc}>Pay when your order arrives - No advance payment required</Text>
              </View>
              <View style={[styles.radioButton, styles.radioButtonSelected]}>
                <View style={styles.radioButtonInner} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Payment Button */}
      <View style={styles.paymentSection}>
        <TouchableOpacity
          style={[
            styles.paymentButton,
            (!selectedAddress || cartItems.length === 0 || isProcessing) && styles.paymentButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={!selectedAddress || cartItems.length === 0 || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.paymentButtonText}>
              Place Order - ₹{calculateTotal().toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  addressItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedAddressItem: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f8f0',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  defaultBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  addressLocation: {
    fontSize: 12,
    color: '#666',
  },
  addAddressButton: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  addAddressText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  cartItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  cartItemDetails: {
    fontSize: 12,
    color: '#666',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  freeDelivery: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  freeDeliveryNote: {
    backgroundColor: '#f0f8f0',
    padding: 8,
    borderRadius: 6,
    marginVertical: 8,
  },
  freeDeliveryText: {
    fontSize: 12,
    color: '#2e7d32',
    textAlign: 'center',
    fontWeight: '500',
  },
  paymentSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  paymentButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  paymentButtonDisabled: {
    backgroundColor: '#ccc',
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentMethodItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedPaymentMethod: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f8f0',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  paymentMethodDesc: {
    fontSize: 12,
    color: '#666',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#4CAF50',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
});

export default CheckoutScreen;