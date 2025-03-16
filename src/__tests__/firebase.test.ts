import { describe, test, expect, jest, afterEach } from "@jest/globals";
import {
  initializeFirebase,
  getFirebaseInstance,
  resetFirebase,
} from "../core/firebase";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Mock moduly
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn().mockReturnValue({ name: "test-app" }),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn().mockReturnValue({ name: "test-firestore" }),
}));

describe("Firebase Core Functions", () => {
  const mockConfig = {
    apiKey: "test-api-key",
    authDomain: "test-domain.firebaseapp.com",
    projectId: "test-project",
  };

  afterEach(() => {
    resetFirebase();
    jest.clearAllMocks();
  });

  test("initializeFirebase should call initializeApp with correct config", () => {
    const result = initializeFirebase(mockConfig);
    expect(initializeApp).toHaveBeenCalledWith(mockConfig);
    expect(getFirestore).toHaveBeenCalled();
    expect(result).toEqual({
      app: { name: "test-app" },
      firestore: { name: "test-firestore" },
    });
  });

  test("getFirebaseInstance should throw error if not initialized", () => {
    expect(() => getFirebaseInstance()).toThrowError(
      "Firebase is not initialized. Please call initializeFirebase() first."
    );
  });

  test("getFirebaseInstance should return firebase instance after initialization", () => {
    initializeFirebase(mockConfig);
    const instance = getFirebaseInstance();
    expect(instance).toBeDefined();
    expect(instance.app).toBeDefined();
    expect(instance.firestore).toBeDefined();
  });

  test("resetFirebase should clear firebase instance", () => {
    initializeFirebase(mockConfig);
    expect(() => getFirebaseInstance()).not.toThrow();
    resetFirebase();
    expect(() => getFirebaseInstance()).toThrowError(
      "Firebase is not initialized. Please call initializeFirebase() first."
    );
  });
});
