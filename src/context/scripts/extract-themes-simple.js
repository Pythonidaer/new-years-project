import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '../../..');
const themeDataPath = resolve(projectRoot, 'src/context/themeData.ts');
const themesDir = resolve(projectRoot, 'src/context/themes');

const content = readFileSync(themeDataPath, 'utf-8');
const lines = content.split('\n');

// Find the start of builtInPresets array
let inPresetArray = false;
let inPreset = false;
let inTheme = false;
let braceDepth = 0;
let themeBraceDepth = 0;
let currentPreset = { id: '', name: '', themeLines: [], startLine: -1 };
const presets = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('const builtInPresets')) {
    inPresetArray = true;
    continue;
  }
  
  if (!inPresetArray) continue;
  
  if (line.includes('];') && !inPreset) {
    break;
  }
  
  // Detect start of a preset object
  if (line.trim().startsWith('{') && !inPreset && inPresetArray) {
    inPreset = true;
    braceDepth = 1;
    currentPreset = { id: '', name: '', themeLines: [] };
    continue;
  }
  
  if (inPreset) {
    // Track brace depth
    braceDepth += (line.match(/\{/g) || []).length;
    braceDepth -= (line.match(/\}/g) || []).length;
    
    // Extract id
    const idMatch = line.match(/id:\s*'([^']+)'/);
    if (idMatch) {
      currentPreset.id = idMatch[1];
    }
    
    // Extract name
    const nameMatch = line.match(/name:\s*'([^']+)'/);
    if (nameMatch) {
      currentPreset.name = nameMatch[1];
    }
    
    // Detect theme start
    if (line.includes('theme: {')) {
      inTheme = true;
      themeBraceDepth = 1;
      currentPreset.themeLines.push(line);
      continue;
    }
    
    if (inTheme) {
      currentPreset.themeLines.push(line);
      themeBraceDepth += (line.match(/\{/g) || []).length;
      themeBraceDepth -= (line.match(/\}/g) || []).length;
      
      if (themeBraceDepth === 0) {
        inTheme = false;
      }
    }
    
    // End of preset object
    if (braceDepth === 0 && line.trim().endsWith('},')) {
      presets.push({ ...currentPreset });
      inPreset = false;
      inTheme = false;
    }
  }
}

console.log(`Found ${presets.length} presets`);

// Create themes directory
mkdirSync(themesDir, { recursive: true });

// Write each theme file
for (const preset of presets) {
  if (!preset.id) continue;
  
  const fileName = `${preset.id}.ts`;
  const filePath = resolve(themesDir, fileName);
  
  // Extract theme content (remove "theme: {" and closing "}")
  let themeContent = preset.themeLines.join('\n');
  themeContent = themeContent.replace(/^\s*theme:\s*\{/, '').trim();
  themeContent = themeContent.replace(/\}\s*$/, '').trim();
  
  const usesSpread = themeContent.includes('...defaultTheme');
  
  let fileContent = `import type { Theme } from './types';\n`;
  
  if (usesSpread) {
    fileContent += `import { defaultTheme } from './default';\n\n`;
    fileContent += `// ${preset.name} theme\n`;
    fileContent += `export const ${preset.id.replace(/-/g, '_')}Theme: Theme = {\n`;
    fileContent += `  ...defaultTheme,\n`;
    
    // Process theme content lines
    const themeLines = themeContent.split('\n');
    for (const themeLine of themeLines) {
      const trimmed = themeLine.trim();
      if (trimmed && !trimmed.startsWith('...defaultTheme')) {
        fileContent += `  ${trimmed}\n`;
      }
    }
    fileContent += `};\n`;
  } else {
    fileContent += `// ${preset.name} theme\n`;
    fileContent += `export const ${preset.id.replace(/-/g, '_')}Theme: Theme = {\n`;
    const themeLines = themeContent.split('\n');
    for (const themeLine of themeLines) {
      const trimmed = themeLine.trim();
      if (trimmed) {
        fileContent += `  ${trimmed}\n`;
      }
    }
    fileContent += `};\n`;
  }
  
  writeFileSync(filePath, fileContent, 'utf-8');
  console.log(`Created ${fileName} (${preset.name})`);
}

console.log(`\nExtracted ${presets.length} themes to ${themesDir}`);
