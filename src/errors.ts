/**
 * Custom error types for Firestore Helper library
 * This file contains structured error classes to improve error handling and type safety
 */

// Base error class for all Firestore Helper errors
export class FirestoreHelperError extends Error {
  /** Unique code identifying the type of error */
  code: string;
  /** Original error that caused this error, if any */
  originalError?: Error;

  constructor(message: string, code: string, originalError?: Error) {
    super(message);
    this.name = "FirestoreHelperError";
    this.code = code;
    this.originalError = originalError;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirestoreHelperError);
    }
  }
}

// Initialization errors
export class InitializationError extends FirestoreHelperError {
  constructor(message: string, originalError?: Error) {
    super(message, "initialization_error", originalError);
    this.name = "InitializationError";
  }
}

// Validation errors
export class ValidationError extends FirestoreHelperError {
  constructor(message: string, originalError?: Error) {
    super(message, "validation_error", originalError);
    this.name = "ValidationError";
  }
}

// Firestore query errors
export class QueryError extends FirestoreHelperError {
  constructor(message: string, originalError?: Error) {
    super(message, "query_error", originalError);
    this.name = "QueryError";
  }
}

// Document not found errors
export class NotFoundError extends FirestoreHelperError {
  constructor(message: string, originalError?: Error) {
    super(message, "not_found", originalError);
    this.name = "NotFoundError";
  }
}

// Permission errors
export class PermissionError extends FirestoreHelperError {
  constructor(message: string, originalError?: Error) {
    super(message, "permission_denied", originalError);
    this.name = "PermissionError";
  }
}

// Network errors
export class NetworkError extends FirestoreHelperError {
  constructor(message: string, originalError?: Error) {
    super(message, "network_error", originalError);
    this.name = "NetworkError";
  }
}

// Timeout errors
export class TimeoutError extends FirestoreHelperError {
  constructor(message: string, originalError?: Error) {
    super(message, "timeout", originalError);
    this.name = "TimeoutError";
  }
}

// Error reporting utility
export function reportError(error: Error): void {
  // This can be extended to log to a service or remote error tracking system
  console.error("[FirestoreHelper]", error);
}

// Helper to safely handle unknown errors and convert them to our custom error types
export function handleError(error: unknown): FirestoreHelperError {
  if (error instanceof FirestoreHelperError) {
    return error;
  }

  if (error instanceof Error) {
    const errorMessage = error.message || "Unknown error occurred";

    // Check for common Firebase error patterns and convert to appropriate types
    if (
      errorMessage.includes("permission_denied") ||
      errorMessage.includes("insufficient privileges")
    ) {
      return new PermissionError(errorMessage, error);
    }

    if (
      errorMessage.includes("not found") ||
      errorMessage.includes("no document to update")
    ) {
      return new NotFoundError(errorMessage, error);
    }

    if (
      errorMessage.includes("network") ||
      errorMessage.includes("connectivity")
    ) {
      return new NetworkError(errorMessage, error);
    }

    // Default to a generic error
    return new FirestoreHelperError(errorMessage, "unknown_error", error);
  }

  // Handle non-Error objects
  const errorMessage =
    typeof error === "string" ? error : "Unknown error occurred";

  return new FirestoreHelperError(errorMessage, "unknown_error");
}
