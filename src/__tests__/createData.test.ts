import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import { createData } from "../core/operations/createData";
import { getFirebaseInstance } from "../core/firebase";
import { collection, addDoc, doc, setDoc, getDoc } from "firebase/firestore";

// Mock funkcí a modulu
jest.mock("../core/firebase", () => ({
  getFirebaseInstance: jest.fn(),
}));

jest.mock("../core/operations/getData", () => ({
  getData: jest.fn().mockImplementation(async ({ path, docId }) => {
    return {
      data: { id: docId, name: "Test Document" },
      error: null,
      loading: false,
    };
  }),
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn().mockReturnValue({ id: "test-collection" }),
  doc: jest.fn().mockReturnValue({ id: "auto-generated-id" }),
  setDoc: jest.fn().mockResolvedValue(undefined),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
}));

describe("createData Function", () => {
  const mockFirestore = {};
  const mockApp = {};

  beforeEach(() => {
    // Mock návratové hodnoty pro getFirebaseInstance
    (getFirebaseInstance as jest.Mock).mockReturnValue({
      app: mockApp,
      firestore: mockFirestore,
    });

    jest.clearAllMocks();
  });

  describe("Auto-Generated ID", () => {
    test("should create document with auto-generated ID", async () => {
      // Volání funkce
      const result = await createData({
        path: "test-collection",
        data: { name: "Test Document" },
        refetch: true,
      });

      // Ověření
      expect(collection).toHaveBeenCalledWith(mockFirestore, "test-collection");
      expect(doc).toHaveBeenCalledWith({ id: "test-collection" });
      expect(setDoc).toHaveBeenCalledWith(
        { id: "auto-generated-id" },
        { name: "Test Document" }
      );
      expect(result).toEqual({
        data: {
          id: "auto-generated-id",
          name: "Test Document",
        },
        error: null,
        loading: false,
      });
    });

    test("should return document ID without refetching if refetch is false", async () => {
      // Volání funkce
      const result = await createData({
        path: "test-collection",
        data: { name: "Test Document" },
        refetch: false,
      });

      // Ověření
      expect(result).toEqual({
        data: {
          id: "auto-generated-id",
          name: "Test Document",
        },
        error: null,
        loading: false,
      });
    });
  });

  describe("Error Handling", () => {
    test("should handle errors and return error object", async () => {
      const mockError = new Error("Test error");
      (setDoc as jest.Mock).mockRejectedValueOnce(mockError);

      // Volání funkce
      const result = await createData({
        path: "test-collection",
        data: { name: "Test Document" },
      });

      // Ověření
      expect(result).toEqual({
        data: null,
        error: mockError,
        loading: false,
      });
    });
  });
});
