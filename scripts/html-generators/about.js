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
  <style>
    body { font-family: Helvetica Neue, Helvetica, Arial; font-size: 14px; color: #333; margin: 0; padding: 20px; line-height: 1.4; }
    a { color: #0074D9; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .back-link { display: inline-block; margin-bottom: 12px; }
    h1 { font-size: 20px; margin: 0 0 12px 0; }
    h2 { font-size: 16px; margin: 16px 0 6px 0; font-weight: bold; }
    h3 { font-size: 14px; margin: 12px 0 4px 0; font-weight: bold; }
    p { margin: 4px 0; }
    ul { margin: 4px 0; padding-left: 20px; }
    li { margin: 2px 0; }
    code { font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 13px; background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
  </style>
</head>
<body>
  <a href="index.html" class="back-link">← Back to complexity report</a>
  <h1>About Cyclomatic Complexity</h1>
  <p>Cyclomatic complexity measures linearly independent paths through code. <strong>Formula:</strong> 1 (base) + decision points. Lower is better.</p>
  <h2>Summary: JavaScript, TypeScript, React</h2>
  <p>ESLint <code>complexity</code> rule (<code>variant: "classic"</code>) on <code>*.ts</code> / <code>*.tsx</code>.</p>
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
  <h2>See also</h2>
  <ul>
    <li><a href="about-examples.html">Examples</a></li>
  </ul>
</body>
</html>`;
}

/**
 * Generates the "Examples" page (complexity/about-examples.html).
 * Barebones, Istanbul-style. Linked from About.
 * @returns {string} Full HTML document string
 */
export function generateAboutExamplesPageHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Examples — Cyclomatic Complexity</title>
  <style>
    body { font-family: Helvetica Neue, Helvetica, Arial; font-size: 14px; color: #333; margin: 0; padding: 20px; line-height: 1.5; }
    a { color: #0074D9; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .back-link { display: inline-block; margin-bottom: 20px; padding: 5px 10px; border: 1px solid #0074D9; border-radius: 3px; background: white; margin-right: 10px; }
    .back-link:hover { background: #f0f0f0; }
    h1 { font-size: 24px; margin: 0 0 20px 0; }
    h2 { font-size: 18px; margin: 30px 0 15px 0; color: #555; }
    h4 { font-size: 14px; margin: 20px 0 8px 0; color: #0074D9; }
    p { margin: 10px 0; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 13px; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; margin: 15px 0; border-left: 4px solid #0074D9; }
    pre code { background: transparent; padding: 0; }
    .example-box { background: #f9f9f9; border-left: 4px solid #0074D9; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .example-box h4 { margin-top: 0; }
    .decision-point-example { background: #F6C6CE; padding: 2px 4px; border-radius: 2px; }
  </style>
</head>
<body>
  <a href="index.html" class="back-link">← Back to complexity report</a>
  <a href="about.html" class="back-link">← Back to About</a>
  <h1>Examples</h1>

  <h2>JavaScript</h2>
  <div class="example-box">
    <h4>if statement</h4>
    <pre><code>function greet(name) {
  <span class="decision-point-example">if (name) {</span>
    return \`Hello, \${name}!\`;
  }
  return "Hello, stranger!";
}</code></pre>
    <p><strong>Complexity: 2</strong> (1 base + 1 if)</p>
  </div>
  <div class="example-box">
    <h4>Ternary and logical OR</h4>
    <pre><code>function getStatus(isComplete) {
  <span class="decision-point-example">return isComplete ? "Done" : "Pending";</span>
}
function isValid(v) {
  <span class="decision-point-example">return v === "a" || v === "b";</span>
}</code></pre>
    <p><strong>Complexity: 2</strong> each (1 base + 1 ternary or 1 ||)</p>
  </div>

  <h2>React / TypeScript</h2>
  <p>Conditional rendering (<code>&&</code>, ternary in JSX) and branching inside components count. Hook calls themselves do not; only branches in their callbacks do. TypeScript types and generics do not count.</p>
</body>
</html>`;
}
