# Firestore Helper

Jednoduchý a flexibilní nástroj pro práci s Firebase Firestore. Tento balíček poskytuje sadu funkcí pro snadné čtení, zápis, aktualizaci a mazání dat z Firestore databáze s podporou TypeScript.

## Instalace

```bash
# NPM
npm install firestore-helper

# YARN
yarn add firestore-helper

# PNPM
pnpm add firestore-helper
```

## Základní použití

Balíček můžete používat dvěma způsoby:

### 1. Pomocí jednotlivých funkcí (doporučeno)

```typescript
import {
  initialize,
  get,
  create,
  update,
  removeDoc, // Použijte removeDoc místo 'delete' (což je rezervované klíčové slovo)
} from "firestore-helper";

// Inicializace
initialize({
  apiKey: "YOUR_API_KEY",
  // další konfigurace...
});

// Získání dat
const result = await get({ path: "users", docId: "user123" });

// Vytvoření dokumentu
const newDoc = await create({
  path: "products",
  data: { name: "Nový produkt" },
});

// Smazání dokumentu
await removeDoc({ path: "users", docId: "user123" });
```

### 2. Pomocí objektu FirestoreHelper

```typescript
import FirestoreHelper from "firestore-helper";

// Inicializace
FirestoreHelper.initialize({
  apiKey: "YOUR_API_KEY",
  // další konfigurace...
});

// Získání dat
const result = await FirestoreHelper.get({ path: "users", docId: "user123" });

// Pro smazání dokumentu můžete použít removeDoc jako alternativu k delete
await FirestoreHelper.removeDoc({ path: "users", docId: "user123" });
// NEBO
await FirestoreHelper.delete({ path: "users", docId: "user123" });
```

## Typy (TypeScript)

Balíček plně podporuje TypeScript, což umožňuje silné typování vašich dat:

```typescript
interface User {
  id?: string;
  name: string;
  email: string;
  age: number;
}

// Získání dat s typem
const result = await get<User>({
  path: "users",
  docId: "user123",
});

// Typ result.data bude User | null
if (result.data) {
  const user = result.data;
  console.log(`Jméno: ${user.name}, Věk: ${user.age}`);
}
```

## Řešení běžných problémů

### Problém s klíčovým slovem 'delete'

JavaScript/TypeScript má 'delete' jako rezervované klíčové slovo, což může způsobovat problémy při importu. Pro odstranění tohoto problému:

```typescript
// Použijte removeDoc místo delete
import { removeDoc } from "firestore-helper";

// NEBO při importu přejmenujte funkci
import { delete as removeDoc } from "firestore-helper";
```

### Problémy s importem v ESM/CommonJS prostředí

Pokud máte problémy s importem, zkuste tyto alternativní syntaxe:

```typescript
// ESM import
import * as FirestoreHelper from "firestore-helper";
const { initialize, get } = FirestoreHelper;

// CommonJS import
const FirestoreHelper = require("firestore-helper");
const { initialize, get } = FirestoreHelper;
```

### Problémy s TypeScript deklaracemi

Pokud TypeScript nerozpoznává typy, zkuste přidat soubor deklarace:

```typescript
// vite-env.d.ts nebo typings.d.ts
declare module "firestore-helper" {
  export function initialize(config: any): any;
  export function get(options: any): Promise<any>;
  export function create(options: any): Promise<any>;
  export function update(options: any): Promise<any>;
  export function removeDoc(options: any): Promise<any>;
  export function delete(options: any): Promise<any>;

  const FirestoreHelper: {
    initialize: typeof initialize;
    get: typeof get;
    create: typeof create;
    update: typeof update;
    delete: typeof delete;
    removeDoc: typeof removeDoc;
  };

  export default FirestoreHelper;
}
```

## API Reference

### initialize(config)

Inicializuje Firebase s danou konfigurací.

### get(options)

Získá data z Firestore s možností filtrování, řazení a limitu.

### create(options)

Vytvoří nový dokument s automaticky generovaným ID.

### update(options)

Aktualizuje nebo vytvoří dokument na zadané cestě.

### removeDoc(options) / delete(options)

Smaže dokument z Firestore.

### reset()

Resetuje inicializaci Firebase (většinou potřeba jen pro testování).

## Licence

ISC
