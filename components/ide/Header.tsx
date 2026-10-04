'use client';

import React from 'react';
import { InterventionLevel, ProjectStats } from '@/types/project';
import { 
  Play, 
  Settings, 
  GitCommit, 
  BookOpen, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  HelpCircle,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';

interface HeaderProps {
  projectName: string;
  stageName: string;
  stats: ProjectStats;
  interventionLevel: InterventionLevel;
  onInterventionChange: (level: InterventionLevel) => void;
  onRunCode: () => void;
  onOpenSettings: () => void;
  onOpenKnowledgeGraph: () => void;
  onOpenTimeline: () => void;
  onResetProject: () => void;
  onNewProject: () => void;
  onReturnToHero?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projectName,
  stageName,
  stats,
  interventionLevel,
  onInterventionChange,
  onRunCode,
  onOpenSettings,
  onOpenKnowledgeGraph,
  onOpenTimeline,
  onResetProject,
  onNewProject,
  onReturnToHero,
}) => {
  const interventionLabels: Record<InterventionLevel, { name: string; desc: string }> = {
    tutor: { name: 'Level 1: Tutor Mode', desc: 'You write all code; AI hints & explains' },
    pair: { name: 'Level 2: Pair Mode', desc: 'AI suggests snippets; you write logic' },
    guided: { name: 'Level 3: Co-Developer', desc: 'AI writes infrastructure; you write core concepts' },
    collaborative: { name: 'Collaborative', desc: 'AI writes sections with checks' },
    builder: { name: 'Level 4: AI Builder', desc: 'AI implements features with diff review' },
    ai: { name: 'Level 5: Autopilot', desc: 'AI writes most; gated by audit' },
  };

  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between select-none z-20">
      {/* Brand & Project Info */}
      <div className="flex items-center space-x-3">
        {onReturnToHero && (
          <button
            onClick={onReturnToHero}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 text-xs transition-colors"
            title="Return to 'What do you want to build?' prompt screen"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Prompt</span>
          </button>
        )}

        <div 
          onClick={onReturnToHero}
          className="flex items-center space-x-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          title="Nirmaan - Click to return to home prompt"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-tight text-white">Nirmaan</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold px-1.5 py-0.5 rounded border border-indigo-500/30">
                AI Co-Builder
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium truncate max-w-[180px] block">
              {projectName}
            </span>
          </div>
        </div>

        {/* Stage Badge */}
        <div className="hidden lg:flex items-center space-x-2 pl-3 border-l border-slate-800">
          <span className="text-xs text-slate-400">Phase:</span>
          <span className="text-xs font-medium text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {stageName}
          </span>
        </div>
      </div>

      {/* Center: Code Ownership & Learning Stats */}
      <div className="hidden md:flex items-center space-x-4 bg-slate-900/90 border border-slate-800/80 px-3 py-1.5 rounded-xl">
        <div className="flex items-center space-x-2">
          <div className="relative w-7 h-7 flex items-center justify-center">
            <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#334155"
                strokeWidth="3.5"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeDasharray={`${stats.userPercentage * 0.88}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[9px] font-bold text-emerald-400">
              {stats.userPercentage}%
            </span>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-200">
              Human-Written Code: <span className="text-emerald-400">{stats.userPercentage}%</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {stats.userWrittenLines} lines written by you • {stats.aiGeneratedLines} by AI
            </div>
          </div>
        </div>
      </div>

      {/* Right Controls: Mode, Learning Tools, Run */}
      <div className="flex items-center space-x-2.5">
        {/* Intervention Mode Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
          <span className="text-[11px] text-slate-400">Mode:</span>
          <select
            value={interventionLevel}
            onChange={(e) => onInterventionChange(e.target.value as InterventionLevel)}
            className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
            title={interventionLabels[interventionLevel].desc}
          >
            <option value="tutor" className="bg-slate-900 text-slate-200">Tutor (User Heavy)</option>
            <option value="guided" className="bg-slate-900 text-slate-200">Guided Builder (Balanced)</option>
            <option value="collaborative" className="bg-slate-900 text-slate-200">Collaborative</option>
            <option value="ai" className="bg-slate-900 text-slate-200">AI Builder (AI Heavy)</option>
          </select>
        </div>

        {/* Knowledge Graph Button */}
        <button
          onClick={onOpenKnowledgeGraph}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-xs transition-colors"
          title="View Concept Knowledge Graph"
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Concepts</span>
        </button>

        {/* Project Timeline Button */}
        <button
          onClick={onOpenTimeline}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-xs transition-colors"
          title="View Project Development Milestones"
        >
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Timeline</span>
        </button>

        {/* Run / Verify Button */}
        <button
          onClick={onRunCode}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg shadow-sm shadow-emerald-600/30 transition-colors"
          title="Run tests and compile to live preview"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Project</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg transition-colors"
          title="Settings & AI Keys"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
