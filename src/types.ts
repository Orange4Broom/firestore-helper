import { FirebaseOptions, FirebaseApp } from "firebase/app";
import { Firestore } from "firebase/firestore";

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
 * Options for updating or creating data in Firestore
 * Used by updateData/update function
 */
export interface UpdateOptions {
  /** Path to the collection or document in Firestore */
  path: string;
  /** Document ID when updating a document in a collection */
  docId?: string;
  /** Data to update or create in the document */
  data: Record<string, any>;
  /** Whether to merge with existing data (true) or overwrite the document (false) */
  merge?: boolean;
  /** Whether to automatically retrieve updated data after successful update */
  refetch?: boolean;
}

/**
 * Options for deleting data from Firestore
 * Used by deleteData/removeDoc function
 */
export interface DeleteOptions {
  /** Path to the collection or document in Firestore */
  path: string;
  /** Document ID when deleting a document in a collection */
  docId?: string;
  /** Whether to automatically retrieve parent collection data after successful deletion */
  refetch?: boolean;
}

/**
 * Filter operators for Firestore queries
 * Matches the operators supported by Firestore
 */
export type WhereFilterOp =
  | "<"
  | "<="
  | "=="
  | "!="
  | ">="
  | ">"
  | "array-contains"
  | "array-contains-any"
  | "in"
  | "not-in";

/**
 * Sort direction for Firestore queries
 * "asc" for ascending, "desc" for descending
 */
export type OrderByDirection = "asc" | "desc";

/**
 * Standard result object returned by all operations
 * Contains the data, any error, and loading status
 *
 * @template T - Type of the data returned
 */
export interface Result<T = any> {
  /** The retrieved, created, or updated data (null if operation failed) */
  data: T | null;
  /** Error object if the operation failed (null on success) */
  error: Error | null;
  /** Whether the operation is still in progress */
  loading: boolean;
}
