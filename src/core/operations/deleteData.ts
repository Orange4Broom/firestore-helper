import { doc, deleteDoc } from "firebase/firestore";
import { getFirebaseInstance } from "../firebase";
import { DeleteOptions, Result } from "../../types";
import { getData } from "./getData";
import { listenData } from "./listenData";
import { joinPath } from "../../utils/formatters";
import { handleError, reportError, ValidationError } from "../../errors";

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
export async function deleteData<T = any>(
  options: DeleteOptions & {
    useListener?: boolean;
    onNext?: (data: T) => void;
    onError?: (error: Error) => void;
    silent?: boolean;
  }
): Promise<Result<T> | (() => void) | Result<null>> {
  // Validate required parameters
  if (!options.path) {
    const error = new ValidationError(
      "Path parameter is required for deleteData"
    );
    reportError(error);
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
    if (!docId) {
      const error = new ValidationError("Document ID is required for deletion");
      reportError(error);
      return { data: null, error, loading: false };
    }

    const { firestore } = getFirebaseInstance();

    // Create a reference to the document and delete it
    const docRef = doc(firestore, joinPath(path, docId));
    await deleteDoc(docRef);

    // Silent mode - don't return data, just success/error status
    if (silent) {
      return { data: null, error: null, loading: false };
    }

    // If using a listener, set up real-time updates for the parent collection
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
        onNext,
        onError,
      });
    }

    // Otherwise do a one-time fetch of the parent collection (previous behavior)
    const result = await getData<T>({
      path,
    });

    return result;
  } catch (error) {
    const structuredError = handleError(error);
    reportError(structuredError);

    if (onError && error instanceof Error) {
      onError(error);
    }

    return { data: null, error: structuredError, loading: false };
  }
}
