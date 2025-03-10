/**
 * Type definitions for firestore-helper
 */

import { FirebaseOptions } from "firebase/app";
import { DocumentSnapshot, QuerySnapshot } from "firebase/firestore";

// Exported types
export type FirebaseConfig = FirebaseOptions;

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

export type OrderByDirection = "asc" | "desc";

export interface FirebaseState {
  app: any;
  firestore: any;
  initialized: boolean;
}

export interface GetOptions {
  path: string;
  docId?: string;
  where?: Array<[string, WhereFilterOp, any]>;
  orderBy?: Array<[string, OrderByDirection?]>;
  limit?: number;
}

export interface UpdateOptions {
  path: string;
  docId?: string;
  data: Record<string, any>;
  merge?: boolean;
  refetch?: boolean;
}

export interface DeleteOptions {
  path: string;
  docId?: string;
  refetch?: boolean;
}

export interface Result<T = any> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

// Function declarations - Original names
export function initializeFirebase(config: FirebaseConfig): {
  app: any;
  firestore: any;
};
export function resetFirebase(): void;
export function getFirebaseInstance(): { app: any; firestore: any };
export function getData<T = any>(options: GetOptions): Promise<Result<T>>;
export function updateData<T = any>(options: UpdateOptions): Promise<Result<T>>;
export function createData<T extends Record<string, any> = Record<string, any>>(
  options: Omit<UpdateOptions, "docId">
): Promise<Result<T & { id: string }>>;
export function deleteData(options: DeleteOptions): Promise<Result<null>>;
export function formatDocument<T = Record<string, any>>(
  doc: DocumentSnapshot
): T | null;
export function formatCollection<T = Record<string, any>>(
  snapshot: QuerySnapshot
): T[];

// Function declarations - Aliased names
export function initialize(config: FirebaseConfig): {
  app: any;
  firestore: any;
};
export function reset(): void;
export function get<T = any>(options: GetOptions): Promise<Result<T>>;
export function update<T = any>(options: UpdateOptions): Promise<Result<T>>;
export function create<T extends Record<string, any> = Record<string, any>>(
  options: Omit<UpdateOptions, "docId">
): Promise<Result<T & { id: string }>>;
export function removeDoc(options: DeleteOptions): Promise<Result<null>>;

// Default export
declare const FirestoreHelper: {
  initialize: typeof initialize;
  reset: typeof reset;
  get: typeof get;
  update: typeof update;
  create: typeof create;
  delete: typeof deleteData;
  formatDocument: typeof formatDocument;
  formatCollection: typeof formatCollection;
};

export default FirestoreHelper;
