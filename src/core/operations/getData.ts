import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  CollectionReference,
  Query,
} from "firebase/firestore";
import { getFirebaseInstance } from "../firebase";
import {
  formatDocument,
  formatCollection,
  joinPath,
} from "../../utils/formatters";
import {
  GetOptions,
  Result,
  WhereFilterOp,
  OrderByDirection,
} from "../../types";
import {
  handleError,
  reportError,
  ValidationError,
  NotFoundError,
} from "../../errors";
import { createLogger } from "../../logging";
import { CacheManager } from "../../cache/cacheManager";

// Create a logger for this operation
const logger = createLogger("getData");

// Get cache manager instance lazily
let cacheInstance: CacheManager | null = null;
const getCache = () => {
  if (!cacheInstance) {
    cacheInstance = CacheManager.getInstance();
  }
  return cacheInstance;
};

export interface GetDataOptions extends GetOptions {
  /**
   * Whether to use cache for this request
   * If not specified, uses global cache configuration
   */
  useCache?: boolean;
  /**
   * Time to live for this specific cache entry in milliseconds
   * If not specified, uses global cache configuration
   */
  cacheTTL?: number;
}

/**
 * Retrieves data from Firestore based on specified parameters
 *
 * @template T - Type of the returned data
 * @param {GetDataOptions} options - Options for retrieving data
 * @param {string} options.path - Path to the collection or document
 * @param {string} [options.docId] - Optional document ID if retrieving a single document
 * @param {Array<[string, WhereFilterOp, any]>} [options.where] - Optional array of filter conditions in format [field, operator, value]
 * @param {Array<[string, OrderByDirection?]>} [options.orderBy] - Optional array of sort conditions in format [field, direction]
 * @param {number} [options.limit] - Optional maximum number of documents to return
 * @param {boolean} [options.useCache] - Whether to use cache for this request
 * @param {number} [options.cacheTTL] - Time to live for this specific cache entry
 *
 * @returns {Promise<Result<T>>} Result object containing data, error, and loading status
 *
 * @example
 * // Get a single document with caching
 * const user = await getData({
 *   path: 'users',
 *   docId: 'user123',
 *   useCache: true,
 *   cacheTTL: 60000 // 1 minute
 * });
 *
 * @example
 * // Get a filtered collection with default cache settings
 * const activeUsers = await getData({
 *   path: 'users',
 *   where: [['status', '==', 'active']],
 *   orderBy: [['createdAt', 'desc']],
 *   limit: 10
 * });
 */
export async function getData<T = any>(
  options: GetDataOptions
): Promise<Result<T>> {
  logger.debug("Called with options", options);

  // Validate required parameters
  if (!options.path) {
    const error = new ValidationError("Path parameter is required for getData");
    reportError(error);
    logger.error("Missing required parameter: path");
    return { data: null, error, loading: false };
  }

  const {
    path,
    docId,
    where: whereOptions,
    orderBy: orderByOptions,
    limit: limitCount,
    useCache = true,
    cacheTTL,
  } = options;

  // Create cache key if caching is enabled
  const cacheKey = useCache
    ? CacheManager.createKey(path, {
        docId,
        where: whereOptions,
        orderBy: orderByOptions,
        limit: limitCount,
      })
    : null;

  // Try to get from cache first
  if (cacheKey) {
    const cachedData = getCache().get<T>(cacheKey);
    if (cachedData) {
      logger.debug("Returning cached data");
      return { data: cachedData, error: null, loading: false };
    }
  }

  try {
    logger.info(`Fetching data from path: ${path}${docId ? `/${docId}` : ""}`);
    const { firestore } = getFirebaseInstance();

    // If document ID is provided, get a single document
    if (docId) {
      logger.debug(`Fetching single document with ID: ${docId}`);
      const docRef = doc(firestore, joinPath(path, docId));
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        const error = new NotFoundError(
          `Document not found at path: ${path}/${docId}`
        );
        reportError(error);
        logger.warn(`Document not found at path: ${path}/${docId}`);
        return { data: null, error, loading: false };
      }

      logger.debug("Document found, formatting response");
      const data = formatDocument<T>(snapshot);

      // Cache the result if caching is enabled
      if (cacheKey) {
        if (cacheTTL) {
          getCache().configure({ ttl: cacheTTL });
        }
        getCache().set(cacheKey, data);
      }

      logger.info("Successfully retrieved document");
      return { data, error: null, loading: false };
    }

    // Otherwise get a collection and apply filters
    logger.debug("Fetching collection", {
      whereOptions,
      orderByOptions,
      limitCount,
    });

    let collectionRef: CollectionReference = collection(firestore, path);
    let queryRef: Query = collectionRef;

    // Apply where conditions
    if (whereOptions && whereOptions.length > 0) {
      logger.debug("Applying where filters", whereOptions);
      whereOptions.forEach(([field, op, value]) => {
        queryRef = query(queryRef, where(field, op as WhereFilterOp, value));
      });
    }

    // Apply sorting
    if (orderByOptions && orderByOptions.length > 0) {
      logger.debug("Applying orderBy", orderByOptions);
      orderByOptions.forEach(([field, direction]) => {
        queryRef = query(
          queryRef,
          orderBy(field, direction as OrderByDirection)
        );
      });
    }

    // Apply limit
    if (limitCount) {
      logger.debug(`Applying limit: ${limitCount}`);
      queryRef = query(queryRef, limit(limitCount));
    }

    logger.debug("Executing collection query");
    const snapshot = await getDocs(queryRef);
    logger.debug(`Query returned ${snapshot.size} documents`);
    const data = formatCollection<T>(snapshot) as unknown as T;

    // Cache the result if caching is enabled
    if (cacheKey) {
      if (cacheTTL) {
        getCache().configure({ ttl: cacheTTL });
      }
      getCache().set(cacheKey, data);
    }

    logger.info(
      `Successfully retrieved collection with ${snapshot.size} documents`
    );
    return { data, error: null, loading: false };
  } catch (error) {
    // Convert to our structured error format
    logger.error("Error fetching data", error);
    const structuredError = handleError(error);
    reportError(structuredError);
    return { data: null, error: structuredError, loading: false };
  }
}
