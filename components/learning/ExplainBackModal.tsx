'use client';

import React, { useState } from 'react';
import { Sparkles, MessageSquareQuote, CheckCircle2, AlertCircle, ArrowRight, X, Loader2 } from 'lucide-react';

interface ExplainBackModalProps {
  isOpen: boolean;
  onClose: () => void;
  conceptName: string;
  targetCodeSnippet: string;
  expectedKeywords?: string[];
  onVerificationPassed: (explanation: string, understoodScore: number) => void;
}

export const ExplainBackModal: React.FC<ExplainBackModalProps> = ({
  isOpen,
  onClose,
  conceptName,
  targetCodeSnippet,
  expectedKeywords = ['function', 'return', 'state', 'layout', 'event', 'data', 'parameter'],
  onVerificationPassed,
}) => {
  const [explanation, setExplanation] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<{ passed: boolean; score: number; feedback: string } | null>(null);

  if (!isOpen) return null;

  const handleEvaluateExplanation = () => {
    if (!explanation.trim()) return;
    setIsGrading(true);

    setTimeout(() => {
      const lower = explanation.toLowerCase();
      // Rubric matching: keywords + length + conceptual depth
      const matched = expectedKeywords.filter(k => lower.includes(k.toLowerCase()));
      const wordCount = explanation.trim().split(/\s+/).length;

      let score = 50;
      if (wordCount >= 15) score += 20;
      if (wordCount >= 30) score += 15;
      score += Math.min(30, matched.length * 10);

      const passed = score >= 70 && wordCount >= 10;

      const evalResult = {
        passed,
        score: Math.min(100, score),
        feedback: passed
          ? `Exceptional explanation! You articulated the mechanics of "${conceptName}" clearly (${matched.length} key engineering concepts demonstrated). This code is now verified under your Understood Ownership score.`
          : `Good start! To verify comprehension, explain what each parameter does and why this structure was chosen rather than just repeating syntax.`,
      };

      setResult(evalResult);
      setIsGrading(false);

      if (passed) {
        onVerificationPassed(explanation, evalResult.score);
      }
    }, 600);
  };

  const handleClose = () => {
    setResult(null);
    setExplanation('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1c1917]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFF1E7] border border-[#ebdcd0] rounded-3xl max-w-xl w-full p-6 shadow-2xl animate-fadeIn space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ebdcd0] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-400/40 text-sky-700 flex items-center justify-center font-bold">
              <MessageSquareQuote className="w-4 h-4 text-sky-700" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#1c1917] tracking-tight">Explain-Back Verification</h3>
              <p className="text-[11px] text-[#78716c]">Demonstrate mastery to convert AI code into Verified Understood lines</p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="p-1 rounded-lg text-[#78716c] hover:text-[#1c1917] hover:bg-[#f6e7db]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Code Snippet Under Review */}
        <div className="bg-white/90 p-3.5 rounded-2xl border border-[#ebdcd0] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#326080]">
            <span className="font-bold">Target Concept: {conceptName}</span>
            <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">
              Verification Checkpoint
            </span>
          </div>
          <pre className="p-2.5 rounded-xl bg-[#faf6ee] text-[#1c1917] text-[11px] font-mono overflow-x-auto max-h-36 custom-scrollbar border border-[#ebdcd0]">
            <code>{targetCodeSnippet.slice(0, 400)}{targetCodeSnippet.length > 400 ? '\n...' : ''}</code>
          </pre>
        </div>

        {/* Student Explanation Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#1c1917]">
            Explain in your own words: What does this code do and why was it designed this way?
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            disabled={result?.passed}
            placeholder="e.g. This function handles state transition by taking previous items, validating inputs, and returning an immutable array without mutating the caller..."
            rows={4}
            className="w-full p-3 rounded-2xl bg-white border border-[#ebdcd0] text-xs text-[#1c1917] outline-none focus:border-[#326080] focus:ring-2 focus:ring-[#B5D2E6]/50 placeholder-[#a8a29e] resize-none leading-relaxed"
          />
        </div>

        {/* Evaluation Feedback */}
        {result && (
          <div className={`p-4 rounded-2xl border text-xs space-y-1 ${
            result.passed
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              {result.passed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mastery Verified! ({result.score}/100)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Keep Expanding ({result.score}/100)</span>
                </>
              )}
            </div>
            <p className="leading-relaxed">{result.feedback}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          {result?.passed ? (
            <button
              onClick={handleClose}
              className="py-2.5 px-6 rounded-xl bg-[#326080] hover:bg-[#254b66] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <span>Applied to Verified Ownership</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleEvaluateExplanation}
              disabled={isGrading || explanation.trim().length < 10}
              className="py-2.5 px-6 rounded-xl bg-[#326080] hover:bg-[#254b66] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-[#326080]/20 disabled:opacity-40"
            >
              {isGrading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Comprehension...</span>
                </>
              ) : (
                <>
                  <span>Verify My Understanding</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
