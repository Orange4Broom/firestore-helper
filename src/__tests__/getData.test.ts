import { jest } from "@jest/globals";
import { getData } from "../core/operations/getData";
import { getFirebaseInstance } from "../core/firebase";
import { CacheManager } from "../cache/cacheManager";
import {
  DocumentData,
  DocumentSnapshot,
  QuerySnapshot,
  collection,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import type { GetDataOptions } from "../core/operations/getData";
import { NotFoundError } from "../errors";

// Mock Firebase
jest.mock("../core/firebase");
jest.mock("firebase/firestore");

// Create mock functions first
const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  configure: jest.fn(),
};

// Define the type for our mocked module
type MockedCacheManager = {
  CacheManager: {
    getInstance: jest.Mock;
    createKey: jest.Mock;
  };
};

// Mock CacheManager using a factory function
jest.mock("../cache/cacheManager", () => {
  const mockCreateKey = jest.fn(
    (path, options) => `${path}:${JSON.stringify(options)}`
  );
  return {
    CacheManager: {
      getInstance: jest.fn(() => mockCache),
      createKey: mockCreateKey,
    },
  };
});

// Get the mocked createKey function with proper typing
const mockCreateKey = (
  jest.requireMock("../cache/cacheManager") as MockedCacheManager
).CacheManager.createKey;

describe("getData Function", () => {
  const mockFirestore = {};
  const mockDoc = {
    exists: jest.fn(() => true),
    data: jest.fn(() => ({ name: "Test Document" })),
    id: "test-doc",
  } as unknown as DocumentSnapshot<DocumentData>;

  const mockCollectionData = [
    {
      id: "doc1",
      exists: jest.fn(() => true),
      data: jest.fn(() => ({ name: "Document 1" })),
    },
    {
      id: "doc2",
      exists: jest.fn(() => true),
      data: jest.fn(() => ({ name: "Document 2" })),
    },
  ] as unknown as DocumentSnapshot<DocumentData>[];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Firebase mocks
    (getFirebaseInstance as jest.Mock).mockReturnValue({
      firestore: mockFirestore,
    });
    (doc as jest.Mock).mockReturnValue(mockDoc);
    (getDoc as jest.Mock).mockImplementation(() => Promise.resolve(mockDoc));
    (collection as jest.Mock).mockReturnValue({ id: "test-collection" });
    (getDocs as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        docs: mockCollectionData,
        empty: false,
        size: mockCollectionData.length,
      } as QuerySnapshot<DocumentData>)
    );

    // Reset cache mock
    mockCache.get.mockReset();
    mockCache.set.mockReset();
    mockCache.configure.mockReset();
    mockCreateKey.mockReset();
    mockCreateKey.mockImplementation(
      (path, options) => `${path}:${JSON.stringify(options)}`
    );
  });

  describe("Single Document", () => {
    test("should get document from Firestore", async () => {
      mockCache.get.mockReturnValue(null);

      const result = await getData({
        path: "test-collection",
        docId: "test-doc",
      });

      expect(doc).toHaveBeenCalledWith(
        mockFirestore,
        "test-collection/test-doc"
      );
      expect(getDoc).toHaveBeenCalledWith(mockDoc);
      expect(result).toEqual({
        data: {
          id: "test-doc",
          name: "Test Document",
        },
        error: null,
        loading: false,
      });
    });

    test("should return error for non-existent document", async () => {
      const nonExistentDoc = {
        exists: jest.fn(() => false),
        id: "test-doc",
      } as unknown as DocumentSnapshot<DocumentData>;

      (getDoc as jest.Mock).mockImplementation(() =>
        Promise.resolve(nonExistentDoc)
      );

      const result = await getData({
        path: "test-collection",
        docId: "test-doc",
      });

      expect(result.error).toBeInstanceOf(NotFoundError);
      expect(result.error?.message).toContain("Document not found");
    });

    test("should use cache for repeated requests", async () => {
      const cachedData = { id: "test-doc", name: "Test Document" };
      mockCache.get.mockReturnValueOnce(null).mockReturnValueOnce(cachedData);

      // First request - should hit Firestore
      await getData({
        path: "test-collection",
        docId: "test-doc",
      });

      // Second request - should use cache
      const result = await getData({
        path: "test-collection",
        docId: "test-doc",
      });

      expect(getDoc).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual(cachedData);
    });

    test("should bypass cache when useCache is false", async () => {
      await getData({
        path: "test-collection",
        docId: "test-doc",
        useCache: false,
      });

      await getData({
        path: "test-collection",
        docId: "test-doc",
        useCache: false,
      });

      expect(mockCache.get).not.toHaveBeenCalled();
      expect(getDoc).toHaveBeenCalledTimes(2);
    });

    test("should respect custom TTL", async () => {
      jest.useFakeTimers();

      mockCache.get.mockReturnValue(null);

      await getData({
        path: "test-collection",
        docId: "test-doc",
        cacheTTL: 1000, // 1 second
      });

      expect(mockCache.configure).toHaveBeenCalledWith({ ttl: 1000 });
      expect(mockCache.set).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });

  describe("Collection", () => {
    test("should get collection from Firestore", async () => {
      mockCache.get.mockReturnValue(null);

      const result = await getData({
        path: "test-collection",
      });

      expect(collection).toHaveBeenCalledWith(mockFirestore, "test-collection");
      expect(getDocs).toHaveBeenCalled();
      expect(result).toEqual({
        data: [
          { id: "doc1", name: "Document 1" },
          { id: "doc2", name: "Document 2" },
        ],
        error: null,
        loading: false,
      });
    });

    test("should use cache for repeated collection requests", async () => {
      const cachedData = [
        { id: "doc1", name: "Document 1" },
        { id: "doc2", name: "Document 2" },
      ];
      mockCache.get.mockReturnValueOnce(null).mockReturnValueOnce(cachedData);

      // First request - should hit Firestore
      await getData({
        path: "test-collection",
      });

      // Second request - should use cache
      const result = await getData({
        path: "test-collection",
      });

      expect(getDocs).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual(cachedData);
    });
  });

  describe("Error Handling", () => {
    test("should handle errors and return error object", async () => {
      const testError = new Error("Test error");
      (getDoc as jest.Mock).mockImplementation(() => Promise.reject(testError));

      const result = await getData({
        path: "test-collection",
        docId: "test-doc",
      });

      expect(result).toEqual({
        data: null,
        error: expect.objectContaining({
          message: expect.stringContaining("Test error"),
        }),
        loading: false,
      });
    });
  });
});
