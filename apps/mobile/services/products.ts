import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    QueryConstraint,
    where,
} from 'firebase/firestore';
import { Product, ProductFilters } from '../types';
import { db } from './firebaseConfig';

const PRODUCTS_COLLECTION = 'products';

/**
 * Fetch all products with optional filters
 */
export const getProducts = async (filters?: ProductFilters): Promise<Product[]> => {
  try {
    const constraints: QueryConstraint[] = [];

    // Apply filters
    if (filters?.category) {
      constraints.push(where('category', '==', filters.category));
    }

    if (filters?.brand) {
      constraints.push(where('brand', '==', filters.brand));
    }

    if (filters?.minPrice !== undefined) {
      constraints.push(where('price', '>=', filters.minPrice));
    }

    if (filters?.maxPrice !== undefined) {
      constraints.push(where('price', '<=', filters.maxPrice));
    }

    // Apply sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          constraints.push(orderBy('price', 'asc'));
          break;
        case 'price-desc':
          constraints.push(orderBy('price', 'desc'));
          break;
        case 'rating':
          constraints.push(orderBy('rating', 'desc'));
          break;
        case 'newest':
          constraints.push(orderBy('createdAt', 'desc'));
          break;
      }
    }

    const q = query(collection(db, PRODUCTS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    let products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];

    // Client-side search filter (since Firestore doesn't support full-text search)
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(
        product =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.brand.toLowerCase().includes(searchLower)
      );
    }

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Fetch a single product by ID
 */
export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Product;
    }

    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

/**
 * Get featured products (highest rated with good stock)
 */
export const getFeaturedProducts = async (limitCount: number = 10): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('stock', '>', 0),
      orderBy('rating', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (
  category: string,
  limitCount?: number
): Promise<Product[]> => {
  try {
    const constraints: QueryConstraint[] = [where('category', '==', category)];

    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const q = query(collection(db, PRODUCTS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};