# VizVillanyFutes.hu — Rendszer Architektúra & Backend Dokumentáció

---

## 🏗️ Rendszer Architektúra

```mermaid
graph TB
    subgraph "Frontend - Next.js"
        HP["Homepage<br/>page.tsx"]
        TM["TeaserMap<br/>Mapbox GL"]
        OV["MarketplaceOverlay<br/>Dashboard + Térkép"]
        AM["AddLeadModal<br/>Bejelentés form"]
        AUTH["AuthModal<br/>Login/Register"]
        FIOK["Fiók oldal<br/>/fiok"]
        FOG["Foglalás form<br/>/foglalas"]
    end

    subgraph "Supabase Client - Direkt"
        SC["supabase.from()"]
        RPC["supabase.rpc()"]
    end

    subgraph "Next.js API Routes"
        A_AUTH["/api/auth/*"]
        A_CONT["/api/contractor/*"]
        A_ADMIN["/api/admin/*"]
        A_CUST["/api/customer/*"]
        A_JOBS["/api/jobs/create"]
        A_STRIPE["/api/stripe/*"]
        A_EMAIL["/api/send-email"]
    end

    subgraph "Supabase PostgreSQL"
        T_LEADS["leads"]
        T_LI["lead_interests"]
        T_JOBS["jobs"]
        T_CP["contractor_profiles"]
        T_CUST2["customers"]
        T_ADDR["addresses"]
        T_LP["lead_purchases"]
        T_CT["credit_transactions"]
        T_UM["user_meta"]
        T_JA["job_assignments"]
        RPC_ACC["accept_contractor_interest()"]
        RPC_CJF["create_job_from_form()"]
        RPC_UJL["unlock_job_lead()"]
        RPC_REG["register_contractor()"]
    end

    subgraph "Külső szolgáltatások"
        STRIPE["Stripe"]
        MAPBOX["Mapbox"]
    end

    HP --> TM
    TM --> OV
    OV --> AM
    OV --> AUTH
    HP --> FOG

    TM -->|"leads select/realtime"| SC
    AM -->|"leads insert"| SC
    OV -->|"lead_interests insert"| SC
    OV -->|"contractor_profiles select"| SC
    OV -->|"lead_interests select"| SC
    OV -->|"accept_contractor_interest()"| RPC
    FOG -->|"POST"| A_JOBS
    AUTH -->|"POST"| A_AUTH
    FIOK -->|"GET/PUT"| A_CONT

    SC --> T_LEADS
    SC --> T_LI
    SC --> T_CP
    RPC --> RPC_ACC
    RPC_ACC --> T_LI
    RPC_ACC --> T_CP
    RPC_ACC --> T_CT

    A_JOBS -->|"RPC"| RPC_CJF
    A_CONT -->|"RPC"| RPC_UJL
    A_CONT -->|"RPC"| RPC_REG
    A_STRIPE --> STRIPE
    A_AUTH --> T_UM

    RPC_CJF --> T_CUST2
    RPC_CJF --> T_ADDR
    RPC_CJF --> T_JOBS
    RPC_UJL --> T_LP
    RPC_UJL --> T_CT
    RPC_REG --> T_CP
    RPC_REG --> T_UM

    TM --> MAPBOX
    OV --> MAPBOX

    style T_LI fill:#10b981,color:#fff
    style RPC_ACC fill:#10b981,color:#fff
    style OV fill:#3b82f6,color:#fff
    style STRIPE fill:#635bff,color:#fff
    style MAPBOX fill:#4264fb,color:#fff
```

---

## 🔄 Lead Érdeklődés Flow

```mermaid
sequenceDiagram
    participant S as Szakember UI
    participant SB as Supabase Client
    participant LI as lead_interests tábla
    participant U as Ügyfél UI
    participant RPC as accept_contractor_interest()
    participant CP as contractor_profiles
    participant CT as credit_transactions

    Note over S: Térkép pin kattintás
    S->>SB: lead_interests.insert(lead_id, contractor_id)
    SB->>LI: INSERT (status: pending)
    SB-->>S: ✅ Érdeklődés rögzítve

    Note over U: Saját bejelentéseim tab
    U->>SB: lead_interests.select().in(lead_id, myLeads)
    SB-->>U: Lista: 2 szakember érdeklődik

    Note over U: Elfogadás gomb
    U->>RPC: accept_contractor_interest(interest_id)
    RPC->>LI: UPDATE status = accepted
    RPC->>CP: credit_balance -= 2000
    RPC->>CT: INSERT (amount: -2000)
    RPC-->>U: ✅ Szakember neve + telefonszáma

    Note over S: Tárgyalólista frissül
    S->>SB: lead_interests.select(status: accepted)
    SB-->>S: Elfogadott lead + ügyfél adatok
```

---

## 💰 Kredit Rendszer Flow

```mermaid
flowchart LR
    subgraph "Feltöltés"
        A["Szakember"] -->|POST| B["/api/stripe/create-checkout-session"]
        B --> C["Stripe Checkout"]
        C -->|webhook| D["/api/stripe/webhook"]
        D -->|RPC| E["add_contractor_credits()"]
        E --> F["credit_balance UP"]
    end

    subgraph "Levonás"
        G["Ügyfél elfogad"] -->|RPC| H["accept_contractor_interest()"]
        H --> I["credit_balance DOWN"]
    end

    subgraph "Visszatérítés"
        J["Admin"] -->|RPC| K["refund_lead()"]
        K --> L["credit_balance UP"]
    end

    style F fill:#10b981,color:#fff
    style I fill:#ef4444,color:#fff
    style L fill:#f59e0b,color:#fff
```

---

## 🗄️ Adatbázis táblák

