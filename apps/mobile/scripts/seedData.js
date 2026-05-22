require('dotenv').config();

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// DEBUG LINES - Check if config loaded
console.log('🔧 Debug: Checking environment variables...');
console.log('Project ID:', firebaseConfig.projectId);
console.log('API Key:', firebaseConfig.apiKey ? 'Loaded ✅' : 'MISSING ❌');
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('');

if (!firebaseConfig.projectId) {
  console.error('❌ ERROR: Firebase config not loaded!');
  console.error('Make sure your .env file is in the correct location.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const products = [
  // PHONES
  {
    name: 'iPhone 15 Pro Max',
    description: 'Latest flagship with A17 Pro chip, titanium design',
    price: 1199,
    category: 'phones',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500',
    stock: 45,
    brand: 'Apple',
    rating: 4.9,
    reviews: 2847,
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Powerful Android flagship with S Pen and 200MP camera',
    price: 1099,
    category: 'phones',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
    stock: 38,
    brand: 'Samsung',
    rating: 4.8,
    reviews: 1923,
  },
  {
    name: 'Google Pixel 8 Pro',
    description: 'Best Android camera with Tensor G3 chip',
    price: 899,
    category: 'phones',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500',
    stock: 52,
    brand: 'Google',
    rating: 4.7,
    reviews: 1456,
  },
  {
    name: 'OnePlus 12',
    description: 'Flagship killer with Snapdragon 8 Gen 3',
    price: 749,
    category: 'phones',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
    stock: 64,
    brand: 'OnePlus',
    rating: 4.6,
    reviews: 892,
  },
  // LAPTOPS
  {
    name: 'MacBook Pro 16" M3 Max',
    description: 'Professional powerhouse with M3 Max chip',
    price: 2499,
    category: 'laptops',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
    stock: 28,
    brand: 'Apple',
    rating: 4.9,
    reviews: 1654,
  },
  {
    name: 'Dell XPS 15',
    description: 'Premium Windows laptop with RTX 4070',
    price: 1899,
    category: 'laptops',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500',
    stock: 35,
    brand: 'Dell',
    rating: 4.7,
    reviews: 1234,
  },
  {
    name: 'Lenovo ThinkPad X1 Carbon',
    description: 'Business ultrabook with legendary keyboard',
    price: 1599,
    category: 'laptops',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500',
    stock: 42,
    brand: 'Lenovo',
    rating: 4.8,
    reviews: 987,
  },
  {
    name: 'ASUS ROG Zephyrus G14',
    description: 'Compact gaming laptop with RTX 4060',
    price: 1399,
    category: 'laptops',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500',
    stock: 31,
    brand: 'ASUS',
    rating: 4.6,
    reviews: 756,
  },
  // TABLETS
  {
    name: 'iPad Pro 12.9" M2',
    description: 'Powerful tablet with M2 chip and ProMotion display',
    price: 1099,
    category: 'tablets',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
    stock: 48,
    brand: 'Apple',
    rating: 4.8,
    reviews: 1876,
  },
  {
    name: 'Samsung Galaxy Tab S9 Ultra',
    description: 'Premium Android tablet with AMOLED display',
    price: 899,
    category: 'tablets',
    image: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=500',
    stock: 39,
    brand: 'Samsung',
    rating: 4.7,
    reviews: 1234,
  },
  {
    name: 'Microsoft Surface Pro 9',
    description: '2-in-1 tablet with Windows 11',
    price: 999,
    category: 'tablets',
    image: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=500',
    stock: 44,
    brand: 'Microsoft',
    rating: 4.5,
    reviews: 892,
  },
  // ACCESSORIES
  {
    name: 'AirPods Pro 2',
    description: 'Premium wireless earbuds with noise cancellation',
    price: 249,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500',
    stock: 156,
    brand: 'Apple',
    rating: 4.8,
    reviews: 5432,
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise-cancelling headphones',
    price: 399,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500',
    stock: 87,
    brand: 'Sony',
    rating: 4.9,
    reviews: 3214,
  },
  {
    name: 'Logitech MX Master 3S',
    description: 'Advanced wireless mouse for professionals',
    price: 99,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
    stock: 234,
    brand: 'Logitech',
    rating: 4.7,
    reviews: 2876,
  },
  {
    name: 'Anker PowerCore 20000mAh',
    description: 'High-capacity portable charger',
    price: 49,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1609592842726-73f84e8c2bb4?w=500',
    stock: 412,
    brand: 'Anker',
    rating: 4.6,
    reviews: 7654,
  },
  {
    name: 'Samsung T7 Portable SSD 1TB',
    description: 'Ultra-fast portable storage with USB-C',
    price: 139,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500',
    stock: 267,
    brand: 'Samsung',
    rating: 4.8,
    reviews: 3456,
  },
];

async function seedProducts() {
  console.log('🌱 Starting to seed products...\n');
  
  try {
    const productsRef = collection(db, 'products');
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const docRef = doc(productsRef);
      
      await setDoc(docRef, {
        ...product,
        createdAt: new Date(),
      });
      
      console.log(`✅ ${i + 1}/${products.length}: ${product.name}`);
    }
    
    console.log('\n🎉 Successfully seeded all products!');
    console.log(`📦 Total: ${products.length} products`);
    console.log('  - Phones: 4');
    console.log('  - Laptops: 4');
    console.log('  - Tablets: 3');
    console.log('  - Accessories: 4');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedProducts();