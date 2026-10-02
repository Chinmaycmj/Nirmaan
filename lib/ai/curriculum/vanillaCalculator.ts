import { Project } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone } from '@/types/learning';

export function createVanillaCalculatorProject(): {
  project: Project;
  checkpoints: LearningCheckpoint[];
  milestones: ProjectMilestone[];
} {
  const projectId = 'proj-vanilla-calc';

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Modern Calculator (Vanilla JS & CSS)</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="calculator-container">
    <div class="calculator">
      <div class="header">
        <span class="brand">NIRMAAN</span>
        <span class="badge">JS &bull; CSS</span>
      </div>

      <div class="display-container">
        <div class="history" id="history">&nbsp;</div>
        <div class="display" id="display">0</div>
      </div>

      <div class="keypad">
        <button class="btn btn-action" data-action="clear">AC</button>
        <button class="btn btn-action" data-action="plus-minus">±</button>
        <button class="btn btn-action" data-action="percent">%</button>
        <button class="btn btn-op" data-op="÷">÷</button>

        <button class="btn btn-num" data-num="7">7</button>
        <button class="btn btn-num" data-num="8">8</button>
        <button class="btn btn-num" data-num="9">9</button>
        <button class="btn btn-op" data-op="×">×</button>

        <button class="btn btn-num" data-num="4">4</button>
        <button class="btn btn-num" data-num="5">5</button>
        <button class="btn btn-num" data-num="6">6</button>
        <button class="btn btn-op" data-op="-">-</button>

        <button class="btn btn-num" data-num="1">1</button>
        <button class="btn btn-num" data-num="2">2</button>
        <button class="btn btn-num" data-num="3">3</button>
        <button class="btn btn-op" data-op="+">+</button>

        <button class="btn btn-num btn-zero" data-num="0">0</button>
        <button class="btn btn-num" data-num=".">.</button>
        <button class="btn btn-equals" data-action="equals">=</button>
      </div>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>`;

  const cssContent = `:root {
  --bg-color: #09090b;
  --panel-bg: #121216;
  --display-bg: #050507;
  --text-main: #f4f4f5;
  --text-muted: #71717a;
  --btn-num-bg: #1c1c22;
  --btn-num-hover: #272730;
  --btn-action-bg: #2e303d;
  --btn-action-hover: #3d4052;
  --accent-color: #f97316;
  --accent-hover: #fb923c;
  --border-color: #27272a;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-main);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.calculator-container {
  padding: 24px;
  width: 100%;
  max-width: 380px;
}

.calculator {
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-radius: 28px;
  padding: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.brand {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}

.badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
  background: rgba(249, 115, 22, 0.15);
  color: var(--accent-color);
  border: 1px solid rgba(249, 115, 22, 0.3);
}

.display-container {
  background: var(--display-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 24px;
  text-align: right;
  min-height: 96px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.history {
  font-size: 13px;
  font-family: monospace;
  color: var(--text-muted);
  min-height: 18px;
}

.display {
  font-size: 40px;
  font-weight: 700;
  font-family: monospace;
  color: var(--text-main);
  letter-spacing: -0.02em;
  overflow-x: auto;
  white-space: nowrap;
}

/* Checkpoint 1: Modern CSS Grid Layout */
.keypad {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.btn {
  border: none;
  outline: none;
  font-size: 18px;
  font-weight: 600;
  border-radius: 16px;
  height: 60px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn:active {
  transform: scale(0.96);
}

.btn-num {
  background: var(--btn-num-bg);
  color: var(--text-main);
}

.btn-num:hover {
  background: var(--btn-num-hover);
}

.btn-zero {
  grid-column: span 2;
  border-radius: 16px;
  justify-content: flex-start;
  padding-left: 24px;
}

.btn-action {
  background: var(--btn-action-bg);
  color: #e4e4e7;
}

.btn-action:hover {
  background: var(--btn-action-hover);
}

.btn-op {
  background: var(--accent-color);
  color: #ffffff;
  font-size: 22px;
}

.btn-op:hover {
  background: var(--accent-hover);
}

.btn-equals {
  background: #10b981;
  color: #ffffff;
  font-size: 22px;
}

.btn-equals:hover {
  background: #34d399;
}
`;

  const jsContent = `// Vanilla JavaScript Calculator Logic
let currentInput = '0';
let previousInput = null;
let currentOperation = null;
let resetOnNextDigit = false;

const displayEl = document.getElementById('display');
const historyEl = document.getElementById('history');

/**
 * Updates the calculator LCD display
 */
function updateDisplay(value) {
  if (displayEl) {
    displayEl.textContent = value;
  }
}

/**
 * Appends a digit to current input
 */
function appendDigit(digit) {
  if (currentInput === '0' || resetOnNextDigit) {
    currentInput = digit;
    resetOnNextDigit = false;
  } else {
    currentInput += digit;
  }
  updateDisplay(currentInput);
  return currentInput;
}

/**
 * Performs pure binary arithmetic
 */
function calculate(prev, current, op) {
  switch (op) {
    case '+': return prev + current;
    case '-': return prev - current;
    case '×': return prev * current;
    case '÷': return current === 0 ? NaN : prev / current;
    default: return current;
  }
}

/**
 * Handles operations (+, -, ×, ÷)
 */
function handleOperation(op) {
  const currentNum = parseFloat(currentInput);

  if (previousInput !== null && currentOperation && !resetOnNextDigit) {
    const result = calculate(previousInput, currentNum, currentOperation);
    currentInput = String(Number(result.toFixed(8)));
    updateDisplay(currentInput);
    previousInput = parseFloat(currentInput);
  } else {
    previousInput = currentNum;
  }

  currentOperation = op;
  resetOnNextDigit = true;
  if (historyEl) {
    historyEl.textContent = previousInput + ' ' + op;
  }
}

/**
 * Clears calculation state
 */
function clearAll() {
  currentInput = '0';
  previousInput = null;
  currentOperation = null;
  resetOnNextDigit = false;
  updateDisplay('0');
  if (historyEl) historyEl.innerHTML = '&nbsp;';
}

/**
 * Attach button click listeners
 */
document.querySelectorAll('.btn-num').forEach(button => {
  button.addEventListener('click', () => {
    const num = button.getAttribute('data-num');
    if (num === '.' && currentInput.includes('.')) return;
    appendDigit(num);
  });
});

document.querySelectorAll('.btn-op').forEach(button => {
  button.addEventListener('click', () => {
    const op = button.getAttribute('data-op');
    handleOperation(op);
  });
});

document.querySelectorAll('.btn-action').forEach(button => {
  button.addEventListener('click', () => {
    const action = button.getAttribute('data-action');
    if (action === 'clear') {
      clearAll();
    } else if (action === 'plus-minus') {
      currentInput = String(parseFloat(currentInput) * -1);
      updateDisplay(currentInput);
    } else if (action === 'percent') {
      currentInput = String(parseFloat(currentInput) / 100);
      updateDisplay(currentInput);
    }
  });
});

const equalsBtn = document.querySelector('.btn-equals');
if (equalsBtn) {
  equalsBtn.addEventListener('click', () => {
    if (previousInput === null || !currentOperation) return;
    const currentNum = parseFloat(currentInput);
    const result = calculate(previousInput, currentNum, currentOperation);
    if (historyEl) {
      historyEl.textContent = previousInput + ' ' + currentOperation + ' ' + currentNum + ' =';
    }
    currentInput = String(Number(result.toFixed(8)));
    updateDisplay(currentInput);
    previousInput = null;
    currentOperation = null;
    resetOnNextDigit = true;
  });
}
`;

  const project: Project = {
    id: projectId,
    name: 'Vanilla JS & CSS Calculator',
    description: 'Modern desktop calculator built with standard HTML5, CSS Grid & Flexbox, and pure ES6 JavaScript.',
    techStack: {
      frontend: 'Vanilla Web Standards',
      language: 'JavaScript + CSS',
      styling: 'Pure CSS3',
    },
    interventionLevel: 'guided',
    currentStage: 'Stage 1: Core Layout & Math',
    activeFileId: 'style-css',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    files: [
      {
        id: 'index-html',
        projectId,
        path: 'index.html',
        name: 'index.html',
        language: 'html',
        content: htmlContent,
        version: 1,
        contributions: [
          {
            id: 'c1',
            fileId: 'index-html',
            startLine: 1,
            endLine: 50,
            authorType: 'AI_GENERATED',
            timestamp: Date.now(),
          },
        ],
      },
      {
        id: 'style-css',
        projectId,
        path: 'style.css',
        name: 'style.css',
        language: 'css',
        content: cssContent,
        version: 1,
        contributions: [
          {
            id: 'c2',
            fileId: 'style-css',
            startLine: 1,
            endLine: 120,
            authorType: 'AI_GENERATED',
            timestamp: Date.now(),
          },
        ],
      },
      {
        id: 'script-js',
        projectId,
        path: 'script.js',
        name: 'script.js',
        language: 'javascript',
        content: jsContent,
        version: 1,
        contributions: [
          {
            id: 'c3',
            fileId: 'script-js',
            startLine: 1,
            endLine: 110,
            authorType: 'AI_GENERATED',
            timestamp: Date.now(),
          },
        ],
      },
    ],
  };

  const checkpoints: LearningCheckpoint[] = [
    {
      id: 'step-1-css-grid',
      projectId,
      stepNumber: 1,
      title: 'CSS Grid: Build the 4-Column Keypad',
      conceptId: 'css_grid_layout',
      conceptName: 'CSS Grid Layout',
      taskType: 'COMPLETE_CODE',
      prompt: 'Configure `.keypad` using modern CSS Grid with 4 equal-width columns and a 12px gap between buttons.',
      contextExplanation: 'CSS Grid is the native standard for two-dimensional interfaces, allowing you to position rows and columns without external libraries or float hacks.',
      realLifeExample: 'Think of an ice cube tray or an egg carton. Instead of measuring and balancing each individual button with delicate manual spacers, the grid defines 4 equal-width slots automatically. When buttons are placed inside, they effortlessly snap into clean rows and columns!',
      language: 'css',
      targetFileId: 'style-css',
      initialCode: `.keypad {
  /* COMPLETE CSS GRID RULES HERE */
}`,
      solutionCode: `.keypad {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}`,
      testCases: [
        {
          id: 'test-grid-display',
          description: 'Uses display: grid',
        },
        {
          id: 'test-grid-columns',
          description: 'Defines 4 equal columns using repeat(4, 1fr) or 1fr 1fr 1fr 1fr',
        },
        {
          id: 'test-grid-gap',
          description: 'Applies gap: 12px',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Understanding CSS Grid',
          content: 'CSS Grid turns the `.keypad` container into a grid formatting context where child buttons automatically flow into cells.',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Grid Columns Property',
          content: 'Use `grid-template-columns` with the `repeat()` helper or four `1fr` units.',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Exact Syntax',
          content: 'Set `display: grid;`, `grid-template-columns: repeat(4, 1fr);`, and `gap: 12px;`.',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Full CSS Snippet',
          content: `.keypad {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 12px;\n}`,
        },
      ],
      status: 'IN_PROGRESS',
      attempts: 0,
      hintsUsed: 0,
    },
    {
      id: 'step-2-js-dom',
      projectId,
      stepNumber: 2,
      title: 'JavaScript DOM: Append Input Digits',
      conceptId: 'dom_manipulation',
      conceptName: 'DOM Manipulation & String State',
      taskType: 'COMPLETE_CODE',
      language: 'javascript',
      prompt: 'Complete `appendDigit(currentInput, digit)` so that if `currentInput` is "0", it returns `digit`; otherwise it appends the new digit to the string.',
      contextExplanation: 'In vanilla JavaScript, updating the UI requires manipulating element textContent and maintaining input strings in memory.',
      realLifeExample: 'Think of a restaurant order whiteboard. When the chef starts a new order, they wipe off the previous dummy order "0" and write "7". As new customer requests come in, they write them side-by-side ("75"). The kitchen staff immediately reads the board to prepare the order!',
      targetFileId: 'script-js',
      initialCode: `function appendDigit(currentInput, digit) {
  // YOUR CODE HERE
}`,
      solutionCode: `function appendDigit(currentInput, digit) {
  if (currentInput === '0') {
    return digit;
  }
  return currentInput + digit;
}`,
      testCases: [
        {
          id: 'test-replace-zero',
          description: 'Replaces initial "0" with single digit e.g. appendDigit("0", "7") === "7"',
          assertionFn: 'return appendDigit("0", "7") === "7";',
        },
        {
          id: 'test-append-digits',
          description: 'Concatenates consecutive digits e.g. appendDigit("4", "2") === "42"',
          assertionFn: 'return appendDigit("4", "2") === "42";',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Zero Replacement',
          content: 'Calculators should never display "07" when you type 7. If the current value is "0", replace it.',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Conditional Check',
          content: 'Use an `if (currentInput === "0")` check to return `digit`.',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Concatenation',
          content: 'Return `currentInput + digit` when currentInput is not "0".',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Complete Function',
          content: `function appendDigit(currentInput, digit) {\n  if (currentInput === '0') return digit;\n  return currentInput + digit;\n}`,
        },
      ],
      status: 'PENDING',
      attempts: 0,
      hintsUsed: 0,
    },
    {
      id: 'step-3-pure-math',
      projectId,
      stepNumber: 3,
      title: 'JavaScript Arithmetic: Binary Operators',
      conceptId: 'functions_parameters',
      conceptName: 'Pure Calculation Functions',
      taskType: 'COMPLETE_CODE',
      language: 'javascript',
      prompt: 'Implement `calculate(prev, current, op)` using a switch statement supporting +, -, ×, and ÷. Guard against division by zero by returning NaN.',
      contextExplanation: 'Pure functions decouple arithmetic logic from browser DOM events, making your application easily testable and bug-free.',
      realLifeExample: 'Think of a coffee vending machine: you insert coins (parameters `prev`), choose a flavor (operator `op`), and press brew (`calculate`). The machine pours your cup (`return`) without spilling coffee on the counter (pure function, no side effects)!',
      targetFileId: 'script-js',
      initialCode: `function calculate(prev, current, op) {
  // YOUR CODE HERE
}`,
      solutionCode: `function calculate(prev, current, op) {
  switch (op) {
    case '+': return prev + current;
    case '-': return prev - current;
    case '×': return prev * current;
    case '÷': return current === 0 ? NaN : prev / current;
    default: return current;
  }
}`,
      testCases: [
        {
          id: 'test-add',
          description: 'Calculates addition (15 + 25 = 40)',
          assertionFn: 'return calculate(15, 25, "+") === 40;',
        },
        {
          id: 'test-multiply',
          description: 'Calculates multiplication (7 × 8 = 56)',
          assertionFn: 'return calculate(7, 8, "×") === 56;',
        },
        {
          id: 'test-divide-zero',
          description: 'Safely returns NaN on division by zero',
          assertionFn: 'return Number.isNaN(calculate(10, 0, "÷"));',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Pure Operator Mapping',
          content: 'Map operator strings "+", "-", "×", "÷" to standard JavaScript arithmetic operators.',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Zero Division Check',
          content: 'For division, check if `current === 0` and return `NaN` to prevent infinity errors.',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Switch Statement',
          content: 'Use `switch (op) { case "+": return prev + current; ... }`.',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Full Implementation',
          content: `function calculate(prev, current, op) {\n  switch (op) {\n    case '+': return prev + current;\n    case '-': return prev - current;\n    case '×': return prev * current;\n    case '÷': return current === 0 ? NaN : prev / current;\n    default: return current;\n  }\n}`,
        },
      ],
      status: 'PENDING',
      attempts: 0,
      hintsUsed: 0,
    },
  ];

  const milestones: ProjectMilestone[] = [
    {
      id: 'm1',
      projectId,
      stepNumber: 1,
      title: 'CSS Grid Layout',
      description: 'Defined the 4-column responsive keypad layout.',
      conceptName: 'CSS Grid',
      timestamp: Date.now(),
      targetFile: 'style.css',
      completed: false,
    },
    {
      id: 'm2',
      projectId,
      stepNumber: 2,
      title: 'DOM Event Handling',
      description: 'Connected button clicks to LCD display text updates.',
      conceptName: 'DOM Manipulation',
      timestamp: Date.now(),
      targetFile: 'script.js',
      completed: false,
    },
    {
      id: 'm3',
      projectId,
      stepNumber: 3,
      title: 'Arithmetic Computation',
      description: 'Pure function calculations with division by zero guard.',
      conceptName: 'Pure Functions',
      timestamp: Date.now(),
      targetFile: 'script.js',
      completed: false,
    },
  ];

  return { project, checkpoints, milestones };
}
