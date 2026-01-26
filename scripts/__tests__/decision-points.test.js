/**
 * Tests for decision-points modules (assignment.js, multi-line-conditions.js, operators.js)
 * Note: decision-points.js re-exports from decision-points/index.js which does not exist.
 * We test the standalone modules. operators.js uses string-literals.js and ternaries.js stubs.
 */

import { describe, it, expect } from 'vitest';
import {
  getValidFunctions,
  findImmediateParent,
  findNestedFunctionsEndingOnOrBefore,
  findNestedFunctionsStartingOnLine,
  isInsideActiveNestedFunction,
  findActiveNestedFunctions,
  findFunctionsStartingOnLine,
  findSmallestBoundaryFunction,
  findSingleLineNestedFunctions,
  handleSingleLineNestedOnLine,
  findNestedEndingOnLine,
  findNestedEndedBefore,
  handleNestedFunctionsEnding,
  handleActiveNestedFunctions,
  handleSimpleCases,
  handleNestedStartingOnLine,
  handleAllNestedCases,
  handleFinalCases,
  getInnermostFunction,
  getFunctionLineForControlStructure,
} from '../decision-points/assignment.js';
import {
  isConditionStart,
  isBooleanAssignmentLine,
  isBooleanExpressionLine,
  shouldStopConditionLookback,
  isContinuingMultiLineCondition,
  shouldExcludeFromMultiLineConditions,
  shouldProcessMultiLineCondition,
  processMultiLineConditionOperators,
  parseMultiLineConditions,
} from '../decision-points/multi-line-conditions.js';
import {
  detectJSXExpressions,
  checkJSXContinuation,
  findBooleanExpressionFunctionLine,
  processBooleanExpressionOperators,
  hasBooleanAssignmentPattern,
  hasBooleanExpressionInParens,
  isLogicalOperatorInNonControlFlow,
  detectBooleanExpressionType,
  detectBooleanExpression,
  shouldExcludeFromBooleanExpressions,
  parseBooleanExpressions,
} from '../decision-points/operators.js';

const fn = (functionLine, start, end) => ({ functionLine, boundary: { start, end } });

