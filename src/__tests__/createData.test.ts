import {
  describe,
  test,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { createData } from "../core/operations/createData";
import { getFirebaseInstance } from "../core/firebase";
import {
  collection,
  doc,
  setDoc,
  DocumentData,
  DocumentReference,
} from "firebase/firestore";
import { Result } from "../types";
import { CacheManager } from "../cache/cacheManager";

// Definice typu pro mock funkce
type MockFunction<T = any> = jest.MockedFunction<(...args: any[]) => T>;

// Mock funkcí a modulu
jest.mock("../core/firebase", () => ({
  getFirebaseInstance: jest.fn(),
}));

jest.mock("../cache/cacheManager", () => ({
  CacheManager: {
    getInstance: jest.fn().mockReturnValue({
      invalidateCollection: jest.fn(),
    }),
  },
}));

jest.mock("firebase/firestore", () => {
  return {
    collection: jest.fn(),
    doc: jest.fn(),
    setDoc: jest.fn().mockImplementation(() => Promise.resolve()),
  };
});

describe("createData Function", () => {
  const mockFirestore = {};
  const mockApp = {};

  beforeEach(() => {
    // Mock návratové hodnoty pro getFirebaseInstance
    (getFirebaseInstance as MockFunction).mockReturnValue({
      app: mockApp,
      firestore: mockFirestore,
      initialized: true,
    });

    // Reset všech mocků
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup všech mocků a timerů
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe("Auto-Generated ID", () => {
    test("should create document with auto-generated ID", async () => {
      const mockDocRef = {
        id: "auto-generated-id",
      } as DocumentReference<DocumentData>;
      (doc as MockFunction).mockReturnValue(mockDocRef);

      const result = await createData({
        path: "test-collection",
        data: { name: "Test Document" },
      });

      expect(doc).toHaveBeenCalledWith(mockFirestore, "test-collection");
      expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
        name: "Test Document",
      });
      expect(result).toEqual({
        data: {
          id: "auto-generated-id",
          name: "Test Document",
        },
        error: null,
        loading: false,
      });
    });

    test("should return document data without refetching if silent is true", async () => {
      const mockDocRef = {
        id: "auto-generated-id",
      } as DocumentReference<DocumentData>;
      (doc as MockFunction).mockReturnValue(mockDocRef);

      const result = await createData({
        path: "test-collection",
        data: { name: "Test Document" },
        silent: true,
      });

      expect(result).toEqual({
        data: null,
        error: null,
        loading: false,
      });
    });
  });

  describe("Custom ID", () => {
    test("should create document with custom ID", async () => {
      const customId = "custom-doc-id";
      const mockDocRef = { id: customId } as DocumentReference<DocumentData>;
      (doc as MockFunction).mockReturnValue(mockDocRef);

      const result = await createData({
        path: "test-collection",
        docId: customId,
        data: { name: "Test Document" },
      });

      expect(doc).toHaveBeenCalledWith(
        mockFirestore,
        "test-collection/custom-doc-id"
      );
      expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
        name: "Test Document",
      });
      expect(result).toEqual({
        data: {
          id: customId,
          name: "Test Document",
        },
        error: null,
        loading: false,
      });
    });

    test("should return null if silent is true", async () => {
      const customId = "custom-doc-id";
      const mockDocRef = { id: customId } as DocumentReference<DocumentData>;
      (doc as MockFunction).mockReturnValue(mockDocRef);

      const result = await createData({
        path: "test-collection",
        docId: customId,
        data: { name: "Test Document" },
        silent: true,
      });

      expect(result).toEqual({
        data: null,
        error: null,
        loading: false,
      });
    });
  });

  describe("Error Handling", () => {
    test("should handle errors and return error object", async () => {
      const mockError = new Error("Test error");
      (setDoc as MockFunction).mockRejectedValueOnce(mockError);

      const result = await createData({
        path: "test-collection",
        data: { name: "Test Document" },
      });

      expect(result).toEqual({
        data: null,
        error: expect.objectContaining({
          message: expect.stringContaining("Test error"),
        }),
        loading: false,
      });
    });

    test("should validate required parameters", async () => {
      const result = await createData({
        path: "", // Invalid path
        data: { name: "Test Document" },
      } as any);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("Path parameter is required");
    });
  });
});
