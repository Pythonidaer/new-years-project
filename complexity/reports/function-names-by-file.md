# Functions by Folder/File

**Total folders:** 31
**Total functions:** 798
**Generated:** 2026-01-27T22:48:59.355Z

## Structure

### scripts/

#### `analyze-ast-mismatches.js`

- `analyzeASTMismatches` (CC: 3, line 20)
- `analyzeASTMismatches (forEach callback)` (CC: 4, line 60)
- `analyzeASTMismatches (forEach callback)` (CC: 2, line 31)
- `analyzeASTMismatches (forEach callback) (map callback)` (CC: 1, line 84)
- `analyzeASTMismatches (slice callback)` (CC: 4, line 105)
- `analyzeASTMismatches (sort callback)` (CC: 1, line 98)
- `catch callback` (CC: 1, line 131)
- `log callback` (CC: 1, line 110)

#### `complexity-breakdown.js`

- `calculateComplexityBreakdown` (CC: 2, line 8)
- `calculateComplexityBreakdown (filter callback)` (CC: 1, line 9)
- `calculateComplexityBreakdown (forEach callback)` (CC: 2, line 31)
- `calculateComplexityBreakdown (values callback)` (CC: 1, line 37)
- `formatComplexityBreakdown` (CC: 2, line 52)
- `formatComplexityBreakdown (forEach callback)` (CC: 2, line 63)
- `formatComplexityBreakdownInline` (CC: 2, line 79)
- `formatComplexityBreakdownInline (forEach callback)` (CC: 9, line 91)
- `formatComplexityBreakdownStyled` (CC: 2, line 111)
- `formatComplexityBreakdownStyled (forEach callback)` (CC: 9, line 123)
- `formatComplexityConcise` (CC: 1, line 143)

#### `debug-ast-matching.js`

- `createFunctionInfo` (CC: 5, line 60)
- `findAllFunctions` (CC: 1, line 69)
- `isFunctionType` (CC: 3, line 25)
- `processArrayChildrenForFunctions` (CC: 1, line 36)
- `processArrayChildrenForFunctions (forEach callback)` (CC: 4, line 37)
- `processChildNodeForFunctions` (CC: 4, line 49)
- `traverse` (CC: 9, line 72)
- `traverse (filter callback)` (CC: 3, line 108)
- `traverse (filter callback)` (CC: 2, line 95)
- `traverse (forEach callback)` (CC: 1, line 98)
- `traverse (forEach callback)` (CC: 1, line 113)

#### `decision-points-ast.js`

- `buildParentMap` (CC: 1, line 166)
- `checkArrayPatternElements` (CC: 1, line 386)
- `checkArrayPatternElements (some callback)` (CC: 5, line 387)
- `checkInFunctionBodyDestructuring` (CC: 9, line 333)
- `checkInFunctionParams` (CC: 7, line 247)
- `checkInTopLevelDestructuring` (CC: 8, line 299)
- `checkNestedPattern` (CC: 9, line 436)
- `checkObjectPatternProperties` (CC: 1, line 402)
- `checkObjectPatternProperties (some callback)` (CC: 8, line 403)
- `checkRestElement` (CC: 6, line 421)
- `collectNodesByType` (CC: 7, line 76)
- `doNodeTypesMatch` (CC: 6, line 584)
- `findAllFunctions` (CC: 1, line 100)
- `findAllFunctions (forEach callback)` (CC: 1, line 111)
- `findArrowFunctionLine` (CC: 4, line 547)
- `findFunctionForDecisionPoint` (CC: 4, line 716)
- `findInnermostASTFunction` (CC: 7, line 687)
- `getControlFlowDecisionType` (CC: 9, line 463)
- `getDecisionPointType` (CC: 8, line 517)
- `getExpressionDecisionType` (CC: 7, line 494)
- `getLogicalExpressionType` (CC: 4, line 481)
- `getMatchLineForASTFunction` (CC: 3, line 567)
- `getNodeLine` (CC: 5, line 123)
- `isESLintLineInASTRange` (CC: 3, line 619)
- `isFunctionType` (CC: 3, line 197)
- `isInFunctionParameters` (CC: 2, line 370)
- `isNodeInFunctionParams` (CC: 6, line 209)
- `isPatternContainer` (CC: 4, line 234)
- `isVariableDeclarationInFunctionBody` (CC: 6, line 280)
- `matchByNodeType` (CC: 5, line 597)
- `matchFunctionsToAST` (CC: 1, line 654)
- `matchFunctionsToAST (forEach callback)` (CC: 3, line 667)
- `matchFunctionsToAST (forEach callback)` (CC: 2, line 659)
- `parseAST` (CC: 3, line 16)
- `parseDecisionPointsAST` (CC: 4, line 736)
- `parseDecisionPointsAST (forEach callback)` (CC: 3, line 784)
- `parseDecisionPointsAST (forEach callback)` (CC: 1, line 778)
- `processArrayChildren` (CC: 1, line 50)
- `processArrayChildren (forEach callback)` (CC: 4, line 51)
- `processArrayChildrenForParentMap` (CC: 1, line 141)
- `processArrayChildrenForParentMap (forEach callback)` (CC: 4, line 142)
- `processChildNode` (CC: 4, line 64)
- `processChildNodeForParentMap` (CC: 4, line 155)
- `shouldSkipKey` (CC: 5, line 39)
- `traverse` (CC: 8, line 169)
- `tryMatchByRange` (CC: 4, line 635)

#### `eslint-integration.js`

- `runESLintComplexityCheck` (CC: 4, line 10)

#### `function-boundaries.js`

