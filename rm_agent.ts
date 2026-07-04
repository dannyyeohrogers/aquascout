import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Remove agent investigation controls
content = content.replace(/const \[customTopic, setCustomTopic\] = useState\(""\);\n\s*const \[agentIntensity, setAgentIntensity\] = useState<Category>\("Futuristic"\);\n\s*const \[isInvestigating, setIsInvestigating\] = useState\(false\);\n\s*const \[investigationLogs, setInvestigationLogs\] = useState<string\[\]>\(\[\]\);\n/, '');

// 2. Remove dispatchAgent function
const dispatchStart = content.indexOf('// Dispatch AI Agent');
const dispatchEnd = content.indexOf('const analyzeCommentByAgent') - 1;
if (dispatchStart !== -1 && dispatchEnd !== -1) {
  content = content.substring(0, dispatchStart) + content.substring(dispatchEnd);
}

// 3. Remove the active investigator agents section and replace with WorldGlobePanel
const articleStart = content.indexOf('{/* 2. DISPATCH WATER RECOVERY ACTIVE INTELLIGENCE AGENTS (Gemini-API backend connector) */}');
const articleEnd = content.indexOf('</div>', content.indexOf('</article>', articleStart) + 10) - 1; // get to end of article and then we're back in the wrapper div context
const actualEnd = content.indexOf('</article>', articleStart) + 10;
if (articleStart !== -1 && actualEnd !== -1) {
    content = content.substring(0, articleStart) + `
            {/* 2. World Globe Panel showing active techniques & discoveries */}
            <WorldGlobePanel technologies={techList} />\n` + content.substring(actualEnd);
}

if (!content.includes('WorldGlobePanel')) {
    content = content.replace('import InteractiveChart from "./components/InteractiveChart";', 'import InteractiveChart from "./components/InteractiveChart";\nimport { WorldGlobePanel } from "./components/WorldGlobePanel";\n');
} else if (!content.includes('import { WorldGlobePanel }')) {
    content = content.replace('import InteractiveChart from "./components/InteractiveChart";', 'import InteractiveChart from "./components/InteractiveChart";\nimport { WorldGlobePanel } from "./components/WorldGlobePanel";\n');
}


fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log('Done format App.tsx!');
