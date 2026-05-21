import { toggleWishlist, isInWishlist, addToWishlist, removeFromWishlist } from '../wishlist';

// Mock the entire wishlist module at the function level
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({})),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
}));

jest.mock('../firebaseConfig', () => ({
  db: {},
}));

import { getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;

describe('Wishlist Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isInWishlist', () => {
    it('should return true when product is in wishlist', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
      } as any);

      const result = await isInWishlist('user123', 'product456');

      expect(result).toBe(true);
    });

    it('should return false when product is not in wishlist', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await isInWishlist('user123', 'product456');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockGetDoc.mockRejectedValue(new Error('Firebase error'));

      const result = await isInWishlist('user123', 'product456');

      expect(result).toBe(false);
    });
  });

  describe('addToWishlist', () => {
    it('should add product to wishlist', async () => {
      mockSetDoc.mockResolvedValue(undefined);

      await addToWishlist('user123', 'product456');

      expect(mockSetDoc).toHaveBeenCalled();
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove product from wishlist', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      await removeFromWishlist('user123', 'product456');

      expect(mockDeleteDoc).toHaveBeenCalled();
    });
  });

  describe('toggleWishlist', () => {
    it('should add product when not in wishlist', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      } as any);
      mockSetDoc.mockResolvedValue(undefined);

      const result = await toggleWishlist('user123', 'product456');

      expect(result).toBe(true);
      expect(mockSetDoc).toHaveBeenCalled();
    });

    it('should remove product when in wishlist', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
      } as any);
      mockDeleteDoc.mockResolvedValue(undefined);

      const result = await toggleWishlist('user123', 'product456');

      expect(result).toBe(false);
      expect(mockDeleteDoc).toHaveBeenCalled();
    });
  });
});