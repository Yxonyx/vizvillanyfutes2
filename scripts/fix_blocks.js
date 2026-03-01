const fs = require('fs');
const file = 'C:\\Users\\User\\.gemini\\antigravity\\scratch\\vizvillanyfutes.hu\\public\\Asszisztens-2026-02-28_20-14.vf';
let c = fs.readFileSync(file, 'utf8');

const replacements = [
    ['"Issue identification and routing"', '"Probléma azonosítása és irányítása"'],
    ['"Clarify the user\'s issue"', '"Probléma pontosítása"'],
    ['"Collect account or login issue details"', '"Vízszerelési igény felmérése"'],
    ['"Collect billing or subscription details"', '"Villanyszerelési igény felmérése"'],
    ['"Collect feature problem details"', '"Fűtésszerelési igény felmérése"'],
    ['"Account/login troubleshooting"', '"Vízszerelési ajánlat és összegzés"'],
    ['"Billing troubleshooting and guidance"', '"Villanyszerelési ajánlat és összegzés"'],
    ['"Feature troubleshooting and solution"', '"Fűtésszerelési ajánlat és összegzés"'],
    ['"Issue resolved confirmation"', '"Sikeres lezárás"'],
    ['"Handoff to human support"', '"Átadás élő ügyfélszolgálatnak"'],
    // Also update the "end" tool messages
    ['"Thank the user for using VízVillanyFűtés.hu support"', '"Köszönd meg a felhasználónak"'],
    ['"Your AI agent"', '"VízVillanyFűtés.hu Asszisztens"'],
    ['"How can I help you today?"', '"Miben segíthetek Önnek?"'],
    ['"Message..."', '"Írjon ide..."'],
    ['"Test your agent"', '"Segíthetünk?"'],
];

for (const [from, to] of replacements) {
    const count = (c.match(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (count > 0) {
        c = c.split(from).join(to);
        console.log(`Replaced "${from}" -> "${to}" (${count} occurrences)`);
    }
}

fs.writeFileSync(file, c, 'utf8');
console.log('\n✅ Block names updated!');
