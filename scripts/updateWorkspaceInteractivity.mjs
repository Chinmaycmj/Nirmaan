import fs from 'fs';
import path from 'path';

const filePath = path.resolve('components/vercel/VercelWorkspace.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import for InteractiveTokenCodeViewer
if (!content.includes('InteractiveTokenCodeViewer')) {
  content = content.replace(
    "import { validateCheckpointSubmission } from '@/lib/learning/validator';",
    "import { validateCheckpointSubmission } from '@/lib/learning/validator';\nimport { InteractiveTokenCodeViewer } from '@/components/learning/InteractiveTokenCodeViewer';"
  );
  console.log('Added InteractiveTokenCodeViewer import');
}

// 2. Replace static Column 1 pre block with InteractiveTokenCodeViewer
const oldColumn1 = `                      {/* COLUMN 1: REFERENCE CODE */}
                      <div className="flex flex-col rounded-xl border border-slate-800 bg-[#07090e] overflow-hidden shadow-inner">
                        <div className="h-8 px-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-amber-400">
                            <BookOpen className="w-3 h-3" />
                            <span>REFERENCE CODE ({getTargetLanguage()})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUserCode(activeCheckpoint.solutionCode)}
                            className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors font-mono"
                            title="Load reference into workspace"
                          >
                            Copy to Area
                          </button>
                        </div>
                        <div className="p-3 font-mono text-[11px] text-slate-300 bg-[#04060a] overflow-x-auto leading-relaxed max-h-56 select-text">
                          <pre className="text-slate-300 font-mono text-[11px]">
                            {activeCheckpoint.solutionCode || activeCheckpoint.initialCode}
                          </pre>
                        </div>
                      </div>`;

const newColumn1 = `                      {/* COLUMN 1: INTERACTIVE REFERENCE CODE WITH TOKEN & LINE INSPECTION */}
                      <div className="flex flex-col">
                        <InteractiveTokenCodeViewer
                          code={activeCheckpoint.solutionCode || activeCheckpoint.initialCode || ''}
                          language={getTargetLanguage()}
                          onCopyOrInsert={() => setUserCode(activeCheckpoint.solutionCode || activeCheckpoint.initialCode || '')}
                          title="REFERENCE CODE"
                        />
                      </div>`;

if (content.includes(oldColumn1)) {
  content = content.replace(oldColumn1, newColumn1);
  console.log('Replaced Column 1 with InteractiveTokenCodeViewer');
} else {
  console.warn('Could not find oldColumn1 exactly, checking variation...');
}

// 3. Replace pre blocks in PREDICT_OUTPUT and EXPLAIN_CODE with InteractiveTokenCodeViewer
const oldPredictPre = `                    {(activeCheckpoint.initialCode || activeCheckpoint.brokenCode) && (
                      <pre className="p-3 bg-[#0c0c0e] rounded-lg text-xs font-mono text-[#a1a1aa] border border-[#27272a] overflow-x-auto mb-2">
                        {activeCheckpoint.initialCode || activeCheckpoint.brokenCode}
                      </pre>
                    )}`;

const newPredictPre = `                    {(activeCheckpoint.initialCode || activeCheckpoint.brokenCode) && (
                      <div className="mb-2">
                        <InteractiveTokenCodeViewer
                          code={activeCheckpoint.initialCode || activeCheckpoint.brokenCode || ''}
                          language={getTargetLanguage()}
                          title="CODE SNIPPET"
                        />
                      </div>
                    )}`;

content = content.replaceAll(oldPredictPre, newPredictPre);
console.log('Replaced snippet pre blocks with InteractiveTokenCodeViewer');

// 4. Update the User Workspace column styling to monochrome obsidian with zinc borders
const oldCol2Header = `bg-indigo-950/50 border-b border-indigo-900/50 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-indigo-300">
                            <Code2 className="w-3 h-3" />
                            <span>YOUR WORKSPACE ({getTargetLanguage()})</span>
                          </div>`;

const newCol2Header = `bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-zinc-200">
                            <Code2 className="w-3 h-3 text-zinc-400" />
                            <span>YOUR WORKSPACE ({getTargetLanguage()})</span>
                          </div>`;

if (content.includes(oldCol2Header)) {
  content = content.replace(oldCol2Header, newCol2Header);
  console.log('Updated Column 2 header styling');
}

const oldCol2Box = `<div className="flex flex-col rounded-xl border border-indigo-500/40 bg-[#07090e] overflow-hidden focus-within:border-indigo-400 shadow-inner">`;
const newCol2Box = `<div className="flex flex-col rounded-xl border border-zinc-800 bg-[#08090d] overflow-hidden focus-within:border-zinc-500 shadow-2xl">`;

if (content.includes(oldCol2Box)) {
  content = content.replace(oldCol2Box, newCol2Box);
  console.log('Updated Column 2 container styling');
}

// 5. Update guidance pill
const oldGuidancePill = `<div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white">Side-by-Side Guided Practice:</span>
                        <span className="ml-1 text-slate-300">
                          Examine the reference code below and type it into your workspace to master {getTargetLanguage()} syntax and build muscle memory.
                        </span>
                      </div>
                    </div>`;

const newGuidancePill = `<div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2 shadow-sm">
                      <Sparkles className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white">Interactive Guided Practice:</span>
                        <span className="ml-1 text-zinc-400">
                          Bring cursor to any line in the reference code to view instant explanations and jump to official external documentation (MDN, cppreference, Python docs, Oracle Java). Type the code into your workspace on the right to master syntax.
                        </span>
                      </div>
                    </div>`;

if (content.includes(oldGuidancePill)) {
  content = content.replace(oldGuidancePill, newGuidancePill);
  console.log('Updated guidance pill text & styling');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Finished updating VercelWorkspace.tsx with interactive token viewer and monochrome styling');
