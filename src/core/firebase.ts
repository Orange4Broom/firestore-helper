import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { FirebaseConfig, FirebaseState } from "../types";

// Global Firebase state
let state: FirebaseState = {
  app: null,
  firestore: null,
  initialized: false,
};

/**
 * Initializes Firebase with configuration
 * @param config - Firebase configuration
 * @returns Firebase and Firestore instance
 */
export function initializeFirebase(config: FirebaseConfig) {
  if (state.initialized) {
    console.warn("Firebase has already been initialized.");
    return { app: state.app, firestore: state.firestore };
  }

  try {
    // Initializing Firebase application
    const app = initializeApp(config);

    // Getting Firestore instance
    const firestore = getFirestore(app);

    // Update state
    state = {
      app,
      firestore,
      initialized: true,
    };

    return { app, firestore };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    throw error;
  }
}

/**
 * Returns the current Firebase and Firestore instance or throws an error if not initialized
 */
export function getFirebaseInstance() {
  if (!state.initialized || !state.app || !state.firestore) {
    throw new Error(
      "Firebase is not initialized. Please call initializeFirebase() first."
    );
  }

  return { app: state.app, firestore: state.firestore };
}

/**
 * Resets the Firebase initialization
 */
export function resetFirebase() {
  state = {
    app: null,
    firestore: null,
    initialized: false,
  };
}
