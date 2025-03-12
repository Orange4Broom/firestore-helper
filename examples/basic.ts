/**
 * Základní příklad použití Firestore Helper
 *
 * Tento příklad ukazuje použití named exports, což je doporučený způsob
 */
import {
  initialize,
  get,
  create,
  update,
  removeDoc, // Použijeme removeDoc místo delete (klíčové slovo)
  // Import typů
  Result,
  GetOptions,
  UpdateOptions,
} from "../src";

// Definice typů pro TypeScript
interface User {
  id?: string;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

async function main() {
  try {
    // 1. Inicializace Firebase
    initialize({
      apiKey: "YOUR_API_KEY",
      authDomain: "your-app.firebaseapp.com",
      projectId: "your-app",
      storageBucket: "your-app.appspot.com",
      messagingSenderId: "YOUR_MESSAGING_ID",
      appId: "YOUR_APP_ID",
    });

    console.log("Firebase inicializován");

    // Příklad definice options pomocí typů
    const createOptions: UpdateOptions = {
      path: "users",
      data: {
        name: "Jan Novák",
        email: "jan@example.com",
        age: 30,
        isActive: true,
      },
    };

    // 2. Vytvoření uživatele
    const createResult: Result<User & { id: string }> = await create<User>(
      createOptions
    );

    if (createResult.error) {
      throw new Error(
        `Chyba při vytváření uživatele: ${createResult.error.message}`
      );
    }

    const userId = createResult.data?.id;
    console.log(`Vytvořen nový uživatel s ID: ${userId}`);

    // 3. Získání uživatele podle ID
    const getOptions: GetOptions = {
      path: "users",
      docId: userId,
    };
    const getUserResult = await get<User>(getOptions);

    console.log("Získaný uživatel:", getUserResult.data);

    // 4. Aktualizace uživatele
    const updateResult = await update<User>({
      path: "users",
      docId: userId,
      data: {
        age: 31,
        lastLogin: new Date(),
      },
      refetch: true, // Získáme automaticky aktualizovaná data
    });

    console.log("Aktualizovaný uživatel:", updateResult.data);

    // 5. Získání všech aktivních uživatelů
    const activeUsersResult = await get<User[]>({
      path: "users",
      where: [
        ["isActive", "==", true],
        ["age", ">", 25],
      ],
      orderBy: [["name", "asc"]],
    });

    console.log(
      `Nalezeno ${activeUsersResult.data?.length || 0} aktivních uživatelů:`
    );
    activeUsersResult.data?.forEach((user) => {
      console.log(`- ${user.name} (${user.email}), věk: ${user.age}`);
    });

    // 6. Smazání uživatele
    const deleteResult = await removeDoc({
      path: "users",
      docId: userId,
    });

    if (!deleteResult.error) {
      console.log(`Uživatel s ID ${userId} byl úspěšně smazán`);
    }
  } catch (error) {
    console.error("Chyba:", error);
  }
}

// Spuštění příkladu
main()
  .then(() => console.log("Příklad dokončen"))
  .catch((error) => console.error("Chyba v hlavní funkci:", error));
