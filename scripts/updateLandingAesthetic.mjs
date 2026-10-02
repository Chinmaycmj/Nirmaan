import fs from 'fs';
import path from 'path';

const heroPath = path.resolve('components/landing/AntigravityHero.tsx');

const heroContent = `'use client';

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
  onStartProject: (prompt: string, level: InterventionLevel, experience: string, techStack?: string) => void;
}

export const AntigravityHero: React.FC<AntigravityHeroProps> = ({ onStartProject }) => {
  const [prompt, setPrompt] = useState('');
  const [interventionLevel, setInterventionLevel] = useState<InterventionLevel>('guided');
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [techStack, setTechStack] = useState<string>('auto');
  const [isPlanning, setIsPlanning] = useState(false);
  const [planningStep, setPlanningStep] = useState(0);

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
    <div className="min-h-screen w-screen bg-[#000000] text-zinc-100 flex flex-col justify-between selection:bg-white selection:text-black relative overflow-hidden font-sans">
      {/* Top 10 Best Web Designs: Clean obsidian void with crisp micro-dot grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 z-0" 
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} 
      />

      {/* Titanium / Silver ambient illumination (Zero generic blue/indigo) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-white/[0.08] via-zinc-400/[0.03] to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-white/[0.03] blur-[150px] pointer-events-none" />

      {/* Top Navigation */}
      <header className="h-16 px-6 md:px-12 flex items-center justify-between z-10 border-b border-zinc-800/80 bg-[#000000]/70 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-zinc-100 to-zinc-400 flex items-center justify-center text-black shadow-lg shadow-white/10 ring-1 ring-white/20">
            <Sparkles className="w-4 h-4 fill-black" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base tracking-tight text-white">Nirmaan</span>
            <span className="text-[10px] font-mono font-medium text-zinc-300 bg-zinc-900/90 border border-zinc-700/60 px-2.5 py-0.5 rounded-full">
              AI Co-Developer Studio
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs text-zinc-400">
          <div className="hidden sm:flex items-center space-x-2 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-full text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-300 font-medium">Antigravity Engine Active</span>
          </div>
          <a
            href="https://github.com/Chinmaycmj/Nirmaan"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 hover:text-white transition-colors bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-800 text-zinc-300"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </header>

      {/* Main Hero & Central Prompt Box */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 z-10 max-w-4xl mx-auto w-full py-12">
        {/* Headline & Badge */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs font-medium mb-1 shadow-sm">
            <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
            <span>Build Real Software • Master Core Engineering Concepts</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            What do you want to <span className="bg-gradient-to-b from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">build today?</span>
          </h1>
          <p className="text-sm md:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            AI builds with you, but not everything for you. Describe your project idea, and our co-developer will guide you through writing and understanding the code.
          </p>
        </div>

        {/* Central Prompt Card - World Class Monochrome Glass */}
        <div className="w-full bg-[#0a0a0d]/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-2xl backdrop-blur-2xl focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-white/20 transition-all duration-200">
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
            className="w-full bg-transparent text-white placeholder-zinc-500 text-sm md:text-base resize-none focus:outline-none p-3 leading-relaxed"
          />

          {/* Bottom Card Controls Row */}
          <div className="pt-3 border-t border-zinc-850 flex flex-wrap items-center justify-between gap-3 px-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Experience level pill */}
              <div className="flex items-center space-x-1 bg-zinc-900/80 border border-zinc-800 rounded-xl px-2.5 py-1.5">
                <span className="text-zinc-500 text-[11px]">Level:</span>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value as any)}
                  className="bg-transparent text-zinc-200 font-medium focus:outline-none cursor-pointer text-xs"
                >
                  <option value="beginner" className="bg-zinc-900 text-zinc-200">Beginner</option>
                  <option value="intermediate" className="bg-zinc-900 text-zinc-200">Intermediate</option>
                  <option value="advanced" className="bg-zinc-900 text-zinc-200">Advanced</option>
                </select>
              </div>

              {/* Mode pill */}
              <div className="flex items-center space-x-1 bg-zinc-900/80 border border-zinc-800 rounded-xl px-2.5 py-1.5">
                <span className="text-zinc-500 text-[11px]">Mode:</span>
                <select
                  value={interventionLevel}
                  onChange={(e) => setInterventionLevel(e.target.value as any)}
                  className="bg-transparent text-zinc-200 font-medium focus:outline-none cursor-pointer text-xs"
                >
                  <option value="guided" className="bg-zinc-900 text-zinc-200">Guided Builder (Recommended)</option>
                  <option value="tutor" className="bg-zinc-900 text-zinc-200">Tutor (User Heavy)</option>
                  <option value="collaborative" className="bg-zinc-900 text-zinc-200">Collaborative</option>
                  <option value="ai" className="bg-zinc-900 text-zinc-200">AI Builder (Fast)</option>
                </select>
              </div>

              {/* Language / Stack pill */}
              <div className="flex items-center space-x-1 bg-zinc-900/80 border border-zinc-800 rounded-xl px-2.5 py-1.5">
                <span className="text-zinc-500 text-[11px]">Stack:</span>
                <select
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  className="bg-transparent text-zinc-200 font-medium focus:outline-none cursor-pointer text-xs"
                >
                  <option value="auto" className="bg-zinc-900 text-zinc-200">Auto-detect from prompt</option>
                  <option value="vanilla_web" className="bg-zinc-900 text-zinc-200">Pure JavaScript + CSS + HTML5</option>
                  <option value="cpp" className="bg-zinc-900 text-zinc-200">C++ 20 (g++ native)</option>
                  <option value="java" className="bg-zinc-900 text-zinc-200">Java 21 (OpenJDK)</option>
                  <option value="python" className="bg-zinc-900 text-zinc-200">Python 3 (Terminal)</option>
                  <option value="react_ts" className="bg-zinc-900 text-zinc-200">React 18 + TypeScript + Tailwind</option>
                  <option value="react_js" className="bg-zinc-900 text-zinc-200">React 18 + Pure JavaScript</option>
                </select>
              </div>
            </div>

            {/* Launch button - High-contrast Pure White Vercel/Linear style */}
            <button
              onClick={() => handleLaunch()}
              disabled={isPlanning}
              className="flex items-center space-x-2 px-5 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs md:text-sm font-bold rounded-xl shadow-lg shadow-white/10 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPlanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Architecting Project...</span>
                </>
              ) : (
                <>
                  <span>Start Building</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Inspiration Templates */}
        <div className="w-full mt-8">
          <div className="flex items-center justify-between mb-3 text-xs text-zinc-400 font-semibold uppercase tracking-wider px-1">
            <span>Or try a featured project idea</span>
            <span className="text-[11px] text-zinc-500 font-normal">Click to start immediately</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickPrompts.map((item) => (
              <div
                key={item.title}
                onClick={() => {
                  setPrompt(item.prompt);
                  handleLaunch(item.prompt);
                }}
                className="group p-4 bg-[#0a0a0d]/80 hover:bg-[#121215] border border-zinc-850 hover:border-zinc-700 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-zinc-200 group-hover:text-white transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700/80 px-2 py-0.5 rounded-full font-mono">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{item.desc}</p>
                </div>
                <div className="mt-3 flex items-center space-x-1 text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0c10] border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">AI Co-Developer Planning</h3>
              <p className="text-xs text-zinc-400 mt-1">Constructing project structure and learning path...</p>
            </div>

            <div className="space-y-2.5 text-left text-xs bg-black p-4 rounded-2xl border border-zinc-850">
              <div className="flex items-center space-x-2.5 text-zinc-300">
                {planningStep >= 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-400 shrink-0" />
                )}
                <span>Analyzing natural language requirements</span>
              </div>
              <div className="flex items-center space-x-2.5 text-zinc-300">
                {planningStep >= 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-400 shrink-0" />
                )}
                <span>Configuring compiler, runtime &amp; language engine</span>
              </div>
              <div className="flex items-center space-x-2.5 text-zinc-300">
                {planningStep >= 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-400 shrink-0" />
                )}
                <span>Isolating educational concepts &amp; human checkpoints</span>
              </div>
              <div className="flex items-center space-x-2.5 text-zinc-300">
                {planningStep >= 4 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-400 shrink-0" />
                )}
                <span>Initializing Live Preview sandbox &amp; editor runtime</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="h-12 border-t border-zinc-900 px-6 md:px-12 flex items-center justify-between text-xs text-zinc-500 z-10 bg-black/60">
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
`;

fs.writeFileSync(heroPath, heroContent, 'utf8');
console.log('Successfully updated AntigravityHero.tsx with monochrome luxury obsidian design');
