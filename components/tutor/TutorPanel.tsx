'use client';

import React, { useState } from 'react';
import { LearningCheckpoint, TaskType, Hint } from '@/types/learning';
import { ValidationEvaluation } from '@/types/ai';
import { 
  Sparkles, 
  Lightbulb, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  HelpCircle, 
  ArrowRight, 
  Check, 
  RotateCcw, 
  Send,
  Eye,
  CheckCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TutorPanelProps {
  checkpoint: LearningCheckpoint | null;
  totalCheckpoints: number;
  currentStepIndex: number;
  onCheckSubmission: (submission: string) => Promise<ValidationEvaluation>;
  onConceptExplain: (conceptId: string) => void;
  onWhyDoesThisExist: () => void;
  onNextCheckpoint: () => void;
}

export const TutorPanel: React.FC<TutorPanelProps> = ({
  checkpoint,
  totalCheckpoints,
  currentStepIndex,
  onCheckSubmission,
  onConceptExplain,
  onWhyDoesThisExist,
  onNextCheckpoint,
}) => {
  const [userCode, setUserCode] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [explanationText, setExplanationText] = useState<string>('');
  const [revealedHintIndex, setRevealedHintIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState<ValidationEvaluation | null>(null);
  const [solutionUnlocked, setSolutionUnlocked] = useState(false);

  // Sync initial state when checkpoint changes
  React.useEffect(() => {
    if (checkpoint) {
      if (checkpoint.taskType === 'FIX_BUG') {
        setUserCode(checkpoint.brokenCode || checkpoint.initialCode || '');
      } else {
        setUserCode(checkpoint.initialCode || '');
      }
      setSelectedOption('');
      setExplanationText('');
      setRevealedHintIndex(0);
      setLastEvaluation(null);
      setSolutionUnlocked(false);
    }
  }, [checkpoint?.id]);

  if (!checkpoint) {
    return (
      <div className="h-64 bg-slate-950 border-t border-slate-800 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3">
          <CheckCheck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">All Checkpoints Completed!</h3>
        <p className="text-xs text-slate-400 max-w-md mt-1">
          You have built the core logic and verified all components. The application is running live in the preview.
        </p>
      </div>
    );
  }

  const taskTypeLabels: Record<TaskType, { name: string; color: string }> = {
    COMPLETE_CODE: { name: 'Complete the Code', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    WRITE_SCRATCH: { name: 'Write From Scratch', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    PREDICT_OUTPUT: { name: 'Predict the Output', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    FIX_BUG: { name: 'Fix the Bug', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    EXPLAIN_CODE: { name: 'Explain the Code', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
    CHOOSE_APPROACH: { name: 'Choose Best Approach', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    MODIFY_CODE: { name: 'Modify Existing Code', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  };

  const handleRevealNextHint = () => {
    if (revealedHintIndex < checkpoint.hints.length) {
      setRevealedHintIndex(prev => prev + 1);
    } else {
      setSolutionUnlocked(true);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    let submission = '';
    if (checkpoint.taskType === 'PREDICT_OUTPUT' || checkpoint.taskType === 'CHOOSE_APPROACH') {
      submission = selectedOption;
    } else if (checkpoint.taskType === 'EXPLAIN_CODE') {
      submission = explanationText;
    } else {
      submission = userCode;
    }

    const evaluation = await onCheckSubmission(submission);
    setLastEvaluation(evaluation);
    setIsSubmitting(false);

    if (evaluation.passed) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  return (
    <div className="bg-slate-950 flex flex-col h-full overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="min-h-11 px-3 py-2 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-xs font-bold text-white tracking-wide">
              Step {currentStepIndex + 1} of {totalCheckpoints}
            </span>
          </div>

          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${taskTypeLabels[checkpoint.taskType].color}`}>
            {taskTypeLabels[checkpoint.taskType].name}
          </span>

          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700">
            {checkpoint.conceptName}
          </span>
        </div>

        {/* Learning Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onConceptExplain(checkpoint.conceptId)}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs transition-colors border border-slate-700"
            title="Deep dive into this programming concept"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Explain Concept</span>
          </button>

          <button
            onClick={onWhyDoesThisExist}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs transition-colors border border-slate-700"
            title="Why is this code specifically needed for this project?"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>Why Needed?</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Prompt & Project Context */}
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {checkpoint.prompt}
          </p>
          <div className="mt-2 text-[11px] text-slate-400 flex items-start space-x-1.5 pt-2 border-t border-slate-800">
            <span className="text-indigo-400 font-semibold shrink-0">Project Context:</span>
            <span>{checkpoint.contextExplanation}</span>
          </div>
        </div>

        {/* Task Interactive Input */}
        {(checkpoint.taskType === 'COMPLETE_CODE' ||
          checkpoint.taskType === 'WRITE_SCRATCH' ||
          checkpoint.taskType === 'FIX_BUG' ||
          checkpoint.taskType === 'MODIFY_CODE') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Your Code Implementation:</span>
              <span className="text-[11px] text-slate-500">Edit below, then click &quot;Check &amp; Run Code&quot;</span>
            </div>
            <textarea
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 font-mono text-xs text-emerald-300 p-3 rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none"
              placeholder="// Write your implementation here..."
            />
          </div>
        )}

        {/* Multiple Choice for PREDICT_OUTPUT & CHOOSE_APPROACH */}
        {(checkpoint.taskType === 'PREDICT_OUTPUT' || checkpoint.taskType === 'CHOOSE_APPROACH') && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300">Select the correct answer:</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {checkpoint.multipleChoiceOptions?.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`p-3 text-left rounded-xl text-xs border transition-all flex items-start space-x-2.5 ${
                    selectedOption === opt.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-[10px] ${
                    selectedOption === opt.id ? 'border-indigo-400 bg-indigo-600 text-white' : 'border-slate-600'
                  }`}>
                    {selectedOption === opt.id ? '✓' : ''}
                  </span>
                  <span>{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Free text input for EXPLAIN_CODE */}
        {checkpoint.taskType === 'EXPLAIN_CODE' && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300">Explain in your own words:</span>
            <textarea
              value={explanationText}
              onChange={(e) => setExplanationText(e.target.value)}
              rows={3}
              placeholder="Explain what this code accomplishes, how React uses reference comparisons, and why this prevents UI bugs..."
              className="w-full bg-slate-950 text-xs text-slate-200 p-3 rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        )}

        {/* Validation Result / Feedback */}
        {lastEvaluation && (
          <div className={`p-4 rounded-xl border ${
            lastEvaluation.passed
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 font-bold text-xs">
                {lastEvaluation.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>{lastEvaluation.title}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                lastEvaluation.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                Score: {lastEvaluation.score}%
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-2">{lastEvaluation.message}</p>

            {/* What Changed in Preview Visual Bridge */}
            {lastEvaluation.passed && checkpoint.whatChangedInPreview && (
              <div className="bg-emerald-900/30 p-2.5 rounded-lg border border-emerald-700/40 text-[11px] text-emerald-300 flex items-center space-x-2">
                <Eye className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  <strong>What changed on screen:</strong> {checkpoint.whatChangedInPreview}
                </span>
              </div>
            )}

            {/* Error Learning Diagnostics (Section 22) */}
            {!lastEvaluation.passed && lastEvaluation.diagnostic && (
              <div className="mt-3 bg-slate-950/90 p-3 rounded-lg border border-rose-900/50 text-[11px] space-y-1.5 text-slate-300">
                <div className="font-semibold text-rose-400">Error Diagnostic & Learning:</div>
                <div><span className="text-slate-400">Problem:</span> {lastEvaluation.diagnostic.whatHappened}</div>
                <div><span className="text-slate-400">Meaning:</span> {lastEvaluation.diagnostic.whatMessageMeans}</div>
                <div>
                  <span className="text-slate-400">Check:</span>
                  <ul className="list-disc pl-4 mt-1 text-slate-300 space-y-0.5">
                    {lastEvaluation.diagnostic.investigationSteps.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progressive Hint Drawer */}
        {revealedHintIndex > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-amber-400 flex items-center space-x-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Unlocked Hints ({revealedHintIndex} of {checkpoint.hints.length}):</span>
            </span>

            <div className="space-y-2">
              {checkpoint.hints.slice(0, revealedHintIndex).map((hint, idx) => (
                <div key={idx} className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-200">
                  <div className="font-semibold text-[11px] uppercase tracking-wider text-amber-400 mb-1">
                    Hint {hint.level} ({hint.type.replace('_', ' ')}) - {hint.title}
                  </div>
                  <pre className="font-sans whitespace-pre-wrap text-slate-300 text-xs">{hint.content}</pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reference Solution if Unlocked */}
        {solutionUnlocked && (
          <div className="bg-indigo-950/30 border border-indigo-500/40 p-3 rounded-xl text-xs text-indigo-200">
            <div className="font-semibold text-indigo-400 mb-1">Reference Canonical Solution:</div>
            <pre className="font-mono bg-slate-950 p-2.5 rounded border border-slate-800 text-emerald-400 overflow-x-auto">
              {checkpoint.solutionCode}
            </pre>
          </div>
        )}
      </div>

      {/* Bottom Footer Controls */}
      <div className="h-13 px-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
        {/* Hint button */}
        <button
          onClick={handleRevealNextHint}
          disabled={solutionUnlocked}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-amber-400 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>
            {revealedHintIndex < checkpoint.hints.length
              ? `Get Hint (${revealedHintIndex + 1}/${checkpoint.hints.length})`
              : 'Show Reference Solution'}
          </span>
        </button>

        {/* Submit or Continue Button */}
        <div className="flex items-center space-x-2">
          {lastEvaluation?.passed ? (
            <button
              onClick={onNextCheckpoint}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm shadow-emerald-600/30 transition-colors"
            >
              <span>Continue AI Build</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm shadow-indigo-600/30 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Evaluating...' : 'Check & Run Code'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
