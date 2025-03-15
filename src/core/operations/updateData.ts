import { doc, setDoc, collection, updateDoc } from "firebase/firestore";
import { getFirebaseInstance } from "../firebase";
import { UpdateOptions, Result } from "../../types";
import { getData } from "./getData";
import { listenData } from "./listenData";
import { joinPath } from "../../utils/formatters";
import { handleError, reportError, ValidationError } from "../../errors";

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
export async function updateData<T = any>(
  options: UpdateOptions & {
    useListener?: boolean;
    onNext?: (data: T) => void;
    onError?: (error: Error) => void;
    silent?: boolean;
  }
): Promise<Result<T> | (() => void) | Result<null>> {
  // Validate required parameters
  if (!options.path) {
    const error = new ValidationError(
      "Path parameter is required for updateData"
    );
    reportError(error);
    return { data: null, error, loading: false };
  }

  if (!options.data) {
    const error = new ValidationError(
      "Data parameter is required for updateData"
    );
    reportError(error);
    return { data: null, error, loading: false };
  }

  const {
    path,
    docId,
    data,
    merge = true,
    useListener = false,
    silent = false,
    onNext,
    onError,
  } = options;

  try {
    const { firestore } = getFirebaseInstance();

    // If docId is provided, we're updating a specific document in a collection
    if (docId) {
      const docRef = doc(firestore, joinPath(path, docId));

      if (merge) {
        await updateDoc(docRef, data);
      } else {
        await setDoc(docRef, data);
      }

      // Silent mode - don't return data, just success/error status
      if (silent) {
        return { data: null, error: null, loading: false };
      }

      // If using a listener, set up real-time updates
      if (useListener) {
        if (!onNext) {
          const error = new ValidationError(
            "onNext callback is required when useListener is true"
          );
          reportError(error);
          return { data: null, error, loading: false };
        }

        return listenData<T>({
          path,
          docId,
          onNext,
          onError,
        });
      }

      // Otherwise do a one-time fetch (previous behavior)
      const result = await getData<T>({
        path,
        docId,
      });

      return result;
    } else {
      // If no docId, we're updating a document at the direct path
      const docRef = doc(firestore, path);

      if (merge) {
        await updateDoc(docRef, data);
      } else {
        await setDoc(docRef, data);
      }

      // Silent mode - don't return data, just success/error status
      if (silent) {
        return { data: null, error: null, loading: false };
      }

      // If using a listener, set up real-time updates
      if (useListener) {
        if (!onNext) {
          const error = new ValidationError(
            "onNext callback is required when useListener is true"
          );
          reportError(error);
          return { data: null, error, loading: false };
        }

        const pathParts = path.split("/");
        const documentPath = pathParts.slice(0, -1).join("/");
        const documentId = pathParts[pathParts.length - 1];

        return listenData<T>({
          path: documentPath,
          docId: documentId,
          onNext,
          onError,
        });
      }

      // Otherwise do a one-time fetch (previous behavior)
      const result = await getData<T>({
        path,
      });

      return result;
    }
  } catch (error) {
    const structuredError = handleError(error);
    reportError(structuredError);

    if (onError && error instanceof Error) {
      onError(error);
    }

    return { data: null, error: structuredError, loading: false };
  }
}
