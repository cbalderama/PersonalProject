import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ProductCard } from '../../components/ProductCard';
import { addToCart } from '../../services/cart';
import { auth } from '../../services/firebaseConfig';
import { getWishlistItems, removeFromWishlist } from '../../services/wishlist';
import { WishlistItem } from '../../types';

export default function WishlistScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const items = await getWishlistItems(user.uid);
      setWishlistItems(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWishlist();
    setRefreshing(false);
  };

  const handleRemove = async (productId: string) => {
    if (!user) return;
    try {
      await removeFromWishlist(user.uid, productId);
      await loadWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) return;
    try {
      await addToCart(user.uid, productId, 1);
      Alert.alert('Success', 'Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
      </View>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={100} color="#ccc" />
        <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
        <Text style={styles.emptySubtitle}>Save your favorite products here!</Text>
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.shopButtonText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={wishlistItems}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => (
          <View style={styles.productContainer}>
            <ProductCard
              product={item.product}
              onPress={() => console.log('Product detail coming soon!')}
              onAddToCart={() => handleAddToCart(item.productId)}
              onToggleWishlist={() => handleRemove(item.productId)}
              isInWishlist={true}
            />
          </View>
        )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
});