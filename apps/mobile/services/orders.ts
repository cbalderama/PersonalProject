import {
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
} from 'firebase/firestore';
import { CartItem, Order, OrderItem, ShippingAddress } from '../types';
import { clearCart } from './cart';
import { db } from './firebaseConfig';

/**
 * Create a new order from cart items
 */
export const createOrder = async (
  userId: string,
  items: CartItem[],
  shippingAddress: ShippingAddress,
  paymentMethod: string
): Promise<string> => {
  try {
    // Calculate total
    const total = items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    // Transform cart items to order items
    const orderItems: OrderItem[] = items.map(item => ({
      productId: item.productId,
      productName: item.product.name,
      productImage: item.product.image,
      quantity: item.quantity,
      price: item.product.price,
    }));

    // Generate order ID
    const ordersRef = collection(db, 'users', userId, 'orders');
    const newOrderRef = doc(ordersRef);

    const order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      items: orderItems,
      total,
      status: 'pending',
      shippingAddress,
      paymentMethod,
    };

    // Create the order
    await setDoc(newOrderRef, {
      ...order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Clear the cart after successful order
    await clearCart(userId);

    return newOrderRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Get all orders for a user
 */
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, 'users', userId, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Order[];
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  userId: string,
  orderId: string,
  status: Order['status']
): Promise<void> => {
  try {
    const orderRef = doc(db, 'users', userId, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Cancel an order (only if status is pending or processing)
 */
export const cancelOrder = async (userId: string, orderId: string): Promise<void> => {
  try {
    await updateOrderStatus(userId, orderId, 'cancelled');
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

/**
 * Get order statistics
 */
export const getOrderStats = async (
  userId: string
): Promise<{
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
}> => {
  try {
    const orders = await getUserOrders(userId);

    return {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
      pendingOrders: orders.filter(order => order.status === 'pending' || order.status === 'processing').length,
    };
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return { totalOrders: 0, totalSpent: 0, pendingOrders: 0 };
  }
};