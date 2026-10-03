'use client';

import React, { useState, useEffect } from 'react';
import { 
  explainCodeLine, 
  findTokenDocumentation, 
  TokenDoc,
  LineSyllableToken,
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
  Code2,
  Volume2,
  Bookmark
} from 'lucide-react';

interface InteractiveTokenCodeViewerProps {
  code: string;
  language: string;
  onCopyOrInsert?: () => void;
  title?: string;
  theme?: 'sand' | 'dark';
}

export const InteractiveTokenCodeViewer: React.FC<InteractiveTokenCodeViewerProps> = ({
  code,
  language,
  onCopyOrInsert,
  title = 'REFERENCE CODE',
  theme = 'sand',
}) => {
  const [selectedLineIndex, setSelectedLineIndex] = useState<number>(0);
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  const [selectedTokenDoc, setSelectedTokenDoc] = useState<TokenDoc | null>(null);
  const [selectedSyllableToken, setSelectedSyllableToken] = useState<LineSyllableToken | null>(null);
  
  const [activeLineExplanation, setActiveLineExplanation] = useState<{
    lineNumber: number;
    explanation: string;
    primaryToken?: TokenDoc;
    allTokens: TokenDoc[];
    syllables: LineSyllableToken[];
    externalDocUrl: string;
    docSource: string;
  } | null>(null);

  const lines = code ? code.split('\n') : [''];

  // Initialize line 1 breakdown on mount or when code changes
  useEffect(() => {
    if (lines.length > 0) {
      const firstLine = lines[0] || '';
      const lineInfo = explainCodeLine(firstLine, 1, language);
      setActiveLineExplanation(lineInfo);
      setSelectedLineIndex(0);
      if (lineInfo.syllables.length > 0) {
        setSelectedSyllableToken(lineInfo.syllables[0]);
      }
    }
  }, [code, language]);

  const handleLineClickOrHover = (line: string, index: number) => {
    setHoveredLineIndex(index);
    setSelectedLineIndex(index);
    const lineInfo = explainCodeLine(line, index + 1, language);
    setActiveLineExplanation(lineInfo);
    if (lineInfo.syllables.length > 0) {
      setSelectedSyllableToken(lineInfo.syllables[0]);
    }
  };

  const handleTokenSelect = (e: React.MouseEvent, sylToken: LineSyllableToken) => {
    e.stopPropagation();
    setSelectedSyllableToken(sylToken);
    const doc = findTokenDocumentation(sylToken.text, language);
    if (doc) {
      setSelectedTokenDoc(doc);
    } else {
      setSelectedTokenDoc({
        token: sylToken.text,
        name: sylToken.text,
        category: sylToken.category as any,
        language: (language.toLowerCase() as any) || 'universal',
        shortDescription: sylToken.explanation,
        detailedExplanation: `Grammar Role: ${sylToken.grammarRole}. This syntax token performs an essential execution step in this line.`,
        documentationUrl: sylToken.docUrl,
        documentationSource: sylToken.docSource as any,
        syllableBreakdown: sylToken.syllables,
        phonetic: sylToken.phonetic,
        grammarRole: sylToken.grammarRole,
      });
    }
  };

  const isSand = theme === 'sand';

  // Syntax highlighting helper for token display
  const highlightToken = (token: string) => {
    const t = token.trim();
    if (['switch', 'case', 'return', 'def', 'if', 'else', 'const', 'let', 'public', 'static'].includes(t)) {
      return isSand ? 'text-[#0e4d82] font-bold' : 'text-blue-400 font-bold';
    }
    if (['double', 'char', 'int', 'float', 'void', 'boolean'].includes(t)) {
      return isSand ? 'text-[#92400e] font-bold' : 'text-amber-400 font-bold';
    }
    if (t.startsWith('"') || t.startsWith("'") || /^[0-9]+(\.[0-9]+)?$/.test(t)) {
      return isSand ? 'text-[#15803d]' : 'text-emerald-400';
    }
    if (t.startsWith('//') || t.startsWith('#')) {
      return isSand ? 'text-[#a8a29e] italic' : 'text-zinc-500 italic';
    }
    return isSand ? 'text-[#1c1917]' : 'text-zinc-200';
  };

  return (
    <div className={`flex flex-col rounded-2xl border overflow-hidden shadow-xl relative select-text transition-colors duration-200 ${
      isSand 
        ? 'bg-[#fffdfa] border-[#e8dec8] text-[#1c1917]' 
        : 'bg-[#08090d] border-zinc-800 text-[#f4f4f5]'
    }`}>
      {/* Top Header Bar */}
      <div className={`h-10 px-4 border-b flex items-center justify-between select-none ${
        isSand ? 'bg-[#fcf8f1] border-[#ebd7bf]' : 'bg-zinc-900/90 border-zinc-800'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${
            isSand ? 'text-[#0e4d82]' : 'text-zinc-200'
          }`}>
            <BookOpen className="w-3.5 h-3.5" />
            <span>{title} ({language})</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
            isSand 
              ? 'bg-[#faf4e8] text-[#78350f] border-[#e7ded0]' 
              : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/50'
          }`}>
            Click or hover any line for syllable &amp; syntax breakdown
          </span>
        </div>

        {onCopyOrInsert && (
          <button
            type="button"
            onClick={onCopyOrInsert}
            className={`text-[11px] px-3 py-1 rounded-lg border font-mono font-semibold transition-all shadow-sm active:scale-95 ${
              isSand 
                ? 'bg-[#0e4d82] hover:bg-[#09355b] text-white border-[#09355b]' 
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
            }`}
            title="Load reference into workspace"
          >
            Copy Reference to Area
          </button>
        )}
      </div>

      {/* Main Code Lines Container */}
      <div className={`p-2 font-mono text-[12px] overflow-x-auto leading-relaxed max-h-72 custom-scrollbar ${
        isSand ? 'bg-[#fbf7ee]' : 'bg-[#050608]'
      }`}>
        {lines.map((line, idx) => {
          const isSelected = selectedLineIndex === idx;
          const isHovered = hoveredLineIndex === idx;
          const lineNum = idx + 1;

          return (
            <div
              key={idx}
              onMouseEnter={() => handleLineClickOrHover(line, idx)}
              onClick={() => handleLineClickOrHover(line, idx)}
              className={`group flex items-start py-0.5 px-2.5 rounded-lg transition-all relative cursor-pointer ${
                isSelected
                  ? isSand
                    ? 'bg-[#f3ebe0] ring-1 ring-[#0e4d82]/40 shadow-sm'
                    : 'bg-zinc-800/80 ring-1 ring-zinc-700'
                  : isHovered
                    ? isSand
                      ? 'bg-[#f7efe3]'
                      : 'bg-zinc-800/50'
                    : isSand
                      ? 'hover:bg-[#f9f3e9]'
                      : 'hover:bg-zinc-900/40'
              }`}
            >
              {/* Line Number */}
              <span className={`w-8 shrink-0 text-right pr-3 select-none text-[11px] font-mono ${
                isSelected
                  ? isSand
                    ? 'text-[#0e4d82] font-black'
                    : 'text-white font-bold'
                  : isSand
                    ? 'text-[#a89f91]'
                    : 'text-zinc-600'
              }`}>
                {lineNum}
              </span>

              {/* Line Content */}
              <div className="flex-1 whitespace-pre pr-28">
                {line || ' '}
              </div>

              {/* Quick Hover / Selection Line Badge */}
              {isSelected && activeLineExplanation?.docSource && (
                <div className="absolute right-2 top-0.5 bottom-0.5 flex items-center gap-1.5 select-none animate-fadeIn">
                  <a
                    href={activeLineExplanation.externalDocUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded border font-mono transition-colors shadow-sm ${
                      isSand
                        ? 'bg-[#ffffff] hover:bg-[#faf6ee] text-[#0e4d82] border-[#ded5c5]'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-600'
                    }`}
                    title={`Open official ${activeLineExplanation.docSource} in new tab`}
                  >
                    <span>{activeLineExplanation.docSource}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SYLLABLE, SYNTAX & GRAMMAR DECOMPOSITION RIBBON                           */}
      {/* ========================================================================= */}
      <div className={`border-t p-3.5 text-xs transition-colors duration-200 ${
        isSand ? 'bg-[#fffdfa] border-[#ebd7bf]' : 'bg-[#090a0f] border-zinc-800'
      }`}>
        {activeLineExplanation ? (
          <div className="space-y-3">
            {/* 1. Line Overview & Official Documentation Link */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${
                  isSand 
                    ? 'bg-amber-100 text-[#92400e] border-amber-300' 
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                }`}>
                  Line {activeLineExplanation.lineNumber}
                </span>
                <span className={`font-semibold text-xs ${
                  isSand ? 'text-[#1c1917]' : 'text-zinc-200'
                }`}>
                  {activeLineExplanation.explanation}
                </span>
              </div>

              {activeLineExplanation.externalDocUrl && (
                <a
                  href={activeLineExplanation.externalDocUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold underline transition-colors shrink-0 ${
                    isSand 
                      ? 'text-[#0e4d82] hover:text-[#09355b] decoration-[#0e4d82]/60' 
                      : 'text-zinc-200 hover:text-white decoration-zinc-500'
                  }`}
                  title={`View original specification on ${activeLineExplanation.docSource}`}
                >
                  <span>Official Docs: {activeLineExplanation.docSource}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* 2. EVERY TOKEN & SYLLABLE DECOMPOSITION STRIP */}
            {activeLineExplanation.syllables.length > 0 && (
              <div className="space-y-1.5">
                <div className={`flex items-center gap-2 text-[10px] font-mono uppercase font-bold tracking-wider ${
                  isSand ? 'text-[#78716c]' : 'text-zinc-400'
                }`}>
                  <span>Every Syntax &amp; Syllable on this Line:</span>
                  <span className="text-[9px] font-normal normal-case">(Click any token to inspect phonetic pronunciation and grammar role)</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {activeLineExplanation.syllables.map((syl, sIdx) => {
                    const isTokenActive = selectedSyllableToken?.text === syl.text;

                    return (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={(e) => handleTokenSelect(e, syl)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-medium transition-all shadow-sm ${
                          isTokenActive
                            ? isSand
                              ? 'bg-amber-100/90 border-amber-400 text-[#92400e] ring-2 ring-amber-300/60 font-bold scale-[1.03]'
                              : 'bg-indigo-900/60 border-indigo-500 text-white ring-2 ring-indigo-500/50 font-bold scale-[1.03]'
                            : isSand
                              ? 'bg-[#faf6ee] hover:bg-[#f4ecdf] text-[#292524] border-[#ded5c5]'
                              : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                        }`}
                        title={`Deconstruct ${syl.text} (${syl.grammarRole})`}
                      >
                        <span className={highlightToken(syl.text)}>{syl.text}</span>
                        {syl.phonetic && (
                          <span className={`text-[9px] font-sans ${isSand ? 'text-[#78716c]' : 'text-zinc-400'}`}>
                            {syl.phonetic}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. FOCUSED TOKEN & SYLLABLE DETAILS CARD */}
            {selectedSyllableToken && (
              <div className={`p-3 rounded-xl border space-y-2 animate-fadeIn transition-colors ${
                isSand 
                  ? 'bg-[#fcf9f2] border-[#ebd7bf] text-[#1c1917]' 
                  : 'bg-zinc-950 border-zinc-700 text-zinc-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold border ${
                      isSand 
                        ? 'bg-[#ffffff] text-[#0e4d82] border-[#ded5c5]' 
                        : 'bg-zinc-800 text-white border-zinc-600'
                    }`}>
                      {selectedSyllableToken.text}
                    </span>
                    {selectedSyllableToken.syllables && (
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                        isSand 
                          ? 'bg-amber-100 text-[#92400e] border-amber-200' 
                          : 'bg-zinc-900 text-amber-300 border-amber-900/60'
                      }`}>
                        Syllables: <strong>{selectedSyllableToken.syllables}</strong> {selectedSyllableToken.phonetic}
                      </span>
                    )}
                    <span className={`text-[11px] font-mono uppercase tracking-wide px-2 py-0.5 rounded border ${
                      isSand ? 'bg-[#ede5d8] text-[#57534e] border-[#ded5c5]' : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                    }`}>
                      {selectedSyllableToken.grammarRole}
                    </span>
                  </div>

                  <a
                    href={selectedSyllableToken.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-[11px] transition-all shadow-sm ${
                      isSand 
                        ? 'bg-[#0e4d82] hover:bg-[#09355b] text-white' 
                        : 'bg-white hover:bg-zinc-200 text-black'
                    }`}
                  >
                    <span>Original Source: {selectedSyllableToken.docSource}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className={`text-xs leading-relaxed ${isSand ? 'text-[#44403c]' : 'text-zinc-300'}`}>
                  {selectedTokenDoc?.detailedExplanation || selectedSyllableToken.explanation}
                </p>

                {selectedTokenDoc?.realLifeAnalogy && (
                  <div className={`p-2.5 rounded-lg border text-[11px] italic leading-relaxed ${
                    isSand 
                      ? 'bg-[#fffaf0] border-amber-200/80 text-[#78350f]' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                  }`}>
                    <span className="font-bold not-italic">🌍 Real-World Analogy: </span>
                    "{selectedTokenDoc.realLifeAnalogy}"
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className={`flex items-center justify-between text-xs ${
            isSand ? 'text-[#78716c]' : 'text-zinc-400'
          }`}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Hover or click any code line above to inspect every token, syntax, syllable, and official documentation.</span>
            </div>
            <span className="text-[10px] font-mono text-amber-600 font-bold">100% Syntax Transparency</span>
          </div>
        )}
      </div>
    </div>
  );
};
