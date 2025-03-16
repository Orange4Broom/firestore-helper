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
  Firestore,
} from "firebase/firestore";
import { getFirebaseInstance } from "../firebase";
import {
  formatDocument,
  formatCollection,
  joinPath,
} from "../../utils/formatters";
import { ListenOptions, WhereFilterOp, OrderByDirection } from "../../types";
import { handleError, reportError, ValidationError } from "../../errors";
import { CacheManager } from "../../cache/cacheManager";
import { createLogger } from "../../logging";

const logger = createLogger("listenData");

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
export const listenData = <T extends { id: string }>(
  options: ListenOptions<T>
): Unsubscribe => {
  const {
    path,
    docId,
    onNext,
    onError,
    where: whereOptions,
    orderBy: orderByOptions,
    limit: limitCount,
  } = options;

  try {
    logger.debug("Starting listener with options:", options);
    const { firestore } = getFirebaseInstance();
    const cache = CacheManager.getInstance();

    if (docId) {
      // Listen to a single document
      const docRef = doc(firestore, path, docId);

      logger.debug("Setting up document snapshot listener");
      return onSnapshot(
        docRef,
        (snapshot) => {
          try {
            const data = snapshot.exists()
              ? ({ id: snapshot.id, ...snapshot.data() } as T)
              : null;

            // Invalidate cache for this path
            logger.debug("Invalidating cache for path:", path);
            cache.invalidateByPath(path);

            // Call callback with updated data
            logger.debug("Calling onNext with updated data");
            onNext(data);
          } catch (error) {
            logger.error("Error processing document snapshot:", error);
            if (onError) {
              onError(handleError(error));
            }
          }
        },
        (error) => {
          logger.error("Document listener error:", error);
          if (onError) {
            onError(handleError(error));
          }
        }
      );
    } else {
      // Listen to a collection
      let queryRef: Query = collection(firestore, path);

      // Apply where conditions
      if (whereOptions && whereOptions.length > 0) {
        whereOptions.forEach(([field, op, value]) => {
          queryRef = query(queryRef, where(field, op, value));
        });
      }

      // Apply sorting
      if (orderByOptions && orderByOptions.length > 0) {
        orderByOptions.forEach(([field, direction]) => {
          queryRef = query(queryRef, orderBy(field, direction));
        });
      }

      // Apply limit
      if (limitCount) {
        queryRef = query(queryRef, limit(limitCount));
      }

      logger.debug("Setting up collection snapshot listener");
      return onSnapshot(
        queryRef,
        (snapshot) => {
          try {
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as T[];

            // Invalidate cache for this path
            logger.debug("Invalidating cache for path:", path);
            cache.invalidateByPath(path);

            // Call callback with updated data
            logger.debug("Calling onNext with updated data");
            onNext(data);
          } catch (error) {
            logger.error("Error processing collection snapshot:", error);
            if (onError) {
              onError(handleError(error));
            }
          }
        },
        (error) => {
          logger.error("Collection listener error:", error);
          if (onError) {
            onError(handleError(error));
          }
        }
      );
    }
  } catch (error) {
    logger.error("Error setting up listener:", error);
    if (onError) {
      onError(handleError(error));
    }
    // Return a no-op unsubscribe function if we couldn't set up the listener
    return () => {};
  }
};
