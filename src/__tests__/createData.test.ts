import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import { createData } from "../core/operations/createData";
import { getFirebaseInstance } from "../core/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { Result } from "../types";

// Mock funkcí a modulu
jest.mock("../core/firebase", () => ({
  getFirebaseInstance: jest.fn(),
}));

jest.mock("../core/operations/getData", () => ({
  getData: jest.fn().mockImplementation(async (options: unknown) => {
    const { docId } = options as { path: string; docId: string };
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
  setDoc: jest.fn().mockResolvedValue(void 0),
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
      const result = await createData({
        path: "test-collection",
        data: { name: "Test Document" },
      });

      if ("data" in result) {
        expect(collection).toHaveBeenCalledWith(
          mockFirestore,
          "test-collection"
        );
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
      }
    });

    test("should return document data without refetching if silent is true", async () => {
      const result = await createData({
        path: "test-collection",
        data: { name: "Test Document" },
        silent: true,
      });

      if ("data" in result) {
        expect(result).toEqual({
          data: {
            id: "auto-generated-id",
          },
          error: null,
          loading: false,
        });
      }
    });
  });

  describe("Custom ID", () => {
    test("should create document with custom ID", async () => {
      const customId = "custom-doc-id";
      (doc as jest.Mock).mockReturnValueOnce({ id: customId });

      const result = await createData({
        path: "test-collection",
        data: { name: "Test Document" },
        customId,
      });

      if ("data" in result) {
        expect(doc).toHaveBeenCalledWith(
          mockFirestore,
          "test-collection/custom-doc-id"
        );
        expect(setDoc).toHaveBeenCalledWith(
          { id: customId },
          { name: "Test Document" }
        );
        expect(result).toEqual({
          data: {
            id: customId,
            name: "Test Document",
          },
          error: null,
          loading: false,
        });
      }
    });

    test("should return custom ID without refetching if silent is true", async () => {
      const customId = "custom-doc-id";
      (doc as jest.Mock).mockReturnValueOnce({ id: customId });

      const result = await createData({
        path: "test-collection",
        data: { name: "Test Document" },
        customId,
        silent: true,
      });

      if ("data" in result) {
        expect(result).toEqual({
          data: {
            id: customId,
          },
          error: null,
          loading: false,
        });
      }
    });
  });

  describe("Error Handling", () => {
    test("should handle errors and return error object", async () => {
      const mockError = new Error("Test error");
      (setDoc as jest.Mock).mockRejectedValueOnce(mockError);

      const result = await createData({
        path: "test-collection",
        data: { name: "Test Document" },
      });

      if ("error" in result && result.error) {
        expect(result).toEqual({
          data: null,
          error: expect.objectContaining({
            message: expect.stringContaining("Test error"),
          }),
          loading: false,
        });
      }
    });

    test("should validate required parameters", async () => {
      const result = await createData({
        path: "", // Invalid path
        data: { name: "Test Document" },
      });

      if ("error" in result && result.error) {
        expect(result.error).toBeDefined();
        expect(result.error.message).toContain("Path parameter is required");
      }
    });
  });
});
