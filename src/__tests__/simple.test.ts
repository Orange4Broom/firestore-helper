import { describe, test, expect } from "@jest/globals";
import { joinPath } from "../utils/formatters";

describe("Simple Tests", () => {
  test("joinPath function works correctly", () => {
    expect(joinPath("users", "abc123")).toBe("users/abc123");
    expect(joinPath("users/", "abc123")).toBe("users/abc123");
    expect(joinPath("users", "/abc123")).toBe("users/abc123");
    expect(joinPath("users/", "/abc123")).toBe("users/abc123");
    expect(joinPath("users", "")).toBe("users");
    expect(joinPath("", "abc123")).toBe("abc123");
  });

  test("joinPath handles properly empty path", () => {
    const result = joinPath("", "doc123");
    expect(result).toBe("doc123");
  });
});
