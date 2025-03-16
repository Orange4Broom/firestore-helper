import { collection, doc, setDoc } from "firebase/firestore";
import { getFirebaseInstance } from "../firebase";
import { UpdateOptions, Result } from "../../types";
import { getData } from "./getData";
import { listenData } from "./listenData";
import { handleError, reportError, ValidationError } from "../../errors";
import { joinPath } from "../../utils/formatters";

/**
 * Creates a new document in Firestore with either an automatically generated ID or a custom ID
 *
 * @template T - Type of the document data
 * @param {Omit<UpdateOptions, "docId"> & { customId?: string }} options - Options for creating the document
 * @param {string} options.path - Path to the collection where the document will be created
 * @param {Record<string, any>} options.data - Data to store in the document
 * @param {string} [options.customId] - Optional custom ID for the document (if not provided, Firestore will generate one)
 * @param {boolean} [options.silent=false] - If true, the function will not return any data, only the document ID and potential errors (good for use with real-time listeners)
 * @param {boolean} [options.useListener=false] - Whether to return a listener for the document instead of a one-time fetch
 *
 * @returns {Promise<Result<T & { id: string }> | (() => void) | Result<{id: string}>>} Result object containing the created document with its ID, an unsubscribe function if useListener is true, or just Result with ID and error if silent is true
 *
 * @example
 * // Create a new user with automatically generated ID
 * const result = await createData({
 *   path: 'users',
 *   data: {
 *     name: 'John Doe',
 *     email: 'john@example.com'
 *   }
 * });
 *
 * @example
 * // Create a new user with custom ID (e.g., UUID)
 * const result = await createData({
 *   path: 'users',
 *   customId: '123e4567-e89b-12d3-a456-426614174000',
 *   data: {
 *     name: 'John Doe',
 *     email: 'john@example.com'
 *   }
 * });
 *
 * @example
 * // Create in silent mode - good when using with real-time listeners
 * const result = await createData({
 *   path: 'users',
 *   data: {
 *     name: 'John Doe',
 *     email: 'john@example.com'
 *   },
 *   silent: true // Only return the ID, not full document data
 * });
 *
 * @example
 * // Create a new user with real-time updates
 * const unsubscribe = await createData({
 *   path: 'users',
 *   data: {
 *     name: 'John Doe',
 *     email: 'john@example.com'
 *   },
 *   useListener: true,
 *   onNext: (userData) => {
 *     console.log('User data updated:', userData);
 *   }
 * });
 */
export async function createData<
  T extends Record<string, any> = Record<string, any>
>(
  options: Omit<UpdateOptions, "docId"> & {
    customId?: string;
    useListener?: boolean;
    silent?: boolean;
    onNext?: (data: T & { id: string }) => void;
    onError?: (error: Error) => void;
  }
): Promise<Result<T & { id: string }> | (() => void) | Result<{ id: string }>> {
  // Validate required parameters
  if (!options.path) {
    const error = new ValidationError(
      "Path parameter is required for createData"
    );
    reportError(error);
    return { data: null, error, loading: false };
  }

  if (!options.data) {
    const error = new ValidationError(
      "Data parameter is required for createData"
    );
    reportError(error);
    return { data: null, error, loading: false };
  }

  const {
    path,
    data,
    customId,
    useListener = false,
    silent = false,
    onNext,
    onError,
  } = options;

  try {
    const { firestore } = getFirebaseInstance();

    // Create a reference to the collection
    const collectionRef = collection(firestore, path);

    // Create a document reference - either with custom ID or auto-generated
    const newDocRef = customId
      ? doc(firestore, joinPath(path, customId))
      : doc(collectionRef);

    // Set the document data
    await setDoc(newDocRef, data);

    const documentId = newDocRef.id;

    // Silent mode - return only the ID without fetching the full document
    if (silent) {
      return {
        data: { id: documentId } as any,
        error: null,
        loading: false,
      };
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

      return listenData<T & { id: string }>({
        path,
        docId: documentId,
        onNext,
        onError,
      });
    }

    // Otherwise do a one-time fetch
    const result = await getData<T & { id: string }>({
      path,
      docId: documentId,
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
