/**
 * Jest setup file for mocking Firebase
 */

// Mock all Firebase services
jest.mock('firebase/firestore', () => {
  return {
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn().mockImplementation((ref) => ref),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    addDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    getFirestore: jest.fn(),
    initializeFirestore: jest.fn(),
    onSnapshot: jest.fn(),
    enableNetwork: jest.fn().mockResolvedValue(undefined),
    disableNetwork: jest.fn().mockResolvedValue(undefined),
    enableIndexedDbPersistence: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock('firebase/app', () => {
  return {
    initializeApp: jest.fn().mockReturnValue({
      name: 'test-app',
      options: {},
    }),
    getApp: jest.fn().mockReturnValue({
      name: 'test-app',
      options: {},
    }),
  };
});

// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
}); 