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
  listen: listenData,
  formatDocument,
  formatCollection,
};

// Hlavní export
export default FirestoreHelper;
