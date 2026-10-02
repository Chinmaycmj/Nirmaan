'use client';

import React from 'react';
import { KNOWLEDGE_GRAPH_CONCEPTS, getPrerequisiteChain } from '@/lib/learning/conceptGraph';
import { X, BookOpen, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';

interface KnowledgeGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  masteredConceptIds: string[];
  activeConceptId: string;
}

export const KnowledgeGraphModal: React.FC<KnowledgeGraphModalProps> = ({
  isOpen,
  onClose,
  masteredConceptIds,
  activeConceptId,
}) => {
  if (!isOpen) return null;

  const masteredSet = new Set(masteredConceptIds);

  const getStatus = (conceptId: string) => {
    if (masteredSet.has(conceptId)) return 'mastered';
    if (conceptId === activeConceptId) return 'active';
    const prereqs = KNOWLEDGE_GRAPH_CONCEPTS[conceptId]?.prerequisites || [];
    const canStart = prereqs.every(p => masteredSet.has(p));
    return canStart ? 'ready' : 'locked';
  };

  const statusBadges = {
    mastered: { label: 'Mastered', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    active: { label: 'In Progress (Current)', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
    ready: { label: 'Ready to Learn', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    locked: { label: 'Prerequisites Needed', bg: 'bg-slate-800 text-slate-400 border-slate-700' },
  };

  // Group concepts by category
  const categories = Array.from(new Set(Object.values(KNOWLEDGE_GRAPH_CONCEPTS).map(c => c.category)));

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Full Programming Knowledge Graph</h2>
              <span className="text-[11px] text-slate-400">Concept Prerequisites & Learning Progression</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap gap-3 text-[11px]">
          <span className="flex items-center space-x-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Mastered</span>
          </span>
          <span className="flex items-center space-x-1.5 text-indigo-400">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span>Current Focus</span>
          </span>
          <span className="flex items-center space-x-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Ready Next</span>
          </span>
          <span className="flex items-center space-x-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
            <span>Upcoming</span>
          </span>
        </div>

        {/* Graph / Grid of concepts */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {categories.map(category => {
            const concepts = Object.values(KNOWLEDGE_GRAPH_CONCEPTS).filter(c => c.category === category);
            return (
              <div key={category} className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {concepts.map(concept => {
                    const status = getStatus(concept.id);
                    const badge = statusBadges[status];
                    return (
                      <div
                        key={concept.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          status === 'active'
                            ? 'bg-indigo-950/40 border-indigo-500/50 shadow-sm shadow-indigo-500/20'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <span className="font-semibold text-xs text-white">{concept.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{concept.description}</p>
                        {concept.prerequisites.length > 0 && (
                          <div className="mt-2 text-[10px] text-slate-500 flex items-center space-x-1">
                            <span>Prereqs:</span>
                            <span className="text-slate-400">
                              {concept.prerequisites.map(p => KNOWLEDGE_GRAPH_CONCEPTS[p]?.name || p).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Graph
          </button>
        </div>
      </div>
    </div>
  );
};