- `calculateFunctionBodyBraceCount` (CC: 6, line 531)
- `calculateInitialParenDepth` (CC: 3, line 256)
- `checkCallbackPatterns` (CC: 3, line 605)
- `checkFunctionEnd` (CC: 8, line 905)
- `checkFunctionEnd (some callback)` (CC: 1, line 912)
- `checkJSXReturnClosingPattern` (CC: 6, line 40)
- `couldBeRegexEnd` (CC: 4, line 866)
- `couldBeRegexStart` (CC: 5, line 855)
- `createBracesResult` (CC: 1, line 940)
- `endsOnSameLine` (CC: 3, line 245)
- `findArrowFunctionEnd` (CC: 7, line 474)
- `findArrowFunctionEndJSXAttribute` (CC: 7, line 210)
- `findArrowFunctionEndJSXReturn` (CC: 3, line 102)
- `findArrowFunctionEndObjectLiteral` (CC: 3, line 183)
- `findArrowFunctionEndSingleExpression` (CC: 2, line 304)
- `findArrowFunctionStart` (CC: 4, line 7)
- `findDependencyArrayEnd` (CC: 3, line 571)
- `findFunctionBoundaries` (CC: 1, line 1322)
- `findFunctionBoundaries (forEach callback)` (CC: 9, line 1326)
- `findFunctionEndFallback` (CC: 2, line 1265)
- `findNamedFunctionEnd` (CC: 9, line 1160)
- `findNamedFunctionStart` (CC: 6, line 1284)
- `findObjectLiteralClosingParen` (CC: 7, line 153)
- `findSetTimeoutCallbackEnd` (CC: 5, line 588)
- `handleArrowFunctionWithoutBraces` (CC: 3, line 557)
- `handleBraceOnSameLine` (CC: 5, line 358)
- `handleComments` (CC: 6, line 791)
- `handleEscapeSequence` (CC: 4, line 734)
- `handleFunctionBodyEnd` (CC: 3, line 656)
- `handleFunctionBodyStart` (CC: 5, line 628)
- `handleJSXReturnPattern` (CC: 2, line 334)
- `handleNoBraceOnSameLine` (CC: 5, line 414)
- `handleRegexDetection` (CC: 4, line 881)
- `handleStringLiterals` (CC: 6, line 823)
- `hasFunctionBodyPattern` (CC: 1, line 1221)
- `isFunctionDeclarationPattern` (CC: 4, line 519)
- `isMultiLineCommentEnd` (CC: 3, line 777)
- `isMultiLineCommentStart` (CC: 5, line 766)
- `isObjectLiteralPattern` (CC: 5, line 134)
- `isRegexStart` (CC: 6, line 841)
- `isSingleLineCommentStart` (CC: 5, line 753)
- `processCharacterForBraces` (CC: 9, line 1057)
- `processCommentHandling` (CC: 3, line 986)
- `processEscapeSequence` (CC: 2, line 961)
- `processLineBeforeFunctionBody` (CC: 3, line 694)
- `processLineInFunctionBody` (CC: 8, line 1107)
- `processStringLiteralHandling` (CC: 3, line 1029)
- `scanForFunctionEndWithBraces` (CC: 7, line 1232)
- `scanForJSXReturnClosingParens` (CC: 9, line 67)
- `scanForSingleExpressionEnd` (CC: 7, line 269)
- `trackTypeBraces` (CC: 4, line 677)

#### `function-extraction.js`

- `checkNamedArrowFunction` (CC: 3, line 78)
- `extractFunctionName` (CC: 5, line 274)
- `extractFunctionsFromESLintResults` (CC: 1, line 300)
- `extractFunctionsFromESLintResults (forEach callback)` (CC: 2, line 304)
- `extractFunctionsFromESLintResults (forEach callback) (forEach callback)` (CC: 7, line 306)
- `extractFunctionsFromESLintResults (sort callback)` (CC: 1, line 342)
- `findCallbackWithFallbackPatterns` (CC: 4, line 134)
- `findFunctionCallCallback` (CC: 3, line 114)
- `findMethodCallCallback` (CC: 3, line 94)
- `findParentFunction` (CC: 10, line 20)
- `findParentFunctionWithFallback` (CC: 2, line 50)
- `formatCallbackName` (CC: 4, line 65)
- `getBaseFunctionName` (CC: 4, line 378)
- `getComplexityLevel` (CC: 5, line 352)
- `getDirectory` (CC: 2, line 366)
- `handleArrowFunctionExpression` (CC: 6, line 202)
- `handleArrowFunctionFinalFallback` (CC: 4, line 161)
- `handleFunctionDeclaration` (CC: 5, line 236)
- `tryFindCallbackFromCurrentLine` (CC: 3, line 178)

#### `function-hierarchy.js`

- `buildFunctionHierarchy` (CC: 1, line 22)
- `buildFunctionHierarchy (forEach callback)` (CC: 4, line 35)
- `buildFunctionHierarchy (forEach callback)` (CC: 1, line 25)
- `buildFunctionHierarchy (forEach callback) (forEach callback)` (CC: 6, line 43)
- `buildFunctionLine` (CC: 7, line 175)
- `checkCleanupCallback` (CC: 6, line 306)
- `checkEventHandlerFromContext` (CC: 5, line 400)
- `checkEventHandlerFromName` (CC: 2, line 374)
- `checkJSXInlineCallback` (CC: 2, line 387)
- `checkRequestAnimationFrameCallback` (CC: 3, line 349)
- `checkSetTimeoutCallback` (CC: 3, line 362)
- `checkUseEffectCallback` (CC: 5, line 331)
- `detectCallbackType` (CC: 8, line 103)
- `extractCallbackLabel` (CC: 10, line 440)
- `findImmediateParentFunction` (CC: 4, line 476)
- `findImmediateParentFunction (filter callback)` (CC: 3, line 483)
- `findImmediateParentFunction (find callback)` (CC: 1, line 495)
- `findImmediateParentFunction (sort callback)` (CC: 1, line 488)
- `findMaxComplexityInSubtree` (CC: 1, line 88)
- `findMaxComplexityInSubtree (forEach callback)` (CC: 2, line 90)
- `fixFunctionNameForCallback` (CC: 9, line 505)
- `formatComplexityDisplay` (CC: 4, line 138)
- `formatFunctionHierarchy` (CC: 6, line 617)
- `formatFunctionHierarchy (flatMap callback)` (CC: 2, line 631)
- `formatFunctionHierarchy (flatMap callback) (filter callback)` (CC: 1, line 635)
- `formatFunctionHierarchy (forEach callback)` (CC: 3, line 642)
- `formatFunctionHierarchy (forEach callback)` (CC: 2, line 681)
- `formatFunctionHierarchy (from callback)` (CC: 3, line 658)
- `formatFunctionHierarchy (from callback)` (CC: 1, line 676)
- `formatFunctionNode` (CC: 10, line 239)
- `generateFunctionRowHTML` (CC: 2, line 582)
- `generateFunctionRowHTML (map callback)` (CC: 4, line 584)
- `getContextAroundLine` (CC: 2, line 290)
- `getDefaultCallbackLabel` (CC: 7, line 416)
- `getDefaultColumnStructure` (CC: 1, line 533)
- `isHighestComplexityInGroup` (CC: 2, line 155)
- `processChildren` (CC: 4, line 212)
- `processChildren (map callback)` (CC: 1, line 220)
- `processChildren (map callback)` (CC: 1, line 223)
- `setEscapeHtml` (CC: 1, line 12)
- `sortChildren` (CC: 1, line 73)
- `sortChildren (sort callback)` (CC: 1, line 74)

#### `generate-complexity-report.js`

- `calculateDecisionPointTotals` (CC: 4, line 24)
- `calculateDecisionPointTotals (forEach callback)` (CC: 2, line 38)
- `calculateDecisionPointTotals (forEach callback)` (CC: 1, line 59)
- `calculateDecisionPointTotals (forEach callback) (forEach callback)` (CC: 2, line 63)
- `calculateDecisionPointTotals (forEach callback) (forEach callback)` (CC: 2, line 67)
- `calculateDecisionPointTotals (forEach callback) (forEach callback)` (CC: 2, line 71)
- `catch callback` (CC: 1, line 362)
- `main` (CC: 16, line 89)
- `main (filter callback)` (CC: 1, line 110)
- `main (filter callback)` (CC: 1, line 116)
- `main (forEach callback)` (CC: 2, line 123)
- `main (forEach callback)` (CC: 2, line 148)
- `main (forEach callback)` (CC: 1, line 337)
- `main (from callback)` (CC: 4, line 282)
- `main (from callback)` (CC: 2, line 132)
- `main (from callback) (filter callback)` (CC: 1, line 134)
- `main (from callback) (sort callback)` (CC: 1, line 142)
- `main (map callback)` (CC: 3, line 242)
- `main (max callback)` (CC: 1, line 112)
- `main (round callback)` (CC: 1, line 113)
- `main (sort callback)` (CC: 1, line 107)
- `main (sort callback)` (CC: 1, line 144)

