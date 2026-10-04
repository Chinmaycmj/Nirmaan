'use client';

import React from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  Terminal, 
  HelpCircle, 
  Keyboard, 
  Code2, 
  FileCode,
  Layers,
  Sparkles
} from 'lucide-react';
import { AssistanceLevelNumber } from '@/types/project';
import { ASSISTANCE_POLICIES } from '@/lib/learning/policyEngine';

export interface WorkspaceStatusBarProps {
  saveStatus?: 'saved' | 'saving' | 'dirty';
  language?: string;
  runStatus?: 'idle' | 'running' | 'passed' | 'failed';
  assistanceLevel?: AssistanceLevelNumber;
  lineCount?: number;
  ownershipPercent?: number;
  onOpenShortcuts?: () => void;
  onOpenPolicy?: () => void;
  onOpenPortfolio?: () => void;
}

export const WorkspaceStatusBar: React.FC<WorkspaceStatusBarProps> = ({
  saveStatus = 'saved',
  language = 'TypeScript',
  runStatus = 'idle',
  assistanceLevel = 3,
  lineCount = 0,
  ownershipPercent = 42,
  onOpenShortcuts,
  onOpenPolicy,
  onOpenPortfolio,
}) => {
  const policy = ASSISTANCE_POLICIES[assistanceLevel] || ASSISTANCE_POLICIES[3];

  return (
    <footer className="h-8 px-4 bg-white/95 border-t border-[#ebdcd0] flex items-center justify-between text-[11px] font-mono text-[#78716c] select-none shrink-0 z-20 backdrop-blur-sm">
      {/* Left items: Save status & language */}
      <div className="flex items-center gap-3">
        {/* Auto-save status */}
        <div className="flex items-center gap-1.5">
          {saveStatus === 'saving' ? (
            <>
              <Loader2 className="w-3 h-3 text-[#326080] animate-spin" />
              <span className="text-[#326080]">Saving...</span>
            </>
          ) : saveStatus === 'dirty' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Unsaved changes</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span className="text-[#57534e]">All changes saved</span>
            </>
          )}
        </div>

        <span className="text-[#ebdcd0]">•</span>

        {/* Language & Runtime */}
        <div className="flex items-center gap-1 text-[#57534e]">
          <Code2 className="w-3 h-3 text-[#326080]" />
          <span>{language}</span>
        </div>

        <span className="text-[#ebdcd0]">•</span>

        {/* Sandbox Run Status */}
        <div className="flex items-center gap-1">
          {runStatus === 'running' ? (
            <span className="flex items-center gap-1 text-[#326080]">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Running tests...</span>
            </span>
          ) : runStatus === 'passed' ? (
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Tests Passed</span>
            </span>
          ) : runStatus === 'failed' ? (
            <span className="flex items-center gap-1 text-amber-700 font-bold">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              <span>Tests Incomplete</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#a8a29e]">
              <Terminal className="w-3 h-3" />
              <span>Sandbox Ready</span>
            </span>
          )}
        </div>
      </div>

      {/* Right items: AI Policy, Provenance, Line count, Shortcuts */}
      <div className="flex items-center gap-3">
        {/* Lines count */}
        {lineCount > 0 && (
          <div className="hidden sm:flex items-center gap-1 text-[#a8a29e]">
            <FileCode className="w-3 h-3" />
            <span>{lineCount} lines</span>
          </div>
        )}

        {/* Ownership Provenance Chip */}
        <button
          onClick={onOpenPortfolio}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#faf6ee] hover:bg-[#f6e7db] border border-[#ebdcd0] text-[#1c1917] font-bold transition-colors cursor-pointer"
          title="Verifiable ownership breakdown (click to open portfolio audit)"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>{ownershipPercent}% Authored</span>
        </button>

        {/* Active AI Policy Badge */}
        <button
          onClick={onOpenPolicy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#B5D2E6]/25 hover:bg-[#B5D2E6]/40 border border-[#B5D2E6]/60 text-[#326080] font-bold transition-colors cursor-pointer"
          title={`Assistance Policy: ${policy.displayName} (${policy.badge}) - click to review`}
        >
          <ShieldCheck className="w-3 h-3" />
          <span>{policy.displayName}</span>
        </button>

        {/* Shortcuts Cheat Sheet Button */}
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-[#f6e7db] text-[#78716c] hover:text-[#1c1917] transition-colors"
            title="Keyboard shortcuts (?)"
          >
            <Keyboard className="w-3 h-3" />
            <kbd className="text-[10px] bg-white border border-[#ebdcd0] px-1 rounded font-sans">?</kbd>
          </button>
        )}
      </div>
    </footer>
  );
};
