/**
 * Firestore Helper - Nástroje pro snadnou práci s Firebase Firestore
 */

// Re-exporty s jednoduššími názvy
export {
  initializeFirebase as initialize,
  getFirebaseInstance,
  resetFirebase as reset,
} from "./core/firebase";

export {
  getData as get,
  updateData as update,
  createData as create,
  deleteData as delete,
  // Pro lepší kompatibilitu s TypeScript a ESM
  deleteData as removeDoc,
} from "./core/operations";

export { formatDocument, formatCollection } from "./utils/formatters";

// Exportujeme typy
export * from "./types";

// Importy pro objekt FirestoreHelper
import { initializeFirebase, resetFirebase } from "./core/firebase";
import { getData, updateData, createData, deleteData } from "./core/operations";
import { formatDocument, formatCollection } from "./utils/formatters";

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
  formatDocument,
  formatCollection,
};

// Pro lepší kompatibilitu se staršími verzemi a různými importovacími systémy
// Pokud někdo importuje jako require('firestore-helper').initialize
// Kvůli ESM a CommonJS kompatibilitě
export {
  initializeFirebase,
  resetFirebase,
  getData,
  updateData,
  createData,
  deleteData,
};

// Hlavní export
export default FirestoreHelper;
