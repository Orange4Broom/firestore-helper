/**
 * Firestore Helper - Nástroje pro snadnou práci s Firebase Firestore
 */

// Core Firebase functionality
export {
  initializeFirebase as initialize,
  getFirebaseInstance,
  resetFirebase as reset,
} from "./core/firebase";

// Core operations with aliases
export {
  getData as get,
  updateData as update,
  createData as create,
  deleteData as removeDoc,
} from "./core/operations";

// Export listenData separately since it's in its own file
export { listenData as listen } from "./core/operations/listenData";

// Utility functions
export { formatDocument, formatCollection } from "./utils/formatters";

// Error handling
export {
  FirestoreHelperError,
  InitializationError,
  ValidationError,
  QueryError,
  NotFoundError,
  PermissionError,
  NetworkError,
  TimeoutError,
  handleError,
  reportError,
} from "./errors";

// Logging system
export {
  LogLevel,
  configureLogger,
  getLoggerConfig,
  logError,
  logWarn,
  logInfo,
  logDebug,
  createLogger,
} from "./logging";

// Type exports
export type { LoggerConfig, Logger } from "./logging";

export type { CacheConfig } from "./cache/cacheManager";

export type {
  GetOptions,
  UpdateOptions,
  DeleteOptions,
  ListenOptions,
  Result,
  WhereFilterOp,
  OrderByDirection,
} from "./types";

// Cache management
export { CacheManager } from "./cache/cacheManager";

// Main FirestoreHelper object
import { initializeFirebase, resetFirebase } from "./core/firebase";
import { getData, updateData, createData, deleteData } from "./core/operations";
import { listenData } from "./core/operations/listenData";
import { formatDocument, formatCollection } from "./utils/formatters";
import { handleError, reportError } from "./errors";
import { CacheManager } from "./cache/cacheManager";

const FirestoreHelper = {
  initialize: initializeFirebase,
  reset: resetFirebase,
  get: getData,
  update: updateData,
  create: createData,
  removeDoc: deleteData,
  listen: listenData,
  formatDocument,
  formatCollection,
  handleError,
  reportError,
  cache: CacheManager.getInstance(),
};

export default FirestoreHelper;
