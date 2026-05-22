import { addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, getWishlistItems } from '../wishlist';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({})),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
  collection: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock('../firebaseConfig', () => ({
  db: {},
}));

// Mock getProductById
jest.mock('../products', () => ({
  getProductById: jest.fn(),
}));

import { getProductById } from '../products';

const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockGetProductById = getProductById as jest.MockedFunction<typeof getProductById>;

describe('Wishlist Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isInWishlist', () => {
    it('should return true when product is in wishlist', async () => {
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
      } as any);

      const result = await isInWishlist('user123', 'product456');

      expect(result).toBe(true);
    });

    it('should return false when product is not in wishlist', async () => {
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await isInWishlist('user123', 'product456');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockRejectedValue(new Error('Firebase error'));

      const result = await isInWishlist('user123', 'product456');

      expect(result).toBe(false);
    });
  });

  describe('addToWishlist', () => {
    it('should add product to wishlist', async () => {
      mockDoc.mockReturnValue({} as any);
      mockSetDoc.mockResolvedValue(undefined);

      await addToWishlist('user123', 'product456');

      expect(mockSetDoc).toHaveBeenCalled();
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove product from wishlist', async () => {
      mockDoc.mockReturnValue({} as any);
      mockDeleteDoc.mockResolvedValue(undefined);

      await removeFromWishlist('user123', 'product456');

      expect(mockDeleteDoc).toHaveBeenCalled();
    });
  });

  describe('toggleWishlist', () => {
    it('should add product when not in wishlist', async () => {
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      } as any);
      mockSetDoc.mockResolvedValue(undefined);

      const result = await toggleWishlist('user123', 'product456');

      expect(result).toBe(true);
      expect(mockSetDoc).toHaveBeenCalled();
    });

    it('should remove product when in wishlist', async () => {
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
      } as any);
      mockDeleteDoc.mockResolvedValue(undefined);

      const result = await toggleWishlist('user123', 'product456');

      expect(result).toBe(false);
      expect(mockDeleteDoc).toHaveBeenCalled();
    });
  });

  describe('getWishlistItems', () => {
    it('should return wishlist items with product details', async () => {
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

      const mockWishlistData = {
        productId: 'p1',
        addedAt: { toDate: () => new Date() },
      };

      mockCollection.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({
        docs: [
          {
            id: 'wishlist1',
            data: () => mockWishlistData,
          },
        ],
      } as any);
      mockGetProductById.mockResolvedValue(mockProduct);

      const items = await getWishlistItems('user123');

      expect(items).toHaveLength(1);
      expect(items[0].productId).toBe('p1');
    });

    it('should return empty array when wishlist is empty', async () => {
      mockCollection.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({
        docs: [],
      } as any);

      const items = await getWishlistItems('user123');

      expect(items).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should throw error when addToWishlist fails', async () => {
      mockDoc.mockReturnValue({} as any);
      mockSetDoc.mockRejectedValue(new Error('Add failed'));

      await expect(addToWishlist('user123', 'p1')).rejects.toThrow('Add failed');
    });

    it('should throw error when removeFromWishlist fails', async () => {
      mockDoc.mockReturnValue({} as any);
      mockDeleteDoc.mockRejectedValue(new Error('Remove failed'));

      await expect(removeFromWishlist('user123', 'p1')).rejects.toThrow('Remove failed');
    });

    it('should throw error when getWishlistItems fails', async () => {
      mockCollection.mockReturnValue({} as any);
      mockGetDocs.mockRejectedValue(new Error('Fetch failed'));

      await expect(getWishlistItems('user123')).rejects.toThrow('Fetch failed');
    });
  });
});