const fs = require('fs');
const file = 'C:\\Users\\User\\.gemini\\antigravity\\scratch\\vizvillanyfutes.hu\\public\\Asszisztens-2026-02-28_20-14.vf';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const cmsAgents = data.agents;
const prAgents = data.version.programResources.agents;

// Get arrays of both, matched by order
const cmsArr = Object.entries(cmsAgents).sort((a, b) => Number(a[0]) - Number(b[0]));
const prArr = Object.values(prAgents);

console.log(`CMS agents: ${cmsArr.length}, PR agents: ${prArr.length}\n`);

for (let i = 0; i < Math.min(cmsArr.length, prArr.length); i++) {
    const [cmsId, cmsAgent] = cmsArr[i];
    const prAgent = prArr[i];

    console.log(`[${i}] "${cmsAgent.name}" -> "${prAgent.name}"`);
    cmsAgent.name = prAgent.name;
    cmsAgent.instructions = [{ text: [prAgent.instructions] }];

    // Sync path tools descriptions
    if (cmsAgent.pathTools && prAgent.pathTools) {
        for (let p = 0; p < Math.min(cmsAgent.pathTools.length, prAgent.pathTools.length); p++) {
            console.log(`    Path: "${cmsAgent.pathTools[p].name}" -> "${prAgent.pathTools[p].name}"`);
            cmsAgent.pathTools[p].name = prAgent.pathTools[p].name;
            cmsAgent.pathTools[p].description = prAgent.pathTools[p].description;
        }
        // If PR has fewer paths, trim CMS
        if (prAgent.pathTools.length < cmsAgent.pathTools.length) {
            cmsAgent.pathTools = cmsAgent.pathTools.slice(0, prAgent.pathTools.length);
        }
    }

    // Sync button tool
    if (prAgent.buttonTool !== undefined) cmsAgent.buttonTool = prAgent.buttonTool;
    if (prAgent.knowledgeBaseTool !== undefined) cmsAgent.knowledgeBaseTool = prAgent.knowledgeBaseTool;
    if (prAgent.endTool !== undefined) cmsAgent.endTool = prAgent.endTool;
}

// Also sync the top-level agentPathTools if present
if (data.agentPathTools) {
    const cmsPathArr = Object.entries(data.agentPathTools);
    console.log(`\nSyncing ${cmsPathArr.length} top-level agentPathTools...`);

    // Build a flat lookup from PR agents
    const prPathMap = {};
    for (const prAgent of prArr) {
        for (const pt of (prAgent.pathTools || [])) {
            prPathMap[pt.id] = pt;
        }
    }

    for (const [id, pathTool] of cmsPathArr) {
        // Try to match by ID first
        if (prPathMap[id]) {
            console.log(`  Path by ID: "${pathTool.name}" -> "${prPathMap[id].name}"`);
            pathTool.name = prPathMap[id].name;
            pathTool.description = prPathMap[id].description;
        }
    }
}

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log('\n✅ All CMS data fully synced!');
