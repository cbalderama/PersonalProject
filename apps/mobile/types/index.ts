// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'phones' | 'laptops' | 'accessories' | 'tablets';
  image: string;
  stock: number;
  brand: string;
  rating: number;
  reviews: number;
}

// Cart types
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  addedAt: Date;
}

// Wishlist types
export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: Date;
}

// Order types
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

// User profile types
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  defaultAddress?: ShippingAddress;
  createdAt: Date;
}

// Filter types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  search?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest';
}