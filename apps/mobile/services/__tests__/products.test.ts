import { getProducts, getProductById } from '../products';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

// Mock Firestore
jest.mock('firebase/firestore');
jest.mock('../firebaseConfig', () => ({
  db: {},
}));

const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;

describe('Products Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return all products when no filters provided', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'iPhone 15',
          price: 999,
          category: 'phones' as const,
          stock: 10,
          image: 'url',
          brand: 'Apple',
          rating: 5,
          reviews: 100,
          description: 'Latest iPhone',
        },
      ];

      mockCollection.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({
        docs: mockProducts.map(product => ({
          id: product.id,
          data: () => product,
        })),
      } as any);

      const result = await getProducts({});

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('iPhone 15');
    });

    it('should filter products by category', async () => {
      mockCollection.mockReturnValue({} as any);
      mockQuery.mockReturnValue({} as any);
      mockWhere.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({
        docs: [],
      } as any);

      await getProducts({ category: 'phones' });

      expect(mockWhere).toHaveBeenCalledWith('category', '==', 'phones');
    });
  });

  describe('getProductById', () => {
    it('should return product by id', async () => {
      const mockProduct = {
        id: '1',
        name: 'iPhone 15',
        price: 999,
        category: 'phones' as const,
        stock: 10,
        image: 'url',
        brand: 'Apple',
        rating: 5,
        reviews: 100,
        description: 'Latest iPhone',
      };

      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: '1',
        data: () => mockProduct,
      } as any);

      const result = await getProductById('1');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('iPhone 15');
    });

    it('should return null when product not found', async () => {
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getProductById('999');

      expect(result).toBeNull();
    });
  });
});