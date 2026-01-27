import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '../../..');
const themeDataPath = resolve(projectRoot, 'src/context/themeData.ts');
const themesDir = resolve(projectRoot, 'src/context/themes');

// Read the themeData file
const content = readFileSync(themeDataPath, 'utf-8');

// Extract all theme definitions from builtInPresets array
// Pattern: { id: '...', name: '...', theme: { ... } }
const presetMatches = [];
let inPresetArray = false;
let braceDepth = 0;
let currentPreset = '';

for (let i = 0; i < content.length; i++) {
  if (content.substring(i, i + 15) === 'const builtInPresets') {
    inPresetArray = true;
    i += 15;
    continue;
  }
  
  if (inPresetArray) {
    if (content[i] === '[') {
      continue;
    }
    if (content[i] === '{') {
      if (braceDepth === 0) {
        currentPreset = '{';
      }
      braceDepth++;
    } else if (content[i] === '}') {
      currentPreset += content[i];
      braceDepth--;
      if (braceDepth === 0) {
        // Check if this looks like a preset object
        if (currentPreset.includes("id: '") && currentPreset.includes("name: '") && currentPreset.includes("theme: {")) {
          const idMatch = currentPreset.match(/id: '([^']+)'/);
          const nameMatch = currentPreset.match(/name: '([^']+)'/);
          if (idMatch && nameMatch) {
            presetMatches.push({
              id: idMatch[1],
              name: nameMatch[1],
              content: currentPreset
            });
          }
        }
        currentPreset = '';
      }
    } else if (braceDepth > 0) {
      currentPreset += content[i];
    }
    
    if (content[i] === ']' && braceDepth === 0) {
      break;
    }
  }
}

console.log(`Found ${presetMatches.length} themes`);

// Extract theme objects from each preset
const themes = [];
for (const preset of presetMatches) {
  // Extract the theme object from the preset
  const themeMatch = preset.content.match(/theme:\s*\{([\s\S]*)\}\s*\}/);
  if (themeMatch) {
    const themeContent = themeMatch[1].trim();
    // Check if it uses ...defaultTheme spread
    const usesSpread = themeContent.includes('...defaultTheme');
    
    themes.push({
      id: preset.id,
      name: preset.name,
      themeContent: themeContent,
      usesSpread: usesSpread
    });
  }
}

// Create themes directory if it doesn't exist
mkdirSync(themesDir, { recursive: true });

// Write each theme to its own file
for (const theme of themes) {
  const fileName = `${theme.id}.ts`;
  const filePath = resolve(themesDir, fileName);
  
  let fileContent = `import type { Theme } from './types';\n`;
  
  if (theme.usesSpread) {
    fileContent += `import { defaultTheme } from './default';\n\n`;
    fileContent += `// ${theme.name} theme\n`;
    fileContent += `export const ${theme.id.replace(/-/g, '_')}Theme: Theme = {\n`;
    fileContent += `  ...defaultTheme,\n`;
    fileContent += theme.themeContent.split('\n').map(line => {
      // Remove leading/trailing whitespace and ensure proper indentation
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('...')) {
        return `  ${trimmed}`;
      }
      return '';
    }).filter(line => line).join('\n');
    fileContent += `\n};\n`;
  } else {
    fileContent += `// ${theme.name} theme\n`;
    fileContent += `export const ${theme.id.replace(/-/g, '_')}Theme: Theme = {\n`;
    fileContent += theme.themeContent.split('\n').map(line => {
      const trimmed = line.trim();
      if (trimmed) {
        return `  ${trimmed}`;
      }
      return '';
    }).filter(line => line).join('\n');
    fileContent += `\n};\n`;
  }
  
  writeFileSync(filePath, fileContent, 'utf-8');
  console.log(`Created ${fileName}`);
}

console.log(`\nExtracted ${themes.length} themes to ${themesDir}`);
