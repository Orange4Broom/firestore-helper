# Firestore Helper TS

A simple library for working with Firebase Firestore in TypeScript/JavaScript applications.

[![npm version](https://img.shields.io/npm/v/firestore-helper-ts.svg)](https://www.npmjs.com/package/firestore-helper-ts)
[![CI](https://github.com/Orange4Broom/firestore-helper/actions/workflows/ci.yml/badge.svg)](https://github.com/Orange4Broom/firestore-helper/actions/workflows/ci.yml)

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

## 🚀 Advanced Usage

### Complex Queries with Multiple Conditions

You can create more complex queries by combining multiple conditions:

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

You can work with nested data structures using subcollections:

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

// Get a specific department
const { data: engineeringDept } = await get({
  path: `organizations/${orgId}/departments`,
  where: [["name", "==", "Engineering"]],
});

// Update a document in a subcollection
await update({
  path: `organizations/${orgId}/departments`,
  docId: engineeringDept[0].id,
  data: { headCount: 30 },
});
```

### Error Handling Strategies

The library provides consistent error handling:

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

// Using the result object directly
const createResult = await create({
  path: "products",
  data: { name: "New Product", price: -50 }, // Invalid price
});

if (createResult.error) {
  console.error("Could not create product:", createResult.error.message);
  // Show error message to user
} else {
  console.log("Product created with ID:", createResult.data.id);
}
```

### Custom Type Guards

You can create custom type guards for better type safety:

```typescript
import { get } from "firestore-helper-ts";

// Define your interface
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  isAvailable: boolean;
}

// Create a type guard
function isProduct(data: any): data is Product {
  return (
    data &&
    typeof data.name === "string" &&
    typeof data.price === "number" &&
    typeof data.stock === "number" &&
    typeof data.isAvailable === "boolean"
  );
}

// Use it with your queries
async function getProduct(productId: string): Promise<Product | null> {
  const result = await get<any>({
    path: "products",
    docId: productId,
  });

  if (result.data && isProduct(result.data)) {
    return result.data;
  }

  return null;
}
```

### Optimistic Updates

Implement optimistic updates for a responsive UI:

```typescript
import { update } from "firestore-helper-ts";

// Client-side state
let products = [
  { id: "prod1", name: "Laptop", stock: 5 },
  { id: "prod2", name: "Phone", stock: 10 },
];

// Update the UI immediately (optimistically)
function updateProductStock(productId: string, newStock: number) {
  // Update local state first
  const productIndex = products.findIndex((p) => p.id === productId);
  if (productIndex !== -1) {
    const oldStock = products[productIndex].stock;
    products[productIndex].stock = newStock;
    renderProductList(); // Update UI

    // Then update the backend
    update({
      path: "products",
      docId: productId,
      data: { stock: newStock },
    }).then((result) => {
      if (result.error) {
        // Revert on error
        console.error("Failed to update stock:", result.error);
        products[productIndex].stock = oldStock;
        renderProductList(); // Update UI with original value
      }
    });
  }
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

### Test Structure

Tests are organized according to the main components of the library:

- **Firebase Core** - tests for initialization and Firebase instances
- **CRUD operations** - tests for getData, createData, updateData, deleteData
- **Utilities** - tests for helper functions such as formatters and path joining

## 🔄 Continuous Integration and Deployment

This repository uses GitHub Actions to automate the development, testing, and release process.

### CI Workflow

- Automatic test execution on every push or pull request to main branches
- Testing on multiple Node.js versions (16.x, 18.x, 20.x)
- Automatic builds to verify compatibility

### CD Workflow

- Automatic publishing to npm when a new tag is created
- Package version is automatically updated based on the tag
- Automatic creation of GitHub Release with release notes

### Dependabot

- Automatic dependency updates
- Automatic approval and merging of minor and patch updates
- Weekly checks for npm package and GitHub Actions updates

## 📄 License

ISC
