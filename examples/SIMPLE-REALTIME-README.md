# Simple Real-Time Approach with Automatic Updates

This document explains how to effectively implement real-time data updates using the `firestore-helper-ts` library. Using the new `silent` parameter in combination with the `listen` function, you can create highly reactive applications with minimal effort.

## Basic Principle

The basic idea is simple:

1. Set up a **real-time listener** for the data you want to monitor
2. When updating data, use **silent mode**, which doesn't return data, only potential errors
3. The existing listener **automatically captures changes** and updates your UI

This approach is much cleaner and more efficient than older methods that required refetching data after updates.

## How It Works

### 1. Setting Up a Real-Time Listener

First, set up a listener for the collection or document you want to monitor:

```typescript
// Setting up a listener for the users collection
const unsubscribe = listen<User[]>({
  path: "users",
  orderBy: [["name", "asc"]],
  onNext: (users) => {
    // This function is called on first load and each change
    displayUsers(users); // Update UI with new data
  },
});
```

### 2. Updating Data in Silent Mode

When you need to update data, use the `silent: true` parameter:

```typescript
// Update a user's name
const result = await update({
  path: "users",
  docId: "user123",
  data: {
    name: "New Name",
    lastUpdated: new Date(),
  },
  silent: true, // Function returns only potential errors, not data
});

// Handle potential errors
if (result.error) {
  console.error("Error during update:", result.error);
} else {
  // UI updates automatically thanks to the existing listener
  console.log("Successfully updated");
}
```

### 3. Terminating the Listener

When you no longer need to monitor changes (e.g., when unmounting a component), terminate the listener:

```typescript
// Terminate the listener
unsubscribe();
```

## Complete Example in a React Component

```tsx
import React, { useState, useEffect } from "react";
import { listen, update } from "firestore-helper-ts";

function UsersList() {
  const [users, setUsers] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Set up listener when component loads
    const unsubscribe = listen({
      path: "users",
      orderBy: [["lastUpdated", "desc"]],
      onNext: (updatedUsers) => {
        setUsers(updatedUsers);
      },
    });

    // Terminate listener when component unmounts
    return () => unsubscribe();
  }, []);

  // Function to change a user's name
  const handleNameChange = async (userId, newName) => {
    setIsUpdating(true);
    try {
      const result = await update({
        path: "users",
        docId: userId,
        data: {
          name: newName,
          lastUpdated: new Date(),
        },
        silent: true, // Silent mode
      });

      if (result.error) {
        alert(`Error: ${result.error.message}`);
      }
      // No need to do anything to update UI - the listener does it automatically
    } catch (e) {
      alert(`Unexpected error: ${e.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <h1>Users List</h1>
      {isUpdating && <div>Updating...</div>}
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name}
            <button
              onClick={() => handleNameChange(user.id, `${user.name} (edited)`)}
            >
              Edit Name
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Advantages of This Approach

1. **Simpler code** - no need to manually update UI or refetch data
2. **Less network traffic** - data is loaded only once
3. **Immediate updates** - changes appear in the UI as soon as Firestore processes them
4. **Consistent data** - all components using the same listener see the same data
5. **Less state code** - no need to store data in multiple places

## Practical Use Cases

### List and Detail View

```tsx
// Component for list and detail
const TaskManager = () => {
  // Listener for task collection
  useEffect(() => {
    const unsubscribe = listen({
      path: "tasks",
      orderBy: [["priority", "desc"]],
      onNext: (tasks) => setTasks(tasks),
    });
    return () => unsubscribe();
  }, []);

  // Function to mark a task as completed
  const markAsCompleted = async (taskId) => {
    await update({
      path: "tasks",
      docId: taskId,
      data: { completed: true },
      silent: true,
    });
    // No need to update the list - the listener updates it automatically
  };
};
```

### Edit Form

```tsx
// Component for editing a user
const EditUserForm = ({ userId }) => {
  const [formData, setFormData] = useState({ name: "", email: "" });

  // Function to save changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    await update({
      path: "users",
      docId: userId,
      data: formData,
      silent: true,
    });
    // After form submission, all components using the same listener automatically update
  };
};
```
