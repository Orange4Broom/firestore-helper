/**
 * Advanced Error Handling Example
 *
 * This example demonstrates how to effectively use the structured error handling
 * system in Firestore Helper TS.
 */
import {
  initialize,
  get,
  update,
  create,
  listen,
  FirestoreHelperError,
  ValidationError,
  NotFoundError,
  PermissionError,
  handleError,
  Result,
} from "../src";

async function errorHandlingExample() {
  try {
    // 1. Initialize Firebase
    initialize({
      apiKey: "YOUR_API_KEY",
      authDomain: "your-app.firebaseapp.com",
      projectId: "your-app",
      storageBucket: "your-app.appspot.com",
      messagingSenderId: "YOUR_MESSAGING_ID",
      appId: "YOUR_APP_ID",
    });
    console.log("Firebase initialized");

    // 2. Example 1: Handling specific error types
    try {
      // Attempt to get a document that doesn't exist
      const result = await get({
        path: "users",
        docId: "non-existent-user",
      });

      if (result.error) {
        // Check the specific error type
        if (result.error instanceof NotFoundError) {
          console.log("👉 Document not found error detected!");
          console.log(`Message: ${result.error.message}`);
          console.log(`Error code: ${result.error.code}`);
          // Handle not found case (maybe create a new user)
        } else if (result.error instanceof PermissionError) {
          console.log("👉 Permission error detected!");
          console.log(`Message: ${result.error.message}`);
          // Handle permission error (maybe redirect to login)
        } else {
          console.log("👉 Other error detected!");
          console.log(`Message: ${result.error.message}`);
          console.log(`Error code: ${result.error.code}`);
        }
      } else {
        console.log("User data:", result.data);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }

    // 3. Example 2: Validation errors
    try {
      // Intentionally omit required parameters - with explicit type cast
      const createResult = (await create({
        path: "", // Empty path will trigger validation error
        data: {},
      })) as Result<any>; // Explicitly cast to Result

      if (createResult.error) {
        if (createResult.error instanceof ValidationError) {
          console.log("\n👉 Validation error detected!");
          console.log(`Message: ${createResult.error.message}`);
          console.log(`Error code: ${createResult.error.code}`);
          // Handle validation error (show form errors)
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }

    // 4. Example 3: Using the handleError utility
    try {
      // Simulate a generic error
      throw new Error("Something went wrong");
    } catch (error) {
      // Convert to a structured FirestoreHelperError
      const structuredError = handleError(error);
      console.log("\n👉 Converted generic error to structured error:");
      console.log(`Original error: ${error.message}`);
      console.log(`Structured error: ${structuredError.message}`);
      console.log(`Error code: ${structuredError.code}`);

      // Original error is preserved
      if (structuredError.originalError) {
        console.log(
          `Original error preserved: ${structuredError.originalError.message}`
        );
      }
    }

    // 5. Example 4: Error handling with listeners
    const unsubscribe = listen({
      path: "users",
      onNext: (users) => {
        console.log("\nUsers updated:", users.length);
      },
      onError: (error) => {
        // Error handling in real-time listeners
        if (error instanceof PermissionError) {
          console.log("\n👉 Permission error in listener:");
          console.log(`Message: ${error.message}`);
          // Maybe redirect to login
        } else {
          console.log("\n👉 Other error in listener:");
          console.log(`Message: ${error.message}`);
        }
      },
    });

    // Clean up listener after a short time
    setTimeout(() => {
      unsubscribe();
      console.log("\nListener unsubscribed");
    }, 2000);

    // Example 5: Try-catch with specific error types
    try {
      // Simulate an operation that fails
      throw new PermissionError(
        "You don't have permission to access this document"
      );
    } catch (error) {
      if (error instanceof PermissionError) {
        console.log("\n👉 Permission error caught in try-catch:");
        console.log(`Message: ${error.message}`);
        console.log(`Error code: ${error.code}`);
      } else if (error instanceof FirestoreHelperError) {
        console.log("\n👉 Other Firestore Helper error caught:");
        console.log(`Message: ${error.message}`);
        console.log(`Error code: ${error.code}`);
      } else {
        console.log("\n👉 Generic error caught:");
        console.log(`Message: ${error.message}`);
      }
    }

    console.log("\nError handling example completed!");
  } catch (error) {
    console.error("Error in example:", error);
  }
}

// Run the example
if (require.main === module) {
  errorHandlingExample()
    .then(() => console.log("\nApplication terminated"))
    .catch((err) => console.error("Error running example:", err))
    .finally(() => setTimeout(() => process.exit(0), 2000));
}