| Tábla | Leírás | Migration |
|-------|--------|-----------|
| `user_meta` | User szerepkör (admin/dispatcher/contractor/customer) + státusz | 001 |
| `contractor_profiles` | Szakember profil: név, telefon, szakterületek, kredit egyenleg | 001 + 005 |
| `customers` | Ügyfél adatok: név, telefon, email, típus (b2c/b2b) | 001 + 007 |
| `addresses` | Címek: város, kerület, irányítószám, utca, házszám | 001 |
| `jobs` | Munka megrendelések: státusz, szakterület, prioritás, lead ár, GPS | 001 + 005 |
| `job_assignments` | Munka kiosztás szakembereknek (diszpécser modell) | 001 |
| `leads` | Térképes bejelentések: lat/lng, típus, cím, leírás | külön |
| `lead_purchases` | Lead vásárlások (jobs tábla alapú) | 005 |
| `credit_transactions` | Kredit mozgások: feltöltés, levonás, visszatérítés | 005 |
| `lead_interests` | Szakember érdeklődés leadekre, halasztott kredit modell | 008 |

---

## ⚡ RPC Függvények

| Függvény | Mit csinál | Migration |
|----------|-----------|-----------|
| `create_job_from_form()` | Webes foglalásból ügyfél+cím+munka létrehozás (atomikus) | 003 |
| `register_contractor()` | Szakember regisztráció: user_meta + contractor_profile | 003 |
| `assign_job_to_contractor()` | Admin kioszt munkát szakembernek | 003 |
| `contractor_respond_to_assignment()` | Szakember elfogadja/elutasítja munkát | 003 |
| `contractor_update_job_status()` | Munka státusz frissítés (in_progress → completed) | 003 |
| `approve_contractor()` | Admin jóváhagyja szakembert | 003 |
| `reject_contractor()` | Admin elutasítja szakembert | 003 |
| `unlock_job_lead()` | Lead megvásárlás (azonnali kredit levonás) | 005 |
| `add_contractor_credits()` | Admin kreditet ad | 005 |
| `refund_lead()` | Admin visszatéríti lead árát | 005 |
| `accept_contractor_interest()` | Ügyfél elfogadja érdeklődést → kredit levonás | 008 |

---

## 🛣️ API Route-ok (28 db)

### Auth (5)
| Route | Funkció |
|-------|---------|
| `POST /api/auth/login` | Bejelentkezés |
| `POST /api/auth/logout` | Kijelentkezés |
| `GET /api/auth/session` | Session lekérdezés |
| `POST /api/auth/forgot-password` | Jelszó emlékeztető |
| `POST /api/auth/reset-password` | Jelszó visszaállítás |

### Contractor (8)
| Route | Funkció |
|-------|---------|
| `GET/PUT /api/contractor/profile` | Saját profil |
| `GET /api/contractor/jobs` | Elérhető munkák |
| `GET /api/contractor/jobs/[id]` | Munka részletek |
| `POST /api/contractor/jobs/[id]/unlock` | Lead vásárlás |
| `GET /api/contractor/marketplace` | Nyitott munkák (térkép) |
| `GET /api/contractor/assignments` | Kiosztott munkák |
| `POST /api/contractor/assignments/[id]/respond` | Elfogadás/elutasítás |
| `POST /api/contractors/register` | Regisztráció |

### Admin (10)
| Route | Funkció |
|-------|---------|
| `GET /api/admin/contractors` | Szakember lista |
| `GET/PUT /api/admin/contractors/[id]` | Részletek/módosítás |
| `POST /api/admin/contractors/[id]/approve` | Jóváhagyás |
| `POST /api/admin/contractors/[id]/reject` | Elutasítás |
| `POST /api/admin/contractors/[id]/activate` | Aktiválás |
| `POST /api/admin/contractors/[id]/suspend` | Felfüggesztés |
| `GET /api/admin/customers` | Ügyfél lista |
| `GET /api/admin/jobs` | Munka lista |
| `GET/PUT /api/admin/jobs/[id]` | Munka módosítás |
| `POST /api/admin/jobs/assign` | Munka kiosztás |

### Customer + Egyéb (5)
| Route | Funkció |
|-------|---------|
| `GET /api/customer/jobs/[id]` | Saját munka részletei |
| `POST /api/jobs/create` | Új munka (foglalási form) |
| `POST /api/stripe/create-checkout-session` | Stripe fizetés |
| `POST /api/stripe/webhook` | Stripe webhook |
| `POST /api/send-email` | Email küldés |

---

## 🔒 RLS Biztonsági réteg

| Tábla | Ki látja? |
|-------|-----------|
| `user_meta` | Mindenki a sajátját |
| `contractor_profiles` | Saját + admin mindent |
| `customers` | Saját (user_id) + admin |
| `jobs` | Admin mindent, contractor open+saját, customer saját |
| `lead_purchases` | Contractor saját, admin mindent |
| `credit_transactions` | Contractor saját, admin mindent |
| `lead_interests` | Contractor saját, lead owner sajátjait |
| `leads` | Authenticated users |

---

## 🗂️ Migration-ök

| # | Fájl | Tartalom |
|---|------|----------|
| 001 | `create_tables.sql` | Alap táblák |
| 002 | `rls_policies.sql` | Row Level Security |
| 003 | `functions.sql` | 7 RPC függvény |
| 004 | `seed_data.sql` | Teszt adatok |
| 005 | `marketplace_refactor.sql` | Marketplace + kredit rendszer |
| 006 | `add_job_timestamps.sql` | Job időbélyegek |
| 007 | `customer_profiles.sql` | Ügyfél user_id + RLS |
| 008 | `lead_interests.sql` | Lead érdeklődés + accept RPC |
