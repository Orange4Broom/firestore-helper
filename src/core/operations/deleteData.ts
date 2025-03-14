import { doc, deleteDoc, DocumentReference } from "firebase/firestore";
import { getFirebaseInstance } from "../firebase";
import { joinPath } from "../../utils/formatters";
import { DeleteOptions, Result } from "../../types";
import { getData } from "./getData";

/**
 * Deletes a document from Firestore
 *
 * @param {DeleteOptions} options - Options for deleting the document
 * @param {string} options.path - Path to the collection containing the document
 * @param {string} [options.docId] - ID of the document to delete; if not provided, the path is assumed to contain the document ID
 * @param {boolean} [options.refetch=true] - Whether to retrieve the parent collection data after deletion
 *
 * @returns {Promise<Result<null>>} Result object indicating success or failure
 *
 * @example
 * // Delete a document by path and ID
 * const result = await deleteData({
 *   path: 'users',
 *   docId: 'user123'
 * });
 *
 * if (!result.error) {
 *   console.log('Document successfully deleted');
 * }
 *
 * @example
 * // Delete a document using a full path
 * const result = await deleteData({
 *   path: 'users/user123',
 *   refetch: false
 * });
 */
export async function deleteData(
  options: DeleteOptions
): Promise<Result<null>> {
  const { path, docId, refetch = true } = options;

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

    // Delete the document
    await deleteDoc(docReference);

    // If refetch is true, try to retrieve updated data
    if (refetch) {
      // Get the parent collection
      const parentPath = path.split("/").slice(0, -1).join("/");

      if (parentPath) {
        return await getData({
          path: parentPath,
        });
      }
    }

    return { data: null, error: null, loading: false };
  } catch (error) {
    console.error("Error deleting data:", error);
    return { data: null, error: error as Error, loading: false };
  }
}
