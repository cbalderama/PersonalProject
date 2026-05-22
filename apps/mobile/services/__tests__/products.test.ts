import { getProducts, getProductById, getFeaturedProducts, getProductsByCategory } from '../products';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';

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
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
const mockLimit = limit as jest.MockedFunction<typeof limit>;

describe('Products Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCollection.mockReturnValue({} as any);
    mockQuery.mockReturnValue({} as any);
  });

  describe('getProducts', () => {
    it('should return all products when no filters provided', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'iPhone 15',
          price: 999,
          category: 'phones',
          stock: 10,
          image: 'url',
          brand: 'Apple',
          rating: 5,
          reviews: 100,
          description: 'Latest iPhone',
        },
      ];

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
      mockWhere.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({ docs: [] } as any);

      await getProducts({ category: 'phones' });

      expect(mockWhere).toHaveBeenCalledWith('category', '==', 'phones');
    });

    it('should filter products by brand', async () => {
      mockWhere.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({ docs: [] } as any);

      await getProducts({ brand: 'Apple' });

      expect(mockWhere).toHaveBeenCalledWith('brand', '==', 'Apple');
    });

    it('should filter by minimum price', async () => {
      mockWhere.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({ docs: [] } as any);

      await getProducts({ minPrice: 500 });

      expect(mockWhere).toHaveBeenCalledWith('price', '>=', 500);
    });

    it('should filter by maximum price', async () => {
      mockWhere.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({ docs: [] } as any);

      await getProducts({ maxPrice: 1000 });

      expect(mockWhere).toHaveBeenCalledWith('price', '<=', 1000);
    });

    it('should sort by price ascending', async () => {
      mockOrderBy.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({ docs: [] } as any);

      await getProducts({ sortBy: 'price-asc' });

      expect(mockOrderBy).toHaveBeenCalledWith('price', 'asc');
    });

    it('should sort by price descending', async () => {
      mockOrderBy.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({ docs: [] } as any);

      await getProducts({ sortBy: 'price-desc' });

      expect(mockOrderBy).toHaveBeenCalledWith('price', 'desc');
    });

    it('should sort by rating', async () => {
      mockOrderBy.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({ docs: [] } as any);

      await getProducts({ sortBy: 'rating' });

      expect(mockOrderBy).toHaveBeenCalledWith('rating', 'desc');
    });

    it('should sort by newest', async () => {
      mockOrderBy.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({ docs: [] } as any);

      await getProducts({ sortBy: 'newest' });

      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
    });

    it('should filter by search query (client-side)', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'iPhone 15 Pro',
          price: 999,
          category: 'phones',
          stock: 10,
          image: '',
          brand: 'Apple',
          rating: 5,
          reviews: 100,
          description: 'Latest iPhone with amazing features',
        },
        {
          id: '2',
          name: 'Samsung Galaxy',
          price: 899,
          category: 'phones',
          stock: 5,
          image: '',
          brand: 'Samsung',
          rating: 4,
          reviews: 80,
          description: 'Great Android phone',
        },
      ];

      mockGetDocs.mockResolvedValue({
        docs: mockProducts.map(p => ({ id: p.id, data: () => p })),
      } as any);

      const result = await getProducts({ search: 'iphone' });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('iPhone 15 Pro');
    });

    it('should search in name, description, and brand', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Phone A',
          price: 999,
          category: 'phones',
          stock: 10,
          image: '',
          brand: 'Apple',
          rating: 5,
          reviews: 100,
          description: 'Regular phone',
        },
        {
          id: '2',
          name: 'Phone B',
          price: 899,
          category: 'phones',
          stock: 5,
          image: '',
          brand: 'Samsung',
          rating: 4,
          reviews: 80,
          description: 'Contains apple in description',
        },
      ];

      mockGetDocs.mockResolvedValue({
        docs: mockProducts.map(p => ({ id: p.id, data: () => p })),
      } as any);

      const result = await getProducts({ search: 'apple' });

      expect(result).toHaveLength(2); // Matches brand and description
    });
  });

  describe('getProductById', () => {
    it('should return product by id', async () => {
      const mockProduct = {
        id: '1',
        name: 'iPhone 15',
        price: 999,
        category: 'phones',
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

  describe('getFeaturedProducts', () => {
    it('should return featured products with stock', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Featured Phone',
          price: 999,
          category: 'phones',
          stock: 10,
          image: '',
          brand: 'Apple',
          rating: 5,
          reviews: 100,
          description: 'Top rated',
        },
      ];

      mockWhere.mockReturnValue({} as any);
      mockOrderBy.mockReturnValue({} as any);
      mockLimit.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({
        docs: mockProducts.map(p => ({ id: p.id, data: () => p })),
      } as any);

      const result = await getFeaturedProducts(10);

      expect(mockWhere).toHaveBeenCalledWith('stock', '>', 0);
      expect(mockOrderBy).toHaveBeenCalledWith('rating', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(1);
    });
  });

  describe('getProductsByCategory', () => {
    it('should return products by category', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Laptop',
          price: 1200,
          category: 'laptops',
          stock: 5,
          image: '',
          brand: 'Dell',
          rating: 4,
          reviews: 50,
          description: 'Gaming laptop',
        },
      ];

      mockWhere.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({
        docs: mockProducts.map(p => ({ id: p.id, data: () => p })),
      } as any);

      const result = await getProductsByCategory('laptops');

      expect(mockWhere).toHaveBeenCalledWith('category', '==', 'laptops');
      expect(result).toHaveLength(1);
    });

    it('should apply limit when provided', async () => {
      mockWhere.mockReturnValue({} as any);
      mockLimit.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({ docs: [] } as any);

      await getProductsByCategory('laptops', 5);

      expect(mockLimit).toHaveBeenCalledWith(5);
    });
  });

  describe('error handling', () => {
    it('should throw error when getProducts fails', async () => {
      mockGetDocs.mockRejectedValue(new Error('Database error'));

      await expect(getProducts({})).rejects.toThrow('Database error');
    });

    it('should throw error when getProductById fails', async () => {
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockRejectedValue(new Error('Not found'));

      await expect(getProductById('1')).rejects.toThrow('Not found');
    });

    it('should throw error when getFeaturedProducts fails', async () => {
      mockWhere.mockReturnValue({} as any);
      mockOrderBy.mockReturnValue({} as any);
      mockLimit.mockReturnValue({} as any);
      mockGetDocs.mockRejectedValue(new Error('Query failed'));

      await expect(getFeaturedProducts(10)).rejects.toThrow('Query failed');
    });

    it('should throw error when getProductsByCategory fails', async () => {
      mockWhere.mockReturnValue({} as any);
      mockGetDocs.mockRejectedValue(new Error('Category error'));

      await expect(getProductsByCategory('phones')).rejects.toThrow('Category error');
    });
  });
});