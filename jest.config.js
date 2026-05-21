module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/apps/mobile/jest.setup.js'],
  testMatch: ['**/apps/mobile/**/__tests__/**/*.test.ts?(x)'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@expo|expo|@firebase|firebase)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/mobile/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['lcov', 'text'],
  collectCoverageFrom: [
    'apps/mobile/app/**/*.{ts,tsx}',
    'apps/mobile/components/**/*.{ts,tsx}',
    'apps/mobile/services/**/*.{ts,tsx}',
    '!**/__tests__/**',
    '!**/*.test.{ts,tsx}',
    '!**/node_modules/**',
  ],
};