import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../services/auth/AuthContext';
import { supabase } from '../../services/api/supabase';

type OrderDetailScreenNavigationProp = StackNavigationProp<any, 'OrderDetail'>;

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products: {
    id: string;
    name: string;
    image_url: string;
    weight: number;
    unit: string;
  };
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_fee: number;
  tax_amount: number;
  order_date: string;
  delivery_date?: string;
  delivered_at?: string;
  payment_status: string;
  payment_method: string;
  special_instructions?: string;
  order_items: OrderItem[];
  delivery_address: {
    id: string;
    type: string;
    street_address: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };
  rider?: {
    id: string;
    vehicle_type: string;
    vehicle_number?: string;
    phone?: string;
    users: {
      full_name: string;
      phone: string;
    };
  };
}

interface Props {
  navigation: OrderDetailScreenNavigationProp;
  route: {
    params: {
      orderId: string;
    };
  };
}

const OrderDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { orderId } = route.params;

  useEffect(() => {
    if (isAuthenticated && user) {
      loadOrderDetails();
    }
  }, [isAuthenticated, user, orderId]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (
              id,
              name,
              image_url,
              weight,
              unit
            )
          ),
          delivery_address:addresses!delivery_address_id (
            id,
            type,
            street_address,
            landmark,
            city,
            state,
            pincode
          ),
          rider:riders (
            id,
            vehicle_type,
            vehicle_number,
            phone,
            users (
              full_name,
              phone
            )
          )
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading order details:', error);
        Alert.alert('Error', 'Failed to load order details');
        navigation.goBack();
      } else {
        setOrder(data);
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      Alert.alert('Error', 'An unexpected error occurred');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#4CAF50';
      case 'out_for_delivery': return '#2196F3';
      case 'preparing': return '#FF9800';
      case 'confirmed': return '#9C27B0';
      case 'placed': return '#607D8B';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'placed': return 'Order Placed';
      case 'confirmed': return 'Order Confirmed';
      case 'preparing': return 'Preparing Your Order';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'placed': return '📝';
      case 'confirmed': return '✅';
      case 'preparing': return '👨‍🍳';
      case 'out_for_delivery': return '🚚';
      case 'delivered': return '🎉';
      case 'cancelled': return '❌';
      default: return '📦';
    }
  };

  const getEstimatedDeliveryTime = (status: string, orderDate: string) => {
    const orderTime = new Date(orderDate);
    const now = new Date();
    
    switch (status) {
      case 'placed':
      case 'confirmed':
        return '30-45 minutes';
      case 'preparing':
        return '20-30 minutes';
      case 'out_for_delivery':
        return '10-20 minutes';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return '30-45 minutes';
    }
  };

  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.orderItem}>
      <Image source={{ uri: item.products.image_url }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.products.name}</Text>
        <Text style={styles.itemDetails}>
          {item.quantity} {item.products.unit} × ₹{item.unit_price}
        </Text>
        <Text style={styles.itemTotal}>₹{item.total_price.toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderTrackingStep = (step: string, isActive: boolean, isCompleted: boolean) => (
    <View style={styles.trackingStep}>
      <View style={[
        styles.trackingIcon,
        isCompleted && styles.trackingIconCompleted,
        isActive && styles.trackingIconActive
      ]}>
        <Text style={styles.trackingIconText}>
          {isCompleted ? '✓' : getStatusIcon(step)}
        </Text>
      </View>
      <View style={styles.trackingContent}>
        <Text style={[
          styles.trackingTitle,
          isActive && styles.trackingTitleActive,
          isCompleted && styles.trackingTitleCompleted
        ]}>
          {getStatusText(step)}
        </Text>
        <Text style={styles.trackingDescription}>
          {step === 'placed' && 'Your order has been received and is being processed'}
          {step === 'confirmed' && 'Your order has been confirmed and will be prepared soon'}
          {step === 'preparing' && 'Your order is being prepared with fresh ingredients'}
          {step === 'out_for_delivery' && 'Your order is on its way to you'}
          {step === 'delivered' && 'Your order has been delivered successfully'}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const trackingSteps = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
  const currentStepIndex = trackingSteps.indexOf(order.status);
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderTop}>
            <Text style={styles.orderNumber}>Order #{order.id.slice(-8)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
            </View>
          </View>
          <Text style={styles.orderDate}>
            Placed on {new Date(order.order_date).toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
          {!isDelivered && !isCancelled && (
            <Text style={styles.estimatedTime}>
              Estimated delivery: {getEstimatedDeliveryTime(order.status, order.order_date)}
            </Text>
          )}
        </View>

        {/* Order Tracking */}
        {!isCancelled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Tracking</Text>
            {trackingSteps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex || isDelivered;
              return (
                <View key={step}>
                  {renderTrackingStep(step, isActive, isCompleted)}
                  {index < trackingSteps.length - 1 && (
                    <View style={[
                      styles.trackingLine,
                      isCompleted && styles.trackingLineCompleted
                    ]} />
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Delivery Information */}
        {order.rider && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Information</Text>
            <View style={styles.deliveryInfo}>
              <View style={styles.deliveryPerson}>
                <Text style={styles.deliveryPersonIcon}>🚚</Text>
                <View style={styles.deliveryPersonInfo}>
                  <Text style={styles.deliveryPersonName}>
                    {order.rider.users.full_name}
                  </Text>
                  <Text style={styles.deliveryPersonVehicle}>
                    {order.rider.vehicle_type} • {order.rider.vehicle_number || 'N/A'}
                  </Text>
                  {order.rider.phone && (
                    <TouchableOpacity style={styles.callButton}>
                      <Text style={styles.callButtonText}>📞 Call Delivery Person</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items ({order.order_items.length})</Text>
          <FlatList
            data={order.order_items}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Text style={styles.addressType}>{order.delivery_address.type.toUpperCase()}</Text>
            </View>
            <Text style={styles.addressText}>
              {order.delivery_address.street_address}
              {order.delivery_address.landmark && `, ${order.delivery_address.landmark}`}
            </Text>
            <Text style={styles.addressLocation}>
              {order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pincode}
            </Text>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal:</Text>
              <Text style={styles.priceValue}>₹{(order.total_amount - order.delivery_fee).toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee:</Text>
              <Text style={[
                styles.priceValue,
                order.delivery_fee === 0 && styles.freeDelivery
              ]}>
                {order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee.toFixed(2)}`}
              </Text>
            </View>
            {order.tax_amount > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Tax:</Text>
                <Text style={styles.priceValue}>₹{order.tax_amount.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>₹{order.total_amount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.paymentInfo}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Method:</Text>
              <Text style={styles.paymentValue}>
                {order.payment_method === 'cod' ? '💰 Cash on Delivery' : '💳 Online Payment'}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Status:</Text>
              <Text style={[
                styles.paymentValue,
                order.payment_status === 'completed' ? styles.paymentCompleted : styles.paymentPending
              ]}>
                {order.payment_status === 'completed' ? '✅ Paid' : '⏳ Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* Special Instructions */}
        {order.special_instructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsText}>{order.special_instructions}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {order.status === 'delivered' && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>⭐ Rate Your Order</Text>
            </TouchableOpacity>
          )}
          {order.status === 'out_for_delivery' && order.rider && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>📞 Call Delivery Person</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButtonSecondary}>
            <Text style={styles.actionButtonSecondaryText}>🔄 Reorder Items</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  backButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  orderHeader: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
  },
  orderHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  estimatedTime: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
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
  trackingStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  trackingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackingIconActive: {
    backgroundColor: '#4CAF50',
  },
  trackingIconCompleted: {
    backgroundColor: '#4CAF50',
  },
  trackingIconText: {
    fontSize: 16,
    color: '#fff',
  },
  trackingContent: {
    flex: 1,
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 2,
  },
  trackingTitleActive: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  trackingTitleCompleted: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  trackingDescription: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
  },
  trackingLine: {
    width: 2,
    height: 20,
    backgroundColor: '#e0e0e0',
    marginLeft: 15,
    marginVertical: 4,
  },
  trackingLineCompleted: {
    backgroundColor: '#4CAF50',
  },
  deliveryInfo: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  deliveryPerson: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryPersonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  deliveryPersonInfo: {
    flex: 1,
  },
  deliveryPersonName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  deliveryPersonVehicle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  callButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  callButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  addressCard: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  addressHeader: {
    marginBottom: 8,
  },
  addressType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  addressLocation: {
    fontSize: 12,
    color: '#666',
  },
  priceBreakdown: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
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
  paymentInfo: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  paymentCompleted: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  paymentPending: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  instructionsCard: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  actionButtonSecondaryText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderDetailScreen;
