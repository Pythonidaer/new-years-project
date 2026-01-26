import { readFileSync } from 'fs';

const sourceCode = readFileSync('src/components/ThemePicker/ThemePicker.tsx', 'utf-8');
const lines = sourceCode.split('\n');

// Test GradientGroup function (line 132)
const line132 = lines[131]; // 0-based index
console.log('Line 132:', line132);
console.log('');

const pattern1 = /\)\s*[:\w\s<>[\]|'"]*\s*\{/;
const pattern2 = /^\s*(?:export\s+)?function\s+\w+/.test(line132) && 
                 line132.includes('(') && 
                 line132.includes('{') && 
                 !line132.includes('=>');

console.log('Pattern1 (hasFunctionBodyPattern):', pattern1.test(line132));
console.log('Pattern2 (isFunctionDeclaration):', pattern2);
console.log('Has {:', line132.includes('{'));
console.log('Has =>:', line132.includes('=>'));
console.log('');

// Check what happens in the boundary detection
let inFunctionBody = false;
let braceCount = 0;
const start = 132;
const loopStart = start - 1; // 131

console.log('Starting from line', loopStart + 1);
for (let i = loopStart; i < Math.min(loopStart + 3, lines.length); i++) {
  const line = lines[i];
  const lineNum = i + 1;
  console.log(`\nLine ${lineNum}:`, line.substring(0, 80));
  
  if (!inFunctionBody) {
    const hasFunctionBodyPattern = pattern1.test(line);
    const isFunctionDeclaration = /^\s*(?:export\s+)?function\s+\w+/.test(line) && 
                                  line.includes('(') && 
                                  line.includes('{') && 
                                  !line.includes('=>');
    
    console.log(`  hasFunctionBodyPattern: ${hasFunctionBodyPattern}`);
    console.log(`  isFunctionDeclaration: ${isFunctionDeclaration}`);
    
    if (hasFunctionBodyPattern || isFunctionDeclaration) {
      inFunctionBody = true;
      const allOpenBraces = (line.match(/{/g) || []).length;
      braceCount = allOpenBraces;
      console.log(`  -> Function body detected! braceCount=${braceCount}`);
    } else if (line.includes('{')) {
      console.log(`  -> Treating as type definition brace`);
    }
  }
}