describe('decision-points/assignment', () => {
  describe('getValidFunctions', () => {
    it('filters to functions containing the line', () => {
      const fns = [fn(2, 1, 10), fn(5, 4, 8), fn(9, 9, 12)];
      expect(getValidFunctions(fns, 6)).toEqual([fn(2, 1, 10), fn(5, 4, 8)]);
      expect(getValidFunctions(fns, 11)).toEqual([fn(9, 9, 12)]);
    });
    it('returns empty when none contain the line', () => {
      expect(getValidFunctions([fn(2, 1, 5)], 10)).toEqual([]);
    });
  });

  describe('findImmediateParent', () => {
    it('returns innermost function that contains the line', () => {
      const sorted = [fn(2, 2, 20), fn(5, 5, 15), fn(8, 8, 12)];
      expect(findImmediateParent(sorted, 10)?.functionLine).toBe(8);
    });
    it('returns null when no parent contains the line', () => {
      expect(findImmediateParent([fn(2, 5, 10)], 3)).toBeNull();
    });
  });

  describe('findNestedFunctionsEndingOnOrBefore', () => {
    it('returns nested functions ending on or before line', () => {
      const sorted = [fn(2, 2, 20), fn(5, 5, 12), fn(8, 8, 10)];
      const parent = fn(2, 2, 20);
      const result = findNestedFunctionsEndingOnOrBefore(sorted, parent, 13);
      expect(result.map((r) => r.functionLine).sort((a, b) => a - b)).toEqual([5, 8]);
    });
  });

  describe('findNestedFunctionsStartingOnLine', () => {
    it('returns nested functions starting on the line', () => {
      const sorted = [fn(2, 2, 20), fn(5, 5, 15), fn(6, 6, 10)];
      const parent = fn(2, 2, 20);
      const result = findNestedFunctionsStartingOnLine(sorted, parent, 5);
      expect(result.map((r) => r.functionLine)).toContain(5);
    });
  });

  describe('isInsideActiveNestedFunction', () => {
    it('returns true when line is inside a nested function', () => {
      const sorted = [fn(2, 2, 20), fn(5, 5, 15)];
      const parent = fn(2, 2, 20);
      expect(isInsideActiveNestedFunction(sorted, parent, 10)).toBe(true);
    });
    it('returns false when line is not inside nested', () => {
      const sorted = [fn(2, 2, 20), fn(5, 5, 8)];
      const parent = fn(2, 2, 20);
      expect(isInsideActiveNestedFunction(sorted, parent, 10)).toBe(false);
    });
  });

  describe('findActiveNestedFunctions', () => {
    it('returns nested functions that contain the line', () => {
      const sorted = [fn(2, 2, 20), fn(5, 5, 15), fn(8, 8, 12)];
      const parent = fn(2, 2, 20);
      const result = findActiveNestedFunctions(sorted, parent, 10);
      expect(result.map((r) => r.functionLine)).toEqual([5, 8]);
    });
  });

  describe('findFunctionsStartingOnLine', () => {
    it('returns functions that start on the line', () => {
      const valid = [fn(5, 5, 15), fn(5, 5, 10), fn(6, 6, 8)];
      expect(findFunctionsStartingOnLine(valid, 5).map((r) => r.functionLine)).toEqual([5, 5]);
    });
  });

  describe('findSmallestBoundaryFunction', () => {
    it('returns function with smallest boundary', () => {
      const fns = [fn(2, 1, 20), fn(5, 4, 10), fn(8, 7, 9)];
      expect(findSmallestBoundaryFunction(fns).functionLine).toBe(8);
    });
  });

  describe('findSingleLineNestedFunctions', () => {
    it('returns functions with start === end === lineNum', () => {
      const fns = [fn(5, 5, 5), fn(6, 6, 10)];
      expect(findSingleLineNestedFunctions(fns, 5).map((r) => r.functionLine)).toEqual([5]);
    });
  });

  describe('handleSingleLineNestedOnLine', () => {
    it('returns smallest single-line function line', () => {
      const single = [fn(5, 5, 5), fn(6, 6, 6)];
      expect(handleSingleLineNestedOnLine(single)).toBe(6);
    });
    it('returns null when empty', () => {
      expect(handleSingleLineNestedOnLine([])).toBeNull();
    });
  });

  describe('findNestedEndingOnLine', () => {
    it('filters to functions ending on line', () => {
      const nested = [fn(5, 5, 10), fn(6, 6, 10), fn(7, 7, 8)];
      expect(findNestedEndingOnLine(nested, 10).map((r) => r.functionLine)).toEqual([5, 6]);
    });
  });

  describe('findNestedEndedBefore', () => {
    it('filters to functions ending before line', () => {
      const nested = [fn(5, 5, 8), fn(6, 6, 10)];
      expect(findNestedEndedBefore(nested, 10).map((r) => r.functionLine)).toEqual([5]);
    });
  });

  describe('handleNestedFunctionsEnding', () => {
    it('returns single-line nested when present', () => {
      const nested = [fn(5, 5, 10), fn(10, 10, 10)];
      const parent = fn(2, 2, 20);
      expect(handleNestedFunctionsEnding(nested, parent, 10, false)).toBe(10);
    });
    it('returns null when inside active nested', () => {
      const nested = [fn(5, 5, 15)];
      const parent = fn(2, 2, 20);
      expect(handleNestedFunctionsEnding(nested, parent, 10, true)).toBeNull();
    });
  });

  describe('handleActiveNestedFunctions', () => {
    it('returns smallest active nested function line', () => {
      const active = [fn(5, 5, 15), fn(8, 8, 12)];
      expect(handleActiveNestedFunctions(active)).toBe(8);
    });
    it('returns null when empty', () => {
      expect(handleActiveNestedFunctions([])).toBeNull();
    });
  });

  describe('handleSimpleCases', () => {
    it('returns null when no containing functions', () => {
      expect(handleSimpleCases([], [])).toBeNull();
    });
    it('returns single containing function line', () => {
      expect(handleSimpleCases([fn(2, 1, 10)], [fn(2, 1, 10)])).toBe(2);
    });
    it('returns first when valid empty', () => {
      expect(handleSimpleCases([fn(2, 1, 10), fn(5, 3, 8)], [])).toBe(2);
    });
    it('returns single valid function line', () => {
      expect(handleSimpleCases([fn(2, 1, 10), fn(5, 3, 8)], [fn(5, 3, 8)])).toBe(5);
    });
  });

  describe('handleNestedStartingOnLine', () => {
    it('returns single-line nested when present', () => {
      const single = [fn(5, 5, 5)];
      expect(handleNestedStartingOnLine([fn(5, 5, 5)], single, fn(2, 2, 20))).toBe(5);
    });
    it('returns parent when nested starts on line', () => {
      const nested = [fn(5, 5, 15)];
      const parent = fn(2, 2, 20);
      expect(handleNestedStartingOnLine(nested, [], parent)).toBe(2);
    });
  });

  describe('handleAllNestedCases', () => {
    it('returns active nested when inside', () => {
      const sorted = [fn(2, 2, 20), fn(5, 5, 15)];
      const parent = fn(2, 2, 20);
      expect(handleAllNestedCases(sorted, parent, 10)).toBe(5);
    });
  });

  describe('handleFinalCases', () => {
    it('returns smallest of functions starting on line', () => {
      const valid = [fn(5, 5, 15), fn(5, 5, 10)];
      expect(handleFinalCases(valid, 5)).toBe(5);
    });
    it('returns smallest of valid when none start on line', () => {
      const valid = [fn(2, 1, 20), fn(5, 4, 10)];
      expect(handleFinalCases(valid, 6)).toBe(5);
    });
  });

  describe('getInnermostFunction', () => {
    it('throws when no functions contain line (reduce of empty validFunctions)', () => {
      const map = new Map();
      map.set(10, []);
      expect(() => getInnermostFunction(10, map)).toThrow();
    });
    it('returns single function line when one contains', () => {
      const map = new Map();
      map.set(10, [fn(2, 1, 20)]);
      expect(getInnermostFunction(10, map)).toBe(2);
    });
    it('returns innermost (smallest boundary) when multiple contain', () => {
      const map = new Map();
      map.set(10, [fn(2, 1, 20), fn(5, 4, 15), fn(8, 7, 12)]);
      expect(getInnermostFunction(10, map)).toBe(8);
    });
  });

  describe('getFunctionLineForControlStructure', () => {
    it('delegates to getInnermostFunction when not control structure', () => {
      const map = new Map();
      map.set(10, [fn(2, 1, 20)]);
      const getInnermost = (ln) => getInnermostFunction(ln, map);
      expect(
        getFunctionLineForControlStructure(false, 10, [fn(2, 1, 20)], new Map(), getInnermost)
      ).toBe(2);
    });
    it('uses control-structure logic when isControlStructure true', () => {
      const boundaries = new Map();
      boundaries.set(2, { start: 2, end: 20 });
      boundaries.set(5, { start: 5, end: 15 });
      const containing = [fn(2, 2, 20), fn(5, 5, 15)];
      const getInnermost = (ln) => getInnermostFunction(ln, new Map([[ln, containing]]));
      const result = getFunctionLineForControlStructure(true, 10, containing, boundaries, getInnermost);
      expect([2, 5]).toContain(result);
    });
  });
});

