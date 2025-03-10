import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { FirebaseConfig, FirebaseState } from "../types";

// Globální stav Firebase
let state: FirebaseState = {
  app: null,
  firestore: null,
  initialized: false,
};

/**
 * Inicializuje Firebase s konfigurací
 * @param config - Konfigurace Firebase
 * @returns Firebase a Firestore instance
 */
export function initializeFirebase(config: FirebaseConfig) {
  if (state.initialized) {
    console.warn(
      "Firebase již byl inicializován. Pro reinicializaci volejte resetFirebase()."
    );
    return { app: state.app, firestore: state.firestore };
  }

  try {
    // Inicializace Firebase aplikace
    const app = initializeApp(config);

    // Získání Firestore instance
    const firestore = getFirestore(app);

    // Aktualizace stavu
    state = {
      app,
      firestore,
      initialized: true,
    };

    return { app, firestore };
  } catch (error) {
    console.error("Chyba při inicializaci Firebase:", error);
    throw error;
  }
}

/**
 * Vrátí aktuální Firebase a Firestore instance nebo vyhodí chybu, pokud nejsou inicializovány
 */
export function getFirebaseInstance() {
  if (!state.initialized || !state.app || !state.firestore) {
    throw new Error(
      "Firebase není inicializován. Nejprve zavolejte initializeFirebase()."
    );
  }

  return { app: state.app, firestore: state.firestore };
}

/**
 * Resetuje Firebase inicializaci
 */
export function resetFirebase() {
  state = {
    app: null,
    firestore: null,
    initialized: false,
  };
}
