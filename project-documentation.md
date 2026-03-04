# VízVillanyFűtés - Teljes Projekt Dokumentáció és Workflow Logika

Ez a dokumentum összefoglalja a `vizvillanyfutes.hu` projekt teljes koncepcionális logikáját, az adatbázis felépítését, a kritikus API végpontokat és a fő felhasználói (ügyfél/szakember) folyamatokat (workflow).

---

## 1. Technológiai Stack
- **Frontend & Backend (Meta-framework)**: Next.js 14+ (App Router)
- **Adatbázis & Autentikáció & Backend-as-a-Service**: Supabase (PostgreSQL, Auth, Edge Functions)
- **UI/Styling**: Tailwind CSS
- **Térképszolgáltatás**: Mapbox GL JS (`react-map-gl`)
- **Fizetési szolgáltató**: Stripe (tervezve/integrálva credit rendszerhez)
- **Kliensállapot (Data Fetching)**: SWR / React Hooks

---

## 2. Adatbázis Modell (Core Táblák)
Az adatok strukturáltan, relációsan kapcsolódnak egymáshoz:

1. **`user_meta`**: Kiterjeszti a Supabase beépített `auth.users` tábláját. Tartalmazza a felhasználó szerepkörét (`admin`, `dispatcher`, `contractor`, `customer`) és státuszát.
2. **`customers` / `addresses`**: Ügyféladatokat (név, telefon) és a munkavégzés pontos címét tároló táblák.
3. **`contractor_profiles`**: Szakemberek publikus és belső profiladatai (szakmák: `viz`, `villany`, `futes`, szolgáltatási területek, egyenleg/credit balance a lead-vásárláshoz).
4. **`leads`**: Átmeneti tábla az "egyszerűsített" vagy régi ügyfélbejelentésekhez. Amikor egy szaki érdeklődést mutat (vagy ha az API azonnal feldolgozza), ez átkonvertálódik `jobs` rekorddá.
5. **`jobs`**: Maga a konkrét "Munka" (probléma leírás, szakma, kategória, becsült ár, státusz: `new`, `open`, `assigned`, `in_progress`, `completed`). Összeköti a `customers` és `addresses` táblákat.
6. **`job_interests` / `job_assignments`**: Ez képezi a "Lead Piac" (Marketplace) alapját. A szaki érdeklődik a munkára (`job_interests`), amit az ügyfél elfogadhat.
7. **`open_jobs_map` (View)**: Egy biztonságos adatbázis-nézet (View), ami a publikusan elérhető, még szabad munkákat listázza a térképre a szakembereknek anélkül, hogy szenzitív ügyféladatokat szivárogtatna ki.

---

## 3. A Fő Workflow Logika (A Szolgáltatás Útja)

A platform lényege, hogy összeköti a bajba jutott lakosságot a hitelesített szerelőkkel, egy lead-alapú marketplace modellen keresztül.

### 3.1. Munka Létrehozása (Ügyfél Oldal)
1. Az ügyfél kitölti a főoldali bejelentő űrlapot (Landing Page). Megadja a címet, problémát (víz/villany/fűtés), nevet és telefont.
2. Az űrlap meghívja az `POST /api/jobs/create` végpontot.
3. **Lazy Auth (Jelszó nélküli fiók)**: A rendszer a háttérben létrehoz az ügyfél email címével egy Supabase fiókot jelszó nélkül, és küld egy "Magic Linket", amivel be tud lépni.
4. Egy Mapbox geocoding folyamat lefordítja a címet Google/Mapbox koordinátákká (lat, lng).
5. A `create_job_from_form` SQL RPC függvény meghívásával létrejön a `customer`, az `address` és a `jobs` rekord integráns módon tranzakcióban.
6. A kárigény láthatóvá válik a "Saját bejelentéseim" Ügyfél Dashboardon.

### 3.2. A Lead Piac (Szakember Oldal)
1. A regisztrált és jóváhagyott Szakember belép a `contractor/dashboard` felületre.
2. A `GET /api/contractor/marketplace` végpont lekéri a még nyitott, szabad munkákat az `open_jobs_map` View-ból + a `leads` táblából.
3. Ezek a leadek meg is jelennek egy interaktív térképen. A szakinak egyenlege (Credit/Hitel) van.

