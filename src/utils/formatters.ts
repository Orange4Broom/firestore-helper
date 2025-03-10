import {
  DocumentSnapshot,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";

/**
 * Formátuje Firestore dokument do použitelného objektu
 * @param doc - Dokument z Firestore
 * @returns Formátovaný dokument s ID
 */
export function formatDocument<T = Record<string, any>>(
  doc: DocumentSnapshot<DocumentData>
): T | null {
  if (!doc.exists()) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  } as T;
}

/**
 * Konvertuje Firestore kolekci na pole objektů
 * @param snapshot - Snapshot kolekce z Firestore
 * @returns Pole formátovaných dokumentů
 */
export function formatCollection<T = Record<string, any>>(
  snapshot: QuerySnapshot<DocumentData>
): T[] {
  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs
    .map((doc) => formatDocument<T>(doc))
    .filter(Boolean) as T[];
}

/**
 * Sloučí cestu a ID dokumentu do jedné cesty
 * @param path - Základní cesta ke kolekci
 * @param docId - ID dokumentu
 * @returns Kompletní cesta
 */
export function joinPath(path: string, docId?: string): string {
  if (!docId) {
    return path;
  }

  return `${path}/${docId}`;
}
