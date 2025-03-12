# Firestore Helper TS

A simple library for working with Firebase Firestore in TypeScript/JavaScript applications.

[![npm version](https://img.shields.io/npm/v/firestore-helper-ts.svg)](https://www.npmjs.com/package/firestore-helper-ts)

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
- ✅ **Flexible** - support for querying, filtering, sorting
- ✅ **Consistent error handling** - unified result format

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

### 3. Retrieving Data

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

### 4. Updating a Document

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

### 5. Deleting a Document

```typescript
import { removeDoc } from "firestore-helper-ts";

// Delete document
await removeDoc({
  path: "users",
  docId: "abc123",
});
```

## 🔄 Different Import Methods

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

## 📋 Complete CRUD Application Example

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

## 📖 API Reference

### `initialize(config)` / `initializeFirebase(config)`

Initializes Firebase with the provided configuration.

### `get(options)` / `getData(options)`

Retrieves data based on specified parameters:

- `path`: Path to collection or document
- `docId`: (optional) Document ID
- `where`: (optional) Filter conditions
- `orderBy`: (optional) Sort results
- `limit`: (optional) Limit number of results

### `create(options)` / `createData(options)`

Creates a new document with an automatically generated ID:

- `path`: Path to collection
- `data`: Data to store
- `refetch`: (optional) Retrieve data after creation

### `update(options)` / `updateData(options)`

Updates or creates a document:

- `path`: Path to collection
- `docId`: Document ID
- `data`: Data to update
- `merge`: (optional) Merge with existing data
- `refetch`: (optional) Retrieve data after update

### `removeDoc(options)` / `deleteData(options)`

Deletes a document:

- `path`: Path to collection
- `docId`: Document ID
- `refetch`: (optional) Retrieve parent collection data after deletion

### `reset()` / `resetFirebase()`

Resets the Firebase instance (useful for testing).

## 📄 License

ISC