#### `get-complexity-threshold.js`

- `getComplexityThreshold` (CC: 5, line 10)
- `getComplexityThreshold (filter callback)` (CC: 1, line 30)
- `getComplexityThreshold (map callback)` (CC: 2, line 27)

### scripts/decision-points/

#### `assignment.js`

- `findActiveNestedFunctions` (CC: 1, line 90)
- `findActiveNestedFunctions (filter callback)` (CC: 3, line 91)
- `findFunctionsStartingOnLine` (CC: 1, line 104)
- `findFunctionsStartingOnLine (filter callback)` (CC: 1, line 105)
- `findImmediateParent` (CC: 2, line 27)
- `findImmediateParent (filter callback)` (CC: 2, line 29)
- `findImmediateParent (sort callback)` (CC: 2, line 30)
- `findNestedEndedBefore` (CC: 1, line 167)
- `findNestedEndedBefore (filter callback)` (CC: 1, line 168)
- `findNestedEndingOnLine` (CC: 1, line 157)
- `findNestedEndingOnLine (filter callback)` (CC: 1, line 158)
- `findNestedFunctionsEndingOnOrBefore` (CC: 1, line 47)
- `findNestedFunctionsEndingOnOrBefore (filter callback)` (CC: 3, line 48)
- `findNestedFunctionsStartingOnLine` (CC: 1, line 62)
- `findNestedFunctionsStartingOnLine (filter callback)` (CC: 2, line 63)
- `findSingleLineNestedFunctions` (CC: 1, line 133)
- `findSingleLineNestedFunctions (filter callback)` (CC: 2, line 134)
- `findSmallestBoundaryFunction` (CC: 1, line 113)
- `findSmallestBoundaryFunction (reduce callback)` (CC: 4, line 114)
- `getFunctionLineForControlStructure` (CC: 8, line 321)
- `getFunctionLineForControlStructure (filter callback)` (CC: 2, line 328)
- `getFunctionLineForControlStructure (filter callback)` (CC: 2, line 340)
- `getFunctionLineForControlStructure (filter callback)` (CC: 2, line 353)
- `getFunctionLineForControlStructure (filter callback)` (CC: 2, line 368)
- `getFunctionLineForControlStructure (filter callback)` (CC: 1, line 346)
- `getFunctionLineForControlStructure (filter callback)` (CC: 1, line 372)
- `getFunctionLineForControlStructure (filter callback) (some callback)` (CC: 1, line 347)
- `getFunctionLineForControlStructure (reduce callback)` (CC: 2, line 375)
- `getFunctionLineForControlStructure (sort callback)` (CC: 1, line 337)
- `getFunctionLineForControlStructure (sort callback)` (CC: 1, line 354)
- `getInnermostFunction` (CC: 6, line 286)
- `getInnermostFunction (sort callback)` (CC: 1, line 293)
- `getValidFunctions` (CC: 1, line 15)
- `getValidFunctions (filter callback)` (CC: 2, line 16)
- `handleActiveNestedFunctions` (CC: 2, line 210)
- `handleAllNestedCases` (CC: 2, line 253)
- `handleFinalCases` (CC: 2, line 269)
- `handleNestedFunctionsEnding` (CC: 6, line 179)
- `handleNestedStartingOnLine` (CC: 3, line 239)
- `handleSimpleCases` (CC: 5, line 224)
- `handleSingleLineNestedOnLine` (CC: 2, line 144)
- `isInsideActiveNestedFunction` (CC: 1, line 75)
- `isInsideActiveNestedFunction (some callback)` (CC: 3, line 76)

#### `default-parameters.js`

- `applyFallback1FunctionDeclaration` (CC: 5, line 74)
- `applyFallback2ArrowOnLaterLine` (CC: 5, line 95)
- `applyFallback3OpeningParen` (CC: 7, line 119)
- `applyParameterListEndFallbacks` (CC: 4, line 144)
- `checkJSXAttribute` (CC: 8, line 566)
- `detectMultiLineArrowParameter` (CC: 5, line 176)
- `extractArrowFunctionParamBoundaries` (CC: 3, line 701)
- `extractParamListFromVariableAssignment` (CC: 7, line 190)
- `findArrowOnSubsequentLines` (CC: 4, line 54)
- `findCallbackFunctionLine` (CC: 2, line 20)
- `findCallbackFunctionLine (filter callback)` (CC: 1, line 25)
- `findCallbackFunctionLine (reduce callback)` (CC: 4, line 28)
- `findDestructuredParamBoundaries` (CC: 5, line 682)
- `findParamBoundariesWithParens` (CC: 5, line 662)
- `findParameterListEnd` (CC: 5, line 410)
- `handleArrowFunctionDefaultParams` (CC: 8, line 767)
- `handleArrowFunctionDetection` (CC: 6, line 265)
- `handleClosingParen` (CC: 2, line 304)
- `handleFunctionBodyOnSameLine` (CC: 6, line 385)
- `handleOpeningBrace` (CC: 7, line 322)
- `handleOpeningParen` (CC: 1, line 291)
- `hasExclusionCondition` (CC: 9, line 620)
- `hasFunctionSignature` (CC: 7, line 449)
- `hasJSXInPreviousLines` (CC: 6, line 475)
- `hasJSXOnCurrentLine` (CC: 4, line 463)
- `isArrowFunctionAssignment` (CC: 2, line 540)
- `isConstLetVarAssignment` (CC: 2, line 530)
- `isDependencyArray` (CC: 4, line 831)
- `isDependencyArrayPattern` (CC: 1, line 600)
- `isInDestructuredAssignment` (CC: 9, line 973)
- `isJSXAttributeLine` (CC: 4, line 504)
- `isMethodCall` (CC: 2, line 582)
- `isPropertyAssignment` (CC: 1, line 591)
- `isRegularAssignment` (CC: 4, line 550)
- `isReturnStatement` (CC: 1, line 609)
- `isTypeDefinition` (CC: 1, line 521)
- `isValidArrowFunctionDefaultParameterContext` (CC: 9, line 724)
- `isValidDefaultParameterContext` (CC: 3, line 639)
- `matchArrowFunctionDefaultParams` (CC: 5, line 221)
- `matchDefaultParameters` (CC: 3, line 243)
- `parseDefaultParameters` (CC: 6, line 915)
- `parseDestructuredAssignments` (CC: 9, line 1018)
- `parseDestructuredAssignments (forEach callback)` (CC: 1, line 1044)
- `processArrowFunctionDefaultParams` (CC: 4, line 746)
- `processDefaultParameterMatches` (CC: 1, line 650)
- `processDefaultParameterMatches (forEach callback)` (CC: 1, line 651)
- `processDefaultParameterMatchesByContext` (CC: 6, line 814)
- `processNonArrowDefaultParameters` (CC: 9, line 875)
- `shouldCheckForDefaultParameters` (CC: 5, line 794)
- `shouldProcessDefaultParameters` (CC: 3, line 852)
- `trackParameterListBoundaries` (CC: 10, line 343)

