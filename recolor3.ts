import fs from 'fs';

const fp = 'src/App.tsx';
let content = fs.readFileSync(fp, 'utf-8');

// Insert import if missing
if (!content.includes('GlobalWaterNews')) {
  content = content.replace(
    'import { RecoveryChart } from "./components/RecoveryChart";',
    'import { RecoveryChart } from "./components/RecoveryChart";\nimport { GlobalWaterNews } from "./components/GlobalWaterNews";'
  );
}

// Remove Kaggle state
const kaggleStateLines = `  // Kaggle ML calibration controls
  const [selectedKaggleTech, setSelectedKaggleTech] = useState<string>("reverse-osmosis");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["isolated_namespaces", "prompt_distance_checks", "token_vaulting"]);
  const [selectedClassifier, setSelectedClassifier] = useState<string>("Proxy Assessor Pipeline");
  const [hyperDepth, setHyperDepth] = useState<number>(6);
  const [hyperLearningRate, setHyperLearningRate] = useState<number>(0.05);
  const [hyperTrees, setHyperTrees] = useState<number>(250);
  const [kaggleResult, setKaggleResult] = useState<KaggleSimulationResult | null>(null);
  const [isSimulatingKaggle, setIsSimulatingKaggle] = useState(false);`;
content = content.replace(kaggleStateLines, "");

// Remove Kaggle simulate function
const runKaggleFuncMatch = /  \/\/ Run Kaggle 5-Day Simulation[\s\S]*?    \} catch \(e\) \{[\s\S]*?      setIsSimulatingKaggle\(false\);\n    \}\n  \};\n/g;
content = content.replace(runKaggleFuncMatch, "");

// Replace Kaggle UI with GlobalWaterNews component
const kaggleUIMatch = /            \{\/\* 3\. KAGGLE 5-DAY AGENT SANDBOXING HUB \*\/\}[\s\S]*?            <\/article>/g;
content = content.replace(kaggleUIMatch, `            {/* 3. Global Water Event News crawler */} \n            <GlobalWaterNews />`);

fs.writeFileSync(fp, content, 'utf-8');
console.log("Kaggle section replaced with GlobalWaterNews in App.tsx");
