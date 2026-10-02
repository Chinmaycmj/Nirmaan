'use client';

import React, { useState } from 'react';
import { ProjectFile } from '@/types/project';
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileText, 
  FilePlus, 
  ChevronRight, 
  ChevronDown, 
  Code2, 
  Sparkles, 
  UserCheck 
} from 'lucide-react';

interface FileExplorerProps {
  files: ProjectFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onCreateFile?: (name: string, isFolder: boolean) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
}) => {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    src: true,
    'src/components': true,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const toggleFolder = (folderPath: string) => {
    setOpenFolders(prev => ({ ...prev, [folderPath]: !prev[folderPath] }));
  };

  const getFileBadge = (file: ProjectFile) => {
    const hasUser = file.contributions.some(c => c.authorType === 'USER_WRITTEN' || c.authorType === 'USER_MODIFIED');
    const hasAi = file.contributions.some(c => c.authorType === 'AI_GENERATED');

    if (hasUser && hasAi) {
      return (
        <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center space-x-1" title="Co-authored: Contains code written by both you and AI">
          <UserCheck className="w-2.5 h-2.5 inline" />
          <span>Co-authored</span>
        </span>
      );
    } else if (hasUser) {
      return (
        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1" title="Written by You">
          <UserCheck className="w-2.5 h-2.5 inline" />
          <span>You</span>
        </span>
      );
    } else {
      return (
        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 flex items-center space-x-1" title="AI Generated Skeleton">
          <Sparkles className="w-2.5 h-2.5 inline" />
          <span>AI</span>
        </span>
      );
    }
  };

  // Group files into pseudo directory structure
  const rootFiles = files.filter(f => !f.path.includes('/') || f.path.split('/').length === 1);
  const srcFiles = files.filter(f => f.path.startsWith('src/') && f.path.split('/').length === 2);
  const componentFiles = files.filter(f => f.path.startsWith('src/components/'));

  return (
    <div className="w-64 h-full bg-slate-950 border-r border-slate-800 flex flex-col select-none text-xs">
      {/* Header */}
      <div className="h-10 px-3 border-b border-slate-800 flex items-center justify-between text-slate-400 font-semibold tracking-wider uppercase text-[11px]">
        <span>Project Files</span>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
          title="New file"
        >
          <FilePlus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* New File Inline Prompt */}
      {isCreating && (
        <div className="p-2 border-b border-slate-800 bg-slate-900/80">
          <input
            type="text"
            placeholder="e.g. src/utils.ts"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newFileName.trim() && onCreateFile) {
                onCreateFile(newFileName.trim(), false);
                setNewFileName('');
                setIsCreating(false);
              } else if (e.key === 'Escape') {
                setIsCreating(false);
              }
            }}
            autoFocus
            className="w-full bg-slate-950 text-slate-200 px-2 py-1 text-xs border border-indigo-500 rounded focus:outline-none"
          />
        </div>
      )}

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {/* src folder */}
        <div>
          <div
            onClick={() => toggleFolder('src')}
            className="flex items-center px-3 py-1.5 hover:bg-slate-900 cursor-pointer text-slate-300 font-medium space-x-1.5"
          >
            {openFolders['src'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
            {openFolders['src'] ? <FolderOpen className="w-4 h-4 text-indigo-400" /> : <Folder className="w-4 h-4 text-indigo-400" />}
            <span>src</span>
          </div>

          {openFolders['src'] && (
            <div className="pl-4 space-y-0.5">
              {/* components folder */}
              {componentFiles.length > 0 && (
                <div>
                  <div
                    onClick={() => toggleFolder('src/components')}
                    className="flex items-center px-3 py-1.5 hover:bg-slate-900 cursor-pointer text-slate-300 space-x-1.5"
                  >
                    {openFolders['src/components'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                    {openFolders['src/components'] ? <FolderOpen className="w-4 h-4 text-amber-400" /> : <Folder className="w-4 h-4 text-amber-400" />}
                    <span>components</span>
                  </div>

                  {openFolders['src/components'] && (
                    <div className="pl-4 space-y-0.5">
                      {componentFiles.map(file => (
                        <div
                          key={file.id}
                          onClick={() => onSelectFile(file.id)}
                          className={`flex items-center justify-between px-3 py-1.5 cursor-pointer rounded-sm mx-1 transition-colors ${
                            activeFileId === file.id
                              ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <Code2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate">{file.name}</span>
                          </div>
                          {getFileBadge(file)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* src root files */}
              {srcFiles.map(file => (
                <div
                  key={file.id}
                  onClick={() => onSelectFile(file.id)}
                  className={`flex items-center justify-between px-3 py-1.5 cursor-pointer rounded-sm mx-1 transition-colors ${
                    activeFileId === file.id
                      ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  {getFileBadge(file)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Root files */}
        {rootFiles.map(file => (
          <div
            key={file.id}
            onClick={() => onSelectFile(file.id)}
            className={`flex items-center justify-between px-3 py-1.5 cursor-pointer rounded-sm mx-1 transition-colors ${
              activeFileId === file.id
                ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2 truncate">
              <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{file.name}</span>
            </div>
            {getFileBadge(file)}
          </div>
        ))}
      </div>

      {/* Footer Legend */}
      <div className="p-3 border-t border-slate-900 bg-slate-950/60 text-[10px] text-slate-500 space-y-1">
        <div className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Code Ownership</div>
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>User Written</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-600"></span>
            <span>AI Boilerplate</span>
          </span>
        </div>
      </div>
    </div>
  );
};
