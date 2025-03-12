// Re-export všech operací z operations složky
export * from "./operations";

// Re-export původního souboru operations, pro zachování kompatibility
export * from "./operations";

// Re-exportujeme firebase instanci pro snadnější přístup
export { getFirebaseInstance } from "./firebase";
