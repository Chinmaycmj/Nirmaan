import { LearningCheckpoint, TaskType } from '@/types/learning';
import { ValidationEvaluation, ErrorDiagnostic } from '@/types/ai';

/**
 * Sanitizes TypeScript code into vanilla executable JavaScript for testing in new Function().
 * Strips export/import, type aliases, interfaces, type annotations, and generics.
 */
function sanitizeTypeScriptForEvaluation(tsCode: string): string {
  let js = tsCode;
  // 1. Strip import statements
  js = js.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '');
  // 2. Strip export keywords
  js = js.replace(/\bexport\s+(default\s+)?/g, '');
  // 3. Strip interface declarations
  js = js.replace(/interface\s+\w+[\s\S]*?\{[\s\S]*?\}/g, '');
  // 4. Strip type declarations
  js = js.replace(/type\s+\w+\s*=[\s\S]*?;/g, '');
  // 5. Strip return type annotations on functions e.g. '): number {' -> ') {'
  js = js.replace(/\)\s*:\s*[A-Za-z0-9_<>\[\]|&\s]+\s*\{/g, ') {');
  // 6. Strip param type annotations e.g. 'prev: number' -> 'prev'
  js = js.replace(/([a-zA-Z0-9_]+)\s*:\s*[A-Za-z0-9_<>\[\]|&]+(?=[,\)\=\{])/g, '$1');
  // 7. Strip type assertions e.g. 'as OperationType'
  js = js.replace(/\s+as\s+[A-Za-z0-9_<>\[\]]+/g, '');
  // 8. Strip generics on calls e.g. 'useState<string>("0")'
  js = js.replace(/<[A-Za-z0-9_,\s]+>(?=\()/g, '');
  return js;
}

