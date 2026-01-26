/**
 * Decision point parsing (refactored into modules)
 * 
 * This file re-exports from the modular structure in decision-points/
 * for backward compatibility.
 * 
 * The actual implementation has been split into focused modules:
 * - decision-points/assignment.js - Function assignment logic
 * - decision-points/string-literals.js - String literal detection
 * - decision-points/default-parameters.js - Default parameter parsing
 * - decision-points/control-flow.js - Control flow statements
 * - decision-points/ternaries.js - Ternary operator parsing
 * - decision-points/operators.js - Logical operators in boolean expressions
 * - decision-points/multi-line-conditions.js - Multi-line condition handling
 * - decision-points/index.js - Main orchestration
 */

export { parseDecisionPoints } from './decision-points/index.js';
