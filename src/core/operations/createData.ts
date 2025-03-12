import { collection, doc, setDoc } from "firebase/firestore";
import { getFirebaseInstance } from "../firebase";
import { UpdateOptions, Result } from "../../types";
import { getData } from "./getData";

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
