/**
 * Example demonstrating CRUD operations with real-time updates
 *
 * This example shows how to use the useListener parameter to get real-time updates after performing
 * CRUD operations, eliminating the need for the deprecated refetch parameter.
 */
import { initialize, create, update, removeDoc } from "../src";

// Define types for TypeScript
interface User {
  id?: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  lastUpdated: any; // Firestore timestamp
}

async function realtimeCrudExample() {
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

    // 2. Create document with real-time listener
    console.log("\n----- Create with Real-time Updates -----");
    console.log("Creating a new user...");

    const createResult = await create<User>({
      path: "users",
      data: {
        name: "John Doe",
        email: "john@example.com",
        status: "active",
        lastUpdated: new Date(),
      },
      useListener: true,
      onNext: (user) => {
        console.log("User created:", user);
        console.log(
          `ID: ${user.id}, Name: ${user.name}, Status: ${user.status}`
        );
        console.log("----------------------------------------");
      },
      onError: (error) => {
        console.error("Error with user creation:", error);
      },
    });

    // Ensure we have an unsubscribe function
    const unsubscribeCreate =
      typeof createResult === "function" ? createResult : () => {};

    // Wait a moment to receive the initial data
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Save the user ID for subsequent operations
    const userId = await getUserId();

    // 3. Update the document with real-time listener
    console.log("\n----- Update with Real-time Updates -----");
    console.log(`Updating user ${userId}...`);

    const updateResult = await update<User>({
      path: "users",
      docId: userId,
      data: {
        status: "inactive",
        lastUpdated: new Date(),
      },
      useListener: true,
      onNext: (user) => {
        console.log("User updated:", user);
        console.log(`Name: ${user.name}, New Status: ${user.status}`);
        console.log(
          "Status update timestamp:",
          user.lastUpdated.toDate().toLocaleString()
        );
        console.log("----------------------------------------");
      },
    });

    // Ensure we have an unsubscribe function
    const unsubscribeUpdate =
      typeof updateResult === "function" ? updateResult : () => {};

    // Wait a moment to receive the update
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 4. Delete the document and listen to the collection
    console.log("\n----- Delete with Collection Updates -----");
    console.log(`Deleting user ${userId}...`);

    const deleteResult = await removeDoc({
      path: "users",
      docId: userId,
      useListener: true,
      onNext: (users) => {
        console.log(
          `Collection updated after deletion. Users remaining: ${
            users?.length || 0
          }`
        );
        if (users && users.length > 0) {
          console.log("Remaining users:");
          users.forEach((user: any) => {
            console.log(`- ${user.name} (${user.email})`);
          });
        } else {
          console.log("No users remaining in the collection.");
        }
        console.log("----------------------------------------");
      },
    });

    // Ensure we have an unsubscribe function
    const unsubscribeDelete =
      typeof deleteResult === "function" ? deleteResult : () => {};

    // Wait a moment to receive the deletion update
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 5. Cleanup - unsubscribe from all listeners
    console.log("\nCleaning up - unsubscribing from all listeners");
    unsubscribeCreate();
    unsubscribeUpdate();
    unsubscribeDelete();

    console.log("Example completed");
  } catch (error) {
    console.error("Error in example:", error);
  }
}

// Helper function to get the user ID
// In a real application, you would store this when creating the user
async function getUserId(): Promise<string> {
  // Simulating getting the user ID from somewhere
  // In a real app, you'd have stored this from the creation step
  return new Promise((resolve) => {
    setTimeout(() => resolve("simulated-user-id"), 100);
  });
}

// Run the example
if (require.main === module) {
  realtimeCrudExample()
    .then(() => console.log("Example successfully completed"))
    .catch((err) => console.error("Error running example:", err))
    .finally(() => process.exit(0));
}
