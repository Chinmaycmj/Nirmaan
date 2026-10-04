'use client';

import React from 'react';
import { ShieldCheck, Lock, Cpu, Globe, CheckCircle2, X, Terminal, Server, Sparkles } from 'lucide-react';

interface TrustTransparencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrustTransparencyModal: React.FC<TrustTransparencyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1c1917]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFF1E7] border border-[#ebdcd0] rounded-3xl max-w-xl w-full p-6 shadow-2xl animate-fadeIn space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ebdcd0] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#1c1917] tracking-tight">Trust, Execution &amp; Privacy Architecture</h3>
              <p className="text-[11px] text-[#78716c]">Transparent disclosure of execution environments, data policies, and security boundaries</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-[#78716c] hover:text-[#1c1917] hover:bg-[#f6e7db]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Execution Sandboxes */}
        <div className="bg-white/90 p-4 rounded-2xl border border-[#ebdcd0] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1c1917]">
            <Server className="w-4 h-4 text-[#326080]" />
            <span>Where Does Your Code Execute?</span>
          </div>
          
          <div className="space-y-2 text-xs text-[#44403c]">
            <div className="p-2.5 rounded-xl bg-[#faf6ee] border border-[#ebdcd0]">
              <span className="font-bold text-[#326080] font-mono text-[11px]">Web Stacks (HTML5, CSS3, JavaScript, React):</span>
              <p className="text-[11px] mt-0.5 leading-relaxed">
                Runs 100% inside your local browser via a sandboxed virtual DOM iframe with strict CSP boundaries. Zero external server execution required.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-[#faf6ee] border border-[#ebdcd0]">
              <span className="font-bold text-[#326080] font-mono text-[11px]">Scripting Stacks (Python 3):</span>
              <p className="text-[11px] mt-0.5 leading-relaxed">
                Executes via an isolated WebAssembly Web Worker (Pyodide sandbox). Your code never leaves your computer for standard terminal routines.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-[#faf6ee] border border-[#ebdcd0]">
              <span className="font-bold text-[#326080] font-mono text-[11px]">Systems Stacks (C++ 20 &amp; Java 21):</span>
              <p className="text-[11px] mt-0.5 leading-relaxed">
                Compiled in isolated, ephemeral server runners with hard resource caps (CPU, memory, 10s execution timeout, and zero raw socket egress).
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Privacy & Data Ownership */}
        <div className="bg-white/90 p-4 rounded-2xl border border-[#ebdcd0] space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1c1917]">
            <Lock className="w-4 h-4 text-[#326080]" />
            <span>Data Privacy &amp; AI Provider Boundaries</span>
          </div>
          <ul className="text-xs text-[#44403c] space-y-1.5 list-disc list-inside">
            <li><strong>Zero Training On Your Code:</strong> Your proprietary code and student submissions are never used to train public foundational models.</li>
            <li><strong>Local-First Persistence:</strong> Your active buffer, checkpoints, and files are autosaved directly to your browser's local storage engine.</li>
            <li><strong>Prompt-Injection Quarantine:</strong> Imported GitHub repositories are sanitized and parsed strictly as untrusted source data.</li>
            <li><strong>Deterministic Policy Engine:</strong> AI assistance levels (1 to 5) are strictly enforced by client-side rules, not unverified LLM prompts.</li>
          </ul>
        </div>

        {/* Section 3: Human Ownership Guarantee */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 text-xs text-[#78350f] space-y-1">
          <span className="font-bold">🎯 The Nirmaan Learning Guarantee:</span>
          <p className="leading-relaxed text-[11px]">
            Unlike commercial autocomplete engines that maximize generated characters, Nirmaan optimizes for your <strong>Independent Mastery Gain</strong>. Every AI contribution is diffable, reviewable, and paired with conceptual mastery checkpoints.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#326080] hover:bg-[#254b66] text-white text-xs font-bold transition-all shadow-sm"
        >
          Understood &amp; Close
        </button>
      </div>
    </div>
  );
};
