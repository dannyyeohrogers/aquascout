import fs from 'fs';

const fp = 'src/App.tsx';
let content = fs.readFileSync(fp, 'utf-8');

const replacements: Record<string, string> = {
  // Fix missed forum/deep dive colors
  "bg-white": "bg-[#FFFFFF]",
  "border-[#DDE2D8]": "border-[#E2E8F0]",
  "text-[#2D3A3A]": "text-[#0F172A]",
  "bg-[#F7F8F4]": "bg-[#F8FAFC]",
  "text-stone-700": "text-[#0F172A]",
  "text-stone-400": "text-[#64748B]",
  "text-stone-500": "text-[#64748B]",
  "text-stone-600": "text-[#475569]",
  "bg-[#3E4F41]": "bg-[#1E293B]",
  "bg-[#2D3A2D]": "bg-[#0F172A]",
  "bg-[#88B04B]": "bg-[#0284C7]",
  "text-[#88B04B]": "text-[#0284C7]",
  "text-[#A3C1AD]": "text-[#94A3B8]",
  "bg-[#2D3A3A]": "bg-[#1E293B]",
  "border-stone-100": "border-[#E2E8F0]",
  "border-stone-200": "border-[#E2E8F0]",
  "bg-stone-50": "bg-[#F8FAFC]",
  // Fix Kaggle panel colors
  "bg-emerald-500/5": "bg-sky-500/5",
  "border-emerald-500/15": "border-sky-500/15",
  "text-emerald-800": "text-sky-800",
  "bg-emerald-600": "bg-sky-600",
  "text-emerald-600": "text-sky-600",
  "bg-amber-500/5": "bg-blue-500/5",
  "border-amber-500/15": "border-blue-500/15",
  "text-amber-800": "text-blue-800",
  "bg-amber-600": "bg-blue-600",
  "text-amber-900": "text-blue-900"
};

for (const [oldClass, newClass] of Object.entries(replacements)) {
  const re = new RegExp(oldClass.replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/\//g, '\\/'), 'g');
  content = content.replace(re, newClass);
}

// ensure we import RecoveryChart at the top
if (!content.includes("RecoveryChart")) {
  content = content.replace(
    'import React, { useState, useEffect } from "react";',
    'import React, { useState, useEffect } from "react";\nimport { RecoveryChart } from "./components/RecoveryChart";'
  );
  
  // also insert <RecoveryChart technology={selectedTech} /> right after the 4 grid metrics layout
  const gridEndStr = '</div>\n\n                {/* Pros and Cons */}';
  content = content.replace(gridEndStr, '</div>\n\n                {/* Recovery Over Time Chart */}\n                <RecoveryChart technology={selectedTech} />\n\n                {/* Pros and Cons */}');
}

fs.writeFileSync(fp, content, 'utf-8');
console.log("Forum styling, missing colors, and chart insertion fixed.");
