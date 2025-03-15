/**
 * Firestore Helper - Nástroje pro snadnou práci s Firebase Firestore
 */

// Re-exporty s jednoduššími názvy
export {
  initializeFirebase as initialize,
  getFirebaseInstance,
  resetFirebase as reset,
} from "./core/firebase";

// Import listenData directly from its file
import { listenData } from "./core/operations/listenData";

// Přímý export funkcí pro práci s Firestore
export { getData, updateData, createData, deleteData } from "./core/operations";

// Export listenData directly
export { listenData };

// Alias exporty pro kompatibilitu a přehlednost
export {
  getData as get,
  updateData as update,
  createData as create,
  // Pro lepší kompatibilitu s TypeScript a ESM používáme removeDoc místo delete (které je rezervované klíčové slovo)
  deleteData as removeDoc,
} from "./core/operations";

// Export listen as an alias for listenData
export const listen = listenData;

export { formatDocument, formatCollection } from "./utils/formatters";

// Export custom error types and utilities
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

// Export logging system
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

// Export logging types
export type { LoggerConfig, Logger } from "./logging";

// Exportujeme typy
export * from "./types";

// Importy pro objekt FirestoreHelper
import { initializeFirebase, resetFirebase } from "./core/firebase";
import { getData, updateData, createData, deleteData } from "./core/operations";
import { formatDocument, formatCollection } from "./utils/formatters";
import { handleError, reportError } from "./errors";

// Objekt pro kompatibilitu
const FirestoreHelper = {
  initialize: initializeFirebase,
  reset: resetFirebase,
  get: getData,
  update: updateData,
  create: createData,
  delete: deleteData,
  // Stejná funkce pod alternativním názvem pro snazší použití
  removeDoc: deleteData,
  listen: listenData,
  formatDocument,
  formatCollection,
  // Error handling utilities
  handleError,
  reportError,
};

// Hlavní export
export default FirestoreHelper;
