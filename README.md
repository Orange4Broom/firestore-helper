# Firestore Helper

Useful utilities for working with Firebase Firestore.

## Installation

```bash
npm install firestore-helper
# or
yarn add firestore-helper
```

## Usage

```typescript
import { formatDocument, collectionToArray } from "firestore-helper";
// or
import firestoreHelper from "firestore-helper";

// Format a document
const formattedDoc = formatDocument(firestoreDoc);

// Convert collection to array
const docsArray = collectionToArray(firestoreCollection);
```

## API

### `formatDocument<T>(documentData: any): T`

Formats a Firestore document by adding the document ID to the data.

### `collectionToArray<T>(collection: any[]): T[]`

Converts a Firestore collection to an array of formatted documents.

## License

ISC
