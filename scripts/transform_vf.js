const fs = require('fs');
const file = 'C:\\Users\\User\\.gemini\\antigravity\\scratch\\vizvillanyfutes.hu\\public\\Asszisztens-2026-02-28_20-14.vf';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const agents = data.version.programResources.agents;

// ===== AGENT MAPPINGS =====
// Map each agent by its current name to new Hungarian config

const agentUpdates = {
    "Issue identification and routing": {
        name: "Probléma azonosítása és irányítása",
        instructions: "Üdvözöld a felhasználót az alábbi üzenettel: \"Üdvözlöm! Én a VízVillanyFűtés.hu virtuális asszisztense vagyok. 🔧 Miben segíthetek?\" Kínáld fel az alábbi opciókat gombokkal: Vízszerelés, Villanyszerelés, Fűtésszerelés, Mást szeretnék kérdezni. Mindig magyarul kommunikálj, legyél udvarias és tömör.",
        pathUpdates: {
            "Vízszerelés": "A felhasználó vízszereléssel kapcsolatos problémát jelöl meg (csőtörés, dugulás, csaptelep, bojler, stb.).",
            "Villanyszerelés": "A felhasználó villanyszerelőt keres (áramkimaradás, zárlat, Fi-relé, konnektorcsere, stb.).",
            "Fűtésszerelés": "A felhasználó fűtéssel kapcsolatos problémát jelez (radiátor, kazán, hőszivattyú, padlófűtés, stb.).",
            "Mást szeretnék kérdezni": "A felhasználó kérdése nem illik a fenti kategóriákba, vagy általános információt keres a platformról."
        }
    },
    "Clarify the user's issue": {
        name: "Probléma pontosítása",
        instructions: "Kérdezd meg a felhasználótól udvariasan és tömören, hogy pontosabban milyen problémája van. Fogladd össze, amit eddig megértettél, és próbáld besorolni a megfelelő kategóriába (víz, villany, fűtés). Ha általános kérdése van a platformról, irányítsd a tudásbázis felé. Mindig magyarul válaszolj.",
        pathUpdates: {
            "Issue clarified: account/login": { name: "Pontosítva: Vízszerelés", description: "A felhasználó vízszerelési problémát jelzett." },
            "Issue clarified: billing": { name: "Pontosítva: Villanyszerelés", description: "A felhasználó villanyszerelési problémát jelzett." },
            "Issue clarified: feature problem": { name: "Pontosítva: Fűtésszerelés", description: "A felhasználó fűtésszerelési problémát jelzett." },
            "Still unclear or unrelated": { name: "Nem egyértelmű vagy egyéb kérdés", description: "A felhasználó problémája nem sorolható be egyértelműen, vagy általános kérdése van." }
        }
    },
    "Collect account or login issue details": {
        name: "Vízszerelési igény felmérése",
        instructions: "Kérdezd meg a felhasználótól a probléma részleteit: Mi a konkrét hiba? (csöpög a csap, dugulás, csőtörés, bojler hiba, stb.) Sürgős-e (SOS)? Hol van az ingatlan (Budapest/Pest megye, kerület)? Majd ajánld fel, hogy adja le az ingyenes ajánlatkérést a weboldalon: https://vizvillanyfutes.hu/ vagy kérjen visszahívást: https://vizvillanyfutes.hu/visszahivas. Mindig magyarul kommunikálj.",
        pathUpdates: {
            "Details collected": { name: "Információk összegyűjtve", description: "Elegendő információ áll rendelkezésre a vízszerelési igényről." },
            "User is not able or willing to provide details": { name: "Felhasználó nem adott elég infót", description: "A felhasználó nem kívánt vagy nem tudott részleteket megadni." }
        }
    },
    "Collect billing or subscription details": {
        name: "Villanyszerelési igény felmérése",
        instructions: "Kérdezd meg a felhasználótól a probléma részleteit: Mi a konkrét hiba? (nincs áram, zárlat, Fi-relé leüt, konnektor csere, biztosítéktábla, stb.) Sürgős-e (SOS)? Hol van az ingatlan (Budapest/Pest megye, kerület)? Majd ajánld fel, hogy adja le az ingyenes ajánlatkérést a weboldalon: https://vizvillanyfutes.hu/ vagy kérjen visszahívást: https://vizvillanyfutes.hu/visszahivas. Mindig magyarul kommunikálj.",
        pathUpdates: {
            "Details collected": { name: "Információk összegyűjtve", description: "Elegendő információ áll rendelkezésre a villanyszerelési igényről." },
            "Missing required details": { name: "Felhasználó nem adott elég infót", description: "A felhasználó nem kívánt vagy nem tudott részleteket megadni." }
        }
    },
    "Collect feature problem details": {
        name: "Fűtésszerelési igény felmérése",
        instructions: "Kérdezd meg a felhasználótól a probléma részleteit: Mi a konkrét hiba? (radiátor nem melegszik, kazán leáll, padlófűtés hiba, hőszivattyú probléma, stb.) Sürgős-e (SOS)? Hol van az ingatlan (Budapest/Pest megye, kerület)? Majd ajánld fel, hogy adja le az ingyenes ajánlatkérést a weboldalon: https://vizvillanyfutes.hu/ vagy kérjen visszahívást: https://vizvillanyfutes.hu/visszahivas. Mindig magyarul kommunikálj.",
        pathUpdates: {
            "Details collected": { name: "Információk összegyűjtve", description: "Elegendő információ áll rendelkezésre a fűtésszerelési igényről." },
            "Missing required details": { name: "Felhasználó nem adott elég infót", description: "A felhasználó nem kívánt vagy nem tudott részleteket megadni." }
        }
    },
    "Account/login troubleshooting": {
        name: "Vízszerelési ajánlat és összegzés",
        instructions: "A felhasználó vízszerelési problémáját összegezd szépen, és javasolj megoldást. Hangsúlyozd: az ajánlatkérés ingyenes, a pontos árat a kiérkező szakember adja meg a helyszíni felmérés alapján. Irányítsd az űrlaphoz: https://vizvillanyfutes.hu/ vagy a visszahíváshoz: https://vizvillanyfutes.hu/visszahivas. Ha a felhasználónak kérdése van a platformról (árak, minőségbiztosítás, stb.), használd a tudásbázist. Mindig magyarul válaszolj.",
    },
    "Billing troubleshooting and guidance": {
        name: "Villanyszerelési ajánlat és összegzés",
        instructions: "A felhasználó villanyszerelési problémáját összegezd szépen, és javasolj megoldást. Hangsúlyozd: az ajánlatkérés ingyenes, a pontos árat a kiérkező szakember adja meg a helyszíni felmérés alapján. Irányítsd az űrlaphoz: https://vizvillanyfutes.hu/ vagy a visszahíváshoz: https://vizvillanyfutes.hu/visszahivas. Ha a felhasználónak kérdése van a platformról, használd a tudásbázist. Mindig magyarul válaszolj.",
    },
    "Feature troubleshooting and solution": {
        name: "Fűtésszerelési ajánlat és összegzés",
        instructions: "A felhasználó fűtésszerelési problémáját összegezd szépen, és javasolj megoldást. Hangsúlyozd: az ajánlatkérés ingyenes, a pontos árat a kiérkező szakember adja meg a helyszíni felmérés alapján. Ha pályázati támogatás releváns (fűtés korszerűsítés), említsd meg az Otthonfelújítási Programot és irányítsd ide: https://vizvillanyfutes.hu/palyazat-kalkulator. Irányítsd az űrlaphoz: https://vizvillanyfutes.hu/ vagy a visszahíváshoz: https://vizvillanyfutes.hu/visszahivas. Mindig magyarul válaszolj.",
    },
    "Issue resolved confirmation": {
        name: "Sikeres lezárás",
        instructions: "Köszönd meg a felhasználónak, hogy a VízVillanyFűtés.hu asszisztensét választotta. Erősítsd meg, hogy az igényét rögzítettük vagy a kérdését megválaszoltuk. Kérdezd meg, van-e még más kérdése. Ha nincs, búcsúzz el udvariasan. Mindig magyarul kommunikálj.",
    },
    "Handoff to human support": {
        name: "Átadás élő ügyfélszolgálatnak",
        instructions: "Foglald össze röviden, mit beszéltetek meg eddig. Sajnáld, ha nem tudtad teljesen megoldani a problémát. Tájékoztasd a felhasználót, hogy a kérdésével fel is kereshet minket közvetlenül: Telefon: a weboldalon található elérhetőségeken, Email: a Kapcsolat oldalon (https://vizvillanyfutes.hu/kapcsolat), vagy visszahívást kérhet a https://vizvillanyfutes.hu/visszahivas oldalon. Zárd le a beszélgetést udvariasan, magyarul.",
    }
};

