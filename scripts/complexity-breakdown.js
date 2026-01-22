/**
 * Calculates complexity breakdown for a specific function
 * @param {number} functionLine - Line number of the function
 * @param {Array} decisionPoints - All decision points
 * @param {number} baseComplexity - Base complexity (should be 1)
 * @returns {Object} { breakdown: {...}, calculatedTotal: number, decisionPoints: [...] }
 */
export function calculateComplexityBreakdown(functionLine, decisionPoints, baseComplexity) {
  const functionDecisionPoints = decisionPoints.filter(dp => dp.functionLine === functionLine);
  
  const breakdown = {
    base: baseComplexity || 1,
    'if': 0,
    'else if': 0,
    'for': 0,
    'for...of': 0,
    'for...in': 0,
    'while': 0,
    'do...while': 0,
    'switch': 0,
    'case': 0,
    'catch': 0,
    'ternary': 0,
    '&&': 0,
    '||': 0,
    'default parameter': 0,
  };
  
  functionDecisionPoints.forEach(dp => {
    if (breakdown.hasOwnProperty(dp.type)) {
      breakdown[dp.type]++;
    }
  });
  
  const calculatedTotal = Object.values(breakdown).reduce((sum, count) => sum + count, 0);
  
  return {
    breakdown,
    calculatedTotal,
    decisionPoints: functionDecisionPoints,
  };
}

/**
 * Formats complexity breakdown as a readable string
 * @param {Object} breakdown - Breakdown object from calculateComplexityBreakdown
 * @param {number} actualComplexity - Actual complexity from ESLint
 * @returns {string} Formatted breakdown string
 */
export function formatComplexityBreakdown(breakdown, actualComplexity) {
  const parts = [];
  
  // Always include base
  if (breakdown.base > 0) {
    parts.push(`${breakdown.base} base`);
  }
  
  // Order decision point types consistently
  const typeOrder = ['if', 'else if', 'for', 'for...of', 'for...in', 'while', 'do...while', 'switch', 'case', 'catch', 'ternary', '&&', '||', 'default parameter'];
  
  typeOrder.forEach(type => {
    if (breakdown[type] > 0) {
      parts.push(`${breakdown[type]} ${type}`);
    }
  });
  
  const breakdownStr = parts.join(' + ');
  return `complexity = ${actualComplexity} (${breakdownStr})`;
}

/**
 * Formats complexity breakdown as ESLint-style breakdown (e.g., "1 base + 1 if + 1 ||")
 * @param {Object} breakdown - Breakdown object from calculateComplexityBreakdown
 * @param {number} actualComplexity - Actual complexity from ESLint
 * @returns {string} Formatted breakdown string
 */
export function formatComplexityBreakdownInline(breakdown, actualComplexity) {
  const parts = [];
  
  // Always include base
  if (breakdown.base > 0) {
    parts.push(`${breakdown.base} base`);
  }
  
  // Order decision point types consistently (matching ESLint's counting)
  const typeOrder = ['if', 'else if', 'for', 'for...of', 'for...in', 'while', 'do...while', 'switch', 'case', 'catch', 'ternary', '&&', '||', 'default parameter'];
  
  typeOrder.forEach(type => {
    const count = breakdown[type] || 0;
    if (count > 0) {
      // Use ESLint symbols: ?: for ternary, && for AND, || for OR
      const symbol = type === 'ternary' ? '?:' : type === '&&' ? '&&' : type === '||' ? '||' : type;
      parts.push(`+${count} ${symbol}`);
    }
  });
  
  return parts.join(' ');
}

/**
 * Formats complexity breakdown with styled numbers and dividers between decision paths
 * Returns HTML string with styled breakdown
 * @param {Object} breakdown - Breakdown object from calculateComplexityBreakdown
 * @param {number} actualComplexity - Actual complexity from ESLint
 * @returns {string} Formatted HTML string
 */
export function formatComplexityBreakdownStyled(breakdown, actualComplexity) {
  const parts = [];
  
  // Always include base with styled number
  if (breakdown.base > 0) {
    parts.push(`base <span class="complexity-number">${breakdown.base}</span>`);
  }
  
  // Order decision point types consistently (matching ESLint's counting)
  const typeOrder = ['if', 'else if', 'for', 'for...of', 'for...in', 'while', 'do...while', 'switch', 'case', 'catch', 'ternary', '&&', '||', 'default parameter'];
  
  typeOrder.forEach(type => {
    const count = breakdown[type] || 0;
    if (count > 0) {
      // Use ESLint symbols: ?: for ternary, && for AND, || for OR
      const symbol = type === 'ternary' ? '?:' : type === '&&' ? '&&' : type === '||' ? '||' : type;
      parts.push(`${symbol} <span class="complexity-number">${count}</span>`);
    }
  });
  
  // Join with dividers (pipes) and spacing
  return parts.join(' <span class="breakdown-divider">|</span> ');
}

/**
 * Formats complexity breakdown concisely (used by formatFunctionNode - legacy function)
 * @param {Object} breakdown - Breakdown object from calculateComplexityBreakdown
 * @param {number} actualComplexity - Actual complexity from ESLint
 * @returns {string} Formatted breakdown string
 */
export function formatComplexityConcise(breakdown, actualComplexity) {
  return formatComplexityBreakdownInline(breakdown, actualComplexity);
}
