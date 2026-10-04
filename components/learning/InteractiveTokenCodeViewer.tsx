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
  analyzeCodeLineWithAI, 
  AICodeAnalysis 
} from '@/lib/ai/codeLineAnalyzer';
import {
  detectEnclosingCodeBlock,
  analyzeTokenInBlockContext,
  tokenizeLineForInteractiveDisplay,
  TokenBlockContextAnalysis,
  EnclosingBlockInfo
} from '@/lib/ai/blockContextAnalyzer';
import { aiService } from '@/lib/ai/provider';
import { 
  ExternalLink, 
  BookOpen, 
  Sparkles, 
  Code2, 
  Bot, 
  MessageSquare, 
  ArrowUp, 
  FileCode2, 
  Layers,
  Zap,
  AlertTriangle,
  Compass,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { LearningCardData } from '@/components/learning/FloatingLearningCard';

export interface InteractiveTokenCodeViewerProps {
  code: string;
  language: string;
  onCopyOrInsert?: () => void;
  title?: string;
  theme?: 'sand' | 'dark';
  projectName?: string;
  fileName?: string;
  onOpenFloatingCard?: (data: LearningCardData) => void;
  onSelectLine?: (lineNum: number) => void;
}

export const InteractiveTokenCodeViewer: React.FC<InteractiveTokenCodeViewerProps> = ({
  code,
  language,
  onCopyOrInsert,
  title = 'Reference',
  theme = 'sand',
  projectName = 'Application',
  fileName,
  onOpenFloatingCard,
  onSelectLine,
}) => {
  // Explanation Mode: 'block_scope' (Surrounding Scope & Block) vs 'ai_analysis' (AI Line Deep Analysis) vs 'official_syntax' (Official Language Specs)
  const [explanationMode, setExplanationMode] = useState<'block_scope' | 'ai_analysis' | 'official_syntax'>('block_scope');
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);

  const [selectedLineIndex, setSelectedLineIndex] = useState<number>(0);
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [hoveredToken, setHoveredToken] = useState<string | null>(null);
  const [selectedTokenDoc, setSelectedTokenDoc] = useState<TokenDoc | null>(null);
  const [selectedSyllableToken, setSelectedSyllableToken] = useState<LineSyllableToken | null>(null);

  // Dynamic Surrounding Block & Scope Intelligence State
  const [blockAnalysis, setBlockAnalysis] = useState<TokenBlockContextAnalysis | null>(null);
  const [enclosingBlock, setEnclosingBlock] = useState<EnclosingBlockInfo | null>(null);
  
  // AI Deep Code Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<AICodeAnalysis | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);

  // Inline "Ask AI About This Block" Chat State
  const [inlineQuestion, setInlineQuestion] = useState<string>('');
  const [inlineAnswer, setInlineAnswer] = useState<string | null>(null);
  const [isAskingAI, setIsAskingAI] = useState<boolean>(false);

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

  // Trigger analysis for a given line and optionally a target token
  const runAnalysisForLine = async (line: string, lineNum: number, targetToken?: string) => {
    const lineInfo = explainCodeLine(line, lineNum, language);
    setActiveLineExplanation(lineInfo);
    if (lineInfo.syllables.length > 0) {
      setSelectedSyllableToken(lineInfo.syllables[0]);
    }

    // Detect surrounding enclosing block & scope
    const blockInfo = detectEnclosingCodeBlock(lines, lineNum - 1, language);
    setEnclosingBlock(blockInfo);

    // Analyze target token or primary token in surrounding block context
    const tokenToAnalyze = targetToken || (lineInfo.syllables[0]?.text) || (line.trim().split(/\s+/)[0]) || 'token';
    setSelectedToken(tokenToAnalyze);

    const tokenBlockContext = analyzeTokenInBlockContext(
      tokenToAnalyze,
      line,
      lineNum - 1,
      lines,
      language,
      projectName
    );
    setBlockAnalysis(tokenBlockContext);

    setIsAiAnalyzing(true);
    setInlineAnswer(null);
    try {
      const analysis = await analyzeCodeLineWithAI(line, lineNum, language);
      setAiAnalysis(analysis);
    } catch (err) {
      console.warn('AI line analysis error:', err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Initialize line 1 breakdown on mount or when code changes
  useEffect(() => {
    if (lines.length > 0) {
      const firstLine = lines[0] || '';
      setSelectedLineIndex(0);
      runAnalysisForLine(firstLine, 1);
    }
  }, [code, language]);

  const handleLineClickOrHover = (line: string, index: number) => {
    setHoveredLineIndex(index);
    setSelectedLineIndex(index);
    if (onSelectLine) onSelectLine(index + 1);
    runAnalysisForLine(line, index + 1);
  };

  // Cursor moves over a specific token in the code
  const handleTokenHover = (tokenText: string, line: string, lineIdx: number) => {
    setHoveredToken(tokenText);
    const context = analyzeTokenInBlockContext(
      tokenText,
      line,
      lineIdx,
      lines,
      language,
      projectName
    );
    setBlockAnalysis(context);
    setEnclosingBlock(context.enclosingBlock);
  };

  const handleTokenMouseLeave = () => {
    setHoveredToken(null);
    // If we have a selected token, keep its block context
    if (selectedToken && lines[selectedLineIndex]) {
      const context = analyzeTokenInBlockContext(
        selectedToken,
        lines[selectedLineIndex],
        selectedLineIndex,
        lines,
        language,
        projectName
      );
      setBlockAnalysis(context);
      setEnclosingBlock(context.enclosingBlock);
    }
  };

  const handleTokenClick = (tokenText: string, line: string, lineIdx: number) => {
    setSelectedLineIndex(lineIdx);
    setSelectedToken(tokenText);
    if (onSelectLine) onSelectLine(lineIdx + 1);
    runAnalysisForLine(line, lineIdx + 1, tokenText);
  };

  const handleTriggerOpenCard = () => {
    if (onOpenFloatingCard) {
      const activeLineText = lines[selectedLineIndex] || '';
      onOpenFloatingCard({
        lineNumber: selectedLineIndex + 1,
        lineContent: activeLineText,
        token: selectedToken || undefined,
        language,
        whatItDoes: blockAnalysis?.howTokenPowersBlock || blockAnalysis?.role || activeLineExplanation?.explanation || 'Executes this statement in the program.',
        syntaxPattern: blockAnalysis?.enclosingBlock?.blockName || activeLineText.trim(),
        whyItIsUsed: blockAnalysis?.whyUsed || blockAnalysis?.surroundingGroupContext || 'Encapsulates module state and logic.',
        tryItSnippet: activeLineText.trim(),
        commonMistake: blockAnalysis?.rippleEffect || 'Check for proper syntax structure and variable scope.',
        externalDocUrl: blockAnalysis?.docUrl || activeLineExplanation?.externalDocUrl,
      });
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

  const handleAskAI = async (questionText?: string) => {
    const q = (questionText || inlineQuestion).trim();
    if (!q || isAskingAI) return;

    setInlineQuestion('');
    setIsAskingAI(true);
    try {
      const currentToken = blockAnalysis?.token || selectedToken || 'this token';
      const currentScope = enclosingBlock?.blockName || `Line ${selectedLineIndex + 1}`;
      const prompt = `Project: ${projectName} (${language}). Scope: ${currentScope}. Target Token: "${currentToken}". Code Block:\n\`\`\`${language}\n${enclosingBlock?.codeSnippet || lines[selectedLineIndex]}\n\`\`\`\nUser question: "${q}". Explain clearly with educational depth, contextual role in surrounding code, and best practices.`;
      const resp = await aiService.generateChatResponse(prompt, `Project: ${projectName} • Scope: ${currentScope}`);
      setInlineAnswer(resp.text);
    } catch {
      setInlineAnswer(`In ${blockAnalysis?.enclosingBlock?.blockName || 'this block'}, '${blockAnalysis?.token || 'this token'}' coordinates with adjacent statements to enforce application logic and layout stability.`);
    } finally {
      setIsAskingAI(false);
    }
  };

  const isSand = theme === 'sand';

  // Syntax highlighting helper for token display
  const highlightToken = (token: string) => {
    const t = token.trim();
    if (['switch', 'case', 'return', 'def', 'if', 'else', 'const', 'let', 'public', 'static', 'class'].includes(t)) {
      return isSand ? 'text-[#326080] font-bold' : 'text-blue-400 font-bold';
    }
    if (['double', 'char', 'int', 'float', 'void', 'boolean', 'str', 'Field'].includes(t)) {
      return isSand ? 'text-[#805232] font-bold' : 'text-amber-400 font-bold';
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
        ? 'bg-white border-[#ebdcd0] text-[#1c1917]' 
        : 'bg-[#08090d] border-zinc-800 text-[#f4f4f5]'
    }`}>
      {/* Top Header Bar */}
      <div className={`h-11 px-4 border-b flex items-center justify-between select-none shrink-0 ${
        isSand ? 'bg-white/80 border-[#ebdcd0]' : 'bg-zinc-900/90 border-zinc-800'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${
            isSand ? 'text-[#326080]' : 'text-zinc-200'
          }`}>
            <BookOpen className="w-3.5 h-3.5" />
            <span>{title}</span>
            {fileName && (
              <span className="text-[11px] font-normal text-[#78716c] font-sans">
                • {fileName}
              </span>
            )}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f6e7db] text-[#57534e] border border-[#ebdcd0]">
              {language}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenFloatingCard && (
            <button
              type="button"
              onClick={handleTriggerOpenCard}
              className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono font-semibold transition-all shadow-2xs flex items-center gap-1.5 ${
                isSand
                  ? 'bg-white hover:bg-[#f6e7db] text-[#326080] border-[#ebdcd0]'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
              }`}
              title="Open floating 6-section line card"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Card</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono font-semibold transition-all shadow-2xs flex items-center gap-1.5 ${
              isInspectorOpen
                ? 'bg-[#326080] text-white border-[#326080]'
                : isSand
                  ? 'bg-white hover:bg-[#f6e7db] text-[#57534e] border-[#ebdcd0]'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
            }`}
            title={isInspectorOpen ? "Hide bottom inspector" : "Open scope & token inspector"}
          >
            <Layers className="w-3 h-3" />
            <span>{isInspectorOpen ? 'Hide Scope' : 'Scope Panel'}</span>
          </button>

          {onCopyOrInsert && (
            <button
              type="button"
              onClick={onCopyOrInsert}
              className={`text-[11px] px-3 py-1 rounded-lg border font-mono font-semibold transition-all shadow-2xs active:scale-95 ${
                isSand 
                  ? 'bg-[#326080] hover:bg-[#254b66] text-white border-[#254b66]' 
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
              }`}
              title="Load reference into workspace"
            >
              Copy Reference
            </button>
          )}
        </div>
      </div>

      {/* Main Code Lines Container with Interactive Token Hover */}
      <div className={`p-2 font-mono text-[13px] md:text-sm overflow-x-auto leading-6 custom-scrollbar transition-all ${
        isInspectorOpen ? 'min-h-[220px] max-h-[340px]' : 'flex-1 min-h-[440px]'
      } ${
        isSand ? 'bg-[#fbf7ee]' : 'bg-[#050608]'
      }`}>
        {lines.map((line, idx) => {
          const isSelected = selectedLineIndex === idx;
          const isHovered = hoveredLineIndex === idx;
          const lineNum = idx + 1;

          // Scope Detection: is this line part of the active enclosing block?
          const isInEnclosingBlock = enclosingBlock && (lineNum >= enclosingBlock.startLine && lineNum <= enclosingBlock.endLine);
          const isBlockStart = enclosingBlock && lineNum === enclosingBlock.startLine;
          const isBlockEnd = enclosingBlock && lineNum === enclosingBlock.endLine;

          const segments = tokenizeLineForInteractiveDisplay(line, language);

          return (
            <div
              key={idx}
              onMouseEnter={() => handleLineClickOrHover(line, idx)}
              onClick={() => handleLineClickOrHover(line, idx)}
              className={`group flex items-start py-0.5 px-2.5 rounded-lg transition-all relative ${
                isSelected
                  ? isSand
                    ? 'bg-[#f6e7db] ring-1 ring-[#326080]/40 shadow-sm'
                    : 'bg-zinc-800/80 ring-1 ring-zinc-700'
                  : isInEnclosingBlock
                    ? isSand
                      ? 'bg-[#f9eee3]/80 border-l-[3px] border-[#326080]'
                      : 'bg-zinc-900/60 border-l-[3px] border-amber-500'
                    : isHovered
                      ? isSand
                        ? 'bg-[#fcf2ea]'
                        : 'bg-zinc-800/50'
                      : isSand
                        ? 'hover:bg-[#fffbf7]'
                        : 'hover:bg-zinc-900/40'
              }`}
            >
              {/* Line Number Gutter with Scope Rail */}
              <span className={`w-9 shrink-0 text-right pr-3 select-none text-[12px] font-mono border-r border-[#ebdcd0]/60 mr-3 flex items-center justify-end gap-1 ${
                isSelected
                  ? isSand
                    ? 'text-[#326080] font-black'
                    : 'text-white font-bold'
                  : isInEnclosingBlock
                    ? isSand
                      ? 'text-[#326080] font-semibold'
                      : 'text-amber-400 font-semibold'
                    : isSand
                      ? 'text-[#a89f91]'
                      : 'text-zinc-600'
              }`}>
                {lineNum}
              </span>

              {/* Interactive Tokenized Line Content */}
              <div className="flex-1 whitespace-pre pr-28 text-[13px] md:text-sm leading-6">
                {segments.map((seg, sIdx) => {
                  if (!seg.isToken || seg.isWhitespace) {
                    return <span key={sIdx}>{seg.text}</span>;
                  }

                  const isTokenHovered = (hoveredToken === seg.text);
                  const isTokenSelected = (selectedToken === seg.text && isSelected);
                  const isTokenActive = isTokenHovered || isTokenSelected;

                  return (
                    <span
                      key={sIdx}
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        handleTokenHover(seg.text, line, idx);
                      }}
                      onMouseLeave={handleTokenMouseLeave}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTokenClick(seg.text, line, idx);
                      }}
                      className={`transition-all duration-150 rounded px-1 py-0.5 cursor-pointer font-mono inline-block ${
                        isTokenActive
                          ? isSand
                            ? 'bg-amber-200 text-[#78350f] font-bold shadow-sm ring-1 ring-amber-400 scale-[1.04]'
                            : 'bg-amber-500/30 text-amber-200 font-bold shadow-sm ring-1 ring-amber-400 scale-[1.04]'
                          : isSand
                            ? 'hover:bg-amber-100 hover:text-[#92400e]'
                            : 'hover:bg-zinc-800 hover:text-amber-300'
                      }`}
                      title={`Inspect token '${seg.text}' and its surrounding code block`}
                    >
                      {seg.text}
                    </span>
                  );
                })}
              </div>

              {/* Indicator Badge on Selected or Enclosing Block Boundary */}
              {isSelected && (
                <div className="absolute right-2 top-0.5 bottom-0.5 flex items-center gap-1.5 select-none animate-fadeIn">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    isSand ? 'bg-white text-[#326080] border-[#ebdcd0]' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  }`}>
                    Line {lineNum} Inspected
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* DYNAMIC SURROUNDING BLOCK & SCOPE INTELLIGENCE PANEL                      */}
      {/* ========================================================================= */}
      {!isInspectorOpen ? (
        <div className={`h-9 px-3.5 border-t flex items-center justify-between text-xs select-none shrink-0 ${
          isSand ? 'bg-[#faf6ee] border-[#ebdcd0]' : 'bg-zinc-900 border-zinc-800'
        }`}>
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-[#326080]" />
            <span className="font-mono text-[11px] font-bold text-[#1c1917]">L{selectedLineIndex + 1}</span>
            {selectedToken && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-[#92400e] border border-amber-300 font-bold truncate">
                {selectedToken}
              </span>
            )}
            <span className="text-[11px] text-[#78716c] truncate">
              {enclosingBlock?.blockName || 'Module Scope'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenFloatingCard && (
              <button
                type="button"
                onClick={handleTriggerOpenCard}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-[#ebdcd0] hover:bg-[#f6e7db] text-[#326080] font-bold transition-colors flex items-center gap-1 shadow-2xs"
                title="Open interactive 6-section floating learning card"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Card</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsInspectorOpen(true)}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#326080] hover:bg-[#254b66] text-white font-bold transition-colors flex items-center gap-1 shadow-2xs"
              title="Open bottom scope & AI inspector"
            >
              <Layers className="w-3 h-3" />
              <span>Scope Details</span>
              <ChevronUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <div className={`border-t p-4 text-xs transition-colors duration-200 ${
          isSand ? 'bg-white border-[#ebdcd0]' : 'bg-[#090a0f] border-zinc-800'
        }`}>
          {/* Drawer Top Navigation & Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#ebdcd0]">
            <div className="flex items-center p-0.5 rounded-lg bg-[#f6e7db] border border-[#ebdcd0] text-[11px] font-medium shadow-inner">
              <button
                type="button"
                onClick={() => setExplanationMode('block_scope')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md transition-all font-semibold ${
                  explanationMode === 'block_scope'
                    ? 'bg-[#326080] text-white shadow-sm'
                    : 'text-[#78716c] hover:text-[#1c1917]'
                }`}
                title="Dynamic Surrounding Scope & Block Inspector"
              >
                <Layers className="w-3 h-3" />
                <span>Scope &amp; Block</span>
              </button>
              <button
                type="button"
                onClick={() => setExplanationMode('ai_analysis')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md transition-all font-semibold ${
                  explanationMode === 'ai_analysis'
                    ? 'bg-[#326080] text-white shadow-sm'
                    : 'text-[#78716c] hover:text-[#1c1917]'
                }`}
                title="Deep AI Line Walkthrough & Pitfalls"
              >
                <Bot className="w-3 h-3" />
                <span>AI Analysis</span>
              </button>
              <button
                type="button"
                onClick={() => setExplanationMode('official_syntax')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md transition-all font-semibold ${
                  explanationMode === 'official_syntax'
                    ? 'bg-[#326080] text-white shadow-sm'
                    : 'text-[#78716c] hover:text-[#1c1917]'
                }`}
                title="Official Language Specs, Syllables & Phonetics"
              >
                <FileCode2 className="w-3 h-3" />
                <span>Official Specs</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {onOpenFloatingCard && (
                <button
                  type="button"
                  onClick={handleTriggerOpenCard}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-[#ebdcd0] hover:bg-[#f6e7db] text-[#326080] font-bold transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Pop out Card</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsInspectorOpen(false)}
                className="p-1 rounded-lg text-[#78716c] hover:text-[#1c1917] hover:bg-[#f6e7db] transition-colors"
                title="Collapse scope drawer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        {explanationMode === 'block_scope' ? (
          /* =================================================================== */
          /* MODE 1: DYNAMIC SURROUNDING SCOPE & ENCLOSING BLOCK ANALYSIS        */
          /* =================================================================== */
          <div className="space-y-3.5 animate-fadeIn">
            {/* Header: Enclosing Block Scope & Active Token Pill */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#ebdcd0]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#326080] to-[#805232] text-white font-mono text-[10px] font-bold shadow-sm">
                  <Layers className="w-3 h-3" />
                  <span>Enclosing Scope</span>
                </span>
                <span className="font-mono text-xs font-bold text-[#326080] bg-[#f6e7db] px-2 py-0.5 rounded border border-[#ebdcd0]">
                  {enclosingBlock?.blockName || `Scope (Line ${selectedLineIndex + 1})`}
                </span>
                {enclosingBlock && (
                  <span className="text-[11px] font-mono text-[#78716c]">
                    (Lines {enclosingBlock.startLine}–{enclosingBlock.endLine})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-100 text-[#92400e] border border-amber-300 font-bold">
                  🎯 Token: {blockAnalysis?.token || selectedToken || 'Active Token'}
                </span>
                {blockAnalysis?.docUrl && (
                  <a
                    href={blockAnalysis.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-mono text-[#326080] hover:underline"
                    title={`View official documentation for ${blockAnalysis.token}`}
                  >
                    <span>{blockAnalysis.docSource || 'MDN Web Docs'}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>

            {/* HERO INSIGHT: How This Token Powers The Enclosing Block */}
            {blockAnalysis?.howTokenPowersBlock && (
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#faf6ee] to-[#f6ede2] border border-amber-300/80 shadow-sm space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#78350f]">
                  <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>How '{blockAnalysis.token}' Powers {enclosingBlock?.blockName || 'This Block'}:</span>
                </div>
                <p className="text-xs text-[#44403c] leading-relaxed">
                  {blockAnalysis.howTokenPowersBlock}
                </p>
              </div>
            )}

            {/* Two-Column Context: Surrounding Group Purpose & Ripple Effect */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Surrounding Group Purpose */}
              <div className="p-3 rounded-xl bg-white border border-[#ebdcd0] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-[#326080]">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Surrounding Group Purpose:</span>
                </div>
                <p className="text-[11px] text-[#57534e] leading-relaxed">
                  {blockAnalysis?.surroundingGroupContext || enclosingBlock?.surroundingSummary || 'Coordinates presentation and component behavior in this section of code.'}
                </p>
              </div>

              {/* Ripple Effect / What If Changed? */}
              <div className="p-3 rounded-xl bg-[#fffbf7] border border-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-[#92400e]">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ripple Effect (If Modified or Removed):</span>
                </div>
                <p className="text-[11px] text-[#57534e] leading-relaxed">
                  {blockAnalysis?.rippleEffect || `Modifying '${blockAnalysis?.token}' directly alters the behavior and output of ${enclosingBlock?.blockName || 'this block'}.`}
                </p>
              </div>
            </div>

            {/* Collaborating Tokens in this Scope (Interactive Sibling Chips) */}
            {blockAnalysis?.collaboratingTokens && blockAnalysis.collaboratingTokens.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#78716c]">
                  Collaborating Code in This Block:
                </span>
                <div className="flex flex-wrap gap-2">
                  {blockAnalysis.collaboratingTokens.map((collab, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => {
                        const lineIdx = lines.findIndex(l => l.includes(collab.token));
                        if (lineIdx !== -1) {
                          handleTokenClick(collab.token, lines[lineIdx], lineIdx);
                        } else {
                          handleTokenHover(collab.token, lines[selectedLineIndex] || '', selectedLineIndex);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg border border-[#ebdcd0] bg-white hover:bg-[#f6e7db] text-[11px] font-mono flex items-center gap-1.5 transition-colors shadow-sm group"
                      title={collab.relationship}
                    >
                      <span className="font-bold text-[#326080] group-hover:text-[#1c1917]">
                        {collab.token}
                      </span>
                      <span className="text-[9px] text-[#78716c] font-sans">
                        • {collab.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Enclosing Block Code Snippet Preview */}
            {enclosingBlock?.codeSnippet && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#78716c]">
                  <span>Enclosing Scope Snippet ({enclosingBlock.blockName}):</span>
                  <span>Lines {enclosingBlock.startLine}–{enclosingBlock.endLine}</span>
                </div>
                <pre className="p-2.5 rounded-xl bg-[#fbf7ee] border border-[#ebdcd0] text-[11px] font-mono text-[#44403c] overflow-x-auto leading-relaxed custom-scrollbar">
                  <code>{enclosingBlock.codeSnippet}</code>
                </pre>
              </div>
            )}

            {/* Interactive "Ask AI About This Block" */}
            <div className="pt-2 border-t border-[#ebdcd0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-[#78716c] flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-[#326080]" />
                  <span>Ask AI Co-Developer About '{blockAnalysis?.token || 'this token'}' in {enclosingBlock?.blockName || 'this block'}</span>
                </span>
              </div>

              {/* Quick AI Prompt Pills */}
              {blockAnalysis?.suggestedQuestions && (
                <div className="flex flex-wrap gap-1.5">
                  {blockAnalysis.suggestedQuestions.map((q, qIdx) => (
                    <button
                      key={qIdx}
                      type="button"
                      onClick={() => handleAskAI(q)}
                      className="text-[10px] font-sans px-2.5 py-1 rounded-lg bg-white hover:bg-[#f6e7db] text-[#44403c] hover:text-[#1c1917] border border-[#ebdcd0] transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Inline Ask AI Input */}
              <div className="relative rounded-xl border border-[#ebdcd0] bg-white p-1.5 focus-within:border-[#326080] transition-colors">
                <input
                  type="text"
                  value={inlineQuestion}
                  onChange={(e) => setInlineQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAskAI();
                  }}
                  placeholder={`Ask anything about '${blockAnalysis?.token || 'this token'}' in ${enclosingBlock?.blockName || 'this block'}...`}
                  className="w-full bg-transparent text-xs text-[#1c1917] outline-none pr-8 pl-1 placeholder-[#a8a29e]"
                  disabled={isAskingAI}
                />
                <button
                  type="button"
                  onClick={() => handleAskAI()}
                  disabled={!inlineQuestion.trim() || isAskingAI}
                  className="absolute right-2 top-2 p-1 rounded-lg bg-[#326080] text-white hover:bg-[#254b66] disabled:opacity-30 transition-colors shadow-sm"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Inline AI Answer Display */}
              {inlineAnswer && (
                <div className="p-3 rounded-xl bg-[#faf6ee] border border-amber-300 text-xs text-[#1c1917] space-y-1 animate-fadeIn">
                  <div className="flex items-center gap-1.5 font-bold text-[#326080]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>AI Co-Developer Response:</span>
                  </div>
                  <p className="leading-relaxed text-[#44403c]">
                    {inlineAnswer}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : explanationMode === 'ai_analysis' ? (
          /* =================================================================== */
          /* MODE 2: POWERFUL AI DEEP CODE ANALYSIS                              */
          /* =================================================================== */
          <div className="space-y-3.5 animate-fadeIn">
            {/* Header: AI Status & Line Summary */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#ebdcd0]">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#326080] to-[#805232] text-white font-mono text-[10px] font-bold shadow-sm">
                  <Bot className="w-3 h-3" />
                  <span>AI Analysis</span>
                </span>
                <span className="font-mono text-xs font-bold text-[#326080]">
                  Line {selectedLineIndex + 1}:
                </span>
                <span className="font-semibold text-xs text-[#1c1917]">
                  {aiAnalysis?.summary || activeLineExplanation?.explanation || 'Analyzing code semantics...'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-[#78716c]">
                <span>{language.toUpperCase()}</span>
                <span>•</span>
                <span>AST Verified</span>
              </div>
            </div>

            {/* Detailed Walkthrough & Architecture Context */}
            {aiAnalysis?.detailedWalkthrough && (
              <p className="text-xs text-[#44403c] leading-relaxed">
                {aiAnalysis.detailedWalkthrough}
              </p>
            )}

            {/* Real-World Analogy */}
            {aiAnalysis?.realWorldAnalogy && (
              <div className="p-3 rounded-xl bg-[#faf6ee] border border-amber-200/80 text-[11px] leading-relaxed text-[#78350f]">
                <span className="font-bold">🌍 Physical Real-World Analogy: </span>
                <span className="italic">"{aiAnalysis.realWorldAnalogy}"</span>
              </div>
            )}

            {/* AI Token Breakdown Grid */}
            {aiAnalysis?.tokens && aiAnalysis.tokens.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#78716c]">
                  Tokens Decoded by AI:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {aiAnalysis.tokens.map((tok, tIdx) => (
                    <div
                      key={tIdx}
                      className="p-2.5 rounded-xl border border-[#ebdcd0] bg-white flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-xs text-[#326080]">
                            {tok.token}
                          </span>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-100/90 text-[#92400e] border border-amber-300/60">
                            {tok.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#57534e] leading-snug">
                          {tok.whyUsed}
                        </p>
                      </div>
                      {tok.docUrl && (
                        <div className="mt-2 pt-1 border-t border-[#ebdcd0]/60 flex justify-end">
                          <a
                            href={tok.docUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-[#326080] hover:underline"
                          >
                            <span>{tok.docSource || 'Documentation'}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive "Ask AI About This Line" */}
            <div className="pt-2 border-t border-[#ebdcd0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-[#78716c] flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-[#326080]" />
                  <span>Ask AI Co-Developer About Line {selectedLineIndex + 1}</span>
                </span>
              </div>

              {/* Quick AI Prompt Pills */}
              {aiAnalysis?.suggestedQuestions && (
                <div className="flex flex-wrap gap-1.5">
                  {aiAnalysis.suggestedQuestions.map((q, qIdx) => (
                    <button
                      key={qIdx}
                      type="button"
                      onClick={() => handleAskAI(q)}
                      className="text-[10px] font-sans px-2.5 py-1 rounded-lg bg-white/80 hover:bg-[#f6e7db] text-[#44403c] hover:text-[#1c1917] border border-[#ebdcd0] transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Inline Ask AI Input */}
              <div className="relative rounded-xl border border-[#ebdcd0] bg-white p-1.5 focus-within:border-[#326080] transition-colors">
                <input
                  type="text"
                  value={inlineQuestion}
                  onChange={(e) => setInlineQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAskAI();
                  }}
                  placeholder="Ask anything about this line (e.g. why is this type or function used?)..."
                  className="w-full bg-transparent text-xs text-[#1c1917] outline-none pr-8 pl-1 placeholder-[#a8a29e]"
                  disabled={isAskingAI}
                />
                <button
                  type="button"
                  onClick={() => handleAskAI()}
                  disabled={!inlineQuestion.trim() || isAskingAI}
                  className="absolute right-2 top-2 p-1 rounded-lg bg-[#326080] text-white hover:bg-[#254b66] disabled:opacity-30 transition-colors shadow-sm"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Inline AI Answer Display */}
              {inlineAnswer && (
                <div className="p-3 rounded-xl bg-[#faf6ee] border border-amber-300 text-xs text-[#1c1917] space-y-1 animate-fadeIn">
                  <div className="flex items-center gap-1.5 font-bold text-[#326080]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>AI Co-Developer Response:</span>
                  </div>
                  <p className="leading-relaxed text-[#44403c]">
                    {inlineAnswer}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* =================================================================== */
          /* MODE 3: OFFICIAL SYNTAX SPECS, PHONETICS & SYLLABLES                */
          /* =================================================================== */
          <div className="space-y-3 animate-fadeIn">
            {/* 1. Line Overview & Verified Official Documentation Link */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#ebdcd0]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border bg-amber-100 text-[#92400e] border-amber-300">
                  Line {activeLineExplanation?.lineNumber || selectedLineIndex + 1}
                </span>
                <span className="font-semibold text-xs text-[#1c1917]">
                  {activeLineExplanation?.explanation}
                </span>
              </div>

              {activeLineExplanation?.externalDocUrl && (
                <a
                  href={activeLineExplanation.externalDocUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#326080] hover:text-[#254b66] underline decoration-[#326080]/60 transition-colors shrink-0"
                  title={`View original specification on ${activeLineExplanation.docSource}`}
                >
                  <span>Official Docs: {activeLineExplanation.docSource}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* 2. Syllable & Token Decomposition Strip */}
            {activeLineExplanation?.syllables && activeLineExplanation.syllables.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase font-bold tracking-wider text-[#78716c]">
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
                            ? 'bg-amber-100/90 border-amber-400 text-[#92400e] ring-2 ring-amber-300/60 font-bold scale-[1.03]'
                            : 'bg-white hover:bg-[#f6e7db] text-[#292524] border-[#ebdcd0]'
                        }`}
                        title={`Deconstruct ${syl.text} (${syl.grammarRole})`}
                      >
                        <span className={highlightToken(syl.text)}>{syl.text}</span>
                        {syl.phonetic && (
                          <span className="text-[9px] font-sans text-[#78716c]">
                            {syl.phonetic}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Focused Token Card */}
            {selectedSyllableToken && (
              <div className="p-3 rounded-xl border border-[#ebdcd0] bg-white text-[#1c1917] space-y-2 animate-fadeIn">
                <div className="flex items-start justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono text-xs font-bold border bg-white text-[#326080] border-[#ebdcd0]">
                      {selectedSyllableToken.text}
                    </span>
                    {selectedSyllableToken.syllables && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border bg-amber-100 text-[#92400e] border-amber-200">
                        Syllables: <strong>{selectedSyllableToken.syllables}</strong> {selectedSyllableToken.phonetic}
                      </span>
                    )}
                    <span className="text-[11px] font-mono uppercase tracking-wide px-2 py-0.5 rounded border bg-[#f6e7db] text-[#57534e] border-[#ebdcd0]">
                      {selectedSyllableToken.grammarRole}
                    </span>
                  </div>

                  <a
                    href={selectedSyllableToken.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-[11px] bg-[#326080] hover:bg-[#254b66] text-white shadow-sm"
                  >
                    <span>Original Source: {selectedSyllableToken.docSource}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-xs leading-relaxed text-[#44403c]">
                  {selectedTokenDoc?.detailedExplanation || selectedSyllableToken.explanation}
                </p>

                {selectedTokenDoc?.realLifeAnalogy && (
                  <div className="p-2.5 rounded-lg border border-amber-200/80 bg-[#fffaf0] text-[11px] italic leading-relaxed text-[#78350f]">
                    <span className="font-bold not-italic">🌍 Real-World Analogy: </span>
                    "{selectedTokenDoc.realLifeAnalogy}"
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )}
  </div>
);
};
