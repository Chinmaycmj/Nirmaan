import { Project, ProjectFile } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone } from '@/types/learning';

export function createExpenseTrackerProject(): {
  project: Project;
  checkpoints: LearningCheckpoint[];
  milestones: ProjectMilestone[];
} {
  const files: ProjectFile[] = [
    {
      id: 'file-types',
      projectId: 'proj-expense-tracker',
      path: 'src/types.ts',
      name: 'types.ts',
      language: 'typescript',
      version: 1,
      content: `export type ExpenseCategory = 'Food' | 'Transport' | 'Housing' | 'Entertainment' | 'Utilities';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
}
`,
      contributions: [
        {
          id: 'c-1',
          fileId: 'file-types',
          startLine: 1,
          endLine: 10,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
    {
      id: 'file-summary',
      projectId: 'proj-expense-tracker',
      path: 'src/components/SummaryCards.tsx',
      name: 'SummaryCards.tsx',
      language: 'tsx',
      version: 1,
      content: `import React from 'react';
import { Expense } from '../types';

interface SummaryCardsProps {
  expenses: Expense[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ expenses }) => {
  // Calculate total amount spent across all expenses
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);

  // Find the highest single expense
  const highestExpense = expenses.length > 0 
    ? Math.max(...expenses.map(e => e.amount))
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Expenses</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">\${totalSpent.toFixed(2)}</p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transactions Count</p>
        <p className="text-2xl font-bold text-indigo-600 mt-1">{expenses.length}</p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Largest Expense</p>
        <p className="text-2xl font-bold text-emerald-600 mt-1">\${highestExpense.toFixed(2)}</p>
      </div>
    </div>
  );
};
`,
      contributions: [
        {
          id: 'c-2',
          fileId: 'file-summary',
          startLine: 1,
          endLine: 40,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
    {
      id: 'file-form',
      projectId: 'proj-expense-tracker',
      path: 'src/components/ExpenseForm.tsx',
      name: 'ExpenseForm.tsx',
      language: 'tsx',
      version: 1,
      content: `import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../types';

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    onAddExpense({
      title,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString().split('T')[0],
    });

    setTitle('');
    setAmount('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Add New Expense</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Expense Title</label>
          <input
            type="text"
            placeholder="e.g. Grocery Store"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Amount ($)</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Housing">Housing</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Utilities">Utilities</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          + Add Expense
        </button>
      </div>
    </form>
  );
};
`,
      contributions: [
        {
          id: 'c-3',
          fileId: 'file-form',
          startLine: 1,
          endLine: 85,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
    {
      id: 'file-list',
      projectId: 'proj-expense-tracker',
      path: 'src/components/ExpenseList.tsx',
      name: 'ExpenseList.tsx',
      language: 'tsx',
      version: 1,
      content: `import React from 'react';
import { Expense } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDeleteExpense }) => {
  if (expenses.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
        <p className="text-slate-500 text-sm">No expenses recorded yet. Add your first expense above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800">Recent Transactions</h3>
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
          {expenses.length} item{expenses.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {expenses.map((expense) => (
          <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                {expense.category[0]}
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{expense.title}</p>
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <span>{expense.category}</span>
                  <span>•</span>
                  <span>{expense.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="font-bold text-slate-900 text-sm">
                \${expense.amount.toFixed(2)}
              </span>
              <button
                onClick={() => onDeleteExpense(expense.id)}
                className="text-slate-400 hover:text-red-500 text-xs px-2 py-1 rounded transition-colors"
                title="Delete Expense"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
`,
      contributions: [
        {
          id: 'c-4',
          fileId: 'file-list',
          startLine: 1,
          endLine: 65,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
    {
      id: 'file-app',
      projectId: 'proj-expense-tracker',
      path: 'src/App.tsx',
      name: 'App.tsx',
      language: 'tsx',
      version: 1,
      content: `import React, { useState } from 'react';
import { Expense } from './types';
import { SummaryCards } from './components/SummaryCards';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', title: 'Coffee & Snacks', amount: 8.50, category: 'Food', date: '2026-10-01' },
    { id: '2', title: 'Subway Pass', amount: 45.00, category: 'Transport', date: '2026-10-02' },
    { id: '3', title: 'Internet Bill', amount: 65.00, category: 'Utilities', date: '2026-10-02' },
  ]);

  const handleAddExpense = (newExpenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...newExpenseData,
      id: Date.now().toString(),
    };
    // Immutably append new expense to state
    setExpenses(prev => [...prev, newExpense]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Expense Tracker</h1>
            <p className="text-slate-500 text-sm mt-1">Built with React, TypeScript & Tailwind CSS</p>
          </div>
          <div className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-200">
            Live Interactive App
          </div>
        </header>

        <SummaryCards expenses={expenses} />
        <ExpenseForm onAddExpense={handleAddExpense} />
        <ExpenseList expenses={expenses} onDeleteExpense={handleDeleteExpense} />
      </div>
    </div>
  );
}
`,
      contributions: [
        {
          id: 'c-5',
          fileId: 'file-app',
          startLine: 1,
          endLine: 55,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
  ];

  const checkpoints: LearningCheckpoint[] = [
    {
      id: 'chk-1',
      projectId: 'proj-expense-tracker',
      stepNumber: 1,
      title: 'Complete the Expense Data Interface',
      conceptId: 'ts_interfaces',
      conceptName: 'TypeScript Interfaces & Types',
      taskType: 'COMPLETE_CODE',
      targetFileId: 'file-types',
      prompt: 'Define the contract for an Expense item. Complete the `Expense` interface with fields: `id` (string), `title` (string), `amount` (number), `category` (ExpenseCategory), and `date` (string).',
      contextExplanation: 'TypeScript interfaces act as blueprints for your data. By defining the shape of an Expense upfront, your components will know exactly what fields are guaranteed to exist, eliminating runtime typos.',
      initialCode: `export type ExpenseCategory = 'Food' | 'Transport' | 'Housing' | 'Entertainment' | 'Utilities';

export interface Expense {
  id: string;
  title: string;
  // YOUR CODE: Add the remaining required fields
}
`,
      solutionCode: `export type ExpenseCategory = 'Food' | 'Transport' | 'Housing' | 'Entertainment' | 'Utilities';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
}
`,
      testCases: [
        {
          id: 't-1-1',
          description: 'Interface declares amount as number',
          assertionFn: 'const e = { id: "1", title: "Lunch", amount: 15.5, category: "Food", date: "2026-10-01" }; return typeof e.amount === "number";',
        },
        {
          id: 't-1-2',
          description: 'Interface declares category and date fields',
          assertionFn: 'const e = { id: "1", title: "Lunch", amount: 15.5, category: "Food", date: "2026-10-01" }; return Boolean(e.category && e.date);',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Required Expense Properties',
          content: 'An expense transaction needs to record how much was spent (amount), what classification it belongs to (category), and when it took place (date).',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Property Placement',
          content: 'Place `amount: number;`, `category: ExpenseCategory;`, and `date: string;` inside the `export interface Expense { ... }` block.',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'TypeScript Type Syntax',
          content: 'Remember syntax: `propertyName: typeName;`. For example, `amount: number;`.',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Partial Interface Skeleton',
          content: `export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
}`,
        },
      ],
      status: 'IN_PROGRESS',
      attempts: 0,
      hintsUsed: 0,
      whatChangedInPreview: 'Strong types are now applied across ExpenseForm and ExpenseList components!',
    },
    {
      id: 'chk-2',
      projectId: 'proj-expense-tracker',
      stepNumber: 2,
      title: 'Calculate Total Expenses using Array.reduce',
      conceptId: 'array_methods',
      conceptName: 'Array Aggregation (reduce)',
      taskType: 'WRITE_SCRATCH',
      targetFileId: 'file-summary',
      prompt: 'Write a helper function `calculateTotal(expenses: Expense[]): number` that sums the `amount` of all items in the array and returns the total. If the array is empty, return 0.',
      contextExplanation: 'Instead of manually writing a `for` loop with a mutable accumulator, modern JavaScript and React developers use `Array.prototype.reduce()` to transform a list of objects into a single computed number.',
      initialCode: `// Write your calculateTotal function here
function calculateTotal(expenses) {
  // YOUR CODE HERE
}
`,
      solutionCode: `function calculateTotal(expenses) {
  return expenses.reduce((sum, item) => sum + item.amount, 0);
}
`,
      testCases: [
        {
          id: 't-2-1',
          description: 'Correctly sums multiple expense amounts',
          assertionFn: 'const items = [{ amount: 10 }, { amount: 25 }, { amount: 5 }]; return calculateTotal(items) === 40;',
        },
        {
          id: 't-2-2',
          description: 'Returns 0 for an empty array',
          assertionFn: 'return calculateTotal([]) === 0;',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'How reduce Works',
          content: '`reduce` iterates over each item in the array while maintaining an ongoing accumulator value (sum).',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Initial Value Parameter',
          content: 'Always provide a second argument `0` as the initial value to `reduce`: `expenses.reduce((sum, item) => ..., 0);`.',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Syntax Expression',
          content: '`return expenses.reduce((sum, item) => sum + item.amount, 0);`',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Complete Function Structure',
          content: `function calculateTotal(expenses) {
  return expenses.reduce((accumulator, current) => accumulator + current.amount, 0);
}`,
        },
      ],
      status: 'PENDING',
      attempts: 0,
      hintsUsed: 0,
      whatChangedInPreview: 'The "Total Expenses" card on the live preview now dynamically calculates real spending!',
    },
    {
      id: 'chk-3',
      projectId: 'proj-expense-tracker',
      stepNumber: 3,
      title: 'Fix the State Mutation Bug',
      conceptId: 'state_immutability',
      conceptName: 'State Immutability in React',
      taskType: 'FIX_BUG',
      targetFileId: 'file-app',
      prompt: 'A common beginner mistake is directly mutating state arrays with `.push()`, causing React not to detect changes. Fix the `addExpense` function so it creates a new array using the spread operator (`...`).',
      contextExplanation: 'React compares state by object reference (`prev === next`). If you mutate the existing array directly with `.push()`, the array reference remains unchanged, so React skips re-rendering the UI!',
      brokenCode: `function addExpense(expenses, newExpense) {
  // BUG: Mutating array directly prevents React from re-rendering
  expenses.push(newExpense);
  return expenses;
}
`,
      solutionCode: `function addExpense(expenses, newExpense) {
  return [...expenses, newExpense];
}
`,
      testCases: [
        {
          id: 't-3-1',
          description: 'Returns a new array instance without mutating original',
          assertionFn: 'const orig = [{ id: "1" }]; const next = addExpense(orig, { id: "2" }); return next.length === 2 && next !== orig;',
        },
        {
          id: 't-3-2',
          description: 'Includes the new expense at the end',
          assertionFn: 'const next = addExpense([], { id: "test", amount: 10 }); return next[0]?.id === "test";',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Array Immutability',
          content: 'Instead of modifying the input array, return a freshly allocated array.',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Using the Spread Operator',
          content: 'Square brackets create a new array: `[ ...elements ]`.',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Return statement syntax',
          content: '`return [...expenses, newExpense];`',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Solution Implementation',
          content: `function addExpense(expenses, newExpense) {
  return [...expenses, newExpense];
}`,
        },
      ],
      status: 'PENDING',
      attempts: 0,
      hintsUsed: 0,
      whatChangedInPreview: 'Whenever you submit the form, new expenses now instantly trigger a UI re-render!',
    },
    {
      id: 'chk-4',
      projectId: 'proj-expense-tracker',
      stepNumber: 4,
      title: 'Explain: Why Does React Require Immutability?',
      conceptId: 'state_immutability',
      conceptName: 'Component Lifecycle & Re-render Triggers',
      taskType: 'EXPLAIN_CODE',
      targetFileId: 'file-app',
      prompt: 'In your own words, explain why React components need state to be updated immutably (e.g., using `[...prev, item]` instead of `array.push()`). How does React know when to re-render?',
      contextExplanation: 'Understanding why immutability is fundamental to React separates someone who blindly copies code from an engineer who can architect scalable applications.',
      solutionCode: 'React uses shallow reference comparison to determine if state changed. Mutating an array in place keeps the memory address identical, so React thinks nothing changed and skips re-rendering.',
      expectedKeywords: ['reference', 're-render', 'shallow', 'comparison', 'memory'],
      rubricCriteria: [
        'Explains that React compares state by reference',
        'Notes that in-place mutation leaves the reference identical',
        'Explains that a new reference is required to trigger re-rendering',
      ],
      testCases: [
        {
          id: 't-4-1',
          description: 'Explanation articulates reference equality and re-render trigger',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Memory Reference vs Deep Content',
          content: 'Does React check every single item inside an array to see if anything changed, or does it compare memory addresses?',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Key Terms to Mention',
          content: 'Mention "shallow comparison", "memory reference", and "re-render".',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Explanation Prompt',
          content: 'Explain how `prev === next` returns true when you call `.push()`, preventing React from detecting any change.',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Key Explanation Points',
          content: 'React checks if `oldState === newState`. If you mutate with `.push()`, the array reference does not change, so React skips updating the DOM. Creating a new array with `[...prev]` generates a new memory reference, triggering a UI update.',
        },
      ],
      status: 'PENDING',
      attempts: 0,
      hintsUsed: 0,
      whatChangedInPreview: 'Deepened conceptual foundation on React render cycles!',
    },
    {
      id: 'chk-5',
      projectId: 'proj-expense-tracker',
      stepNumber: 5,
      title: 'Implement Delete Expense with Array.filter',
      conceptId: 'array_methods',
      conceptName: 'Immutable Deletion with Filter',
      taskType: 'COMPLETE_CODE',
      targetFileId: 'file-list',
      prompt: 'Complete `removeExpenseById(expenses, idToRemove)` so that it returns a new array excluding the expense with the matching `id`.',
      contextExplanation: 'Just like adding items requires creating a new array, deleting items immutably is performed with `Array.prototype.filter()`.',
      initialCode: `function removeExpenseById(expenses, idToRemove) {
  // YOUR CODE: Return a filtered array
}
`,
      solutionCode: `function removeExpenseById(expenses, idToRemove) {
  return expenses.filter(item => item.id !== idToRemove);
}
`,
      testCases: [
        {
          id: 't-5-1',
          description: 'Removes the item with specified ID',
          assertionFn: 'const items = [{ id: "1" }, { id: "2" }, { id: "3" }]; const res = removeExpenseById(items, "2"); return res.length === 2 && !res.some(e => e.id === "2");',
        },
        {
          id: 't-5-2',
          description: 'Leaves array intact if ID not found',
          assertionFn: 'const items = [{ id: "1" }]; const res = removeExpenseById(items, "999"); return res.length === 1;',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Array.filter Callback Condition',
          content: 'The callback function for `.filter()` should return `true` for items you want to keep, and `false` for items to remove.',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Comparison Operator',
          content: 'Keep items where `item.id !== idToRemove`.',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Syntax Expression',
          content: '`return expenses.filter(item => item.id !== idToRemove);`',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Full Function Body',
          content: `function removeExpenseById(expenses, idToRemove) {
  return expenses.filter(item => item.id !== idToRemove);
}`,
        },
      ],
      status: 'PENDING',
      attempts: 0,
      hintsUsed: 0,
      whatChangedInPreview: 'Clicking "Delete" on any transaction now immediately removes it from both the list and summary calculations!',
    },
    {
      id: 'chk-6',
      projectId: 'proj-expense-tracker',
      stepNumber: 6,
      title: 'Predict Output: Empty List Conditional Check',
      conceptId: 'conditional_rendering',
      conceptName: 'Conditional Rendering & Guard Clauses',
      taskType: 'PREDICT_OUTPUT',
      targetFileId: 'file-list',
      prompt: 'Look at the following JSX snippet:\n```tsx\n{expenses.length === 0 ? (\n  <EmptyStateMessage />\n) : (\n  <TransactionTable count={expenses.length} />\n)}\n```\nWhat will be rendered if `expenses` is `[]` (an empty array)?',
      contextExplanation: 'Conditional rendering allows your user interface to gracefully handle empty states, loading states, and error states without crashing.',
      solutionCode: 'EmptyStateMessage',
      multipleChoiceOptions: [
        {
          id: 'opt-a',
          text: 'EmptyStateMessage component will render',
          isCorrect: true,
          explanation: 'Since `[].length === 0` evaluates to true, the ternary returns the first branch (<EmptyStateMessage />).',
        },
        {
          id: 'opt-b',
          text: 'TransactionTable with count="0"',
          isCorrect: false,
          explanation: 'The ternary condition is true, so the second branch is not reached.',
        },
        {
          id: 'opt-c',
          text: 'A JavaScript runtime TypeError',
          isCorrect: false,
          explanation: 'Empty arrays have a valid length property of 0, so no error occurs.',
        },
        {
          id: 'opt-d',
          text: 'Nothing (null)',
          isCorrect: false,
          explanation: 'The ternary explicitly returns <EmptyStateMessage />, not null.',
        },
      ],
      testCases: [
        {
          id: 't-6-1',
          description: 'Correctly predicts empty state evaluation',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Ternary Operator Evaluation',
          content: 'Syntax: `condition ? ifTrue : ifFalse`. Check the truthiness of `0 === 0`.',
        },
        {
          level: 2,
          type: 'structural',
          title: 'First vs Second Branch',
          content: 'If the condition is true, the left side of the colon `:` is executed.',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Ternary Outcome',
          content: '`[].length` is `0`, and `0 === 0` is `true`.',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Direct Outcome',
          content: 'Select option A: EmptyStateMessage will render.',
        },
      ],
      status: 'PENDING',
      attempts: 0,
      hintsUsed: 0,
      whatChangedInPreview: 'Empty state illustration verified when no transactions exist!',
    },
  ];

  const milestones: ProjectMilestone[] = [
    {
      id: 'm-1',
      projectId: 'proj-expense-tracker',
      stepNumber: 1,
      title: 'Scaffolded React & TypeScript Structure',
      description: 'AI configured App.tsx, modular components, and Tailwind styling.',
      conceptName: 'React Components',
      timestamp: Date.now() - 3600000,
      targetFile: 'src/App.tsx',
      completed: true,
    },
    {
      id: 'm-2',
      projectId: 'proj-expense-tracker',
      stepNumber: 2,
      title: 'Data Modeling with TypeScript',
      description: 'Learned and implemented the Expense interface shape.',
      conceptName: 'TypeScript Interfaces',
      timestamp: Date.now() - 2400000,
      targetFile: 'src/types.ts',
      completed: false,
    },
    {
      id: 'm-3',
      projectId: 'proj-expense-tracker',
      stepNumber: 3,
      title: 'Financial Summary Aggregations',
      description: 'Implemented calculateTotal using Array.prototype.reduce.',
      conceptName: 'Array Aggregation',
      timestamp: Date.now() - 1800000,
      targetFile: 'src/components/SummaryCards.tsx',
      completed: false,
    },
    {
      id: 'm-4',
      projectId: 'proj-expense-tracker',
      stepNumber: 4,
      title: 'State Immutability & Re-renders',
      description: 'Fixed state mutation bug and understood React reference comparison.',
      conceptName: 'State Immutability',
      timestamp: Date.now() - 1200000,
      targetFile: 'src/App.tsx',
      completed: false,
    },
    {
      id: 'm-5',
      projectId: 'proj-expense-tracker',
      stepNumber: 5,
      title: 'Dynamic Deletion & Filtering',
      description: 'Added immutable transaction deletion with Array.prototype.filter.',
      conceptName: 'Immutable Deletion',
      timestamp: Date.now() - 600000,
      targetFile: 'src/components/ExpenseList.tsx',
      completed: false,
    },
  ];

  const project: Project = {
    id: 'proj-expense-tracker',
    name: 'Smart Expense Tracker',
    description: 'An interactive personal finance dashboard built to learn React state, TypeScript interfaces, and immutable data handling.',
    techStack: {
      frontend: 'React 18',
      language: 'TypeScript',
      styling: 'Tailwind CSS',
    },
    interventionLevel: 'guided',
    currentStage: 'Building Core State & Business Logic',
    activeFileId: 'file-types',
    files,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now(),
  };

  return { project, checkpoints, milestones };
}
