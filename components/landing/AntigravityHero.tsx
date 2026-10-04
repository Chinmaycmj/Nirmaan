'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Code2, 
  Layers, 
  Terminal, 
  CheckCircle2, 
  Loader2, 
  Zap, 
  GitBranch,
  GraduationCap,
  Check,
  ShieldCheck,
  Play,
  Server,
  Lightbulb,
  Award,
  AlertCircle,
  FileCode,
  FolderGit2
} from 'lucide-react';
import { InterventionLevel, Project } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone } from '@/types/learning';
import { GithubImportModal } from '@/components/github/GithubImportModal';
import { TrustTransparencyModal } from '@/components/modals/TrustTransparencyModal';

interface AntigravityHeroProps {
  onStartProject: (prompt: string, level: InterventionLevel, experience: string, techStack?: string) => void;
  onImportProject?: (data: {
    project: Project;
    checkpoints: LearningCheckpoint[];
    milestones: ProjectMilestone[];
  }) => void;
}

export const AntigravityHero: React.FC<AntigravityHeroProps> = ({ onStartProject, onImportProject }) => {
  const [prompt, setPrompt] = useState('');
  const [interventionLevel, setInterventionLevel] = useState<InterventionLevel>('guided');
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [techStack, setTechStack] = useState<string>('auto');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [planningStep, setPlanningStep] = useState(0);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [isTrustModalOpen, setIsTrustModalOpen] = useState(false);

  const sampleIdeas = [
    {
      title: 'Food Delivery Portal',
      prompt: 'Build a responsive food delivery menu portal with category filters, interactive cart state, and order summary.',
      stack: 'vanilla_web',
      stackLabel: 'HTML5 & CSS3 Flexbox',
      icon: '🍕',
    },
    {
      title: 'Financial Engine in Python',
      prompt: 'Build a computational arithmetic engine in Python 3 with zero-division safety and transaction logs.',
      stack: 'python',
      stackLabel: 'Python 3 Terminal',
      icon: '📊',
    },
    {
      title: 'High-Performance Math Engine',
      prompt: 'Build a high-performance calculation engine in C++ 20 with jump-table switch dispatch and error bounds.',
      stack: 'cpp',
      stackLabel: 'C++ 20 (g++ Native)',
      icon: '⚡',
    },
  ];

  const modeDescriptions: Record<InterventionLevel, string> = {
    tutor: 'Level 1: Tutor — You write 95%+ of code. AI gives Socratic guidance and syntax hints only.',
    pair: 'Level 2: Pair — AI suggests micro-snippets (≤ 8 lines); you write all control flow.',
    guided: 'Level 3: Guided Builder (Recommended) — AI scaffolds structure; you write critical logic (≥ 60% ownership).',
    collaborative: 'Level 3: Collaborative — Co-developed sections with periodic comprehension checks.',
    builder: 'Level 4: AI Builder — AI writes features; you review diffs, test edge cases, and justify logic.',
    ai: 'Level 5: Autopilot — AI generates full systems; gated behind mandatory explain-back audit.',
  };

  const handleLaunch = (selectedPrompt?: string, selectedStack?: string) => {
    const finalPrompt = (selectedPrompt || prompt).trim();
    if (!finalPrompt) {
      setValidationError('Please enter a project idea or click one of the examples below.');
      return;
    }
    setValidationError(null);

    if (selectedStack) {
      setTechStack(selectedStack);
    }

    setIsPlanning(true);
    setPlanningStep(1);

    setTimeout(() => setPlanningStep(2), 350);
    setTimeout(() => setPlanningStep(3), 750);
    setTimeout(() => setPlanningStep(4), 1150);
    setTimeout(() => {
      onStartProject(finalPrompt, interventionLevel, experience, selectedStack || techStack);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-screen bg-[#FFF1E7] text-[#1c1917] flex flex-col justify-between selection:bg-[#326080] selection:text-white relative overflow-x-hidden font-sans">
      
      {/* Background Architectural Canvas */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 z-0" 
        style={{
          backgroundImage: 'radial-gradient(rgba(180, 150, 110, 0.22) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} 
      />

      {/* Top Global Navigation */}
      <header className="h-16 px-6 md:px-12 flex items-center justify-between z-20 border-b border-[#ebdcd0] bg-[#FFF1E7]/95 backdrop-blur-md sticky top-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#326080] to-[#487a9e] flex items-center justify-center text-white shadow-md shadow-[#326080]/20">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-lg tracking-tight text-[#326080]">Nirmaan</span>
            <span className="text-[10px] font-mono uppercase bg-[#B5D2E6]/30 text-[#326080] font-bold px-2.5 py-0.5 rounded-full border border-[#B5D2E6]/60">
              AI Learning Studio
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={() => setIsTrustModalOpen(true)}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#44403c] border border-[#ebdcd0] font-semibold transition-all shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Isolated Sandbox</span>
          </button>

          <button
            onClick={() => setIsGithubModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-100/90 hover:bg-amber-200/80 text-[#805232] border border-amber-300 font-bold transition-all shadow-sm active:scale-95"
            title="Import public GitHub repository"
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Import Repo</span>
          </button>

          <a
            href="https://github.com/Chinmaycmj/Nirmaan"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 hover:text-[#1c1917] transition-colors bg-white/80 hover:bg-white px-3 py-1.5 rounded-full border border-[#ebdcd0] shadow-sm text-[#57534e] font-medium"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* HERO SECTION: BUILDER FORM (LEFT) + MOCK WORKSPACE PREVIEW (RIGHT)       */}
      {/* ========================================================================= */}
      <section className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-12 z-10 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: HEADLINE & CLEAR BUILDER FORM */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B5D2E6]/30 border border-[#B5D2E6]/60 text-[#326080] text-xs font-bold shadow-sm">
                <GraduationCap className="w-3.5 h-3.5 text-[#326080]" />
                <span>Don't just generate. Construct.</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1c1917] tracking-tight leading-tight">
                What do you want to <span className="text-[#326080]">build today?</span>
              </h1>

              <p className="text-sm md:text-base text-[#44403c] font-medium leading-relaxed max-w-xl">
                Nirmaan is the AI learning IDE where you ship real software and write the key logic yourself. The AI scaffolds and guides, but you own every critical decision.
              </p>
            </div>

            {/* Builder Form Card */}
            <div className="bg-white/95 border border-[#ebdcd0] rounded-3xl p-5 md:p-6 shadow-xl shadow-[#805232]/5 space-y-4 focus-within:border-[#326080] focus-within:ring-2 focus-within:ring-[#B5D2E6]/40 transition-all">
              {/* Prompt Textarea */}
              <div className="space-y-1">
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleLaunch();
                    }
                  }}
                  placeholder="Describe your project idea in plain English... (e.g. Build an expense analytics dashboard in Python with zero-division safety)"
                  rows={3}
                  className="w-full bg-transparent text-[#1c1917] placeholder-[#a8a29e] text-sm md:text-base resize-none focus:outline-none p-1 leading-relaxed"
                />
                {validationError && (
                  <p className="text-xs text-red-600 font-semibold flex items-center gap-1 animate-fadeIn">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{validationError}</span>
                  </p>
                )}
              </div>

              {/* 3 Clickable Example Ideas */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-mono uppercase font-bold text-[#78716c] block">
                  Click to try an example in 60s:
                </span>
                <div className="flex flex-wrap gap-2">
                  {sampleIdeas.map((idea, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPrompt(idea.prompt);
                        setTechStack(idea.stack);
                        if (validationError) setValidationError(null);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-[#faf6ee] hover:bg-[#f6e7db] border border-[#ebdcd0] text-xs text-[#44403c] font-medium flex items-center gap-1.5 transition-colors active:scale-95"
                    >
                      <span>{idea.icon}</span>
                      <span className="truncate max-w-[180px]">{idea.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Configuration Controls Row */}
              <div className="pt-3 border-t border-[#f0e3d7] grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {/* Level */}
                <div className="bg-[#FFF1E7]/80 border border-[#ebdcd0] rounded-xl px-2.5 py-1.5">
                  <span className="text-[#78716c] text-[10px] uppercase font-bold font-mono block">Your Level:</span>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value as any)}
                    className="w-full bg-transparent text-[#1c1917] font-semibold focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="beginner">Beginner (Guided)</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced (Deep)</option>
                  </select>
                </div>

                {/* AI Assistance Mode */}
                <div className="bg-[#FFF1E7]/80 border border-[#ebdcd0] rounded-xl px-2.5 py-1.5">
                  <span className="text-[#78716c] text-[10px] uppercase font-bold font-mono block">How Much AI Writes:</span>
                  <select
                    value={interventionLevel}
                    onChange={(e) => setInterventionLevel(e.target.value as any)}
                    className="w-full bg-transparent text-[#1c1917] font-semibold focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="guided">Guided Builder (Recommended)</option>
                    <option value="tutor">Tutor (You write 95%+)</option>
                    <option value="collaborative">Collaborative (Co-authored)</option>
                    <option value="builder">AI Builder (Diff Review)</option>
                  </select>
                </div>

                {/* Stack / Runtime */}
                <div className="bg-[#FFF1E7]/80 border border-[#ebdcd0] rounded-xl px-2.5 py-1.5">
                  <span className="text-[#78716c] text-[10px] uppercase font-bold font-mono block">Stack &amp; Sandbox:</span>
                  <select
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    className="w-full bg-transparent text-[#1c1917] font-semibold focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="auto">Auto-detect from prompt</option>
                    <optgroup label="Web (In-Browser Virtual DOM Sandbox)">
                      <option value="vanilla_web">Pure JS + CSS3 + HTML5</option>
                      <option value="react_ts">React 18 + TypeScript</option>
                      <option value="react_js">React 18 + Pure JavaScript</option>
                    </optgroup>
                    <optgroup label="Scripting (In-Browser Pyodide WASM)">
                      <option value="python">Python 3 (Terminal Sandbox)</option>
                    </optgroup>
                    <optgroup label="Systems (Isolated Compiler Runner)">
                      <option value="cpp">C++ 20 (g++ Native)</option>
                      <option value="java">Java 21 (OpenJDK)</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Assistance Mode One-Line Hint */}
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-[#78350f] flex items-center gap-2">
                <span className="font-bold font-mono text-[10px] uppercase bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-900">
                  Mode Policy:
                </span>
                <span>{modeDescriptions[interventionLevel]}</span>
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={() => handleLaunch()}
                disabled={isPlanning}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-[#326080] via-[#285573] to-[#1f435c] hover:from-[#285573] hover:to-[#173549] text-white text-sm md:text-base font-bold rounded-2xl shadow-lg shadow-[#326080]/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {isPlanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Architecting Project &amp; Learning Path...</span>
                  </>
                ) : (
                  <>
                    <span>Start Building</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: SHOW DO NOT TELL — MOCK WORKSPACE PREVIEW */}
          <div className="lg:col-span-5 w-full">
            <div className="rounded-3xl border border-[#ebdcd0] bg-white shadow-2xl overflow-hidden relative">
              {/* Window Header */}
              <div className="h-10 px-4 bg-[#faf6ee] border-b border-[#ebdcd0] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 font-mono text-[11px] font-bold text-[#1c1917]">
                    app.js • Nirmaan Workspace Preview
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    Live Session
                  </span>
                </div>
              </div>

              {/* Mock Split Studio */}
              <div className="p-3 bg-white space-y-3">
                {/* Slim Split Tabs */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-[#faf6ee] border border-[#ebdcd0]">
                    <span className="text-[10px] font-bold text-[#78716c] uppercase block">Reference:</span>
                    <pre className="text-[11px] text-[#44403c] mt-1 font-mono leading-tight">
{`function calculateTotal(items) {
  return items.reduce(
    (sum, i) => sum + i.price, 0
  );
}`}
                    </pre>
                  </div>

                  <div className="p-2 rounded-xl bg-[#fffdf8] border border-amber-300 ring-1 ring-amber-300/40">
                    <span className="text-[10px] font-bold text-[#92400e] uppercase flex items-center gap-1">
                      <span>Your Code</span>
                      <span className="bg-amber-200 text-amber-900 px-1 rounded text-[9px]">Active</span>
                    </span>
                    <pre className="text-[11px] text-[#1c1917] mt-1 font-mono leading-tight">
{`function calculateTotal(items) {
  // 🎯 YOUR TURN:
  // Accumulate price
  return items.reduce(...);
}`}
                    </pre>
                  </div>
                </div>

                {/* Live Hint Card */}
                <div className="p-3 rounded-2xl bg-[#faf6ee] border border-amber-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#92400e] flex items-center gap-1.5 text-[11px]">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span>Progressive Hint (1 of 4):</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#78716c]">Solution Locked</span>
                  </div>
                  <p className="text-[11px] text-[#57534e] leading-relaxed">
                    "Use array.reduce() with a 0 initial accumulator to sum up each item price without mutating state."
                  </p>
                </div>

                {/* Provenance Gauge */}
                <div className="p-2.5 rounded-2xl bg-white border border-[#ebdcd0] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-[#1c1917]">You Wrote: 42%</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Verified Ownership Active
                  </span>
                </div>
              </div>

              {/* Mock Status Bar */}
              <div className="h-7 px-3 bg-[#faf6ee] border-t border-[#ebdcd0] flex items-center justify-between text-[10px] font-mono text-[#78716c]">
                <span>Ln 12, Col 4 • JavaScript</span>
                <span>Auto-saved • Runs in isolated sandbox</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5-STEP LEARNING WORKFLOW: DESCRIBE -> SCAFFOLD -> WRITE -> RUN -> CHECK    */}
      {/* ========================================================================= */}
      <section className="border-t border-[#ebdcd0] bg-white/70 backdrop-blur-md py-12 px-6 md:px-12 z-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#326080]">
              The Nirmaan Learning Loop
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-[#1c1917] tracking-tight">
              How You Master Code While Building Real Software
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {[
              {
                step: '1',
                title: 'Describe',
                desc: 'Describe your application idea in plain English or select a curated project architecture.',
                icon: '💡',
              },
              {
                step: '2',
                title: 'Scaffold',
                desc: 'Nirmaan constructs the full multi-file directory with real production configurations.',
                icon: '🏗️',
              },
              {
                step: '3',
                title: 'Write',
                desc: 'You implement the key 10–20% logic directly in the editor with line-by-line concept guidance.',
                icon: '✍️',
              },
              {
                step: '4',
                title: 'Run',
                desc: 'Execute code instantly in isolated client-side or compiler sandboxes with live companion previews.',
                icon: '⚡',
              },
              {
                step: '5',
                title: 'Check',
                desc: 'Pass automated tests, complete explain-back audits, and earn certified ownership for your portfolio.',
                icon: '🏆',
              },
            ].map((st, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white border border-[#ebdcd0] shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xl">{st.icon}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#f6e7db] text-[#326080]">
                    Step {st.step}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#1c1917]">{st.title}</h3>
                <p className="text-xs text-[#57534e] leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4-MODE ASSISTANCE COMPARISON MATRIX                                       */}
      {/* ========================================================================= */}
      <section className="py-12 px-6 md:px-12 z-10 bg-[#FFF1E7]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#326080]">
              Predictable Assistance Policies
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-[#1c1917] tracking-tight">
              You Decide Exactly How Much the AI Writes
            </h2>
            <p className="text-xs md:text-sm text-[#57534e] max-w-xl mx-auto">
              No surprise autocomplete takeovers. Assistance levels are deterministic rules enforced by our policy engine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: 'Level 1: Tutor',
                badge: 'User Heavy',
                userRatio: 95,
                aiRatio: 5,
                desc: 'AI acts as a Socratic mentor: hints, questions, and concept explanations. Zero direct copy-paste code.',
                recommended: false,
              },
              {
                name: 'Level 2: Pair',
                badge: 'Micro-Snippets',
                userRatio: 80,
                aiRatio: 20,
                desc: 'AI proposes small snippets (≤ 8 lines); you write all control flow, logic, and state routines.',
                recommended: false,
              },
              {
                name: 'Level 3: Guided Builder',
                badge: 'Recommended',
                userRatio: 65,
                aiRatio: 35,
                desc: 'AI builds structural boilerplate; you implement key algorithms and business logic (≥ 60% ownership floor).',
                recommended: true,
              },
              {
                name: 'Level 4: AI Builder',
                badge: 'Diff Review',
                userRatio: 40,
                aiRatio: 60,
                desc: 'AI implements larger functional features; you audit diffs, test edge cases, and justify logic.',
                recommended: false,
              },
            ].map((m, idx) => (
              <div 
                key={idx} 
                className={`p-5 rounded-3xl border transition-all ${
                  m.recommended 
                    ? 'bg-white border-[#326080] shadow-md ring-2 ring-[#326080]/20' 
                    : 'bg-white/80 border-[#ebdcd0]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-[#1c1917]">{m.name}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    m.recommended ? 'bg-[#326080] text-white' : 'bg-[#faf6ee] text-[#78716c] border border-[#ebdcd0]'
                  }`}>
                    {m.badge}
                  </span>
                </div>

                {/* User vs AI Visual Ratio Bar */}
                <div className="space-y-1 my-3">
                  <div className="h-2 w-full rounded-full bg-amber-100 overflow-hidden flex">
                    <div className="bg-emerald-600 h-full" style={{ width: `${m.userRatio}%` }} />
                    <div className="bg-[#326080] h-full" style={{ width: `${m.aiRatio}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-emerald-700 font-bold">{m.userRatio}% You</span>
                    <span className="text-[#326080] font-bold">{m.aiRatio}% AI</span>
                  </div>
                </div>

                <p className="text-xs text-[#57534e] leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* HAVE A PROJECT? IMPORT GITHUB BAND                                        */}
      {/* ========================================================================= */}
      <section className="py-8 px-6 md:px-12 z-10 bg-white border-t border-b border-[#ebdcd0]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#805232] border border-amber-300 flex items-center justify-center shrink-0">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1c1917]">Already have a project? Import from GitHub</h3>
              <p className="text-xs text-[#78716c]">
                Ingest any repository URL to map architecture, isolate dependencies, and generate step-by-step challenges.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsGithubModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#326080] hover:bg-[#254b66] text-white text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
          >
            Import Repository URL →
          </button>
        </div>
      </section>

      {/* Planning Modal Overlay (When Launching) */}
      {isPlanning && (
        <div className="fixed inset-0 z-50 bg-[#1c1917]/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FFF1E7] border border-[#ebdcd0] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 text-center text-[#1c1917]">
            <div className="w-12 h-12 rounded-2xl bg-[#B5D2E6]/40 border border-[#B5D2E6]/80 text-[#326080] flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#1c1917] tracking-tight">AI Co-Developer Planning</h3>
              <p className="text-xs text-[#78716c] mt-1">Constructing project structure and policy-guarded learning path...</p>
            </div>

            <div className="space-y-2.5 text-left text-xs bg-white/80 p-4 rounded-2xl border border-[#ebdcd0]">
              <div className="flex items-center space-x-2.5 text-[#44403c]">
                {planningStep >= 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-[#326080] shrink-0" />
                )}
                <span>Analyzing natural language requirements</span>
              </div>
              <div className="flex items-center space-x-2.5 text-[#44403c]">
                {planningStep >= 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-[#326080] shrink-0" />
                )}
                <span>Configuring runtime &amp; assistance policy engine</span>
              </div>
              <div className="flex items-center space-x-2.5 text-[#44403c]">
                {planningStep >= 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-[#326080] shrink-0" />
                )}
                <span>Isolating educational concepts &amp; human checkpoints</span>
              </div>
              <div className="flex items-center space-x-2.5 text-[#44403c]">
                {planningStep >= 4 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-[#326080] shrink-0" />
                )}
                <span>Initializing Live Preview sandbox &amp; editor runtime</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Modal */}
      <GithubImportModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
        onImportComplete={(data) => {
          if (onImportProject) {
            onImportProject(data);
          } else {
            onStartProject(data.project.name, 'guided', 'beginner', data.project.techStack?.language);
          }
        }}
      />

      {/* Trust Modal */}
      <TrustTransparencyModal
        isOpen={isTrustModalOpen}
        onClose={() => setIsTrustModalOpen(false)}
      />

      {/* Footer */}
      <footer className="h-14 border-t border-[#ebdcd0] px-6 md:px-12 flex items-center justify-between text-xs text-[#78716c] z-10 bg-[#FFF1E7]/90 backdrop-blur-md">
        <div>&copy; 2026 Nirmaan. Designed for deep engineering learning.</div>
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsTrustModalOpen(true)} className="hover:text-[#1c1917] transition-colors">
            Isolated Sandbox
          </button>
          <span>&bull;</span>
          <a href="https://github.com/Chinmaycmj/Nirmaan" target="_blank" rel="noreferrer" className="hover:text-[#1c1917] transition-colors">
            GitHub Repository
          </a>
        </div>
      </footer>
    </div>
  );
};