#### `multi-line-conditions.js`

- `isBooleanAssignmentLine` (CC: 1, line 26)
- `isBooleanExpressionLine` (CC: 5, line 35)
- `isConditionStart` (CC: 4, line 14)
- `isContinuingMultiLineCondition` (CC: 7, line 76)
- `parseMultiLineConditions` (CC: 7, line 169)
- `processMultiLineConditionOperators` (CC: 3, line 145)
- `processMultiLineConditionOperators (forEach callback)` (CC: 1, line 148)
- `processMultiLineConditionOperators (forEach callback)` (CC: 1, line 149)
- `shouldExcludeFromMultiLineConditions` (CC: 7, line 112)
- `shouldProcessMultiLineCondition` (CC: 9, line 127)
- `shouldStopConditionLookback` (CC: 6, line 49)

#### `operators.js`

- `checkJSXContinuation` (CC: 8, line 62)
- `detectBooleanExpression` (CC: 1, line 237)
- `detectBooleanExpressionType` (CC: 6, line 213)
- `detectJSXExpressions` (CC: 4, line 28)
- `findBooleanExpressionFunctionLine` (CC: 6, line 81)
- `findBooleanExpressionFunctionLine (filter callback)` (CC: 3, line 100)
- `findBooleanExpressionFunctionLine (filter callback)` (CC: 1, line 83)
- `findBooleanExpressionFunctionLine (filter callback) (some callback)` (CC: 1, line 102)
- `findBooleanExpressionFunctionLine (sort callback)` (CC: 1, line 107)
- `hasBooleanAssignmentPattern` (CC: 1, line 170)
- `hasBooleanExpressionInParens` (CC: 1, line 179)
- `isLogicalOperatorInNonControlFlow` (CC: 7, line 194)
- `parseBooleanExpressions` (CC: 8, line 297)
- `processBooleanExpressionOperators` (CC: 5, line 131)
- `shouldExcludeFromBooleanExpressions` (CC: 8, line 265)

#### `string-literals.js`

- `handleEscapeSequence` (CC: 1, line 15)
- `handleTemplateExpressionStart` (CC: 1, line 16)
- `isInsideComment` (CC: 1, line 7)
- `isOperatorInStringLiteral` (CC: 1, line 11)
- `trackTemplateExpressionBraces` (CC: 1, line 17)
- `updateQuoteStates` (CC: 1, line 18)

#### `ternaries.js`

- `detectMultiLineTernaries` (CC: 1, line 6)

### scripts/export-generators/

#### `helpers.js`

- `buildHierarchicalFunctionName` (CC: 17, line 78)
- `findImmediateParentFunction` (CC: 4, line 32)
- `findImmediateParentFunction (filter callback)` (CC: 4, line 40)
- `findImmediateParentFunction (filter callback) (find callback)` (CC: 1, line 43)
- `findImmediateParentFunction (find callback)` (CC: 1, line 66)
- `findImmediateParentFunction (sort callback)` (CC: 2, line 55)
- `getTopLevelFunctions` (CC: 17, line 153)
- `groupFunctionsByFolder` (CC: 4, line 251)
- `hasCallbackSuffix` (CC: 2, line 9)
- `hasCallbackSuffix (some callback)` (CC: 1, line 22)

#### `index.js`

- `generateAllExports` (CC: 5, line 27)
- `generateAllExports (forEach callback)` (CC: 2, line 43)

#### `json-exports.js`

- `generateAllFunctionsJSON` (CC: 1, line 53)
- `generateAllFunctionsJSON (map callback)` (CC: 3, line 55)
- `generateAllFunctionsJSON (map callback)` (CC: 2, line 77)
- `generateAllFunctionsJSON (sort callback)` (CC: 3, line 65)
- `generateFunctionsByFolderJSON` (CC: 5, line 97)
- `generateFunctionsByFolderJSON (from callback)` (CC: 1, line 104)
- `generateFunctionsByFolderJSON (from callback)` (CC: 1, line 112)
- `generateFunctionsByFolderJSON (map callback)` (CC: 2, line 131)
- `generateFunctionsByFolderJSON (map callback)` (CC: 1, line 122)
- `generateFunctionsByFolderJSON (sort callback)` (CC: 3, line 125)
- `generateTopLevelFunctionsJSON` (CC: 3, line 11)
- `generateTopLevelFunctionsJSON (map callback)` (CC: 2, line 34)
- `generateTopLevelFunctionsJSON (sort callback)` (CC: 3, line 22)

#### `md-exports.js`

- `generateAllFunctionsMD` (CC: 1, line 53)
- `generateAllFunctionsMD (map callback)` (CC: 3, line 55)
- `generateAllFunctionsMD (map callback)` (CC: 1, line 79)
- `generateAllFunctionsMD (sort callback)` (CC: 3, line 65)
- `generateFunctionsByFolderMD` (CC: 7, line 96)
- `generateFunctionsByFolderMD (from callback)` (CC: 1, line 111)
- `generateFunctionsByFolderMD (from callback)` (CC: 1, line 121)
- `generateFunctionsByFolderMD (map callback)` (CC: 1, line 135)
- `generateFunctionsByFolderMD (sort callback)` (CC: 3, line 138)
- `generateTopLevelFunctionsMD` (CC: 3, line 11)
- `generateTopLevelFunctionsMD (map callback)` (CC: 2, line 36)
- `generateTopLevelFunctionsMD (sort callback)` (CC: 3, line 22)

#### `txt-exports.js`

- `generateAllFunctionsTXT` (CC: 1, line 48)
- `generateAllFunctionsTXT (map callback)` (CC: 3, line 50)
- `generateAllFunctionsTXT (map callback)` (CC: 1, line 73)
- `generateAllFunctionsTXT (sort callback)` (CC: 3, line 60)
- `generateFunctionsByFolderTXT` (CC: 6, line 86)
- `generateFunctionsByFolderTXT (from callback)` (CC: 1, line 100)
- `generateFunctionsByFolderTXT (from callback)` (CC: 1, line 109)
- `generateFunctionsByFolderTXT (map callback)` (CC: 1, line 122)
- `generateFunctionsByFolderTXT (sort callback)` (CC: 3, line 125)
- `generateTopLevelFunctionsTXT` (CC: 3, line 11)
- `generateTopLevelFunctionsTXT (map callback)` (CC: 2, line 35)
- `generateTopLevelFunctionsTXT (sort callback)` (CC: 3, line 22)

### scripts/html-generators/

#### `about.js`

- `generateAboutPageHTML` (CC: 1, line 6)

#### `file-css.js`

- `generateFilePageCSS` (CC: 1, line 6)

#### `file-javascript.js`

- `generateJavaScriptCode` (CC: 1, line 9)
- `generateJavaScriptCode (map callback)` (CC: 1, line 15)

#### `file.js`

