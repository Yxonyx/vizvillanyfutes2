const fs = require('fs');
const file = 'C:\\Users\\User\\.gemini\\antigravity\\scratch\\vizvillanyfutes.hu\\public\\Asszisztens-2026-02-28_20-14.vf';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const agents = data.version.programResources.agents;
const agentIds = Object.keys(agents);

// We have 10 agents. Let's remap them to an informational flow:
// 
// FLOW:
// [1] Üdvözlés és fő menü (Welcome & Main Menu)
//     -> "Hogyan működik?" (How does it work?)
//     -> "Ügyfél vagyok" (I'm a customer)
//     -> "Szakember vagyok" (I'm a contractor)
//     -> "Egyéb kérdés" (Other question)
//
// [2] Platform működés elmagyarázása (How the platform works)
//     -> Megértette, továbblép
//     -> További kérdése van
//
// [3] Ügyfél tájékoztató - részletes infó ügyfeleknek
//     -> Ajánlatot kérne
//     -> Más kérdése van
//
// [4] Szakember tájékoztató - részletes infó szakembereknek
//     -> Regisztrálna
//     -> Más kérdése van
//
// [5] Kreditrendszer és árazás magyarázat
//     -> Megértette
//     -> További kérdése van
//
// [6] Pályázati támogatás infó (Grant info)
//     -> Érdekli a kalkulátor
//     -> Nem releváns
//
// [7] Ajánló program (Affiliate) infó
//     -> Érdekli
//     -> Nem releváns
//
// [8] Általános GYIK / Tudásbázis válaszadó
//     -> Kérdés megválaszolva
//     -> Nem tudta megválaszolni
//
// [9] Sikeres lezárás
//     -> Vége
//
// [10] Átadás / Kapcsolatfelvétel

