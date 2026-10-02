'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ProjectFile } from '@/types/project';
import { generateSandboxedHtml } from './SandboxRuntime';
import { Monitor, Tablet, Smartphone, RotateCcw, Crosshair, ExternalLink, Terminal } from 'lucide-react';

interface LivePreviewProps {
  files: ProjectFile[];
  onElementInspected: (file: string, line: number, concept: string) => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  files,
  onElementInspected,
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [inspectMode, setInspectMode] = useState<boolean>(false);
  const [key, setKey] = useState<number>(0);
  const [inspectedInfo, setInspectedInfo] = useState<{ file: string; line: number; concept: string } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen to postMessage from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'ELEMENT_SELECTED') {
        const { file, line, concept } = event.data;
        setInspectedInfo({ file, line, concept });
        onElementInspected(file, line, concept);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onElementInspected]);

  const htmlContent = generateSandboxedHtml(files, inspectMode);

  const getContainerWidth = () => {
    switch (device) {
      case 'mobile':
        return 'w-[375px]';
      case 'tablet':
        return 'w-[768px]';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 select-none">
      {/* Top Preview Toolbar */}
      <div className="h-11 px-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-300">Live Preview</span>
        </div>

        {/* Viewport controls */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 space-x-0.5">
          <button
            onClick={() => setDevice('desktop')}
            className={`p-1.5 rounded text-xs transition-colors ${
              device === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Desktop view"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`p-1.5 rounded text-xs transition-colors ${
              device === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tablet view"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-1.5 rounded text-xs transition-colors ${
              device === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile view"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setInspectMode(!inspectMode)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              inspectMode
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-600'
            }`}
            title="Click an element on the preview to jump to its source code and concept"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{inspectMode ? 'Inspecting...' : 'Inspect UI'}</span>
          </button>

          <button
            onClick={() => setKey(k => k + 1)}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 rounded transition-colors"
            title="Reload preview"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Code-to-Preview Active Notification Banner */}
      {inspectMode && (
        <div className="bg-indigo-950/80 border-b border-indigo-800/60 px-4 py-1.5 flex items-center justify-between text-xs text-indigo-300">
          <div className="flex items-center space-x-2">
            <span className="text-indigo-400 font-semibold">Inspect Mode Active:</span>
            <span>Hover and click any UI component to reveal its source file and concept.</span>
          </div>
          {inspectedInfo && (
            <div className="bg-indigo-900 text-indigo-100 px-2 py-0.5 rounded font-mono text-[11px] border border-indigo-700">
              {inspectedInfo.file}:{inspectedInfo.line}
            </div>
          )}
        </div>
      )}

      {/* Frame Container */}
      <div className="flex-1 bg-slate-950 flex items-center justify-center p-3 overflow-hidden">
        <div
          className={`${getContainerWidth()} h-full transition-all duration-300 ease-in-out bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-800`}
        >
          <iframe
            key={key}
            ref={iframeRef}
            srcDoc={htmlContent}
            title="Application Live Preview"
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-modals"
          />
        </div>
      </div>
    </div>
  );
};
