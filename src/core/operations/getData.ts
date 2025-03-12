import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  CollectionReference,
  Query,
} from "firebase/firestore";
import { getFirebaseInstance } from "../firebase";
import {
  formatDocument,
  formatCollection,
  joinPath,
} from "../../utils/formatters";
import {
  GetOptions,
  Result,
  WhereFilterOp,
  OrderByDirection,
} from "../../types";

/**
 * Získá data z Firestore podle zadaných parametrů
 * @param options - Parametry pro získání dat
 * @returns Výsledek operace
 */
export async function getData<T = any>(
  options: GetOptions
): Promise<Result<T>> {
  const {
    path,
    docId,
    where: whereOptions,
    orderBy: orderByOptions,
    limit: limitCount,
  } = options;

  try {
    const { firestore } = getFirebaseInstance();

    // Pokud je zadáno ID dokumentu, získáme jeden dokument
    if (docId) {
      const docRef = doc(firestore, joinPath(path, docId));
      const snapshot = await getDoc(docRef);

      const data = formatDocument<T>(snapshot);
      return { data, error: null, loading: false };
    }

    // Jinak získáme kolekci a aplikujeme filtry
    let collectionRef: CollectionReference = collection(firestore, path);
    let queryRef: Query = collectionRef;

    // Aplikujeme where podmínky
    if (whereOptions && whereOptions.length > 0) {
      whereOptions.forEach(([field, op, value]) => {
        queryRef = query(queryRef, where(field, op as WhereFilterOp, value));
      });
    }

    // Aplikujeme řazení
    if (orderByOptions && orderByOptions.length > 0) {
      orderByOptions.forEach(([field, direction]) => {
        queryRef = query(
          queryRef,
          orderBy(field, direction as OrderByDirection)
        );
      });
    }

    // Aplikujeme limit
    if (limitCount) {
      queryRef = query(queryRef, limit(limitCount));
    }

    const snapshot = await getDocs(queryRef);
    const data = formatCollection<T>(snapshot) as unknown as T;

    return { data, error: null, loading: false };
  } catch (error) {
    console.error("Chyba při získávání dat:", error);
    return { data: null, error: error as Error, loading: false };
  }
}
