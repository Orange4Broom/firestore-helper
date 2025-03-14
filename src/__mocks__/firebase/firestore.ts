import { jest } from "@jest/globals";

export const collection = jest.fn();
export const doc = jest.fn();
export const getDoc = jest.fn();
export const getDocs = jest.fn();
export const query = jest.fn().mockImplementation((ref) => ref);
export const where = jest.fn();
export const orderBy = jest.fn();
export const limit = jest.fn();
export const addDoc = jest.fn();
export const setDoc = jest.fn();
export const updateDoc = jest.fn();
export const deleteDoc = jest.fn();
export const getFirestore = jest.fn();
export const initializeFirestore = jest.fn();
export const onSnapshot = jest.fn();
// @ts-ignore
export const enableNetwork = jest.fn().mockResolvedValue(undefined);
// @ts-ignore
export const disableNetwork = jest.fn().mockResolvedValue(undefined);
// @ts-ignore
export const enableIndexedDbPersistence = jest
  .fn()
  // @ts-ignore
  .mockResolvedValue(undefined);