### 3.3. Érdeklődés és Elfogadás (Escrow Modell)
1. Ha a Szaki elvállalná a munkát, rákattint és "Megveszem a leadet" (vagy Érdeklődöm). Meghívódik a `POST /api/contractor/jobs/[id]/interest` végpont.
2. A rendszer az RPC (`express_job_interest`) segítségével befagyaszt bizonyos kreditet a szaki egyenlegén (Escrow logika) és rögzít egy `job_interests` sort `pending` státusszal.
3. **Ügyfél Döntés**: Az ügyfél (aki közben belépett a Magic Linkjével a Dashboardra) látja, hogy jelentkeztek a problémájára. A `POST /api/customer/assignments/[id]/respond` végponttal **elfogadja** az egyik kiválasztott szerelőt (`action: 'accept'`).
4. **Tranzakció Zárása**: Amikor az ügyfél rányom az "Elfogadom" gombra:
   - A `job_interests` státusza `accepted` lesz.
   - A rendszer levonja véglegesen a szerelő credit egyenlegét a lead árával (kb. 2000 Ft).
   - A többi elutasított szerelő visszakapja a zárolt kreditjét.
   - A job `status`-a `assigned`-ra vált.

### 3.4. Munka Elvégzése
1. A Szakember megkapta az ügyfél pontos címét, telefonszámát. A UI kiírja számára: *"Gratulálunk! Az ügyfél elfogadta az ajánlatod!"* és mutat neki "Waze" és "Google Maps" útvonaltervező gombokat.
2. A munka végeztével a Szakember a Dashboardján ("Aktív munkák" fül) rányom a kártya alján egy gombra, pl. "Munka befejezve".
3. A háttérben frissül a feladat (`in_progress` -> `completed`), a workflow pedig véget ér.

---

## 4. Legfontosabb Fájlok és API Végpontok

### Backend Végpontok (`src/app/api/`)
- **`jobs/create/route.ts`**: Fő beküldő modul. Geocodingot hív, lekezeli az automata Supabase Auth generálást (Lazy auth) Magic Link-el, és Emailt küld a diszpécsernek.
- **`contractor/marketplace/route.ts`**: Leköti az aktív térképes nézetet a szerelőknek. Egyesíti a hagyományos (`jobs`) és a gyorsított (`leads`) kárigényeket. Kiszámolja az "activeJobs" és "completedJobs" statisztikákat is a Szaki menünek.
- **`contractor/jobs/[id]/interest/route.ts`**: A lead-vásárlás kezdőpontja. Ha a kárigény csak "Lead"-ként létezett eddig, itt konvertálja át "Job"-bá menet közben (hogy a tárolt eljárás működjön), majd rögzíti az érdeklődést.
- **`customer/assignments/[id]/respond/route.ts`**: Itt fut a Credit Billing logika! Amikor az ügyfél "accept"-et nyom, ez a fájl utalja el (vonja le fixen) a Szaki egyenlegét a Postgresben meghívott backend Admin klienssel.

### Frontend Dashboardok
- **`src/app/(dashboard)/ugyfel/dashboard/page.tsx`**
  - **Kliens Dashboard:** Mutatja az aktív feladatokat. Dinamikusan kezeli a mobilról felhúzható (BottomSheet) nézetet és az asztali (Desktop) sávos elrendezést.
  - Tartalmaz egy integrált Mapbox térképet (`renderMap`), ami az asztali nézetben vizuálisan rá-zoomol a kiválasztott kárigény koordinátáira (`mapRef.current.flyTo(zoom: 14)`).
- **`src/app/contractor/dashboard/page.tsx`**
  - **Szakember Dashboard:** Mutatja az aktuális Hitel Egyenleget, a Térképet a lehetséges munkákkal, és az Aktív/Történet fülleket. 

### Database Types (`src/lib/supabase/types.ts`)
Mindent átfogó Typescript definíció, melyet a Supabase generált. Biztosítja, hogy az egész projekt Szigorúan Tipizált maradjon (pl. enumok: `Trade`, `JobStatus`, `JobPriority`).

---

## 5. Rendszer Biztonság és Kiemelt Tervezési Minták
- **RLS (Row Level Security)**: A Supabase adatbázis RLS szabályokkal van ellátva. Egy szaki csak azokat a teljes munkacímeket láthatja, amiket PÉNZÉRT megvásárolt, egyébként csak az irányítószámot/kerületet adja vissza a publikus View (`open_jobs_map`).
- **Responsive Layout Architecture**: Külön választottuk a DOM renderinget Desktop (Sidebar-os) és Mobil (Swipe-olható Bottom Sheet) elemekre window.resize hookkal figyelve, hogy ne akadjanak össze a React Mapbox referenciák.
- **Service Layering**: Az adatbázis manipulációkhoz a kliensek (Frontend) SOHA nem kérnek közvetlenül Update-eket a Supabase táblákon RLS bypass-al. Mindig dedikált, leellenőrzött Next.js "API route"-okon mennek keresztül a kérések (Route Handlers), amelyek Server Client-el validálják a tokeneket és jogosultságokat.
