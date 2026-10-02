import { Project, ProjectFile } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone } from '@/types/learning';

export function createCalculatorProject(): {
  project: Project;
  checkpoints: LearningCheckpoint[];
  milestones: ProjectMilestone[];
} {
  const files: ProjectFile[] = [
    {
      id: 'file-calc-types',
      projectId: 'proj-calculator',
      path: 'src/types.ts',
      name: 'types.ts',
      language: 'typescript',
      version: 1,
      content: `export type OperationType = '+' | '-' | '×' | '÷' | null;

export interface CalculatorState {
  currentValue: string;
  previousValue: string | null;
  operation: OperationType;
  overwrite: boolean;
}
`,
      contributions: [
        {
          id: 'c-1',
          fileId: 'file-calc-types',
          startLine: 1,
          endLine: 10,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
    {
      id: 'file-calc-utils',
      projectId: 'proj-calculator',
      path: 'src/utils/calculator.ts',
      name: 'calculator.ts',
      language: 'typescript',
      version: 1,
      content: `import { OperationType } from '../types';

/**
 * Executes a basic binary arithmetic operation.
 */
export function calculate(prev: number, current: number, operation: OperationType): number {
  switch (operation) {
    case '+':
      return prev + current;
    case '-':
      return prev - current;
    case '×':
      return prev * current;
    case '÷':
      if (current === 0) {
        return NaN; // Handle division by zero
      }
      return prev / current;
    default:
      return current;
  }
}

/**
 * Formats a number with commas and prevents floating point weirdness (e.g. 0.1 + 0.2).
 */
export function formatDisplay(value: string): string {
  if (value === 'Error' || value === 'NaN' || value === 'Infinity') return 'Error';
  const parts = value.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  const formattedInteger = parseFloat(integerPart).toLocaleString('en-US');
  if (isNaN(parseFloat(integerPart))) return '0';

  if (decimalPart !== undefined) {
    return \`\${formattedInteger}.\${decimalPart}\`;
  }
  return formattedInteger;
}
`,
      contributions: [
        {
          id: 'c-2',
          fileId: 'file-calc-utils',
          startLine: 1,
          endLine: 45,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
    {
      id: 'file-calc-display',
      projectId: 'proj-calculator',
      path: 'src/components/Display.tsx',
      name: 'Display.tsx',
      language: 'tsx',
      version: 1,
      content: `import React from 'react';
import { OperationType } from '../types';
import { formatDisplay } from '../utils/calculator';

interface DisplayProps {
  currentValue: string;
  previousValue: string | null;
  operation: OperationType;
}

export const Display: React.FC<DisplayProps> = ({
  currentValue,
  previousValue,
  operation,
}) => {
  return (
    <div className="bg-slate-900 text-right p-6 rounded-2xl mb-4 border border-slate-800 shadow-inner">
      {/* Previous value and operation history indicator */}
      <div className="text-slate-400 text-sm font-mono h-6 flex items-center justify-end space-x-2">
        {previousValue !== null && (
          <span>
            {formatDisplay(previousValue)} {operation}
          </span>
        )}
      </div>

      {/* Main calculation output value */}
      <div className="text-white text-4xl md:text-5xl font-mono font-bold tracking-tight mt-1 overflow-x-auto whitespace-nowrap scrollbar-none">
        {formatDisplay(currentValue)}
      </div>
    </div>
  );
};
`,
      contributions: [
        {
          id: 'c-3',
          fileId: 'file-calc-display',
          startLine: 1,
          endLine: 35,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
    {
      id: 'file-calc-keypad',
      projectId: 'proj-calculator',
      path: 'src/components/Keypad.tsx',
      name: 'Keypad.tsx',
      language: 'tsx',
      version: 1,
      content: `import React from 'react';
import { OperationType } from '../types';

interface KeypadProps {
  onDigit: (digit: string) => void;
  onOperation: (op: OperationType) => void;
  onClear: () => void;
  onDelete: () => void;
  onEquals: () => void;
}

export const Keypad: React.FC<KeypadProps> = ({
  onDigit,
  onOperation,
  onClear,
  onDelete,
  onEquals,
}) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {/* Row 1 */}
      <button
        onClick={onClear}
        className="col-span-2 py-4 bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold rounded-xl transition-all active:scale-95 text-lg border border-slate-700"
      >
        AC
      </button>
      <button
        onClick={onDelete}
        className="py-4 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl transition-all active:scale-95 text-lg border border-slate-700"
      >
        DEL
      </button>
      <button
        onClick={() => onOperation('÷')}
        className="py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all active:scale-95 text-xl shadow-md shadow-indigo-600/30"
      >
        ÷
      </button>

      {/* Row 2 */}
      <button
        onClick={() => onDigit('7')}
        className="py-4 bg-slate-850 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all active:scale-95 text-xl border border-slate-800"
      >
        7
      </button>
      <button
        onClick={() => onDigit('8')}
        className="py-4 bg-slate-850 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all active:scale-95 text-xl border border-slate-800"
      >
        8
      </button>
      <button
        onClick={() => onDigit('9')}
        className="py-4 bg-slate-850 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all active:scale-95 text-xl border border-slate-800"
      >
        9
      </button>
      <button
        onClick={() => onOperation('×')}
        className="py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all active:scale-95 text-xl shadow-md shadow-indigo-600/30"
      >
        ×
      </button>

      {/* Row 3 */}
      <button
        onClick={() => onDigit('4')}
        className="py-4 bg-slate-850 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all active:scale-95 text-xl border border-slate-800"
      >
        4
      </button>
      <button
        onClick={() => onDigit('5')}
        className="py-4 bg-slate-850 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all active:scale-95 text-xl border border-slate-800"
      >
        5
      </button>
      <button
        onClick={() => onDigit('6')}
        className="py-4 bg-slate-850 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all active:scale-95 text-xl border border-slate-800"
      >
        6
      </button>
      <button
        onClick={() => onOperation('-')}
        className="py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all active:scale-95 text-xl shadow-md shadow-indigo-600/30"
      >
        -
      </button>

      {/* Row 4 */}
      <button
        onClick={() => onDigit('1')}
        className="py-4 bg-slate-850 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all active:scale-95 text-xl border border-slate-800"
      >
        1
      </button>
      <button
        onClick={() => onDigit('2')}
        className="py-4 bg-slate-850 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all active:scale-95 text-xl border border-slate-800"
      >
        2
      </button>
      <button
        onClick={() => onDigit('3')}
        className="py-4 bg-slate-850 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all active:scale-95 text-xl border border-slate-800"
      >
        3
      </button>
      <button
        onClick={() => onOperation('+')}
        className="py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all active:scale-95 text-xl shadow-md shadow-indigo-600/30"
      >
        +
      </button>

      {/* Row 5 */}
      <button
        onClick={() => onDigit('0')}
        className="col-span-2 py-4 bg-slate-850 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all active:scale-95 text-xl border border-slate-800"
      >
        0
      </button>
      <button
        onClick={() => onDigit('.')}
        className="py-4 bg-slate-850 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all active:scale-95 text-xl border border-slate-800"
      >
        .
      </button>
      <button
        onClick={onEquals}
        className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all active:scale-95 text-xl shadow-md shadow-emerald-600/30"
      >
        =
      </button>
    </div>
  );
};
`,
      contributions: [
        {
          id: 'c-4',
          fileId: 'file-calc-keypad',
          startLine: 1,
          endLine: 120,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
    {
      id: 'file-calc-app',
      projectId: 'proj-calculator',
      path: 'src/App.tsx',
      name: 'App.tsx',
      language: 'tsx',
      version: 1,
      content: `import React, { useState } from 'react';
import { OperationType } from './types';
import { calculate } from './utils/calculator';
import { Display } from './components/Display';
import { Keypad } from './components/Keypad';

export default function App() {
  const [currentValue, setCurrentValue] = useState<string>('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<OperationType>(null);
  const [overwrite, setOverwrite] = useState<boolean>(false);

  const handleDigit = (digit: string) => {
    if (overwrite) {
      setCurrentValue(digit === '.' ? '0.' : digit);
      setOverwrite(false);
      return;
    }

    // Prevent multiple decimals
    if (digit === '.' && currentValue.includes('.')) {
      return;
    }

    if (currentValue === '0' && digit !== '.') {
      setCurrentValue(digit);
    } else {
      setCurrentValue(prev => prev + digit);
    }
  };

  const handleOperation = (op: OperationType) => {
    if (currentValue === '0' && previousValue === null) return;

    if (previousValue !== null && operation !== null && !overwrite) {
      const prev = parseFloat(previousValue);
      const curr = parseFloat(currentValue);
      const result = calculate(prev, curr, operation);
      setPreviousValue(result.toString());
      setCurrentValue(result.toString());
    } else {
      setPreviousValue(currentValue);
    }

    setOperation(op);
    setOverwrite(true);
  };

  const handleEquals = () => {
    if (previousValue === null || operation === null) return;

    const prev = parseFloat(previousValue);
    const curr = parseFloat(currentValue);
    const result = calculate(prev, curr, operation);

    setCurrentValue(result.toString());
    setPreviousValue(null);
    setOperation(null);
    setOverwrite(true);
  };

  const handleClear = () => {
    setCurrentValue('0');
    setPreviousValue(null);
    setOperation(null);
    setOverwrite(false);
  };

  const handleDelete = () => {
    if (overwrite) {
      setCurrentValue('0');
      setOverwrite(false);
      return;
    }
    if (currentValue.length <= 1) {
      setCurrentValue('0');
    } else {
      setCurrentValue(prev => prev.slice(0, -1));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <header className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          </div>
          <span className="text-xs font-semibold text-slate-400 font-mono">Modern Calculator</span>
        </header>

        <Display
          currentValue={currentValue}
          previousValue={previousValue}
          operation={operation}
        />

        <Keypad
          onDigit={handleDigit}
          onOperation={handleOperation}
          onClear={handleClear}
          onDelete={handleDelete}
          onEquals={handleEquals}
        />
      </div>
    </div>
  );
}
`,
      contributions: [
        {
          id: 'c-5',
          fileId: 'file-calc-app',
          startLine: 1,
          endLine: 110,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
  ];

  const checkpoints: LearningCheckpoint[] = [
    {
      id: 'chk-calc-1',
      projectId: 'proj-calculator',
      stepNumber: 1,
      title: 'Implement the Arithmetic Engine',
      conceptId: 'functions_parameters',
      conceptName: 'Arithmetic Execution & Switch Cases',
      taskType: 'COMPLETE_CODE',
      targetFileId: 'file-calc-utils',
      prompt: 'Complete the `calculate(prev, current, operation)` function in `src/utils/calculator.ts`. Handle arithmetic operations: `+`, `-`, `×` (multiplication), and `÷` (division). Return `NaN` if division by zero occurs.',
      contextExplanation: 'Every calculator needs a pure computational engine decoupled from user interface rendering. Pure functions take inputs and return results with zero side effects, making them easy to unit test.',
      initialCode: `function calculate(prev, current, operation) {
  // YOUR CODE: Handle '+', '-', '×', '÷' and return the result
}
`,
      solutionCode: `function calculate(prev, current, operation) {
  switch (operation) {
    case '+': return prev + current;
    case '-': return prev - current;
    case '×': return prev * current;
    case '÷': return current === 0 ? NaN : prev / current;
    default: return current;
  }
}
`,
      testCases: [
        {
          id: 'tc-c1-1',
          description: 'Calculates basic addition (12 + 8 = 20)',
          assertionFn: 'return calculate(12, 8, "+") === 20;',
        },
        {
          id: 'tc-c1-2',
          description: 'Calculates multiplication (6 × 7 = 42)',
          assertionFn: 'return calculate(6, 7, "×") === 42;',
        },
        {
          id: 'tc-c1-3',
          description: 'Handles division by zero gracefully (returns NaN)',
          assertionFn: 'return Number.isNaN(calculate(10, 0, "÷"));',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Operation Dispatching',
          content: 'A `switch (operation)` or `if/else` block checks which operator was clicked and returns the calculated math.',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Division by Zero Guard',
          content: 'Before dividing `prev / current`, check `if (current === 0) return NaN;`.',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Switch Case Pattern',
          content: `switch (operation) {
  case '+': return prev + current;
  case '-': return prev - current;
  case '×': return prev * current;
  case '÷': return current === 0 ? NaN : prev / current;
  default: return current;
}`,
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Complete Function Structure',
          content: `function calculate(prev, current, operation) {
  switch (operation) {
    case '+': return prev + current;
    case '-': return prev - current;
    case '×': return prev * current;
    case '÷': return current === 0 ? NaN : prev / current;
    default: return current;
  }
}`,
        },
      ],
      status: 'IN_PROGRESS',
      attempts: 0,
      hintsUsed: 0,
      whatChangedInPreview: 'The calculation engine is now connected! Pressing "=" computes the exact result.',
    },
    {
      id: 'chk-calc-2',
      projectId: 'proj-calculator',
      stepNumber: 2,
      title: 'Fix Decimal Point Duplication Bug',
      conceptId: 'state_immutability',
      conceptName: 'String Validation & State Guard Clauses',
      taskType: 'FIX_BUG',
      targetFileId: 'file-calc-app',
      prompt: 'A common bug in calculator apps is allowing multiple decimal points (e.g. typing "3.14.15"). Fix the `appendDecimal` function so it only appends "." if the number does not already contain a decimal point.',
      contextExplanation: 'User input must always be validated before updating application state. Preventing invalid numeric formats at the input boundary prevents downstream math errors.',
      brokenCode: `function appendDecimal(currentValue) {
  // BUG: Blindly appends "." even if one already exists
  return currentValue + '.';
}
`,
      solutionCode: `function appendDecimal(currentValue) {
  if (currentValue.includes('.')) {
    return currentValue;
  }
  return currentValue + '.';
}
`,
      testCases: [
        {
          id: 'tc-c2-1',
          description: 'Adds decimal point when none exists',
          assertionFn: 'return appendDecimal("42") === "42.";',
        },
        {
          id: 'tc-c2-2',
          description: 'Does not add duplicate decimal point when already present',
          assertionFn: 'return appendDecimal("3.14") === "3.14";',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Check String Contents',
          content: 'JavaScript strings have an `.includes()` method to check if a character exists.',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Early Return Guard',
          content: 'If `currentValue.includes(".")` is true, immediately return `currentValue` without appending anything.',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Condition Syntax',
          content: '`if (currentValue.includes(".")) return currentValue; return currentValue + ".";`',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Full Function Solution',
          content: `function appendDecimal(currentValue) {
  if (currentValue.includes('.')) {
    return currentValue;
  }
  return currentValue + '.';
}`,
        },
      ],
      status: 'PENDING',
      attempts: 0,
      hintsUsed: 0,
      whatChangedInPreview: 'Typing "." multiple times now safely limits numbers to valid floating points!',
    },
    {
      id: 'chk-calc-3',
      projectId: 'proj-calculator',
      stepNumber: 3,
      title: 'Explain: Why Does 0.1 + 0.2 !== 0.3 in JavaScript?',
      conceptId: 'variables_types',
      conceptName: 'IEEE 754 Floating Point Representation',
      taskType: 'EXPLAIN_CODE',
      targetFileId: 'file-calc-utils',
      prompt: 'If you type `0.1 + 0.2` into standard JavaScript, it outputs `0.30000000000000004`. In your own words, explain why binary computers experience this rounding quirk and how a calculator display should handle it.',
      contextExplanation: 'Computers store numbers in base-2 (binary). Just as 1/3 cannot be written as a finite decimal in base-10 (0.3333...), fractions like 1/10 cannot be written as finite binary numbers, causing tiny precision artifacts.',
      solutionCode: 'Computers represent floating point numbers using binary IEEE 754 format. Fractions like 0.1 have repeating binary representations that cannot be stored with infinite precision, leading to small rounding discrepancies that require formatting with precision limits or rounding.',
      expectedKeywords: ['binary', 'floating', 'precision', 'rounding', 'representation'],
      rubricCriteria: [
        'Explains that computers use binary representation',
        'Mentions finite precision or repeating binary decimals',
        'Notes the need for rounding or formatting',
      ],
      testCases: [
        {
          id: 'tc-c3-1',
          description: 'Explains binary floating point representation and precision',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Base 2 vs Base 10',
          content: 'Think about how 1/3 is repeating in base 10 (0.333...). Can 1/10 be written finitely in base 2 (binary)?',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Key Terms to Mention',
          content: 'Mention "binary", "floating point", "precision", and "rounding".',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Concept Explanation',
          content: 'Explain how finite computer memory cannot store infinite repeating binary fractions, creating tiny rounding artifacts.',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Summary Points',
          content: 'Computers store numbers in binary IEEE 754 floating point. Numbers like 0.1 and 0.2 are infinite repeating fractions in binary, causing tiny precision errors when added, which we fix with precision formatting.',
        },
      ],
      status: 'PENDING',
      attempts: 0,
      hintsUsed: 0,
      whatChangedInPreview: 'Display formatting rounding rules verified!',
    },
    {
      id: 'chk-calc-4',
      projectId: 'proj-calculator',
      stepNumber: 4,
      title: 'Predict Output: Chained Operation State',
      conceptId: 'react_state',
      conceptName: 'Sequential State Updates & Execution Order',
      taskType: 'PREDICT_OUTPUT',
      targetFileId: 'file-calc-app',
      prompt: 'Suppose a user presses the following sequence of keys on the calculator:\n`[ 8 ]` &rarr; `[ + ]` &rarr; `[ 4 ]` &rarr; `[ ÷ ]`\nWhat will be stored in `previousValue` right after pressing `[ ÷ ]`?',
      contextExplanation: 'When chaining operations without pressing equals, standard calculators evaluate the pending previous operation first (8 + 4 = 12) and store the result as the new previous value.',
      solutionCode: '12',
      multipleChoiceOptions: [
        {
          id: 'opt-a',
          text: '"12" (It computes 8 + 4 before preparing for division)',
          isCorrect: true,
          explanation: 'Chained operators execute the pending calculation first: 8 + 4 evaluates to 12 and becomes the previous value.',
        },
        {
          id: 'opt-b',
          text: '"4" (It only keeps the latest entered number)',
          isCorrect: false,
          explanation: 'If it only kept 4, the earlier "8 +" operation would be lost.',
        },
        {
          id: 'opt-c',
          text: '"8" (It ignores subsequent operations until equals is pressed)',
          isCorrect: false,
          explanation: 'Pressing a new operator triggers evaluation of the existing pending operator.',
        },
        {
          id: 'opt-d',
          text: 'null',
          isCorrect: false,
          explanation: 'Previous value is retained to complete the binary arithmetic.',
        },
      ],
      testCases: [
        {
          id: 'tc-c4-1',
          description: 'Correctly predicts chained operator evaluation',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Chained Operator Behavior',
          content: 'When you have a pending operation `8 + 4` and press `÷`, the calculator computes `8 + 4` first.',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Pending Operation',
          content: '8 + 4 = 12.',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Result Value',
          content: '12 is stored as the new previous value.',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Direct Option',
          content: 'Select Option A: "12".',
        },
      ],
      status: 'PENDING',
      attempts: 0,
      hintsUsed: 0,
      whatChangedInPreview: 'Chained operations sequence verified across all operator keys!',
    },
  ];

  const milestones: ProjectMilestone[] = [
    {
      id: 'm-calc-1',
      projectId: 'proj-calculator',
      stepNumber: 1,
      title: 'Scaffolded Calculator Layout',
      description: 'AI generated display component, grid keypad, and state schema.',
      conceptName: 'React Components',
      timestamp: Date.now() - 3600000,
      targetFile: 'src/App.tsx',
      completed: true,
    },
    {
      id: 'm-calc-2',
      projectId: 'proj-calculator',
      stepNumber: 2,
      title: 'Built Arithmetic Engine',
      description: 'Implemented pure calculate function with switch cases.',
      conceptName: 'Arithmetic Execution',
      timestamp: Date.now() - 2400000,
      targetFile: 'src/utils/calculator.ts',
      completed: false,
    },
    {
      id: 'm-calc-3',
      projectId: 'proj-calculator',
      stepNumber: 3,
      title: 'Input Validation & Edge Cases',
      description: 'Fixed multiple decimal point bug and division by zero.',
      conceptName: 'Input Validation',
      timestamp: Date.now() - 1200000,
      targetFile: 'src/App.tsx',
      completed: false,
    },
    {
      id: 'm-calc-4',
      projectId: 'proj-calculator',
      stepNumber: 4,
      title: 'Precision & Chained States',
      description: 'Understood floating point formatting and sequential state transitions.',
      conceptName: 'Precision Formatting',
      timestamp: Date.now() - 600000,
      targetFile: 'src/components/Display.tsx',
      completed: false,
    },
  ];

  const project: Project = {
    id: 'proj-calculator',
    name: 'Modern Precision Calculator',
    description: 'An interactive arithmetic calculator built with React 18 and TypeScript to learn pure math functions, input edge cases, and state flow.',
    techStack: {
      frontend: 'React 18',
      language: 'TypeScript',
      styling: 'Tailwind CSS',
    },
    interventionLevel: 'guided',
    currentStage: 'Building Calculation Logic & State Handling',
    activeFileId: 'file-calc-utils',
    files,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now(),
  };

  return { project, checkpoints, milestones };
}
