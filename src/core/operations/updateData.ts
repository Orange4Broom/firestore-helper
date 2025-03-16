import {
  doc,
  setDoc,
  collection,
  updateDoc,
  DocumentData,
} from "firebase/firestore";
import { getFirebaseInstance } from "../firebase";
import { UpdateOptions, Result } from "../../types";
import { getData } from "./getData";
import { listenData } from "./listenData";
import { joinPath } from "../../utils/formatters";
import { handleError, reportError, ValidationError } from "../../errors";
import { createLogger } from "../../logging";
import { CacheManager } from "../../cache/cacheManager";

// Create a logger for this operation
const logger = createLogger("updateData");

// Get cache manager instance lazily
let cacheInstance: CacheManager | null = null;
const getCache = () => {
  if (!cacheInstance) {
    cacheInstance = CacheManager.getInstance();
  }
  return cacheInstance;
};

/**
 * Updates an existing document or collection in Firestore
 *
 * @template T - Type of the document data
 * @param {UpdateOptions} options - Options for updating the document
 * @param {string} options.path - Path to the collection or document to update
 * @param {string} [options.docId] - Document ID if updating a document in a collection
 * @param {Record<string, any>} options.data - Data to update in the document
 * @param {boolean} [options.merge=true] - Whether to merge with existing data (true) or overwrite the document (false)
 * @param {boolean} [options.silent=false] - If true, the function will not return any data, only errors (good for use with real-time listeners)
 * @param {boolean} [options.useListener=false] - Whether to return a listener for the document instead of a one-time fetch
 *
 * @returns {Promise<Result<T> | (() => void) | Result<null>>} Result object containing the updated document, an unsubscribe function if useListener is true, or just Result with error if silent is true
 *
 * @example
 * // Update a user's status with one-time data retrieval
 * const result = await updateData({
 *   path: 'users',
 *   docId: 'user123',
 *   data: {
 *     isActive: false,
 *     lastLogin: new Date()
 *   }
 * });
 *
 * if (!result.error) {
 *   console.log('User updated successfully');
 * }
 *
 * @example
 * // Update in silent mode - good when using with real-time listeners
 * const result = await updateData({
 *   path: 'users',
 *   docId: 'user123',
 *   data: {
 *     name: 'New Name'
 *   },
 *   silent: true // Don't return updated data, only potential errors
 * });
 *
 * if (!result.error) {
 *   console.log('Update successful');
 *   // Your existing listener will automatically receive the update
 * }
 *
 * @example
 * // Update a user's status with real-time updates
 * const unsubscribe = await updateData({
 *   path: 'users',
 *   docId: 'user123',
 *   data: {
 *     isActive: false,
 *     lastLogin: new Date()
 *   },
 *   useListener: true,
 *   onNext: (userData) => {
 *     console.log('User data updated:', userData);
 *   }
 * });
 *
 * // Later, when you no longer need updates:
 * unsubscribe();
 */
export async function updateData<T extends { id: string }>(
  options: UpdateOptions<T>
): Promise<Result<T>> {
  logger.debug("Called with options", options);

  // Validate required parameters
  if (!options.path) {
    const error = new ValidationError(
      "Path parameter is required for updateData"
    );
    reportError(error);
    logger.error("Missing required parameter: path");
    return { data: null, error, loading: false };
  }

  if (!options.docId) {
    const error = new ValidationError(
      "DocId parameter is required for updateData"
    );
    reportError(error);
    logger.error("Missing required parameter: docId");
    return { data: null, error, loading: false };
  }

  if (!options.data) {
    const error = new ValidationError(
      "Data parameter is required for updateData"
    );
    reportError(error);
    logger.error("Missing required parameter: data");
    return { data: null, error, loading: false };
  }

  const { path, docId, data, merge = true, silent } = options;

  try {
    logger.info(`Updating document at path: ${path}/${docId}`);
    const { firestore } = getFirebaseInstance();

    // Get document reference
    const docRef = doc(firestore, joinPath(path, docId));

    // Update or set the document
    if (merge) {
      await updateDoc(docRef, data as DocumentData);
    } else {
      await setDoc(docRef, data as DocumentData);
    }

    // Format response data
    const updatedData = {
      ...data,
      id: docId,
    } as T;

    // Invalidate both document and collection cache
    getCache().remove(CacheManager.createKey(path, { docId }));
    getCache().invalidateCollection(path);
    logger.debug("Invalidated document and collection cache");

    logger.info("Successfully updated document");

    // If silent mode is enabled, return minimal response
    if (silent) {
      return { data: null, error: null, loading: false };
    }

    return { data: updatedData, error: null, loading: false };
  } catch (error) {
    // Convert to our structured error format
    logger.error("Error updating data", error);
    const structuredError = handleError(error);
    reportError(structuredError);
    return { data: null, error: structuredError, loading: false };
  }
}
