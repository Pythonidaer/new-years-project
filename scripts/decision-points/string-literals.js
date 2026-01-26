/**
 * Stub for string literal / comment detection.
 * Used by operators.js and default-parameters.js. Minimal implementations
 * so modules can load; tests avoid operators inside comments/strings.
 */

export function isInsideComment(_line, _index) {
  return false;
}

export function isOperatorInStringLiteral(_line, _index) {
  return false;
}

export function handleEscapeSequence(_ch, _state) {}
export function handleTemplateExpressionStart(_ch, _state) {}
export function trackTemplateExpressionBraces(_ch, _state) {}
export function updateQuoteStates(_ch, _state) {}
