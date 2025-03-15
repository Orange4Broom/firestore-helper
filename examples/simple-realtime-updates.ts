/**
 * Simple example of real-time updates
 *
 * This example demonstrates how to easily combine real-time listeners with data updates.
 * Updates are performed in silent mode, so the function does not return data,
 * only potential errors, and the existing listener automatically captures changes.
 */
import { initialize, create, update, listen, Result } from "../src";

// Task type definition
interface Task {
  id?: string;
  title: string;
  completed: boolean;
  priority: number;
  lastUpdated: any;
}

async function simpleRealtimeUpdatesExample() {
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

    // 2. Create test tasks
    console.log("\nCreating test tasks...");

    // Create first task - explicit typing of result as Result
    const task1Result = (await create<Task>({
      path: "tasks",
      data: {
        title: "Complete presentation",
        completed: false,
        priority: 2,
        lastUpdated: new Date(),
      },
    })) as Result<Task & { id: string }>;

    // Create second task - explicit typing of result as Result
    const task2Result = (await create<Task>({
      path: "tasks",
      data: {
        title: "Prepare project",
        completed: false,
        priority: 1,
        lastUpdated: new Date(),
      },
    })) as Result<Task & { id: string }>;

    const taskId1 = task1Result.data?.id;
    const taskId2 = task2Result.data?.id;

    console.log(`Created 2 tasks. Task IDs: ${taskId1}, ${taskId2}`);
    console.log("----------------------------------------");

    // 3. Set up real-time listener for task list
    console.log("\nSetting up real-time listener for task list...");

    // Set up listener for task collection sorted by priority
    const unsubscribeTasksList = listen<Task[]>({
      path: "tasks",
      orderBy: [["priority", "desc"]],
      onNext: (tasks) => {
        // In a real application, this would update the UI
        console.log("\nTask list has been updated:");
        tasks.forEach((task) => {
          const status = task.completed ? "✅ Completed" : "⏳ Not completed";
          console.log(
            `- ${task.title} (Priority: ${task.priority}) - ${status}`
          );
          console.log(
            `  Last updated: ${task.lastUpdated.toDate().toLocaleString()}`
          );
        });
        console.log("----------------------------------------");
      },
      onError: (error) => {
        console.error("Error loading tasks:", error);
      },
    });

    // Wait a moment for the listener to initialize
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 4. Update a task in silent mode
    console.log("\nUpdating the first task - marking it as completed...");

    // Perform the update in silent mode - function returns only potential error, not data
    // Explicit typing as Result<null>
    const updateResult = (await update<Task>({
      path: "tasks",
      docId: taskId1,
      data: {
        completed: true,
        lastUpdated: new Date(),
      },
      silent: true, // Silent mode - doesn't return data, only error (if it occurs)
    })) as Result<null>;

    // Process update result
    if (updateResult.error) {
      console.error("Error updating task:", updateResult.error);
    } else {
      console.log("Task was successfully updated");
      console.log(
        "Notice that the listener automatically caught the change and updated the list"
      );
    }

    // Wait for the update to take effect
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 5. Change the priority of the second task
    console.log("\nChanging priority of the second task...");

    // Explicit typing as Result<null>
    const priorityUpdateResult = (await update<Task>({
      path: "tasks",
      docId: taskId2,
      data: {
        priority: 3, // Increasing priority
        lastUpdated: new Date(),
      },
      silent: true, // Using silent mode again
    })) as Result<null>;

    if (priorityUpdateResult.error) {
      console.error("Error updating priority:", priorityUpdateResult.error);
    } else {
      console.log("Priority was successfully changed");
      console.log(
        "Notice that the order of tasks in the list has changed according to priority"
      );
    }

    // Wait for the update to take effect
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 6. Terminate listener and clean up
    console.log("\nTerminating listener and ending example...");
    unsubscribeTasksList();

    console.log("\nExample successfully completed!");
  } catch (error) {
    console.error("Error in example:", error);
  }
}

// Run the example
if (require.main === module) {
  simpleRealtimeUpdatesExample()
    .then(() => console.log("\nApplication has terminated"))
    .catch((err) => console.error("Error running example:", err))
    .finally(() => setTimeout(() => process.exit(0), 500));
}
