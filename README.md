# 🔥 Firestore Helper TS

> A simple and type-safe library for working with Firebase Firestore in TypeScript/JavaScript applications.

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
- [🌟 Examples](#-examples)
- [🦺 TypeScript Support](#-typescript-support)
- [📋 Complete CRUD Application](#-complete-crud-application)
- [🚀 Advanced Usage](#-advanced-usage)
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

- ✅ **Type-safe** - full TypeScript support
- ✅ **Simple API** - intuitive functions for common operations
- ✅ **Flexible** - support for querying, filtering, and sorting
- ✅ **Consistent error handling** - unified result format
- ✅ **Support for all modern frameworks** - React, Next.js, Vue.js, and more

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

// You get back data including the ID
const userId = result.data?.id;
console.log(`New user created with ID: ${userId}`);
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

## 🔄 Import Methods

The library offers flexibility when importing functions:

### Standard Function Names

```typescript
import {
  getData,
  updateData,
  createData,
  deleteData,
} from "firestore-helper-ts";

// Usage
const result = await getData({ path: "users", docId: "abc123" });
```

### Short Aliases (recommended)

```typescript
import { get, update, create, removeDoc } from "firestore-helper-ts";

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

With TypeScript, you can define types for your data:

```typescript
import { get, create } from "firestore-helper-ts";

// Type definition
interface User {
  id?: string;
  name: string;
  email: string;
  isPremium: boolean;
  createdAt: Date;
}

// Using generic types
const result = await get<User>({
  path: "users",
  docId: "abc123",
});

// result.data will be typed as User | null
if (result.data) {
  const user = result.data;
  console.log(`Name: ${user.name}`);

  // TypeScript checks types!
  if (user.isPremium) {
    // ...
  }
}
```

## 📋 Complete CRUD Application

```typescript
import {
  initialize,
  get,
  create,
  update,
  removeDoc,
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

  // Delete product
  await deleteProduct(newProductId!);
}
```

## 🚀 Advanced Usage

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
import { create, get, update } from "firestore-helper-ts";

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
```

### Error Handling Strategies

```typescript
import { get, create } from "firestore-helper-ts";

// Using try/catch
try {
  const result = await get({
    path: "users",
    docId: "non-existent-id",
  });

  if (result.error) {
    console.error("Error fetching data:", result.error.message);
    // Handle the error appropriately
    return;
  }

  // Process data
  console.log("User data:", result.data);
} catch (e) {
  console.error("Unexpected error:", e);
}
```

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