- `buildBoundaryLineSets` (CC: 1, line 346)
- `buildBoundaryLineSets (forEach callback)` (CC: 3, line 351)
- `buildCodeLineHTML` (CC: 10, line 465)
- `buildLineToSpan` (CC: 4, line 374)
- `buildLineToSpan (filter callback)` (CC: 2, line 378)
- `buildLineToSpan (reduce callback)` (CC: 2, line 380)
- `buildLineToSpan (values callback)` (CC: 1, line 376)
- `buildVisibleColumns` (CC: 2, line 749)
- `buildVisibleColumns` (CC: 1, line 748)
- `buildVisibleColumns (filter callback)` (CC: 1, line 752)
- `buildVisibleColumns (reduce callback)` (CC: 1, line 763)
- `calculateDecisionPointTotalsFromBreakdowns` (CC: 1, line 239)
- `calculateDecisionPointTotalsFromBreakdowns (forEach callback)` (CC: 2, line 251)
- `calculateDecisionPointTotalsFromBreakdowns (forEach callback) (forEach callback)` (CC: 2, line 254)
- `calculateDecisionPointTotalsFromBreakdowns (forEach callback) (forEach callback)` (CC: 2, line 258)
- `calculateDecisionPointTotalsFromBreakdowns (forEach callback) (forEach callback)` (CC: 2, line 262)
- `calculateFileStatistics` (CC: 8, line 329)
- `calculateFileStatistics (filter callback)` (CC: 1, line 331)
- `calculateFileStatistics (max callback)` (CC: 1, line 332)
- `calculateFileStatistics (round callback)` (CC: 1, line 333)
- `calculateFunctionBreakdowns` (CC: 1, line 214)
- `calculateFunctionBreakdowns (forEach callback)` (CC: 1, line 217)
- `detectEmptyColumns` (CC: 1, line 58)
- `detectEmptyColumns (flatMap callback)` (CC: 1, line 62)
- `detectEmptyColumns (flatMap callback) (map callback)` (CC: 1, line 63)
- `detectEmptyColumns (forEach callback)` (CC: 2, line 67)
- `detectEmptyColumns (forEach callback) (forEach callback)` (CC: 5, line 70)
- `detectLanguage` (CC: 3, line 11)
- `determineLineClasses` (CC: 10, line 428)
- `determineLineClasses (map callback)` (CC: 1, line 431)
- `findBoundaryForFunction` (CC: 7, line 139)
- `findBreakdownLine` (CC: 1, line 164)
- `formatPercentage` (CC: 3, line 286)
- `generateBreakdownSectionHTML` (CC: 5, line 562)
- `generateBreakdownSectionHTML (map callback)` (CC: 2, line 567)
- `generateBreakdownSectionHTML (map callback)` (CC: 1, line 572)
- `generateBreakdownSectionHTML (map callback)` (CC: 1, line 573)
- `generateComplexityAnnotation` (CC: 2, line 397)
- `generateFileHTML` (CC: 11, line 677)
- `generateFileHTML (forEach callback)` (CC: 2, line 715)
- `generateFileHTML (forEach callback)` (CC: 1, line 697)
- `generateFileHTML (map callback)` (CC: 1, line 794)
- `generateLineRowHTML` (CC: 7, line 498)
- `generateStatisticsHTML` (CC: 2, line 635)
- `generateSummarySection` (CC: 1, line 282)
- `getBreakdownColumnStructure` (CC: 1, line 93)
- `getIndentChars` (CC: 3, line 413)
- `getPrettifyRelativePath` (CC: 3, line 42)
- `logComplexityMismatch` (CC: 10, line 178)
- `logComplexityMismatch (warn callback)` (CC: 1, line 185)
- `logComplexityMismatch (warn callback) (from callback)` (CC: 3, line 193)
- `logComplexityMismatch (warn callback) (from callback)` (CC: 3, line 194)
- `logComplexityMismatch (warn callback) (warn callback)` (CC: 1, line 196)
- `logComplexityMismatch (warn callback) (warn callback)` (CC: 1, line 199)
- `readSourceFile` (CC: 3, line 536)

#### `folder.js`

- `formatPercentage` (CC: 3, line 240)
- `generateFolderHTML` (CC: 13, line 278)
- `generateFolderHTML (map callback)` (CC: 1, line 334)
- `generateFolderPageScript` (CC: 1, line 63)
- `generateFunctionRow` (CC: 6, line 32)
- `generateSummarySection` (CC: 1, line 236)
- `groupFunctionsByBaseName` (CC: 1, line 7)
- `groupFunctionsByBaseName (forEach callback)` (CC: 4, line 9)
- `groupFunctionsByBaseName (sort callback)` (CC: 1, line 21)

#### `main-index.js`

- `formatPercentage` (CC: 3, line 8)
- `formatPercentage` (CC: 3, line 215)
- `generateFolderRow` (CC: 9, line 6)
- `generateMainIndexHTML` (CC: 10, line 200)
- `generateMainIndexHTML (map callback)` (CC: 1, line 293)
- `generateMainIndexScript` (CC: 1, line 41)

#### `utils.js`

- `escapeHtml` (CC: 1, line 6)
- `escapeHtml (replace callback)` (CC: 1, line 14)

### src/

#### `App.tsx`

- `App` (CC: 1, line 35)
- `AppContent` (CC: 1, line 17)
- `lazy callback` (CC: 1, line 13)
- `lazy callback` (CC: 1, line 14)
- `lazy callback` (CC: 1, line 15)

#### `main.tsx`

- `addEventListener callback` (CC: 10, line 34)
- `addEventListener callback` (CC: 9, line 12)
- `anonymous arrow function` (CC: 1, line 57)
- `applyThemeToDom` (CC: 3, line 63)
- `applyThemeToDom (entries callback)` (CC: 1, line 67)

#### `setupTests.ts`

- `anonymous` (CC: 1, line 20)
- `anonymous` (CC: 1, line 21)
- `anonymous` (CC: 1, line 22)
- `anonymous` (CC: 1, line 23)
- `anonymous` (CC: 1, line 26)
- `anonymous` (CC: 1, line 31)
- `anonymous` (CC: 1, line 32)
- `anonymous` (CC: 1, line 33)
- `anonymous` (CC: 1, line 34)
- `anonymous arrow function` (CC: 1, line 6)
- `anonymous arrow function` (CC: 1, line 10)
- `anonymous arrow function` (CC: 1, line 11)
- `anonymous arrow function` (CC: 1, line 12)
- `anonymous arrow function` (CC: 1, line 13)
- `anonymous arrow function` (CC: 1, line 14)

### src/components/

#### `BlogSkeleton.tsx`

- `BlogSkeleton` (CC: 1, line 8)
- `BlogSkeleton (from callback)` (CC: 1, line 50)

#### `Button.tsx`

- `Button` (CC: 6, line 45)
- `getVariantClass` (CC: 3, line 11)
- `renderLeftChevron` (CC: 2, line 31)
- `renderRightChevron` (CC: 2, line 38)
- `shouldDisplayChevron` (CC: 3, line 21)

#### `Icon.tsx`

- `Icon` (CC: 3, line 10)

#### `MetaTags.tsx`

- `MetaTags` (CC: 1, line 7)

#### `ScrollToTop.tsx`

- `ScrollToTop` (CC: 1, line 8)
- `ScrollToTop (useEffect callback)` (CC: 2, line 11)
- `ScrollToTop (useEffect callback) (setTimeout callback)` (CC: 2, line 14)