describe('decision-points/multi-line-conditions', () => {
  describe('isConditionStart', () => {
    it('returns true for if (', () => {
      expect(isConditionStart('  if (x)')).toBe(true);
      expect(isConditionStart('if (a && b)')).toBe(true);
    });
    it('returns true for else if (', () => {
      expect(isConditionStart('  else if (x)')).toBe(true);
    });
    it('returns true for while ( and for (', () => {
      expect(isConditionStart('  while (x)')).toBe(true);
      expect(isConditionStart('  for (let i=0; i<n; i++)')).toBe(true);
    });
    it('returns false for plain statements', () => {
      expect(isConditionStart('  return x;')).toBe(false);
      expect(isConditionStart('  const x = 1;')).toBe(false);
    });
  });

  describe('isBooleanAssignmentLine', () => {
    it('returns true for const x = a && b', () => {
      expect(isBooleanAssignmentLine('  const x = a && b')).toBe(true);
    });
    it('returns false for assignments without &&/||', () => {
      expect(isBooleanAssignmentLine('  const x = 1')).toBe(false);
    });
  });

  describe('isBooleanExpressionLine', () => {
    it('returns true for return with &&', () => {
      expect(isBooleanExpressionLine('  return a && b')).toBe(true);
    });
    it('returns true for assignment with &&', () => {
      expect(isBooleanExpressionLine('  const x = a || b')).toBe(true);
    });
    it('returns true for expression in parens', () => {
      expect(isBooleanExpressionLine('  foo(a && b)')).toBe(true);
    });
    it('returns false for simple assignment without &&/||', () => {
      expect(isBooleanExpressionLine('  const x = 1')).toBe(false);
    });
  });

  describe('shouldStopConditionLookback', () => {
    it('returns true for JSX-like line with &&', () => {
      expect(shouldStopConditionLookback('{ x && <Y /> }', true, false)).toBe(true);
    });
    it('returns true for boolean assignment', () => {
      expect(shouldStopConditionLookback('const x = a && b', true, true)).toBe(true);
    });
    it('returns true for closing brace without logical op', () => {
      expect(shouldStopConditionLookback('  }', false, false)).toBe(true);
    });
    it('returns false otherwise', () => {
      expect(shouldStopConditionLookback('  x && y', true, false)).toBe(false);
    });
  });

  describe('isContinuingMultiLineCondition', () => {
    it('returns false when current line has no logical op', () => {
      expect(isContinuingMultiLineCondition(3, ['if (', '  a', '  b', '  c'], false)).toBe(false);
    });
    it('returns true when previous line is condition start and current has &&', () => {
      const lines = ['if (', '  a && b'];
      expect(isContinuingMultiLineCondition(1, lines, true)).toBe(true);
    });
  });

  describe('shouldExcludeFromMultiLineConditions', () => {
    it('returns true when index 0', () => {
      expect(shouldExcludeFromMultiLineConditions(0, false, false, false, false, false, false)).toBe(true);
    });
    it('returns true when isIfStatement', () => {
      expect(shouldExcludeFromMultiLineConditions(5, true, false, false, false, false, false)).toBe(true);
    });
    it('returns false when none of exclude conditions', () => {
      expect(shouldExcludeFromMultiLineConditions(2, false, false, false, false, false, false)).toBe(false);
    });
  });

  describe('shouldProcessMultiLineCondition', () => {
    it('returns false when boolean assignment or expression', () => {
      expect(shouldProcessMultiLineCondition(true, false, false, true, false, false, false)).toBe(false);
      expect(shouldProcessMultiLineCondition(false, true, false, true, false, false, false)).toBe(false);
    });
    it('returns true when prev line condition and current has logical op', () => {
      expect(shouldProcessMultiLineCondition(false, false, true, true, false, false, false)).toBe(true);
    });
  });

  describe('processMultiLineConditionOperators', () => {
    it('pushes && and || decision points', () => {
      const decisionPoints = [];
      processMultiLineConditionOperators('  a && b || c', 5, 2, decisionPoints);
      expect(decisionPoints.length).toBe(2);
      expect(decisionPoints.some((dp) => dp.type === '&&')).toBe(true);
      expect(decisionPoints.some((dp) => dp.type === '||')).toBe(true);
      decisionPoints.forEach((dp) => {
        expect(dp.line).toBe(5);
        expect(dp.functionLine).toBe(2);
      });
    });
  });

  describe('parseMultiLineConditions', () => {
    it('does not process when excluded (e.g. index 0)', () => {
      const decisionPoints = [];
      parseMultiLineConditions('a && b', 1, 0, ['a && b'], 2, false, false, false, false, false, false, false, false, decisionPoints);
      expect(decisionPoints.length).toBe(0);
    });
    it('processes when continuing condition and not control flow', () => {
      const lines = ['if (', '  a && b'];
      const decisionPoints = [];
      parseMultiLineConditions('  a && b', 2, 1, lines, 2, false, false, false, false, false, false, false, false, decisionPoints);
      expect(decisionPoints.length).toBeGreaterThan(0);
    });
  });
});

