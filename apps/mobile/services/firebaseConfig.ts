import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  indexedDBLocalPersistence,
  initializeAuth,
  Persistence
} from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyActmlgNh2wy6gW5oSniVIa6spR40kaxwA",
  authDomain: "personalproject-a8b06.firebaseapp.com",
  projectId: "personalproject-a8b06",
  storageBucket: "personalproject-a8b06.firebasestorage.app",
  messagingSenderId: "929031390674",
  appId: "1:929031390674:web:ed4e743108fadefa39f40b",
  measurementId: "G-MNM2D77J8W"
};

const app = initializeApp(firebaseConfig);

const persistence: Persistence | Persistence[] = Platform.OS === 'web'
  ? [indexedDBLocalPersistence, browserLocalPersistence]
  : indexedDBLocalPersistence; // fallback for non-web until we fix persistence

export const auth = initializeAuth(app, {
  persistence
});

export default app;