'use client';

import React, { useState } from 'react';
import { ConceptExplanation, ExplanationLevel } from '@/types/ai';
import { X, BookOpen, Layers, Lightbulb, AlertTriangle, Code, ArrowRight } from 'lucide-react';

interface ExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: ConceptExplanation | null;
}

export const ExplanationModal: React.FC<ExplanationModalProps> = ({
  isOpen,
  onClose,
  explanation,
}) => {
  const [level, setLevel] = useState<ExplanationLevel>('beginner');

  if (!isOpen || !explanation) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{explanation.concept}</h2>
              <span className="text-[11px] text-slate-400">{explanation.language} • Concept Deep Dive</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level Selector Tabs */}
        <div className="px-5 pt-4 flex space-x-2 border-b border-slate-800 pb-3">
          {(['beginner', 'intermediate', 'advanced'] as ExplanationLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                level === lvl
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl} Perspective
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Main dynamic explanation based on selected level */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-200 leading-relaxed text-sm">
            {level === 'beginner' && (
              <p>{explanation.beginnerExplanation}</p>
            )}
            {level === 'intermediate' && (
              <p>{explanation.intermediateExplanation}</p>
            )}
            {level === 'advanced' && (
              <p>{explanation.advancedExplanation}</p>
            )}
          </div>

          {/* Syntax block */}
          <div className="space-y-1.5">
            <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              <span>Syntax Pattern:</span>
            </span>
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-emerald-400 text-xs overflow-x-auto">
              {explanation.syntax}
            </pre>
          </div>

          {/* What it does vs Why it exists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>What It Does:</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">{explanation.whatItDoes}</p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Why It Exists in This Project:</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">{explanation.whyItExists}</p>
            </div>
          </div>

          {/* Common pitfalls */}
          {explanation.commonPitfalls && explanation.commonPitfalls.length > 0 && (
            <div className="bg-rose-950/20 border border-rose-900/40 p-3.5 rounded-xl text-slate-300">
              <div className="font-semibold text-rose-400 mb-2 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Common Traps to Avoid:</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
                {explanation.commonPitfalls.map((pitfall, i) => (
                  <li key={i}>{pitfall}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Got it, back to coding
          </button>
        </div>
      </div>
    </div>
  );
};
