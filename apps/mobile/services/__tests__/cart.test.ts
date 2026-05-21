import { calculateCartTotal } from '../cart';
import { CartItem } from '../../types';

describe('Cart Service', () => {
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
});