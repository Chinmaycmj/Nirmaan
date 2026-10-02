'use client';

import React, { useState } from 'react';
import { 
  explainCodeLine, 
  findTokenDocumentation, 
  TokenDoc,
  TOKEN_DOCUMENTATION_REGISTRY 
} from '@/lib/learning/tokenDocumentation';
import { 
  ExternalLink, 
  HelpCircle, 
  BookOpen, 
  Sparkles, 
  Info, 
  ChevronRight,
  X,
  Code2
} from 'lucide-react';

interface InteractiveTokenCodeViewerProps {
  code: string;
  language: string;
  onCopyOrInsert?: () => void;
  title?: string;
}

export const InteractiveTokenCodeViewer: React.FC<InteractiveTokenCodeViewerProps> = ({
  code,
  language,
  onCopyOrInsert,
  title = 'REFERENCE CODE',
}) => {
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  const [selectedTokenDoc, setSelectedTokenDoc] = useState<TokenDoc | null>(null);
  const [activeLineExplanation, setActiveLineExplanation] = useState<{
    lineNumber: number;
    explanation: string;
    primaryToken?: TokenDoc;
    allTokens: TokenDoc[];
    externalDocUrl: string;
    docSource: string;
  } | null>(null);

  const lines = code.split('\n');

  const handleLineMouseEnter = (line: string, index: number) => {
    setHoveredLineIndex(index);
    const lineInfo = explainCodeLine(line, index + 1, language);
    setActiveLineExplanation(lineInfo);
  };

  const handleTokenClick = (e: React.MouseEvent, tokenStr: string) => {
    e.stopPropagation();
    const doc = findTokenDocumentation(tokenStr, language);
    if (doc) {
      setSelectedTokenDoc(doc);
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-zinc-800 bg-[#08090d] overflow-hidden shadow-2xl relative select-text">
      {/* Header bar */}
      <div className="h-9 px-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-zinc-200">
            <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
            <span>{title} ({language})</span>
          </div>
          <span className="text-[10px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full border border-zinc-700/50">
            Hover any line or token to inspect
          </span>
        </div>

        {onCopyOrInsert && (
          <button
            type="button"
            onClick={onCopyOrInsert}
            className="text-[10px] text-zinc-300 hover:text-white px-2.5 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors font-mono font-medium shadow-sm"
            title="Load reference into workspace"
          >
            Copy to Area
          </button>
        )}
      </div>

      {/* Main Code Lines Container */}
      <div className="p-2 font-mono text-[12px] bg-[#050608] overflow-x-auto leading-relaxed max-h-72 custom-scrollbar">
        {lines.map((line, idx) => {
          const isHovered = hoveredLineIndex === idx;
          const lineNum = idx + 1;

          return (
            <div
              key={idx}
              onMouseEnter={() => handleLineMouseEnter(line, idx)}
              className={`group flex items-start py-0.5 px-2 rounded transition-colors relative cursor-pointer ${
                isHovered ? 'bg-zinc-800/60 ring-1 ring-zinc-700/80' : 'hover:bg-zinc-900/40'
              }`}
            >
              {/* Line Number */}
              <span className={`w-7 shrink-0 text-right pr-3 select-none text-[11px] font-mono ${
                isHovered ? 'text-zinc-200 font-bold' : 'text-zinc-600'
              }`}>
                {lineNum}
              </span>

              {/* Line Content with interactive token highlights */}
              <div className="flex-1 whitespace-pre pr-20 text-zinc-300">
                {line || ' '}
              </div>

              {/* Quick Hover Line Action Pill */}
              {isHovered && (
                <div className="absolute right-2 top-0.5 bottom-0.5 flex items-center gap-1.5 select-none animate-fadeIn">
                  {activeLineExplanation?.externalDocUrl && (
                    <a
                      href={activeLineExplanation.externalDocUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 font-mono transition-colors shadow"
                      title={`Open official ${activeLineExplanation.docSource} in new tab`}
                    >
                      <span>{activeLineExplanation.docSource}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-zinc-400" />
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Line & Token Inspector Drawer (Always visible or shows active hovered line) */}
      <div className="border-t border-zinc-800 bg-[#090a0f] p-3 text-xs">
        {selectedTokenDoc ? (
          /* Focused Token Inspector Card */
          <div className="space-y-2 animate-fadeIn bg-zinc-950 p-2.5 rounded-lg border border-zinc-700">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-white font-mono text-[11px] font-bold border border-zinc-600">
                  {selectedTokenDoc.token}
                </span>
                <span className="text-[11px] text-zinc-400 uppercase tracking-wide font-mono">
                  {selectedTokenDoc.name}
                </span>
              </div>
              <button
                onClick={() => setSelectedTokenDoc(null)}
                className="text-zinc-400 hover:text-white p-0.5 rounded"
                title="Close token inspector"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-zinc-300 text-xs leading-relaxed">
              {selectedTokenDoc.detailedExplanation}
            </p>

            {selectedTokenDoc.realLifeAnalogy && (
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 italic">
                <span className="font-semibold not-italic text-zinc-200">🌍 Real-World Analogy: </span>
                "{selectedTokenDoc.realLifeAnalogy}"
              </div>
            )}

            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-zinc-500 font-mono">
                Language: <strong className="text-zinc-300 uppercase">{selectedTokenDoc.language}</strong>
              </span>
              <a
                href={selectedTokenDoc.documentationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white text-black hover:bg-zinc-200 font-semibold text-[11px] transition-all shadow"
              >
                <span>Original Source: {selectedTokenDoc.documentationSource}</span>
                <ExternalLink className="w-3 h-3 text-black" />
              </a>
            </div>
          </div>
        ) : activeLineExplanation ? (
          /* Active Line Breakdown View */
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Line {activeLineExplanation.lineNumber}
                </span>
                <span className="text-zinc-300 font-medium text-xs">
                  {activeLineExplanation.explanation}
                </span>
              </div>

              {activeLineExplanation.externalDocUrl && (
                <a
                  href={activeLineExplanation.externalDocUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-200 hover:text-white underline decoration-zinc-500 hover:decoration-white font-mono transition-colors shrink-0"
                  title={`View original specification on ${activeLineExplanation.docSource}`}
                >
                  <span>Docs: {activeLineExplanation.docSource}</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              )}
            </div>

            {/* Token chips for this line */}
            {activeLineExplanation.allTokens.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-zinc-500 font-mono uppercase">Tokens:</span>
                {activeLineExplanation.allTokens.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTokenDoc(t)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[10px] font-mono transition-colors"
                    title={`Click to inspect ${t.name}`}
                  >
                    <span>{t.token}</span>
                    <HelpCircle className="w-2.5 h-2.5 text-zinc-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Default Empty Prompt */
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
              <span>Hover cursor over any line above to see what it is doing or jump to official docs.</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">Live Token Inspector</span>
          </div>
        )}
      </div>
    </div>
  );
};
