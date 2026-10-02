'use client';

import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { ProjectFile } from '@/types/project';
import { Sparkles, FileCode, HelpCircle, Check, Info } from 'lucide-react';

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

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define custom theme colors
    monaco.editor.defineTheme('learncraft-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '818cf8', fontStyle: 'bold' },
        { token: 'identifier', foreground: 'e2e8f0' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'f59e0b' },
      ],
      colors: {
        'editor.background': '#020617', // slate-950
        'editor.foreground': '#f8fafc',
        'editor.lineHighlightBackground': '#0f172a',
        'editorCursor.foreground': '#818cf8',
        'editorWhitespace.foreground': '#1e293b',
        'editorIndentGuide.background': '#1e293b',
        'editorIndentGuide.activeBackground': '#334155',
      },
    });

    monaco.editor.setTheme('learncraft-dark');
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
      <div className="flex-1 h-full bg-slate-950 flex flex-col items-center justify-center text-slate-500 text-sm">
        <FileCode className="w-12 h-12 text-slate-700 mb-3" />
        <p>Select a file from the explorer to inspect or edit code</p>
      </div>
    );
  }

  const mapLanguage = (lang: string) => {
    if (lang === 'tsx' || lang === 'jsx') return 'typescript';
    return lang;
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-950 overflow-hidden">
      {/* File Tab & Quick Actions Bar */}
      <div className="h-10 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-200">{activeFile.name}</span>
          <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono">
            {activeFile.language}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Why does this exist contextual button */}
          <button
            onClick={handleWhyClick}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 rounded text-xs transition-colors"
            title="Ask AI: Why does this code exist in our project?"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Why does this exist?</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 relative">
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
    </div>
  );
};
