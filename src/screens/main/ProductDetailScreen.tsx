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
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useAuth } from '../../services/auth/AuthContext';
import { CartService } from '../../services/api/cartService';
import { supabase } from '../../services/api/supabase';
import { RootStackParamList } from '../../navigation/AppNavigator';

type ProductDetailScreenNavigationProp = StackNavigationProp<any, 'ProductDetail'>;
type ProductDetailScreenRouteProp = RouteProp<any, 'ProductDetail'>;

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  weight: number;
  unit: string;
  image_url: string;
  category_id: string;
  stock_quantity: number;
  is_organic: boolean;
  is_seasonal: boolean;
  categories?: {
    name: string;
  };
}

interface Props {
  navigation: ProductDetailScreenNavigationProp;
  route: ProductDetailScreenRouteProp;
}

const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { user, isAuthenticated } = useAuth();


  useEffect(() => {
    loadProduct();
  }, [route.params.productId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('id', route.params.productId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error loading product:', error);
        Alert.alert('Error', 'Failed to load product details');
      } else {
        setProduct(data);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async () => {
    if (!isAuthenticated || !user || !product) {
      Alert.alert('Login Required', 'Please login to add items to cart', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    try {
      setIsAddingToCart(true);

      // Simple cart insertion
      const { error } = await supabase
        .from('cart')
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity: quantity,
        });

      if (error) {
        console.error('Error adding to cart:', error);
        Alert.alert('Error', 'Failed to add to cart');
        return;
      }

      Alert.alert('Success', `${product.name} added to cart!`, [
        { text: 'Continue Shopping', style: 'default' },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
      ]);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading product details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <Image source={{ uri: product.image_url }} style={styles.productImage} />

        {/* Product Info */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.badges}>
              {product.is_organic && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Organic</Text>
                </View>
              )}
              {product.is_seasonal && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Seasonal</Text>
                </View>
              )}
            </View>
          </View>

          {/* Category */}
          <Text style={styles.category}>
            Category: {product.categories?.name || 'Uncategorized'}
          </Text>

          {/* Description */}
          <Text style={styles.description}>{product.description}</Text>

          {/* Price and Weight */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{product.price}</Text>
            <Text style={styles.weight}>per {product.weight}{product.unit}</Text>
          </View>

          {/* Stock Info */}
          <View style={styles.stockContainer}>
            <Text style={[
              styles.stockText,
              product.stock_quantity > 10 ? styles.inStock : styles.lowStock
            ]}>
              {product.stock_quantity > 0
                ? `In Stock (${product.stock_quantity} available)`
                : 'Out of Stock'
              }
            </Text>
          </View>

          {/* Quantity Selector */}
          {product.stock_quantity > 0 && (
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.quantityText}>{quantity}</Text>

                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity >= product.stock_quantity && styles.quantityButtonDisabled
                  ]}
                  onPress={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  disabled={quantity >= product.stock_quantity}
                >
                  <Text style={[
                    styles.quantityButtonText,
                    quantity >= product.stock_quantity && styles.quantityButtonTextDisabled
                  ]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Total Price */}
          {product.stock_quantity > 0 && (
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>
                Total: ₹{(product.price * quantity).toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {product.stock_quantity > 0 ? (
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              isAddingToCart && styles.addToCartButtonDisabled
            ]}
            onPress={addToCart}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.addToCartIcon}>🛒</Text>
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.outOfStockButton}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
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
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 15,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  badges: {
    flexDirection: 'row',
  },
  badge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 10,
  },
  weight: {
    fontSize: 16,
    color: '#666',
  },
  stockContainer: {
    marginBottom: 20,
  },
  stockText: {
    fontSize: 16,
    fontWeight: '500',
  },
  inStock: {
    color: '#4CAF50',
  },
  lowStock: {
    color: '#ff9800',
  },
  quantityContainer: {
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#ccc',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  quantityButtonTextDisabled: {
    color: '#999',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    minWidth: 40,
    textAlign: 'center',
  },
  totalContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  bottomBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
  },
  addToCartButtonDisabled: {
    opacity: 0.7,
  },
  addToCartIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  outOfStockButton: {
    backgroundColor: '#ccc',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;