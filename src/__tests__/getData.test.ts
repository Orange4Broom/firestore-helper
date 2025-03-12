import { getData } from "../core/operations/getData";
import { getFirebaseInstance } from "../core/firebase";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

// Mock funkcí a modulu
jest.mock("../core/firebase", () => ({
  getFirebaseInstance: jest.fn(),
}));

jest.mock("firebase/firestore");

describe("getData Function", () => {
  const mockFirestore = {};
  const mockApp = {};

  beforeEach(() => {
    // Mock návratové hodnoty pro getFirebaseInstance
    (getFirebaseInstance as jest.Mock).mockReturnValue({
      app: mockApp,
      firestore: mockFirestore,
    });

    // Mock funkce pro práci s dokumenty
    (doc as jest.Mock).mockReturnValue({ id: "test-doc" });
    (collection as jest.Mock).mockReturnValue({ id: "test-collection" });
    (query as jest.Mock).mockImplementation((ref) => ref);
  });

  describe("Single Document Fetching", () => {
    test("should fetch a single document when docId is provided", async () => {
      // Mock snapshot
      const mockSnapshot = {
        exists: jest.fn().mockReturnValue(true),
        data: jest.fn().mockReturnValue({ name: "Test Document" }),
        id: "test-doc",
      };
      (getDoc as jest.Mock).mockResolvedValue(mockSnapshot);

      // Volání funkce
      const result = await getData({
        path: "test-collection",
        docId: "test-doc",
      });

      // Ověření
      expect(doc).toHaveBeenCalledWith(
        mockFirestore,
        "test-collection/test-doc"
      );
      expect(getDoc).toHaveBeenCalledWith({ id: "test-doc" });
      expect(result).toEqual({
        data: { id: "test-doc", name: "Test Document" },
        error: null,
        loading: false,
      });
    });

    test("should return null data when document does not exist", async () => {
      // Mock snapshot pro neexistující dokument
      const mockSnapshot = {
        exists: jest.fn().mockReturnValue(false),
        data: jest.fn().mockReturnValue(null),
        id: "test-doc",
      };
      (getDoc as jest.Mock).mockResolvedValue(mockSnapshot);

      // Volání funkce
      const result = await getData({
        path: "test-collection",
        docId: "test-doc",
      });

      // Ověření
      expect(result).toEqual({
        data: null,
        error: null,
        loading: false,
      });
    });
  });

  describe("Collection Fetching", () => {
    test("should fetch a collection with filters, ordering and limits", async () => {
      // Mock collection snapshot
      const mockDocs = [
        {
          exists: jest.fn().mockReturnValue(true),
          data: jest.fn().mockReturnValue({ name: "Item 1" }),
          id: "item-1",
        },
        {
          exists: jest.fn().mockReturnValue(true),
          data: jest.fn().mockReturnValue({ name: "Item 2" }),
          id: "item-2",
        },
      ];
      const mockSnapshot = {
        docs: mockDocs,
        empty: false,
        size: 2,
      };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      // Volání funkce s filtry
      const result = await getData({
        path: "test-collection",
        where: [["category", "==", "test"]],
        orderBy: [["createdAt", "desc"]],
        limit: 10,
      });

      // Ověření
      expect(collection).toHaveBeenCalledWith(mockFirestore, "test-collection");
      expect(where).toHaveBeenCalledWith("category", "==", "test");
      expect(orderBy).toHaveBeenCalledWith("createdAt", "desc");
      expect(limit).toHaveBeenCalledWith(10);
      expect(result.data).toEqual([
        { id: "item-1", name: "Item 1" },
        { id: "item-2", name: "Item 2" },
      ]);
    });
  });

  describe("Error Handling", () => {
    test("should handle errors and return error object", async () => {
      const mockError = new Error("Test error");
      (getDoc as jest.Mock).mockRejectedValue(mockError);

      // Volání funkce
      const result = await getData({
        path: "test-collection",
        docId: "test-doc",
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