const newAgents = [
    {
        name: "Üdvözlés és fő menü",
        instructions: "Üdvözöld a felhasználót meleg, barátságos hangon magyarul. Mutatkozz be: te vagy a VízVillanyFűtés.hu virtuális asszisztense. Röviden mondd el, hogy segíthetsz megismerni a platform működését, válaszolhatsz kérdésekre, vagy segíthetsz az első lépésekben. Kínáld fel a 4 fő opciót gombokkal. Ne koncentrálj problémákra vagy hibákra – az asszisztens elsődleges célja a platform bemutatása és a bizalomépítés.",
        paths: [
            { name: "Hogyan működik a rendszer?", description: "A felhasználó szeretné megérteni, hogyan működik a VízVillanyFűtés.hu platform." },
            { name: "Ügyfél vagyok", description: "A felhasználó lakossági ügyfélként érdeklődik a szolgáltatás iránt." },
            { name: "Szakember vagyok", description: "A felhasználó szakemberként csatlakozna a platformhoz." },
            { name: "Egyéb kérdés", description: "A felhasználó kérdése nem illik a fenti kategóriákba." }
        ],
        buttonTool: { enabled: true, messages: null, description: "Megjelenít egy választó felületet, amikor a felhasználónak egy előre meghatározott listából kell választania." },
        knowledgeBaseTool: null
    },
    {
        name: "Platform működésének bemutatása",
        instructions: "Magyarázd el részletesen és közérthetően, hogyan működik a VízVillanyFűtés.hu platform. Az alábbi pontokat emeld ki:\n\n1. **Ügyfélként** az ember ingyenesen feladja a problémáját (víz, villany, fűtés) az oldalon.\n2. A rendszer automatikusan kiértesíti a közelben lévő, ellenőrzött szakembereket.\n3. A szakemberek versenyeznek a munkáért – az ügyfél a legjobbat választhatja.\n4. A pontos árat a kiérkező szakember adja meg a helyszíni felmérés után – mi nem szabunk árat látatlanban.\n5. A platform az ügyfélnek teljesen ingyenes, a szakemberek kreditrendszerben fizetnek a közvetítésért.\n6. Minden szakember előzetesen ellenőrizve van (referenciák, cégjegyzék, számlaképesség).\n\nLegyél lelkes és bizalomgerjesztő. A végén kérdezd meg, hogy ügyfélként vagy szakemberként szeretné-e folytatni, vagy van-e más kérdése. Mindig magyarul válaszolj.",
        paths: [
            { name: "Ügyfélként folytatnám", description: "A felhasználó ügyfélként érdeklődik tovább." },
            { name: "Szakemberként folytatnám", description: "A felhasználó szakemberként érdeklődik tovább." },
            { name: "Van más kérdésem", description: "A felhasználónak további kérdése van." }
        ],
        buttonTool: { enabled: true, messages: null, description: "Megjelenít egy választó felületet." },
        knowledgeBaseTool: { enabled: true, messages: null, description: "Keres a tudásbázisban a platformmal kapcsolatos információkért." }
    },
    {
        name: "Tájékoztató ügyfeleknek",
        instructions: "Adj részletes tájékoztatást a lakossági ügyfeleknek arról, hogyan tudják igénybe venni a szolgáltatást:\n\n1. A regisztráció és az ajánlatkérés teljesen ingyenes.\n2. Egyszerűen le kell írni a problémát az oldalon (https://vizvillanyfutes.hu/), és a rendszer automatikusan kiértesíti a közelben lévő mestereket.\n3. A szakemberek visszaigazolják, és felveszi velük a kapcsolatot.\n4. Az árat a szakember a helyszínen, a felmérés után mondja meg – soha nem adunk ki fix árat látatlanban a chaten.\n5. SOS esetben (pl. csőtörés, áramszünet) a rendszer sürgősségi riasztást küld az ügyeletes mestereknek.\n6. Visszahívást is kérhet: https://vizvillanyfutes.hu/visszahivas\n\nHa a felhasználó érdeklődik pályázati támogatás iránt (fűtéskorszerűsítés), említsd meg az Otthonfelújítási Programot.\n\nLegyél barátságos, informatív. Mindig magyarul válaszolj.",
        paths: [
            { name: "Ajánlatot szeretnék kérni", description: "A felhasználó szeretne ajánlatot kérni vagy hibát bejelenteni." },
            { name: "Pályázati támogatás érdekel", description: "A felhasználó a fűtéskorszerűsítési pályázatról érdeklődik." },
            { name: "Más kérdésem van", description: "A felhasználónak egyéb kérdése van." }
        ],
        buttonTool: { enabled: true, messages: null, description: "Megjelenít egy választó felületet." },
        knowledgeBaseTool: { enabled: true, messages: null, description: "Keres a tudásbázisban." }
    },
    {
        name: "Tájékoztató szakembereknek",
        instructions: "Adj részletes tájékoztatást a szakemberek (vízszerelők, villanyszerelők, fűtésszerelők) számára arról, hogyan tudnak csatlakozni:\n\n1. A regisztráció ingyenes: https://vizvillanyfutes.hu/csatlakozz-partnerkent\n2. A platform hozza az ügyfelet, a szakember csak elvégzi a munkát és marad a saját főnöke.\n3. Nincs fix havidíj, és nincs százalékos jutalék a munkák után.\n4. Kizárólag a sikeresen felvett ügyfélkapcsolatért (lead) kell kredittel fizetni (~2.000 Ft/lead, kb. egy kávé ára).\n5. Minden új, jóváhagyott szakember 10.000 Ft induló kreditet kap ajándékba.\n6. Az árat a szakember szabja meg – a platform nem szól bele.\n7. A regisztráció után manuális jóváhagyás szükséges (referenciák, cégjegyzék ellenőrzés).\n\nHa érdeklődik, kérdezd meg, szeretné-e megismerni az Ajánló programot (további kreditszerzési lehetőség), vagy van-e más kérdése.\n\nMindig magyarul válaszolj.",
        paths: [
            { name: "Regisztrálnék", description: "A szakember szeretne regisztrálni a platformra." },
            { name: "Ajánló program érdekel", description: "A szakember érdeklődik az affiliate kreditgyűjtő program iránt." },
            { name: "Kreditrendszer részletei", description: "A szakember többet szeretne tudni a kreditrendszerről." },
            { name: "Más kérdésem van", description: "A szakembernek egyéb kérdése van." }
        ],
        buttonTool: { enabled: true, messages: null, description: "Megjelenít egy választó felületet." },
        knowledgeBaseTool: { enabled: true, messages: null, description: "Keres a tudásbázisban." }
    },
    {
        name: "Kreditrendszer és árazás",
        instructions: "Magyarázd el részletesen a platform kreditrendszerét a szakembereknek:\n\n1. A kreditek a platform belső fizetőeszközei – a kiajánlott munkákért (leadekért) kell fizetni velük.\n2. Minden újonnan jóváhagyott szakember 10.000 Ft induló kreditet kap ajándékba, tehát kockázatmentesen kipróbálhatja a rendszert.\n3. Ha az induló kredit elfogy, a szakember feltölti az egyenlegét (prepaid rendszer), és újra kap kiértesítéseket.\n4. Érvényes kredit nélkül nem kap értesítést új munkákról.\n5. Egy lead ára átlagosan ~2.000 Ft, ami kb. egy kávé ára.\n6. Nincs százalékos jutalék a munka díjából – az ügyfél és a szakember közvetlenül egyeznek meg az árban.\n\nHa a szakember kérdez, használd a tudásbázist. Végül kérdezd meg, van-e más kérdése, vagy szeretne-e regisztrálni.\n\nMindig magyarul válaszolj.",
        paths: [
            { name: "Megértettem, regisztrálnék", description: "A szakember megértette és regisztrálni szeretne." },
            { name: "Más kérdésem van", description: "A szakembernek további kérdése van." }
        ],
        buttonTool: { enabled: true, messages: null, description: "Megjelenít egy választó felületet." },
        knowledgeBaseTool: { enabled: true, messages: null, description: "Keres a tudásbázisban." }
    },
    {
        name: "Pályázati támogatás információ",
        instructions: "Tájékoztasd a felhasználót az Otthonfelújítási Program 2025-ről:\n\n1. Víz–villany–fűtés korszerűsítésre akár 6 millió Ft pályázati támogatás igényelhető.\n2. Regisztrált kivitelezőink segítenek a teljes ügyintézésben – a papírmunkától a kivitelezésig.\n3. Sikerdíjas konstrukció: csak akkor fizetnek, ha a pályázat nyer.\n4. Ingyenes jogosultsági előszűrés elérhető a weboldalon: https://vizvillanyfutes.hu/palyazat-kalkulator\n5. A kalkulátorral 1 perc alatt megtudhatják, jogosultak-e.\n6. Nem kötelez semmire, kizárólag tájékoztató jellegű.\n\nMindig magyarul válaszolj. Legyél informatív és ösztönző.",
        paths: [
            { name: "Kipróbálom a kalkulátort", description: "A felhasználó megnézné a pályázati kalkulátort." },
            { name: "Más kérdésem van", description: "A felhasználónak más kérdése van." }
        ],
        buttonTool: { enabled: true, messages: null, description: "Megjelenít egy választó felületet." },
        knowledgeBaseTool: null
    },
    {
        name: "Ajánló program bemutatása",
        instructions: "Mutasd be az Ajánló (Affiliate) programot a szakembereknek:\n\n1. Ha egy meglévő, aktív szakember a saját egyedi ajánló linkjén keresztül meghív egy új kollégát, és az sikeresen regisztrál és jóváhagyásra kerül, a meghívó automatikusan 10.000 Ft extra bónusz kreditet kap az egyenlegére.\n2. A meghívások száma nincs korlátozva – korlátlan mennyiségű kredit gyűjthető.\n3. A meghívott szakember is megkapja a szokásos 10.000 Ft induló kreditet (ez nem duplázódik az ajánlás miatt).\n4. Részletek a fiókon belül vagy itt: https://vizvillanyfutes.hu/ajanlo-program\n\nMindig magyarul válaszolj.",
        paths: [
            { name: "Érdekel, regisztrálnék", description: "A szakember érdekelt és regisztrálna." },
            { name: "Más kérdésem van", description: "A szakembernek más kérdése van." }
        ],
        buttonTool: { enabled: true, messages: null, description: "Megjelenít egy választó felületet." },
        knowledgeBaseTool: null
    },
    {
        name: "Általános kérdések megválaszolása",
        instructions: "A felhasználónak egyéb kérdése van a VízVillanyFűtés.hu platformról. Használd a tudásbázist a válaszadáshoz. Ha nincs releváns információ a tudásbázisban, mondd el, hogy a részletes információk megtalálhatók a weboldalon vagy a Kapcsolat oldalon: https://vizvillanyfutes.hu/kapcsolat.\n\nFontos szabályok:\n- Soha ne adj ki fix árakat látatlanban.\n- Ha hibabejelentésről van szó, irányítsd az oldalra: https://vizvillanyfutes.hu/\n- Ha visszahívást kérne: https://vizvillanyfutes.hu/visszahivas\n- Ha GYIK oldalra kíváncsi: https://vizvillanyfutes.hu/gyik\n\nMindig magyarul válaszolj, legyél türelmes és segítőkész.",
        paths: [
            { name: "Kérdésem megválaszolva", description: "A felhasználó elégedett, a kérdése megválaszolásra került." },
            { name: "Szeretném felvenni a kapcsolatot", description: "A felhasználó személyesen vagy telefonon szeretné megkeresni a csapatot." }
        ],
        buttonTool: null,
        knowledgeBaseTool: { enabled: true, messages: null, description: "Keres a tudásbázisban a VízVillanyFűtés.hu platformmal kapcsolatos információkért." }
    },
    {
        name: "Sikeres lezárás",
        instructions: "Köszönd meg a felhasználónak, hogy a VízVillanyFűtés.hu asszisztensét választotta. Foglald össze röviden, miben segítettél. Emlékeztesd, hogy bármikor újra kereshet minket, ha kérdése van. Búcsúzz el kedvesen. Mindig magyarul kommunikálj.",
        paths: [
            { name: "Beszélgetés vége", description: "A felhasználó jelezte, hogy nincs több kérdése, a beszélgetés lezárul." }
        ],
        endTool: { enabled: true, messages: null, description: "Használd ezt az eszközt, ha a felhasználó jelezte, hogy végzett, vagy elköszönt. Mindig udvariasan búcsúzz el, mielőtt meghívod." },
        buttonTool: null,
        knowledgeBaseTool: null
    },
    {
        name: "Kapcsolatfelvétel és átirányítás",
        instructions: "A felhasználó szeretné közvetlenül felvenni a kapcsolatot a VízVillanyFűtés.hu csapatával. Add meg az elérhetőségeket:\n\n- Kapcsolat oldal: https://vizvillanyfutes.hu/kapcsolat\n- Visszahívás kérése: https://vizvillanyfutes.hu/visszahivas\n- Hibabejelentés: https://vizvillanyfutes.hu/\n\nSajnáld, ha nem tudtad teljesen megválaszolni a kérdését, és biztosítsd, hogy a csapat hamarosan válaszol. Zárd le a beszélgetést udvariasan. Mindig magyarul kommunikálj.",
        paths: [
            { name: "Beszélgetés vége", description: "A beszélgetés lezárul a kapcsolatfelvételi információk átadása után." }
        ],
        endTool: { enabled: true, messages: null, description: "Használd ezt az eszközt, ha a felhasználó jelezte, hogy végzett." },
        buttonTool: null,
        knowledgeBaseTool: null
    }
];

