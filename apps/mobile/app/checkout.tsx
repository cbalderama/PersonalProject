import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { calculateCartTotal, getCartItems } from '../services/cart';
import { auth } from '../services/firebaseConfig';
import { createOrder } from '../services/orders';
import { CartItem, ShippingAddress } from '../types';

export default function CheckoutScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const loadCart = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [user, loadCart]);

  const validateForm = (): boolean => {
    if (!shippingAddress.fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!shippingAddress.street.trim()) {
      Alert.alert('Error', 'Please enter your street address');
      return false;
    }
    if (!shippingAddress.city.trim()) {
      Alert.alert('Error', 'Please enter your city');
      return false;
    }
    if (!shippingAddress.state.trim()) {
      Alert.alert('Error', 'Please enter your state/province');
      return false;
    }
    if (!shippingAddress.zipCode.trim()) {
      Alert.alert('Error', 'Please enter your zip code');
      return false;
    }
    if (!shippingAddress.country.trim()) {
      Alert.alert('Error', 'Please enter your country');
      return false;
    }
    if (!shippingAddress.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!user || cartItems.length === 0) return;

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const orderId = await createOrder(user.uid, cartItems, shippingAddress, paymentMethod);

      Alert.alert(
        'Order Placed! 🎉',
        `Your order #${orderId.substring(0, 8)} has been placed successfully!`,
        [
          {
            text: 'View Orders',
            onPress: () => router.replace('/orders'),
          },
          {
            text: 'Continue Shopping',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
      <View style={styles.centerContainer}>
        <Ionicons name="cart-outline" size={100} color="#ccc" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <TouchableOpacity style={styles.shopButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={styles.orderItemName} numberOfLines={1}>
                {item.product.name}
              </Text>
              <Text style={styles.orderItemQuantity}>x{item.quantity}</Text>
              <Text style={styles.orderItemPrice}>
                ${(item.product.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={shippingAddress.fullName}
            onChangeText={(text) => setShippingAddress({ ...shippingAddress, fullName: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Street Address"
            value={shippingAddress.street}
            onChangeText={(text) => setShippingAddress({ ...shippingAddress, street: text })}
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="City"
              value={shippingAddress.city}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, city: text })}
            />

            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="State/Province"
              value={shippingAddress.state}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, state: text })}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Zip Code"
              value={shippingAddress.zipCode}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, zipCode: text })}
            />

            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Country"
              value={shippingAddress.country}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, country: text })}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={shippingAddress.phone}
            onChangeText={(text) => setShippingAddress({ ...shippingAddress, phone: text })}
            keyboardType="phone-pad"
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'credit_card' && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod('credit_card')}
          >
            <Ionicons
              name="card-outline"
              size={24}
              color={paymentMethod === 'credit_card' ? '#2196f3' : '#666'}
            />
            <Text
              style={[
                styles.paymentOptionText,
                paymentMethod === 'credit_card' && styles.paymentOptionTextActive,
              ]}
            >
              Credit Card (Simulated)
            </Text>
            {paymentMethod === 'credit_card' && (
              <Ionicons name="checkmark-circle" size={24} color="#2196f3" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'paypal' && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod('paypal')}
          >
            <Ionicons
              name="logo-paypal"
              size={24}
              color={paymentMethod === 'paypal' ? '#2196f3' : '#666'}
            />
            <Text
              style={[
                styles.paymentOptionText,
                paymentMethod === 'paypal' && styles.paymentOptionTextActive,
              ]}
            >
              PayPal (Simulated)
            </Text>
            {paymentMethod === 'paypal' && (
              <Ionicons name="checkmark-circle" size={24} color="#2196f3" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('cod')}
          >
            <Ionicons
              name="cash-outline"
              size={24}
              color={paymentMethod === 'cod' ? '#2196f3' : '#666'}
            />
            <Text
              style={[
                styles.paymentOptionText,
                paymentMethod === 'cod' && styles.paymentOptionTextActive,
              ]}
            >
              Cash on Delivery
            </Text>
            {paymentMethod === 'cod' && <Ionicons name="checkmark-circle" size={24} color="#2196f3" />}
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, submitting && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.placeOrderText}>Place Order - ${total.toFixed(2)}</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
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
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderItemName: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  orderItemQuantity: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 12,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2196f3',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  paymentOptionActive: {
    borderColor: '#2196f3',
    backgroundColor: '#e3f2fd',
  },
  paymentOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  paymentOptionTextActive: {
    color: '#2196f3',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  placeOrderButton: {
    flexDirection: 'row',
    backgroundColor: '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
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
});