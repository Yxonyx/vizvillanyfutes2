# VízVillanyFűtés - Átfogó Technikai Audit & Optimalizációs Javaslatok

Ez a dokumentum összefoglalja a `vizvillanyfutes.hu` projekt kódbázisának architekturális, strukturális és teljesítménybeli gyenge pontjait. A cél a felesleges kódok (anti-pattek), a nem optimális megoldások és a potenciális hibalehetőségek listázása egy System Architect / Full-Stack Engineer nézőpontjából.

---

## 1. Állapotkezelés és Adatlekérés (Data Fetching)
**Probléma:** A projekt nem használ modern adatlekérő könyvtárakat (pl. `SWR` vagy `React Query`). Ehelyett egyedi `useEffect` hookokkal és lokális state-ekkel (`isLoading`, `error`, `data`) történik minden API hívás.
* **Hibafaktor:** Ez rengeteg boilerplate ("ismétlődő, felesleges") kódot eredményez minden oldalon.
* **Cache-elés hiánya:** Nincs automatikus újra-lekérés (revalidation focus-ra), cache menedzsment. A fejlesztő kényszerből `?_t=${Date.now()}` query paramétereket használ az aszinkron `fetch` hívásoknál a cache "kikerülésére", ami egy komoly anti-pattern Next.js környezetben.
* **Megoldás:** Átállás `useSWR`-re, vagy a Next.js 14 beépített Server Actions / React Cache mechanizmusaira.

## 2. "God Component" Anti-pattern (Hatalmas fájlok)
**Probléma:** A fő dashboardok (`admin/page.tsx`, `ugyfel/dashboard/page.tsx`, `contractor/dashboard/page.tsx`) masszív, 600-1400 soros "Isten komponensek".
* **Karbantarthatatlanság:** Egyetlen fájlban van a teljes elrendezés (HTML/Tailwind), az adatkérés (API), a bonyolult állapotkezelés (fülek, térkép), az animációs logika és a felugró ablakok (Modals) is.
* **Teljesítmény:** Minden apró state változás (pl. egy tab átváltása vagy egy input mezőbe gépelés) újratenderelheti a teljes hatalmas komponenst, beleértve a nehéz `react-map-gl` térképet is (ha nincs megfelelően memo-izálva).
* **Megoldás:** Moduláris felosztás. (pl. kiszedni a Map komponenst, a Felugró ablakokat, a Listakártyákat külön `components/` fájlokba, és egyedi Hook-okba szervezni az üzleti logikát: `useJobs()`, `useContractors()`).

## 3. Optimista UI Frissítések "Rollback" Nélkül
**Probléma:** Az Admin panelen (`admin/page.tsx`) a műveleteknél (pl. szakember jóváhagyása) optimista frissítések vannak: a kód *azonnal* átírja a UI-t, még mielőtt a szerver válaszolna. 
* **Hibafaktor:** Ha a Supabase vagy az API hívás valamilyen okból hibát dob, az optimalizált state **nem fordul vissza** (no automatic rollback). A felhasználó azt látja, hogy sikeres a művelet a UI-on (zöld lesz a gomb), de közben kap egy apró `error` értesítést, és az adatbázisban a változás valójában nem történt meg.
* **Megoldás:** Állapot-visszaállítás (rollback) implementálása hiba esetén, vagy megvárni a szerver válaszát a state frissítése előtt.

## 4. Tisztítatlan CSS és lokális `<style>` Injekciók
**Probléma:** A `contractor/dashboard/page.tsx` fájlban egy masszív `<style>` blokk van JSX-be égetve, amely a Mapbox felugró ablakát (`.mapboxgl-popup`) hivatott formázni.
* **Globális szennyezés:** Ezek a stílusok nem "scoped" (nem lokálisak), bekerülnek a globális CSS fába.
* **Megoldás:** Ezeket a Tailwind osztályokba, vagy a globális `globals.css`-be kell tenni `@layer components` alpontba, így tisztább marad a React komponensfájl.

## 5. API Végpontok (Route Handlers) - Zsúfolt Üzleti Logika
**Probléma:** Az API végpontok (pl. `api/jobs/create/route.ts`) túlságosan sok mindent csinálnak egyszerre.
1. Beolvassák, értelmezik és validálják a form adatokat.
2. Kezelik a Supabase Auth "Lazy-registration" részét admin jogosultsággal.
3. Külső Mapbox Geocoding API-t hívnak meg címet fordítani.
4. Adatbázis tranzakciót indítanak egy bonyolult SQL RPC-n keresztül.
5. Végül Email értesítő szolgáltatást hívnak meg.
* **Hibafaktor (Törékenység):** Ha a kód 4. pontjában sikerül minden, de az 5. pont (email küldés) elszáll, a végpont logikája nehezen kezeli a részleges kudarcokat. 
* **Megoldás:** A Business logikát (Service Layer) szét kell választani magától a HTTP controllertől (a route fájltól). Létre kell hozni például egy `lib/services/jobService.ts` fájlt, és abban kezelni ezeket.

## 6. Biztonság / Általános Supabase Kliens Használat
**Probléma:** A Backend API-knál megfigyelhető a `createAdminClient()` kiterjedt használata, ami megkerüli az adatbázis beépített RLS (Row Level Security) biztonsági szabályait. 
* **Optimalizáció:** Bár egyelőre gyors megoldás, érdemes felülvizsgálni, hogy mindenhol valóban Service Role (admin) jog szükséges-e az API hívásokhoz, vagy bizonyos lépések (pl. egy job létrehozása) futtathatóak-e normál Authenticated / Anon szerepkörből megfelelően írt RLS policy-kkel.

---
**Összegzés:**
A jelenlegi architektúra egy kiváló MVP (Minimum Viable Product), gyorsan felépítve, de a jövőbeni méretezhetőség (scalability) és a kód karbantarthatósága megköveteli a "SWR" bevezetését, a fájlok darabolását, a globális CSS tisztítását és a hibaesetek (különösen api failed state) ellenállóbb kezelését.
