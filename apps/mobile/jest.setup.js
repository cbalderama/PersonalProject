/* global jest */

// Mock Firebase
jest.mock('./services/firebaseConfig', () => ({
  auth: {},
  db: {},
}));

// Mock Expo modules
jest.mock('expo-font');
jest.mock('expo-asset');