// Apply updates
for (const agentId of Object.keys(agents)) {
    const agent = agents[agentId];
    const update = agentUpdates[agent.name];
    if (update) {
        console.log(`Updating agent: "${agent.name}" -> "${update.name}"`);
        agent.name = update.name;
        agent.instructions = update.instructions;

        // Update path tools
        if (update.pathUpdates && agent.pathTools) {
            for (const pathTool of agent.pathTools) {
                const pathUpdate = update.pathUpdates[pathTool.name];
                if (pathUpdate) {
                    if (typeof pathUpdate === 'string') {
                        // Just description update
                        pathTool.description = pathUpdate;
                    } else {
                        // Name + description update
                        console.log(`  Path: "${pathTool.name}" -> "${pathUpdate.name}"`);
                        pathTool.name = pathUpdate.name;
                        pathTool.description = pathUpdate.description;
                    }
                }
            }
        }
    }
}

// ===== WIDGET / PUBLISHING SETTINGS =====
// Update widget texts
if (data.version.settings && data.version.settings.widget) {
    const chat = data.version.settings.widget.chat;
    if (chat) {
        chat.banner.title = "VízVillanyFűtés.hu Asszisztens";
        chat.banner.description = "Miben segíthetek Önnek?";
        chat.placeholderText = "Írjon ide...";
        chat.aiDisclaimer.text = "AI által generált válasz, ellenőrizze az információkat.";
        console.log("Updated widget chat settings.");
    }
    const common = data.version.settings.widget.common;
    if (common) {
        common.primaryColor.color = "#1e3a6e";
        common.primaryColor.palette = {
            "50": "#E8EEF7",
            "100": "#C6D4EB",
            "200": "#A1B8DE",
            "300": "#7C9CD1",
            "400": "#5680C4",
            "500": "#1e3a6e",
            "600": "#1A3260",
            "700": "#162A52",
            "800": "#122244",
            "900": "#0E1A36"
        };
        common.launcher.text = "Segíthetünk?";
        console.log("Updated widget common settings (color, launcher).");
    }
}

// Update publishing settings
if (data.version.platformData && data.version.platformData.publishing) {
    data.version.platformData.publishing.title = "VízVillanyFűtés.hu Asszisztens";
    data.version.platformData.publishing.description = "Üdvözlöm! Miben segíthetek?";
    data.version.platformData.publishing.color = "#1e3a6e";
    console.log("Updated publishing settings.");
}

// Update globalNoMatch
if (data.version.platformData && data.version.platformData.settings && data.version.platformData.settings.globalNoMatch) {
    data.version.platformData.settings.globalNoMatch.prompt.content[0].children[0].text = "Sajnálom, nem értettem. Kérem, próbálja újra, vagy válasszon az opciók közül!";
    console.log("Updated globalNoMatch message.");
}

// ===== LOCALE =====
if (data.version.platformData && data.version.platformData.settings) {
    data.version.platformData.settings.locales = ["hu-HU"];
    console.log("Updated locale to hu-HU.");
}

// ===== SAVE =====
fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log("\n✅ VF file fully transformed and saved!");
