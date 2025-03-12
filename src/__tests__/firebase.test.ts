import {
  initializeFirebase,
  getFirebaseInstance,
  resetFirebase,
} from "../core/firebase";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

jest.mock("firebase/app");
jest.mock("firebase/firestore");

describe("Firebase Core Functions", () => {
  const mockConfig = {
    apiKey: "test-api-key",
    authDomain: "test-domain.firebaseapp.com",
    projectId: "test-project",
  };

  afterEach(() => {
    resetFirebase();
  });

  test("initializeFirebase should call initializeApp with correct config", () => {
    initializeFirebase(mockConfig);
    expect(initializeApp).toHaveBeenCalledWith(mockConfig);
    expect(getFirestore).toHaveBeenCalled();
  });

  test("getFirebaseInstance should throw error if not initialized", () => {
    expect(() => getFirebaseInstance()).toThrowError(
      "Firebase není inicializován"
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
      "Firebase není inicializován"
    );
  });
});
