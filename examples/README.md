# Příklady použití firestore-helper-ts

V tomto adresáři najdete různé příklady implementace a použití knihovny `firestore-helper-ts` v různých frameworcích a prostředích.

## Obsah adresáře

### Základní příklady

- `basic.ts` - Základní příklad použití knihovny s TypeScriptem (bez frameworku)
- `react-example.tsx` - Jednoduchý příklad integrace s React

### Pokročilé příklady podle frameworku

#### React

- `react-hooks-example/UserManagement.tsx` - Moderní React aplikace využívající hooks a Context API

#### Next.js

- `nextjs-example/pages/users.tsx` - Příklad implementace v Next.js

#### Vue.js

- `vue-example/UserManagement.vue` - Příklad použití s Vue.js (Vue 3 s Composition API)

## Jak spustit příklady

Většina příkladů je určena jako ukázka kódu a není přímo spustitelná bez odpovídajícího projektu a infrastruktury. Pro použití těchto příkladů ve vlastní aplikaci:

1. Vytvořte projekt s příslušným frameworkem (React, Next.js, Vue.js)
2. Nainstalujte knihovnu `firestore-helper-ts` a Firebase:
   ```
   npm install firestore-helper-ts firebase
   ```
3. Zkopírujte a upravte kód podle potřeb vaší aplikace
4. Nahraďte konfigurační údaje Firebase vlastními hodnotami

## Firebase konfigurace

Všechny příklady vyžadují konfiguraci Firebase. V reálné aplikaci byste měli použít vlastní konfigurační údaje:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

Pro vyšší bezpečnost doporučujeme:

- V produkčním prostředí používat proměnné prostředí
- U React aplikací používat proměnné začínající s `REACT_APP_`
- U Next.js používat proměnné začínající s `NEXT_PUBLIC_`
- U Vue.js (s Vite) používat proměnné začínající s `VITE_`

## Poznámky k použití

### TypeScript

Všechny příklady jsou implementovány s TypeScriptem pro lepší typovou kontrolu a vývojovou zkušenost. Knihovna `firestore-helper-ts` plně podporuje typové definice.

### Struktura dat

V příkladech používáme různé kolekce a struktury dat jako demonstraci flexibility knihovny. V reálné aplikaci byste měli navrhnout vlastní datové struktury podle potřeb aplikace.

### Rozšíření příkladů

Tyto příklady slouží jako základní ukázky. Pro složitější aplikace zvažte implementaci:

- Autentizace uživatelů pomocí Firebase Authentication
- Složitějších dotazů a filtrování
- Implementace transakcí a dávkových operací
- Optimalizace výkonu při načítání dat
