import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CartItem as CartItemType } from '../types';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  const subtotal = item.product.price * item.quantity;

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (item.quantity < item.product.stock) {
      onUpdateQuantity(item.quantity + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: item.product.image }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.info}>
            <Text style={styles.brand}>{item.product.brand}</Text>
            <Text style={styles.name} numberOfLines={2}>
              {item.product.name}
            </Text>
            <Text style={styles.price}>${item.product.price.toFixed(2)}</Text>
          </View>

          <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
            <Ionicons name="trash-outline" size={20} color="#f44336" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={handleDecrease}
              style={[styles.quantityButton, item.quantity === 1 && styles.quantityButtonDisabled]}
              disabled={item.quantity === 1}
            >
              <Ionicons name="remove" size={20} color={item.quantity === 1 ? '#ccc' : '#333'} />
            </TouchableOpacity>

            <Text style={styles.quantity}>{item.quantity}</Text>

            <TouchableOpacity
              onPress={handleIncrease}
              style={[
                styles.quantityButton,
                item.quantity >= item.product.stock && styles.quantityButtonDisabled,
              ]}
              disabled={item.quantity >= item.product.stock}
            >
              <Ionicons
                name="add"
                size={20}
                color={item.quantity >= item.product.stock ? '#ccc' : '#333'}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtotal}>${subtotal.toFixed(2)}</Text>
        </View>

        {item.quantity >= item.product.stock && (
          <Text style={styles.maxStockText}>Max stock reached</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  info: {
    flex: 1,
  },
  brand: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#2196f3',
    fontWeight: '600',
  },
  removeButton: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  quantityButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  subtotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  maxStockText: {
    fontSize: 12,
    color: '#ff9800',
    marginTop: 4,
  },
});