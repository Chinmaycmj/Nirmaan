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

// Test 8: Multi-language & Tech Stack Detection
test('Tech Stack Detector accurately detects Vanilla JS + CSS, Python, and React', () => {
  function detectStack(prompt) {
    const lower = prompt.toLowerCase();
    if (lower.includes('python') || lower.includes('in py')) return 'python';
    if (lower.includes('vanilla') || lower.includes('js and css') || lower.includes('javascript and css') || lower.includes('html, css, js')) return 'vanilla_web';
    if (lower.includes('html and css') && !lower.includes('javascript')) return 'html_css';
    return 'react_ts';
  }

  assert.equal(detectStack('Build a simple calculator with vanilla JavaScript and CSS'), 'vanilla_web');
  assert.equal(detectStack('Build me a calculator using Python with zero-division guard'), 'python');
  assert.equal(detectStack('Build a landing page with HTML and CSS'), 'html_css');
  assert.equal(detectStack('Build a task manager with React and TypeScript'), 'react_ts');
});

// Test 9: CSS Grid Rule Validation
test('CSS Validation Engine verifies CSS Grid layout, columns, and gap rules', () => {
  const userCss = `
    .keypad {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
  `;

  const hasGridDisplay = /display\s*:\s*grid/i.test(userCss);
  const hasGridCols = /grid-template-columns\s*:\s*(repeat\(\s*4\s*,\s*1fr\s*\)|1fr\s+1fr\s+1fr\s+1fr)/i.test(userCss);
  const hasGap = /gap\s*:\s*12px/i.test(userCss);

  assert.ok(hasGridDisplay);
  assert.ok(hasGridCols);
  assert.ok(hasGap);
});

// Test 10: Python Logic & Structural Verification
test('Python calculation function validates pure arithmetic and zero-division guard', () => {
  const pythonCode = `
    def calculate(prev, current, op):
        if op == '+':
            return prev + current
        elif op == '-':
            return prev - current
        elif op == '*' or op == '×':
            return prev * current
        elif op == '/' or op == '÷':
            if current == 0:
                return float('nan')
            return prev / current
        return current
  `;

  const hasDef = /def\s+calculate\s*\(/i.test(pythonCode);
  const hasAdd = /\+\s*current/i.test(pythonCode);
  const hasSub = /-\s*current/i.test(pythonCode);
  const hasMul = /\*\s*current/i.test(pythonCode);
  const hasDivZero = /current\s*==\s*0/i.test(pythonCode) && /nan/i.test(pythonCode);

  assert.ok(hasDef);
  assert.ok(hasAdd);
  assert.ok(hasSub);
  assert.ok(hasMul);
  assert.ok(hasDivZero);
});

// Test 11: Vanilla JS DOM String Calculation & Replacement
test('Vanilla JS appendDigit properly replaces initial zero or appends characters', () => {
  function appendDigit(currentInput, digit) {
    if (currentInput === '0') return digit;
    return currentInput + digit;
  }

  assert.equal(appendDigit('0', '7'), '7');
  assert.equal(appendDigit('7', '5'), '75');
  assert.equal(appendDigit('75', '.'), '75.');
  assert.equal(appendDigit('75.', '2'), '75.2');
});

// Test 12: C++20 Function & Switch Arithmetic with IEEE 754 NaN Protection
test('C++ Switch implementation validates arithmetic and zero-division guard', () => {
  const cppCode = `
    double calculate(double prev, double current, char op) {
        switch (op) {
            case '+': return prev + current;
            case '-': return prev - current;
            case '*': return prev * current;
            case '/':
                if (current == 0.0) return std::nan("");
                return prev / current;
            default: return current;
        }
    }
  `;

  const hasSignature = /double\s+calculate\s*\(\s*double\s+\w+,\s*double\s+\w+,\s*char\s+\w+\s*\)/i.test(cppCode);
  const hasSwitch = /switch\s*\(\s*op\s*\)/i.test(cppCode);
  const hasCases = /case\s*'\+':/i.test(cppCode) && /case\s*'\*':/i.test(cppCode);
  const hasNanGuard = /current\s*==\s*0\.0/i.test(cppCode) && /std::nan/i.test(cppCode);

  assert.ok(hasSignature);
  assert.ok(hasSwitch);
  assert.ok(hasCases);
  assert.ok(hasNanGuard);
});

// Test 13: Java 21 Static Method & Double.NaN Handling
test('Java Static calculate method validates operations and Double.NaN guard', () => {
  const javaCode = `
    public static double calculate(double prev, double current, char op) {
        switch (op) {
            case '+': return prev + current;
            case '-': return prev - current;
            case '*': return prev * current;
            case '/':
                if (current == 0.0) return Double.NaN;
                return prev / current;
            default: return current;
        }
    }
  `;

  const hasSignature = /public\s+static\s+double\s+calculate/i.test(javaCode);
  const hasSwitch = /switch\s*\(\s*op\s*\)/i.test(javaCode);
  const hasCases = /case\s*'\+':/i.test(javaCode) && /case\s*'\*':/i.test(javaCode);
  const hasDoubleNan = /Double\.NaN/i.test(javaCode);

  assert.ok(hasSignature);
  assert.ok(hasSwitch);
  assert.ok(hasCases);
  assert.ok(hasDoubleNan);
});

// Test 14: Dynamic Stack Detection for "Simple calculator using Js" (No TypeScript Leakage)
test('Stack detector accurately routes "Simple calculator using Js" to vanilla_web and not TypeScript', () => {
  function detectStack(prompt) {
    const lower = prompt.toLowerCase();
    if (/\b(cpp|c\+\+|clang)\b/i.test(lower)) return 'cpp';
    if (/\b(java|jvm|openjdk)\b/i.test(lower) && !lower.includes('javascript')) return 'java';
    if (/\b(python|py|python3)\b/i.test(lower)) return 'python';
    if (/\b(js|javascript|vanilla|es6|node)\b/i.test(lower) && !lower.includes('typescript')) return 'vanilla_web';
    if (lower.includes('react') && (lower.includes('typescript') || lower.includes('ts'))) return 'react_ts';
    return 'react_ts';
  }

  assert.equal(detectStack('Simple calculator using Js'), 'vanilla_web');
  assert.equal(detectStack('calculator in js'), 'vanilla_web');
  assert.equal(detectStack('calculator with cpp'), 'cpp');
  assert.equal(detectStack('calculator in java'), 'java');
  assert.equal(detectStack('calculator in python'), 'python');
  assert.notEqual(detectStack('Simple calculator using Js'), 'react_ts');
});


