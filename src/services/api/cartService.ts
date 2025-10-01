import { supabase } from './supabase';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  products?: {
    id: string;
    name: string;
    price: number;
    weight: number;
    unit: string;
    image_url: string;
  };
}

export class CartService {
  // Add item to cart
  static async addToCart(userId: string, productId: string, quantity: number = 1): Promise<{ success: boolean; error?: string }> {
    try {
      // First ensure user profile exists
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('User profile not found:', profileError);
        return { success: false, error: 'User profile not found. Please login again.' };
      }

      // Check if product already exists in cart
      const { data: existingCartItem, error: cartCheckError } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (cartCheckError && cartCheckError.code !== 'PGRST116') {
        console.error('Error checking cart:', cartCheckError);
        return { success: false, error: 'Failed to check cart' };
      }

      if (existingCartItem) {
        // Update existing cart item
        const { error } = await supabase
          .from('cart')
          .update({
            quantity: existingCartItem.quantity + quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCartItem.id);

        if (error) {
          console.error('Error updating cart:', error);
          return { success: false, error: 'Failed to update cart' };
        }
      } else {
        // Add new cart item
        const { error } = await supabase
          .from('cart')
          .insert({
            user_id: userId,
            product_id: productId,
            quantity: quantity,
          });

        if (error) {
          console.error('Error adding to cart:', error);
          return { success: false, error: `Failed to add to cart: ${error.message}` };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error in addToCart:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Get user's cart items
  static async getCartItems(userId: string): Promise<{ items: CartItem[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('cart')
        .select(`
          *,
          products (
            id,
            name,
            price,
            weight,
            unit,
            image_url
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error loading cart items:', error);
        return { items: [], error: 'Failed to load cart items' };
      }

      return { items: data || [] };
    } catch (error) {
      console.error('Error loading cart:', error);
      return { items: [], error: 'An unexpected error occurred' };
    }
  }

  // Update cart item quantity
  static async updateCartItem(cartId: string, quantity: number): Promise<{ success: boolean; error?: string }> {
    try {
      if (quantity <= 0) {
        return await this.removeCartItem(cartId);
      }

      const { error } = await supabase
        .from('cart')
        .update({
          quantity: quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartId);

      if (error) {
        console.error('Error updating cart item:', error);
        return { success: false, error: 'Failed to update cart item' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating cart item:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Remove item from cart
  static async removeCartItem(cartId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', cartId);

      if (error) {
        console.error('Error removing cart item:', error);
        return { success: false, error: 'Failed to remove cart item' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error removing cart item:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Clear entire cart
  static async clearCart(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing cart:', error);
        return { success: false, error: 'Failed to clear cart' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Get cart count
  static async getCartCount(userId: string): Promise<{ count: number; error?: string }> {
    try {
      const { count, error } = await supabase
        .from('cart')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.error('Error getting cart count:', error);
        return { count: 0, error: 'Failed to get cart count' };
      }

      return { count: count || 0 };
    } catch (error) {
      console.error('Error getting cart count:', error);
      return { count: 0, error: 'An unexpected error occurred' };
    }
  }
}