### src/components/AudioControl/

#### `AudioControl.tsx`

- `anonymous arrow function` (CC: 3, line 61)
- `AudioControl` (CC: 9, line 6)
- `AudioControl (async callback)` (CC: 4, line 93)
- `AudioControl (return callback)` (CC: 3, line 45)
- `AudioControl (useEffect callback)` (CC: 8, line 22)
- `handlePause` (CC: 1, line 80)
- `handlePlay` (CC: 1, line 78)
- `handlePlay` (CC: 1, line 79)

### src/components/ThemePicker/

#### `ThemePicker.tsx`

- `anonymous arrow function` (CC: 1, line 342)
- `anonymous arrow function` (CC: 1, line 372)
- `ColorCategories` (CC: 1, line 414)
- `ColorCategories (map callback)` (CC: 4, line 430)
- `ColorCategories (map callback) (filter callback)` (CC: 2, line 437)
- `ColorCategories (map callback) (filter callback)` (CC: 2, line 438)
- `ColorCategories (map callback) (filter callback)` (CC: 2, line 439)
- `ColorCategories (map callback) (filter callback)` (CC: 2, line 440)
- `ColorCategories (map callback) (filter callback)` (CC: 1, line 431)
- `ColorCategories (map callback) (filter callback)` (CC: 1, line 434)
- `ColorCategories (map callback) (map callback)` (CC: 2, line 493)
- `ColorItem` (CC: 3, line 87)
- `ColorItem (arrow function)` (CC: 1, line 105)
- `ColorItem (arrow function)` (CC: 1, line 110)
- `ContrastWarnings` (CC: 2, line 228)
- `ContrastWarnings (map callback)` (CC: 1, line 236)
- `GradientGroup` (CC: 2, line 133)
- `GradientGroup (map callback)` (CC: 2, line 142)
- `handleBackdropClick` (CC: 4, line 653)
- `hasAudioEasterEgg` (CC: 5, line 164)
- `isBuiltInPreset` (CC: 2, line 168)
- `isBuiltInPreset (some callback)` (CC: 1, line 219)
- `PresetSection` (CC: 8, line 282)
- `PresetSection (arrow function)` (CC: 1, line 314)
- `PresetSection (arrow function)` (CC: 1, line 333)
- `PresetSection (map callback)` (CC: 4, line 325)
- `ThemePicker` (CC: 4, line 517)
- `ThemePicker (return callback)` (CC: 1, line 672)
- `ThemePicker (useCallback callback)` (CC: 6, line 704)
- `ThemePicker (useCallback callback)` (CC: 3, line 730)
- `ThemePicker (useCallback callback)` (CC: 3, line 736)
- `ThemePicker (useCallback callback)` (CC: 3, line 742)
- `ThemePicker (useCallback callback)` (CC: 3, line 748)
- `ThemePicker (useCallback callback)` (CC: 3, line 755)
- `ThemePicker (useCallback callback)` (CC: 3, line 762)
- `ThemePicker (useCallback callback)` (CC: 2, line 562)
- `ThemePicker (useCallback callback)` (CC: 2, line 572)
- `ThemePicker (useCallback callback)` (CC: 2, line 586)
- `ThemePicker (useCallback callback)` (CC: 2, line 605)
- `ThemePicker (useCallback callback)` (CC: 2, line 617)
- `ThemePicker (useCallback callback)` (CC: 1, line 594)
- `ThemePicker (useCallback callback)` (CC: 1, line 600)
- `ThemePicker (useCallback callback)` (CC: 1, line 624)
- `ThemePicker (useCallback callback)` (CC: 1, line 628)
- `ThemePicker (useCallback callback)` (CC: 1, line 632)
- `ThemePicker (useCallback callback)` (CC: 1, line 636)
- `ThemePicker (useCallback callback)` (CC: 1, line 640)
- `ThemePicker (useCallback callback)` (CC: 1, line 644)
- `ThemePicker (useCallback callback) (map callback)` (CC: 1, line 713)
- `ThemePicker (useCallback callback) (setIsOpen callback)` (CC: 1, line 625)
- `ThemePicker (useCallback callback) (setIsPresetsExpanded callback)` (CC: 1, line 633)
- `ThemePicker (useCallback callback) (setIsPresetsExpanded callback)` (CC: 1, line 758)
- `ThemePicker (useCallback callback) (setLocalChanges callback)` (CC: 1, line 563)
- `ThemePicker (useCallback callback) (setLocalChanges callback)` (CC: 1, line 573)
- `ThemePicker (useEffect callback)` (CC: 2, line 650)
- `ThemePicker (useEffect callback)` (CC: 2, line 668)
- `ThemePicker (useEffect callback)` (CC: 2, line 678)
- `ThemePicker (useEffect callback)` (CC: 2, line 691)
- `ThemePicker (useEffect callback) (return callback)` (CC: 1, line 664)
- `ThemePicker (useEffect callback) (return callback)` (CC: 1, line 687)
- `ThemePicker (useEffect callback) (return callback)` (CC: 1, line 700)
- `ThemePicker (useEffect callback) (setTimeout callback)` (CC: 1, line 680)
- `ThemePicker (useEffect callback) (setTimeout callback)` (CC: 1, line 684)
- `ThemePicker (useEffect callback) (setTimeout callback)` (CC: 1, line 693)
- `ThemePicker (useEffect callback) (setTimeout callback)` (CC: 1, line 697)
- `ThemePicker (useMemo callback)` (CC: 2, line 533)

### src/context/

#### `ThemeContext.tsx`

- `applyThemeToDom` (CC: 2, line 20)
- `applyThemeToDom (entries callback)` (CC: 1, line 24)
- `themeKeyToCssVar` (CC: 1, line 14)
- `ThemeProvider` (CC: 1, line 35)
- `ThemeProvider (arrow function)` (CC: 8, line 68)
- `ThemeProvider (arrow function)` (CC: 4, line 36)
- `ThemeProvider (arrow function)` (CC: 4, line 52)
- `ThemeProvider (arrow function) (find callback)` (CC: 1, line 85)
- `ThemeProvider (arrow function) (find callback) (keys callback)` (CC: 1, line 86)
- `ThemeProvider (setTheme callback)` (CC: 1, line 108)
- `ThemeProvider (useCallback callback)` (CC: 2, line 128)
- `ThemeProvider (useCallback callback)` (CC: 2, line 140)
- `ThemeProvider (useCallback callback)` (CC: 2, line 153)
- `ThemeProvider (useCallback callback)` (CC: 2, line 163)
- `ThemeProvider (useCallback callback)` (CC: 1, line 107)
- `ThemeProvider (useCallback callback)` (CC: 1, line 116)
- `ThemeProvider (useCallback callback)` (CC: 1, line 124)
- `ThemeProvider (useCallback callback) (filter callback)` (CC: 2, line 168)
- `ThemeProvider (useCallback callback) (filter callback)` (CC: 1, line 147)
- `ThemeProvider (useCallback callback) (find callback)` (CC: 1, line 154)
- `ThemeProvider (useCallback callback) (find callback)` (CC: 1, line 165)
- `ThemeProvider (useEffect callback)` (CC: 1, line 101)
- `ThemeProvider (useMemo callback)` (CC: 1, line 178)

