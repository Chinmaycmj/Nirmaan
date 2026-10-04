'use client';

import React, { useState } from 'react';
import { Hint } from '@/types/learning';
import { 
  Lightbulb, 
  Compass, 
  Code2, 
  FileCode, 
  Lock, 
  Unlock, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  HelpCircle,
  Sparkles,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

export interface HintLadderProps {
  hints: Hint[];
  solutionCode?: string;
  conceptName: string;
  taskPrompt?: string;
  onApplySnippet?: (snippet: string) => void;
  onRevealSolution?: () => void;
  canRevealSolution?: boolean;
  policyName?: string;
}

const TIER_METADATA = [
  {
    tier: 1,
    title: 'Tier 1: Conceptual Guidance',
    subtitle: 'Mental model & high-level algorithmic direction',
    icon: Lightbulb,
    badgeColor: 'bg-amber-100 text-[#92400e] border-amber-300',
    borderColor: 'border-amber-200',
    accentColor: '#d97706',
  },
  {
    tier: 2,
    title: 'Tier 2: Structural Placement',
    subtitle: 'Where in the component or file to insert the logic',
    icon: Compass,
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    borderColor: 'border-sky-200',
    accentColor: '#0284c7',
  },
  {
    tier: 3,
    title: 'Tier 3: Syntax Pattern',
    subtitle: 'Language pattern, signatures, and API structures',
    icon: Code2,
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    borderColor: 'border-indigo-200',
    accentColor: '#4f46e5',
  },
  {
    tier: 4,
    title: 'Tier 4: Partial Skeleton',
    subtitle: 'Fill-in-the-blank code with explicit placeholder slots',
    icon: FileCode,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    borderColor: 'border-emerald-200',
    accentColor: '#059669',
  },
];

export const HintLadder: React.FC<HintLadderProps> = ({
  hints = [],
  solutionCode,
  conceptName,
  taskPrompt,
  onApplySnippet,
  onRevealSolution,
  canRevealSolution = true,
  policyName = 'Guided Builder',
}) => {
  const [revealedTier, setRevealedTier] = useState<number>(0);
  const [expandedTiers, setExpandedTiers] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
  });
  const [copiedSnippetIndex, setCopiedSnippetIndex] = useState<number | null>(null);
  const [showSolutionConfirm, setShowSolutionConfirm] = useState<boolean>(false);
  const [isSolutionRevealed, setIsSolutionRevealed] = useState<boolean>(false);

  // Normalize hints into 4 tiers
  const normalizedHints: Hint[] = [1, 2, 3, 4].map((tierNum) => {
    const existing = hints.find((h) => h.level === tierNum);
    if (existing) return existing;

    // Fallback synthesis based on tier
    if (tierNum === 1) {
      return {
        level: 1,
        type: 'conceptual',
        title: 'Conceptual Blueprint',
        content: `Break down the requirement into small deterministic steps. For ${conceptName}, determine what input state changes and what output must be returned.`,
      };
    }
    if (tierNum === 2) {
      return {
        level: 2,
        type: 'structural',
        title: 'Target Placement',
        content: `Identify the main function or handler body. Ensure you place the new construct inside the active module block before the return statement.`,
      };
    }
    if (tierNum === 3) {
      return {
        level: 3,
        type: 'syntax',
        title: 'Syntax Template',
        content: `Utilize standard language primitives: declare variables with meaningful names and use appropriate control flow or callback patterns for ${conceptName}.`,
      };
    }
    return {
      level: 4,
      type: 'partial_solution',
      title: 'Partial Skeleton',
      content: `// Step 1: Initialize variables\n// Step 2: Implement core logic\n// Step 3: Return result`,
    };
  });

  const handleRevealNext = () => {
    if (revealedTier < 4) {
      const next = revealedTier + 1;
      setRevealedTier(next);
      setExpandedTiers((prev) => ({ ...prev, [next]: true }));
    }
  };

  const toggleTier = (tier: number) => {
    setExpandedTiers((prev) => ({ ...prev, [tier]: !prev[tier] }));
  };

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedSnippetIndex(index);
    setTimeout(() => setCopiedSnippetIndex(null), 2000);
  };

  const handleUnlockSolution = () => {
    if (revealedTier < 4) {
      setShowSolutionConfirm(true);
      return;
    }
    setIsSolutionRevealed(true);
    if (onRevealSolution) {
      onRevealSolution();
    }
  };

  const confirmUnlockAll = () => {
    setRevealedTier(4);
    setIsSolutionRevealed(true);
    setShowSolutionConfirm(false);
    if (onRevealSolution) {
      onRevealSolution();
    }
  };

  return (
    <div className="rounded-2xl border border-[#ebdcd0] bg-white p-4 space-y-4 shadow-sm text-[#1c1917]">
      {/* Ladder Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ebdcd0]/70 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1c1917] uppercase tracking-wide">
              4-Tier Progressive Hint Ladder
            </h4>
            <p className="text-[11px] text-[#78716c]">
              Scaffolded support that preserves your learning ownership ({revealedTier}/4 tiers revealed)
            </p>
          </div>
        </div>

        {/* Stepped Progress Indicator */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((tier) => (
            <div
              key={tier}
              className={`h-2 rounded-full transition-all duration-300 ${
                tier <= revealedTier
                  ? 'w-6 bg-[#326080]'
                  : 'w-3 bg-[#e7ded7]'
              }`}
              title={`Tier ${tier} ${tier <= revealedTier ? 'Revealed' : 'Locked'}`}
            />
          ))}
        </div>
      </div>

      {/* Stepped Tiers List */}
      <div className="space-y-2.5">
        {TIER_METADATA.map((meta, idx) => {
          const isRevealed = meta.tier <= revealedTier;
          const hint = normalizedHints[idx];
          const isExpanded = expandedTiers[meta.tier] ?? false;
          const IconComponent = meta.icon;

          if (!isRevealed) {
            return (
              <div
                key={meta.tier}
                className="p-3 rounded-xl border border-dashed border-[#ebdcd0] bg-[#faf6ee]/50 flex items-center justify-between opacity-70 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#e7ded7] flex items-center justify-center text-[#78716c]">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#57534e]">
                      {meta.title}
                    </span>
                    <p className="text-[10px] text-[#a8a29e]">
                      {meta.subtitle}
                    </p>
                  </div>
                </div>

                {meta.tier === revealedTier + 1 && (
                  <button
                    onClick={handleRevealNext}
                    className="px-3 py-1 rounded-lg bg-white border border-[#ebdcd0] hover:bg-[#f6e7db] text-xs font-bold text-[#326080] transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Reveal Tier {meta.tier}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          }

          return (
            <div
              key={meta.tier}
              className={`rounded-xl border ${meta.borderColor} bg-[#faf6ee] transition-all overflow-hidden shadow-xs`}
            >
              <div
                onClick={() => toggleTier(meta.tier)}
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#f6e7db]/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs"
                    style={{ backgroundColor: `${meta.accentColor}18`, color: meta.accentColor }}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1c1917]">
                        {meta.title}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full border ${meta.badgeColor}`}>
                        Level {meta.tier}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#78716c]">{meta.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#78716c]">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-1 border-t border-[#ebdcd0]/60 space-y-2">
                  <p className="text-xs text-[#332f2b] leading-relaxed whitespace-pre-wrap font-sans">
                    {hint.content}
                  </p>

                  {/* Code snippet action if tier 3 or 4 */}
                  {meta.tier >= 3 && hint.content.includes('\n') && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleCopy(hint.content, meta.tier)}
                        className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-white border border-[#ebdcd0] hover:bg-[#f6e7db] text-[#57534e] transition-colors flex items-center gap-1.5"
                      >
                        {copiedSnippetIndex === meta.tier ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Pattern</span>
                          </>
                        )}
                      </button>

                      {onApplySnippet && (
                        <button
                          onClick={() => onApplySnippet(hint.content)}
                          className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#326080] text-white hover:bg-[#254b66] transition-colors"
                        >
                          Insert into Editor
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Primary Ladder Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#ebdcd0]/70">
        <div>
          {revealedTier < 4 ? (
            <button
              onClick={handleRevealNext}
              className="px-4 py-2 rounded-xl bg-[#326080] hover:bg-[#254b66] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Reveal Next Tier ({revealedTier + 1}/4)</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>All 4 scaffold tiers revealed!</span>
            </div>
          )}
        </div>

        {/* Gated Solution Reveal */}
        {solutionCode && (
          <div>
            {!isSolutionRevealed ? (
              <button
                onClick={handleUnlockSolution}
                className="px-3 py-1.5 rounded-lg border border-[#ebdcd0] bg-white hover:bg-[#f6e7db] text-xs font-semibold text-[#78716c] hover:text-[#1c1917] transition-all flex items-center gap-1.5"
                title="Revealing full solution affects your Authored % provenance score"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Unlock Solution</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  Solution Unlocked
                </span>
                {onApplySnippet && (
                  <button
                    onClick={() => onApplySnippet(solutionCode)}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#326080] text-white hover:bg-[#254b66]"
                  >
                    Load Solution
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal if unlocking solution early */}
      {showSolutionConfirm && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Are you sure you want to reveal the full solution early?</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            In <strong>{policyName}</strong>, revealing the complete answer before attempting the 4 scaffold tiers will mark the module as <em>AI-assisted</em> and reduce your verified ownership certificate score.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={confirmUnlockAll}
              className="px-3 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors"
            >
              Reveal Anyway
            </button>
            <button
              onClick={() => setShowSolutionConfirm(false)}
              className="px-3 py-1 rounded-md bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-medium text-xs transition-colors"
            >
              Cancel, Let Me Try First
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
