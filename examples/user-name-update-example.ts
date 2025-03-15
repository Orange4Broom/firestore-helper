/**
 * Příklad aktualizace jména uživatele s okamžitou aktualizací seznamu
 *
 * Tento příklad ukazuje, jak využít real-time listenery pro okamžitou aktualizaci
 * seznamu uživatelů po změně dat, bez nutnosti manuálního opětovného načítání.
 */
import { initialize, create, update, listen, Result } from "../src";

// Definice typu User
interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  lastUpdated: any; // Časové razítko Firestore
}

async function userNameUpdateExample() {
  try {
    // Inicializace Firebase
    initialize({
      apiKey: "YOUR_API_KEY",
      authDomain: "your-app.firebaseapp.com",
      projectId: "your-app",
      storageBucket: "your-app.appspot.com",
      messagingSenderId: "YOUR_MESSAGING_ID",
      appId: "YOUR_APP_ID",
    });

    console.log("Firebase inicializován");

    // Vytvoříme nějaké testovací uživatele
    console.log("\nVytváření testovacích uživatelů...");

    await create<User>({
      path: "users",
      data: {
        name: "Jan Novák",
        email: "jan.novak@example.com",
        role: "admin",
        lastUpdated: new Date(),
      },
    });

    const userJiriResult = (await create<User>({
      path: "users",
      data: {
        name: "Jiří Dvořák",
        email: "jiri.dvorak@example.com",
        role: "user",
        lastUpdated: new Date(),
      },
    })) as Result<User & { id: string }>;

    await create<User>({
      path: "users",
      data: {
        name: "Petra Svobodová",
        email: "petra.svobodova@example.com",
        role: "user",
        lastUpdated: new Date(),
      },
    });

    const jiriId = userJiriResult.data?.id;
    console.log(`Vytvořeni 3 uživatelé. ID pro Jiřího: ${jiriId}`);
    console.log("----------------------------------------");

    // 1. STARÝ ZPŮSOB: Naslouchání seznamu a samostatná aktualizace s refetch
    console.log("\n----- STARÝ ZPŮSOB S REFETCH -----");

    // Nastavíme posluchače na kolekci uživatelů
    console.log("Nastavení posluchače na kolekci uživatelů...");
    let usersList: User[] = [];

    const unsubscribeUsersList = listen<User[]>({
      path: "users",
      orderBy: [["name", "asc"]],
      onNext: (users) => {
        usersList = users;
        // Simulace aktualizace UI
        console.log("\nSeznam uživatelů byl aktualizován:");
        users.forEach((user) => {
          console.log(`- ${user.name} (${user.email}), role: ${user.role}`);
        });
        console.log("----------------------------------------");
      },
    });

    // Počkáme, aby se listener stihl inicializovat
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Samostatné aktualizování uživatele s refetch
    console.log("\nAktualizace jména uživatele (starý způsob)...");
    await update<User>({
      path: "users",
      docId: jiriId,
      data: {
        name: "Jiří Dvořák-Novotný", // Změna příjmení
        lastUpdated: new Date(),
      },
      refetch: true, // Starý způsob - vrátí jen aktualizovaného uživatele, ne celý seznam
    });

    // Počkáme, aby se aktualizace projevila v listeneru
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // V tomto bodě se seznam uživatelů již automaticky aktualizoval díky listeneru
    console.log(
      "\nKomentář: Všimněte si, že seznam se aktualizoval automaticky, i když jsme použili refetch: true"
    );
    console.log(
      "To je proto, že Firestore poslal událost aktualizace dokumentu, kterou zachytil náš listener."
    );
    console.log(
      "Refetch v tomto případě jen způsobil duplicitní načtení dat a nijak nepomohl aktualizaci seznamu."
    );
    console.log("----------------------------------------");

    // Ukončíme posluchače a počkáme chvíli
    console.log("\nUkončení prvního posluchače...");
    unsubscribeUsersList();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 2. NOVÝ ZPŮSOB: Aktualizace s použitím useListener
    console.log("\n----- NOVÝ ZPŮSOB S useListener -----");

    // Aktualizace uživatele a zároveň nastavení posluchače na změny
    console.log("\nAktualizace jména uživatele s useListener...");

    // Typ pro funkci, kterou již můžeme volat pro odhlášení listeneru
    let unsubscribeUpdate: () => void = () => {};

    await update<User>({
      path: "users",
      docId: jiriId,
      data: {
        name: "JUDr. Jiří Dvořák-Novotný", // Přidáme titul
        lastUpdated: new Date(),
      },
      useListener: true, // Nový způsob - nastaví real-time posluchač
      onNext: (updatedUser) => {
        console.log("\nUživatel byl aktualizován:");
        console.log(
          `- ${updatedUser.name} (${updatedUser.email}), role: ${updatedUser.role}`
        );
        console.log(
          `- Poslední aktualizace: ${updatedUser.lastUpdated
            .toDate()
            .toLocaleString()}`
        );
        console.log("----------------------------------------");

        // Tady by mohlo být:
        // updateUserInUIList(updatedUser);
      },
    }).then((result) => {
      // Kontrolujeme typ výsledku a nastavíme unsubscribe funkci pokud je to funkce
      if (typeof result === "function") {
        unsubscribeUpdate = result;
      }
    });

    // Počkáme, aby se aktualizace projevila
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Nastavíme posluchač na celý seznam pro aktualizaci UI
    console.log("\nNastavení posluchače na celý seznam uživatelů...");

    const unsubscribeListView = listen<User[]>({
      path: "users",
      orderBy: [["name", "asc"]],
      onNext: (users) => {
        // Simulace aktualizace UI seznamu
        console.log("\nSeznam uživatelů byl aktualizován:");
        users.forEach((user) => {
          console.log(`- ${user.name} (${user.email}), role: ${user.role}`);
        });
        console.log("----------------------------------------");
      },
    });

    // Počkáme moment
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Provedeme další aktualizaci, abychom viděli real-time aktualizaci
    console.log("\nDalší aktualizace jména uživatele...");
    await update<User>({
      path: "users",
      docId: jiriId,
      data: {
        name: "JUDr. Ing. Jiří Dvořák-Novotný MBA", // Další tituly
        lastUpdated: new Date(),
      },
    });

    // Počkáme, aby se aktualizace projevila v obou listenerech
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Ukončení všech posluchačů
    console.log("\nUkončení všech posluchačů...");
    unsubscribeUpdate();
    unsubscribeListView();

    console.log("\n----- VÝHODY NOVÉHO PŘÍSTUPU -----");
    console.log("1. Při aktualizaci dat můžeme okamžitě reagovat na změny");
    console.log(
      "2. Není třeba volat další dotaz pro získání aktuálních dat (žádný refetch)"
    );
    console.log("3. Real-time aktualizace UI bez manuálního překreslování");
    console.log(
      "4. Můžeme mít zároveň posluchač na dokument i na celou kolekci"
    );
    console.log("5. Lepší typová kontrola díky generickým typům");

    console.log("\nPříklad úspěšně dokončen!");
  } catch (error) {
    console.error("Chyba v příkladu:", error);
  }
}

// Spuštění příkladu
if (require.main === module) {
  userNameUpdateExample()
    .then(() => console.log("\nAplikace byla ukončena"))
    .catch((err) => console.error("Chyba při spuštění příkladu:", err))
    .finally(() => process.exit(0));
}
