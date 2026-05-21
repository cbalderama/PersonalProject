import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { addToCart } from '../../services/cart';
import { auth } from '../../services/firebaseConfig';
import { getProductById } from '../../services/products';
import { isInWishlist, toggleWishlist } from '../../services/wishlist';
import { Product } from '../../types';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = auth.currentUser;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
      checkWishlist();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await getProductById(id);
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    if (!user) return;
    try {
      const inList = await isInWishlist(user.uid, id);
      setInWishlist(inList);
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!user || !product) return;
    try {
      await addToCart(user.uid, product.id, quantity);
      Alert.alert('Success', 'Added to cart!', [
        { text: 'Continue Shopping', onPress: () => router.back() },
        { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
      ]);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add to cart');
    }
  };

  const handleToggleWishlist = async () => {
    if (!user || !product) return;
    try {
      const isAdded = await toggleWishlist(user.uid, product.id);
      setInWishlist(isAdded);
      Alert.alert('Success', isAdded ? 'Added to wishlist!' : 'Removed from wishlist!');
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={handleToggleWishlist}>
          <Ionicons
            name={inWishlist ? 'heart' : 'heart-outline'}
            size={24}
            color={inWishlist ? '#ff4444' : '#333'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
          {product.stock < 5 && product.stock > 0 && (
            <View style={styles.lowStockBadge}>
              <Text style={styles.lowStockText}>Only {product.stock} left!</Text>
            </View>
          )}
          {product.stock === 0 && (
            <View style={[styles.lowStockBadge, styles.outOfStockBadge]}>
              <Text style={styles.lowStockText}>Out of Stock</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.content}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= product.rating ? 'star' : 'star-outline'}
                  size={20}
                  color="#ffa500"
                />
              ))}
            </View>
            <Text style={styles.rating}>{product.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({product.reviews} reviews)</Text>
          </View>

          {/* Price */}
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Specifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Category:</Text>
              <Text style={styles.specValue}>{product.category}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Brand:</Text>
              <Text style={styles.specValue}>{product.brand}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>In Stock:</Text>
              <Text style={styles.specValue}>{product.stock} units</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      {product.stock > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityButton, quantity === 1 && styles.quantityButtonDisabled]}
              onPress={handleDecrease}
              disabled={quantity === 1}
            >
              <Ionicons name="remove" size={20} color={quantity === 1 ? '#ccc' : '#333'} />
            </TouchableOpacity>

            <Text style={styles.quantity}>{quantity}</Text>

            <TouchableOpacity
              style={[
                styles.quantityButton,
                quantity >= product.stock && styles.quantityButtonDisabled,
              ]}
              onPress={handleIncrease}
              disabled={quantity >= product.stock}
            >
              <Ionicons
                name="add"
                size={20}
                color={quantity >= product.stock ? '#ccc' : '#333'}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Ionicons name="cart-outline" size={20} color="#fff" style={styles.cartIcon} />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerButton: {
    padding: 8,
  },
  imageContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  lowStockBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#ff9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  outOfStockBadge: {
    backgroundColor: '#f44336',
  },
  lowStockText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  brand: {
    fontSize: 14,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
  reviews: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2196f3',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  specLabel: {
    fontSize: 16,
    color: '#666',
  },
  specValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
    marginRight: 12,
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  quantityButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  quantity: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    minWidth: 32,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  cartIcon: {
    marginRight: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});