import { FirebaseOptions, FirebaseApp } from "firebase/app";
import { Firestore, WhereFilterOp, OrderByDirection } from "firebase/firestore";
import { FirestoreHelperError } from "./errors";

// Re-export types from firebase/firestore
export type { WhereFilterOp, OrderByDirection };

/**
 * Firebase configuration options
 * Extends FirebaseOptions from the Firebase SDK
 */
export type FirebaseConfig = FirebaseOptions;

/**
 * Current state of the Firebase instance
 * Tracks initialization status and available services
 */
export interface FirebaseState {
  /** Firebase app instance */
  app: FirebaseApp | null;
  /** Firestore database instance */
  firestore: Firestore | null;
  /** Whether Firebase has been initialized */
  initialized: boolean;
}

/**
 * Options for retrieving data from Firestore
 * Used by getData/get function
 */
export interface GetOptions {
  /** Path to the collection or document in Firestore */
  path: string;
  /** Optional document ID when retrieving a single document from a collection */
  docId?: string;
  /** Optional array of filter conditions in format [field, operator, value] */
  where?: Array<[string, WhereFilterOp, any]>;
  /** Optional array of sort conditions in format [field, direction] */
  orderBy?: Array<[string, OrderByDirection?]>;
  /** Optional maximum number of documents to return */
  limit?: number;
}

/**
 * Options for creating data in Firestore
 * Used by createData/create function
 */
export interface CreateOptions<T> {
  /** Path to the collection in Firestore */
  path: string;
  /** Optional document ID (will be auto-generated if not provided) */
  docId?: string;
  /** Data to create in the document */
  data: T;
  /**
   * Silent mode - if true, the function will not return data, only potential errors
   * This is ideal for use with real-time listeners where you don't need to refetch data
   * after creation because the existing listener will automatically receive updates.
   */
  silent?: boolean;
}

/**
 * Options for updating data in Firestore
 * Used by updateData/update function
 */
export interface UpdateOptions<T> {
  /** Path to the collection in Firestore */
  path: string;
  /** Document ID of the document to update */
  docId: string;
  /** Data to update in the document */
  data: Partial<T>;
  /** Whether to merge with existing data (true) or overwrite the document (false) */
  merge?: boolean;
  /**
   * Silent mode - if true, the function will not return data, only potential errors
   * This is ideal for use with real-time listeners where you don't need to refetch data
   * after updates because the existing listener will automatically receive updates.
   */
  silent?: boolean;
}

/**
 * Options for deleting data from Firestore
 * Used by deleteData/remove function
 */
export interface DeleteOptions {
  /** Path to the collection in Firestore */
  path: string;
  /** Document ID of the document to delete */
  docId: string;
  /**
   * Silent mode - if true, the function will not return data, only potential errors
   * This is ideal for use with real-time listeners where you don't need to refetch data
   * after deletion because the existing listener will automatically receive updates.
   */
  silent?: boolean;
}

/**
 * Options for listening to data changes in Firestore
 * Used by listenData/listen function
 */
export interface ListenOptions<T = any> extends GetOptions {
  /** Callback function called when data changes */
  onNext: (data: T | T[] | null) => void;
  /** Callback function called when an error occurs */
  onError?: (error: Error) => void;
}

/**
 * Standard result object returned by all operations
 * Contains the data, any error, and loading status
 */
export interface Result<T = any> {
  /** The retrieved, created, or updated data (null if operation failed) */
  data: T | null;
  /** Error object if the operation failed (null on success) */
  error: FirestoreHelperError | null;
  /** Whether the operation is still in progress */
  loading: boolean;
}
