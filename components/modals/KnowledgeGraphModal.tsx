'use client';

import React from 'react';
import { KNOWLEDGE_GRAPH_CONCEPTS, getPrerequisiteChain } from '@/lib/learning/conceptGraph';
import { Project } from '@/types/project';
import { LearningCheckpoint } from '@/types/learning';
import { X, BookOpen, CheckCircle, Clock, AlertCircle, ArrowRight, Layers, Sparkles, FolderGit2, Code2 } from 'lucide-react';

interface KnowledgeGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  masteredConceptIds: string[];
  activeConceptId: string;
  project?: Project;
  activeCheckpoint?: LearningCheckpoint;
}

interface ConceptNode {
  id: string;
  name: string;
  category: string;
  description: string;
  prerequisites: string[];
}

export const KnowledgeGraphModal: React.FC<KnowledgeGraphModalProps> = ({
  isOpen,
  onClose,
  masteredConceptIds,
  activeConceptId,
  project,
  activeCheckpoint,
}) => {
  if (!isOpen) return null;

  const masteredSet = new Set(masteredConceptIds);
  const totalLines = project?.files?.reduce((acc, f) => acc + (f.content ? f.content.split('\n').length : 0), 0) || 0;

  // Determine repository stack
  const techStack = project?.techStack;
  const lang = (techStack?.language || '').toLowerCase();
  const styling = (techStack?.styling || '').toLowerCase();
  const frontend = (techStack?.frontend || '').toLowerCase();

  const isHtmlCss = lang.includes('html') || lang.includes('css') || styling.includes('css') || frontend.includes('html') || project?.name.includes('Bhukkad');
  const isPython = lang.includes('python') || lang.includes('py');

  // Dynamic stack-tailored concepts
  let conceptsList: Record<string, ConceptNode> = KNOWLEDGE_GRAPH_CONCEPTS;

  if (isHtmlCss) {
    conceptsList = {
      html5_semantics: {
        id: 'html5_semantics',
        name: 'HTML5 Semantic Landmarks',
        category: 'DOCUMENT STRUCTURE',
        description: 'Organizing visual layout using <nav>, <header>, <main>, and <button> for screen readers and SEO.',
        prerequisites: [],
      },
      css_box_model: {
        id: 'css_box_model',
        name: 'CSS Box Model & Geometry',
        category: 'DOCUMENT STRUCTURE',
        description: 'Managing box-sizing: border-box, internal padding spacing, and external margin separation.',
        prerequisites: ['html5_semantics'],
      },
      css_flexbox: {
        id: 'css_flexbox',
        name: 'CSS Flexbox & 1D Track Alignment',
        category: 'LAYOUT & STYLING',
        description: 'Arranging navigation items and action buttons with display: flex, justify-content, and align-items: center.',
        prerequisites: ['css_box_model'],
      },
      css_design_tokens: {
        id: 'css_design_tokens',
        name: 'Design Tokens & CSS Variables',
        category: 'LAYOUT & STYLING',
        description: 'Managing brand colors (var(--white), #d97706), typography scale (font-size: 22px), and stroke weights (800).',
        prerequisites: ['css_box_model'],
      },
      dom_event_listeners: {
        id: 'dom_event_listeners',
        name: 'DOM Event Listeners & Interactivity',
        category: 'DYNAMIC BEHAVIOR',
        description: 'Binding user taps and clicks using addEventListener to trigger dynamic page updates and order actions.',
        prerequisites: ['html5_semantics'],
      },
      responsive_viewports: {
        id: 'responsive_viewports',
        name: 'Responsive Layouts & Media Queries',
        category: 'DYNAMIC BEHAVIOR',
        description: 'Adapting navigation buttons and food catalog grids across mobile and desktop viewport widths.',
        prerequisites: ['css_flexbox'],
      },
    };
  } else if (isPython) {
    conceptsList = {
      py_functions: {
        id: 'py_functions',
        name: 'Python Functions & Scope',
        category: 'PROCEDURAL LOGIC',
        description: 'Declaring pure computational routines with def, type hints, and parameter contracts.',
        prerequisites: [],
      },
      py_data_structures: {
        id: 'py_data_structures',
        name: 'Lists, Dictionaries & Comprehensions',
        category: 'PROCEDURAL LOGIC',
        description: 'Transforming and filtering collections using idiomatic Python list comprehensions.',
        prerequisites: ['py_functions'],
      },
      py_data_models: {
        id: 'py_data_models',
        name: 'Object-Oriented Data Models',
        category: 'DATA CONTRACTS',
        description: 'Defining schemas and classes with Pydantic BaseModel or dataclasses for structured serialization.',
        prerequisites: ['py_data_structures'],
      },
      py_async_apis: {
        id: 'py_async_apis',
        name: 'Asynchronous Coroutines & APIs',
        category: 'BACKEND SERVICES',
        description: 'Handling non-blocking I/O and routing using async def and FastAPI endpoint decorators.',
        prerequisites: ['py_data_models'],
      },
    };
  }

  const getStatus = (conceptId: string) => {
    if (masteredSet.has(conceptId)) return 'mastered';
    if (conceptId === activeConceptId || activeCheckpoint?.conceptId.includes(conceptId)) return 'active';
    const prereqs = conceptsList[conceptId]?.prerequisites || [];
    const canStart = prereqs.every(p => masteredSet.has(p));
    return canStart ? 'ready' : 'locked';
  };

  const statusBadges = {
    mastered: { label: 'Mastered', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    active: { label: 'In Progress (Current Focus)', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
    ready: { label: 'Ready to Learn', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    locked: { label: 'Prerequisites Needed', bg: 'bg-slate-800 text-slate-400 border-slate-700' },
  };

  const categories = Array.from(new Set(Object.values(conceptsList).map(c => c.category)));

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Repository Knowledge Graph &amp; Tech Stack</span>
                {project && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700">
                    {project.name}
                  </span>
                )}
              </h2>
              <span className="text-[11px] text-slate-400">Architectural breakdown and concept progression for this codebase</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* REPOSITORY TECH STACK & PROMPT HERO CARD */}
        {project && (
          <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border-b border-slate-800 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-indigo-400" />
                <span className="font-mono font-bold text-xs text-white uppercase tracking-wider">
                  Tech Stack Detected:
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {project.techStack?.frontend || 'HTML5 / CSS3'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {project.techStack?.language || 'JavaScript'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {project.techStack?.styling || 'CSS Flexbox / Grid'}
                </span>
              </div>

              <div className="text-[11px] font-mono text-slate-400">
                <span>Scale: </span>
                <strong className="text-white">{project.files.length} Files</strong>
                <span> • </span>
                <strong className="text-white">{totalLines.toLocaleString()} Lines</strong>
              </div>
            </div>

            {/* Prompt / Purpose */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 leading-relaxed flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Repository Purpose / Prompt: </strong>
                <span>{project.description || activeCheckpoint?.prompt || 'Interactive web application featuring structured component architecture and real-time user interactivity.'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap gap-4 text-[11px]">
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
            <span>Prerequisites Needed</span>
          </span>
        </div>

        {/* Graph / Grid of concepts */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          {categories.map(category => {
            const concepts = Object.values(conceptsList).filter(c => c.category === category);
            return (
              <div key={category} className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-3 h-3 text-indigo-400" />
                  <span>{category}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {concepts.map(concept => {
                    const status = getStatus(concept.id);
                    const badge = statusBadges[status];
                    return (
                      <div
                        key={concept.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          status === 'active'
                            ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md shadow-indigo-500/20'
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
                              {concept.prerequisites.map(p => conceptsList[p]?.name || p).join(', ')}
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
