import fs from 'fs';
import path from 'path';

const filePath = path.resolve('components/vercel/VercelWorkspace.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add ChevronDown to lucide-react imports if missing
if (!content.includes('ChevronDown,')) {
  content = content.replace('ChevronRight,', 'ChevronRight,\n  ChevronDown,');
}

// 2. Add isAnalogyExpanded state and dynamic initialGreeting
const oldChatMessagesInit = `  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { 
      role: 'user', 
      text: initialPrompt || 'Build an application' 
    },
    { 
      role: 'assistant', 
      text: \`I've architected your application with React 18, TypeScript, and Tailwind CSS. The components and layout are live in the preview on the right. Now, let's build the core engineering concepts together step by step.\`
    },
  ]);`;

const newChatMessagesInit = `  const [isAnalogyExpanded, setIsAnalogyExpanded] = useState<boolean>(true);

  // Dynamic Assistant Greeting based on chosen stack
  const stackLanguage = initialProject.techStack?.language || 'JavaScript';
  const stackFramework = initialProject.techStack?.framework || '';
  const initialGreeting = initialProject.techStack?.runtime?.includes('Terminal') || initialProject.techStack?.runtime?.includes('g++') || initialProject.techStack?.runtime?.includes('OpenJDK') || initialProject.techStack?.runtime?.includes('Python')
    ? \`I've architected your application in \${stackLanguage} (\${initialProject.techStack.runtime}). The environment and live terminal runner are initialized on the right. Let's master the core engineering concepts together step by step!\`
    : \`I've architected your application with \${stackLanguage}\${stackFramework ? \` and \${stackFramework}\` : ''}. The live sandbox is running on the right. Now let's build the core engineering concepts together step by step!\`;

  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { 
      role: 'user', 
      text: initialPrompt || 'Build an application' 
    },
    { 
      role: 'assistant', 
      text: initialGreeting
    },
  ]);`;

if (content.includes(oldChatMessagesInit)) {
  content = content.replace(oldChatMessagesInit, newChatMessagesInit);
  console.log('Replaced chatMessages init with dynamic greeting and isAnalogyExpanded');
} else {
  console.warn('Could not find oldChatMessagesInit directly, checking variations...');
}

// 3. Update getTargetLanguage and getCodePlaceholder
const oldGetTargetLang = `  const getTargetLanguage = () => {
    const target = project.files.find(f => f.id === activeCheckpoint?.targetFileId);
    const name = target?.name || '';
    if (name.endsWith('.css') || activeCheckpoint?.conceptId.includes('css')) return 'CSS';
    if (name.endsWith('.js') || activeCheckpoint?.conceptId.includes('dom')) return 'JavaScript';
    if (name.endsWith('.py') || activeCheckpoint?.conceptId.includes('python')) return 'Python';
    if (name.endsWith('.html')) return 'HTML';
    return 'TypeScript';
  };

  const getCodePlaceholder = () => {
    const lang = getTargetLanguage();
    if (lang === 'CSS') return '/* Write your CSS rules here... */';
    if (lang === 'JavaScript') return '// Write your JavaScript code here...';
    if (lang === 'Python') return '# Write your Python code here...';
    if (lang === 'HTML') return '<!-- Write your HTML markup here... -->';
    return '// Write your TypeScript code here...';
  };`;

const newGetTargetLang = `  const getTargetLanguage = () => {
    if (activeCheckpoint?.language) {
      if (activeCheckpoint.language === 'cpp') return 'C++';
      if (activeCheckpoint.language === 'java') return 'Java';
      if (activeCheckpoint.language === 'python') return 'Python';
      if (activeCheckpoint.language === 'javascript') return 'JavaScript';
      if (activeCheckpoint.language === 'css') return 'CSS';
      if (activeCheckpoint.language === 'html') return 'HTML';
    }
    const target = project.files.find(f => f.id === activeCheckpoint?.targetFileId);
    const name = target?.name || '';
    if (name.endsWith('.cpp') || name.endsWith('.h')) return 'C++';
    if (name.endsWith('.java')) return 'Java';
    if (name.endsWith('.css') || activeCheckpoint?.conceptId.includes('css')) return 'CSS';
    if (name.endsWith('.js') || activeCheckpoint?.conceptId.includes('dom') || project.techStack?.language === 'JavaScript') return 'JavaScript';
    if (name.endsWith('.py') || activeCheckpoint?.conceptId.includes('python')) return 'Python';
    if (name.endsWith('.html')) return 'HTML';
    return project.techStack?.language || 'TypeScript';
  };

  const getCodePlaceholder = () => {
    const lang = getTargetLanguage();
    if (lang === 'C++') return '// Write your C++ calculate implementation here (e.g. switch(op) { case ... })...';
    if (lang === 'Java') return '// Write your Java calculate implementation here (e.g. switch(op) { case ... })...';
    if (lang === 'CSS') return '/* Write your CSS rules here... */';
    if (lang === 'JavaScript') return '// Write your JavaScript code here...';
    if (lang === 'Python') return '# Write your Python code here...';
    if (lang === 'HTML') return '<!-- Write your HTML markup here... -->';
    return '// Write your TypeScript code here...';
  };`;

if (content.includes(oldGetTargetLang)) {
  content = content.replace(oldGetTargetLang, newGetTargetLang);
  console.log('Replaced getTargetLanguage & getCodePlaceholder');
}

// 4. Update the layout background and micro-dot canvas
const oldLayoutRoot = `<div className="flex h-screen w-screen bg-[#09090b] text-[#f4f4f5] overflow-hidden font-sans select-none antialiased">`;
const newLayoutRoot = `<div className="flex h-screen w-screen bg-[#030712] text-[#f4f4f5] overflow-hidden font-sans select-none antialiased relative">
      {/* Award-winning micro-dot background grid canvas */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 z-0" 
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} 
      />`;

if (content.includes(oldLayoutRoot)) {
  content = content.replace(oldLayoutRoot, newLayoutRoot);
  console.log('Updated layout root with obsidian background & dot canvas');
}

// 5. Update left pane width and background
const oldLeftPane = `className="w-full lg:w-[480px] xl:w-[540px] shrink-0 border-r border-[#27272a] bg-[#09090b] flex flex-col h-full z-10"`;
const newLeftPane = `className="w-full lg:w-[520px] xl:w-[620px] shrink-0 border-r border-[#1f2430] bg-[#05070f]/95 backdrop-blur-md flex flex-col h-full z-10"`;

if (content.includes(oldLeftPane)) {
  content = content.replace(oldLeftPane, newLeftPane);
  console.log('Updated left pane width and styling');
}

// 6. Update task card with Real-life Analogy Accordion and Side-by-side Reference Code
const oldTaskForm = `              {/* Interactive Task Form Area */}
              <div className="mb-4">
                {/* Code-based tasks: COMPLETE_CODE, WRITE_SCRATCH, FIX_BUG */}
                {(activeCheckpoint.taskType === 'COMPLETE_CODE' ||
                  activeCheckpoint.taskType === 'WRITE_SCRATCH' ||
                  activeCheckpoint.taskType === 'FIX_BUG') && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-[#71717a] font-mono">
                      <span>YOUR IMPLEMENTATION ({getTargetLanguage()})</span>
                      {activeCheckpoint.taskType === 'FIX_BUG' && (
                        <span className="text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Bug identified in snippet
                        </span>
                      )}
                    </div>
                    <div className="relative rounded-lg overflow-hidden border border-[#27272a] bg-[#0c0c0e] focus-within:border-indigo-500/80 transition-colors">
                      <textarea
                        value={userCode}
                        onChange={e => setUserCode(e.target.value)}
                        placeholder={getCodePlaceholder()}
                        rows={7}
                        className="w-full bg-transparent p-3 text-xs font-mono text-emerald-400 resize-none outline-none leading-relaxed placeholder-[#3f3f46]"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                )}`;

const newTaskForm = `              {/* Real-Life Analogy & Concept Explanation Accordion */}
              {(activeCheckpoint.realLifeExample || activeCheckpoint.contextExplanation) && (
                <div className="mb-4 rounded-xl border border-purple-500/30 bg-purple-950/20 overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => setIsAnalogyExpanded(!isAnalogyExpanded)}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-purple-950/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🌍</span>
                      <span className="text-xs font-semibold text-purple-200">
                        Real-Life Analogy &amp; Explanation
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-purple-400 font-medium">
                      <span>{isAnalogyExpanded ? 'Hide' : 'Show Analogy'}</span>
                      <ChevronDown className={\`w-3.5 h-3.5 transition-transform \${isAnalogyExpanded ? 'rotate-180' : ''}\`} />
                    </div>
                  </button>

                  {isAnalogyExpanded && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-2 border-t border-purple-900/30 text-xs text-slate-300 leading-relaxed">
                      {activeCheckpoint.realLifeExample && (
                        <div className="p-2.5 rounded-lg bg-[#07090e]/90 border border-purple-800/30">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold mb-1">
                            Tangible Real-Life Example
                          </div>
                          <p className="text-slate-200 text-xs italic">
                            "{activeCheckpoint.realLifeExample}"
                          </p>
                        </div>
                      )}
                      {activeCheckpoint.contextExplanation && (
                        <div className="text-xs text-slate-300">
                          <span className="text-purple-300 font-medium">Why this code exists: </span>
                          {activeCheckpoint.contextExplanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Interactive Task Form Area */}
              <div className="mb-4">
                {/* Code-based tasks: COMPLETE_CODE, WRITE_SCRATCH, FIX_BUG */}
                {(activeCheckpoint.taskType === 'COMPLETE_CODE' ||
                  activeCheckpoint.taskType === 'WRITE_SCRATCH' ||
                  activeCheckpoint.taskType === 'FIX_BUG') && (
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white">Side-by-Side Guided Practice:</span>
                        <span className="ml-1 text-slate-300">
                          Examine the reference code below and type it into your workspace to master {getTargetLanguage()} syntax and build muscle memory.
                        </span>
                      </div>
                    </div>

                    {/* Side-by-side layout: Reference Code on left, User Workspace on right */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                      {/* COLUMN 1: REFERENCE CODE */}
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
                      </div>

                      {/* COLUMN 2: USER WORKSPACE */}
                      <div className="flex flex-col rounded-xl border border-indigo-500/40 bg-[#07090e] overflow-hidden focus-within:border-indigo-400 shadow-inner">
                        <div className="h-8 px-3 bg-indigo-950/50 border-b border-indigo-900/50 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-indigo-300">
                            <Code2 className="w-3 h-3" />
                            <span>YOUR WORKSPACE ({getTargetLanguage()})</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {userCode.trim().length > 0 ? \`\${userCode.split('\\n').length} lines\` : 'Type code here'}
                          </span>
                        </div>
                        <textarea
                          value={userCode}
                          onChange={e => setUserCode(e.target.value)}
                          placeholder={getCodePlaceholder()}
                          rows={8}
                          className="w-full bg-[#04060a] p-3 text-xs font-mono text-emerald-400 resize-none outline-none leading-relaxed placeholder-slate-600 min-h-[140px]"
                          spellCheck={false}
                        />
                      </div>
                    </div>
                  </div>
                )}`;

if (content.includes(oldTaskForm)) {
  content = content.replace(oldTaskForm, newTaskForm);
  console.log('Replaced task form with Side-by-Side reference and Real-Life Analogy accordion');
} else {
  console.warn('Could not find oldTaskForm directly, will need manual inspection');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Finished updating VercelWorkspace.tsx');
