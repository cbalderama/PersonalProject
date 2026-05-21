import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ProductCard } from '../../components/ProductCard';
import { SearchBar } from '../../components/SearchBar';
import { addToCart } from '../../services/cart';
import { auth } from '../../services/firebaseConfig';
import { getProducts } from '../../services/products';
import { getWishlistItems, toggleWishlist } from '../../services/wishlist';
import { Product, ProductFilters } from '../../types';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'phones', label: 'Phones', icon: 'phone-portrait' },
  { id: 'laptops', label: 'Laptops', icon: 'laptop' },
  { id: 'tablets', label: 'Tablets', icon: 'tablet-portrait' },
  { id: 'accessories', label: 'Accessories', icon: 'headset' },
];

export default function HomeScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  useEffect(() => {
    if (user) {
      loadWishlistIds();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const filters: ProductFilters = {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      };
      const data = await getProducts(filters);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWishlistIds = async () => {
    if (!user) return;
    try {
      const wishlistItems = await getWishlistItems(user.uid);
      setWishlistIds(new Set(wishlistItems.map(item => item.productId)));
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    if (user) await loadWishlistIds();
    setRefreshing(false);
  };

  const handleSearch = () => {
    loadFilteredProducts();
  };

  const loadFilteredProducts = async () => {
    try {
      setLoading(true);
      const filters: ProductFilters = {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
      };
      const data = await getProducts(filters);
      setProducts(data);
    } catch (error) {
      console.error('Error filtering products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) return;
    try {
      await addToCart(user.uid, productId, 1);
      // You can show a toast notification here
      console.log('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!user) return;
    try {
      const isAdded = await toggleWishlist(user.uid, productId);
      setWishlistIds(prev => {
        const next = new Set(prev);
        if (isAdded) {
          next.add(productId);
        } else {
          next.delete(productId);
        }
        return next;
      });
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const renderHeader = () => (
    <View>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSearch={handleSearch}
        placeholder="Search for products..."
      />

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Ionicons
                name={item.icon as any}
                size={24}
                color={selectedCategory === item.id ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.categoryLabel,
                  selectedCategory === item.id && styles.categoryLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'all' ? 'All Products' : CATEGORIES.find(c => c.id === selectedCategory)?.label}
        </Text>
        <Text style={styles.productCount}>{products.length} items</Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#2196f3']} />
        }
        renderItem={({ item }) => (
          <View style={styles.productContainer}>
            <ProductCard
              product={item}
              onPress={() => router.push(`/product/${item.id}`)}
              onAddToCart={() => handleAddToCart(item.id)}
              onToggleWishlist={() => handleToggleWishlist(item.id)}
              isInWishlist={wishlistIds.has(item.id)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  productContainer: {
    width: '48%',
    marginBottom: 8,
  },
  categoriesContainer: {
    paddingVertical: 12,
    paddingLeft: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryButtonActive: {
    backgroundColor: '#2196f3',
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  categoryLabelActive: {
    color: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  productCount: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});