import fs from 'fs';
import path from 'path';

const targetPath = path.resolve('lib/ai/universalPlanner.ts');

const code = `import { Project, ProjectFile } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone } from '@/types/learning';
import { createCalculatorProject } from './curriculum/calculator';
import { createExpenseTrackerProject } from './curriculum/expenseTracker';
import { createTaskManagerProject } from './curriculum/taskManager';
import { createMarkdownNotesProject } from './curriculum/markdownNotes';
import { createPomodoroTimerProject } from './curriculum/pomodoroTimer';
import { createVanillaCalculatorProject } from './curriculum/vanillaCalculator';
import { createPythonCalculatorProject } from './curriculum/pythonCalculator';
import { detectTechStack, TechStackId } from './stackDetector';

export function routeOrSynthesizeProject(
  prompt: string,
  explicitStack?: string
): {
  project: Project;
  checkpoints: LearningCheckpoint[];
  milestones: ProjectMilestone[];
} {
  const stack = detectTechStack(prompt, explicitStack);
  const lower = prompt.toLowerCase();

  // 1. Check if user requested Vanilla JavaScript + CSS + HTML
  if (stack.id === 'vanilla_web') {
    if (
      lower.includes('calc') ||
      lower.includes('math') ||
      lower.includes('arithmetic')
    ) {
      return createVanillaCalculatorProject();
    }
    return synthesizeVanillaProject(prompt);
  }

  // 2. Check if user requested Python
  if (stack.id === 'python') {
    if (
      lower.includes('calc') ||
      lower.includes('math') ||
      lower.includes('arithmetic')
    ) {
      return createPythonCalculatorProject();
    }
    return createPythonCalculatorProject(); // Default Python project
  }

  // 3. Check if user requested Pure HTML + CSS
  if (stack.id === 'html_css') {
    return synthesizeVanillaProject(prompt);
  }

  // 4. Standard React + TypeScript routes
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

  // 5. Note Taking & Markdown
  if (
    lower.includes('note') ||
    lower.includes('markdown') ||
    lower.includes('editor') ||
    lower.includes('journal') ||
    lower.includes('writing')
  ) {
    return createMarkdownNotesProject();
  }

  // 6. Pomodoro & Timers
  if (
    lower.includes('timer') ||
    lower.includes('pomodoro') ||
    lower.includes('stopwatch') ||
    lower.includes('clock') ||
    lower.includes('countdown')
  ) {
    return createPomodoroTimerProject();
  }

  // 7. Task & Kanban
  if (
    lower.includes('task') ||
    lower.includes('todo') ||
    lower.includes('kanban') ||
    lower.includes('checklist') ||
    lower.includes('board')
  ) {
    return createTaskManagerProject();
  }

  // 8. Finance & Expense Tracker
  if (
    lower.includes('expense') ||
    lower.includes('finance') ||
    lower.includes('budget') ||
    lower.includes('money') ||
    lower.includes('wallet')
  ) {
    return createExpenseTrackerProject();
  }

  // 9. Universal Domain Synthesis for ANY custom prompt
  return synthesizeUniversalProject(prompt);
}

/**
 * Synthesizes a bespoke Vanilla JavaScript + CSS + HTML5 project
 */
function synthesizeVanillaProject(prompt: string): {
  project: Project;
  checkpoints: LearningCheckpoint[];
  milestones: ProjectMilestone[];
} {
  const cleaned = prompt
    .replace(/build\\s+(me\\s+)?(a\\s+|an\\s+)?/gi, '')
    .replace(/using\\s+.*$/gi, '')
    .trim();

  const words = cleaned.split(/\\s+/).filter(w => w.length > 2);
  const primaryTopic = words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Web Studio';
  const projectName = \`\${primaryTopic} (JS & CSS)\`;
  const projectId = 'proj-vanilla-dyn';

  const htmlContent = \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>\${projectName}</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="app-container">
    <header class="app-header">
      <div class="brand">NIRMAAN &bull; JS + CSS</div>
      <h1>\${projectName}</h1>
      <p class="subtitle">Built with standard DOM APIs and modern CSS Grid</p>
    </header>

    <div class="search-bar">
      <input type="text" id="searchInput" placeholder="Search entries..." />
      <button id="addBtn" class="btn-primary">+ Add New</button>
    </div>

    <div class="card-grid" id="cardGrid">
      <!-- Injected via JavaScript -->
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>\`;

  const cssContent = \`:root {
  --bg-color: #09090b;
  --card-bg: #141418;
  --card-hover: #1c1c22;
  --text-main: #f4f4f5;
  --text-muted: #71717a;
  --accent: #6366f1;
  --accent-hover: #818cf8;
  --border: #27272a;
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
  padding: 32px 20px;
}

.app-container {
  max-width: 800px;
  margin: 0 auto;
}

.app-header {
  margin-bottom: 24px;
}

.brand {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--accent);
  text-transform: uppercase;
  margin-bottom: 4px;
}

h1 {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

#searchInput {
  flex: 1;
  background: var(--card-bg);
  border: 1px solid var(--border);
  color: var(--text-main);
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 13px;
  outline: none;
}

#searchInput:focus {
  border-color: var(--accent);
}

.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-primary:hover {
  background: var(--accent-hover);
}

/* Checkpoint: CSS Grid Layout */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px;
  transition: all 0.2s ease;
}

.card:hover {
  background: var(--card-hover);
  transform: translateY(-2px);
  border-color: #3f3f46;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 6px;
}

.card-desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}
\`;

  const jsContent = \`// \${projectName} - Vanilla JavaScript
const initialItems = [
  { id: '1', title: 'First Item', desc: 'Core feature module with native event handling.' },
  { id: '2', title: 'Interactive State', desc: 'Real-time search filtering across cards.' },
  { id: '3', title: 'Modern CSS Grid', desc: 'Auto-fill responsive card layout with transitions.' },
];

let items = [...initialItems];

const gridEl = document.getElementById('cardGrid');
const searchInput = document.getElementById('searchInput');
const addBtn = document.getElementById('addBtn');

/**
 * Filters items by query string
 */
function filterItems(all, query) {
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter(item => 
    item.title.toLowerCase().includes(q) || 
    item.desc.toLowerCase().includes(q)
  );
}

/**
 * Renders card elements to the DOM
 */
function renderCards(list) {
  if (!gridEl) return;
  gridEl.innerHTML = '';

  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = \`
      <div class="card-title">\${item.title}</div>
      <div class="card-desc">\${item.desc}</div>
    \`;
    gridEl.appendChild(card);
  });
}

// Event Listeners
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const filtered = filterItems(items, e.target.value);
    renderCards(filtered);
  });
}

if (addBtn) {
  addBtn.addEventListener('click', () => {
    const newItem = {
      id: String(Date.now()),
      title: 'New Item #' + (items.length + 1),
      desc: 'Added via JavaScript DOM manipulation.'
    };
    items = [...items, newItem];
    renderCards(items);
  });
}

// Initial render
renderCards(items);
\`;

  const files: ProjectFile[] = [
    {
      id: 'file-vanilla-html',
      projectId,
      path: 'index.html',
      name: 'index.html',
      language: 'html',
      content: htmlContent,
      version: 1,
      contributions: [
        {
          id: 'c1',
          fileId: 'file-vanilla-html',
          startLine: 1,
          endLine: 40,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
    {
      id: 'file-vanilla-css',
      projectId,
      path: 'style.css',
      name: 'style.css',
      language: 'css',
      content: cssContent,
      version: 1,
      contributions: [
        {
          id: 'c2',
          fileId: 'file-vanilla-css',
          startLine: 1,
          endLine: 80,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
    {
      id: 'file-vanilla-js',
      projectId,
      path: 'script.js',
      name: 'script.js',
      language: 'javascript',
      content: jsContent,
      version: 1,
      contributions: [
        {
          id: 'c3',
          fileId: 'file-vanilla-js',
          startLine: 1,
          endLine: 65,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
  ];

  const checkpoints: LearningCheckpoint[] = [
    {
      id: 'step-1-vanilla-css',
      projectId,
      stepNumber: 1,
      title: 'CSS Grid: Responsive Card Grid',
      conceptId: 'css_grid_layout',
      conceptName: 'CSS Grid Layout',
      taskType: 'COMPLETE_CODE',
      prompt: 'Configure .card-grid in style.css to use display: grid with grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)) and a 16px gap.',
      contextExplanation: 'CSS Grid creates a fully fluid responsive layout without requiring manual media queries or third-party frameworks.',
      targetFileId: 'file-vanilla-css',
      initialCode: \`.card-grid {
  /* COMPLETE CSS GRID RULES HERE */
}\`,
      solutionCode: \`.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}\`,
      testCases: [
        {
          id: 'test-css-grid',
          description: 'Uses display: grid and columns',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'CSS Grid Container',
          content: 'Set display to grid on the container element.',
        },
        {
          level: 2,
          type: 'structural',
          title: 'auto-fill columns',
          content: 'Use repeat(auto-fill, minmax(220px, 1fr)) for responsive cards.',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Full CSS Block',
          content: \`.card-grid {\\n  display: grid;\\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\\n  gap: 16px;\\n}\`,
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Solution code',
          content: \`.card-grid {\\n  display: grid;\\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\\n  gap: 16px;\\n}\`,
        },
      ],
      status: 'IN_PROGRESS',
      attempts: 0,
      hintsUsed: 0,
    },
    {
      id: 'step-2-vanilla-filter',
      projectId,
      stepNumber: 2,
      title: 'JavaScript: Array Filter Function',
      conceptId: 'array_methods',
      conceptName: 'Array.prototype.filter()',
      taskType: 'COMPLETE_CODE',
      prompt: 'Complete \`filterItems(all, query)\` to return items whose title or desc includes the query string (case-insensitive). Return all if query is empty.',
      contextExplanation: 'Array.prototype.filter() is a pure non-mutating method that creates a new array of matching elements.',
      targetFileId: 'file-vanilla-js',
      initialCode: \`function filterItems(all, query) {
  // YOUR CODE HERE
}\`,
      solutionCode: \`function filterItems(all, query) {
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter(item => 
    item.title.toLowerCase().includes(q) || 
    item.desc.toLowerCase().includes(q)
  );
}\`,
      testCases: [
        {
          id: 'test-filter-all',
          description: 'Returns all items when query is empty',
          assertionFn: 'const data = [{ title: "Apples", desc: "Red" }]; return filterItems(data, "").length === 1;',
        },
        {
          id: 'test-filter-query',
          description: 'Filters matches by title or desc',
          assertionFn: 'const data = [{ title: "Apples", desc: "Red" }, { title: "Bananas", desc: "Yellow" }]; return filterItems(data, "apple").length === 1;',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Empty Query Check',
          content: 'If query is empty or whitespace, return all immediately.',
        },
        {
          level: 2,
          type: 'structural',
          title: 'toLowerCase Comparison',
          content: 'Convert query and item fields to lower case before using includes().',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Filter callback',
          content: 'return all.filter(item => item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q));',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Full function',
          content: \`function filterItems(all, query) {\\n  const q = query.trim().toLowerCase();\\n  if (!q) return all;\\n  return all.filter(item => item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q));\\n}\`,
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
      title: 'CSS Grid Architecture',
      description: 'Configured responsive card grid.',
      conceptName: 'CSS Grid',
      timestamp: Date.now(),
      targetFile: 'style.css',
      completed: false,
    },
    {
      id: 'm2',
      projectId,
      stepNumber: 2,
      title: 'JavaScript Data Filtering',
      description: 'Implemented non-mutating search filtering.',
      conceptName: 'Array Filter',
      timestamp: Date.now(),
      targetFile: 'script.js',
      completed: false,
    },
  ];

  const project: Project = {
    id: projectId,
    name: projectName,
    description: \`Web application built with standard HTML5, CSS Grid, and modern JavaScript for: "\${prompt}".\`,
    techStack: {
      frontend: 'Vanilla Web Standards',
      language: 'JavaScript + CSS',
      styling: 'Pure CSS3',
    },
    interventionLevel: 'guided',
    currentStage: 'Stage 1: Core Layout & Data Flow',
    activeFileId: 'file-vanilla-css',
    files,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return { project, checkpoints, milestones };
}

/**
 * Procedurally generates a bespoke, fully working interactive web application
 * tailored to any natural language prompt provided by the user (React + TypeScript).
 */
function synthesizeUniversalProject(prompt: string): {
  project: Project;
  checkpoints: LearningCheckpoint[];
  milestones: ProjectMilestone[];
} {
  const cleaned = prompt
    .replace(/build\\s+(me\\s+)?(a\\s+|an\\s+)?/gi, '')
    .replace(/using\\s+react.*$/gi, '')
    .trim();

  const words = cleaned.split(/\\s+/).filter(w => w.length > 2);
  const primaryTopic = words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Custom Hub';
  const projectName = \`\${primaryTopic} App\`;

  const files: ProjectFile[] = [
    {
      id: 'file-dyn-types',
      projectId: 'proj-dyn',
      path: 'src/types.ts',
      name: 'types.ts',
      language: 'typescript',
      version: 1,
      content: \`export interface Item {
  id: string;
  name: string;
  category: string;
  active: boolean;
  timestamp: string;
}
\`,
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
      content: \`import { Item } from '../types';

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
\`,
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
      content: \`import React, { useState } from 'react';
import { Item } from './types';
import { filterItems, calculateActiveRatio } from './utils/helpers';

export default function App() {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Primary Dashboard Component', category: 'Core', active: true, timestamp: '10:00 AM' },
    { id: '2', name: 'Real-time Event Listener', category: 'Events', active: true, timestamp: '10:15 AM' },
    { id: '3', name: 'State Management Unit', category: 'State', active: false, timestamp: '10:30 AM' },
  ]);
  const [query, setQuery] = useState('');
  const [newName, setNewName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = filterItems(items, query).filter(i => 
    selectedCategory === 'All' ? true : i.category === selectedCategory
  );
  const activeRatio = calculateActiveRatio(items);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, active: !item.active } : item
    ));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newItem: Item = {
      id: String(Date.now()),
      name: newName.trim(),
      category: 'General',
      active: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setItems(prev => [...prev, newItem]);
    setNewName('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col font-sans">
      <header className="mb-6 pb-4 border-b border-slate-800 flex justify-between items-center">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-bold">NIRMAAN AI STUDIO</div>
          <h1 className="text-2xl font-black text-white tracking-tight">\${projectName}</h1>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono">
          <span className="text-slate-400">Active: </span>
          <span className="text-emerald-400 font-bold">{activeRatio}%</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        <div className="md:col-span-2 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search components or actions..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            {filtered.map(item => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className="p-3.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={\`w-2.5 h-2.5 rounded-full \${item.active ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-700'}\`} />
                  <div>
                    <div className="text-sm font-semibold text-slate-200">{item.name}</div>
                    <div className="text-[11px] text-slate-500">{item.category} &bull; {item.timestamp}</div>
                  </div>
                </div>
                <span className={\`text-xs px-2.5 py-0.5 rounded-full font-medium \${item.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}\`}>
                  {item.active ? 'Active' : 'Archived'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 h-fit">
          <h2 className="text-sm font-bold text-white mb-3">Add Entry</h2>
          <form onSubmit={handleAddItem} className="space-y-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Entry description..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Add Item
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
\`,
      contributions: [
        {
          id: 'c-3',
          fileId: 'file-dyn-app',
          startLine: 1,
          endLine: 95,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
  ];

  const checkpoints: LearningCheckpoint[] = [
    {
      id: 'step-dyn-1',
      projectId: 'proj-dyn',
      stepNumber: 1,
      title: 'Filter Algorithm & Immutability',
      conceptId: 'array_methods',
      conceptName: 'Array Filter & Higher-Order Functions',
      taskType: 'COMPLETE_CODE',
      prompt: 'Implement \`filterItems(items, query)\` to return items where either name or category matches the search term, without mutating the original list.',
      contextExplanation: 'Pure filtering ensures real-time search without corrupting backend state.',
      targetFileId: 'file-dyn-utils',
      targetLineStart: 6,
      targetLineEnd: 14,
      initialCode: \`export function filterItems(items: Item[], query: string): Item[] {
  // YOUR CODE HERE
}\`,
      solutionCode: \`export function filterItems(items: Item[], query: string): Item[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(item => 
    item.name.toLowerCase().includes(q) || 
    item.category.toLowerCase().includes(q)
  );
}\`,
      testCases: [
        {
          id: 'test-1',
          description: 'Returns all items when search query is empty',
          input: { query: '' },
          assertionFn: 'const items = [{ id: "1", name: "Alpha", category: "General", active: true, timestamp: "1" }]; return filterItems(items, "").length === 1;',
        },
        {
          id: 'test-2',
          description: 'Finds matching item by case-insensitive name',
          input: { query: 'alpha' },
          assertionFn: 'const items = [{ id: "1", name: "Alpha Component", category: "Core", active: true, timestamp: "1" }, { id: "2", name: "Beta", category: "UI", active: true, timestamp: "2" }]; return filterItems(items, "alpha").length === 1;',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Understanding Array Filter',
          content: 'Array.prototype.filter() creates a new array filled with all items that pass the predicate test.',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Condition handling',
          content: 'Check if query is empty first. Then return items.filter(...)',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'String search syntax',
          content: 'Use .includes() on lowercase strings: item.name.toLowerCase().includes(q)',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Complete solution',
          content: \`export function filterItems(items: Item[], query: string): Item[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(item => 
    item.name.toLowerCase().includes(q) || 
    item.category.toLowerCase().includes(q)
  );
}\`,
        },
      ],
      status: 'IN_PROGRESS',
      attempts: 0,
      hintsUsed: 0,
      whatChangedInPreview: 'The search bar will now filter live elements on the screen!',
    },
  ];

  const milestones: ProjectMilestone[] = [
    {
      id: 'm-dyn-1',
      projectId: 'proj-dyn',
      stepNumber: 1,
      title: \`Generated \${projectName}\`,
      description: \`Synthesized bespoke architecture matching "\${prompt}".\`,
      conceptName: 'React Components',
      timestamp: Date.now() - 3600000,
      targetFile: 'src/App.tsx',
      completed: true,
    },
  ];

  const project: Project = {
    id: 'proj-dyn',
    name: projectName,
    description: \`Interactive application tailored to: "\${prompt}".\`,
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
`;

fs.writeFileSync(targetPath, code, 'utf8');
console.log('Successfully updated universalPlanner.ts');
