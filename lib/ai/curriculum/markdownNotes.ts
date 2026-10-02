import { Project, ProjectFile } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone } from '@/types/learning';

export function createMarkdownNotesProject(): {
  project: Project;
  checkpoints: LearningCheckpoint[];
  milestones: ProjectMilestone[];
} {
  const files: ProjectFile[] = [
    {
      id: 'file-notes-types',
      projectId: 'proj-notes',
      path: 'src/types.ts',
      name: 'types.ts',
      language: 'typescript',
      version: 1,
      content: `export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}
`,
      contributions: [
        {
          id: 'c-1',
          fileId: 'file-notes-types',
          startLine: 1,
          endLine: 10,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
    {
      id: 'file-notes-utils',
      projectId: 'proj-notes',
      path: 'src/utils/markdown.ts',
      name: 'markdown.ts',
      language: 'typescript',
      version: 1,
      content: `/**
 * Simple client-side Markdown to HTML converter.
 * Converts headers, bold, italics, code blocks, lists, and links.
 */
export function parseMarkdown(md: string): string {
  let html = md;

  // Escape basic HTML
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Headers (# H1, ## H2, ### H3)
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-slate-100 mt-4 mb-1">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-slate-100 mt-4 mb-2">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-xl font-black text-white mt-4 mb-2 pb-1 border-b border-slate-800">$1</h1>');

  // Bold (**bold**) & Italic (*italic*)
  html = html.replace(/\\*\\*(.*?)\\*\\*/g, '<strong class="font-bold text-indigo-300">$1</strong>');
  html = html.replace(/\\*(.*?)\\*/g, '<em class="italic text-slate-300">$1</em>');

  // Inline Code (\`code\`)
  html = html.replace(/\`([^\`]+)\`/g, '<code class="bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded font-mono text-xs">$1</code>');

  // Unordered Lists (- item)
  html = html.replace(/^\\s*-\\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-300 my-0.5">$1</li>');

  // Line breaks
  html = html.replace(/\\n/g, '<br />');

  return html;
}

/**
 * Calculates reading metrics: word count and estimated reading time.
 */
export function calculateStats(text: string): { words: number; chars: number; readingTimeMinutes: number } {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\\s+/).length : 0;
  const chars = text.length;
  const readingTimeMinutes = Math.ceil(words / 200);

  return { words, chars, readingTimeMinutes };
}
`,
      contributions: [
        {
          id: 'c-2',
          fileId: 'file-notes-utils',
          startLine: 1,
          endLine: 50,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
    {
      id: 'file-notes-app',
      projectId: 'proj-notes',
      path: 'src/App.tsx',
      name: 'App.tsx',
      language: 'tsx',
      version: 1,
      content: `import React, { useState } from 'react';
import { Note } from './types';
import { parseMarkdown, calculateStats } from './utils/markdown';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Architecture Ideas',
      content: '# Nirmaan Ideas\\n\\nLearn while building software.\\n\\n- Clean code\\n- **Concept mastery**\\n- Live feedback',
      tags: ['Architecture', 'Ideas'],
      updatedAt: 'Just now',
    },
    {
      id: '2',
      title: 'React State Rules',
      content: '# Immutability\\n\\nAlways update state using \`setNotes(prev => [...prev])\` to ensure proper re-renders.',
      tags: ['React', 'Tips'],
      updatedAt: 'Today',
    },
  ]);

  const [activeNoteId, setActiveNoteId] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  const handleUpdateContent = (newContent: string) => {
    setNotes(prev =>
      prev.map(n =>
        n.id === activeNoteId
          ? {
              ...n,
              content: newContent,
              title: newContent.split('\\n')[0].replace(/^#+\\s*/, '') || 'Untitled Note',
              updatedAt: 'Just now',
            }
          : n
      )
    );
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '# New Note\\n\\nStart typing your markdown here...',
      tags: ['Draft'],
      updatedAt: 'Just now',
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string) => {
    if (notes.length <= 1) return;
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) {
      const remaining = notes.filter(n => n.id !== id);
      setActiveNoteId(remaining[0]?.id || '');
    }
  };

  // Filter notes by search and tag
  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = activeTag ? n.tags.includes(activeTag) : true;
    return matchesSearch && matchesTag;
  });

  const stats = calculateStats(activeNote?.content || '');

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans select-none">
      {/* Sidebar List */}
      <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="font-bold text-sm text-white">Markdown Notes</span>
          <button
            onClick={handleCreateNote}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
          >
            + New
          </button>
        </div>

        <div className="p-3 border-b border-slate-800">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredNotes.map(n => (
            <div
              key={n.id}
              onClick={() => setActiveNoteId(n.id)}
              className={\`p-3 rounded-xl cursor-pointer transition-colors \${
                activeNoteId === n.id
                  ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                  : 'bg-slate-950/60 border border-slate-850 hover:bg-slate-850 text-slate-300'
              }\`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs truncate">{n.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteNote(n.id); }}
                  className="text-slate-500 hover:text-red-400 text-xs px-1"
                >
                  ×
                </button>
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-1">{n.content.replace(/#+/g, '').trim()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Editor & Preview Split */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Info Bar */}
        <div className="h-10 px-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-3">
            <span>{stats.words} words</span>
            <span>&bull;</span>
            <span>{stats.chars} characters</span>
            <span>&bull;</span>
            <span>{stats.readingTimeMinutes} min read</span>
          </div>
          <span className="text-[11px] text-indigo-400 font-mono">Live Markdown Rendering</span>
        </div>

        {/* Split Editor and Preview */}
        <div className="flex-1 grid grid-cols-2 divide-x divide-slate-800 overflow-hidden">
          {/* Markdown Input */}
          <div className="p-4 flex flex-col bg-slate-950 overflow-hidden">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Editor (Markdown)</span>
            <textarea
              value={activeNote?.content || ''}
              onChange={(e) => handleUpdateContent(e.target.value)}
              className="flex-1 bg-transparent font-mono text-xs text-slate-200 resize-none focus:outline-none leading-relaxed p-2"
              placeholder="# Write your markdown here..."
            />
          </div>

          {/* HTML Render Output */}
          <div className="p-4 flex flex-col bg-slate-900/30 overflow-y-auto">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Live Preview (HTML)</span>
            <div
              className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(activeNote?.content || '') }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
`,
      contributions: [
        {
          id: 'c-3',
          fileId: 'file-notes-app',
          startLine: 1,
          endLine: 140,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
  ];

  const checkpoints: LearningCheckpoint[] = [
    {
      id: 'chk-notes-1',
      projectId: 'proj-notes',
      stepNumber: 1,
      title: 'Implement Word Count Calculation',
      conceptId: 'functions_parameters',
      conceptName: 'String Splitting & Metrics',
      taskType: 'COMPLETE_CODE',
      targetFileId: 'file-notes-utils',
      prompt: 'Complete `countWords(text: string): number` in `src/utils/markdown.ts`. It should trim the input, split on whitespace, and return the word count. If the string is empty or only whitespace, return 0.',
      contextExplanation: 'Calculating metrics on user text is a fundamental string processing task in note-taking and editor applications.',
      initialCode: `function countWords(text) {
  // YOUR CODE HERE: Return word count
}
`,
      solutionCode: `function countWords(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\\s+/).length;
}
`,
      testCases: [
        {
          id: 'tc-n1',
          description: 'Counts words in a standard sentence',
          assertionFn: 'return countWords("Hello world from Nirmaan") === 4;',
        },
        {
          id: 'tc-n2',
          description: 'Returns 0 for empty or whitespace-only string',
          assertionFn: 'return countWords("   ") === 0;',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Trimming whitespace',
          content: 'Use `text.trim()` to remove leading and trailing spaces before splitting.',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Regex for whitespace',
          content: '`trimmed.split(/\\s+/)` splits on spaces, tabs, and newlines.',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Syntax Expression',
          content: '`if (!trimmed) return 0; return trimmed.split(/\\s+/).length;`',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Full Function',
          content: `function countWords(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\\s+/).length : 0;
}`,
        },
      ],
      status: 'IN_PROGRESS',
      attempts: 0,
      hintsUsed: 0,
      whatChangedInPreview: 'The word counter at the top of the editor now updates dynamically as you type!',
    },
    {
      id: 'chk-notes-2',
      projectId: 'proj-notes',
      stepNumber: 2,
      title: 'Fix Note Filtering Bug',
      conceptId: 'array_methods',
      conceptName: 'Case-Insensitive Substring Search',
      taskType: 'FIX_BUG',
      targetFileId: 'file-notes-app',
      prompt: 'The search filter currently fails if the user types uppercase letters because it does strict case-sensitive matching. Fix `filterNotes(notes, query)` to make search case-insensitive.',
      contextExplanation: 'User search queries should always be normalized with `.toLowerCase()` to match content regardless of capitalization.',
      brokenCode: `function filterNotes(notes, query) {
  // BUG: Case-sensitive check fails when user searches "REACT" for "React"
  return notes.filter(n => n.title.includes(query) || n.content.includes(query));
}
`,
      solutionCode: `function filterNotes(notes, query) {
  const q = query.toLowerCase();
  return notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
}
`,
      testCases: [
        {
          id: 'tc-n3',
          description: 'Matches query regardless of letter case',
          assertionFn: 'const list = [{ title: "React State", content: "Hooks" }]; const res = filterNotes(list, "react"); return res.length === 1;',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Normalize strings',
          content: 'Convert both the query and the target note fields to lowercase.',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Lowercasing check',
          content: '`n.title.toLowerCase().includes(q)`',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Implementation',
          content: '`const q = query.toLowerCase(); return notes.filter(n => n.title.toLowerCase().includes(q));`',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Solution code',
          content: `function filterNotes(notes, query) {
  const q = query.toLowerCase();
  return notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
}`,
        },
      ],
      status: 'PENDING',
      attempts: 0,
      hintsUsed: 0,
      whatChangedInPreview: 'Searching now finds notes even if you type in lowercase or capital letters!',
    },
  ];

  const milestones: ProjectMilestone[] = [
    {
      id: 'm-n1',
      projectId: 'proj-notes',
      stepNumber: 1,
      title: 'Scaffolded Markdown Editor Workspace',
      description: 'AI created dual-pane editor and live HTML markdown parser.',
      conceptName: 'React Components',
      timestamp: Date.now() - 3600000,
      targetFile: 'src/App.tsx',
      completed: true,
    },
  ];

  const project: Project = {
    id: 'proj-notes',
    name: 'Markdown Note Studio',
    description: 'A dual-pane markdown editor with live HTML rendering, text statistics, and real-time search.',
    techStack: {
      frontend: 'React 18',
      language: 'TypeScript',
      styling: 'Tailwind CSS',
    },
    interventionLevel: 'guided',
    currentStage: 'Building Editor Engine & Search',
    activeFileId: 'file-notes-utils',
    files,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now(),
  };

  return { project, checkpoints, milestones };
}
