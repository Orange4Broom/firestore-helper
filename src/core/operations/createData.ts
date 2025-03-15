import { collection, doc, setDoc } from "firebase/firestore";
import { getFirebaseInstance } from "../firebase";
import { UpdateOptions, Result } from "../../types";
import { getData } from "./getData";
import { listenData } from "./listenData";

/**
 * Creates a new document in Firestore with an automatically generated ID
 *
 * @template T - Type of the document data
 * @param {Omit<UpdateOptions, "docId">} options - Options for creating the document
 * @param {string} options.path - Path to the collection where the document will be created
 * @param {Record<string, any>} options.data - Data to store in the document
 * @param {boolean} [options.silent=false] - If true, the function will not return any data, only the document ID and potential errors (good for use with real-time listeners)
 * @param {boolean} [options.useListener=false] - Whether to return a listener for the document instead of a one-time fetch
 *
 * @returns {Promise<Result<T & { id: string }> | (() => void) | Result<{id: string}>>} Result object containing the created document with its ID, an unsubscribe function if useListener is true, or just Result with ID and error if silent is true
 *
 * @example
 * // Create a new user with one-time data retrieval
 * const result = await createData({
 *   path: 'users',
 *   data: {
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     isActive: true
 *   }
 * });
 *
 * console.log('Created user with ID:', result.data?.id);
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
 * console.log('Created user with ID:', result.data?.id);
 * // Your existing listener will automatically receive the new document
 *
 * @example
 * // Create a new user with real-time updates
 * const unsubscribe = await createData({
 *   path: 'users',
 *   data: {
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     isActive: true
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
export async function createData<
  T extends Record<string, any> = Record<string, any>
>(
  options: Omit<UpdateOptions, "docId"> & {
    useListener?: boolean;
    silent?: boolean;
    onNext?: (data: T & { id: string }) => void;
    onError?: (error: Error) => void;
  }
): Promise<Result<T & { id: string }> | (() => void) | Result<{ id: string }>> {
  const {
    path,
    data,
    useListener = false,
    silent = false,
    onNext,
    onError,
  } = options;

  try {
    const { firestore } = getFirebaseInstance();

    // Create a reference to the collection
    const collectionRef = collection(firestore, path);

    // Create a new document with an automatically generated ID
    const newDocRef = doc(collectionRef);
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
        throw new Error("onNext callback is required when useListener is true");
      }

      return listenData<T & { id: string }>({
        path,
        docId: documentId,
        onNext,
        onError,
      });
    }

    // Otherwise do a one-time fetch (previous behavior)
    const result = await getData<T & { id: string }>({
      path,
      docId: documentId,
    });

    return result;
  } catch (error) {
    console.error("Error creating data:", error);

    if (onError && error instanceof Error) {
      onError(error);
    }

    return { data: null, error: error as Error, loading: false };
  }
}