describe('decision-points/operators', () => {
  describe('detectJSXExpressions', () => {
    it('returns isJSXExpression when line has { and &&', () => {
      const r = detectJSXExpressions('{ x && <Y /> }', 0, ['{ x && <Y /> }'], false, false, false, false);
      expect(r.isJSXExpression).toBe(true);
    });
    it('returns isJSXExpression false when no { or no &&', () => {
      const r = detectJSXExpressions('return x;', 0, ['return x;'], false, false, false, false);
      expect(r.isJSXExpression).toBe(false);
    });
  });

  describe('checkJSXContinuation', () => {
    it('returns false when index 0', () => {
      expect(checkJSXContinuation('  }', 0, ['{ x &&', '  }'], true, false, false, false)).toBe(false);
    });
    it('returns false when isIfStatement', () => {
      expect(checkJSXContinuation('  }', 1, ['if (x)', '  }'], true, true, false, false)).toBe(false);
    });
    it('returns true when prev has {, current has &&, current no {', () => {
      const lines = ['{ x', '  && y'];
      expect(checkJSXContinuation('  && y', 1, lines, true, false, false, false)).toBe(true);
    });
  });

  describe('findBooleanExpressionFunctionLine', () => {
    it('returns functionLine when no callbacks on line', () => {
      const boundaries = new Map();
      boundaries.set(2, { start: 2, end: 10 });
      expect(findBooleanExpressionFunctionLine('return a && b', 5, 8, 2, boundaries)).toBe(2);
    });
    it('returns functionLine when callbacks on line but operator before =>', () => {
      const boundaries = new Map();
      boundaries.set(2, { start: 2, end: 10 });
      boundaries.set(5, { start: 5, end: 10 });
      expect(findBooleanExpressionFunctionLine('x && y => z', 5, 2, 5, boundaries)).toBe(2);
    });
  });

  describe('processBooleanExpressionOperators', () => {
    it('pushes decision points for && and ||', () => {
      const decisionPoints = [];
      const boundaries = new Map();
      boundaries.set(2, { start: 2, end: 10 });
      const noString = () => false;
      processBooleanExpressionOperators('return a && b', 'return a && b', 3, 2, boundaries, noString, '&&', 'logical AND', decisionPoints);
      expect(decisionPoints.length).toBe(1);
      expect(decisionPoints[0].type).toBe('&&');
      expect(decisionPoints[0].functionLine).toBe(2);
    });
  });

  describe('hasBooleanAssignmentPattern', () => {
    it('returns true for const x = a && b', () => {
      expect(hasBooleanAssignmentPattern('  const x = a && b')).toBe(true);
    });
    it('returns false for const x = 1', () => {
      expect(hasBooleanAssignmentPattern('  const x = 1')).toBe(false);
    });
  });

  describe('hasBooleanExpressionInParens', () => {
    it('returns true for (a && b)', () => {
      expect(hasBooleanExpressionInParens('foo(a && b)')).toBe(true);
    });
    it('returns false when no &&/|| in parens', () => {
      expect(hasBooleanExpressionInParens('foo(1)')).toBe(false);
    });
  });

  describe('isLogicalOperatorInNonControlFlow', () => {
    it('returns true when hasLogicalOperator and not control flow', () => {
      expect(isLogicalOperatorInNonControlFlow(true, false, false, false, false, false, false)).toBe(true);
    });
    it('returns false when isIfStatement', () => {
      expect(isLogicalOperatorInNonControlFlow(true, true, false, false, false, false, false)).toBe(false);
    });
  });

  describe('detectBooleanExpressionType', () => {
    it('returns true for return statement', () => {
      expect(detectBooleanExpressionType('  return x', true, false, false, false, false, false, false, false, false, false)).toBe(true);
    });
    it('returns true for boolean assignment pattern', () => {
      expect(detectBooleanExpressionType('  const x = a && b', false, true, false, false, false, false, false, false, false, false)).toBe(true);
    });
  });

  describe('detectBooleanExpression', () => {
    it('delegates to detectBooleanExpressionType', () => {
      expect(detectBooleanExpression('  return a && b', true, false, false, true, false, false, false, false, false, false)).toBe(true);
    });
  });

  describe('shouldExcludeFromBooleanExpressions', () => {
    it('returns true when !isBooleanExpression', () => {
      expect(shouldExcludeFromBooleanExpressions(false, false, false, false, false, false, false, false)).toBe(true);
    });
    it('returns true when hasTernaries', () => {
      expect(shouldExcludeFromBooleanExpressions(true, false, false, false, false, false, false, true)).toBe(true);
    });
    it('returns false when boolean expr and no exclude flags', () => {
      expect(shouldExcludeFromBooleanExpressions(true, false, false, false, false, false, false, false)).toBe(false);
    });
  });

  describe('parseBooleanExpressions', () => {
    it('pushes && and || decision points for return a && b', () => {
      const decisionPoints = [];
      const boundaries = new Map();
      boundaries.set(2, { start: 2, end: 10 });
      const noString = () => false;
      const noTernary = () => false;
      parseBooleanExpressions('return a && b', 'return a && b', 3, 2, boundaries, noString, noTernary, false, false, false, false, false, false, false, false, decisionPoints);
      expect(decisionPoints.length).toBe(1);
      expect(decisionPoints[0].type).toBe('&&');
    });
    it('skips when hasTernaries', () => {
      const decisionPoints = [];
      const boundaries = new Map();
      boundaries.set(2, { start: 2, end: 10 });
      const noString = () => false;
      const hasTernary = () => true;
      parseBooleanExpressions('x ? a && b : c', 'x ? a && b : c', 3, 2, boundaries, noString, hasTernary, false, false, false, false, false, false, false, false, decisionPoints);
      expect(decisionPoints.length).toBe(0);
    });
  });
});
