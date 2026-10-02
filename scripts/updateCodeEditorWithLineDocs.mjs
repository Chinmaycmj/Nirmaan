import fs from 'fs';
import path from 'path';

const editorPath = path.resolve('components/ide/CodeEditor.tsx');
let content = fs.readFileSync(editorPath, 'utf8');

const updatedCodeEditor = `'use client';

import React, { useRef, useState, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { ProjectFile } from '@/types/project';
import { 
  Sparkles, 
  FileCode, 
  HelpCircle, 
  Check, 
  Info, 
  ExternalLink,
  BookOpen,
  Code2,
  X
} from 'lucide-react';
import { 
  explainCodeLine, 
  findTokenDocumentation, 
  TokenDoc 
} from '@/lib/learning/tokenDocumentation';

interface CodeEditorProps {
  activeFile: ProjectFile | null;
  onCodeChange: (newContent: string) => void;
  onExplainSelection?: (code: string) => void;
  onWhyDoesThisExist?: (code: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  activeFile,
  onCodeChange,
  onExplainSelection,
  onWhyDoesThisExist,
}) => {
  const editorRef = useRef<any>(null);
  const [activeLineNumber, setActiveLineNumber] = useState<number>(1);
  const [activeLineContent, setActiveLineContent] = useState<string>('');
  const [selectedTokenDoc, setSelectedTokenDoc] = useState<TokenDoc | null>(null);
  const [showInspector, setShowInspector] = useState<boolean>(true);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define custom theme colors
    monaco.editor.defineTheme('learncraft-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '71717a', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ffffff', fontStyle: 'bold' },
        { token: 'identifier', foreground: 'e4e4e7' },
        { token: 'string', foreground: 'a1a1aa' },
        { token: 'number', foreground: 'e4e4e7' },
      ],
      colors: {
        'editor.background': '#000000', // Pure obsidian
        'editor.foreground': '#f4f4f5',
        'editor.lineHighlightBackground': '#18181b',
        'editorCursor.foreground': '#ffffff',
        'editorWhitespace.foreground': '#27272a',
        'editorIndentGuide.background': '#27272a',
        'editorIndentGuide.activeBackground': '#3f3f46',
      },
    });

    monaco.editor.setTheme('learncraft-dark');

    // Initial line content
    const initialLine = editor.getModel()?.getLineContent(1) || '';
    setActiveLineContent(initialLine);

    // Track cursor position line change
    editor.onDidChangeCursorPosition((e) => {
      const lineNum = e.position.lineNumber;
      setActiveLineNumber(lineNum);
      const lineText = editor.getModel()?.getLineContent(lineNum) || '';
      setActiveLineContent(lineText);
      setSelectedTokenDoc(null);
    });
  };

  const handleWhyClick = () => {
    if (!editorRef.current || !onWhyDoesThisExist) return;
    const selection = editorRef.current.getSelection();
    const selectedText = editorRef.current.getModel()?.getValueInRange(selection);
    if (selectedText && selectedText.trim()) {
      onWhyDoesThisExist(selectedText);
    } else if (activeFile) {
      onWhyDoesThisExist(activeFile.content);
    }
  };

  if (!activeFile) {
    return (
      <div className="flex-1 h-full bg-black flex flex-col items-center justify-center text-zinc-500 text-sm">
        <FileCode className="w-12 h-12 text-zinc-700 mb-3" />
        <p>Select a file from the explorer to inspect or edit code</p>
      </div>
    );
  }

  const mapLanguage = (lang: string) => {
    if (lang === 'tsx' || lang === 'jsx') return 'typescript';
    if (lang === 'js') return 'javascript';
    if (lang === 'py') return 'python';
    if (lang === 'cpp') return 'cpp';
    if (lang === 'java') return 'java';
    return lang;
  };

  const lineDoc = explainCodeLine(activeLineContent, activeLineNumber, activeFile.language);

  return (
    <div className="flex-1 h-full flex flex-col bg-black overflow-hidden font-sans">
      {/* File Tab & Quick Actions Bar */}
      <div className="h-10 bg-black border-b border-zinc-800 px-4 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-white">{activeFile.name}</span>
          <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 font-mono">
            {activeFile.language}
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">
            Line {activeLineNumber}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Toggle token & line inspector */}
          <button
            onClick={() => setShowInspector(!showInspector)}
            className={\`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs transition-colors border font-mono \${
              showInspector 
                ? 'bg-zinc-800 text-white border-zinc-600' 
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
            }\`}
            title="Toggle Token & Line Documentation Inspector"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Docs Inspector</span>
          </button>

          {/* Why does this exist contextual button */}
          <button
            onClick={handleWhyClick}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 rounded text-xs transition-colors font-medium"
            title="Ask AI: Why does this code exist in our project?"
          >
            <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
            <span>Why does this exist?</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 relative min-h-0">
        <Editor
          height="100%"
          language={mapLanguage(activeFile.language)}
          value={activeFile.content}
          theme="learncraft-dark"
          onChange={(val) => onCodeChange(val || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            fontFamily: 'Consolas, "Fira Code", monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            lineNumbers: 'on',
            padding: { top: 12, bottom: 12 },
            cursorBlinking: 'smooth',
            smoothScrolling: true,
          }}
        />
      </div>

      {/* Live Interactive Line & Token Documentation HUD Bar */}
      {showInspector && (
        <div className="border-t border-zinc-800 bg-[#08090d] p-3 text-xs shrink-0 select-text">
          {selectedTokenDoc ? (
            /* Focused Token Breakdown */
            <div className="space-y-1.5 animate-fadeIn bg-black p-2.5 rounded-lg border border-zinc-700">
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
                  className="text-zinc-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-zinc-300 text-xs leading-relaxed">
                {selectedTokenDoc.detailedExplanation}
              </p>

              {selectedTokenDoc.realLifeAnalogy && (
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 italic">
                  <span className="font-semibold not-italic text-zinc-200">🌍 Analogy: </span>
                  "{selectedTokenDoc.realLifeAnalogy}"
                </div>
              )}

              <div className="pt-1 flex items-center justify-between">
                <span className="text-zinc-500 font-mono text-[10px]">
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
          ) : (
            /* Line Summary & Tokens */
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
                    Line {activeLineNumber}
                  </span>
                  <span className="text-zinc-300 font-medium text-xs truncate">
                    {lineDoc.explanation}
                  </span>
                </div>

                {lineDoc.externalDocUrl && (
                  <a
                    href={lineDoc.externalDocUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-200 hover:text-white underline decoration-zinc-600 hover:decoration-white font-mono transition-colors shrink-0"
                    title={\`View original specification on \${lineDoc.docSource}\`}
                  >
                    <span>Official Docs: {lineDoc.docSource}</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                )}
              </div>

              {/* Detected tokens on this line */}
              {lineDoc.allTokens.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">Tokens:</span>
                  {lineDoc.allTokens.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedTokenDoc(t)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-[10px] font-mono transition-colors"
                      title={\`Click to inspect \${t.name}\`}
                    >
                      <span>{t.token}</span>
                      <HelpCircle className="w-2.5 h-2.5 text-zinc-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
`;

fs.writeFileSync(editorPath, updatedCodeEditor, 'utf8');
console.log('Successfully updated CodeEditor.tsx with Line & Token Docs HUD');
