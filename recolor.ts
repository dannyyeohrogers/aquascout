import fs from 'fs';
import path from 'path';

const filePaths = [
  'src/App.tsx',
  'src/components/InteractiveChart.tsx',
  'src/components/SecurityGate.tsx'
];

const replacements: Record<string, string> = {
  "#FAF9F5": "#F8FAFC",
  "#2E3B30": "#0F172A",
  "#4A5D4E": "#0284C7", // lighter navy / ocean blue (sky-600)
  "#8C7A5C": "#38BDF8", // sky-400
  "#C47357": "#EF4444", // red-500
  "#E3E8DF": "#E2E8F0",
  "#FCFBF9": "#FFFFFF",
  "#5C6B5E": "#475569",
  "#707E73": "#64748B",
  "#607063": "#64748B",
  "#D1D9CD": "#CBD5E1",
  "#1D261E": "#1E293B",
  "#3E4F41": "#334155",
  "#BDC4BD": "#94A3B8",
  "#D0C4AF": "#38BDF8",
  "#141A14": "#0F172A",
  "#EBE8E1": "#F1F5F9",
  "#212A22": "#1E293B",
  "#9CAEA0": "#94A3B8",
  "#DAE3D9": "#E2E8F0",
  "#4E453A": "#1E40AF", // blue-800
  "#CEA364": "#38BDF8",
  "#8D9B80": "#0EA5E9",
  "#6E766D": "#64748B",
  "#F4F1EA": "#F8FAFC",
  "#D4CDC1": "#E2E8F0",
  "#304033": "#1E293B",
  "#4E5B44": "#0EA5E9",
  "#F5E6E1": "#FEE2E2",
  "#4D6351": "#0284C7",
  "#5E7363": "#38BDF8",
  "#3D5241": "#0369A1",
  "#4F6452": "#0284C7",
  "bg-[#88B04B]": "bg-[#0284C7]",
  "text-[#88B04B]": "text-[#0284C7]"
};

filePaths.forEach(fp => {
  let content = fs.readFileSync(fp, 'utf-8');
  for (const [oldHex, newHex] of Object.entries(replacements)) {
    // Avoid replacing if we have something like bg-[#88B04B] and we're replacing just the hex
    // Actually regex is fine since I am putting literal strings.
    const re = new RegExp(oldHex, 'gi');
    content = content.replace(re, newHex);
  }
  fs.writeFileSync(fp, content, 'utf-8');
});
console.log("Colors replaced successfully.");
