import { doc, setDoc } from "firebase/firestore";
import { getFirebaseInstance } from "../firebase";
import { formatDocument, joinPath } from "../../utils/formatters";
import { CreateOptions, Result } from "../../types";
import { handleError, reportError, ValidationError } from "../../errors";
import { createLogger } from "../../logging";
import { CacheManager } from "../../cache/cacheManager";

// Create a logger for this operation
const logger = createLogger("createData");

// Get cache manager instance lazily
let cacheInstance: CacheManager | null = null;
const getCache = () => {
  if (!cacheInstance) {
    cacheInstance = CacheManager.getInstance();
  }
  return cacheInstance;
};

/**
 * Creates a new document in Firestore
 *
 * @template T - Type of the data to create
 * @param {CreateOptions<T>} options - Options for creating data
 * @returns {Promise<Result<T>>} Result object containing created data, error, and loading status
 *
 * @example
 * // Create a document with auto-generated ID
 * const result = await createData({
 *   path: 'users',
 *   data: { name: 'John Doe', age: 30 }
 * });
 *
 * @example
 * // Create a document with specific ID
 * const result = await createData({
 *   path: 'users',
 *   docId: 'user123',
 *   data: { name: 'John Doe', age: 30 }
 * });
 */
export async function createData<T extends object>(
  options: CreateOptions<T>
): Promise<Result<T>> {
  logger.debug("Called with options", options);

  // Validate required parameters
  if (!options.path) {
    const error = new ValidationError(
      "Path parameter is required for createData"
    );
    reportError(error);
    logger.error("Missing required parameter: path");
    return { data: null, error, loading: false };
  }

  if (!options.data) {
    const error = new ValidationError(
      "Data parameter is required for createData"
    );
    reportError(error);
    logger.error("Missing required parameter: data");
    return { data: null, error, loading: false };
  }

  const { path, docId, data, silent } = options;

  try {
    logger.info(
      `Creating document at path: ${path}${docId ? `/${docId}` : ""}`
    );
    const { firestore } = getFirebaseInstance();

    // Create document reference (with or without ID)
    const docRef = docId
      ? doc(firestore, joinPath(path, docId))
      : doc(firestore, path);

    // Add document to Firestore
    await setDoc(docRef, data);

    // Format response data
    const createdData = {
      ...data,
      id: docRef.id,
    } as T;

    // Invalidate collection cache
    getCache().invalidateCollection(path);
    logger.debug("Invalidated collection cache");

    logger.info("Successfully created document");

    // If silent mode is enabled, return minimal response
    if (silent) {
      return { data: null, error: null, loading: false };
    }

    return { data: createdData, error: null, loading: false };
  } catch (error) {
    // Convert to our structured error format
    logger.error("Error creating data", error);
    const structuredError = handleError(error);
    reportError(structuredError);
    return { data: null, error: structuredError, loading: false };
  }
}
