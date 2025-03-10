import { FirebaseOptions, FirebaseApp } from "firebase/app";
import { Firestore } from "firebase/firestore";

/**
 * Konfigurace Firebase
 */
export type FirebaseConfig = FirebaseOptions;

/**
 * Stav Firebase instance
 */
export interface FirebaseState {
  app: FirebaseApp | null;
  firestore: Firestore | null;
  initialized: boolean;
}

/**
 * Možnosti pro získání dat
 */
export interface GetOptions {
  /** Cesta ke kolekci nebo dokumentu v Firestore */
  path: string;
  /** Volitelná ID dokumentu pokud získáváme jeden dokument z kolekce */
  docId?: string;
  /** Volitelný objekt s podmínkami pro filtrování kolekce */
  where?: Array<[string, WhereFilterOp, any]>;
  /** Volitelné řazení výsledků */
  orderBy?: Array<[string, OrderByDirection?]>;
  /** Volitelný limit počtu dokumentů */
  limit?: number;
}

/**
 * Možnosti pro aktualizaci dat
 */
export interface UpdateOptions {
  /** Cesta ke kolekci nebo dokumentu v Firestore */
  path: string;
  /** ID dokumentu, pokud aktualizujeme dokument v kolekci */
  docId?: string;
  /** Data k aktualizaci */
  data: Record<string, any>;
  /** Zda provést merge (true) nebo přepsat celý dokument (false) */
  merge?: boolean;
  /** Zda automaticky získat aktualizovaná data po úspěšné aktualizaci */
  refetch?: boolean;
}

/**
 * Možnosti pro mazání dat
 */
export interface DeleteOptions {
  /** Cesta ke kolekci nebo dokumentu v Firestore */
  path: string;
  /** ID dokumentu, pokud mažeme dokument v kolekci */
  docId?: string;
  /** Zda automaticky získat aktualizovaná data po úspěšném smazání */
  refetch?: boolean;
}

// Typy z Firebase pro zajištění TypeScript podpory
export type WhereFilterOp =
  | "<"
  | "<="
  | "=="
  | "!="
  | ">="
  | ">"
  | "array-contains"
  | "array-contains-any"
  | "in"
  | "not-in";

export type OrderByDirection = "asc" | "desc";

/**
 * Výsledek operace
 */
export interface Result<T = any> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}
