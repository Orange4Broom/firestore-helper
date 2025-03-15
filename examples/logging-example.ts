/**
 * Logging Example
 *
 * This example demonstrates how to configure and use the logging system
 * in Firestore Helper TS for better debugging and monitoring.
 */
import {
  initialize,
  get,
  create,
  update,
  removeDoc,
  LogLevel,
  configureLogger,
  createLogger,
  getLoggerConfig,
} from "../src";

// Create a custom logger for this example
const logger = createLogger("example");

async function loggingExample() {
  try {
    // Step 1: Show the default logging configuration (only errors are logged)
    logger.info("This info message will NOT appear with default config");
    logger.debug("This debug message will NOT appear with default config");
    logger.error("Error messages DO appear by default");

    console.log("\n--- Current logging configuration ---");
    console.log(getLoggerConfig());
    console.log("-----------------------------------\n");

    // Step 2: Enable all logging levels
    console.log("Enabling DEBUG level logging...\n");
    configureLogger({ level: LogLevel.DEBUG });

    // Verify the new configuration
    console.log("--- Updated logging configuration ---");
    console.log(getLoggerConfig());
    console.log("-----------------------------------\n");

    // Step 3: See all log levels in action
    logger.debug("DEBUG: This is a debug message (most detailed level)");
    logger.info("INFO: This is an informational message");
    logger.warn("WARN: This is a warning message");
    logger.error(
      "ERROR: This is an error message (shown at all non-NONE levels)"
    );

    // Step 4: Initialize Firebase
    initialize({
      apiKey: "YOUR_API_KEY",
      authDomain: "your-project.firebaseapp.com",
      projectId: "your-project",
      storageBucket: "your-project.appspot.com",
      messagingSenderId: "YOUR_MESSAGING_ID",
      appId: "YOUR_APP_ID",
    });

    // Step 5: Log with context data
    logger.debug("Preparing to fetch data", {
      collection: "users",
      id: "user123",
      timestamp: new Date().toISOString(),
    });

    // Step 6: Custom log formatting
    console.log("\nChanging log format to hide timestamps...");
    configureLogger({
      timestamps: false,
      showOperation: true,
    });

    logger.info("This log has no timestamp but shows the operation");

    // Step 7: Create a custom log handler
    console.log("\nSetting up a custom log handler...");
    configureLogger({
      customHandler: (level, message, ...data) => {
        // In real-world, this could send logs to a service like Sentry, Datadog, etc.
        console.log(`[CUSTOM-HANDLER][${LogLevel[level]}] ${message}`, ...data);
      },
    });

    logger.info("This log goes through the custom handler");
    logger.debug("Custom handler with extra data", {
      user: "test-user",
      action: "login",
    });

    // Step 8: Set up multiple loggers for different operations
    const authLogger = createLogger("auth");
    const dbLogger = createLogger("database");

    authLogger.info("User authenticated");
    dbLogger.info("Database connection established");

    // Step 9: In a real application, you would use the operations with logging
    // Here we're just showing the operations with our verbose logging
    try {
      // This will fail but we'll see detailed logs about what happened
      await get({ path: "users", docId: "non-existent-user" });
    } catch (err) {
      // Error is already logged in the getData operation
    }

    // Step 10: Disable all logging when you're done debugging
    console.log("\nDisabling all logging...");
    configureLogger({ level: LogLevel.NONE });

    logger.error("This error will NOT appear because logging is disabled");

    // Step 11: Re-enable error logging for production
    console.log("\nRestoring ERROR level for production...");
    configureLogger({ level: LogLevel.ERROR });
  } catch (error) {
    console.error("Example error:", error);
  }
}

// Run the example
loggingExample().then(() => {
  console.log("\nLogging example completed!");
});
