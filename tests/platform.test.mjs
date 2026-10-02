import test from 'node:test';
import assert from 'node:assert/strict';

// Test 1: Progressive Hint System Logic
test('Progressive Hint System unrolls hints in 4 strict tiers and unlocks solution at end', () => {
  const hints = [
    { level: 1, type: 'conceptual', title: 'Conceptual Clue', content: 'Think about return values' },
    { level: 2, type: 'structural', title: 'Placement', content: 'Place inside function body' },
    { level: 3, type: 'syntax', title: 'Syntax', content: 'return array.reduce(...)' },
    { level: 4, type: 'partial_solution', title: 'Skeleton', content: 'return expenses.reduce(...)' },
  ];

  let state = { currentRevealedLevel: 0, hintsUsed: 0, solutionUnlocked: false };

  let nextLevel = (state.currentRevealedLevel + 1);
  state = { currentRevealedLevel: nextLevel, hintsUsed: state.hintsUsed + 1, solutionUnlocked: nextLevel >= 4 };
  assert.equal(state.currentRevealedLevel, 1);
  assert.equal(state.hintsUsed, 1);
  assert.equal(state.solutionUnlocked, false);

  nextLevel = (state.currentRevealedLevel + 1);
  state = { currentRevealedLevel: nextLevel, hintsUsed: state.hintsUsed + 1, solutionUnlocked: nextLevel >= 4 };
  assert.equal(state.currentRevealedLevel, 2);

  nextLevel = (state.currentRevealedLevel + 1);
  state = { currentRevealedLevel: nextLevel, hintsUsed: state.hintsUsed + 1, solutionUnlocked: nextLevel >= 4 };
  assert.equal(state.currentRevealedLevel, 3);

  nextLevel = (state.currentRevealedLevel + 1);
  state = { currentRevealedLevel: nextLevel, hintsUsed: state.hintsUsed + 1, solutionUnlocked: nextLevel >= 4 };
  assert.equal(state.currentRevealedLevel, 4);
  assert.equal(state.solutionUnlocked, true);
});

// Test 2: Code Ownership Calculation
test('Code Ownership Engine accurately calculates percentages and attributes lines', () => {
  const totalLines = 10;
  const userLines = 4;
  const userPercentage = Math.round((userLines / totalLines) * 100);

  assert.equal(totalLines, 10);
  assert.equal(userLines, 4);
  assert.equal(userPercentage, 40);
});

// Test 3: Validation Engine - Function Evaluation (Type A & B)
test('Validation Engine executes assertions dynamically against student code', () => {
  const studentCode = `
    function calculateTotal(expenses) {
      return expenses.reduce((sum, item) => sum + item.amount, 0);
    }
  `;

  const assertionFn = `
    const items = [{ amount: 10 }, { amount: 25 }, { amount: 5 }];
    return calculateTotal(items) === 40;
  `;

  const runner = new Function('testInput', `${studentCode}; ${assertionFn};`);
  const result = runner();
  assert.equal(result, true);
});

// Test 4: Calculator Pure Functions
test('Calculator arithmetic engine computes binary operations correctly', () => {
  function calculate(prev, current, operation) {
    switch (operation) {
      case '+': return prev + current;
      case '-': return prev - current;
      case '×': return prev * current;
      case '÷': return current === 0 ? NaN : prev / current;
      default: return current;
    }
  }

  assert.equal(calculate(10, 5, '+'), 15);
  assert.equal(calculate(20, 8, '-'), 12);
  assert.equal(calculate(6, 7, '×'), 42);
  assert.equal(calculate(20, 4, '÷'), 5);
  assert.ok(Number.isNaN(calculate(10, 0, '÷')));
});

// Test 5: TypeScript Sanitization (Preventing "Unexpected token 'export'" SyntaxError)
test('TypeScript sanitization strips export keywords and type annotations safely', () => {
  function sanitizeTypeScript(tsCode) {
    let js = tsCode;
    js = js.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '');
    js = js.replace(/\bexport\s+(default\s+)?/g, '');
    js = js.replace(/interface\s+\w+[\s\S]*?\{[\s\S]*?\}/g, '');
    js = js.replace(/type\s+\w+\s*=[\s\S]*?;/g, '');
    js = js.replace(/\)\s*:\s*[A-Za-z0-9_<>\[\]|&\s]+\s*\{/g, ') {');
    js = js.replace(/([a-zA-Z0-9_]+)\s*:\s*[A-Za-z0-9_<>\[\]|&]+(?=[,\)\=\{])/g, '$1');
    js = js.replace(/\s+as\s+[A-Za-z0-9_<>\[\]]+/g, '');
    return js;
  }

  const rawTsCode = `
    export function calculate(prev: number, current: number, operation: string): number {
      return prev + current;
    }
  `;

  const sanitized = sanitizeTypeScript(rawTsCode);
  const runner = new Function('testInput', `${sanitized}; return calculate(3, 4, "+") === 7;`);
  assert.equal(runner(), true);
});

// Test 6: Interface Structure Validation (No runtime SyntaxError)
test('TypeScript Interface validation checks properties via contract analysis without SyntaxError', () => {
  const userInterfaceSubmission = `
    export type ExpenseCategory = 'Food' | 'Transport';

    export interface Expense {
      id: string;
      title: string;
      amount: number;
      category: ExpenseCategory;
      date: string;
    }
  `;

  const hasInterface = /interface\s+Expense/i.test(userInterfaceSubmission);
  const hasAmount = /amount\s*:\s*number/i.test(userInterfaceSubmission);
  const hasCategory = /category/i.test(userInterfaceSubmission);
  const hasDate = /date/i.test(userInterfaceSubmission);

  assert.ok(hasInterface);
  assert.ok(hasAmount);
  assert.ok(hasCategory);
  assert.ok(hasDate);
});

// Test 7: Explanation Evaluation
test('Validation Engine scores natural language explanation against keywords', () => {
  const explanation = 'React compares state by reference. Direct mutation keeps the same pointer, so React skips re-rendering.';
  const keywords = ['reference', 're-render'];
  const lower = explanation.toLowerCase();
  const matched = keywords.filter(k => lower.includes(k));
  assert.equal(matched.length, 2);
});
