import { LogLevel, createLogger } from "../logging";

const logger = createLogger("cacheManager");

export interface CacheConfig {
  /**
   * Maximum time to live for cached items in milliseconds
   * Default: 5 minutes
   */
  ttl?: number;
  /**
   * Maximum number of items in cache
   * Default: 100
   */
  maxSize?: number;
  /**
   * Whether to enable cache
   * Default: true
   */
  enabled?: boolean;
  /**
   * Interval for automatic cleanup of expired items in milliseconds
   * Default: 1 minute
   */
  cleanupInterval?: number;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  lastAccessed: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheItem<any>>;
  private config: Required<CacheConfig>;
  private cleanupTimer: NodeJS.Timeout | null;

  private constructor(config: CacheConfig = {}) {
    this.cache = new Map();
    this.config = {
      ttl: config.ttl ?? 5 * 60 * 1000, // 5 minutes default
      maxSize: config.maxSize ?? 100,
      enabled: config.enabled ?? true,
      cleanupInterval: config.cleanupInterval ?? 60 * 1000, // 1 minute default
    };
    this.cleanupTimer = null;
    this.startCleanupTimer();
  }

  /**
   * Get singleton instance of CacheManager
   */
  public static getInstance(config?: CacheConfig): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(config);
    } else if (config) {
      CacheManager.instance.configure(config);
    }
    return CacheManager.instance;
  }

  /**
   * Set cache configuration
   */
  public configure(config: CacheConfig): void {
    this.config = {
      ...this.config,
      ...config,
    };
    logger.info("Cache configuration updated", this.config);

    // Restart cleanup timer if interval changed
    if (config.cleanupInterval) {
      this.startCleanupTimer();
    }
  }

  /**
   * Get item from cache
   */
  public get<T>(key: string): T | null {
    if (!this.config.enabled) {
      return null;
    }

    const item = this.cache.get(key);
    if (!item) {
      logger.debug(`Cache miss for key: ${key}`);
      return null;
    }

    // Check if item is expired
    if (this.isExpired(item)) {
      logger.debug(`Cache item expired for key: ${key}`);
      this.cache.delete(key);
      return null;
    }

    // Update last accessed time (LRU)
    const now = Date.now();
    item.lastAccessed = now;
    this.cache.set(key, item);

    logger.debug(`Cache hit for key: ${key}`);
    return item.data;
  }

  /**
   * Set item in cache
   */
  public set<T>(key: string, data: T): void {
    if (!this.config.enabled) {
      return;
    }

    // If cache is full, remove least recently used item
    if (this.cache.size >= this.config.maxSize) {
      this.removeLRU();
    }

    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      lastAccessed: now,
    });
    logger.debug(`Cached item with key: ${key}`);
  }

  /**
   * Check if key exists in cache and is not expired
   */
  public has(key: string): boolean {
    if (!this.config.enabled) return false;

    const item = this.cache.get(key);
    if (!item) return false;

    if (this.isExpired(item)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove item from cache
   */
  public remove(key: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      logger.debug(`Removed item from cache with key: ${key}`);
    }
  }

  /**
   * Clear entire cache
   */
  public clear(): void {
    this.cache.clear();
    logger.info("Cache cleared");
  }

  /**
   * Get cache statistics
   */
  public getStats(): {
    size: number;
    config: Required<CacheConfig>;
    oldestItem: number;
    newestItem: number;
  } {
    let oldestTimestamp = Date.now();
    let newestTimestamp = 0;

    this.cache.forEach((item) => {
      oldestTimestamp = Math.min(oldestTimestamp, item.timestamp);
      newestTimestamp = Math.max(newestTimestamp, item.timestamp);
    });

    return {
      size: this.cache.size,
      config: this.config,
      oldestItem: oldestTimestamp,
      newestItem: newestTimestamp,
    };
  }

  /**
   * Create cache key from query parameters
   */
  public static createKey(
    path: string,
    options: Record<string, any> = {}
  ): string {
    const sortedOptions = Object.keys(options)
      .sort()
      .reduce((acc, key) => {
        if (options[key] !== undefined) {
          acc[key] = options[key];
        }
        return acc;
      }, {} as Record<string, any>);

    return `${path}:${JSON.stringify(sortedOptions)}`;
  }

  /**
   * Invalidates all cache entries that match the given path
   */
  public invalidateByPath(path: string): void {
    if (!this.config.enabled) return;

    const keysToRemove = Array.from(this.cache.keys()).filter((key) => {
      const [cachePath] = key.split(":");
      return cachePath === path || cachePath.startsWith(`${path}/`);
    });

    keysToRemove.forEach((key) => {
      this.cache.delete(key);
      logger.debug(`Invalidated cache for key: ${key}`);
    });

    logger.info(
      `Invalidated ${keysToRemove.length} cache entries for path: ${path}`
    );
  }

  /**
   * Invalidates all cache entries in a collection and its subcollections
   */
  public invalidateCollection(collectionPath: string): void {
    if (!this.config.enabled) return;

    const keysToRemove = Array.from(this.cache.keys()).filter(
      (key) =>
        key.startsWith(`${collectionPath}:`) ||
        key.startsWith(`${collectionPath}/`)
    );

    keysToRemove.forEach((key) => {
      this.cache.delete(key);
      logger.debug(`Invalidated cache for key: ${key}`);
    });

    logger.info(
      `Invalidated ${keysToRemove.length} cache entries for collection: ${collectionPath}`
    );
  }

  /**
   * Remove least recently used item from cache
   */
  private removeLRU(): void {
    if (this.cache.size === 0) return;

    let lruKey: string | undefined;
    let lruTime = Date.now();

    // Najdeme nejstarší položku podle lastAccessed
    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed <= lruTime) {
        lruTime = item.lastAccessed;
        lruKey = key;
      }
    }

    // Smažeme nejstarší položku
    if (lruKey) {
      this.cache.delete(lruKey);
      logger.debug(`Removed LRU item with key: ${lruKey}`);
    }
  }

  /**
   * Check if cache item is expired
   */
  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > this.config.ttl;
  }

  /**
   * Start cleanup timer for expired items
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      if (!this.config.enabled) return;

      const now = Date.now();
      let removedCount = 0;

      for (const [key, item] of this.cache.entries()) {
        if (now - item.timestamp > this.config.ttl) {
          this.cache.delete(key);
          removedCount++;
        }
      }

      if (removedCount > 0) {
        logger.debug(`Cleaned up ${removedCount} expired items`);
      }
    }, this.config.cleanupInterval);
  }

  /**
   * Stop cleanup timer
   */
  public stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Destroy the cache instance
   */
  public destroy(): void {
    this.stopCleanupTimer();
    this.cache.clear();
    CacheManager.instance = null as any;
  }
}
