'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  ExternalLink, 
  X, 
  ChevronRight, 
  AlertTriangle, 
  Code2, 
  Play, 
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Minimize2,
  Maximize2
} from 'lucide-react';

export interface LearningCardData {
  lineNumber: number;
  lineContent: string;
  token?: string;
  language: string;
  whatItDoes: string;
  syntaxPattern: string;
  whyItIsUsed: string;
  tryItSnippet?: string;
  commonMistake?: string;
  externalDocUrl?: string;
}

interface FloatingLearningCardProps {
  data: LearningCardData | null;
  onClose: () => void;
  onNextLine?: () => void;
  onApplyExerciseSnippet?: (snippet: string) => void;
}

export const FloatingLearningCard: React.FC<FloatingLearningCardProps> = ({
  data,
  onClose,
  onNextLine,
  onApplyExerciseSnippet,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [exerciseCode, setExerciseCode] = useState(data?.tryItSnippet || '');
  const [exercisePassed, setExercisePassed] = useState(false);

  if (!data) return null;

  const handleTestTryIt = () => {
    setExercisePassed(true);
    setTimeout(() => {
      if (onApplyExerciseSnippet && exerciseCode) {
        onApplyExerciseSnippet(exerciseCode);
      }
    }, 400);
  };

  return (
    <div className="fixed bottom-12 right-6 z-40 max-w-md w-full animate-slideIn">
      <div className="bg-[#FFF1E7]/98 backdrop-blur-xl border border-[#ebdcd0] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-[#1c1917] ring-1 ring-[#326080]/15">
        
        {/* Header Bar */}
        <div className="h-10 px-4 bg-white/90 border-b border-[#ebdcd0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#326080] animate-pulse" />
            <span className="font-mono text-xs font-bold text-[#1c1917]">
              Line {data.lineNumber} Inspected
            </span>
            {data.token && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#B5D2E6]/30 text-[#326080] font-bold border border-[#B5D2E6]/60">
                {data.token}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg text-[#78716c] hover:text-[#1c1917] hover:bg-[#f6e7db] transition-colors"
              title={isExpanded ? "Collapse Card" : "Expand Full Card"}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#78716c] hover:text-[#1c1917] hover:bg-[#f6e7db] transition-colors"
              title="Close Card"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Selected Line Snippet Preview */}
        <div className="px-4 py-2 bg-[#faf6ee] border-b border-[#ebdcd0] font-mono text-xs text-[#0f172a] truncate">
          <span className="text-[#a8a29e] mr-2">L{data.lineNumber}</span>
          <span>{data.lineContent.trim() || 'Empty line'}</span>
        </div>

        {/* Card Body */}
        <div className={`p-4 space-y-3 overflow-y-auto custom-scrollbar ${isExpanded ? 'max-h-96' : 'max-h-72'}`}>
          
          {/* 1. WHAT IT DOES */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#326080] flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-[#326080]" />
              <span>What It Does</span>
            </span>
            <p className="text-xs text-[#44403c] leading-relaxed">
              {data.whatItDoes || 'Executes this statement in your application logic.'}
            </p>
          </div>

          {/* 2. SYNTAX PATTERN */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#78716c] flex items-center gap-1">
              <Code2 className="w-3 h-3 text-[#78716c]" />
              <span>Syntax Pattern</span>
            </span>
            <pre className="p-2 rounded-xl bg-white border border-[#ebdcd0] text-[11px] font-mono text-[#0f172a] overflow-x-auto leading-tight">
              <code>{data.syntaxPattern || data.lineContent.trim()}</code>
            </pre>
          </div>

          {/* 3. WHY IT IS USED */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#92400e] flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-[#92400e]" />
              <span>Why It Is Used</span>
            </span>
            <p className="text-xs text-[#57534e] leading-relaxed">
              {data.whyItIsUsed || 'Structures and bounds state to prevent runtime bugs and unexpected regressions.'}
            </p>
          </div>

          {/* 4. TRY IT (Tiny Micro Exercise) */}
          {data.tryItSnippet && (
            <div className="p-3 rounded-2xl bg-white border border-[#ebdcd0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#326080] flex items-center gap-1">
                  <Play className="w-3 h-3 fill-[#326080]" />
                  <span>Try It (Interactive Micro-Exercise)</span>
                </span>
                {exercisePassed && (
                  <span className="text-[10px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Applied</span>
                  </span>
                )}
              </div>
              <textarea
                value={exerciseCode}
                onChange={(e) => setExerciseCode(e.target.value)}
                rows={2}
                className="w-full p-2 rounded-xl bg-[#faf6ee] border border-[#ebdcd0] font-mono text-[11px] text-[#0f172a] resize-none outline-none focus:border-[#326080]"
              />
              <button
                type="button"
                onClick={handleTestTryIt}
                className="w-full py-1.5 px-3 rounded-xl bg-[#326080] hover:bg-[#254b66] text-white text-[11px] font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Run Micro-Test</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* 5. COMMON MISTAKE */}
          {data.commonMistake && (
            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-[#78350f] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[10px] font-mono uppercase">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                <span>Common Mistake to Avoid:</span>
              </div>
              <p className="text-[11px] leading-relaxed">{data.commonMistake}</p>
            </div>
          )}
        </div>

        {/* Footer Actions: Next Line & Official Specs */}
        <div className="h-10 px-4 bg-white/90 border-t border-[#ebdcd0] flex items-center justify-between text-xs shrink-0">
          {data.externalDocUrl ? (
            <a
              href={data.externalDocUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-mono text-[#326080] hover:text-[#254b66] font-semibold flex items-center gap-1"
            >
              <span>Official Specs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-[10px] text-[#78716c] font-mono">Nirmaan Concept Card</span>
          )}

          {onNextLine && (
            <button
              onClick={onNextLine}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-[#326080] hover:bg-[#254b66] text-white text-xs font-bold transition-colors shadow-sm"
            >
              <span>Next Line</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
