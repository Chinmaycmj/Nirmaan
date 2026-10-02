import { Project, ProjectStats, AuthorType, CodeContribution } from '@/types/project';

export function calculateProjectOwnership(project: Project): ProjectStats {
  let totalLines = 0;
  let userLines = 0;
  let aiLines = 0;

  for (const file of project.files) {
    if (file.isFolder) continue;
    const lines = file.content.split('\n');
    const lineCount = lines.length;
    totalLines += lineCount;

    // Calculate lines per contribution
    const lineStatus: AuthorType[] = new Array(lineCount).fill('AI_GENERATED');

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
      } else if (status === 'AI_ASSISTED') {
        userLines += 0.5;
        aiLines += 0.5;
      } else {
        aiLines += 1.0;
      }
    }
  }

  const userPercentage = totalLines > 0 ? Math.round((userLines / totalLines) * 100) : 0;

  return {
    totalLines,
    userWrittenLines: Math.round(userLines),
    aiGeneratedLines: Math.round(aiLines),
    userPercentage,
    checkpointsCompleted: 0,
    totalCheckpoints: 0,
    hintsUsedCount: 0,
  };
}

export function getAuthorBadgeInfo(authorType: AuthorType): { label: string; bg: string; text: string; border: string } {
  switch (authorType) {
    case 'USER_WRITTEN':
      return { label: 'Written by You', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case 'USER_MODIFIED':
      return { label: 'Modified by You', bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' };
    case 'AI_ASSISTED':
      return { label: 'Co-Written (AI + You)', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' };
    case 'AI_GENERATED':
    default:
      return { label: 'AI Generated Boilerplate', bg: 'bg-zinc-800', text: 'text-zinc-400', border: 'border-zinc-700' };
  }
}
