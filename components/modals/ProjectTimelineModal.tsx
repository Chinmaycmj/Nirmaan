'use client';

import React from 'react';
import { ProjectMilestone } from '@/types/learning';
import { X, Layers, CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react';

interface ProjectTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestones: ProjectMilestone[];
  onSelectMilestoneFile?: (targetFile: string) => void;
}

export const ProjectTimelineModal: React.FC<ProjectTimelineModalProps> = ({
  isOpen,
  onClose,
  milestones,
  onSelectMilestoneFile,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Project Evolution Timeline</h2>
              <span className="text-[11px] text-slate-400">Step-by-step milestones & concepts mastered</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="relative border-l border-slate-800 ml-4 space-y-8">
            {milestones.map((m, idx) => (
              <div key={m.id} className="relative pl-6">
                {/* Node icon */}
                <span className={`absolute -left-3 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                  m.completed
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}>
                  {m.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                </span>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{m.title}</span>
                    <span className="text-[10px] text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded-full font-medium">
                      {m.conceptName}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{m.description}</p>
                  
                  <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-900">
                    <span>File: <span className="font-mono text-slate-400">{m.targetFile}</span></span>
                    {onSelectMilestoneFile && (
                      <button
                        onClick={() => {
                          onSelectMilestoneFile(m.targetFile);
                          onClose();
                        }}
                        className="text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                      >
                        <span>Inspect Code</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  );
};
