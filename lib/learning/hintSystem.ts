import { Hint } from '@/types/learning';

export interface HintState {
  currentRevealedLevel: number; // 0 (none) to 4 (partial solution) or 5 (solution revealed)
  hintsUsed: number;
  solutionUnlocked: boolean;
}

export function createInitialHintState(): HintState {
  return {
    currentRevealedLevel: 0,
    hintsUsed: 0,
    solutionUnlocked: false,
  };
}

export function unlockNextHint(
  currentState: HintState,
  availableHints: Hint[]
): {
  nextState: HintState;
  revealedHint: Hint | null;
  message: string;
} {
  const nextLevel = (currentState.currentRevealedLevel + 1) as 1 | 2 | 3 | 4;

  if (nextLevel > availableHints.length) {
    return {
      nextState: {
        ...currentState,
        solutionUnlocked: true,
      },
      revealedHint: null,
      message: 'All hints have been shown. You can now unlock the reference solution if needed.',
    };
  }

  const hint = availableHints.find(h => h.level === nextLevel) || null;

  return {
    nextState: {
      currentRevealedLevel: nextLevel,
      hintsUsed: currentState.hintsUsed + 1,
      solutionUnlocked: nextLevel >= 4,
    },
    revealedHint: hint,
    message: hint ? `Revealed Hint ${hint.level}: ${hint.title}` : 'Hint unlocked.',
  };
}

export function formatHintBadge(type: Hint['type']): { label: string; color: string } {
  switch (type) {
    case 'conceptual':
      return { label: 'Conceptual Clue', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    case 'structural':
      return { label: 'Architecture & Placement', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
    case 'syntax':
      return { label: 'Syntax & Pattern', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    case 'partial_solution':
      return { label: 'Partial Code Skeleton', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    default:
      return { label: 'Hint', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30' };
  }
}
