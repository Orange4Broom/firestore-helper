# Examples of using firestore-helper-ts

This directory contains various implementation examples and use cases of the `firestore-helper-ts` library across different frameworks and environments.

## Directory Contents

### Basic Examples

- `basic.ts` - Basic example of using the library with TypeScript (without a framework)
- `react-example.tsx` - Simple example of React integration
- `realtime-listener-example.ts` - Demonstration of using real-time listeners with onSnapshot
- `realtime-crud-example.ts` - Demonstration of integrating CRUD operations with real-time listeners
- `user-name-update-example.ts` - Practical example of updating a user's name with real-time list updates
- `simple-realtime-updates.ts` - **RECOMMENDED APPROACH** - Simplified approach to real-time updates with the `silent` parameter
- `error-handling-example.ts` - Advanced error handling with custom error types
- `logging-example.ts` - Demonstrates how to use the debugging and logging system

### Advanced Examples by Framework

#### React

- `react-hooks-example/UserManagement.tsx` - Modern React application using hooks and Context API

#### Next.js

- `nextjs-example/pages/users.tsx` - Implementation example in Next.js

#### Vue.js

- `vue-example/UserManagement.vue` - Example of using with Vue.js (Vue 3 with Composition API)

## How to Run the Examples

Most examples are meant as code demonstrations and are not directly executable without the appropriate project and infrastructure. To use these examples in your own application:

1. Create a project with the appropriate framework (React, Next.js, Vue.js)
2. Install the `firestore-helper-ts` library and Firebase:
   ```
   npm install firestore-helper-ts firebase
   ```
3. Copy and modify the code according to your application's needs
4. Replace the Firebase configuration details with your own values

### Running the Real-Time Listeners Example

You can run the `realtime-listener-example.ts` example directly from the command line if you have a properly configured environment:

```bash
# First build the library
npm run build

# Then run the example
npx ts-node examples/realtime-listener-example.ts
```

This example demonstrates the basic functions of real-time listeners and shows how to:

- Set up a listener for a specific document
- Set up a listener for a collection of documents with filtering and sorting
- React to data changes in real time
- Properly terminate listeners when they are no longer needed

### Running the CRUD Operations with Real-Time Listeners Example

The `realtime-crud-example.ts` example shows how to combine CRUD operations with real-time listeners:

```bash
# First build the library
npm run build

# Then run the example
npx ts-node examples/realtime-crud-example.ts
```

This example demonstrates:

- Creating a document with immediate setup of a listener to track changes
- Updating a document with real-time feedback
- Deleting a document while monitoring changes in the parent collection
- Properly terminating all listeners

### Running the User Name Update Example

The `user-name-update-example.ts` example shows how to combine data updates with real-time UI updates:

```bash
# First build the library
npm run build

# Then run the example
npx ts-node examples/user-name-update-example.ts
```

This example demonstrates:

- Comparison of the old approach with `refetch` and the new approach with `useListener`
- How to update a user's name and immediately reflect changes in the list
- More efficient data management with real-time listeners
- Advantages of the new approach for developing reactive applications

### Running the Simplified Real-Time Updates Example (recommended)

The `simple-realtime-updates.ts` example shows the simplest and most efficient way to implement real-time updates:

```bash
# First build the library
npm run build

# Then run the example
npx ts-node examples/simple-realtime-updates.ts
```

This example demonstrates:

- Setting up a real-time listener for automatic UI updates
- Updating data in "silent mode" - without unnecessary data retrieval
- How Firestore automatically propagates changes to all active listeners
- Sorting and filtering collections in real-time

For a detailed explanation of this approach, read [SIMPLE-REALTIME-README.md](./SIMPLE-REALTIME-README.md).

### Running the Error Handling Example

The `error-handling-example.ts` example demonstrates the comprehensive error handling system:

```bash
# First build the library
npm run build

# Then run the example
npx ts-node examples/error-handling-example.ts
```

This example demonstrates:

- How to use custom error types for better error handling
- Checking specific error types (ValidationError, NotFoundError, etc.)
- Using the handleError utility to convert generic errors to structured errors
- Error handling in real-time listeners
- Try-catch patterns with custom error types

### Running the Logging Example

The `logging-example.ts` example demonstrates the comprehensive logging system:

```bash
# First build the library
npm run build

# Then run the example
npx ts-node examples/logging-example.ts
```

This example demonstrates:

- Configuring different log levels (DEBUG, INFO, WARN, ERROR)
- Creating custom loggers for different parts of your application
- Customizing log format with timestamps and operation names
- Setting up custom log handlers for production environments
- Integrating logging with Firebase operations
- Best practices for debugging during development and logging in production

## Firebase Configuration

All examples require Firebase configuration. In a real application, you should use your own configuration details:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

For increased security, we recommend:

- Using environment variables in production environments
- For React applications, using variables starting with `REACT_APP_`
- For Next.js, using variables starting with `NEXT_PUBLIC_`
- For Vue.js (with Vite), using variables starting with `VITE_`

## Usage Notes

### TypeScript

All examples are implemented with TypeScript for better type checking and development experience. The `firestore-helper-ts` library fully supports type definitions.

### Data Structure

In the examples, we use various collections and data structures to demonstrate the flexibility of the library. In a real application, you should design your own data structures according to the needs of your application.

### Extending the Examples

These examples serve as basic demonstrations. For more complex applications, consider implementing:

- User authentication using Firebase Authentication
- More complex queries and filtering
- Implementation of transactions and batch operations
- Performance optimization when loading data
- Using real-time listeners to create reactive applications
