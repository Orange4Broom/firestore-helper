import { createData } from "../core/operations/createData";
import { getFirebaseInstance } from "../core/firebase";
import { collection, addDoc, doc, setDoc, getDoc } from "firebase/firestore";

// Mock funkcí a modulu
jest.mock("../core/firebase", () => ({
  getFirebaseInstance: jest.fn(),
}));

jest.mock("firebase/firestore");

describe("createData Function", () => {
  const mockFirestore = {};
  const mockApp = {};

  beforeEach(() => {
    // Mock návratové hodnoty pro getFirebaseInstance
    (getFirebaseInstance as jest.Mock).mockReturnValue({
      app: mockApp,
      firestore: mockFirestore,
    });

    // Mock funkcí
    (collection as jest.Mock).mockReturnValue({ id: "test-collection" });
    (doc as jest.Mock).mockReturnValue({ id: "test-doc" });
  });

  describe("Auto-Generated ID", () => {
    test("should create document with auto-generated ID", async () => {
      // Mock addDoc
      (addDoc as jest.Mock).mockResolvedValue({
        id: "auto-generated-id",
      });

      // Mock getDoc pro refetch
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ name: "Test Document" }),
        id: "auto-generated-id",
      });

      // Volání funkce
      const result = await createData({
        path: "test-collection",
        data: { name: "Test Document" },
        refetch: true,
      });

      // Ověření
      expect(collection).toHaveBeenCalledWith(mockFirestore, "test-collection");
      expect(addDoc).toHaveBeenCalledWith(
        { id: "test-collection" },
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
      // Mock addDoc
      (addDoc as jest.Mock).mockResolvedValue({
        id: "auto-generated-id",
      });

      // Volání funkce
      const result = await createData({
        path: "test-collection",
        data: { name: "Test Document" },
        refetch: false,
      });

      // Ověření
      expect(getDoc).not.toHaveBeenCalled();
      expect(result).toEqual({
        data: {
          id: "auto-generated-id",
        },
        error: null,
        loading: false,
      });
    });
  });

  describe("Error Handling", () => {
    test("should handle errors and return error object", async () => {
      const mockError = new Error("Test error");
      (addDoc as jest.Mock).mockRejectedValue(mockError);

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
