import fs from 'fs';

const fp = 'src/App.tsx';
let content = fs.readFileSync(fp, 'utf-8');

// 1. Remove PAST_KAGGLE_WINNERS array
const arrayRegex = /const PAST_KAGGLE_WINNERS: KaggleWinnerSolution\[\] = \[\s*\{[\s\S]*?\}\s*\];\n/g;
content = content.replace(arrayRegex, '');

// 2. Remove Kaggle UI section
// We can use a simpler matching since regex might fail
const uiStart = `          {/* Past Kaggle Winners Methodology Ledger */}`;
const uiEnd = `          {/* Historical World Resources and Ancient Desalination Chronology */}`;

const startIndex = content.indexOf(uiStart);
const endIndex = content.indexOf(uiEnd);

if (startIndex !== -1 && endIndex !== -1) {
    content = content.substring(0, startIndex) + content.substring(endIndex);
}

// 3. Update the grid
content = content.replace('section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2"', 'section className="grid grid-cols-1 gap-6 pt-2"');

fs.writeFileSync(fp, content, 'utf-8');
console.log("Kaggle winner details removed!");
