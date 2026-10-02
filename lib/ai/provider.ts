import { AISettings, ConceptExplanation, ExplanationLevel } from '@/types/ai';
import { createExpenseTrackerProject } from './curriculum/expenseTracker';
import { createTaskManagerProject } from './curriculum/taskManager';
import { createCalculatorProject } from './curriculum/calculator';
import { Project, ProjectFile } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone } from '@/types/learning';

export class AIProviderService {
  private settings: AISettings;

  constructor(settings?: Partial<AISettings>) {
    this.settings = {
      provider: settings?.provider || 'builtin',
      apiKey: settings?.apiKey,
      model: settings?.model,
      customEndpoint: settings?.customEndpoint,
    };
  }

  public updateSettings(settings: AISettings) {
    this.settings = settings;
  }

  public async generateProjectFromPrompt(
    prompt: string,
    experienceLevel: string = 'beginner',
    preference: string = 'guided'
  ): Promise<{
    project: Project;
    checkpoints: LearningCheckpoint[];
    milestones: ProjectMilestone[];
  }> {
    const lower = prompt.toLowerCase();

    // 1. Calculator / Math prompts
    if (
      lower.includes('calc') ||
      lower.includes('math') ||
      lower.includes('arithmetic') ||
      lower.includes('add') ||
      lower.includes('multiply') ||
      lower.includes('divide')
    ) {
      return createCalculatorProject();
    }

    // 2. Task / Todo / Kanban prompts
    if (
      lower.includes('task') ||
      lower.includes('todo') ||
      lower.includes('project') ||
      lower.includes('kanban') ||
      lower.includes('list')
    ) {
      return createTaskManagerProject();
    }

    // 3. Expense / Finance / Budget prompts
    if (
      lower.includes('expense') ||
      lower.includes('budget') ||
      lower.includes('finance') ||
      lower.includes('money') ||
      lower.includes('wallet')
    ) {
      return createExpenseTrackerProject();
    }

    // 4. For any other custom prompt, generate a tailored dynamic project
    return this.generateCustomProject(prompt);
  }

  /**
   * Generates a tailored project for any user prompt that doesn't match pre-baked templates.
   */
  private generateCustomProject(prompt: string): {
    project: Project;
    checkpoints: LearningCheckpoint[];
    milestones: ProjectMilestone[];
  } {
    const titleWords = prompt.split(' ').slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const projectName = `${titleWords || 'Interactive'} Application`;

    const files: ProjectFile[] = [
      {
        id: 'file-custom-app',
        projectId: 'proj-custom',
        path: 'src/App.tsx',
        name: 'App.tsx',
        language: 'tsx',
        version: 1,
        content: `import React, { useState } from 'react';

export default function App() {
  const [items, setItems] = useState<string[]>(['Welcome item', 'Sample item']);
  const [inputValue, setInputValue] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setItems(prev => [...prev, inputValue.trim()]);
    setInputValue('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">${projectName}</h1>
          <p className="text-xs text-slate-400 mt-1">Built with React 18, TypeScript & Tailwind CSS</p>
        </header>

        <form onSubmit={handleAddItem} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Enter new item..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Add
          </button>
        </form>

        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-sm text-slate-200">{item}</span>
              <button
                onClick={() => handleRemoveItem(idx)}
                className="text-slate-500 hover:text-red-400 text-xs px-2 py-1"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`,
        contributions: [
          {
            id: 'c-custom-1',
            fileId: 'file-custom-app',
            startLine: 1,
            endLine: 50,
            authorType: 'AI_GENERATED',
            timestamp: Date.now(),
          },
        ],
      },
    ];

    const checkpoints: LearningCheckpoint[] = [
      {
        id: 'chk-custom-1',
        projectId: 'proj-custom',
        stepNumber: 1,
        title: 'Implement Immutable Addition',
        conceptId: 'state_immutability',
        conceptName: 'State Immutability with Spread',
        taskType: 'COMPLETE_CODE',
        targetFileId: 'file-custom-app',
        prompt: 'Complete the `appendItem(list, newItem)` helper function so it returns a new array using the spread operator `[...list, newItem]`.',
        contextExplanation: 'React state requires immutable updates so shallow reference comparisons trigger automatic UI re-renders.',
        initialCode: `function appendItem(list, newItem) {
  // YOUR CODE: Return new array with newItem appended
}
`,
        solutionCode: `function appendItem(list, newItem) {
  return [...list, newItem];
}
`,
        testCases: [
          {
            id: 'tc-cust-1',
            description: 'Returns new array containing the new item',
            assertionFn: 'const l = ["a"]; const res = appendItem(l, "b"); return res.length === 2 && res[1] === "b" && res !== l;',
          },
        ],
        hints: [
          {
            level: 1,
            type: 'conceptual',
            title: 'Spread Syntax',
            content: 'Use `[...list, newItem]` to clone the existing items into a new array.',
          },
          {
            level: 2,
            type: 'structural',
            title: 'Placement',
            content: 'Return the freshly created array.',
          },
          {
            level: 3,
            type: 'syntax',
            title: 'Syntax Expression',
            content: '`return [...list, newItem];`',
          },
          {
            level: 4,
            type: 'partial_solution',
            title: 'Full Function',
            content: `function appendItem(list, newItem) {
  return [...list, newItem];
}`,
          },
        ],
        status: 'IN_PROGRESS',
        attempts: 0,
        hintsUsed: 0,
        whatChangedInPreview: 'New items are immutably appended and trigger real-time re-renders!',
      },
    ];

    const milestones: ProjectMilestone[] = [
      {
        id: 'm-cust-1',
        projectId: 'proj-custom',
        stepNumber: 1,
        title: `Created ${projectName}`,
        description: 'AI configured modular structure and reactive state flow.',
        conceptName: 'React Components',
        timestamp: Date.now() - 3600000,
        targetFile: 'src/App.tsx',
        completed: true,
      },
    ];

    const project: Project = {
      id: 'proj-custom',
      name: projectName,
      description: `Custom interactive application tailored to: "${prompt}".`,
      techStack: {
        frontend: 'React 18',
        language: 'TypeScript',
        styling: 'Tailwind CSS',
      },
      interventionLevel: 'guided',
      currentStage: 'Building Core Functionality',
      activeFileId: 'file-custom-app',
      files,
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now(),
    };

    return { project, checkpoints, milestones };
  }

