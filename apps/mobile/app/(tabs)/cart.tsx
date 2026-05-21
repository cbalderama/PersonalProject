import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CartItem } from '../../components/CartItem';
import { calculateCartTotal, getCartItems, removeFromCart, updateCartItemQuantity } from '../../services/cart';
import { auth } from '../../services/firebaseConfig';
import { CartItem as CartItemType } from '../../types';

export default function CartScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const items = await getCartItems(user.uid);
      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCart();
    setRefreshing(false);
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (!user) return;
    try {
      await updateCartItemQuantity(user.uid, productId, quantity);
      await loadCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemove = async (productId: string) => {
    if (!user) return;
    
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromCart(user.uid, productId);
              await loadCart();
            } catch (error) {
              console.error('Error removing item:', error);
            }
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
  if (cartItems.length === 0) return;
  router.push('/checkout');  // ← Change this line
};

  const total = calculateCartTotal(cartItems);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={100} color="#ccc" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add some products to get started!</Text>
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onUpdateQuantity={(quantity) => handleUpdateQuantity(item.productId, quantity)}
            onRemove={() => handleRemove(item.productId)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2196f3',
  },
  checkoutButton: {
    backgroundColor: '#2196f3',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#2196f3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
});