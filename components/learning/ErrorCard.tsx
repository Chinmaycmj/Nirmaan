'use client';

import React from 'react';
import { ValidationEvaluation, ErrorDiagnostic } from '@/types/ai';
import { 
  AlertCircle, 
  HelpCircle, 
  MapPin, 
  Wrench, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Code2,
  Sparkles,
  Bug
} from 'lucide-react';

export interface ErrorCardProps {
  evaluation: ValidationEvaluation;
  onTryAgain?: () => void;
  onJumpToLine?: (line: number) => void;
  targetFileName?: string;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  evaluation,
  onTryAgain,
  onJumpToLine,
  targetFileName = 'active file',
}) => {
  const { passed, title, message, diagnostic, testResults } = evaluation;

  if (passed) {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4.5 text-emerald-950 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-200/80 flex items-center justify-center text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-900">
              {title || 'Validation Succeeded!'}
            </h4>
            <p className="text-xs text-emerald-800">
              {message || 'All automated sandbox tests passed flawlessly.'}
            </p>
          </div>
        </div>

        {testResults && testResults.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {testResults.map((test, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-2 text-xs bg-white/70 px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-900 font-mono"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{test.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Parse line number from whereItHappened if available
  const lineMatch = diagnostic?.whereItHappened?.match(/(?:line|L)\s*(\d+)/i) || message?.match(/(?:line|L)\s*(\d+)/i);
  const detectedLine = lineMatch ? parseInt(lineMatch[1], 10) : null;

  return (
    <div className="rounded-2xl border border-amber-300 bg-[#fffdf8] p-4.5 text-[#1c1917] shadow-sm space-y-4">
      {/* Top Banner Header */}
      <div className="flex items-start justify-between gap-3 border-b border-amber-200/70 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <Bug className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-[#1c1917]">
                {title || 'Sandbox Test Failed'}
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-[#92400e] border border-amber-300 font-bold">
                5-Part Diagnostic
              </span>
            </div>
            <p className="text-xs text-[#78716c] mt-0.5">
              Constructive feedback designed to guide your reasoning
            </p>
          </div>
        </div>

        {onTryAgain && (
          <button
            onClick={onTryAgain}
            className="px-3 py-1.5 rounded-xl bg-[#326080] hover:bg-[#254b66] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
            title="Re-run tests"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>

      {/* 5-PART ERROR DIAGNOSTIC GRID */}
      <div className="space-y-2.5">
        
        {/* 1. WHAT HAPPENED */}
        <div className="p-3 rounded-xl bg-[#faf6ee] border border-[#ebdcd0] text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#78350f]">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span className="uppercase text-[10px] tracking-wider">1. What Happened</span>
          </div>
          <p className="text-xs text-[#332f2b] leading-relaxed pl-5">
            {diagnostic?.whatHappened || message || 'The submitted implementation did not return the expected output.'}
          </p>
        </div>

        {/* 2. WHY */}
        <div className="p-3 rounded-xl bg-[#faf6ee] border border-[#ebdcd0] text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-sky-800">
            <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
            <span className="uppercase text-[10px] tracking-wider">2. Why It Happened</span>
          </div>
          <p className="text-xs text-[#332f2b] leading-relaxed pl-5">
            {diagnostic?.whatMessageMeans || 
             (diagnostic?.conceptInvolved ? `This commonly occurs when ${diagnostic.conceptInvolved} is not handled correctly or state transitions trigger unexpectedly.` : 'The condition evaluated to false because the logic differed from the expected specification.')}
          </p>
        </div>

        {/* 3. WHERE */}
        <div className="p-3 rounded-xl bg-[#faf6ee] border border-[#ebdcd0] text-xs space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-indigo-800">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span className="uppercase text-[10px] tracking-wider">3. Where In Your Code</span>
            </div>
            {detectedLine && onJumpToLine && (
              <button
                onClick={() => onJumpToLine(detectedLine)}
                className="text-[11px] font-mono text-[#326080] hover:underline flex items-center gap-1 font-bold"
              >
                <span>Jump to L{detectedLine}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="pl-5 flex items-center gap-2 font-mono text-xs text-[#57534e]">
            <span className="px-2 py-0.5 rounded bg-white border border-[#ebdcd0] text-[#1c1917]">
              {diagnostic?.whereItHappened || `${targetFileName}${detectedLine ? `:${detectedLine}` : ''}`}
            </span>
          </div>
        </div>

        {/* 4. HOW TO FIX */}
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-[#92400e]">
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            <span className="uppercase text-[10px] tracking-wider">4. How To Fix It (Socratic Clue)</span>
          </div>
          <p className="text-xs text-[#451a03] leading-relaxed pl-5 font-medium">
            {diagnostic?.suggestedHint || 'Check your variable scope and make sure all expected return properties match the test signature.'}
          </p>
          {diagnostic?.investigationSteps && diagnostic.investigationSteps.length > 0 && (
            <ul className="pl-8 space-y-1 text-[11px] text-[#78350f] list-disc">
              {diagnostic.investigationSteps.map((step, sIdx) => (
                <li key={sIdx}>{step}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 5. TRY AGAIN / ACTION FOOTER */}
      <div className="flex items-center justify-between pt-1 border-t border-amber-200/70">
        <span className="text-[11px] text-[#78716c]">
          5. Refine your code in the editor and click Try Again
        </span>
        {onTryAgain && (
          <button
            onClick={onTryAgain}
            className="px-4 py-2 rounded-xl bg-[#326080] hover:bg-[#254b66] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-run Validation</span>
          </button>
        )}
      </div>
    </div>
  );
};
