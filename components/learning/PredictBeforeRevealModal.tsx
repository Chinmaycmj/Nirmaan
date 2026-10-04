'use client';

import React, { useState } from 'react';
import { Sparkles, Brain, CheckCircle2, AlertCircle, ArrowRight, X } from 'lucide-react';
import { LearningCheckpoint } from '@/types/learning';

interface PredictBeforeRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkpoint: LearningCheckpoint | null;
  onPredictionSubmitted: (isCorrect: boolean, predictionText: string) => void;
}

export const PredictBeforeRevealModal: React.FC<PredictBeforeRevealModalProps> = ({
  isOpen,
  onClose,
  checkpoint,
  onPredictionSubmitted,
}) => {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [writtenPrediction, setWrittenPrediction] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (!isOpen || !checkpoint) return null;

  // Generate predictive options based on checkpoint task and concept
  const defaultOptions = [
    {
      text: 'The function will calculate the operation and return the numeric result.',
      isCorrect: true,
      explanation: 'Correct! Pure calculation routines return deterministic results without mutating external variables.',
    },
    {
      text: 'It will trigger a runtime error because parameters are missing type assertions.',
      isCorrect: false,
      explanation: 'Incorrect. The parameters are properly bounded by function arguments.',
    },
    {
      text: 'The state will reset to zero on each invocation without persisting.',
      isCorrect: false,
      explanation: 'Incorrect. The caller retains state or passes accumulated values.',
    },
  ];

  const options = checkpoint.multipleChoiceOptions && checkpoint.multipleChoiceOptions.length > 0
    ? checkpoint.multipleChoiceOptions
    : defaultOptions;

  const handleSubmit = () => {
    let correct = false;
    let text = writtenPrediction;

    if (selectedOptionIndex !== null) {
      correct = options[selectedOptionIndex].isCorrect;
      text = options[selectedOptionIndex].text;
    } else if (writtenPrediction.trim().length > 10) {
      correct = true; // Effort-based reward for free-form reflection
    }

    setIsCorrect(correct);
    setSubmitted(true);
  };

  const handleFinish = () => {
    onPredictionSubmitted(isCorrect, selectedOptionIndex !== null ? options[selectedOptionIndex].text : writtenPrediction);
    setSubmitted(false);
    setSelectedOptionIndex(null);
    setWrittenPrediction('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1c1917]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFF1E7] border border-[#ebdcd0] rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-fadeIn space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ebdcd0] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-700 flex items-center justify-center font-bold">
              <Brain className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#1c1917] tracking-tight">Predict Before Reveal</h3>
              <p className="text-[11px] text-[#78716c]">Strengthen mental models before inspecting reference code</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-[#78716c] hover:text-[#1c1917] hover:bg-[#f6e7db]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt Question */}
        <div className="bg-white/90 p-4 rounded-2xl border border-[#ebdcd0] space-y-2">
          <div className="text-[11px] font-mono font-bold text-[#326080] uppercase tracking-wider">
            {checkpoint.conceptName}
          </div>
          <p className="text-xs md:text-sm text-[#1c1917] font-semibold leading-relaxed">
            Before viewing the implementation, what do you predict will happen when this code executes?
          </p>
        </div>

        {/* Prediction Options */}
        {!submitted ? (
          <div className="space-y-2">
            {options.map((opt, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedOptionIndex(idx)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedOptionIndex === idx
                    ? 'bg-amber-100/90 border-amber-400 ring-1 ring-amber-300 font-semibold text-[#78350f]'
                    : 'bg-white/80 hover:bg-[#f6e7db] border-[#ebdcd0] text-[#44403c]'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="font-mono font-bold text-[#92400e] text-[11px]">{String.fromCharCode(65 + idx)}.</span>
                  <span>{opt.text}</span>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <button
                onClick={handleSubmit}
                disabled={selectedOptionIndex === null && writtenPrediction.trim().length < 5}
                className="w-full py-2.5 rounded-xl bg-[#326080] hover:bg-[#254b66] text-white text-xs font-bold transition-all shadow-md shadow-[#326080]/20 disabled:opacity-40"
              >
                Submit Prediction &amp; Reveal Code
              </button>
            </div>
          </div>
        ) : (
          /* Evaluation Result */
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Sharp Prediction! You understood the behavior.</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Good hypothesis! Here is what actually happens:</span>
                  </>
                )}
              </div>
              <p className="leading-relaxed">
                {selectedOptionIndex !== null && options[selectedOptionIndex].explanation
                  ? options[selectedOptionIndex].explanation
                  : 'Predicting behavior before coding calibrates your mental model and reduces bug frequency.'}
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-2.5 rounded-xl bg-[#326080] hover:bg-[#254b66] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Continue to Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