#### `useTheme.ts`

- `useTheme` (CC: 2, line 4)

### src/context/scripts/

#### `extract-themes.js`

- `filter callback` (CC: 1, line 108)
- `filter callback` (CC: 1, line 119)
- `split callback` (CC: 3, line 101)
- `split callback` (CC: 2, line 113)

### src/data/blog/

#### `index.ts`

- `getAllBlogPosts` (CC: 2, line 70)
- `getAllBlogPosts (entries callback)` (CC: 2, line 79)
- `getAllUniqueTags` (CC: 1, line 212)
- `getAllUniqueTags (forEach callback)` (CC: 4, line 216)
- `getAllUniqueTags (forEach callback) (forEach callback)` (CC: 1, line 223)
- `getBlogPostBySlug` (CC: 2, line 93)
- `getBlogPostBySlug (find callback)` (CC: 2, line 97)
- `getBlogPostsForTopic` (CC: 3, line 59)
- `getBlogPostSlug` (CC: 2, line 122)
- `getBlogPostTopicId` (CC: 3, line 110)
- `getBlogPostTopicId (some callback)` (CC: 2, line 112)
- `getRelatedPosts` (CC: 4, line 141)
- `getRelatedPosts (filter callback)` (CC: 2, line 196)
- `getRelatedPosts (filter callback)` (CC: 1, line 146)
- `getRelatedPosts (filter callback)` (CC: 1, line 184)
- `getRelatedPosts (map callback)` (CC: 6, line 157)
- `getRelatedPosts (map callback)` (CC: 1, line 187)
- `getRelatedPosts (map callback)` (CC: 1, line 193)
- `getRelatedPosts (map callback) (forEach callback)` (CC: 2, line 172)
- `getRelatedPosts (map callback) (map callback)` (CC: 1, line 169)
- `getRelatedPosts (map callback) (map callback)` (CC: 1, line 170)
- `getRelatedPosts (sort callback)` (CC: 1, line 185)
- `getTopicIdFromPath` (CC: 1, line 26)
- `loadAllBlogPosts` (CC: 2, line 36)
- `loadAllBlogPosts (entries callback)` (CC: 1, line 42)
- `loadAllBlogPosts (then callback)` (CC: 1, line 47)

### src/hooks/

#### `useImagePreload.ts`

- `useImagePreload` (CC: 1, line 10)
- `useImagePreload (arrow function)` (CC: 1, line 28)
- `useImagePreload (arrow function)` (CC: 1, line 31)
- `useImagePreload (return callback)` (CC: 2, line 42)
- `useImagePreload (useEffect callback)` (CC: 3, line 13)
- `useImagePreload (useEffect callback) (setTimeout callback)` (CC: 1, line 39)

#### `useMetaTags.ts`

- `generateRobotsContent` (CC: 3, line 71)
- `getBaseUrl` (CC: 2, line 34)
- `resolveImageUrl` (CC: 3, line 26)
- `resolveUrl` (CC: 3, line 18)
- `setCanonicalLink` (CC: 2, line 58)
- `setConditionalMetaTags` (CC: 1, line 80)
- `setConditionalMetaTags (forEach callback)` (CC: 3, line 83)
- `setMetaTag` (CC: 5, line 41)
- `setOpenGraphTags` (CC: 1, line 93)
- `setTwitterCardTags` (CC: 1, line 114)
- `useMetaTags` (CC: 6, line 132)
- `useMetaTags (useEffect callback)` (CC: 2, line 145)

### src/layout/

#### `Container.tsx`

- `Container` (CC: 2, line 9)

#### `Section.tsx`

- `Section` (CC: 3, line 10)

### src/pages/

#### `Blog.tsx`

- `Blog` (CC: 3, line 13)
- `Blog (then callback)` (CC: 1, line 19)
- `Blog (useCallback callback)` (CC: 1, line 27)
- `Blog (useEffect callback)` (CC: 1, line 18)
- `Blog (useMemo callback)` (CC: 2, line 32)
- `Blog (useMemo callback)` (CC: 2, line 37)
- `Blog (useMemo callback) (filter callback)` (CC: 1, line 41)

#### `BlogPost.helpers.ts`

- `getAuthorName` (CC: 2, line 6)
- `getMetaDescription` (CC: 2, line 13)
- `hasContent` (CC: 1, line 27)
- `hasTags` (CC: 2, line 20)

#### `BlogPost.tsx`

- `BlogPost` (CC: 9, line 20)
- `BlogPost (map callback)` (CC: 1, line 125)
- `BlogPost (useEffect callback)` (CC: 2, line 28)
- `BlogPost (useEffect callback) (then callback)` (CC: 2, line 30)

#### `BlogPostNotFound.tsx`

- `BlogPostNotFound` (CC: 1, line 8)

#### `Home.tsx`

- `Home` (CC: 1, line 18)
- `lazy callback` (CC: 1, line 16)

#### `Tag.tsx`

- `Tag` (CC: 4, line 16)
- `Tag (then callback)` (CC: 1, line 23)
- `Tag (useEffect callback)` (CC: 1, line 22)
- `Tag (useMemo callback)` (CC: 4, line 31)
- `Tag (useMemo callback)` (CC: 2, line 48)
- `Tag (useMemo callback) (filter callback)` (CC: 3, line 51)
- `Tag (useMemo callback) (find callback)` (CC: 1, line 35)
- `Tag (useMemo callback) (find callback)` (CC: 1, line 41)

### src/sections/AgencyLogos/

#### `index.tsx`

- `AgencyLogosComponent` (CC: 1, line 24)
- `AgencyLogosComponent (map callback)` (CC: 2, line 213)
- `AgencyLogosComponent (map callback)` (CC: 1, line 190)
- `AgencyLogosComponent (return callback)` (CC: 1, line 128)
- `AgencyLogosComponent (return callback)` (CC: 1, line 153)
- `AgencyLogosComponent (useCallback callback)` (CC: 2, line 38)
- `AgencyLogosComponent (useCallback callback)` (CC: 2, line 47)
- `AgencyLogosComponent (useEffect callback)` (CC: 3, line 159)
- `AgencyLogosComponent (useEffect callback)` (CC: 2, line 82)
- `AgencyLogosComponent (useEffect callback)` (CC: 2, line 137)
- `AgencyLogosComponent (useEffect callback)` (CC: 1, line 54)
- `AgencyLogosComponent (useEffect callback) (IntersectionObserver callback)` (CC: 4, line 141)
- `AgencyLogosComponent (useEffect callback) (requestAnimationFrame callback)` (CC: 1, line 118)
- `AgencyLogosComponent (useEffect callback) (return callback)` (CC: 1, line 168)
- `AgencyLogosComponent (useEffect callback) (setInterval callback)` (CC: 3, line 162)
- `AgencyLogosComponent (useLayoutEffect callback)` (CC: 4, line 69)
- `anonymous arrow function` (CC: 2, line 181)
- `anonymous arrow function` (CC: 1, line 219)
- `currentOnSelect` (CC: 1, line 98)
- `handlePointerDown` (CC: 1, line 93)
- `handleReInit` (CC: 1, line 89)