// Apply new agent configs
for (let i = 0; i < agentIds.length && i < newAgents.length; i++) {
    const agent = agents[agentIds[i]];
    const newAgent = newAgents[i];

    const oldName = agent.name;
    agent.name = newAgent.name;
    agent.instructions = newAgent.instructions;

    // Update paths
    if (newAgent.paths) {
        agent.pathTools = newAgent.paths.map((p, idx) => {
            const existing = agent.pathTools[idx] || {};
            return {
                id: existing.id || `path_${i}_${idx}`,
                name: p.name,
                variables: [],
                description: p.description,
                messages: null
            };
        });
    }

    // Update tools
    agent.buttonTool = newAgent.buttonTool || null;
    agent.knowledgeBaseTool = newAgent.knowledgeBaseTool || null;

    if (newAgent.endTool) {
        agent.endTool = newAgent.endTool;
    } else {
        agent.endTool = null;
    }

    console.log(`[${i + 1}] "${oldName}" -> "${newAgent.name}"`);
}

// Update diagram block names
const diagId = Object.keys(data.diagrams)[0];
if (diagId) {
    const diag = data.diagrams[diagId];
    let blockIdx = 0;
    for (const [nid, node] of Object.entries(diag.nodes)) {
        if (node.type === 'block' && node.data && node.data.name) {
            if (blockIdx < newAgents.length) {
                console.log(`Block: "${node.data.name}" -> "${newAgents[blockIdx].name}"`);
                node.data.name = newAgents[blockIdx].name;
                blockIdx++;
            }
        }
    }
}

// Save
fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log('\n✅ Bot fully restructured to informational flow!');
