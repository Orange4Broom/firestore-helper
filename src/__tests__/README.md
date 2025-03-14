# Firestore Helper Testing

This directory contains unit tests for the Firestore Helper library.

## Testing Approaches

Tests use [Jest](https://jestjs.io/) as a testing framework and are structured according to the main components of the library:

- **Firebase Core** - tests for initialization and Firebase instances
- **CRUD operations** - tests for getData, createData, updateData, deleteData
- **Utilities** - tests for helper functions such as formatters and path joining

## Running Tests

```bash
# Run all tests
npm test

# Run tests with watch mode for development
npm run test:watch

# Run tests with code coverage
npm run test:coverage
```

## Mocking Structure

Tests use mocking of Firebase services to avoid communicating with an actual Firebase instance. Mocking is set up in the `jest.setup.js` file.

For most tests, we use this approach:

1. We mock `getFirebaseInstance` to return a mocked Firebase instance
2. We mock Firebase functions (getDoc, collection, etc.)
3. We test the behavior of our functions with mocked dependencies
4. We verify that our functions call Firebase in the correct way

## Adding New Tests

When adding new tests, follow this pattern:

1. Create a file `[feature].test.ts` in the `__tests__` directory
2. Mock all necessary dependencies
3. Write tests for all possible scenarios:
   - Successful execution
   - Error states
   - Edge cases

## Testing Tips

- Use pre-prepared testing utilities when possible
- Test error scenarios for each function
- Ensure test isolation so tests are not dependent on each other
- Use describe blocks for logical grouping of tests
