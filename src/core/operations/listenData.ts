import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  CollectionReference,
  Query,
  DocumentReference,
  Unsubscribe,
} from "firebase/firestore";
import { getFirebaseInstance } from "../firebase";
import {
  formatDocument,
  formatCollection,
  joinPath,
} from "../../utils/formatters";
import { ListenOptions, WhereFilterOp, OrderByDirection } from "../../types";
import { handleError, reportError, ValidationError } from "../../errors";

/**
 * Sets up a real-time listener for Firestore data changes
 *
 * @template T - Type of the returned data
 * @param {ListenOptions<T>} options - Options for the listener
 * @param {string} options.path - Path to the collection or document
 * @param {string} [options.docId] - Optional document ID if listening to a single document
 * @param {Array<[string, WhereFilterOp, any]>} [options.where] - Optional array of filter conditions in format [field, operator, value]
 * @param {Array<[string, OrderByDirection?]>} [options.orderBy] - Optional array of sort conditions in format [field, direction]
 * @param {number} [options.limit] - Optional maximum number of documents to return
 * @param {Function} options.onNext - Callback function that receives updated data
 * @param {Function} [options.onError] - Optional callback function for handling errors
 *
 * @returns {Unsubscribe} Function to call when you want to stop listening
 *
 * @example
 * // Listen to a single document
 * const unsubscribe = listenData({
 *   path: 'users',
 *   docId: 'user123',
 *   onNext: (userData) => {
 *     console.log('User data updated:', userData);
 *     updateUI(userData);
 *   },
 *   onError: (error) => {
 *     console.error('Error listening to user data:', error);
 *   }
 * });
 *
 * // Later, to stop listening:
 * unsubscribe();
 *
 * @example
 * // Listen to a filtered collection
 * const unsubscribe = listenData({
 *   path: 'users',
 *   where: [['status', '==', 'active']],
 *   orderBy: [['lastActive', 'desc']],
 *   limit: 10,
 *   onNext: (users) => {
 *     console.log('Active users updated:', users);
 *     updateUsersList(users);
 *   }
 * });
 */
export function listenData<T = any>(options: ListenOptions<T>): Unsubscribe {
  // Validate required parameters
  if (!options.path) {
    const error = new ValidationError(
      "Path parameter is required for listenData"
    );
    reportError(error);

    if (options.onError) {
      options.onError(error);
    }

    // Return a no-op unsubscribe function if we couldn't set up the listener
    return () => {};
  }

  if (!options.onNext) {
    const error = new ValidationError(
      "onNext callback is required for listenData"
    );
    reportError(error);

    if (options.onError) {
      options.onError(error);
    }

    // Return a no-op unsubscribe function if we couldn't set up the listener
    return () => {};
  }

  const {
    path,
    docId,
    where: whereOptions,
    orderBy: orderByOptions,
    limit: limitCount,
    onNext,
    onError,
  } = options;

  try {
    const { firestore } = getFirebaseInstance();

    // If document ID is provided, listen to a single document
    if (docId) {
      const docRef: DocumentReference = doc(firestore, joinPath(path, docId));

      return onSnapshot(
        docRef,
        (snapshot) => {
          const data = formatDocument<T>(snapshot);
          // Only call onNext with the data if it exists
          if (data !== null) {
            onNext(data);
          } else {
            // If document doesn't exist, pass an empty object cast to T
            onNext({} as T);
          }
        },
        (error) => {
          const structuredError = handleError(error);
          reportError(structuredError);

          if (onError) {
            onError(error);
          }
        }
      );
    }

    // Otherwise listen to a collection and apply filters
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

    return onSnapshot(
      queryRef,
      (snapshot) => {
        const data = formatCollection<T>(snapshot) as unknown as T;
        onNext(data);
      },
      (error) => {
        const structuredError = handleError(error);
        reportError(structuredError);

        if (onError) {
          onError(error);
        }
      }
    );
  } catch (error) {
    const structuredError = handleError(error);
    reportError(structuredError);

    if (onError && error instanceof Error) {
      onError(error);
    }

    // Return a no-op unsubscribe function if we couldn't set up the listener
    return () => {};
  }
}
