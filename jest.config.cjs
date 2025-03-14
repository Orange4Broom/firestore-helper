/**
 * Jest configuration for Firestore Helper TS
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { rootMode: 'upward' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(firebase|@firebase)/)'
  ],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  injectGlobals: true,
}; 