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
  Check,
  ShieldCheck,
  Play,
  Server
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
  const [isPlanning, setIsPlanning] = useState(false);
  const [planningStep, setPlanningStep] = useState(0);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [isTrustModalOpen, setIsTrustModalOpen] = useState(false);

  const handleLaunch = (selectedPrompt?: string, selectedStack?: string) => {
    const finalPrompt = (selectedPrompt || prompt).trim();
    if (!finalPrompt) return;

    if (selectedStack) {
      setTechStack(selectedStack);
    }

    setIsPlanning(true);
    setPlanningStep(1);

    setTimeout(() => setPlanningStep(2), 400);
    setTimeout(() => setPlanningStep(3), 800);
    setTimeout(() => setPlanningStep(4), 1200);
    setTimeout(() => {
      onStartProject(finalPrompt, interventionLevel, experience, selectedStack || techStack);
    }, 1600);
  };

  const starterExamples = [
    {
      title: 'Food Delivery Menu & Order Portal',
      prompt: 'Build a responsive food delivery menu portal with category filters, cart state, and order summary.',
      stack: 'vanilla_web',
      stackLabel: 'HTML5 & CSS3 Flexbox',
      icon: '🍕',
      location: 'Browser Virtual DOM',
    },
    {
      title: 'Financial Analytics & Calculator',
      prompt: 'Build a computational arithmetic engine in Python 3 with zero-division safety and transaction logs.',
      stack: 'python',
      stackLabel: 'Python 3 Terminal',
      icon: '📊',
      location: 'Pyodide Worker Sandbox',
    },
    {
      title: 'High-Performance Math Engine',
      prompt: 'Build a high-performance calculation engine in C++ 20 with jump-table switch dispatch and error bounds.',
      stack: 'cpp',
      stackLabel: 'C++ 20 (g++ Native)',
      icon: '⚡',
      location: 'Isolated Compiler Sandbox',
    },
  ];

  return (
    <div className="min-h-screen w-screen bg-[#FFF1E7] text-[#1c1917] flex flex-col justify-between selection:bg-[#326080] selection:text-white relative overflow-hidden font-sans">
      
      {/* Ambient Lighting */}
      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] bg-[#B5D2E6]/35 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-[#805232]/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-[#B5D2E6]/25 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Micro-dot canvas */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 z-0" 
        style={{
          backgroundImage: 'radial-gradient(rgba(128, 82, 50, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} 
      />

      {/* Top Navigation */}
      <header className="h-16 px-6 md:px-12 flex items-center justify-between z-10 border-b border-[#ebdcd0] bg-[#FFF1E7]/90 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#326080] to-[#487a9e] flex items-center justify-center text-white shadow-md shadow-[#326080]/20">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base tracking-tight text-[#326080]">Nirmaan</span>
            <span className="text-[10px] font-semibold text-[#326080] bg-[#B5D2E6]/30 border border-[#B5D2E6]/60 px-2.5 py-0.5 rounded-full">
              AI Learning IDE &amp; Mentor
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-[#57534e]">
          <button
            onClick={() => setIsTrustModalOpen(true)}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#44403c] border border-[#ebdcd0] font-semibold transition-all shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Trust &amp; Execution</span>
          </button>

          <button
            onClick={() => setIsGithubModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#805232]/10 hover:bg-[#805232]/20 text-[#805232] border border-[#805232]/30 font-bold transition-all shadow-sm active:scale-95"
            title="Import public GitHub repository"
          >
            <span>🐙 Import Repo</span>
          </button>

          {/* Core Engine Health Indicator */}
          <div 
            onClick={() => setIsTrustModalOpen(true)}
            className="hidden sm:flex items-center space-x-2 bg-white/80 border border-[#ebdcd0] shadow-sm px-3 py-1.5 rounded-full text-[11px] cursor-pointer hover:bg-white transition-all"
            title="AST Parser · Tiered Sandbox · Policy Engine Active"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[#326080] font-medium">Nirmaan Core Engine Active</span>
          </div>

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

      {/* Main Hero & Central Prompt Box */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 z-10 max-w-4xl mx-auto w-full py-8">
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#B5D2E6]/30 border border-[#B5D2E6]/60 text-[#326080] text-xs font-semibold mb-1 shadow-sm">
            <GraduationCap className="w-3.5 h-3.5 text-[#326080]" />
            <span>AI Builds With You, Not For You • Own Every Line</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1c1917] tracking-tight leading-tight">
            What do you want to <span className="text-[#326080]">build today?</span>
          </h1>

          <div className="flex items-center justify-center space-x-2 pt-1">
            <div className="w-10 h-1.5 bg-[#326080] rounded-full" />
            <div className="w-2.5 h-1.5 bg-[#805232] rounded-full" />
          </div>

          <p className="text-sm md:text-base text-[#3d3834] font-medium max-w-xl mx-auto leading-relaxed pt-1">
            Build real software while you master every line. Our deterministic policy engine ensures you write and understand critical logic.
          </p>
        </div>

        {/* Central Prompt Card */}
        <div className="w-full bg-white/95 border border-[#ebdcd0] rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-xl shadow-[#805232]/5 focus-within:border-[#326080] focus-within:ring-4 focus-within:ring-[#B5D2E6]/40 transition-all duration-200">
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
            className="w-full bg-transparent text-[#1c1917] placeholder-[#9e948a] text-sm md:text-base resize-none focus:outline-none p-2 leading-relaxed"
          />

          {/* Controls Row */}
          <div className="pt-3 border-t border-[#f0e3d7] flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Level pill */}
              <div className="flex items-center space-x-1 bg-[#FFF1E7]/80 border border-[#ebdcd0] rounded-xl px-2.5 py-1.5">
                <span className="text-[#78716c] text-[11px]">Skill:</span>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value as any)}
                  className="bg-transparent text-[#332e2a] font-medium focus:outline-none cursor-pointer text-xs"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Mode pill (5 AI Assistance Levels) */}
              <div className="flex items-center space-x-1 bg-[#FFF1E7]/80 border border-[#ebdcd0] rounded-xl px-2.5 py-1.5">
                <span className="text-[#78716c] text-[11px]">Assistance:</span>
                <select
                  value={interventionLevel}
                  onChange={(e) => setInterventionLevel(e.target.value as any)}
                  className="bg-transparent text-[#332e2a] font-medium focus:outline-none cursor-pointer text-xs"
                >
                  <option value="guided">Level 3: Co-Developer (Recommended)</option>
                  <option value="tutor">Level 1: Tutor (User Heavy)</option>
                  <option value="pair">Level 2: Pair Programming</option>
                  <option value="builder">Level 4: AI Builder</option>
                  <option value="ai">Level 5: Autopilot (Gated)</option>
                </select>
              </div>

              {/* Language / Stack grouped by runtime environment */}
              <div className="flex items-center space-x-1 bg-[#FFF1E7]/80 border border-[#ebdcd0] rounded-xl px-2.5 py-1.5">
                <span className="text-[#78716c] text-[11px]">Runtime:</span>
                <select
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  className="bg-transparent text-[#332e2a] font-medium focus:outline-none cursor-pointer text-xs"
                >
                  <option value="auto">Auto-detect from prompt</option>
                  <optgroup label="Web Stacks (Runs in your browser)">
                    <option value="vanilla_web">Pure JavaScript + CSS + HTML5</option>
                    <option value="react_ts">React 18 + TypeScript + Tailwind</option>
                    <option value="react_js">React 18 + Pure JavaScript</option>
                  </optgroup>
                  <optgroup label="Scripting Stacks (Pyodide Worker Sandbox)">
                    <option value="python">Python 3 (Terminal &amp; Logic)</option>
                  </optgroup>
                  <optgroup label="Systems Stacks (Secure Compiler Sandbox)">
                    <option value="cpp">C++ 20 (g++ Native)</option>
                    <option value="java">Java 21 (OpenJDK)</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Launch button */}
            <button
              onClick={() => handleLaunch()}
              disabled={isPlanning}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-[#326080] via-[#285573] to-[#1f435c] hover:from-[#285573] hover:to-[#173549] text-white text-xs md:text-sm font-bold rounded-xl shadow-lg shadow-[#326080]/25 transition-all active:scale-95 disabled:opacity-50"
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

        {/* 1-Click Starter Examples (Value-First in 60s) */}
        <div className="w-full mt-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#78716c]">
              Or Try An Example In 60 Seconds:
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {starterExamples.map((ex, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setPrompt(ex.prompt);
                  handleLaunch(ex.prompt, ex.stack);
                }}
                className="p-3 rounded-2xl bg-white/80 hover:bg-white border border-[#ebdcd0] hover:border-[#326080] cursor-pointer transition-all shadow-sm hover:shadow-md group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{ex.icon}</span>
                  <span className="text-xs font-bold text-[#1c1917] group-hover:text-[#326080] truncate">
                    {ex.title}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#78716c] font-mono">
                  <span>{ex.stackLabel}</span>
                  <span className="text-[#326080] font-semibold">{ex.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GitHub High-Scale Import Banner */}
        <div className="w-full mt-4 p-4 rounded-2xl bg-white/85 border border-[#ebdcd0] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#805232]/10 border border-[#805232]/30 flex items-center justify-center text-[#805232] shrink-0">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-xs text-[#1c1917] tracking-tight">
                Import Any Existing GitHub Project (10–100+ Files &amp; 3,000+ Lines)
              </div>
              <p className="text-[11px] text-[#78716c]">
                Map repo architecture, dependencies &amp; generate progressive 10–20% challenge sections with full reference specifications.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsGithubModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#326080] hover:bg-[#285573] text-white text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
          >
            Import Repository →
          </button>
        </div>

        {/* Feature Highlights Row */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4 text-xs text-[#57534e]">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#ebdcd0] shadow-sm">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tiered &amp; Honest Sandbox</span>
          </div>
          <div 
            onClick={() => setIsTrustModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#ebdcd0] shadow-sm cursor-pointer hover:bg-white"
            title="Line-level provenance ensures you write or verify at least 60% of code"
          >
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Human Ownership (60%–100%)</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#ebdcd0] shadow-sm">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pure JS &amp; Native Stacks</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#ebdcd0] shadow-sm">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dual Verification (Tests + Specs)</span>
          </div>
        </div>
      </main>

      {/* Planning Modal Overlay */}
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

      {/* Trust & Transparency Modal */}
      <TrustTransparencyModal
        isOpen={isTrustModalOpen}
        onClose={() => setIsTrustModalOpen(false)}
      />

      {/* Footer */}
      <footer className="h-12 border-t border-[#ebdcd0] px-6 md:px-12 flex items-center justify-between text-xs text-[#78716c] z-10 bg-[#FFF1E7]/80 backdrop-blur-md">
        <div>&copy; 2026 Nirmaan. Designed for deep engineering learning.</div>
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsTrustModalOpen(true)} className="hover:text-[#1c1917] transition-colors">
            Tiered Runtime
          </button>
          <span>&bull;</span>
          <button onClick={() => setIsTrustModalOpen(true)} className="hover:text-[#1c1917] transition-colors">
            AST Concept Engine
          </button>
          <span>&bull;</span>
          <button onClick={() => setIsTrustModalOpen(true)} className="hover:text-[#1c1917] transition-colors">
            Line Provenance Tracking
          </button>
        </div>
      </footer>
    </div>
  );
};
