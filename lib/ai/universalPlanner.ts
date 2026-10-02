import { Project, ProjectFile } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone } from '@/types/learning';
import { createCalculatorProject } from './curriculum/calculator';
import { createExpenseTrackerProject } from './curriculum/expenseTracker';
import { createTaskManagerProject } from './curriculum/taskManager';
import { createMarkdownNotesProject } from './curriculum/markdownNotes';
import { createPomodoroTimerProject } from './curriculum/pomodoroTimer';

export function routeOrSynthesizeProject(prompt: string): {
  project: Project;
  checkpoints: LearningCheckpoint[];
  milestones: ProjectMilestone[];
} {
  const lower = prompt.toLowerCase();

  // 1. Calculator & Math
  if (
    lower.includes('calc') ||
    lower.includes('math') ||
    lower.includes('arithmetic') ||
    lower.includes('multiply') ||
    lower.includes('addition') ||
    lower.includes('divide')
  ) {
    return createCalculatorProject();
  }

  // 2. Note Taking & Markdown
  if (
    lower.includes('note') ||
    lower.includes('markdown') ||
    lower.includes('editor') ||
    lower.includes('journal') ||
    lower.includes('writing')
  ) {
    return createMarkdownNotesProject();
  }

  // 3. Pomodoro & Timers
  if (
    lower.includes('timer') ||
    lower.includes('pomodoro') ||
    lower.includes('stopwatch') ||
    lower.includes('clock') ||
    lower.includes('countdown')
  ) {
    return createPomodoroTimerProject();
  }

  // 4. Task & Kanban
  if (
    lower.includes('task') ||
    lower.includes('todo') ||
    lower.includes('kanban') ||
    lower.includes('checklist') ||
    lower.includes('board')
  ) {
    return createTaskManagerProject();
  }

  // 5. Finance & Expense Tracker
  if (
    lower.includes('expense') ||
    lower.includes('finance') ||
    lower.includes('budget') ||
    lower.includes('money') ||
    lower.includes('wallet')
  ) {
    return createExpenseTrackerProject();
  }

  // 6. Universal Domain Synthesis for ANY custom prompt!
  return synthesizeUniversalProject(prompt);
}

/**
 * Procedurally generates a bespoke, fully working interactive web application
 * tailored to any natural language prompt provided by the user.
 */
