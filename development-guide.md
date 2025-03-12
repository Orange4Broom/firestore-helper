# Příručka pro vývoj a publikování balíčku

## 1. Publikování nové verze balíčku

Když jste připraveni vydat novou verzi vašeho balíčku, postupujte podle těchto kroků:

### A) Aktualizace verze v package.json

Můžete buď upravit verzi ručně v souboru `package.json`, nebo (doporučeno) použít npm příkaz, který to udělá za vás a zároveň vytvoří commit:

```bash
# Pro zvýšení patch verze (1.2.0 -> 1.2.1)
npm version patch

# Pro zvýšení minor verze (1.2.0 -> 1.3.0)
npm version minor

# Pro zvýšení major verze (1.2.0 -> 2.0.0)
npm version major
```

Toto nejen aktualizuje číslo verze v `package.json`, ale také automaticky vytvoří git commit a tag s touto verzí.

> **Tip:** Verze se řídí podle pravidel sémantického verzování (SemVer):
>
> - **patch** - pro opravy bugů a malé změny, které neovlivňují API
> - **minor** - pro nové funkce, které jsou zpětně kompatibilní
> - **major** - pro změny, které mění API a nejsou zpětně kompatibilní

### B) Vytvoření a push tagu

Pokud jste použili `npm version`, tag už byl vytvořen automaticky. Stačí ho jen pushnout na GitHub:

```bash
# Push změn v kódu
git push origin master

# Push tagu (důležité!)
git push origin --tags
```

Případně, pokud chcete ručně vytvořit tag:

```bash
# Vytvoření tagu (musí začínat "v" + číslo verze)
git tag v1.2.3

# Push tagu na GitHub
git push origin v1.2.3
```

### C) Sledování průběhu publikování

Po pushnutí tagu GitHub Actions automaticky:

1. Spustí workflow definovaný v `.github/workflows/publish.yml`
2. Zkontroluje a otestuje kód
3. Vybuduje distribuční verzi balíčku
4. Publikuje balíček na npm
5. Vytvoří GitHub Release s poznámkami

Průběh publikování můžete sledovat na:

- Záložce "Actions" ve vašem GitHub repozitáři: https://github.com/Orange4Broom/firestore-helper/actions
- V sekci "Releases" po dokončení: https://github.com/Orange4Broom/firestore-helper/releases

Po úspěšném dokončení bude nová verze balíčku dostupná na npm registru.

## 2. Průběžný vývoj s větvemi a pull requesty

Pro systematický vývoj nových funkcí nebo opravu bugů je vhodné používat izolované větve:

### A) Vytvoření nové větve pro vývoj funkce

```bash
# Ujistěte se, že máte aktuální master
git checkout master
git pull origin master

# Vytvořte novou větev s popisným názvem
git checkout -b feature/novy-modul
# nebo
git checkout -b fix/oprava-chyby-v-api
```

Konvence pro názvy větví:

- `feature/nazev-funkce` - pro nové funkce
- `fix/nazev-opravy` - pro opravy chyb
- `docs/nazev-dokumentace` - pro aktualizace dokumentace
- `refactor/popis` - pro refaktorování kódu

### B) Vývoj a commit změn

Pracujte na funkcionalitě ve své větvi a dělejte commity:

```bash
# Přidání změněných souborů
git add .

# Commit s popisným komentářem
git commit -m "Add: Implementace nového modulu pro práci s transakcemi"
```

Tipy pro commit zprávy:

- Používejte prefixů jako "Add:", "Fix:", "Update:", "Refactor:" pro přehlednost
- Pište v přítomném čase, např. "Add" místo "Added"
- Udržujte zprávy stručné, ale informativní

### C) Push větve a vytvoření pull requestu

```bash
# Push vaší větve na GitHub
git push origin feature/novy-modul
```

Poté přejděte na GitHub a vytvořte Pull Request:

1. Jděte na váš repozitář
2. Klikněte na "Pull requests" > "New pull request"
3. Vyberte jako cílovou větev `master` a jako zdrojovou vaši větev `feature/novy-modul`
4. Napište popis změn v PR
5. Klikněte na "Create pull request"

### D) Automatické testování v pull requestu

Po vytvoření pull requestu se automaticky spustí CI workflow:

1. GitHub Actions zkontroluje váš kód
2. Spustí testy na různých verzích Node.js
3. Zkontroluje, zda build prochází

Výsledek testů uvidíte přímo v pull requestu - buď zelená fajfka (prošlo) nebo červený křížek (selhalo).

### E) Review, úpravy a merge

1. Pokud testy selžou, opravte problémy ve vaší větvi a pushněte znovu
2. Po úspěšném testu může být PR reviewován dalšími vývojáři
3. Po schválení můžete PR sloučit do masteru pomocí tlačítka "Merge pull request"
4. Pak můžete smazat vaši větev

## 3. Práce s Dependabotem

Dependabot automaticky kontroluje závislosti vašeho projektu a vytváří pull requesty s aktualizacemi:

### A) Jak Dependabot funguje

1. Každý týden (podle konfigurace v `.github/dependabot.yml`) kontroluje všechny závislosti
2. Pokud najde zastaralé balíčky, vytvoří pull request s aktualizací
3. U minor a patch aktualizací bude automaticky schválen a sloučen (podle workflow v `.github/workflows/dependabot-auto-merge.yml`)
4. Pro major aktualizace je vyžadován manuální review a merge

### B) Práce s Dependabot pull requesty

Pro major aktualizace nebo pull requesty, které se nemergnuly automaticky:

1. Zkontrolujte změny v PR
2. Pusťte testy lokálně, pokud potřebujete dodatečná ověření
3. Pokud vše vypadá v pořádku, schvalte a sloučte PR
4. Pokud update působí problémy, můžete PR zavřít a ignorovat aktualizaci, nebo ručně upravit verzi v `package.json`
