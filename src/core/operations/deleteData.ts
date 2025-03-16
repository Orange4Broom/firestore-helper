import { doc, deleteDoc } from "firebase/firestore";
import { getFirebaseInstance } from "../firebase";
import { DeleteOptions, Result } from "../../types";
import { getData } from "./getData";
import { listenData } from "./listenData";
import { joinPath } from "../../utils/formatters";
import { handleError, reportError, ValidationError } from "../../errors";
import { createLogger } from "../../logging";
import { CacheManager } from "../../cache/cacheManager";

// Create a logger for this operation
const logger = createLogger("deleteData");

// Get cache manager instance lazily
let cacheInstance: CacheManager | null = null;
const getCache = () => {
  if (!cacheInstance) {
    cacheInstance = CacheManager.getInstance();
  }
  return cacheInstance;
};

/**
 * Deletes a document from Firestore
 *
 * @template T - Type of data returned after deletion (typically the parent collection)
 * @param {DeleteOptions} options - Options for deleting the document
 * @param {string} options.path - Path to the collection containing the document
 * @param {string} options.docId - ID of the document to delete
 * @param {boolean} [options.silent=false] - If true, the function will not return any data, only errors (good for use with real-time listeners)
 * @param {boolean} [options.useListener=false] - Whether to return a listener for the parent collection
 *
 * @returns {Promise<Result<T> | (() => void) | Result<null>>} Result object containing the parent collection after deletion, an unsubscribe function if useListener is true, or just Result with error if silent is true
 *
 * @example
 * // Delete a user with one-time confirmation
 * const result = await deleteData({
 *   path: 'users',
 *   docId: 'user123'
 * });
 *
 * if (!result.error) {
 *   console.log('User deleted successfully');
 * }
 *
 * @example
 * // Delete in silent mode - good when using with real-time listeners
 * const result = await deleteData({
 *   path: 'users',
 *   docId: 'user123',
 *   silent: true // Don't return updated collection, only potential errors
 * });
 *
 * if (!result.error) {
 *   console.log('Deletion successful');
 *   // Your existing listener will automatically receive the update
 * }
 *
 * @example
 * // Delete a user and listen to collection changes
 * const unsubscribe = await deleteData({
 *   path: 'users',
 *   docId: 'user123',
 *   useListener: true,
 *   onNext: (remainingUsers) => {
 *     console.log('Updated users list:', remainingUsers);
 *     updateUsersList(remainingUsers);
 *   }
 * });
 *
 * // Later, when you no longer need updates:
 * unsubscribe();
 */
export async function deleteData<T extends { id: string }>(
  options: DeleteOptions & {
    useListener?: boolean;
    onNext?: (data: T) => void;
    onError?: (error: Error) => void;
    silent?: boolean;
  }
): Promise<Result<T> | (() => void) | Result<null>> {
  logger.debug("Called with options", options);

  // Validate required parameters
  if (!options.path) {
    const error = new ValidationError(
      "Path parameter is required for deleteData"
    );
    reportError(error);
    logger.error("Missing required parameter: path");
    return { data: null, error, loading: false };
  }

  if (!options.docId) {
    const error = new ValidationError(
      "DocId parameter is required for deleteData"
    );
    reportError(error);
    logger.error("Missing required parameter: docId");
    return { data: null, error, loading: false };
  }

  const {
    path,
    docId,
    useListener = false,
    silent = false,
    onNext,
    onError,
  } = options;

  try {
    logger.info(`Deleting document at path: ${path}/${docId}`);
    const { firestore } = getFirebaseInstance();

    // Get document reference
    const docRef = doc(firestore, joinPath(path, docId));

    // Delete the document
    await deleteDoc(docRef);

    // Invalidate both document and collection cache
    getCache().remove(CacheManager.createKey(path, { docId }));
    getCache().invalidateCollection(path);
    logger.debug("Invalidated document and collection cache");

    logger.info("Successfully deleted document");

    // Always return null data as the document no longer exists
    return { data: null, error: null, loading: false };
  } catch (error) {
    // Convert to our structured error format
    logger.error("Error deleting data", error);
    const structuredError = handleError(error);
    reportError(structuredError);

    if (onError && error instanceof Error) {
      onError(error);
    }

    return { data: null, error: structuredError, loading: false };
  }
}