### src/sections/BlogFilters/

#### `index.tsx`

- `anonymous arrow function` (CC: 1, line 83)
- `BlogFilters` (CC: 2, line 12)
- `BlogFilters (arrow function)` (CC: 1, line 63)
- `BlogFilters (map callback)` (CC: 1, line 67)
- `BlogFilters (then callback)` (CC: 1, line 19)
- `BlogFilters (useEffect callback)` (CC: 3, line 26)
- `BlogFilters (useEffect callback)` (CC: 1, line 18)
- `BlogFilters (useEffect callback) (filter callback)` (CC: 5, line 42)
- `BlogFilters (useEffect callback) (filter callback)` (CC: 3, line 32)
- `BlogFilters (useEffect callback) (some callback)` (CC: 1, line 46)

### src/sections/BlogGrid/

#### `index.tsx`

- `BlogGrid` (CC: 2, line 17)
- `BlogGrid (map callback)` (CC: 1, line 36)
- `BlogGrid (useMemo callback)` (CC: 1, line 23)
- `handleLoadMore` (CC: 1, line 29)
- `handleLoadMore` (CC: 1, line 30)

### src/sections/BlogHeading/

#### `index.tsx`

- `BlogHeading` (CC: 1, line 3)

### src/sections/CampaignBanner/

#### `index.tsx`

- `CampaignBanner` (CC: 1, line 8)

### src/sections/CustomerSpotlight/

#### `index.tsx`

- `CustomerSpotlight` (CC: 3, line 34)
- `CustomerSpotlight (map callback)` (CC: 2, line 85)
- `scrollNext` (CC: 2, line 43)
- `scrollNext` (CC: 1, line 42)
- `scrollNext (arrow function)` (CC: 1, line 91)
- `scrollPrev` (CC: 2, line 39)
- `scrollPrev` (CC: 1, line 38)

### src/sections/FeatureAccordion/

#### `index.tsx`

- `anonymous arrow function` (CC: 1, line 209)
- `FeatureAccordion` (CC: 3, line 93)
- `FeatureAccordion (map callback)` (CC: 3, line 192)
- `FeatureAccordion (map callback)` (CC: 2, line 147)
- `FeatureAccordion (return callback)` (CC: 1, line 131)
- `FeatureAccordion (useEffect callback)` (CC: 1, line 107)
- `matchHeights` (CC: 5, line 108)
- `matchHeights (arrow function)` (CC: 1, line 160)

### src/sections/FeaturedBlogPost/

#### `index.tsx`

- `FeaturedBlogPost` (CC: 5, line 21)

### src/sections/Footer/

#### `index.tsx`

- `Footer` (CC: 1, line 41)
- `Footer (map callback)` (CC: 1, line 52)
- `Footer (map callback)` (CC: 1, line 72)
- `Footer (map callback)` (CC: 1, line 84)
- `Footer (map callback)` (CC: 1, line 96)
- `Footer (map callback)` (CC: 1, line 108)

### src/sections/Header/

#### `index.tsx`

- `anonymous arrow function` (CC: 1, line 246)
- `anonymous arrow function` (CC: 1, line 256)
- `anonymous arrow function` (CC: 1, line 266)
- `anonymous arrow function` (CC: 1, line 276)
- `closeMenu` (CC: 1, line 76)
- `handleEscape` (CC: 3, line 82)
- `handleHashClick` (CC: 6, line 19)
- `handleMenuLinkClick` (CC: 3, line 40)
- `handleMenuLinkClick (setTimeout callback)` (CC: 2, line 50)
- `handleResize` (CC: 3, line 145)
- `handleScroll` (CC: 2, line 115)
- `handleScroll (requestAnimationFrame callback)` (CC: 2, line 117)
- `Header` (CC: 10, line 8)
- `Header (return callback)` (CC: 1, line 96)
- `Header (return callback)` (CC: 1, line 176)
- `Header (useEffect callback)` (CC: 3, line 132)
- `Header (useEffect callback)` (CC: 2, line 81)
- `Header (useEffect callback)` (CC: 2, line 103)
- `Header (useEffect callback)` (CC: 2, line 157)
- `Header (useEffect callback)` (CC: 2, line 169)
- `Header (useEffect callback)` (CC: 1, line 112)
- `Header (useEffect callback) (return callback)` (CC: 1, line 128)
- `Header (useEffect callback) (return callback)` (CC: 1, line 152)
- `Header (useEffect callback) (startTransition callback)` (CC: 1, line 105)
- `toggleMenu` (CC: 1, line 72)

### src/sections/Hero/

#### `index.tsx`

- `handleContactClick` (CC: 4, line 9)
- `Hero` (CC: 1, line 6)

### src/sections/HeroMarquee/

#### `index.tsx`

- `from callback` (CC: 1, line 5)
- `HeroMarquee` (CC: 1, line 11)
- `HeroMarquee (map callback)` (CC: 1, line 21)

### src/sections/LatestBlogs/

#### `index.tsx`

- `LatestBlogs` (CC: 1, line 11)
- `LatestBlogs (map callback)` (CC: 1, line 37)
- `LatestBlogs (then callback)` (CC: 1, line 18)
- `LatestBlogs (then callback) (sort callback)` (CC: 1, line 22)
- `LatestBlogs (useEffect callback)` (CC: 1, line 16)

### src/sections/PlatformCards/

#### `index.tsx`

- `PlatformCards` (CC: 1, line 30)
- `PlatformCards (map callback)` (CC: 1, line 38)

### src/sections/PlatformIntro/

#### `index.tsx`

- `PlatformIntro` (CC: 1, line 40)
- `PlatformIntro (map callback)` (CC: 1, line 62)

### src/sections/TopBanner/

#### `index.tsx`

- `onScroll` (CC: 2, line 31)
- `onScroll (arrow function)` (CC: 1, line 63)
- `onScroll (requestAnimationFrame callback)` (CC: 2, line 35)
- `TopBanner` (CC: 3, line 5)
- `TopBanner (useEffect callback)` (CC: 1, line 10)
- `TopBanner (useEffect callback)` (CC: 1, line 28)
- `TopBanner (useEffect callback) (return callback)` (CC: 1, line 25)
- `TopBanner (useEffect callback) (return callback)` (CC: 1, line 45)
- `updateVars` (CC: 4, line 13)

### src/utils/

#### `contrast.ts`

- `anonymous arrow function` (CC: 4, line 186)
- `anonymous arrow function` (CC: 4, line 216)
- `anonymous arrow function` (CC: 2, line 141)
- `anonymous arrow function` (CC: 2, line 162)
- `blendColor` (CC: 3, line 7)
- `checkContrastIssues` (CC: 1, line 70)
- `checkContrastIssues (arrow function)` (CC: 4, line 123)
- `checkContrastIssues (arrow function)` (CC: 2, line 95)
- `getContrastLevel` (CC: 3, line 51)
- `getContrastRatio` (CC: 2, line 36)

#### `imageGrayscale.ts`

- `getGrayscaleFilter` (CC: 2, line 35)
- `getGrayscaleImageUrl` (CC: 4, line 11)

#### `slug.ts`

- `slugify` (CC: 1, line 6)
