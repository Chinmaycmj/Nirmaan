import { Project, ProjectStats, AuthorType, CodeContribution } from '@/types/project';

/**
 * Calculates line-level provenance and ownership metrics across the project.
 * Implements Section 4.2 of the Nirmaan Master Blueprint:
 * - Authored % (code directly typed by the learner)
 * - Understood % (AI code explained back or validated via checkpoints)
 * - Verified Ownership % (Authored % + Understood %)
 * - Imported Baseline (isolated from skewing learner metrics)
 */
export function calculateProjectOwnership(project: Project): ProjectStats {
  let totalLines = 0;
  let userLines = 0;
  let understoodLines = 0;
  let aiLines = 0;
  let importedLines = 0;

  for (const file of project.files) {
    if (file.isFolder || !file.content) continue;
    const lines = file.content.split('\n');
    const lineCount = lines.length;
    totalLines += lineCount;

    // Check if entire file is imported baseline (default for GitHub imports)
    const isImportedDefault = file.contributions.some(c => c.authorType === 'IMPORTED_BASELINE') || 
      (file.contributions.length === 0 && project.name.includes('/'));

    const lineStatus: AuthorType[] = new Array(lineCount).fill(
      isImportedDefault ? 'IMPORTED_BASELINE' : 'AI_GENERATED'
    );

    // Apply explicit contribution ranges
    for (const contrib of file.contributions) {
      const start = Math.max(0, contrib.startLine - 1);
      const end = Math.min(lineCount - 1, contrib.endLine - 1);
      for (let i = start; i <= end; i++) {
        lineStatus[i] = contrib.authorType;
      }
    }

    for (const status of lineStatus) {
      if (status === 'USER_WRITTEN') {
        userLines += 1.0;
      } else if (status === 'USER_MODIFIED') {
        userLines += 0.8;
      } else if (status === 'USER_UNDERSTOOD') {
        understoodLines += 1.0;
      } else if (status === 'AI_ASSISTED') {
        userLines += 0.5;
        aiLines += 0.5;
      } else if (status === 'IMPORTED_BASELINE') {
        importedLines += 1.0;
      } else {
        aiLines += 1.0;
      }
    }
  }

  // Active lines subject to learning = totalLines - importedBaseline (or totalLines if no imports)
  const activeLines = Math.max(1, totalLines - importedLines);
  const effectiveTotal = importedLines > 0 ? activeLines : Math.max(1, totalLines);

  const authoredPercentage = Math.min(100, Math.round((userLines / effectiveTotal) * 100));
  const understoodPercentage = Math.min(100, Math.round((understoodLines / effectiveTotal) * 100));
  const verifiedOwnershipPercentage = Math.min(100, Math.round(((userLines + understoodLines) / effectiveTotal) * 100));

  // Legacy userPercentage for compatibility
  const userPercentage = verifiedOwnershipPercentage;

  return {
    totalLines,
    userWrittenLines: Math.round(userLines),
    understoodLines: Math.round(understoodLines),
    aiGeneratedLines: Math.round(aiLines),
    importedLines: Math.round(importedLines),
    authoredPercentage,
    understoodPercentage,
    verifiedOwnershipPercentage,
    userPercentage,
    checkpointsCompleted: 0,
    totalCheckpoints: 0,
    hintsUsedCount: 0,
  };
}

export function getAuthorBadgeInfo(authorType: AuthorType): { 
  label: string; 
  bg: string; 
  text: string; 
  border: string;
  provenanceStyle: string; // for gutter styling
} {
  switch (authorType) {
    case 'USER_WRITTEN':
      return { 
        label: 'Authored by You', 
        bg: 'bg-emerald-500/15', 
        text: 'text-emerald-700', 
        border: 'border-emerald-500/30',
        provenanceStyle: 'border-l-2 border-emerald-500 bg-emerald-50/20'
      };
    case 'USER_UNDERSTOOD':
      return { 
        label: 'Understood & Verified', 
        bg: 'bg-sky-500/15', 
        text: 'text-sky-700', 
        border: 'border-sky-500/30',
        provenanceStyle: 'border-l-2 border-sky-500 bg-sky-50/20'
      };
    case 'USER_MODIFIED':
      return { 
        label: 'Modified by You', 
        bg: 'bg-teal-500/15', 
        text: 'text-teal-700', 
        border: 'border-teal-500/30',
        provenanceStyle: 'border-l-2 border-teal-500 bg-teal-50/20'
      };
    case 'AI_ASSISTED':
      return { 
        label: 'Co-Written (AI + You)', 
        bg: 'bg-indigo-500/15', 
        text: 'text-indigo-700', 
        border: 'border-indigo-500/30',
        provenanceStyle: 'border-l-2 border-dashed border-indigo-500'
      };
    case 'IMPORTED_BASELINE':
      return { 
        label: 'Repository Baseline', 
        bg: 'bg-stone-500/10', 
        text: 'text-stone-600', 
        border: 'border-stone-400/30',
        provenanceStyle: 'border-l-2 border-stone-300'
      };
    case 'AI_GENERATED':
    default:
      return { 
        label: 'AI Scaffold', 
        bg: 'bg-amber-500/10', 
        text: 'text-amber-700', 
        border: 'border-amber-400/30',
        provenanceStyle: 'border-l-2 border-dotted border-amber-400'
      };
  }
}
