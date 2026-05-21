import { calculateCartTotal, addToCart, updateCartItemQuantity, removeFromCart } from '../cart';
import { doc, setDoc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import { CartItem } from '../../types';

// Mock Firestore
jest.mock('firebase/firestore');
jest.mock('../firebaseConfig', () => ({
  db: {},
}));

// Mock getProductById
jest.mock('../products', () => ({
  getProductById: jest.fn(),
}));

import { getProductById } from '../products';

const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockGetProductById = getProductById as jest.MockedFunction<typeof getProductById>;

describe('Cart Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateCartTotal', () => {
    it('should calculate total correctly with multiple items', () => {
      const mockCartItems: CartItem[] = [
        {
          id: '1',
          productId: 'p1',
          product: {
            id: 'p1',
            name: 'Product 1',
            price: 10,
            stock: 5,
            category: 'phones' as const,
            image: '',
            brand: 'Test',
            rating: 4,
            reviews: 10,
            description: '',
          },
          quantity: 2,
          addedAt: new Date(),
        },
        {
          id: '2',
          productId: 'p2',
          product: {
            id: 'p2',
            name: 'Product 2',
            price: 20,
            stock: 3,
            category: 'laptops' as const,
            image: '',
            brand: 'Test',
            rating: 4,
            reviews: 10,
            description: '',
          },
          quantity: 1,
          addedAt: new Date(),
        },
      ];

      const total = calculateCartTotal(mockCartItems);
      expect(total).toBe(40);
    });

    it('should return 0 for empty cart', () => {
      const total = calculateCartTotal([]);
      expect(total).toBe(0);
    });

    it('should handle single item', () => {
      const mockCartItems: CartItem[] = [
        {
          id: '1',
          productId: 'p1',
          product: {
            id: 'p1',
            name: 'iPhone',
            price: 999,
            stock: 10,
            category: 'phones' as const,
            image: '',
            brand: 'Apple',
            rating: 5,
            reviews: 100,
            description: '',
          },
          quantity: 1,
          addedAt: new Date(),
        },
      ];

      const total = calculateCartTotal(mockCartItems);
      expect(total).toBe(999);
    });
  });

  describe('addToCart', () => {
    it('should add product to cart', async () => {
      const mockProduct = {
        id: 'p1',
        name: 'iPhone',
        price: 999,
        stock: 10,
        category: 'phones' as const,
        image: '',
        brand: 'Apple',
        rating: 5,
        reviews: 100,
        description: '',
      };

      mockDoc.mockReturnValue({} as any);
      mockGetProductById.mockResolvedValue(mockProduct);
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      } as any);
      mockSetDoc.mockResolvedValue(undefined);

      await addToCart('user123', 'p1', 2);

      expect(mockSetDoc).toHaveBeenCalled();
    });

    it('should update quantity if product already in cart', async () => {
      const mockProduct = {
        id: 'p1',
        name: 'iPhone',
        price: 999,
        stock: 10,
        category: 'phones' as const,
        image: '',
        brand: 'Apple',
        rating: 5,
        reviews: 100,
        description: '',
      };

      mockDoc.mockReturnValue({} as any);
      mockGetProductById.mockResolvedValue(mockProduct);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ quantity: 1 }),
      } as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await addToCart('user123', 'p1', 2);

      expect(mockUpdateDoc).toHaveBeenCalled();
    });
  });

  describe('updateCartItemQuantity', () => {
    it('should update cart item quantity', async () => {
      mockDoc.mockReturnValue({} as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateCartItemQuantity('user123', 'p1', 5);

      expect(mockUpdateDoc).toHaveBeenCalled();
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      mockDoc.mockReturnValue({} as any);
      mockDeleteDoc.mockResolvedValue(undefined);

      await removeFromCart('user123', 'p1');

      expect(mockDeleteDoc).toHaveBeenCalled();
    });
  });
});