  public getConceptExplanation(
    conceptId: string,
    level: ExplanationLevel = 'beginner'
  ): ConceptExplanation {
    const explanations: Record<string, ConceptExplanation> = {
      functions_parameters: {
        concept: 'Functions & Arithmetic Execution',
        language: 'TypeScript / JavaScript',
        syntax: 'function calculate(prev: number, current: number, op: string): number',
        whatItDoes: 'Encapsulates pure mathematical operations and returns calculated results without altering external state.',
        whyItExists: 'Decouples calculation logic from UI rendering, allowing reliable unit testing and bug-free arithmetic.',
        usedBy: 'calculator.ts',
        beginnerExplanation: 'Think of a function like a kitchen blender. You put ingredients in (numbers and operator), and it gives you a finished smoothie (the calculated result).',
        intermediateExplanation: 'Pure functions have referential transparency: given identical inputs, they always return the identical output with zero side effects.',
        advancedExplanation: 'V8 JIT optimizes pure numeric functions by inlining bytecode and avoiding deoptimizations with Monomorphic ICs.',
        commonPitfalls: ['Division by zero returning Infinity without guards', 'Mutating arguments'],
      },
      variables_types: {
        concept: 'IEEE 754 Floating Point & Precision',
        language: 'JavaScript / TypeScript',
        syntax: 'parseFloat(value).toLocaleString("en-US")',
        whatItDoes: 'Handles numeric representation and formatting for user displays.',
        whyItExists: 'Computers use binary floating point, leading to rounding discrepancies like 0.1 + 0.2 === 0.30000000000000004.',
        usedBy: 'Display.tsx, calculator.ts',
        beginnerExplanation: 'Computers think in binary (0s and 1s). Just like 1/3 has infinite repeating decimals in base 10 (0.3333...), fractions like 0.1 repeat in binary.',
        intermediateExplanation: 'JavaScript numbers are 64-bit IEEE 754 doubles. Numbers with repeating binary representations must be rounded or formatted for UI presentation.',
        advancedExplanation: 'Float64 uses 1 sign bit, 11 exponent bits, and 52 mantissa bits. Binary fractions like 0.1 cannot be represented precisely in 53 significand bits.',
        commonPitfalls: ['Direct equality comparison on floats (0.1 + 0.2 === 0.3)', 'Allowing multiple decimal points in input strings'],
      },
      ts_interfaces: {
        concept: 'TypeScript Interface',
        language: 'TypeScript',
        syntax: 'export interface Name { property: type; }',
        whatItDoes: 'Declares an explicit contract describing the structure and data types of an object.',
        whyItExists: 'In large applications, passing objects without contracts leads to typos and runtime crashes. Interfaces give instant compiler feedback and IDE autocomplete.',
        usedBy: 'types.ts',
        beginnerExplanation: 'Think of an interface like a recipe ingredient list or an ID card format. It guarantees which properties exist on an object.',
        intermediateExplanation: 'TypeScript interfaces compile away to zero runtime JavaScript overhead while enforcing compile-time shape consistency.',
        advancedExplanation: 'Interfaces enable declaration merging, nominal-like structural typing checks via AST graph traversal, and zero-cost abstraction for V8 JIT shape optimization.',
        commonPitfalls: ['Marking fields as optional (?) when your UI requires them', 'Confusing type aliases with interfaces'],
      },
      array_methods: {
        concept: 'Array Methods (reduce, map, filter)',
        language: 'JavaScript / TypeScript',
        syntax: 'array.reduce((acc, curr) => acc + curr.amount, 0)',
        whatItDoes: 'Transforms, aggregates, or filters arrays declaratively without mutating the original collection.',
        whyItExists: 'Functional programming methods make code predictable, concise, and safe by avoiding manual loop index tracking and accidental variable mutations.',
        usedBy: 'SummaryCards.tsx (total calculations), ExpenseList.tsx (deletions)',
        beginnerExplanation: 'Instead of counting items on your fingers with a manual "for" loop, reduce gives you a calculator accumulator that adds every price up in one smooth step.',
        intermediateExplanation: 'Higher-order array methods preserve immutability by returning new collections or primitive values rather than mutating the caller array in-place.',
        advancedExplanation: 'V8 optimizes contiguous array iterations with Monomorphic ICs when callback signatures remain stable, minimizing garbage collection allocations.',
        commonPitfalls: ['Forgetting to specify the initial value (e.g. 0)', 'Calling array methods on undefined or null values'],
      },
      state_immutability: {
        concept: 'State Immutability',
        language: 'React / JavaScript',
        syntax: 'setExpenses(prev => [...prev, newExpense])',
        whatItDoes: 'Replaces previous state with a newly allocated reference rather than altering the existing memory location.',
        whyItExists: 'React uses shallow equality checks (oldRef === newRef) to detect changes. If you mutate an array in place, React sees the same pointer and refuses to update your screen.',
        usedBy: 'App.tsx (handleDigit, handleAddExpense)',
        beginnerExplanation: 'Think of your state like a snapshot photograph. You don\'t paint over the old photograph; you take a brand new photograph with the new item included!',
        intermediateExplanation: 'Immutable updates ensure predictable time-travel debugging, allow pure component memoization (React.memo), and ensure reliable concurrency in React 18+ Fiber reconciler.',
        advancedExplanation: 'The Fiber reconciler compares workInProgress fiber alternate pointers. In-place mutation breaks the referential transparency of memoized selector graphs.',
        commonPitfalls: ['Using array.push() directly on state variables', 'Mutating state objects in place'],
      },
      react_state: {
        concept: 'React State (useState)',
        language: 'React / TypeScript',
        syntax: 'const [state, setState] = useState(initialValue);',
        whatItDoes: 'Stores values that survive between component renders and triggers a DOM reconciliation whenever updated.',
        whyItExists: 'Standard JavaScript variables reset to their initial value every time a component function executes. useState gives components long-term memory.',
        usedBy: 'App.tsx',
        beginnerExplanation: 'State is like a sticky note on your component. It holds your input text or active calculator value, keeping it safe even when the page updates.',
        intermediateExplanation: 'useState returns a state value and a dispatch function. Updates are scheduled in React Fiber work queues and batched for optimal DOM rendering performance.',
        advancedExplanation: 'Hooks are stored as a singly linked list on the fiber node (`fiber.memoizedState`). The order of hook calls must remain strictly invariant across renders.',
        commonPitfalls: ['Calling useState inside conditional if blocks or loops', 'Expecting state variables to update synchronously right on the next line'],
      },
    };

    return explanations[conceptId] || {
      concept: 'Programming Concept',
      language: 'TypeScript / React',
      syntax: 'Syntax pattern',
      whatItDoes: 'Encapsulates modular logic in the application.',
      whyItExists: 'Provides clean separation of concerns and maintainability.',
      usedBy: 'Project Components',
      beginnerExplanation: 'This code helps your application organize data and respond to user actions.',
      intermediateExplanation: 'Follows idiomatic React and TypeScript paradigms for maintainable frontends.',
      advancedExplanation: 'Optimized for modularity, type inference, and React Fiber render scheduling.',
      commonPitfalls: ['Unclear variable naming', 'Lack of error boundary protection'],
    };
  }
}

export const aiService = new AIProviderService();
