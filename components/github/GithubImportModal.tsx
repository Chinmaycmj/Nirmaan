'use client';

import React, { useState } from 'react';
import { 
  GitBranch, 
  Download, 
  FolderGit2, 
  Sparkles, 
  X, 
  Loader2,
  AlertCircle,
  FileCode2,
  CheckCircle2
} from 'lucide-react';
import { importGithubRepository } from '@/lib/github/githubImporter';
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
  const [branch, setBranch] = useState('main');
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImport = async (targetUrl?: string) => {
    const finalUrl = (targetUrl || repoUrl).trim();
    if (!finalUrl) return;

    setIsImporting(true);
    setErrorMessage(null);

    try {
      const data = await importGithubRepository(finalUrl, branch.trim() || 'main');
      onImportComplete(data);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to import repository. Please check the URL or branch.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1c1917]/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#FFF1E7] border border-[#ebdcd0] rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative overflow-hidden text-[#1c1917] flex flex-col">
        {/* Subtle Decorative Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-[#B5D2E6]/30 via-amber-100/20 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-[#805232]/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#ebdcd0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#805232]/10 border border-[#805232]/30 text-[#805232] flex items-center justify-center shadow-sm">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black text-[#1c1917] tracking-tight">
                Import Any GitHub Repository
              </h3>
              <p className="text-xs text-[#78716c] mt-0.5">
                Clones repository structure, parses real source files, and prepares step-by-step guidance.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#a8a29e] hover:text-[#1c1917] hover:bg-[#f6e7db] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-6 space-y-5">
          {/* Repository Link Input Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#44403c] uppercase tracking-wider font-mono">
              Public GitHub Repository Link or "owner/repo"
            </label>
            <div className="relative rounded-2xl border border-[#ebdcd0] bg-white focus-within:border-[#326080] focus-within:ring-2 focus-within:ring-[#B5D2E6]/50 transition-all p-3">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleImport();
                }}
                placeholder="e.g. Chinmaycmj/design_disaster_Bhukkad or full URL..."
                className="w-full bg-transparent text-xs md:text-sm text-[#1c1917] outline-none placeholder-[#a8a29e] font-mono"
                disabled={isImporting}
              />
            </div>
          </div>

          {/* Branch input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#44403c] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-[#326080]" />
              <span>Target Branch</span>
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              className="w-full rounded-xl border border-[#ebdcd0] bg-white p-2.5 text-xs text-[#1c1917] outline-none font-mono focus:border-[#326080]"
              disabled={isImporting}
            />
          </div>

          {/* Clean Quick Link Pills */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-[#78716c] font-medium">Quick examples:</span>
            <div className="flex flex-wrap gap-2">
              {[
                'Chinmaycmj/design_disaster_Bhukkad',
                'facebook/react',
                'torvalds/linux'
              ].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setRepoUrl(sample);
                  }}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/80 hover:bg-[#f6e7db] text-[#57534e] hover:text-[#1c1917] border border-[#ebdcd0] transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Error banner if any */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Import action button */}
          <div className="pt-2">
            <button
              onClick={() => handleImport()}
              disabled={!repoUrl.trim() || isImporting}
              className="w-full py-3.5 bg-[#326080] hover:bg-[#254b66] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Cloning &amp; Ingesting Real Repository Files...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Import &amp; Launch Workspace</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#ebdcd0] flex items-center justify-between text-xs text-[#78716c]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#326080]" />
            <span>Downloads genuine code files and analyzes AST syntax line-by-line</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg hover:bg-[#f6e7db] text-[#78716c] hover:text-[#1c1917] font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
