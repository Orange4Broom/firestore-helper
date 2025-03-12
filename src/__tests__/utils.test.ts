import {
  formatDocument,
  formatCollection,
  joinPath,
} from "../utils/formatters";
import {
  DocumentSnapshot,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";

// Pomocné typy pro testy
type MockDocumentSnapshot = Partial<DocumentSnapshot<DocumentData>> & {
  exists: jest.Mock;
  data: jest.Mock;
  id: string;
};

type MockQuerySnapshot = Partial<QuerySnapshot<DocumentData>> & {
  docs: MockDocumentSnapshot[];
  empty: boolean;
  size: number;
};

describe("Formatter Utilities", () => {
  describe("joinPath", () => {
    test("should join path segments correctly", () => {
      expect(joinPath("users", "abc123")).toBe("users/abc123");
      expect(joinPath("users/", "abc123")).toBe("users/abc123");
      expect(joinPath("users", "/abc123")).toBe("users/abc123");
      expect(joinPath("users/", "/abc123")).toBe("users/abc123");
    });

    test("should handle empty segments", () => {
      expect(joinPath("users", "")).toBe("users");
      expect(joinPath("", "abc123")).toBe("abc123");
    });
  });

  describe("formatDocument", () => {
    test("should format existing document correctly", () => {
      const mockSnapshot = {
        exists: jest.fn().mockReturnValue(true),
        data: jest.fn().mockReturnValue({ name: "Test", value: 42 }),
        id: "doc-id",
      } as unknown as DocumentSnapshot<DocumentData>;

      const result = formatDocument(mockSnapshot);
      expect(result).toEqual({
        id: "doc-id",
        name: "Test",
        value: 42,
      });
    });

    test("should return null for non-existent document", () => {
      const mockSnapshot = {
        exists: jest.fn().mockReturnValue(false),
        data: jest.fn(),
        id: "doc-id",
      } as unknown as DocumentSnapshot<DocumentData>;

      const result = formatDocument(mockSnapshot);
      expect(result).toBeNull();
    });
  });

  describe("formatCollection", () => {
    test("should format collection of documents correctly", () => {
      const mockDocs = [
        {
          exists: jest.fn().mockReturnValue(true),
          data: jest.fn().mockReturnValue({ name: "Item 1" }),
          id: "item-1",
        } as unknown as DocumentSnapshot<DocumentData>,
        {
          exists: jest.fn().mockReturnValue(true),
          data: jest.fn().mockReturnValue({ name: "Item 2" }),
          id: "item-2",
        } as unknown as DocumentSnapshot<DocumentData>,
      ];
      const mockSnapshot = {
        docs: mockDocs,
        empty: false,
        size: 2,
      } as unknown as QuerySnapshot<DocumentData>;

      const result = formatCollection(mockSnapshot);
      expect(result).toEqual([
        { id: "item-1", name: "Item 1" },
        { id: "item-2", name: "Item 2" },
      ]);
    });

    test("should return empty array for empty collection", () => {
      const mockSnapshot = {
        docs: [],
        empty: true,
        size: 0,
      } as unknown as QuerySnapshot<DocumentData>;

      const result = formatCollection(mockSnapshot);
      expect(result).toEqual([]);
    });
  });
});