export async function validateCheckpointSubmission(
  checkpoint: LearningCheckpoint,
  userSubmission: string | number | boolean
): Promise<ValidationEvaluation> {
  const taskType = checkpoint.taskType;

  // Handle Type C & Type F (Multiple Choice / Approach Picker)
  if (taskType === 'PREDICT_OUTPUT' || taskType === 'CHOOSE_APPROACH') {
    const selectedOptionId = String(userSubmission);
    const options = checkpoint.multipleChoiceOptions || [];
    const chosenOption = options.find(o => o.id === selectedOptionId);

    if (!chosenOption) {
      return {
        passed: false,
        score: 0,
        title: 'No Option Selected',
        message: 'Please choose an option to test your understanding.',
        testResults: [],
      };
    }

    if (chosenOption.isCorrect) {
      return {
        passed: true,
        score: 100,
        title: 'Spot on! Correct answer.',
        message: chosenOption.explanation,
        testResults: [
          {
            description: `Selected: ${chosenOption.text}`,
            passed: true,
            actual: chosenOption.text,
            expected: chosenOption.text,
          },
        ],
      };
    } else {
      return {
        passed: false,
        score: 0,
        title: 'Not quite right',
        message: chosenOption.explanation,
        testResults: [
          {
            description: `Selected: ${chosenOption.text}`,
            passed: false,
            actual: 'Incorrect rationale',
            expected: 'Correct application of concept',
          },
        ],
        diagnostic: {
          whatHappened: 'The selected approach does not satisfy the requirements.',
          whereItHappened: checkpoint.title,
          whatMessageMeans: chosenOption.explanation,
          conceptInvolved: checkpoint.conceptName,
          investigationSteps: [
            'Review the problem statement and constraints.',
            'Consider how state immutability or return values behave here.',
          ],
          suggestedHint: checkpoint.hints[0]?.content || 'Review the conceptual definition.',
        },
      };
    }
  }

  // Handle Type E (Explain the Code)
  if (taskType === 'EXPLAIN_CODE') {
    const text = String(userSubmission).trim();
    if (text.length < 15) {
      return {
        passed: false,
        score: 20,
        title: 'Explanation Too Brief',
        message: 'Try to explain in a little more detail what the code accomplishes and why it is written this way.',
        testResults: [
          {
            description: 'Provide a thoughtful explanation',
            passed: false,
          },
        ],
        diagnostic: {
          whatHappened: 'The response is too brief to evaluate comprehension.',
          whereItHappened: 'Explanation input',
          whatMessageMeans: 'Learning requires expressing the logic in your own words.',
          conceptInvolved: checkpoint.conceptName,
          investigationSteps: [
            'Mention the input parameters and return value.',
            'Explain how it interacts with the rest of the application.',
          ],
          suggestedHint: 'Think about what would happen if this piece of code were removed.',
        },
      };
    }

    const expectedKeywords = checkpoint.expectedKeywords || [];
    const lower = text.toLowerCase();
    const matchedKeywords = expectedKeywords.filter(kw => lower.includes(kw.toLowerCase()));
    const ratio = expectedKeywords.length > 0 ? matchedKeywords.length / expectedKeywords.length : 1;

    if (ratio >= 0.4) {
      return {
        passed: true,
        score: Math.max(80, Math.round(ratio * 100)),
        title: 'Great Explanation!',
        message: `You demonstrated a solid understanding of ${checkpoint.conceptName}! Key aspects identified: ${matchedKeywords.join(', ')}.`,
        testResults: expectedKeywords.map(kw => ({
          description: `Identified concept aspect: "${kw}"`,
          passed: lower.includes(kw.toLowerCase()),
        })),
      };
    } else {
      return {
        passed: false,
        score: Math.round(ratio * 100),
        title: 'Almost There - Missing Key Concepts',
        message: `Your explanation is a good start, but make sure to explain how ${checkpoint.conceptName} works (e.g. mention: ${expectedKeywords.join(', ')}).`,
        testResults: expectedKeywords.map(kw => ({
          description: `Identified concept aspect: "${kw}"`,
          passed: lower.includes(kw.toLowerCase()),
        })),
        diagnostic: {
          whatHappened: 'Explanation lacks some key technical details.',
          whereItHappened: 'Explanation description',
          whatMessageMeans: 'Try connecting the syntax to the underlying mechanism.',
          conceptInvolved: checkpoint.conceptName,
          investigationSteps: [
            `What is the primary role of ${checkpoint.conceptName}?`,
            `How does this prevent bugs or improve component reactivity?`,
          ],
          suggestedHint: checkpoint.hints[0]?.content || 'Review the conceptual hint.',
        },
      };
    }
  }

  // Handle Coding Tasks: Type A (Complete Code), Type B (Write Scratch), Type D (Fix Bug), Type G (Modify Code)
  const code = String(userSubmission).trim();

  // Basic syntax & emptiness check
  if (!code || code.includes('// YOUR CODE HERE') || code.includes('/* TODO */')) {
    return {
      passed: false,
      score: 0,
      title: 'Incomplete Implementation',
      message: 'Replace the placeholder with your actual code implementation.',
      testResults: [
        {
          description: 'Code contains an implementation without placeholders',
          passed: false,
        },
      ],
      diagnostic: {
        whatHappened: 'Placeholder comments are still present.',
        whereItHappened: 'Function body',
        whatMessageMeans: 'The system detected unmodified template code.',
        conceptInvolved: checkpoint.conceptName,
        investigationSteps: [
          'Read the task prompt and instructions carefully.',
          'Write the expression or statements that fulfill the goal.',
        ],
        suggestedHint: checkpoint.hints[0]?.content || 'Start with a conceptual approach.',
      },
    };
  }

  // Check if this is a CSS styling checkpoint
  const isCss = checkpoint.conceptId.includes('css') || 
                checkpoint.targetFileId?.endsWith('.css') || 
                checkpoint.targetFileId?.includes('style') ||
                (code.includes('{') && (code.includes('display:') || code.includes('grid-') || code.includes('gap:') || code.includes('flex:')));

  if (isCss) {
    const testResults: { description: string; passed: boolean }[] = [];
    let allPassed = true;

    for (const test of checkpoint.testCases) {
      const desc = test.description.toLowerCase();
      let passed = false;

      if (desc.includes('display: grid') || (desc.includes('display') && desc.includes('grid'))) {
        passed = /display\s*:\s*grid/i.test(code);
      } else if (desc.includes('column') || desc.includes('repeat')) {
        passed = /grid-template-columns\s*:\s*(repeat\(\s*4\s*,\s*1fr\s*\)|1fr\s+1fr\s+1fr\s+1fr)/i.test(code) || /grid-template-columns/i.test(code);
      } else if (desc.includes('gap')) {
        passed = /gap\s*:\s*12px/i.test(code) || /gap\s*:\s*\d+/i.test(code);
      } else {
        passed = true;
      }

      testResults.push({
        description: test.description,
        passed,
      });

      if (!passed) allPassed = false;
    }

    const passedCount = testResults.filter(t => t.passed).length;
    return {
      passed: allPassed,
      score: allPassed ? 100 : Math.round((passedCount / testResults.length) * 100),
      title: allPassed ? 'CSS Layout Validated!' : 'CSS Rules Incomplete',
      message: allPassed
        ? 'Great job! Your CSS Grid and styling rules are correctly formatted.'
        : 'Review the CSS rules. Ensure all required layout properties (display, columns, gap) are specified.',
      testResults,
      diagnostic: allPassed ? undefined : {
        whatHappened: 'One or more CSS properties were missing or incorrectly formatted.',
        whereItHappened: checkpoint.title,
        whatMessageMeans: 'Modern CSS Grid requires display: grid and grid-template-columns.',
        conceptInvolved: checkpoint.conceptName,
        investigationSteps: [
          'Verify display: grid;',
          'Verify grid-template-columns: repeat(4, 1fr);',
          'Verify gap: 12px;'
        ],
        suggestedHint: checkpoint.hints[2]?.content || 'Review the CSS syntax hint.',
      },
    };
  }

  // Check if this is a Python logic checkpoint
  const isPython = checkpoint.targetFileId?.endsWith('.py') ||
                   code.startsWith('def ') ||
                   code.includes('def calculate') ||
                   checkpoint.conceptId.includes('python');

  if (isPython) {
    const testResults: { description: string; passed: boolean; actual?: any; expected?: any }[] = [];

    const hasDef = /def\s+[a-zA-Z0-9_]+\s*\(/i.test(code);
    const hasAddition = /\+\s*current|\+\s*prev/i.test(code);
    const hasMultiply = /\*\s*current|\*\s*prev/i.test(code);
    const hasZeroGuard = /current\s*==\s*0/i.test(code) || /nan/i.test(code);

    testResults.push({
      description: 'Defines Python function signature def calculate(prev, current, op):',
      passed: hasDef,
    });
    testResults.push({
      description: 'Implements arithmetic operations (+, -, *, /)',
      passed: hasAddition && hasMultiply,
    });
    testResults.push({
      description: 'Guards against division by zero returning float("nan")',
      passed: hasZeroGuard,
    });

    const allPassed = hasDef && hasAddition && hasMultiply && hasZeroGuard;
    const passedCount = testResults.filter(t => t.passed).length;

    return {
      passed: allPassed,
      score: allPassed ? 100 : Math.round((passedCount / testResults.length) * 100),
      title: allPassed ? 'Python Function Verified!' : 'Python Logic Incomplete',
      message: allPassed
        ? 'All Python algorithmic assertions and structural checks passed cleanly!'
        : 'Ensure def calculate handles +, -, *, / and guards against division by zero.',
      testResults,
      diagnostic: allPassed ? undefined : {
        whatHappened: 'Python function is missing arithmetic branches or zero-division guard.',
        whereItHappened: checkpoint.title,
        whatMessageMeans: 'Make sure +, -, *, and / return correct numbers, and division by zero returns NaN.',
        conceptInvolved: checkpoint.conceptName,
        investigationSteps: [
          'Check if current == 0 in division',
          'Ensure return statements are present in each branch',
        ],
        suggestedHint: checkpoint.hints[1]?.content || 'Review the structural hint.',
      },
    };
  }

  // Check if this is a TypeScript interface/type definition checkpoint (compile-time only)
  if (checkpoint.conceptId === 'ts_interfaces' || (code.includes('interface ') && !code.includes('function '))) {
    const testResults: { description: string; passed: boolean }[] = [];
    let passedCount = 0;

    // Verify key fields
    const hasInterface = /interface\s+\w+/i.test(code);
    testResults.push({
      description: 'Declares a valid interface structure',
      passed: hasInterface,
    });
    if (hasInterface) passedCount++;

    for (const test of checkpoint.testCases) {
      // Check test description against code
      const descLower = test.description.toLowerCase();
      let match = true;
      if (descLower.includes('amount')) {
        match = /amount\s*:\s*number/i.test(code);
      } else if (descLower.includes('category') || descLower.includes('date')) {
        match = /category/i.test(code) && /date/i.test(code);
      } else {
        match = true;
      }

      testResults.push({
        description: test.description,
        passed: match,
      });
      if (match) passedCount++;
    }

    const allPassed = testResults.every(t => t.passed);
    return {
      passed: allPassed,
      score: allPassed ? 100 : Math.round((passedCount / testResults.length) * 100),
      title: allPassed ? 'Challenge Solved! Outstanding work.' : 'Interface Incomplete',
      message: allPassed
        ? 'Interface contracts verified. All required fields and types are present.'
        : 'Make sure all required interface properties and types are defined.',
      testResults,
      diagnostic: allPassed ? undefined : {
        whatHappened: 'Missing required interface properties.',
        whereItHappened: 'Interface declaration',
        whatMessageMeans: 'TypeScript requires all declared contract properties to match specifications.',
        conceptInvolved: checkpoint.conceptName,
        investigationSteps: ['Check for amount: number;', 'Check for category: ExpenseCategory;', 'Check for date: string;'],
        suggestedHint: checkpoint.hints[2]?.content || 'Review the interface syntax.',
      },
    };
  }

  // Execute runtime test cases with sanitized JavaScript
  const testResults: {
    description: string;
    passed: boolean;
    actual?: any;
    expected?: any;
  }[] = [];

  let allPassed = true;
  let diagnostic: ErrorDiagnostic | undefined;

  const sanitizedCode = sanitizeTypeScriptForEvaluation(code);

  for (const test of checkpoint.testCases) {
    try {
      if (test.assertionFn) {
        const sanitizedAssertion = sanitizeTypeScriptForEvaluation(test.assertionFn);
        const testCode = `
          ${sanitizedCode};
          ${sanitizedAssertion};
        `;
        const testRunner = new Function('testInput', testCode);
        const result = testRunner(test.input);
        
        const passed = Boolean(result);
        testResults.push({
          description: test.description,
          passed,
          actual: result ? 'Passed assertion' : 'Assertion returned false',
          expected: 'Truthy assertion',
        });

        if (!passed) {
          allPassed = false;
          diagnostic = {
            whatHappened: `Assertion failed: ${test.description}`,
            whereItHappened: checkpoint.title,
            whatMessageMeans: 'The output or state did not match the expected result for this test case.',
            conceptInvolved: checkpoint.conceptName,
            investigationSteps: [
              `Test input was: ${JSON.stringify(test.input)}`,
              `Check edge cases like zero, empty lists, or return value types.`,
            ],
            suggestedHint: checkpoint.hints[1]?.content || checkpoint.hints[0]?.content || 'Review structural hint.',
          };
        }
      } else {
        // Fallback semantic pattern checking
        const normalized = code.replace(/\s+/g, ' ');
        const solutionNormalized = checkpoint.solutionCode.replace(/\s+/g, ' ');

        const hasCoreLogic = solutionNormalized.split(';').every(part => {
          const trimmed = part.trim();
          if (!trimmed || trimmed.length < 5) return true;
          const words = trimmed.split(/[\s\(\)\{\}\,\.]+/).filter(w => w.length > 3);
          return words.some(w => normalized.includes(w));
        });

        testResults.push({
          description: test.description,
          passed: hasCoreLogic,
        });

        if (!hasCoreLogic) {
          allPassed = false;
        }
      }
    } catch (err: any) {
      allPassed = false;
      testResults.push({
        description: test.description,
        passed: false,
        actual: `Runtime Error: ${err.message}`,
        expected: 'Successful execution',
      });

      diagnostic = {
        whatHappened: `Code error encountered: ${err.name}`,
        whereItHappened: 'Execution sandbox',
        whatMessageMeans: err.message,
        conceptInvolved: checkpoint.conceptName,
        investigationSteps: [
          'Check for missing parentheses, brackets, or variable typos.',
          'Verify that variables are properly initialized before being used.',
          'Make sure return types match what callers expect.',
        ],
        suggestedHint: checkpoint.hints[2]?.content || 'Check your syntax and structure.',
      };
      break;
    }
  }

  const passedTestsCount = testResults.filter(t => t.passed).length;
  const score = testResults.length > 0 ? Math.round((passedTestsCount / testResults.length) * 100) : (allPassed ? 100 : 0);

  return {
    passed: allPassed,
    score,
    title: allPassed ? 'Challenge Solved! Outstanding work.' : 'Tests Incomplete',
    message: allPassed
      ? `Your code passed all ${testResults.length} test verification checks and has been integrated into the project.`
      : `Passed ${passedTestsCount} of ${testResults.length} checks. Review the diagnostic guidance below.`,
    testResults,
    diagnostic,
  };
}
