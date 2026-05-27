import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    setDoc,
} from 'firebase/firestore';
import { WishlistItem } from '../types';
import { db } from './firebaseConfig';
import { getProductById } from './products';

/**
 * Get user's wishlist items
 */
export const getWishlistItems = async (userId: string): Promise<WishlistItem[]> => {
  try {
    const wishlistRef = collection(db, 'users', userId, 'wishlist');
    const snapshot = await getDocs(wishlistRef);

    const items = await Promise.all(
      snapshot.docs.map(async (wishlistDoc) => {
        const data = wishlistDoc.data();
        const product = await getProductById(data.productId);

        if (!product) {
          // Product no longer exists, remove from wishlist
          await deleteDoc(wishlistDoc.ref);
          return null;
        }

        return {
          id: wishlistDoc.id,
          productId: data.productId,
          product,
          addedAt: data.addedAt?.toDate() || new Date(),
        }
      })
    );

    return items.filter(item => item !== null) as WishlistItem[];
  } catch (error) {
    console.error('Error fetching wishlist items:', error);
    throw error;
  }
};

/**
 * Add item to wishlist
 */
export const addToWishlist = async (userId: string, productId: string): Promise<void> => {
  try {
    const wishlistItemRef = doc(db, 'users', userId, 'wishlist', productId);
    await setDoc(wishlistItemRef, {
      productId,
      addedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

/**
 * Remove item from wishlist
 */
export const removeFromWishlist = async (userId: string, productId: string): Promise<void> => {
  try {
    const wishlistItemRef = doc(db, 'users', userId, 'wishlist', productId);
    await deleteDoc(wishlistItemRef);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

/**
 * Check if item is in wishlist
 */
export const isInWishlist = async (userId: string, productId: string): Promise<boolean> => {
  try {
    const wishlistItemRef = doc(db, 'users', userId, 'wishlist', productId);
    const wishlistItemSnap = await getDoc(wishlistItemRef);
    return wishlistItemSnap.exists();
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
};

/**
 * Toggle wishlist (add if not present, remove if present)
 */
export const toggleWishlist = async (userId: string, productId: string): Promise<boolean> => {
  try {
    const inWishlist = await isInWishlist(userId, productId);

    if (inWishlist) {
      await removeFromWishlist(userId, productId);
      return false;
    } else {
      await addToWishlist(userId, productId);
      return true;
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    throw error;
  }
};