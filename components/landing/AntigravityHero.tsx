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
  GraduationCap
} from 'lucide-react';
import { InterventionLevel } from '@/types/project';

interface AntigravityHeroProps {
  onStartProject: (prompt: string, level: InterventionLevel, experience: string) => void;
}

export const AntigravityHero: React.FC<AntigravityHeroProps> = ({ onStartProject }) => {
  const [prompt, setPrompt] = useState('');
  const [interventionLevel, setInterventionLevel] = useState<InterventionLevel>('guided');
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [isPlanning, setIsPlanning] = useState(false);
  const [planningStep, setPlanningStep] = useState(0);

  const quickPrompts = [
    {
      title: 'Smart Expense Tracker',
      tag: 'Section 45 Walkthrough',
      desc: 'React, TypeScript, Array methods, summary cards, and financial transactions.',
      prompt: 'Build me a smart expense tracker with category summaries, add expense form, and transaction list using React, TypeScript, and Tailwind CSS.',
    },
    {
      title: 'Modern Task Hub',
      tag: 'State & Events',
      desc: 'Interactive todo manager with priority filters, completion toggle, and clean list animations.',
      prompt: 'Build me a task management website using React, TypeScript and Tailwind CSS with priority tagging and status filters.',
    },
    {
      title: 'Live Weather Dashboard',
      tag: 'Async / API Calls',
      desc: 'Weather forecast cards, city search, condition badges, and async fetch data flow.',
      prompt: 'Build a weather dashboard with search, 5-day forecast cards, and temperature charts.',
    },
    {
      title: 'Habit & Streak Tracker',
      tag: 'Data Modeling',
      desc: 'Daily check-in habit board with completion streaks, calendar cards, and stats.',
      prompt: 'Build a daily habit tracker with weekly streaks, completion toggles, and habit statistics.',
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
      onStartProject(finalPrompt, interventionLevel, experience);
    }, 2000);
  };

  return (
    <div className="min-h-screen w-screen bg-[#07090e] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-32 left-1/3 w-[600px] h-[300px] bg-indigo-900/10 blur-[140px] pointer-events-none" />

      {/* Top Navigation */}
      <header className="h-16 px-6 md:px-12 flex items-center justify-between z-10 border-b border-slate-800/40 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base tracking-tight text-white">Nirmaan</span>
            <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              AI Co-Developer &amp; Learning Studio
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs text-slate-400">
          <div className="hidden sm:flex items-center space-x-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300 font-medium">Antigravity Engine Active</span>
          </div>
          <a
            href="https://github.com/Chinmaycmj/Nirmaan"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 hover:text-white transition-colors bg-slate-900/50 hover:bg-slate-850 px-3 py-1.5 rounded-full border border-slate-800"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </header>

      {/* Main Hero & Prompt Box */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 z-10 max-w-4xl mx-auto w-full py-12">
        {/* Antigravity Headline */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-1">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Build Real Software • Master Core Concepts</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            What do you want to <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">build today?</span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            AI builds with you, but not everything for you. Describe your project idea, and our co-developer will guide you through writing and understanding the code.
          </p>
        </div>

        {/* Central Prompt Card */}
        <div className="w-full bg-slate-900/70 border border-slate-800/90 rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-2xl backdrop-blur-xl focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all duration-200">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleLaunch();
              }
            }}
            placeholder="e.g. Build me a task management website using React, TypeScript and Tailwind CSS..."
            rows={3}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm md:text-base resize-none focus:outline-none p-3 leading-relaxed"
          />

          {/* Bottom Card Controls Row */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 px-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Experience level pill */}
              <div className="flex items-center space-x-1 bg-slate-950/70 border border-slate-800 rounded-xl px-2.5 py-1.5">
                <span className="text-slate-500 text-[11px]">Level:</span>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value as any)}
                  className="bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer text-xs"
                >
                  <option value="beginner" className="bg-slate-900 text-slate-200">Beginner</option>
                  <option value="intermediate" className="bg-slate-900 text-slate-200">Intermediate</option>
                  <option value="advanced" className="bg-slate-900 text-slate-200">Advanced</option>
                </select>
              </div>

              {/* Mode pill */}
              <div className="flex items-center space-x-1 bg-slate-950/70 border border-slate-800 rounded-xl px-2.5 py-1.5">
                <span className="text-slate-500 text-[11px]">Mode:</span>
                <select
                  value={interventionLevel}
                  onChange={(e) => setInterventionLevel(e.target.value as any)}
                  className="bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer text-xs"
                >
                  <option value="guided" className="bg-slate-900 text-slate-200">Guided Builder (Recommended)</option>
                  <option value="tutor" className="bg-slate-900 text-slate-200">Tutor (User Heavy)</option>
                  <option value="collaborative" className="bg-slate-900 text-slate-200">Collaborative</option>
                  <option value="ai" className="bg-slate-900 text-slate-200">AI Builder (Fast)</option>
                </select>
              </div>
            </div>

            {/* Launch button */}
            <button
              onClick={() => handleLaunch()}
              disabled={isPlanning}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs md:text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPlanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Architecting Project...</span>
                </>
              ) : (
                <>
                  <span>Start Building</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Inspiration Templates */}
        <div className="w-full mt-8">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400 font-semibold uppercase tracking-wider px-1">
            <span>Or try a featured project idea</span>
            <span className="text-[11px] text-slate-500 font-normal">Click to start immediately</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickPrompts.map((item) => (
              <div
                key={item.title}
                onClick={() => {
                  setPrompt(item.prompt);
                  handleLaunch(item.prompt);
                }}
                className="group p-4 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-medium">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{item.desc}</p>
                </div>
                <div className="mt-3 flex items-center space-x-1 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">AI Co-Developer Planning</h3>
              <p className="text-xs text-slate-400 mt-1">Constructing project structure and learning path...</p>
            </div>

            <div className="space-y-2.5 text-left text-xs bg-slate-950 p-4 rounded-2xl border border-slate-850">
              <div className="flex items-center space-x-2.5 text-slate-300">
                {planningStep >= 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
                )}
                <span>Analyzing natural language requirements</span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-300">
                {planningStep >= 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
                )}
                <span>Configuring React 18, TypeScript &amp; Tailwind stack</span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-300">
                {planningStep >= 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
                )}
                <span>Isolating educational concepts &amp; human checkpoints</span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-300">
                {planningStep >= 4 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
                )}
                <span>Initializing Live Preview sandbox &amp; Monaco editor</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="h-12 border-t border-slate-800/40 px-6 md:px-12 flex items-center justify-between text-xs text-slate-500 z-10">
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
