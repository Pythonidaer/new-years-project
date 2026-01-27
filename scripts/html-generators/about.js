/**
 * Generates the standalone "About Cyclomatic Complexity" page (complexity/about.html).
 * Barebones, Istanbul-style. Examples live on a separate page.
 * @returns {string} Full HTML document string
 */
export function generateAboutPageHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About Cyclomatic Complexity</title>
  <link rel="stylesheet" href="shared.css" />
  <style>
    body { padding: 20px; line-height: 1.4; }
    .back-link { display: inline-block; margin-bottom: 12px; }
    h2 { font-size: 16px; margin: 16px 0 6px 0; }
  </style>
</head>
<body>
  <a href="index.html" class="back-link">← Back to complexity report</a>
  <h1>About Cyclomatic Complexity</h1>
  <p>Cyclomatic complexity measures linearly independent paths through code. <strong>Formula:</strong> 1 (base) + decision points. Lower is better.</p>
  <h2>About This Report</h2>
  <p>This complexity report extends <strong>ESLint's <code>complexity</code> rule</strong> (<code>variant: "classic"</code>) to provide detailed analysis of your codebase. The report analyzes <code>*.ts</code> and <code>*.tsx</code> files.</p>
  <p><strong>Important:</strong> Complexity is measured for <strong>callable units</strong> (functions, methods, arrow functions). Top-level module code (code outside of functions) is not measured, as it executes once at module load and doesn't have the same complexity concerns as reusable functions.</p>
  <h2>Summary: JavaScript, TypeScript, React</h2>
  <h3>Counted</h3>
  <ul>
    <li><code>if</code>, each <code>else if</code></li>
    <li><code>for</code>, <code>for...of</code>, <code>for...in</code>, <code>while</code>, <code>do...while</code></li>
    <li><code>switch</code>; each <code>case</code> / <code>default</code></li>
    <li><code>catch</code></li>
    <li>Ternary <code>? :</code></li>
    <li><code>&&</code> / <code>||</code> in conditions (incl. JSX)</li>
    <li>Optional chaining <code>?.</code></li>
    <li>Nullish coalescing <code>??</code></li>
    <li><strong>Default parameters</strong> (some linters, like ESLint's <code>classic</code> variant, count default parameter values as decision points)</li>
  </ul>
  <h3>Not counted</h3>
  <ul>
    <li>Sequential statements (assignments, calls, declarations)</li>
    <li>JSX without conditionals</li>
    <li>Hook calls (only callbacks count)</li>
    <li>TypeScript types, interfaces, generics</li>
    <li>Literals, destructuring; arithmetic, strings</li>
    <li>Property access; method calls</li>
    <li>Unconditional <code>return</code></li>
  </ul>
</body>
</html>`;
}
