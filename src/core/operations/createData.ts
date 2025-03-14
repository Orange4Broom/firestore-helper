import { collection, doc, setDoc } from "firebase/firestore";
import { getFirebaseInstance } from "../firebase";
import { UpdateOptions, Result } from "../../types";
import { getData } from "./getData";

/**
 * Creates a new document in Firestore with an automatically generated ID
 *
 * @template T - Type of the document data
 * @param {Omit<UpdateOptions, "docId">} options - Options for creating the document
 * @param {string} options.path - Path to the collection where the document will be created
 * @param {Record<string, any>} options.data - Data to store in the document
 * @param {boolean} [options.refetch=true] - Whether to retrieve the document after creation
 *
 * @returns {Promise<Result<T & { id: string }>>} Result object containing the created document with its ID
 *
 * @example
 * // Create a new user
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
 */
export async function createData<
  T extends Record<string, any> = Record<string, any>
>(options: Omit<UpdateOptions, "docId">): Promise<Result<T & { id: string }>> {
  const { path, data, refetch = true } = options;

  try {
    const { firestore } = getFirebaseInstance();

    // Create a reference to the collection
    const collectionRef = collection(firestore, path);

    // Create a new document with an automatically generated ID
    const newDocRef = doc(collectionRef);
    await setDoc(newDocRef, data);

    if (refetch) {
      const result = await getData<T & { id: string }>({
        path,
        docId: newDocRef.id,
      });

      return result;
    }

    return {
      data: { id: newDocRef.id, ...data } as T & { id: string },
      error: null,
      loading: false,
    };
  } catch (error) {
    console.error("Error creating data:", error);
    return { data: null, error: error as Error, loading: false };
  }
}
