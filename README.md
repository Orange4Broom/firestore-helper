# 🔥 Firestore Helper TS

Simplify your work with Firestore and save dozens of coding hours! Firestore Helper TS solves common problems when working with Firestore:

- 🚀 **Less code, more productivity** - reduces boilerplate code by 60-70%
- 🛡️ **Type safety** - complete TypeScript support with generic types
- 🔄 **Real-time updates** - simple API for working with onSnapshot listeners
- 🧩 **Consistent data format** - unified approach to processing documents and collections
- 🚦 **Structured error handling** - predictable and type-safe errors
- 📦 **Minimalist size** - only essential functions without unnecessary dependencies

Unlike direct use of the Firebase SDK, Firestore Helper significantly simplifies CRUD operations, provides a unified interface for working with data, and eliminates common sources of errors. Develop faster and more safely!

> A simple and type-safe library for working with Firebase Firestore in TypeScript/JavaScript applications.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/orange4broom)
[![npm version](https://img.shields.io/npm/v/firestore-helper-ts.svg)](https://www.npmjs.com/package/firestore-helper-ts)
[![CI](https://github.com/Orange4Broom/firestore-helper/actions/workflows/ci.yml/badge.svg)](https://github.com/Orange4Broom/firestore-helper/actions/workflows/ci.yml)

## 📑 Table of Contents

- [🚀 Installation](#-installation)
- [🔑 Key Features](#-key-features)
- [📚 Quick Start](#-quick-start)
  - [Initialize Firebase](#1-initialize-firebase)
  - [Create a Document](#2-create-a-document)
  - [Retrieve Data](#3-retrieve-data)
  - [Update a Document](#4-update-a-document)
  - [Delete a Document](#5-delete-a-document)
  - [Real-time Listeners](#6-real-time-listeners)
- [🦺 TypeScript Support](#-typescript-support)
- [🛡️ Error Handling](#-error-handling)
- [💾 Caching System](#-caching)
- [🐞 Debugging & Logging](#-debugging--logging)
- [📋 Complete CRUD Application](#-complete-crud-application)
- [⚡ Advanced Usage](#-advanced-usage)
  - [Complex Queries](#complex-queries-with-multiple-conditions)
  - [Subcollections](#working-with-subcollections)
  - [Real-time Dashboard](#real-time-dashboard-example)
  - [Custom Document IDs](#custom-document-ids)
- [🌟 Examples](#-examples)
  - [Basic Examples](#basic-examples)
  - [Framework Integration](#framework-integration)
- [🧪 Testing](#-testing)
- [📄 License](#-license)

## 🚀 Installation

```bash
# NPM
npm install firestore-helper-ts

# Yarn
yarn add firestore-helper-ts

# PNPM
pnpm add firestore-helper-ts
```

## 🔑 Key Features

- 🔥 **Simple initialization** of Firebase/Firestore
- 📦 **CRUD operations** with TypeScript support
- 🎯 **Type-safe** queries and operations
- 🔄 **Real-time updates** with snapshot support
- 🛡️ **Robust error handling** with custom error types
- 🐞 **Advanced logging** with various levels and configuration
- 💾 **Intelligent caching** for performance optimization
- 📝 **Automatic data formatting**

## 📚 Quick Start

### 1. Initialize Firebase

```typescript
import { initialize } from "firestore-helper-ts";

// At the beginning of your application
initialize({
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  // other configuration...
});
```

### 2. Create a Document

```typescript
import { create } from "firestore-helper-ts";

// Creates a document with automatically generated ID
const result = await create({
  path: "users", // path to collection
  data: {
    name: "John Smith",
    email: "john@example.com",
    age: 32,
    isActive: true,
  },
});

// Creates a document with custom ID (e.g., UUID)
const resultWithCustomId = await create({
  path: "users",
  customId: "123e4567-e89b-12d3-a456-426614174000", // Your custom ID
  data: {
    name: "Jane Smith",
    email: "jane@example.com",
    age: 28,
    isActive: true,
  },
});

// You get back data including the ID in both cases
const userId = result.data?.id; // Firestore generated ID
const customUserId = resultWithCustomId.data?.id; // Your custom ID
```

### 3. Retrieve Data

```typescript
import { get } from "firestore-helper-ts";

// Get a single document
const userResult = await get({
  path: "users",
  docId: "abc123", // document ID
});

if (userResult.data) {
  console.log(`Name: ${userResult.data.name}`);
}

// Get an entire collection with filters and sorting
const activeUsersResult = await get({
  path: "users",
  where: [
    ["isActive", "==", true], // First filter
    ["age", ">", 25], // Second filter
  ],
  orderBy: [
    ["createdAt", "desc"], // Sort by creation date descending
  ],
  limit: 10, // Limit number of results
});

// Process results
activeUsersResult.data?.forEach((user) => {
  console.log(`${user.name} (${user.email})`);
});
```

### 4. Update a Document

```typescript
import { update } from "firestore-helper-ts";

// Update document
await update({
  path: "users",
  docId: "abc123",
  data: {
    age: 33,
    lastLogin: new Date(),
  },
  merge: true, // Merge with existing data (default)
  refetch: true, // Return updated data
});
```

### 5. Delete a Document

```typescript
import { removeDoc } from "firestore-helper-ts";

// Delete document
await removeDoc({
  path: "users",
  docId: "abc123",
});
```

### 6. Real-time Listeners

```typescript
import { listen } from "firestore-helper-ts";

// Listen to a single document
const unsubscribe = listen({
  path: "users",
  docId: "abc123",
  onNext: (userData) => {
    // Runs whenever the document changes
    console.log("User data updated:", userData);
    updateUI(userData);
  },
  onError: (error) => {
    console.error("Error listening to user:", error);
  },
});

// Listen to a collection with filters
const unsubscribeCollection = listen({
  path: "users",
  where: [["isActive", "==", true]],
  orderBy: [["lastActive", "desc"]],
  limit: 10,
  onNext: (users) => {
    console.log("Active users updated:", users);
    updateUsersList(users);
  },
});

// Stop listening when no longer needed
// For example when component unmounts
unsubscribe();
unsubscribeCollection();
```

### 7. CRUD with Real-time Updates

You can perform CRUD operations and immediately get real-time updates instead of a one-time fetch:

```typescript
import { create, update, removeDoc } from "firestore-helper-ts";

// Create a document and listen for changes
const unsubscribeCreate = await create({
  path: "posts",
  data: {
    title: "New Post",
    content: "Post content...",
    createdAt: new Date(),
  },
  useListener: true, // Enable real-time listening
  onNext: (post) => {
    console.log("Post created or updated:", post);
    updateUI(post);
  },
});

// Update a document and listen for changes
const unsubscribeUpdate = await update({
  path: "posts",
  docId: "post123",
  data: { likes: 42 },
  useListener: true,
  onNext: (post) => {
    console.log("Post updated:", post);
    updateUI(post);
  },
});

// Later, stop listening
unsubscribeCreate();
unsubscribeUpdate();
```

## 🔄 Import Methods

The library offers flexibility when importing functions:

### Standard Function Names

```typescript
import {
  getData,
  updateData,
  createData,
  deleteData,
  listenData,
} from "firestore-helper-ts";

// Usage
const result = await getData({ path: "users", docId: "abc123" });
```

### Short Aliases (recommended)

```typescript
import { get, update, create, removeDoc, listen } from "firestore-helper-ts";

// Usage
const result = await get({ path: "users", docId: "abc123" });
```

### As an Object

```typescript
import FirestoreHelper from "firestore-helper-ts";

// Usage
const result = await FirestoreHelper.get({ path: "users", docId: "abc123" });
```

## 🌟 Examples

Check out the [examples directory](./examples/) for usage examples with different frameworks:

### Basic Examples

- [Basic TypeScript Example](./examples/basic.ts) - Simple usage without any framework
- [React Example](./examples/react-example.tsx) - Basic integration with React

### Framework Integration

- **React:** [React Hooks and Context API](./examples/react-hooks-example/UserManagement.tsx) - Modern React app with hooks
- **Next.js:** [Next.js Integration](./examples/nextjs-example/pages/users.tsx) - Integration with Next.js framework
- **Vue.js:** [Vue 3 with Composition API](./examples/vue-example/UserManagement.vue) - Integration with Vue.js (v3)

For more details and instructions on running these examples, check the [examples README](./examples/README.md).

## 🦺 TypeScript Support

Firestore Helper TS provides complete TypeScript support with generic types for all operations:

```typescript
// Define your data types
interface User {
  id?: string;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  createdAt: Date;
}

interface Post {
  id?: string;
  title: string;
  content: string;
  authorId: string;
  tags: string[];
  publishedAt?: Date;
}

// Use with CRUD operations
const userResult = await get<User>({
  path: "users",
  docId: "user123",
});

const postsResult = await get<Post[]>({
  path: "posts",
  where: [["authorId", "==", "user123"]],
});

// Type-safe real-time listeners
listen<User>({
  path: "users",
  docId: "user123",
  onNext: (user) => {
    if (user) {
      // TypeScript knows all available properties
      console.log(`${user.name} (${user.email})`);
    }
  },
});
```

## 🛡️ Error Handling

Firestore Helper TS includes a comprehensive error handling system that provides:

- Type-safe error handling with custom error types
- Detailed error messages and codes
- Consistent error format across all operations
- Built-in error types for common scenarios

```typescript
import {
  FirestoreHelperError,
  ValidationError,
  PermissionError,
  NotFoundError,
} from "firestore-helper-ts";

try {
  const result = await get({
    path: "users",
    docId: "user123",
  });

  if (result.error) {
    // Type-safe error handling
    switch (result.error.constructor) {
      case ValidationError:
        console.error("Invalid parameters:", result.error.message);
        break;
      case PermissionError:
        console.error("Permission denied:", result.error.message);
        // Redirect to login
        break;
      case NotFoundError:
        console.error("Document not found:", result.error.message);
        // Show empty state
        break;
      default:
        console.error("Unexpected error:", result.error.message);
    }
  } else {
    // Process result.data
    console.log("User data:", result.data);
  }
} catch (error) {
  // Handle unexpected errors
  console.error("Critical error:", error);
}
```

### Error Types

- `ValidationError`: Invalid parameters or data format
- `PermissionError`: Insufficient permissions
- `NotFoundError`: Document or collection not found
- `InitializationError`: Firebase not properly initialized
- `NetworkError`: Network-related issues
- `TimeoutError`: Operation timeout
- `CacheError`: Caching-related issues

## 💾 Caching System

Firestore Helper TS includes an intelligent caching system to optimize performance and reduce Firestore reads:

```typescript
import { configureCache, get } from "firestore-helper-ts";

// Configure global cache settings
configureCache({
  enabled: true, // Enable/disable caching
  maxSize: 1000, // Maximum number of cached items
  ttl: 5 * 60 * 1000, // Time-to-live in milliseconds (5 minutes)
});

// Use cache with get operations
const result = await get({
  path: "users",
  docId: "user123",
  cache: {
    enabled: true, // Enable for this request
    ttl: 60000, // Custom TTL for this request (1 minute)
  },
});

// Cache with collection queries
const activeUsers = await get({
  path: "users",
  where: [["isActive", "==", true]],
  cache: {
    enabled: true,
    key: "active-users", // Custom cache key
  },
});

// Clear cache for specific paths
await clearCache("users/*");

// Clear all cache
await clearCache();

// Get cache statistics
const stats = getCacheStats();
console.log("Cache hits:", stats.hits);
console.log("Cache misses:", stats.misses);
console.log("Items in cache:", stats.size);
```

### Cache Features

- Configurable TTL (Time-to-Live)
- Maximum cache size limit
- Custom cache keys
- Cache invalidation patterns
- Cache statistics and monitoring
- Per-request cache configuration
- Automatic cache cleanup

## 🐞 Debugging & Logging

Firestore Helper TS includes a comprehensive logging system that helps you debug your application and understand what's happening under the hood.

### Logging Levels

The logging system supports various levels of detail:

```typescript
import { LogLevel, configureLogger } from "firestore-helper-ts";

// Available log levels
LogLevel.NONE; // 0: No logging
LogLevel.ERROR; // 1: Only errors (default)
LogLevel.WARN; // 2: Errors and warnings
LogLevel.INFO; // 3: Errors, warnings, and informational messages
LogLevel.DEBUG; // 4: All messages including detailed debug info
```

### Basic Usage

To change the logging level:

```typescript
import { configureLogger, LogLevel } from "firestore-helper-ts";

// Enable all logs including debug
configureLogger({ level: LogLevel.DEBUG });

// Only show errors and warnings
configureLogger({ level: LogLevel.WARN });

// Disable all logging
configureLogger({ level: LogLevel.NONE });
```

### Creating Custom Loggers

You can create dedicated loggers for different parts of your application:

```typescript
import { createLogger } from "firestore-helper-ts";

// Create loggers for different components
const authLogger = createLogger("auth");
const dbLogger = createLogger("database");
const uiLogger = createLogger("ui");

// Use them in your code
authLogger.info("User logged in successfully");
dbLogger.debug("Fetching data with params", { collection: "users", id: "123" });
uiLogger.warn("Component will be deprecated in next version");
```

### Customizing Log Format

You can customize how logs are formatted:

```typescript
// Configure timestamp and operation name display
configureLogger({
  timestamps: true, // Include timestamps in logs
  showOperation: true, // Include operation name in logs
});
```

### Custom Log Handling

For production environments, you might want to send logs to a monitoring service:

```typescript
// Set up a custom handler for all logs
configureLogger({
  level: LogLevel.ERROR, // Only process errors
  customHandler: (level, message, ...data) => {
    // Send to your logging service
    myLoggingService.capture({
      level: LogLevel[level],
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  },
});
```

### Logging in Practice

In development, enable detailed logging to see what's happening:

```typescript
// During development
configureLogger({ level: LogLevel.DEBUG });

// Later in production
configureLogger({ level: LogLevel.ERROR });
```

For a complete example of using the logging system, check [examples/logging-example.ts](./examples/logging-example.ts).

## 📋 Complete CRUD Application

```typescript
import {
  initialize,
  get,
  create,
  update,
  removeDoc,
  listen,
  Result,
} from "firestore-helper-ts";

// Type definitions
interface Product {
  id?: string;
  name: string;
  price: number;
  stock: number;
  categories: string[];
}

// Initialize Firebase
initialize({
  /* configuration */
});

// Create product
async function createProduct(
  productData: Omit<Product, "id">
): Promise<string | null> {
  const result = await create<Product>({
    path: "products",
    data: productData,
  });

  return result.data?.id || null;
}

// Get product by ID
async function getProduct(productId: string): Promise<Product | null> {
  const result = await get<Product>({
    path: "products",
    docId: productId,
  });

  return result.data;
}

// Get products by category
async function getProductsByCategory(category: string): Promise<Product[]> {
  const result = await get<Product[]>({
    path: "products",
    where: [["categories", "array-contains", category]],
    orderBy: [["price", "asc"]],
  });

  return result.data || [];
}

// Update stock
async function updateStock(
  productId: string,
  newStock: number
): Promise<boolean> {
  const result = await update({
    path: "products",
    docId: productId,
    data: { stock: newStock },
  });

  return !result.error;
}

// Delete product
async function deleteProduct(productId: string): Promise<boolean> {
  const result = await removeDoc({
    path: "products",
    docId: productId,
  });

  return !result.error;
}

// Listen to stock changes
function listenToStockChanges(
  productId: string,
  callback: (stock: number) => void
): () => void {
  return listen<Product>({
    path: "products",
    docId: productId,
    onNext: (product) => {
      if (product) {
        callback(product.stock);
      }
    },
  });
}

// Using the functions
async function manageInventory() {
  // Create product
  const newProductId = await createProduct({
    name: "Smartphone",
    price: 699.99,
    stock: 10,
    categories: ["electronics", "phones"],
  });

  // Get product
  const product = await getProduct(newProductId!);
  console.log(`Product: ${product?.name}, Price: $${product?.price}`);

  // Update stock
  await updateStock(newProductId!, 8);

  // Get products by category
  const phones = await getProductsByCategory("phones");
  console.log(`Found ${phones.length} phones`);

  // Set up real-time listener for stock changes
  const unsubscribe = listenToStockChanges(newProductId!, (newStock) => {
    console.log(`Stock changed: ${newStock} units available`);
    updateStockDisplay(newStock);
  });

  // Later, when no longer needed
  unsubscribe();

  // Delete product
  await deleteProduct(newProductId!);
}
```

## ⚡ Advanced Usage

### Complex Queries with Multiple Conditions

```typescript
import { get } from "firestore-helper-ts";

// Find active premium users who have logged in recently
const result = await get({
  path: "users",
  where: [
    ["isActive", "==", true],
    ["subscriptionTier", "==", "premium"],
    ["lastLogin", ">", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)], // 7 days ago
  ],
  orderBy: [
    ["lastLogin", "desc"], // Most recent logins first
  ],
  limit: 20,
});

// Process the results
result.data?.forEach((user) => {
  console.log(
    `Premium user ${user.name} last logged in on ${user.lastLogin.toDate()}`
  );
});
```

### Working with Subcollections

```typescript
import { create, get, update, listen } from "firestore-helper-ts";

// Create a parent document
const { data: organization } = await create({
  path: "organizations",
  data: { name: "Acme Inc.", founded: 1985 },
});

// Add a document to a subcollection
const orgId = organization.id;
await create({
  path: `organizations/${orgId}/departments`,
  data: { name: "Engineering", headCount: 25 },
});

// Get all departments for an organization
const { data: departments } = await get({
  path: `organizations/${orgId}/departments`,
});

// Listen to changes in departments
const unsubscribe = listen({
  path: `organizations/${orgId}/departments`,
  onNext: (departments) => {
    console.log("Departments updated:", departments);
    updateDepartmentsList(departments);
  },
});
```

### Real-time Dashboard Example

```typescript
import { listen } from "firestore-helper-ts";

function setupDashboard() {
  // Listen to active orders
  const unsubscribeOrders = listen({
    path: "orders",
    where: [["status", "==", "active"]],
    orderBy: [["createdAt", "desc"]],
    onNext: (orders) => {
      updateOrdersDisplay(orders);

      // Calculate total revenue
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      updateRevenueDisplay(totalRevenue);
    },
  });

  // Listen to inventory levels
  const unsubscribeInventory = listen({
    path: "products",
    where: [["stock", "<", 10]], // Low stock items
    onNext: (lowStockProducts) => {
      updateLowStockAlerts(lowStockProducts);
    },
  });

  // Listen to new user registrations
  const unsubscribeUsers = listen({
    path: "users",
    orderBy: [["createdAt", "desc"]],
    limit: 5,
    onNext: (recentUsers) => {
      updateRecentUsersWidget(recentUsers);
    },
  });

  // Return a function to unsubscribe from all listeners
  return () => {
    unsubscribeOrders();
    unsubscribeInventory();
    unsubscribeUsers();
  };
}

// In a React component:
// useEffect(() => {
//   const unsubscribeAll = setupDashboard();
//   return () => unsubscribeAll();
// }, []);
```

### Custom Document IDs

You can use your own document IDs (like UUID) when creating documents:

```typescript
import { v4 as uuidv4 } from "uuid";
import { create } from "firestore-helper-ts";

// Create a document with UUID
const result = await create({
  path: "users",
  customId: uuidv4(), // Use UUID as document ID
  data: {
    name: "John Doe",
    email: "john@example.com",
  },
});

// The document will be created with your custom ID
console.log("Created user with custom ID:", result.data?.id);
```

This is useful when:

- You need to know the document ID before creation
- You want to use UUIDs or other custom ID formats
- You need to ensure ID uniqueness across different Firestore instances
- You're migrating data from another system and want to preserve IDs

## 🌟 Examples

### Basic Examples

Check out our [examples directory](./examples) for complete working examples:

- `basic.ts` - Basic CRUD operations
- `typescript-example.ts` - TypeScript integration
- `error-handling-example.ts` - Error handling patterns
- `caching-example.ts` - Caching implementation
- `real-time-example.ts` - Real-time listeners

### Framework Integration

We provide examples for popular frameworks:

- React: `react-example.tsx`
- Next.js: `nextjs-example.tsx`
- Vue.js: `vue-example.ts`

## 🧪 Testing

The library contains unit tests to ensure proper functionality. Tests are written using the Jest framework.

### Running Tests

```bash
# Run all tests
npm test

# Run tests with watch mode
npm run test:watch

# Run tests with code coverage
npm run test:coverage
```

## 🔄 Continuous Integration and Deployment

This repository uses GitHub Actions to automate the development, testing, and release process.

### CI Workflow

- Automatic test execution on every push or pull request to main branches
- Testing on multiple Node.js versions (16.x, 18.x, 20.x)
- Automatic builds to verify compatibility

## 📄 License

ISC
