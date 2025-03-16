import {
  describe,
  test,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { CacheManager } from "../cache/cacheManager";

describe("CacheManager", () => {
  let customCache: CacheManager;

  beforeEach(() => {
    // Reset singleton instance before each test
    (CacheManager as any).instance = null;
    customCache = CacheManager.getInstance();
  });

  afterEach(() => {
    // Cleanup timers and cache instance
    if (customCache) {
      customCache.destroy();
    }
    jest.useRealTimers();
  });

  describe("Configuration", () => {
    test("should respect maxSize configuration", () => {
      customCache = CacheManager.getInstance({
        maxSize: 2,
        ttl: 60000, // 1 minute
      });

      customCache.set("key1", "value1");
      customCache.set("key2", "value2");

      // Access key1 to make it most recently used
      expect(customCache.get("key1")).toBe("value1");

      // Now set key3, which should remove key2 (least recently used)
      customCache.set("key3", "value3");

      expect(customCache.get("key2")).toBeNull(); // key2 should be removed (LRU)
      expect(customCache.get("key1")).toBe("value1"); // key1 should still exist
      expect(customCache.get("key3")).toBe("value3"); // key3 should exist
      expect(customCache.getStats().size).toBe(2);
    });

    test("should respect TTL configuration", () => {
      jest.useFakeTimers();

      customCache = CacheManager.getInstance({
        ttl: 1000, // 1 second
        maxSize: 100,
      });

      customCache.set("key1", "value1");
      expect(customCache.get("key1")).toBe("value1");

      // Advance time by 2 seconds
      jest.advanceTimersByTime(2000);

      expect(customCache.get("key1")).toBeNull();
    });

    test("should disable cache when enabled is false", () => {
      customCache = CacheManager.getInstance({
        enabled: false,
        maxSize: 100,
        ttl: 60000,
      });

      customCache.set("key1", "value1");
      expect(customCache.get("key1")).toBeNull();
    });

    test("should update configuration", () => {
      customCache.configure({ enabled: false });
      expect(customCache.getStats().config.enabled).toBe(false);

      customCache.configure({ maxSize: 200 });
      expect(customCache.getStats().config.maxSize).toBe(200);
    });
  });

  describe("Cache Operations", () => {
    beforeEach(() => {
      customCache = CacheManager.getInstance({
        maxSize: 100,
        ttl: 60000,
      });
    });

    test("should store and retrieve items", () => {
      customCache.set("key1", "value1");
      expect(customCache.get("key1")).toBe("value1");
    });

    test("should remove items", () => {
      customCache.set("key1", "value1");
      customCache.remove("key1");
      expect(customCache.get("key1")).toBeNull();
    });

    test("should clear all items", () => {
      customCache.set("key1", "value1");
      customCache.set("key2", "value2");
      customCache.clear();
      expect(customCache.getStats().size).toBe(0);
    });

    test("should create consistent cache keys", () => {
      const key1 = CacheManager.createKey("users", { id: "123", sort: "asc" });
      const key2 = CacheManager.createKey("users", { sort: "asc", id: "123" });
      expect(key1).toBe(key2);
    });

    test("should invalidate by path", () => {
      customCache.set("users:123", { id: "123", name: "John" });
      customCache.set("users:456", { id: "456", name: "Jane" });
      customCache.set("posts:789", { id: "789", title: "Test" });

      customCache.invalidateByPath("users");

      expect(customCache.get("users:123")).toBeNull();
      expect(customCache.get("users:456")).toBeNull();
      expect(customCache.get("posts:789")).not.toBeNull();
    });
  });
});
