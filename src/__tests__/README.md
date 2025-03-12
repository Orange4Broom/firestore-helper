# Testování Firestore Helper

Tento adresář obsahuje jednotkové testy pro knihovnu Firestore Helper.

## Přístupy k testování

Testy používají [Jest](https://jestjs.io/) jako testovací framework a jsou strukturovány podle hlavních komponent knihovny:

- **Firebase Core** - testy inicializace a Firebase instancí
- **CRUD operace** - testy pro getData, createData, updateData, deleteData
- **Utility** - testy pro pomocné funkce jako formatery a spojování cest

## Spuštění testů

```bash
# Spustit všechny testy
npm test

# Spustit testy s watch módem pro vývoj
npm run test:watch

# Spustit testy s pokrytím kódu
npm run test:coverage
```

## Struktura mockování

Testy využívají mockování Firebase služeb, aby nemusely komunikovat se skutečnou Firebase instancí. Mockování je nastaveno v souboru `jest.setup.js`.

Pro většinu testů používáme tento přístup:

1. Mockujeme `getFirebaseInstance` aby vrátil mockovanou Firebase instanci
2. Mockujeme Firebase funkce (getDoc, collection, atd.)
3. Testujeme chování našich funkcí s mockovanými závislostmi
4. Ověřujeme, že naše funkce volají Firebase správným způsobem

## Přidávání nových testů

Při přidávání nových testů následujte tento vzor:

1. Vytvořte soubor `[feature].test.ts` v adresáři `__tests__`
2. Mockujte všechny potřebné závislosti
3. Napište testy pro všechny možné scénáře:
   - Úspěšné provedení
   - Chybové stavy
   - Okrajové případy

## Testovací tipy

- Používejte předpřipravené testovací utility, pokud je to možné
- Pro každou funkci testujte i chybové scénáře
- Dbejte na izolaci testů, aby testy nebyly navzájem závislé
- Využívejte describe bloky pro logické seskupení testů
