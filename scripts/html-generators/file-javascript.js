/**
 * Generates JavaScript code for the file HTML page
 * @param {boolean} initialShowAllColumns - Whether to show all columns initially
 * @param {Object} columnStructure - Column structure configuration
 * @param {Set} emptyColumns - Set of empty column keys
 * @param {Object} lineToSpan - Map of line numbers to span objects
 * @returns {string} JavaScript code
 */
export function generateJavaScriptCode(initialShowAllColumns, columnStructure, emptyColumns, lineToSpan) {
  return `
  let showAllColumns = ${initialShowAllColumns};
  let sortColumn = 'complexity';
  let sortDirection = 'desc';
  const columnConfig = ${JSON.stringify({
    groups: columnStructure.groups.map(group => ({
      name: group.name,
      columns: group.columns,
      totalColumns: group.columns.length
    })),
    emptyColumns: Array.from(emptyColumns),
    baseColumn: columnStructure.baseColumn
  })};
  const COVERAGE_LINE_TO_SPAN = ${JSON.stringify(lineToSpan)};

  (function initHoverVerticalLine() {
    return;
    const table = document.getElementById('coverage-table');
    const wrapper = table && table.closest('.coverage-table-wrapper');
    const lineEl = document.getElementById('hover-vertical-line');
    if (!table || !wrapper || !lineEl) return;
    const pre = table.querySelector('pre.prettyprint');
    let chWidth = 0;
    if (pre) {
      const s = document.createElement('span');
      s.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;font:' + getComputedStyle(pre).font + ';';
      s.textContent = '0';
      document.body.appendChild(s);
      chWidth = s.offsetWidth;
      document.body.removeChild(s);
    }
    function onEnter(ev) {
      const td = ev.target.closest('td');
      if (!td || (!td.classList.contains('line-count') && !td.classList.contains('line-coverage'))) return;
      const tr = td.closest('tr');
      const line = tr && tr.getAttribute('data-line');
      if (!line) return;
      const span = COVERAGE_LINE_TO_SPAN[line];
      if (!span) return;
      const first = table.querySelector(\`tr[data-line="\${span.start}"]\`);
      const last = table.querySelector(\`tr[data-line="\${span.end}"]\`);
      if (!first || !last) return;
      const codeCell = first.querySelector('td.text');
      if (!codeCell) return;
      const wr = wrapper.getBoundingClientRect();
      const fr = first.getBoundingClientRect();
      const lr = last.getBoundingClientRect();
      const cr = codeCell.getBoundingClientRect();
      const top = fr.top - wr.top;
      const height = lr.bottom - fr.top;
      const indent = (span.indent != null ? span.indent : 0) * chWidth;
      const left = (cr.left - wr.left) + indent;
      lineEl.style.top = top + 'px';
      lineEl.style.height = height + 'px';
      lineEl.style.left = left + 'px';
      lineEl.classList.add('visible');
    }
    function onLeave(ev) {
      const td = ev.target.closest('td');
      if (!td || (!td.classList.contains('line-count') && !td.classList.contains('line-coverage'))) return;
      const next = ev.relatedTarget;
      if (next && table.contains(next)) {
        const nextTd = next.closest && next.closest('td');
        if (nextTd && (nextTd.classList.contains('line-count') || nextTd.classList.contains('line-coverage'))) return;
      }
      lineEl.classList.remove('visible');
      lineEl.style.left = '';
      lineEl.style.top = '';
      lineEl.style.height = '';
    }
    table.addEventListener('mouseover', onEnter);
    table.addEventListener('mouseout', onLeave);
  })();

  function updateSortIndicators() {
    // Reset all indicators
    const allIndicators = document.querySelectorAll('.sort-indicator');
    allIndicators.forEach(indicator => {
      indicator.className = 'sort-indicator';
    });
    
    // Set active indicator
    if (sortColumn) {
      const indicator = document.getElementById(\`sort-\${sortColumn}-indicator\`);
      if (indicator) {
        indicator.className = \`sort-indicator sort-\${sortDirection}\`;
      }
    }
  }
  
  function sortTable(column) {
    const tbody = document.getElementById('complexity-breakdown-tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column;
      // Default to desc for complexity, asc for function
      sortDirection = column === 'complexity' ? 'desc' : 'asc';
    }
    rows.sort((a, b) => {
      let aValue, bValue;
      if (column === 'function') {
        const aCell = a.querySelector('.function-name');
        const bCell = b.querySelector('.function-name');
        aValue = aCell ? aCell.textContent.trim().toLowerCase() : '';
        bValue = bCell ? bCell.textContent.trim().toLowerCase() : '';
      } else if (column === 'complexity') {
        const aCell = a.querySelector('.complexity-value');
        const bCell = b.querySelector('.complexity-value');
        aValue = aCell ? parseInt(aCell.textContent.trim()) || 0 : 0;
        bValue = bCell ? parseInt(bCell.textContent.trim()) || 0 : 0;
      } else {
        // Breakdown column (if, for, ternary, &&, ||, etc.)
        const aCell = a.querySelector(\`td[data-column-key="\${column}"]\`);
        const bCell = b.querySelector(\`td[data-column-key="\${column}"]\`);
        const aText = aCell ? aCell.textContent.trim() : '-';
        const bText = bCell ? bCell.textContent.trim() : '-';
        aValue = aText === '-' ? 0 : parseInt(aText) || 0;
        bValue = bText === '-' ? 0 : parseInt(bText) || 0;
      }
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    rows.forEach(row => tbody.appendChild(row));
    updateSortIndicators();
  }
  
  function rebuildTableHeaders(showAll) {
    const headerSpan = document.getElementById('breakdown-header-span');
    const groupHeadersRow = document.getElementById('breakdown-group-headers-row');
    const colHeadersRow = document.getElementById('breakdown-col-headers-row');
    const visibleGroups = columnConfig.groups.map(group => {
      const visibleColumns = showAll 
        ? group.columns 
        : group.columns.filter(col => !columnConfig.emptyColumns.includes(col.key));
      return {
        name: group.name,
        columns: visibleColumns,
        totalColumns: group.columns.length
      };
    });
    const totalBreakdownCols = visibleGroups.reduce((sum, group) => sum + group.columns.length, 0) + 1;
    headerSpan.setAttribute('colspan', 2 + totalBreakdownCols);
    const groupHeadersHTML = visibleGroups.map(group => {
      if (group.columns.length === 0) return '';
      return \`<th colspan="\${group.columns.length}" class="breakdown-group-header" data-group="\${group.name}">\${group.name}</th>\`;
    }).filter(Boolean).join('');
    groupHeadersRow.innerHTML = \`<th rowspan="2" class="breakdown-function-header sortable" onclick="sortTable('function')" id="sort-function-header">Function <span class="sort-indicator" id="sort-function-indicator"></span></th><th rowspan="2" class="breakdown-complexity-header sortable" onclick="sortTable('complexity')" id="sort-complexity-header">Complexity <span class="sort-indicator" id="sort-complexity-indicator"></span></th>\${groupHeadersHTML}<th class="breakdown-group-header" colspan="1">\${columnConfig.baseColumn.label}</th>\`;
    updateSortIndicators();
    const colHeadersHTML = visibleGroups.map(group => 
      group.columns.map(col => \`<th class="breakdown-col-header sortable" data-column-key="\${col.key}" onclick="sortTable('\${col.key}')" id="sort-\${col.key}-header">\${col.label} <span class="sort-indicator" id="sort-\${col.key}-indicator"></span></th>\`).join('')
    ).join('');
    colHeadersRow.innerHTML = \`\${colHeadersHTML}<th class="breakdown-col-header sortable" data-column-key="\${columnConfig.baseColumn.key}" onclick="sortTable('\${columnConfig.baseColumn.key}')" id="sort-\${columnConfig.baseColumn.key}-header">\${columnConfig.baseColumn.label} <span class="sort-indicator" id="sort-\${columnConfig.baseColumn.key}-indicator"></span></th>\`;
  }
  
  function rebuildTableBody(showAll) {
    const tbody = document.getElementById('complexity-breakdown-tbody');
    const rows = tbody.querySelectorAll('tr');
    const visibleColumns = columnConfig.groups.flatMap(group => {
      if (showAll) {
        return group.columns;
      }
      return group.columns.filter(col => !columnConfig.emptyColumns.includes(col.key));
    });
    rows.forEach(row => {
      // Skip the no-matches row
      if (row.id === 'no-matches-row') {
        return;
      }
      const cells = row.querySelectorAll('td');
      const functionCell = cells[0];
      const complexityCell = cells[1];
      // Skip rows that don't have the expected structure
      if (!functionCell || !complexityCell) {
        return;
      }
      const breakdownData = {};
      const existingBreakdownCells = Array.from(cells).slice(2, -1);
      existingBreakdownCells.forEach(cell => {
        const key = cell.getAttribute('data-column-key');
        if (key) {
          const text = cell.textContent.trim();
          breakdownData[key] = text === '-' ? 0 : parseInt(text) || 0;
        }
      });
      const baseValue = parseInt(cells[cells.length - 1].textContent.trim()) || 1;
      breakdownData.base = baseValue;
      const breakdownCells = visibleColumns.map(col => {
        const value = breakdownData[col.key] || 0;
        const displayValue = value === 0 ? '-' : value;
        const emptyClass = value === 0 ? ' breakdown-value-empty' : '';
        return \`<td class="breakdown-value\${emptyClass}" data-column-key="\${col.key}">\${displayValue}</td>\`;
      });
      breakdownCells.push(\`<td class="breakdown-value">\${baseValue}</td>\`);
      row.innerHTML = \`\${functionCell.outerHTML}\${complexityCell.outerHTML}\${breakdownCells.join('')}\`;
    });
  }
  
  function toggleEmptyColumns() {
    const checkbox = document.getElementById('breakdown-show-all-columns');
    showAllColumns = checkbox ? checkbox.checked : false;
    rebuildTableHeaders(showAllColumns);
    rebuildTableBody(showAllColumns);
    if (sortColumn) {
      sortTable(sortColumn);
    }
    const searchInput = document.getElementById('breakdown-search');
    if (searchInput && searchInput.value) {
      filterFunctions(searchInput.value);
    }
  }
  
  function filterFunctions(searchTerm) {
    const tbody = document.getElementById('complexity-breakdown-tbody');
    const rows = tbody.querySelectorAll('tr:not(#no-matches-row)');
    const noMatchesRow = document.getElementById('no-matches-row');
    const searchLower = searchTerm.toLowerCase().trim();
    let visibleCount = 0;
    rows.forEach(row => {
      const functionCell = row.querySelector('.function-name');
      if (functionCell) {
        const functionName = functionCell.textContent.trim().toLowerCase();
        const matches = searchLower === '' || functionName.includes(searchLower);
        row.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
      }
    });
    if (noMatchesRow) {
      if (searchLower !== '' && visibleCount === 0) {
        noMatchesRow.style.display = '';
        const headerSpan = document.getElementById('breakdown-header-span');
        const currentColspan = headerSpan ? parseInt(headerSpan.getAttribute('colspan')) || 0 : 0;
        const noMatchesCell = noMatchesRow.querySelector('.no-matches-message');
        if (noMatchesCell) {
          noMatchesCell.setAttribute('colspan', 2 + currentColspan);
        }
      } else {
        noMatchesRow.style.display = 'none';
      }
    }
  }
  
  function toggleTableVisibility() {
    const checkbox = document.getElementById('breakdown-show-table');
    const table = document.getElementById('complexity-breakdown-table');
    if (table && checkbox) {
      table.style.display = checkbox.checked ? 'table' : 'none';
    }
  }
  
  // Initialize with complexity sorted descending
  // Apply initial sort after DOM is ready
  setTimeout(function() {
    const tbody = document.getElementById('complexity-breakdown-tbody');
    if (tbody) {
      const rows = Array.from(tbody.querySelectorAll('tr'));
      rows.sort((a, b) => {
        const aCell = a.querySelector('.complexity-value');
        const bCell = b.querySelector('.complexity-value');
        const aValue = aCell ? parseInt(aCell.textContent.trim()) || 0 : 0;
        const bValue = bCell ? parseInt(bCell.textContent.trim()) || 0 : 0;
        if (aValue < bValue) return 1; // desc: higher values first
        if (aValue > bValue) return -1;
        return 0;
      });
      rows.forEach(row => tbody.appendChild(row));
    }
    updateSortIndicators();
  }, 0);
  
  // Initialize syntax highlighting with prettify
  if (typeof prettyPrint !== 'undefined') {
    // Use setTimeout to ensure DOM is fully ready
    setTimeout(function() {
      prettyPrint();
    }, 0);
  }
`;
}
