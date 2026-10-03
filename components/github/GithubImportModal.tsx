'use client';

import React, { useState } from 'react';
import { 
  GitBranch, 
  Download, 
  ExternalLink, 
  FileCode, 
  FolderGit2, 
  Sparkles, 
  X, 
  Check, 
  Loader2,
  Code2
} from 'lucide-react';
import { 
  CURATED_GITHUB_REPOSITORIES, 
  importGithubRepository,
  CuratedGithubTemplate 
} from '@/lib/github/githubImporter';
import { Project } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone } from '@/types/learning';

interface GithubImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (data: {
    project: Project;
    checkpoints: LearningCheckpoint[];
    milestones: ProjectMilestone[];
  }) => void;
}

export const GithubImportModal: React.FC<GithubImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CuratedGithubTemplate | null>(null);

  if (!isOpen) return null;

  const handleCustomImport = async () => {
    if (!repoUrl.trim()) return;
    setIsImporting(true);
    try {
      const data = await importGithubRepository(repoUrl.trim());
      onImportComplete(data);
      onClose();
    } finally {
      setIsImporting(false);
    }
  };

  const handleCuratedImport = async (template: CuratedGithubTemplate) => {
    setIsImporting(true);
    setSelectedTemplate(template);
    try {
      const data = await importGithubRepository(template.id);
      onImportComplete(data);
      onClose();
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#fffdfa] border border-[#e4dcd0] rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative overflow-hidden text-[#1c1917] max-h-[90vh] flex flex-col">
        {/* Subtle Beach Sand Decorative Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-amber-200/40 via-amber-100/20 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-orange-100/50 to-transparent blur-3xl pointer-events-none rounded-full" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#ebd7bf]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100/80 border border-amber-300/60 text-[#92400e] flex items-center justify-center shadow-sm">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black text-[#1c1917] tracking-tight">
                Import GitHub Repository
              </h3>
              <p className="text-xs text-[#78716c] mt-0.5">
                Scale to 10–100+ files and 1,000+ lines. Build every line step by step.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#a8a29e] hover:text-[#1c1917] hover:bg-[#f5efe6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 custom-scrollbar pr-1">
          {/* Custom URL Input Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#44403c] uppercase tracking-wider font-mono">
              Paste Any Public GitHub Repository Link
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative rounded-xl border border-[#ded5c5] bg-[#faf7f2] focus-within:border-[#0e4d82] focus-within:ring-2 focus-within:ring-amber-200 transition-all p-2.5">
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCustomImport();
                  }}
                  placeholder="e.g. https://github.com/Chinmaycmj/Nirmaan or owner/repo..."
                  className="w-full bg-transparent text-xs md:text-sm text-[#1c1917] outline-none placeholder-[#a8a29e]"
                />
              </div>
              <button
                onClick={handleCustomImport}
                disabled={!repoUrl.trim() || isImporting}
                className="px-5 py-2.5 bg-[#0e4d82] hover:bg-[#09355b] text-white font-bold text-xs md:text-sm rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-40 flex items-center gap-2 shrink-0"
              >
                {isImporting && !selectedTemplate ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-white" />
                    <span>Import Repo</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Curated Pre-Configured Multi-File Repositories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#78716c] font-bold uppercase tracking-wider font-mono">
              <span>Or Choose a High-Scale Multi-File Architecture</span>
              <span className="text-[10px] text-[#a8a29e] font-normal">1-Click Instant Import</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CURATED_GITHUB_REPOSITORIES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleCuratedImport(tpl)}
                  className="p-4 rounded-2xl border border-[#ebd7bf] bg-[#fffbf5] hover:bg-[#fdf6ec] hover:border-amber-400/80 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-[#1c1917] group-hover:text-[#0e4d82] transition-colors">
                        {tpl.name}
                      </span>
                      <span className="text-[10px] bg-amber-100/90 text-[#92400e] border border-amber-300/60 px-2 py-0.5 rounded-full font-mono font-bold">
                        {tpl.language}
                      </span>
                    </div>
                    <p className="text-xs text-[#78716c] leading-relaxed line-clamp-2">
                      {tpl.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#f0e4d4] flex items-center justify-between text-[11px] text-[#57534e]">
                    <div className="flex items-center gap-2 font-mono">
                      <span>📁 {tpl.fileCount} files</span>
                      <span>•</span>
                      <span>📝 {tpl.lineCount} lines</span>
                    </div>
                    <span className="text-xs font-bold text-[#0e4d82] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Start Building →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-[#ebd7bf] flex items-center justify-between text-xs text-[#78716c]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Parses code AST, line-by-line syntax, and token documentation</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl hover:bg-[#f5efe6] text-[#44403c] font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