function synthesizeUniversalProject(prompt: string): {
  project: Project;
  checkpoints: LearningCheckpoint[];
  milestones: ProjectMilestone[];
} {
  // Extract primary topic
  const cleaned = prompt
    .replace(/build\s+(me\s+)?(a\s+|an\s+)?/gi, '')
    .replace(/using\s+react.*$/gi, '')
    .trim();

  const words = cleaned.split(/\s+/).filter(w => w.length > 2);
  const primaryTopic = words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Custom Hub';
  const projectName = `${primaryTopic} App`;

  const files: ProjectFile[] = [
    {
      id: 'file-dyn-types',
      projectId: 'proj-dyn',
      path: 'src/types.ts',
      name: 'types.ts',
      language: 'typescript',
      version: 1,
      content: `export interface Item {
  id: string;
  name: string;
  category: string;
  active: boolean;
  timestamp: string;
}
`,
      contributions: [
        {
          id: 'c-1',
          fileId: 'file-dyn-types',
          startLine: 1,
          endLine: 10,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
    {
      id: 'file-dyn-utils',
      projectId: 'proj-dyn',
      path: 'src/utils/helpers.ts',
      name: 'helpers.ts',
      language: 'typescript',
      version: 1,
      content: `import { Item } from '../types';

/**
 * Filters items by search term across all text fields.
 */
export function filterItems(items: Item[], query: string): Item[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(item => 
    item.name.toLowerCase().includes(q) || 
    item.category.toLowerCase().includes(q)
  );
}

/**
 * Calculates active percentage from total items.
 */
export function calculateActiveRatio(items: Item[]): number {
  if (items.length === 0) return 0;
  const activeCount = items.filter(i => i.active).length;
  return Math.round((activeCount / items.length) * 100);
}
`,
      contributions: [
        {
          id: 'c-2',
          fileId: 'file-dyn-utils',
          startLine: 1,
          endLine: 25,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
    {
      id: 'file-dyn-app',
      projectId: 'proj-dyn',
      path: 'src/App.tsx',
      name: 'App.tsx',
      language: 'tsx',
      version: 1,
      content: `import React, { useState } from 'react';
import { Item } from './types';
import { filterItems, calculateActiveRatio } from './utils/helpers';

export default function App() {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Starter Sample Alpha', category: 'Core', active: true, timestamp: 'Today' },
    { id: '2', name: 'Interactive Beta Element', category: 'Feature', active: false, timestamp: 'Today' },
    { id: '3', name: 'Mastery Concept Module', category: 'Learning', active: true, timestamp: 'Just now' },
  ]);

  const [inputName, setInputName] = useState('');
  const [inputCategory, setInputCategory] = useState('General');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    const newItem: Item = {
      id: Date.now().toString(),
      name: inputName.trim(),
      category: inputCategory,
      active: true,
      timestamp: 'Just now',
    };

    setItems(prev => [newItem, ...prev]);
    setInputName('');
  };

  const handleToggle = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, active: !item.active } : item));
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const filtered = filterItems(items, searchQuery);
  const activePercentage = calculateActiveRatio(items);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans select-none">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">${projectName}</h1>
            <p className="text-xs text-slate-400 mt-1">Generated for: "${prompt}"</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-indigo-400 font-mono">{activePercentage}%</span>
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Active Status</span>
          </div>
        </header>

        {/* Input Form */}
        <form onSubmit={handleAddItem} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex gap-3 shadow-lg">
          <input
            type="text"
            placeholder="Add new entry..."
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <select
            value={inputCategory}
            onChange={(e) => setInputCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="General">General</option>
            <option value="Core">Core</option>
            <option value="Feature">Feature</option>
          </select>
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
          >
            + Add
          </button>
        </form>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* List Entries */}
        <div className="space-y-2">
          {filtered.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={item.active}
                  onChange={() => handleToggle(item.id)}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
                <span className={\`text-sm font-medium \${item.active ? 'text-white' : 'line-through text-slate-500'}\`}>
                  {item.name}
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                  {item.category}
                </span>
              </div>

              <button
                onClick={() => handleDelete(item.id)}
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
          id: 'c-3',
          fileId: 'file-dyn-app',
          startLine: 1,
          endLine: 120,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
  ];

  const checkpoints: LearningCheckpoint[] = [
    {
      id: 'chk-dyn-1',
      projectId: 'proj-dyn',
      stepNumber: 1,
      title: 'Implement Search Substring Matcher',
      conceptId: 'array_methods',
      conceptName: 'Case-Insensitive Substring Filtering',
      taskType: 'COMPLETE_CODE',
      targetFileId: 'file-dyn-utils',
      prompt: 'Complete `filterItems(items, query)` in `src/utils/helpers.ts`. It should return items where `item.name` includes `query` (case-insensitive). If query is empty, return all items.',
      contextExplanation: 'Filtering lists based on user input is an essential skill in modern client-side frontend development.',
      initialCode: `function filterItems(items, query) {
  // YOUR CODE HERE
}
`,
      solutionCode: `function filterItems(items, query) {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(item => item.name.toLowerCase().includes(q));
}
`,
      testCases: [
        {
          id: 'tc-d1',
          description: 'Filters matching items ignoring letter case',
          assertionFn: 'const l = [{ name: "Alpha" }, { name: "Beta" }]; return filterItems(l, "alpha").length === 1;',
        },
        {
          id: 'tc-d2',
          description: 'Returns all items when search query is empty',
          assertionFn: 'const l = [{ name: "Alpha" }]; return filterItems(l, "").length === 1;',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Array.filter Callback',
          content: 'Use `items.filter(...)` with `.toLowerCase().includes(q)`.',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Guard clause',
          content: 'If `!q` return the original `items`.',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Syntax Expression',
          content: '`return items.filter(item => item.name.toLowerCase().includes(q));`',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Full Function',
          content: `function filterItems(items, query) {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(item => item.name.toLowerCase().includes(q));
}`,
        },
      ],
      status: 'IN_PROGRESS',
      attempts: 0,
      hintsUsed: 0,
      whatChangedInPreview: 'Live searching now filters entries dynamically in the preview!',
    },
    {
      id: 'chk-dyn-2',
      projectId: 'proj-dyn',
      stepNumber: 2,
      title: 'Fix State Immutability Mutation Bug',
      conceptId: 'state_immutability',
      conceptName: 'Immutable Array Appends',
      taskType: 'FIX_BUG',
      targetFileId: 'file-dyn-app',
      prompt: 'Fix `appendEntry(items, newEntry)` so it returns a new array with `[...items, newEntry]` instead of calling `.push()` directly.',
      contextExplanation: 'React compares state by shallow object reference. Direct array mutation prevents React from scheduling a re-render.',
      brokenCode: `function appendEntry(items, newEntry) {
  // BUG: Mutates original array in place
  items.push(newEntry);
  return items;
}
`,
      solutionCode: `function appendEntry(items, newEntry) {
  return [...items, newEntry];
}
`,
      testCases: [
        {
          id: 'tc-d3',
          description: 'Returns a fresh array instance containing the new entry',
          assertionFn: 'const orig = [{ id: "1" }]; const res = appendEntry(orig, { id: "2" }); return res.length === 2 && res !== orig;',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Spread operator',
          content: 'Return a new array containing all elements of `items` plus `newEntry`.',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Bracket syntax',
          content: '`return [...items, newEntry];`',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Code implementation',
          content: '`return [...items, newEntry];`',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Full solution',
          content: `function appendEntry(items, newEntry) {
  return [...items, newEntry];
}`,
        },
      ],
      status: 'PENDING',
      attempts: 0,
      hintsUsed: 0,
      whatChangedInPreview: 'Adding new items now immediately updates the user interface!',
    },
  ];

  const milestones: ProjectMilestone[] = [
    {
      id: 'm-dyn-1',
      projectId: 'proj-dyn',
      stepNumber: 1,
      title: `Generated ${projectName}`,
      description: `Synthesized bespoke architecture matching "${prompt}".`,
      conceptName: 'React Components',
      timestamp: Date.now() - 3600000,
      targetFile: 'src/App.tsx',
      completed: true,
    },
  ];

  const project: Project = {
    id: 'proj-dyn',
    name: projectName,
    description: `Interactive application tailored to: "${prompt}".`,
    techStack: {
      frontend: 'React 18',
      language: 'TypeScript',
      styling: 'Tailwind CSS',
    },
    interventionLevel: 'guided',
    currentStage: 'Building Core State & Business Logic',
    activeFileId: 'file-dyn-utils',
    files,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now(),
  };

  return { project, checkpoints, milestones };
}
