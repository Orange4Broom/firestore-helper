/**
 * DŮLEŽITÉ: Tento soubor je zachován pouze pro zpětnou kompatibilitu.
 *
 * Všechny funkce byly přesunuty do samostatných souborů ve složce operations:
 * - getData => src/core/operations/getData.ts
 * - updateData => src/core/operations/updateData.ts
 * - createData => src/core/operations/createData.ts
 * - deleteData => src/core/operations/deleteData.ts
 *
 * Pro přístup k těmto funkcím prosím importujte z 'src/core' nebo přímo z 'src/core/operations'.
 */

// Přímo exportujeme funkce pro zpětnou kompatibilitu
export { getData } from "./operations/getData";
export { updateData } from "./operations/updateData";
export { createData } from "./operations/createData";
export { deleteData } from "./operations/deleteData";
