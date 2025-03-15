import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  CollectionReference,
  Query,
} from "firebase/firestore";
import { getFirebaseInstance } from "../firebase";
import {
  formatDocument,
  formatCollection,
  joinPath,
} from "../../utils/formatters";
import {
  GetOptions,
  Result,
  WhereFilterOp,
  OrderByDirection,
} from "../../types";
import {
  handleError,
  reportError,
  ValidationError,
  NotFoundError,
} from "../../errors";

/**
 * Retrieves data from Firestore based on specified parameters
 *
 * @template T - Type of the returned data
 * @param {GetOptions} options - Options for retrieving data
 * @param {string} options.path - Path to the collection or document
 * @param {string} [options.docId] - Optional document ID if retrieving a single document
 * @param {Array<[string, WhereFilterOp, any]>} [options.where] - Optional array of filter conditions in format [field, operator, value]
 * @param {Array<[string, OrderByDirection?]>} [options.orderBy] - Optional array of sort conditions in format [field, direction]
 * @param {number} [options.limit] - Optional maximum number of documents to return
 *
 * @returns {Promise<Result<T>>} Result object containing data, error, and loading status
 *
 * @example
 * // Get a single document
 * const user = await getData({ path: 'users', docId: 'user123' });
 *
 * @example
 * // Get a filtered collection
 * const activeUsers = await getData({
 *   path: 'users',
 *   where: [['status', '==', 'active']],
 *   orderBy: [['createdAt', 'desc']],
 *   limit: 10
 * });
 */
export async function getData<T = any>(
  options: GetOptions
): Promise<Result<T>> {
  // Validate required parameters
  if (!options.path) {
    const error = new ValidationError("Path parameter is required for getData");
    reportError(error);
    return { data: null, error, loading: false };
  }

  const {
    path,
    docId,
    where: whereOptions,
    orderBy: orderByOptions,
    limit: limitCount,
  } = options;

  try {
    const { firestore } = getFirebaseInstance();

    // If document ID is provided, get a single document
    if (docId) {
      const docRef = doc(firestore, joinPath(path, docId));
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        const error = new NotFoundError(
          `Document not found at path: ${path}/${docId}`
        );
        reportError(error);
        return { data: null, error, loading: false };
      }

      const data = formatDocument<T>(snapshot);
      return { data, error: null, loading: false };
    }

    // Otherwise get a collection and apply filters
    let collectionRef: CollectionReference = collection(firestore, path);
    let queryRef: Query = collectionRef;

    // Apply where conditions
    if (whereOptions && whereOptions.length > 0) {
      whereOptions.forEach(([field, op, value]) => {
        queryRef = query(queryRef, where(field, op as WhereFilterOp, value));
      });
    }

    // Apply sorting
    if (orderByOptions && orderByOptions.length > 0) {
      orderByOptions.forEach(([field, direction]) => {
        queryRef = query(
          queryRef,
          orderBy(field, direction as OrderByDirection)
        );
      });
    }

    // Apply limit
    if (limitCount) {
      queryRef = query(queryRef, limit(limitCount));
    }

    const snapshot = await getDocs(queryRef);
    const data = formatCollection<T>(snapshot) as unknown as T;

    return { data, error: null, loading: false };
  } catch (error) {
    // Convert to our structured error format
    const structuredError = handleError(error);
    reportError(structuredError);
    return { data: null, error: structuredError, loading: false };
  }
}
