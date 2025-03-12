import { doc, setDoc, updateDoc, DocumentReference } from "firebase/firestore";
import { getFirebaseInstance } from "../firebase";
import { joinPath } from "../../utils/formatters";
import { UpdateOptions, Result } from "../../types";
import { getData } from "./getData";

/**
 * Aktualizuje nebo vytvoří dokument v Firestore
 * @param options - Parametry pro aktualizaci
 * @returns Výsledek operace
 */
export async function updateData<T = any>(
  options: UpdateOptions
): Promise<Result<T>> {
  const { path, docId, data, merge = true, refetch = true } = options;

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
