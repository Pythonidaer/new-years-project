/**
 * Generates file-specific CSS styles for the file HTML page
 * Note: Common styles are in shared.css and should be linked separately
 * @returns {string} CSS styles (file-specific only)
 */
export function generateFilePageCSS() {
  return `
      /* File-specific styles - coverage table and breakdown */
      .coverage-block {
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
      table.coverage {
        border-collapse: collapse;
        margin: 0;
        padding: 0;
        width: 100%;
      }
      table.coverage td {
        margin: 0;
        padding: 0;
        vertical-align: top;
      }
      table.coverage td.line-count {
        text-align: right;
        padding: 0 5px 0 5px;
      }
      table.coverage td.line-coverage {
        text-align: right;
        padding-right: 10px;
        min-width:20px;
      }
      table.coverage td span.cline-any {
        display: inline-block;
        padding: 0 5px;
        width: 100%;
      }
      span.cline-neutral { background: #eaeaea; }
      span.cline-yes { background: rgb(230,245,208); }
      pre.prettyprint {
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .wrapper {
        min-height: 100%;
        height: auto !important;
        height: 100%;
        margin: 0 auto -48px;
      }
      .footer, .push {
        height: 48px;
      }
      .footer {
        padding: 20px;
      }
      .code-line {
        display: inline-block;
        white-space: pre;
        width: max-content;
        font: inherit;
      }
      .decision-point-line {
        background: #F6C6CE;
      }
      .function-boundary-highlight {
        background: yellow !important;
      }
      /* Top-level (indent 0): full-width border across all columns. */
      tr.function-boundary-start[data-boundary-top-level="true"] td,
      tr.function-boundary-end[data-boundary-top-level="true"] td,
      tr.function-boundary-single[data-boundary-top-level="true"] td {
        border-top: 1px solid #0074D9;
      }
      tr[data-boundary-top-level="true"] td.text::before {
        display: none;
      }
      /* Nested: indented border in code column only, extend to right. Hierarchy via indent. */
      tr.function-boundary-start:not([data-boundary-top-level="true"]) td.text,
      tr.function-boundary-end:not([data-boundary-top-level="true"]) td.text,
      tr.function-boundary-single:not([data-boundary-top-level="true"]) td.text {
        position: relative;
        border-top: none;
      }
      tr.function-boundary-start:not([data-boundary-top-level="true"]) td.text::before,
      tr.function-boundary-end:not([data-boundary-top-level="true"]) td.text::before,
      tr.function-boundary-single:not([data-boundary-top-level="true"]) td.text::before {
        content: '';
        position: absolute;
        top: 0;
        left: calc(var(--indent-ch, 0) * 1ch);
        right: 0;
        height: 1px;
        background: #0074D9;
      }
      tr.function-boundary-start:not([data-boundary-top-level="true"]) td.line-count,
      tr.function-boundary-start:not([data-boundary-top-level="true"]) td.line-coverage,
      tr.function-boundary-end:not([data-boundary-top-level="true"]) td.line-count,
      tr.function-boundary-end:not([data-boundary-top-level="true"]) td.line-coverage,
      tr.function-boundary-single:not([data-boundary-top-level="true"]) td.line-count,
      tr.function-boundary-single:not([data-boundary-top-level="true"]) td.line-coverage {
        border-top: none;
      }
      .complexity-breakdown {
        margin: 0;
        padding: 0;
        max-width: 100%;
        overflow-x: auto;
        display: block;
        width: auto;
      }
      .complexity-breakdown h2 {
        margin: 0 0 10px 0;
        font-size: 14px;
        font-weight: bold;
        color: #333;
      }
      .complexity-breakdown-table {
        width: auto;
        max-width: 100%;
        border-collapse: collapse;
        margin: 10px 0 0;
        font-size: 13px;
      }
      .complexity-breakdown-table th {
        padding: 8px 4px;
        text-align: center;
        border: 1px solid #ddd;
        background-color: #f5f5f5;
        font-weight: bold;
        vertical-align: middle;
      }
      .complexity-breakdown-table td {
        padding: 10px;
        text-align: center;
        border: 1px solid #ddd;
        vertical-align: middle;
      }
      .complexity-breakdown-table td.function-name {
        text-align: left;
      }
      .breakdown-header {
        text-align: center;
        font-size: 16px;
        background-color: #e8e8e8;
        font-weight: bold;
        padding: 10px;
      }
      .breakdown-group-header {
        background-color: #f0f0f0;
        font-weight: 600;
        font-size: 13px;
      }
      .breakdown-col-header {
        font-weight: normal;
        font-size: 11px;
        background-color: #fafafa;
        white-space: nowrap;
      }
      .breakdown-value {
        text-align: center;
        font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        font-size: 12px;
        color: #333;
      }
      .breakdown-value-empty {
        background: #fff4c2;
      }
      .breakdown-col-empty {
        display: none;
      }
      .breakdown-group-empty {
        display: none;
      }
      .no-matches-message {
        text-align: center;
        padding: 30px 20px;
        color: #666;
        font-style: italic;
        background-color: #f9f9f9;
      }
      .function-name {
        text-align: left;
        font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        font-size: 11px;
        padding-left: 10px;
        padding-right: 10px;
        white-space: nowrap;
      }
      .breakdown-function-header {
        text-align: left;
        vertical-align: middle;
        font-weight: bold;
      }
      .breakdown-complexity-header {
        text-align: center;
        vertical-align: middle;
        font-weight: bold;
      }
      .sortable {
        cursor: pointer;
        user-select: none;
        position: relative;
      }
      .sortable:hover {
        background-color: #e8e8e8;
      }
      .sort-indicator {
        display: inline-block;
        margin-left: 5px;
        font-size: 10px;
        color: #666;
        width: 12px;
        min-width: 12px;
        text-align: center;
        vertical-align: middle;
        line-height: 1;
      }
      .sort-indicator::after {
        content: '';
        display: inline-block;
        width: 10px;
        height: 10px;
      }
      .sort-indicator.sort-asc::after {
        content: '▲';
      }
      .sort-indicator.sort-desc::after {
        content: '▼';
      }
      .complexity-value {
        text-align: center;
        font-weight: bold;
        font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        font-size: 13px;
      }
      .complexity-breakdown-table tbody tr {
        background-color: rgb(230, 245, 208);
      }
      .complexity-breakdown-table tbody tr:hover {
        background-color: rgb(220, 235, 198);
      }
      .breakdown-function {
        font-weight: bold;
        font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      }
      .breakdown-complexity {
        text-align: center;
      }
      .breakdown-details {
        font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        font-size: 13px;
      }
      .breakdown-divider {
        color: #999;
        margin: 0 4px;
        font-weight: normal;
      }
      .complexity-number {
        font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        font-size: 10px;
        color: #555;
        background: #E8E8E8;
        padding: 4px 5px;
        border-radius: 3px;
        vertical-align: middle;
        margin: 0 2px;
        display: inline-block;
      }
      .coverage-table-wrapper {
        position: relative;
      }
      #hover-vertical-line {
        position: absolute;
        left: 0;
        width: 0;
        border-left: 1px solid #0074D9;
        pointer-events: none;
        visibility: hidden;
        z-index: 1;
      }
      #hover-vertical-line.visible {
        visibility: visible;
      }
    `;
}
