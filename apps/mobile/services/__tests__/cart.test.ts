import { calculateCartTotal, addToCart, updateCartItemQuantity, removeFromCart, getCartItems, clearCart } from '../cart';
import { doc, setDoc, deleteDoc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
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
const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
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

  describe('getCartItems', () => {
    it('should return cart items with product details', async () => {
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

      const mockCartData = {
        productId: 'p1',
        quantity: 2,
        addedAt: { toDate: () => new Date() },
      };

      mockCollection.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({
        docs: [
          {
            id: 'cart1',
            data: () => mockCartData,
          },
        ],
      } as any);
      mockGetProductById.mockResolvedValue(mockProduct);

      const items = await getCartItems('user123');

      expect(items).toHaveLength(1);
      expect(items[0].productId).toBe('p1');
      expect(items[0].quantity).toBe(2);
    });

    it('should return empty array when cart is empty', async () => {
      mockCollection.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({
        docs: [],
      } as any);

      const items = await getCartItems('user123');

      expect(items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('should delete all cart items', async () => {
      const mockDocs = [
        { ref: { id: 'item1' } },
        { ref: { id: 'item2' } },
      ];

      mockCollection.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({
        docs: mockDocs,
      } as any);
      mockDeleteDoc.mockResolvedValue(undefined);

      await clearCart('user123');

      expect(mockDeleteDoc).toHaveBeenCalledTimes(2);
      expect(mockDeleteDoc).toHaveBeenCalledWith(mockDocs[0].ref);
      expect(mockDeleteDoc).toHaveBeenCalledWith(mockDocs[1].ref);
    });
  });

  describe('error handling', () => {
    it('should handle errors in getCartItems gracefully', async () => {
      mockCollection.mockReturnValue({} as any);
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      await expect(getCartItems('user123')).rejects.toThrow('Firestore error');
    });

    it('should handle errors in addToCart gracefully', async () => {
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockRejectedValue(new Error('Network error'));

      await expect(addToCart('user123', 'p1', 1)).rejects.toThrow('Network error');
    });

    it('should remove from cart when quantity is 0', async () => {
      mockDoc.mockReturnValue({} as any);
      mockDeleteDoc.mockResolvedValue(undefined);

      await updateCartItemQuantity('user123', 'p1', 0);

      expect(mockDeleteDoc).toHaveBeenCalled();
    });
  });
});