import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  updateDoc,
  deleteDoc,
  DocumentReference,
  CollectionReference,
  Query,
} from "firebase/firestore";
import { getFirebaseInstance } from "./firebase";
import {
  formatDocument,
  formatCollection,
  joinPath,
} from "../utils/formatters";
import {
  GetOptions,
  UpdateOptions,
  DeleteOptions,
  Result,
  WhereFilterOp,
  OrderByDirection,
} from "../types";

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

/**
 * Aktualizuje nebo vytvoří dokument v Firestore
 * @param options - Parametry pro aktualizaci
 * @returns Výsledek operace
 */
export async function updateData<T = any>(
  options: UpdateOptions
): Promise<Result<T>> {
  const { path, docId, data, merge = true, refetch = false } = options;

  try {
    const { firestore } = getFirebaseInstance();

    let docReference: DocumentReference;

    // Vytvoříme referenci na dokument
    if (docId) {
      docReference = doc(firestore, joinPath(path, docId));
    } else {
      // Pokud není docId, předpokládáme, že path již obsahuje ID dokumentu
      docReference = doc(firestore, path);
    }

    // Aktualizujeme dokument
    if (merge) {
      await updateDoc(docReference, data);
    } else {
      await setDoc(docReference, data);
    }

    // Pokud je refetch true, získáme aktualizovaná data
    if (refetch) {
      return await getData<T>({
        path,
        docId: docId || docReference.id,
      });
    }

    return { data: null, error: null, loading: false };
  } catch (error) {
    console.error("Chyba při aktualizaci dat:", error);
    return { data: null, error: error as Error, loading: false };
  }
}

/**
 * Vytvoří nový dokument v Firestore s generovaným ID
 * @param options - Parametry pro vytvoření
 * @returns Výsledek operace včetně ID nového dokumentu
 */
export async function createData<
  T extends Record<string, any> = Record<string, any>
>(options: Omit<UpdateOptions, "docId">): Promise<Result<T & { id: string }>> {
  const { path, data, refetch = true } = options;

  try {
    const { firestore } = getFirebaseInstance();

    // Vytvoříme referenci na kolekci
    const collectionRef = collection(firestore, path);

    // Vytvoříme nový dokument s automaticky generovaným ID
    const newDocRef = doc(collectionRef);
    await setDoc(newDocRef, data);

    if (refetch) {
      const result = await getData<T & { id: string }>({
        path,
        docId: newDocRef.id,
      });

      return result;
    }

    return {
      data: { id: newDocRef.id, ...data } as T & { id: string },
      error: null,
      loading: false,
    };
  } catch (error) {
    console.error("Chyba při vytváření dat:", error);
    return { data: null, error: error as Error, loading: false };
  }
}

/**
 * Smaže dokument z Firestore
 * @param options - Parametry pro smazání
 * @returns Výsledek operace
 */
export async function deleteData(
  options: DeleteOptions
): Promise<Result<null>> {
  const { path, docId, refetch = false } = options;

  try {
    const { firestore } = getFirebaseInstance();

    let docReference: DocumentReference;

    // Vytvoříme referenci na dokument
    if (docId) {
      docReference = doc(firestore, joinPath(path, docId));
    } else {
      // Pokud není docId, předpokládáme, že path již obsahuje ID dokumentu
      docReference = doc(firestore, path);
    }

    // Smažeme dokument
    await deleteDoc(docReference);

    // Pokud je refetch true, pokusíme se získat aktualizovaná data
    if (refetch) {
      // Získáme nadřazenou kolekci
      const parentPath = path.split("/").slice(0, -1).join("/");

      if (parentPath) {
        return await getData({
          path: parentPath,
        });
      }
    }

    return { data: null, error: null, loading: false };
  } catch (error) {
    console.error("Chyba při mazání dat:", error);
    return { data: null, error: error as Error, loading: false };
  }
}
