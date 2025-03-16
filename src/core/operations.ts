/**
 * IMPORTANT: This file is only kept for backward compatibility.
 *
 * All functions have been moved to separate files in the operations folder:
 * - getData => src/core/operations/getData.ts
 * - updateData => src/core/operations/updateData.ts
 * - createData => src/core/operations/createData.ts
 * - deleteData => src/core/operations/deleteData.ts
 *
 * Please import these functions from 'src/core' or directly from 'src/core/operations'.
 */

// Directly export functions for backward compatibility
export { getData } from "./operations/getData";
export { updateData } from "./operations/updateData";
export { createData } from "./operations/createData";
export { deleteData } from "./operations/deleteData";
