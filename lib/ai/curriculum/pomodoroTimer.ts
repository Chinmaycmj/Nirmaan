import { Project, ProjectFile } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone } from '@/types/learning';

export function createPomodoroTimerProject(): {
  project: Project;
  checkpoints: LearningCheckpoint[];
  milestones: ProjectMilestone[];
} {
  const files: ProjectFile[] = [
    {
      id: 'file-pomo-types',
      projectId: 'proj-pomo',
      path: 'src/types.ts',
      name: 'types.ts',
      language: 'typescript',
      version: 1,
      content: `export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export interface TimerConfig {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
}
`,
      contributions: [
        {
          id: 'c-1',
          fileId: 'file-pomo-types',
          startLine: 1,
          endLine: 10,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
    {
      id: 'file-pomo-utils',
      projectId: 'proj-pomo',
      path: 'src/utils/timer.ts',
      name: 'timer.ts',
      language: 'typescript',
      version: 1,
      content: `/**
 * Formats total seconds into MM:SS format with leading zeros.
 */
export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return \`\${pad(minutes)}:\${pad(seconds)}\`;
}

/**
 * Calculates progress percentage (0 - 100).
 */
export function calculateProgress(currentSeconds: number, totalSeconds: number): number {
  if (totalSeconds <= 0) return 0;
  const elapsed = totalSeconds - currentSeconds;
  return Math.min(100, Math.max(0, (elapsed / totalSeconds) * 100));
}
`,
      contributions: [
        {
          id: 'c-2',
          fileId: 'file-pomo-utils',
          startLine: 1,
          endLine: 25,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
    {
      id: 'file-pomo-app',
      projectId: 'proj-pomo',
      path: 'src/App.tsx',
      name: 'App.tsx',
      language: 'tsx',
      version: 1,
      content: `import React, { useState, useEffect } from 'react';
import { TimerMode } from './types';
import { formatTime, calculateProgress } from './utils/timer';

export default function App() {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);

  const modeDurations = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (mode === 'work') {
        setCompletedSessions(c => c + 1);
        setMode('shortBreak');
        setTimeLeft(modeDurations.shortBreak);
      } else {
        setMode('work');
        setTimeLeft(modeDurations.work);
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, mode]);

  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(modeDurations[newMode]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(modeDurations[mode]);
  };

  const progress = calculateProgress(timeLeft, modeDurations[mode]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 select-none font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
        {/* Mode Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-8 space-x-1">
          <button
            onClick={() => handleModeChange('work')}
            className={\`px-4 py-2 rounded-lg text-xs font-semibold transition-colors \${
              mode === 'work' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }\`}
          >
            Focus (25m)
          </button>
          <button
            onClick={() => handleModeChange('shortBreak')}
            className={\`px-4 py-2 rounded-lg text-xs font-semibold transition-colors \${
              mode === 'shortBreak' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }\`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => handleModeChange('longBreak')}
            className={\`px-4 py-2 rounded-lg text-xs font-semibold transition-colors \${
              mode === 'longBreak' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }\`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Circular Clock Display */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-8">
          <svg className="w-full h-full -rotate-90">
            <circle cx="128" cy="128" r="110" stroke="#1e293b" strokeWidth="10" fill="none" />
            <circle
              cx="128"
              cy="128"
              r="110"
              stroke="#6366f1"
              strokeWidth="10"
              fill="none"
              strokeDasharray={2 * Math.PI * 110}
              strokeDashoffset={2 * Math.PI * 110 * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-5xl font-mono font-bold tracking-tight text-white block">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-widest mt-1 block">
              {mode === 'work' ? 'Deep Focus' : 'Recharge'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={\`px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95 \${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }\`}
          >
            {isRunning ? 'Pause' : 'Start Focus'}
          </button>
          <button
            onClick={handleReset}
            className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-sm font-semibold transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Session Stats */}
        <div className="mt-8 pt-6 border-t border-slate-800 w-full flex items-center justify-between text-xs text-slate-400">
          <span>Completed Sessions:</span>
          <span className="font-bold text-emerald-400">{completedSessions} 🍅</span>
        </div>
      </div>
    </div>
  );
}
`,
      contributions: [
        {
          id: 'c-3',
          fileId: 'file-pomo-app',
          startLine: 1,
          endLine: 130,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
  ];

  const checkpoints: LearningCheckpoint[] = [
    {
      id: 'chk-pomo-1',
      projectId: 'proj-pomo',
      stepNumber: 1,
      title: 'Format Seconds into MM:SS Clock String',
      conceptId: 'functions_parameters',
      conceptName: 'Time Formatting & String Padding',
      taskType: 'COMPLETE_CODE',
      targetFileId: 'file-pomo-utils',
      prompt: 'Complete `formatTime(totalSeconds: number): string` in `src/utils/timer.ts`. For example: `1500` &rarr; `"25:00"`, `65` &rarr; `"01:05"`. Use `.padStart(2, "0")` to guarantee two-digit minutes and seconds.',
      contextExplanation: 'Digital clocks and countdown timers require formatted strings with zero-padding to prevent layout shifts.',
      initialCode: `function formatTime(totalSeconds) {
  // YOUR CODE HERE: Return "MM:SS" string
}
`,
      solutionCode: `function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
}
`,
      testCases: [
        {
          id: 'tc-p1',
          description: 'Formats 1500 seconds as "25:00"',
          assertionFn: 'return formatTime(1500) === "25:00";',
        },
        {
          id: 'tc-p2',
          description: 'Formats 65 seconds with leading zero as "01:05"',
          assertionFn: 'return formatTime(65) === "01:05";',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Minutes and Seconds Math',
          content: 'Minutes is `Math.floor(totalSeconds / 60)`, seconds is `totalSeconds % 60`.',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Leading zero helper',
          content: 'Use `.toString().padStart(2, "0")` on both minutes and seconds.',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Format Expression',
          content: '`return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");`',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Full Function',
          content: `function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
}`,
        },
      ],
      status: 'IN_PROGRESS',
      attempts: 0,
      hintsUsed: 0,
      whatChangedInPreview: 'The timer display now renders standard MM:SS time format!',
    },
  ];

  const milestones: ProjectMilestone[] = [
    {
      id: 'm-p1',
      projectId: 'proj-pomo',
      stepNumber: 1,
      title: 'Scaffolded Pomodoro Timer',
      description: 'AI configured circular progress gauge, interval modes, and timer hook.',
      conceptName: 'React Components',
      timestamp: Date.now() - 3600000,
      targetFile: 'src/App.tsx',
      completed: true,
    },
  ];

  const project: Project = {
    id: 'proj-pomo',
    name: 'Pomodoro Focus Timer',
    description: 'A productivity focus timer with circular SVG progress, interval modes, and session tracking.',
    techStack: {
      frontend: 'React 18',
      language: 'TypeScript',
      styling: 'Tailwind CSS',
    },
    interventionLevel: 'guided',
    currentStage: 'Building Interval Engine & Clocks',
    activeFileId: 'file-pomo-utils',
    files,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now(),
  };

  return { project, checkpoints, milestones };
}
