import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    increment,
    serverTimestamp,
    setDoc,
    updateDoc,
} from 'firebase/firestore';
import { CartItem } from '../types';
import { db } from './firebaseConfig';
import { getProductById } from './products';

/**
 * Get user's cart items
 */
export const getCartItems = async (userId: string): Promise<CartItem[]> => {
  try {
    const cartRef = collection(db, 'users', userId, 'cart');
    const snapshot = await getDocs(cartRef);

    const items = await Promise.all(
      snapshot.docs.map(async (cartDoc) => {
        const data = cartDoc.data();
        const product = await getProductById(data.productId);

        if (!product) {
          // Product no longer exists, remove from cart
          await deleteDoc(cartDoc.ref);
          return null;
        }

        return {
          id: cartDoc.id,
          productId: data.productId,
          product,
          quantity: data.quantity,
          addedAt: data.addedAt?.toDate() || new Date(),
        }
      })
    );

    return items.filter(item => item !== null) as CartItem[];
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
};

/**
 * Add item to cart or update quantity if already exists
 */
export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number = 1
): Promise<void> => {
  try {
    const cartItemRef = doc(db, 'users', userId, 'cart', productId);
    const cartItemSnap = await getDoc(cartItemRef);

    if (cartItemSnap.exists()) {
      // Item already in cart, update quantity
      await updateDoc(cartItemRef, {
        quantity: increment(quantity),
      });
    } else {
      // New item, add to cart
      await setDoc(cartItemRef, {
        productId,
        quantity,
        addedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItemQuantity = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<void> => {
  try {
    if (quantity <= 0) {
      await removeFromCart(userId, productId);
      return;
    }

    const cartItemRef = doc(db, 'users', userId, 'cart', productId);
    await updateDoc(cartItemRef, { quantity });
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw error;
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (userId: string, productId: string): Promise<void> => {
  try {
    const cartItemRef = doc(db, 'users', userId, 'cart', productId);
    await deleteDoc(cartItemRef);
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

/**
 * Clear entire cart
 */
export const clearCart = async (userId: string): Promise<void> => {
  try {
    const cartRef = collection(db, 'users', userId, 'cart');
    const snapshot = await getDocs(cartRef);

    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

/**
 * Get cart item count
 */
export const getCartItemCount = async (userId: string): Promise<number> => {
  try {
    const cartRef = collection(db, 'users', userId, 'cart');
    const snapshot = await getDocs(cartRef);

    return snapshot.docs.reduce((total, doc) => {
      return total + (doc.data().quantity || 0);
    }, 0);
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }
};

/**
 * Calculate cart total
 */
export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);
};