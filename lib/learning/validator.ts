import { LearningCheckpoint, TaskType } from '@/types/learning';
import { ValidationEvaluation, ErrorDiagnostic } from '@/types/ai';

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

    if (ratio >= 0.5) {
      return {
        passed: true,
        score: Math.round(ratio * 100),
        title: 'Great Explanation!',
        message: `You demonstrated a solid understanding of ${checkpoint.conceptName}! You touched upon key points: ${matchedKeywords.join(', ')}.`,
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

  // Execute test cases
  const testResults: {
    description: string;
    passed: boolean;
    actual?: any;
    expected?: any;
  }[] = [];

  let allPassed = true;
  let diagnostic: ErrorDiagnostic | undefined;

  for (const test of checkpoint.testCases) {
    try {
      if (test.assertionFn) {
        // Evaluate the assertion against user's code in a safe simulated runtime
        const testCode = `
          ${code};
          ${test.assertionFn};
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
        // Fallback semantic pattern checking if no dynamic assertionFn
        const normalized = code.replace(/\s+/g, ' ');
        const solutionNormalized = checkpoint.solutionCode.replace(/\s+/g, ' ');

        // Check if essential tokens exist
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
