import { doc, setDoc, updateDoc, DocumentReference } from "firebase/firestore";
import { getFirebaseInstance } from "../firebase";
import { joinPath } from "../../utils/formatters";
import { UpdateOptions, Result } from "../../types";
import { getData } from "./getData";

/**
 * Updates or creates a document in Firestore
 *
 * @template T - Type of the returned document data
 * @param {UpdateOptions} options - Options for updating the document
 * @param {string} options.path - Path to the collection containing the document
 * @param {string} options.docId - ID of the document to update
 * @param {Record<string, any>} options.data - Data to update in the document
 * @param {boolean} [options.merge=true] - Whether to merge data with existing document (true) or overwrite it (false)
 * @param {boolean} [options.refetch=true] - Whether to retrieve the updated document after update
 *
 * @returns {Promise<Result<T>>} Result object containing the updated document data
 *
 * @example
 * // Update user data with merge
 * const result = await updateData({
 *   path: 'users',
 *   docId: 'user123',
 *   data: {
 *     lastLogin: new Date(),
 *     loginCount: 5
 *   },
 *   merge: true  // Default, will only update these fields
 * });
 *
 * @example
 * // Replace document entirely (no merge)
 * const result = await updateData({
 *   path: 'settings',
 *   docId: 'user123',
 *   data: { theme: 'dark', notifications: false },
 *   merge: false  // Will replace the entire document
 * });
 */
export async function updateData<T = any>(
  options: UpdateOptions
): Promise<Result<T>> {
  const { path, docId, data, merge = true, refetch = true } = options;

  try {
    const { firestore } = getFirebaseInstance();

    let docReference: DocumentReference;

    // Create a reference to the document
    if (docId) {
      docReference = doc(firestore, joinPath(path, docId));
    } else {
      // If no docId is provided, assume the path already contains the document ID
      docReference = doc(firestore, path);
    }

    // Update the document
    if (merge) {
      await updateDoc(docReference, data);
    } else {
      await setDoc(docReference, data);
    }

    // If refetch is true, retrieve the updated data
    if (refetch) {
      return await getData<T>({
        path,
        docId: docId || docReference.id,
      });
    }

    return { data: null, error: null, loading: false };
  } catch (error) {
    console.error("Error updating data:", error);
    return { data: null, error: error as Error, loading: false };
  }
}
