/**
 * Logging system for Firestore Helper TS
 *
 * This module provides a configurable logging system with support for
 * different log levels to facilitate debugging and monitoring.
 */

/**
 * Available log levels
 */
export enum LogLevel {
  NONE = 0, // No logging
  ERROR = 1, // Only errors
  WARN = 2, // Errors and warnings
  INFO = 3, // Errors, warnings, and info messages
  DEBUG = 4, // All messages including debug
}

/**
 * Configuration options for the logger
 */
export interface LoggerConfig {
  /** Current logging level */
  level: LogLevel;
  /** Whether to include timestamps in log messages */
  timestamps: boolean;
  /** Whether to include the operation name in log messages */
  showOperation: boolean;
  /** Custom log handler function */
  customHandler?: (level: LogLevel, message: string, ...data: any[]) => void;
}

/**
 * Default configuration
 */
export const defaultConfig: LoggerConfig = {
  level: LogLevel.ERROR,
  timestamps: true,
  showOperation: true,
};

/**
 * Current logger configuration
 */
let config: LoggerConfig = { ...defaultConfig };

/**
 * Configure the logger
 *
 * @param newConfig - New configuration options
 * @returns The updated configuration
 *
 * @example
 * ```
 * // Enable debug logging
 * configureLogger({ level: LogLevel.DEBUG });
 *
 * // Disable all logging
 * configureLogger({ level: LogLevel.NONE });
 *
 * // Use a custom logging handler
 * configureLogger({
 *   level: LogLevel.INFO,
 *   customHandler: (level, message, ...data) => {
 *     // Send to a logging service
 *     myLoggingService.log(level, message, data);
 *   }
 * });
 * ```
 */
export function configureLogger(
  newConfig: Partial<LoggerConfig>
): LoggerConfig {
  config = { ...config, ...newConfig };
  return config;
}

/**
 * Get the current logger configuration
 *
 * @returns The current configuration
 */
export function getLoggerConfig(): LoggerConfig {
  return { ...config };
}

/**
 * Format a log message with optional timestamp and operation name
 */
function formatMessage(
  level: string,
  message: string,
  operation?: string
): string {
  const timestamp = config.timestamps ? `[${new Date().toISOString()}] ` : "";
  const operationStr =
    operation && config.showOperation ? `[${operation}] ` : "";
  return `${timestamp}[FirestoreHelper][${level}] ${operationStr}${message}`;
}

/**
 * Log an error message
 *
 * @param message - The message to log
 * @param operation - Optional operation name for context
 * @param data - Additional data to log
 */
export function logError(
  message: string,
  operation?: string,
  ...data: any[]
): void {
  if (config.level >= LogLevel.ERROR) {
    const formattedMessage = formatMessage("ERROR", message, operation);

    if (config.customHandler) {
      config.customHandler(LogLevel.ERROR, formattedMessage, ...data);
    } else {
      console.error(formattedMessage, ...data);
    }
  }
}

/**
 * Log a warning message
 *
 * @param message - The message to log
 * @param operation - Optional operation name for context
 * @param data - Additional data to log
 */
export function logWarn(
  message: string,
  operation?: string,
  ...data: any[]
): void {
  if (config.level >= LogLevel.WARN) {
    const formattedMessage = formatMessage("WARN", message, operation);

    if (config.customHandler) {
      config.customHandler(LogLevel.WARN, formattedMessage, ...data);
    } else {
      console.warn(formattedMessage, ...data);
    }
  }
}

/**
 * Log an info message
 *
 * @param message - The message to log
 * @param operation - Optional operation name for context
 * @param data - Additional data to log
 */
export function logInfo(
  message: string,
  operation?: string,
  ...data: any[]
): void {
  if (config.level >= LogLevel.INFO) {
    const formattedMessage = formatMessage("INFO", message, operation);

    if (config.customHandler) {
      config.customHandler(LogLevel.INFO, formattedMessage, ...data);
    } else {
      console.info(formattedMessage, ...data);
    }
  }
}

/**
 * Log a debug message
 *
 * @param message - The message to log
 * @param operation - Optional operation name for context
 * @param data - Additional data to log
 */
export function logDebug(
  message: string,
  operation?: string,
  ...data: any[]
): void {
  if (config.level >= LogLevel.DEBUG) {
    const formattedMessage = formatMessage("DEBUG", message, operation);

    if (config.customHandler) {
      config.customHandler(LogLevel.DEBUG, formattedMessage, ...data);
    } else {
      console.debug(formattedMessage, ...data);
    }
  }
}

/**
 * Logger interface for consistent logging across different modules
 */
export interface Logger {
  error: (message: string, ...data: any[]) => void;
  warn: (message: string, ...data: any[]) => void;
  info: (message: string, ...data: any[]) => void;
  debug: (message: string, ...data: any[]) => void;
}

/**
 * Create a logger for a specific operation
 *
 * @param operation - Name of the operation (e.g., 'getData', 'updateData')
 * @returns Logger interface with bound operation name
 *
 * @example
 * ```
 * const logger = createLogger('getData');
 * logger.debug('Fetching document', { path, docId });
 * ```
 */
export function createLogger(operation: string): Logger {
  return {
    error: (message: string, ...data: any[]) =>
      logError(message, operation, ...data),
    warn: (message: string, ...data: any[]) =>
      logWarn(message, operation, ...data),
    info: (message: string, ...data: any[]) =>
      logInfo(message, operation, ...data),
    debug: (message: string, ...data: any[]) =>
      logDebug(message, operation, ...data),
  };
}
