'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Code2, 
  Layers, 
  Cpu, 
  Terminal, 
  CheckCircle2, 
  Loader2, 
  Compass, 
  Zap, 
  GitBranch,
  GraduationCap,
  Laptop,
  Check
} from 'lucide-react';
import { InterventionLevel, Project } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone } from '@/types/learning';
import { GithubImportModal } from '@/components/github/GithubImportModal';

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
  const [isPlanning, setIsPlanning] = useState(false);
  const [planningStep, setPlanningStep] = useState(0);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);

  const quickPrompts = [
    {
      title: 'Pure JS & Modern CSS Grid Calculator',
      tag: 'JavaScript + CSS',
      desc: 'Native web standards: HTML5 keypad, modern CSS Grid layout, and pure ES6 DOM calculations without frameworks or TypeScript.',
      prompt: 'Build me a simple calculator using Js and CSS.',
    },
    {
      title: 'C++20 High-Precision Engine',
      tag: 'C++20 (g++)',
      desc: 'Direct compilation with strict type safety, switch logic, and IEEE 754 division-by-zero nan protection.',
      prompt: 'Build me a calculator using C++ with zero-division error handling.',
    },
    {
      title: 'Java 21 Enterprise Calculator',
      tag: 'Java (OpenJDK)',
      desc: 'Static class methods, clean bytecode compilation, and Double.NaN arithmetic handling.',
      prompt: 'Build me a calculator using Java with zero-division error handling.',
    },
    {
      title: 'Python Arithmetic Engine',
      tag: 'Python 3',
      desc: 'Python terminal engine with pure functions, zero-division error handling, and interactive console runner.',
      prompt: 'Build me a calculator using Python with zero-division error handling.',
    },
    {
      title: 'Interactive React Calculator',
      tag: 'React + TypeScript',
      desc: 'React 18 & TypeScript calculator with grid keypad, arithmetic operations, and precision formatting.',
      prompt: 'Build me a simple calculator with arithmetic operations and modern keypad using React and TypeScript.',
    },
    {
      title: 'Modern Task Hub',
      tag: 'State & Events',
      desc: 'Interactive todo manager with priority filters, completion toggle, and clean list animations.',
      prompt: 'Build me a task management website using React, TypeScript and Tailwind CSS with priority tagging and status filters.',
    },
    {
      title: 'Smart Expense Tracker',
      tag: 'Financial Dashboard',
      desc: 'React, TypeScript, Array methods, summary cards, and financial transactions.',
      prompt: 'Build me a smart expense tracker with category summaries, add expense form, and transaction list using React, TypeScript, and Tailwind CSS.',
    },
    {
      title: 'Vanilla Web Notes Studio',
      tag: 'HTML + CSS + JS',
      desc: 'Local browser notes app with real-time DOM card rendering and CSS transitions.',
      prompt: 'Build me a notes app using vanilla JavaScript and CSS.',
    },
  ];

  const handleLaunch = (selectedPrompt?: string) => {
    const finalPrompt = selectedPrompt || prompt.trim();
    if (!finalPrompt) return;

    setIsPlanning(true);
    setPlanningStep(1);

    setTimeout(() => setPlanningStep(2), 500);
    setTimeout(() => setPlanningStep(3), 1000);
    setTimeout(() => setPlanningStep(4), 1500);
    setTimeout(() => {
      onStartProject(finalPrompt, interventionLevel, experience, techStack);
    }, 2000);
  };

  return (
    <div className="min-h-screen w-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between selection:bg-[#0e3a75] selection:text-white relative overflow-hidden font-sans">
      
      {/* Background: Geometric Deep Navy & Royal Blue Ribbon Angles (Matching User's Reference Slide) */}
      <div className="absolute top-0 right-0 w-[55vw] h-[100vh] pointer-events-none overflow-hidden z-0 hidden lg:block">
        {/* Layer 1: Sky/Cobalt blue accent ribbon */}
        <div 
          className="absolute -top-32 -right-20 w-[600px] h-[1100px] bg-[#2563eb] rounded-[60px] shadow-2xl opacity-90 transform rotate-[-35deg]"
        />
        {/* Layer 2: Intermediate royal blue ribbon */}
        <div 
          className="absolute -top-24 -right-10 w-[520px] h-[1100px] bg-[#1d4ed8] rounded-[60px] shadow-2xl opacity-95 transform rotate-[-35deg]"
        />
        {/* Layer 3: Deep Navy ribbon (matching user image #0e3a75) */}
        <div 
          className="absolute -top-16 right-0 w-[450px] h-[1100px] bg-[#0e3a75] rounded-[60px] shadow-2xl transform rotate-[-35deg]"
        />
        
        {/* Layer 4: Floating clean white preview card nestled inside diagonal angle */}
        <div 
          className="absolute top-28 right-16 w-[360px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 transform rotate-[-12deg] hover:rotate-0 transition-transform duration-500 ease-out pointer-events-auto"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[10px] font-mono font-semibold text-[#0e3a75] bg-blue-50 px-2 py-0.5 rounded-full">
              LIVE PREVIEW &amp; TUTOR
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-bold text-slate-800">Learn By Building</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Real code, live preview, progressive hints, token inspector.</p>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/70 border border-blue-100 text-[#0e3a75] text-[11px] font-medium">
              <span>Human Ownership</span>
              <span className="font-bold">60% - 100%</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-slate-600">
              <div className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Zero TS Leakage</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Official Docs Links</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle micro-dot pattern for modern high-end feel */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 z-0" 
        style={{
          backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} 
      />

      {/* Top Navigation */}
      <header className="h-16 px-6 md:px-12 flex items-center justify-between z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0e3a75] to-[#2563eb] flex items-center justify-center text-white shadow-md shadow-blue-900/20">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base tracking-tight text-[#0e3a75]">Nirmaan</span>
            <span className="text-[10px] font-semibold text-[#0e3a75] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
              AI Co-Developer Studio
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-600">
          <button
            onClick={() => setIsGithubModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-100/80 hover:bg-amber-200/90 text-[#92400e] border border-amber-300/80 font-bold transition-all shadow-sm active:scale-95"
            title="Import public GitHub repository"
          >
            <span>🐙 Import GitHub Repo</span>
          </button>
          <div className="hidden sm:flex items-center space-x-2 bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-full text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-700 font-medium">Antigravity Engine Active</span>
          </div>
          <a
            href="https://github.com/Chinmaycmj/Nirmaan"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 hover:text-slate-900 transition-colors bg-white hover:bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-slate-700 font-medium"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </header>

      {/* Main Hero & Central Prompt Box */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 z-10 max-w-4xl mx-auto w-full py-10">
        {/* Headline & Visual Dash Motif (Directly matching the user's reference slide) */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0e3a75] text-xs font-semibold mb-1 shadow-sm">
            <GraduationCap className="w-3.5 h-3.5 text-[#0e3a75]" />
            <span>Build Real Software • Master Core Concepts While Developing</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            What do you want to <span className="text-[#0e3a75]">build today?</span>
          </h1>

          {/* Accent dash indicator from user's image: blue bar + dot */}
          <div className="flex items-center justify-center space-x-2 pt-1">
            <div className="w-10 h-1.5 bg-[#0e3a75] rounded-full" />
            <div className="w-2.5 h-1.5 bg-slate-900 rounded-full" />
          </div>

          <p className="text-sm md:text-base text-slate-600 max-w-xl mx-auto leading-relaxed pt-1">
            AI builds with you, but not everything for you. Describe your project in plain English, and our co-developer will guide you step by step.
          </p>
        </div>

        {/* Central Prompt Card - Crisp White Modern Card with Deep Blue Accents */}
        <div className="w-full bg-white border border-slate-200/90 rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-xl shadow-slate-200/70 focus-within:border-[#0e3a75] focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-200">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleLaunch();
              }
            }}
            placeholder="e.g. Build me a simple calculator using Js and CSS..."
            rows={3}
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm md:text-base resize-none focus:outline-none p-2 leading-relaxed"
          />

          {/* Bottom Card Controls Row */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Experience level pill */}
              <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <span className="text-slate-500 text-[11px]">Level:</span>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value as any)}
                  className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer text-xs"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Mode pill */}
              <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <span className="text-slate-500 text-[11px]">Mode:</span>
                <select
                  value={interventionLevel}
                  onChange={(e) => setInterventionLevel(e.target.value as any)}
                  className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer text-xs"
                >
                  <option value="guided">Guided Builder (Recommended)</option>
                  <option value="tutor">Tutor (User Heavy)</option>
                  <option value="collaborative">Collaborative</option>
                  <option value="ai">AI Builder (Fast)</option>
                </select>
              </div>

              {/* Language / Stack pill */}
              <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <span className="text-slate-500 text-[11px]">Stack:</span>
                <select
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer text-xs"
                >
                  <option value="auto">Auto-detect from prompt</option>
                  <option value="vanilla_web">Pure JavaScript + CSS + HTML5</option>
                  <option value="cpp">C++ 20 (g++ native)</option>
                  <option value="java">Java 21 (OpenJDK)</option>
                  <option value="python">Python 3 (Terminal)</option>
                  <option value="react_ts">React 18 + TypeScript + Tailwind</option>
                  <option value="react_js">React 18 + Pure JavaScript</option>
                </select>
              </div>
            </div>

            {/* Launch button - Deep Navy to Cobalt Blue Gradient */}
            <button
              onClick={() => handleLaunch()}
              disabled={isPlanning}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-[#0e3a75] via-[#1d4ed8] to-[#2563eb] hover:from-[#0b2e5c] hover:to-[#1d4ed8] text-white text-xs md:text-sm font-bold rounded-xl shadow-lg shadow-blue-800/25 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPlanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Architecting Project...</span>
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

        {/* GitHub High-Scale Import Banner (Beach Sand Luxury Accent) */}
        <div className="w-full mt-4 p-4 rounded-2xl bg-[#fffdfa] border border-[#ebd7bf] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-[#92400e] shrink-0">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-xs text-[#1c1917] tracking-tight">
                Import Any Existing GitHub Project (Scale to 10–100+ Files &amp; 1,000+ Lines)
              </div>
              <p className="text-[11px] text-[#78716c]">
                Ingest any repository URL to break down every file, syntax token, and syllable line-by-line.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsGithubModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#0e4d82] hover:bg-[#09355b] text-white text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
          >
            Import Repository →
          </button>
        </div>

        {/* Quick Inspiration Templates */}
        <div className="w-full mt-8">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500 font-semibold uppercase tracking-wider px-1">
            <span>Or try a featured project idea</span>
            <span className="text-[11px] text-slate-400 font-normal">Click to start immediately</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickPrompts.map((item) => (
              <div
                key={item.title}
                onClick={() => {
                  setPrompt(item.prompt);
                  handleLaunch(item.prompt);
                }}
                className="group p-4 bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-[#0e3a75]/40 rounded-2xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-[#0e3a75] transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[10px] bg-blue-50 text-[#0e3a75] border border-blue-200 px-2 py-0.5 rounded-full font-semibold">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{item.desc}</p>
                </div>
                <div className="mt-3 flex items-center space-x-1 text-xs font-semibold text-[#0e3a75] group-hover:text-blue-600 transition-colors">
                  <span>Build with AI</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Planning Modal Overlay (When Launching) */}
      {isPlanning && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 text-center text-slate-900">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#0e3a75] flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">AI Co-Developer Planning</h3>
              <p className="text-xs text-slate-500 mt-1">Constructing project structure and learning path...</p>
            </div>

            <div className="space-y-2.5 text-left text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-2.5 text-slate-700">
                {planningStep >= 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-[#0e3a75] shrink-0" />
                )}
                <span>Analyzing natural language requirements</span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-700">
                {planningStep >= 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-[#0e3a75] shrink-0" />
                )}
                <span>Configuring compiler, runtime &amp; language engine</span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-700">
                {planningStep >= 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-[#0e3a75] shrink-0" />
                )}
                <span>Isolating educational concepts &amp; human checkpoints</span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-700">
                {planningStep >= 4 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-[#0e3a75] shrink-0" />
                )}
                <span>Initializing Live Preview sandbox &amp; editor runtime</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Repository Importer Modal */}
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

      {/* Footer */}
      <footer className="h-12 border-t border-slate-200/80 px-6 md:px-12 flex items-center justify-between text-xs text-slate-500 z-10 bg-white/70 backdrop-blur-md">
        <div>&copy; 2026 Nirmaan. Designed for deep engineering learning.</div>
        <div className="flex items-center space-x-4">
          <span>Isolated Client Sandbox</span>
          <span>&bull;</span>
          <span>AST Concept Engine</span>
          <span>&bull;</span>
          <span>Code Ownership Tracking</span>
        </div>
      </footer>
    </div>
  );
};
