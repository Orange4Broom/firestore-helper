import { jest } from "@jest/globals";

let mockInstance: { app: any; firestore: any } | null = null;

export const initializeFirebase = jest.fn((config) => {
  mockInstance = {
    app: { name: "test-app", options: config },
    firestore: {},
  };
});

export const getFirebaseInstance = jest.fn(() => {
  if (!mockInstance) {
    throw new Error("Firebase není inicializován");
  }
  return mockInstance;
});

export const resetFirebase = jest.fn(() => {
  mockInstance = null;
});
