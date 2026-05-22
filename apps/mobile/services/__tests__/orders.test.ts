import { createOrder, getOrderStats } from '../orders';
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';

// Mock Firestore
jest.mock('firebase/firestore');
jest.mock('../firebaseConfig', () => ({
  db: {},
}));

// Mock clearCart
jest.mock('../cart', () => ({
  clearCart: jest.fn(),
}));

import { clearCart } from '../cart';

const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockClearCart = clearCart as jest.MockedFunction<typeof clearCart>;

describe('Orders Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const mockCartItems = [
        {
          id: 'cart1',
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

      const mockAddress = {
        fullName: 'John Doe',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        phone: '1234567890',
      };

      const mockOrderRef = { id: 'order123' };

      mockCollection.mockReturnValue({} as any);
      mockDoc.mockReturnValue(mockOrderRef as any);
      mockSetDoc.mockResolvedValue(undefined);
      mockClearCart.mockResolvedValue(undefined);

      const orderId = await createOrder('user123', mockCartItems, mockAddress, 'credit_card');

      expect(orderId).toBe('order123');
      expect(mockSetDoc).toHaveBeenCalled();
      expect(mockClearCart).toHaveBeenCalledWith('user123');
    });
  });

  describe('getOrderStats', () => {
    it('should return correct order statistics', async () => {
      const mockOrders = [
        {
          id: 'order1',
          data: () => ({
            status: 'pending',
            total: 100,
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
        {
          id: 'order2',
          data: () => ({
            status: 'delivered',
            total: 200,
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
        {
          id: 'order3',
          data: () => ({
            status: 'pending',
            total: 150,
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
      ];

      mockCollection.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({
        docs: mockOrders,
      } as any);

      const stats = await getOrderStats('user123');

      expect(stats.totalOrders).toBe(3);
      expect(stats.totalSpent).toBe(450);
      expect(stats.pendingOrders).toBe(2);
    });

    it('should return zero stats for user with no orders', async () => {
      mockCollection.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({
        docs: [],
      } as any);

      const stats = await getOrderStats('user123');

      expect(stats.totalOrders).toBe(0);
      expect(stats.totalSpent).toBe(0);
      expect(stats.pendingOrders).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should throw error when createOrder fails', async () => {
      mockCollection.mockReturnValue({} as any);
      mockDoc.mockReturnValue({} as any);
      mockSetDoc.mockRejectedValue(new Error('Order creation failed'));

      const mockCartItems = [{
        id: 'cart1',
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
      }];

      const mockAddress = {
        fullName: 'John Doe',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        phone: '1234567890',
      };

      await expect(
        createOrder('user123', mockCartItems, mockAddress, 'credit_card')
      ).rejects.toThrow('Order creation failed');
    });
  });
});