import { doc, deleteDoc, DocumentReference } from "firebase/firestore";
import { getFirebaseInstance } from "../firebase";
import { joinPath } from "../../utils/formatters";
import { DeleteOptions, Result } from "../../types";
import { getData } from "./getData";

/**
 * Smaže dokument z Firestore
 * @param options - Parametry pro smazání
 * @returns Výsledek operace
 */
export async function deleteData(
  options: DeleteOptions
): Promise<Result<null>> {
  const { path, docId, refetch = true } = options;

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
