import { jest } from "@jest/globals";

export const initializeApp = jest.fn().mockReturnValue({
  name: "test-app",
  options: {},
});

export const getApp = jest.fn().mockReturnValue({
  name: "test-app",
  options: {},
});
