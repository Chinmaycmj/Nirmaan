import fs from 'fs';
import path from 'path';

const workspacePath = path.resolve('components/vercel/VercelWorkspace.tsx');

const workspaceCode = `'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectFile, ProjectStats, InterventionLevel, AssistanceLevelNumber, AuthorType } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone, Hint } from '@/types/learning';
import { AISettings, ConceptExplanation, ValidationEvaluation } from '@/types/ai';
import { aiService } from '@/lib/ai/provider';
import { calculateProjectOwnership } from '@/lib/learning/ownershipTracker';
import { validateCheckpointSubmission } from '@/lib/learning/validator';
import { generateFileChallengeScaffold, FileChallengeScaffold } from '@/lib/learning/codeScaffolder';
import { 
  ASSISTANCE_POLICIES, 
  resolveAssistanceLevel, 
  canPromoteAssistanceLevel, 
  enforceAssistancePolicy 
} from '@/lib/learning/policyEngine';
import { InteractiveTokenCodeViewer } from '@/components/learning/InteractiveTokenCodeViewer';
import { GithubImportModal } from '@/components/github/GithubImportModal';
import { PredictBeforeRevealModal } from '@/components/learning/PredictBeforeRevealModal';
import { ExplainBackModal } from '@/components/learning/ExplainBackModal';
import { AIFreeCheckpointModal } from '@/components/learning/AIFreeCheckpointModal';
import { VerifiedPortfolioModal } from '@/components/modals/VerifiedPortfolioModal';
import { CommandPaletteModal, CommandItem } from '@/components/workspace/CommandPaletteModal';
import { TrustTransparencyModal } from '@/components/modals/TrustTransparencyModal';

import { LivePreview } from '@/components/preview/LivePreview';
import { CodeEditor } from '@/components/ide/CodeEditor';
import { ExplanationModal } from '@/components/modals/ExplanationModal';
import { KnowledgeGraphModal } from '@/components/modals/KnowledgeGraphModal';
import { ProjectTimelineModal } from '@/components/modals/ProjectTimelineModal';
import { SettingsModal } from '@/components/modals/SettingsModal';

import { 
  Sparkles, 
  ArrowLeft, 
  ArrowUp, 
  Code2, 
  Eye, 
  Lightbulb, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  HelpCircle, 
  Layers, 
  Settings, 
  RotateCcw, 
  ChevronRight, 
  ChevronDown, 
  FileCode, 
  FolderGit2, 
  Folder, 
  CheckCheck, 
  Zap, 
  Globe, 
  Monitor, 
  Smartphone, 
  Play, 
  Share2, 
  Terminal, 
  Send, 
  Loader2, 
  MessageSquare, 
  PanelRightClose, 
  PanelRightOpen, 
  Maximize2, 
  Minimize2, 
  Check, 
  X,
  FileText,
  Brain,
  MessageSquareQuote,
  ShieldCheck,
  Award,
  Server,
  Command as CommandIcon,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VercelWorkspaceProps {
  initialProject: Project;
  initialCheckpoints: LearningCheckpoint[];
  initialMilestones: ProjectMilestone[];
  initialPrompt: string;
  onReturnToLanding: () => void;
}

export const VercelWorkspace: React.FC<VercelWorkspaceProps> = ({
  initialProject,
  initialCheckpoints,
  initialMilestones,
  initialPrompt,
  onReturnToLanding,
}) => {
  const [project, setProject] = useState<Project>(initialProject);
  const [checkpoints, setCheckpoints] = useState<LearningCheckpoint[]>(initialCheckpoints);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>(initialMilestones);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [masteredConceptIds, setMasteredConceptIds] = useState<string[]>([]);

  // Workspace Mode: 'playground' (spacious learning studio) vs 'files' (monaco file tree)
  const [workspaceMode, setWorkspaceMode] = useState<'playground' | 'files'>('playground');

  // Focus Mode (100% full screen distraction-free coding)
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  // Multi-File Project Drawer & Dynamic 10-20% Challenge Scaffold
  const [isFilesDrawerOpen, setIsFilesDrawerOpen] = useState<boolean>(false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState<boolean>(false);
  const [activeFileChallenge, setActiveFileChallenge] = useState<FileChallengeScaffold | null>(null);

  // 5-Level AI Assistance Policy Engine State
  const [assistanceLevel, setAssistanceLevel] = useState<AssistanceLevelNumber>(() => {
    return resolveAssistanceLevel(initialProject.interventionLevel).levelNumber;
  });

  // Companion Preview controls (default to false so coding studio takes 100% full width)
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState<number>(0);

  // Synchronized Code Editor Studio State
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [cursorLine, setCursorLine] = useState<number>(1);
  const [cursorCol, setCursorCol] = useState<number>(1);

  const handleEditorScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const updateCursorPosition = () => {
    if (textareaRef.current) {
      const pos = textareaRef.current.selectionStart || 0;
      const linesUpToCursor = userCode.substring(0, pos).split('\\n');
      setCursorLine(linesUpToCursor.length);
      setCursorCol((linesUpToCursor[linesUpToCursor.length - 1]?.length || 0) + 1);
    }
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const updated = userCode.substring(0, start) + '  ' + userCode.substring(end);
      setUserCode(updated);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
          updateCursorPosition();
        }
      }, 0);
    }
  };

  // Checkpoint Task interactive state
  const [userCode, setUserCode] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [explanationText, setExplanationText] = useState<string>('');
  const [revealedHintIndex, setRevealedHintIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState<ValidationEvaluation | null>(null);
  const [isAnalogyExpanded, setIsAnalogyExpanded] = useState<boolean>(true);

  // Collapsible AI Tutor Slide-over Drawer
  const [isTutorDrawerOpen, setIsTutorDrawerOpen] = useState<boolean>(false);
  const [followupPrompt, setFollowupPrompt] = useState('');
  const [isFollowupLoading, setIsFollowupLoading] = useState(false);

  // Assistant Greeting
  const stackLanguage = project.techStack?.language || 'JavaScript';
  const initialGreeting = \`Welcome to your high-scale \${stackLanguage} architecture (\${project.files.length} files). Reference code with line-by-line syntax and syllable analysis is on the left, and your active workspace is on the right. Let's build every line together!\`;

  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { 
      role: 'user', 
      text: initialPrompt || 'Build an application' 
    },
    { 
      role: 'assistant', 
      text: initialGreeting
    },
  ]);

  // Master Improvement Blueprint Modals
  const [isPredictModalOpen, setIsPredictModalOpen] = useState(false);
  const [isExplainBackModalOpen, setIsExplainBackModalOpen] = useState(false);
  const [isAIFreeModalOpen, setIsAIFreeModalOpen] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTrustModalOpen, setIsTrustModalOpen] = useState(false);

  // Deep-dive Modals
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [activeExplanation, setActiveExplanation] = useState<ConceptExplanation | null>(null);
  const [isKnowledgeGraphOpen, setIsKnowledgeGraphOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiSettings, setAiSettings] = useState<AISettings>({ provider: 'builtin' });

  const activeCheckpoint = checkpoints[currentStepIndex] || null;
  const activeFile = project.files.find(f => f.id === project.activeFileId) || project.files[0] || null;

  // Calculate project ownership with line-level provenance
  const stats: ProjectStats = calculateProjectOwnership(project);
  stats.checkpointsCompleted = checkpoints.filter(c => c.status === 'COMPLETED').length;
  stats.totalCheckpoints = checkpoints.length;

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Listen for Ctrl+K / Cmd+K to toggle Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Synchronize state when checkpoint changes
  useEffect(() => {
    if (activeCheckpoint) {
      if (activeCheckpoint.taskType === 'FIX_BUG') {
        setUserCode(activeCheckpoint.brokenCode || '');
      } else {
        setUserCode(activeCheckpoint.initialCode || '');
      }
      setSelectedOption('');
      setExplanationText('');
      setRevealedHintIndex(0);
      setLastEvaluation(null);

      if (activeCheckpoint.targetFileId) {
        setProject(prev => ({ ...prev, activeFileId: activeCheckpoint.targetFileId }));
      }
    }
  }, [activeCheckpoint?.id]);

  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMessages, isTutorDrawerOpen]);

  // Detect Target Language
  const getTargetLanguage = () => {
    if (activeCheckpoint?.language) {
      if (activeCheckpoint.language === 'cpp') return 'C++';
      if (activeCheckpoint.language === 'java') return 'Java';
      if (activeCheckpoint.language === 'python') return 'Python';
      if (activeCheckpoint.language === 'javascript') return 'JavaScript';
      if (activeCheckpoint.language === 'css') return 'CSS';
      if (activeCheckpoint.language === 'html') return 'HTML';
    }
    const target = project.files.find(f => f.id === activeCheckpoint?.targetFileId) || activeFile;
    const name = target?.name || '';
    if (name.endsWith('.cpp') || name.endsWith('.h')) return 'C++';
    if (name.endsWith('.java')) return 'Java';
    if (name.endsWith('.css') || activeCheckpoint?.conceptId.includes('css')) return 'CSS';
    if (name.endsWith('.js') || activeCheckpoint?.conceptId.includes('dom') || project.techStack?.language === 'JavaScript') return 'JavaScript';
    if (name.endsWith('.py') || activeCheckpoint?.conceptId.includes('python')) return 'Python';
    if (name.endsWith('.html')) return 'HTML';
    return project.techStack?.language || 'JavaScript';
  };

  // Detect Tiered Runtime Environment
  const getRuntimeEnvironment = () => {
    const lang = getTargetLanguage();
    if (lang === 'C++' || lang === 'Java') {
      return { 
        label: 'Secure Cloud Compiler Sandbox', 
        type: 'cloud', 
        badge: 'Isolated Runner',
        icon: '☁️',
        desc: 'Compiled in an isolated runner with 10s timeout, PID limits, and zero socket egress.'
      };
    }
    if (lang === 'Python') {
      return { 
        label: 'Pyodide Web Worker Sandbox', 
        type: 'worker', 
        badge: 'Local WASM',
        icon: '⚡',
        desc: 'Executes locally in your browser via an isolated WebAssembly Web Worker.'
      };
    }
    return { 
      label: 'Browser Virtual DOM Sandbox', 
      type: 'browser', 
      badge: 'Client Sandbox',
      icon: '🌐',
      desc: 'Renders in a client-side virtual DOM iframe with strict Content Security Policy.'
    };
  };

  // 100% Real Code Match Analysis
  const getMatchStats = () => {
    const reference = activeFileChallenge?.fullReferenceCode || activeCheckpoint?.solutionCode || activeCheckpoint?.initialCode || '';
    if (!reference.trim()) return { matched: 0, total: 0, percent: 100 };

    const refLines = reference.split('\\n').map(l => l.trim()).filter(l => l && !l.startsWith('//') && !l.startsWith('#') && !l.startsWith('/*'));
    const userLines = userCode.split('\\n').map(l => l.trim()).filter(Boolean);

    if (refLines.length === 0) return { matched: 0, total: 0, percent: 100 };

    let matches = 0;
    for (const r of refLines) {
      if (userLines.some(u => u === r || u.includes(r) || r.includes(u))) {
        matches++;
      }
    }
    const percent = Math.min(100, Math.round((matches / refLines.length) * 100));
    return { matched: matches, total: refLines.length, percent };
  };

  const matchStats = getMatchStats();

  const getCodePlaceholder = () => {
    const lang = getTargetLanguage();
    if (lang === 'C++') return '// Write your C++ calculate implementation here (e.g. switch(op) { case ... })...';
    if (lang === 'Java') return '// Write your Java calculate implementation here (e.g. switch(op) { case ... })...';
    if (lang === 'CSS') return '/* Write your CSS rules here... */';
    if (lang === 'JavaScript') return '// Write your JavaScript code here...';
    if (lang === 'Python') return '# Write your Python code here...';
    if (lang === 'HTML') return '<!-- Write your HTML markup here... -->';
    return '// Write your code here...';
  };

  const handleElementInspected = (filePath: string, line: number, conceptName: string) => {
    const targetFile = project.files.find(f => f.path === filePath || f.name === filePath || f.path.endsWith(filePath));
    if (targetFile) {
      setProject(prev => ({ ...prev, activeFileId: targetFile.id }));
    }
    const explanation = aiService.getConceptExplanation(
      activeCheckpoint?.conceptId || 'functions_parameters',
      'beginner'
    );
    setActiveExplanation(explanation);
    setIsExplanationOpen(true);
  };

  const handleRevealNextHint = () => {
    if (!activeCheckpoint) return;
    if (revealedHintIndex < activeCheckpoint.hints.length) {
      setRevealedHintIndex(prev => prev + 1);
    }
  };

  const handleCheckSubmission = async () => {
    if (!activeCheckpoint) return;
    setIsSubmitting(true);

    try {
      let submissionValue: string | number | boolean = userCode;
      if (activeCheckpoint.taskType === 'PREDICT_OUTPUT' || activeCheckpoint.taskType === 'CHOOSE_APPROACH') {
        submissionValue = selectedOption;
      } else if (activeCheckpoint.taskType === 'EXPLAIN_CODE') {
        submissionValue = explanationText;
      }

      const evaluation = await validateCheckpointSubmission(activeCheckpoint, submissionValue);
      setLastEvaluation(evaluation);

      if (evaluation.passed) {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 }
        });

        setCheckpoints(prev =>
          prev.map(c => c.id === activeCheckpoint.id ? { ...c, status: 'COMPLETED' } : c)
        );

        if (activeCheckpoint.targetFileId && typeof userCode === 'string') {
          setProject(prev => {
            const updatedFiles = prev.files.map(file => {
              if (file.id === activeCheckpoint.targetFileId) {
                return {
                  ...file,
                  content: userCode,
                  version: file.version + 1,
                  contributions: [
                    ...file.contributions,
                    {
                      id: 'user-' + Date.now(),
                      fileId: file.id,
                      startLine: 1,
                      endLine: userCode.split('\\n').length,
                      authorType: 'USER_WRITTEN' as const,
                      timestamp: Date.now(),
                      conceptId: activeCheckpoint.conceptId
                    }
                  ]
                };
              }
              return file;
            });
            return { ...prev, files: updatedFiles };
          });
          setPreviewKey(k => k + 1);
        }

        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: \`🎉 Outstanding work! You successfully mastered "\${activeCheckpoint.conceptName}". \${evaluation.message}\`
          }
        ]);
      }
    } catch (err: any) {
      setLastEvaluation({
        passed: false,
        score: 0,
        title: 'Evaluation Error',
        message: \`Evaluation error: \${err.message || 'Please check your code syntax.'}\`,
        testResults: [],
        diagnostic: {
          whatHappened: 'Code evaluation failed',
          whereItHappened: 'Validator Sandbox',
          whatMessageMeans: err.message || 'Check syntax',
          conceptInvolved: activeCheckpoint.conceptName,
          investigationSteps: ['Check for unclosed braces', 'Ensure valid syntax'],
          suggestedHint: 'Verify that syntax conforms to language specifications.'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < checkpoints.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  // Assistance Level Promotion Handler (Deterministic Policy Gating)
  const handleSelectAssistanceLevel = (newLevel: AssistanceLevelNumber) => {
    const targetConfig = ASSISTANCE_POLICIES[newLevel];
    const promotionCheck = canPromoteAssistanceLevel(assistanceLevel, newLevel, stats);

    if (!promotionCheck.canPromote) {
      if (promotionCheck.requiresChallenge) {
        setIsExplainBackModalOpen(true);
      }
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: \`⚠️ **Policy Guard**: \${promotionCheck.message}\`
        }
      ]);
      return;
    }

    setAssistanceLevel(newLevel);
    setProject(prev => ({ ...prev, interventionLevel: targetConfig.levelKey }));
    setChatMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        text: \`🛡️ **Assistance Policy Updated to \${targetConfig.displayName}** (\${targetConfig.badge})\n\n• **Max AI Generation**: \${targetConfig.maxGeneratedLines === 0 ? 'Zero direct code (Socratic hints only)' : \`≤ \${targetConfig.maxGeneratedLines} lines\`}\n• **Required Ownership Floor**: \${targetConfig.minOwnershipFloor}%\n• \${targetConfig.description}\`
      }
    ]);
  };

  // Explain-Back Completion (Converts AI lines into USER_UNDERSTOOD)
  const handleExplainBackPassed = (explanation: string, score: number) => {
    if (!activeFile) return;

    setProject(prev => {
      const updatedFiles = prev.files.map(f => {
        if (f.id === activeFile.id) {
          const newContribs = [
            ...f.contributions,
            {
              id: 'understood-' + Date.now(),
              fileId: f.id,
              startLine: 1,
              endLine: (f.content ? f.content.split('\\n').length : 1),
              authorType: 'USER_UNDERSTOOD' as AuthorType,
              timestamp: Date.now(),
              conceptId: activeCheckpoint?.conceptId,
              explanationNotes: explanation,
            }
          ];
          return { ...f, contributions: newContribs };
        }
        return f;
      });
      return { ...prev, files: updatedFiles };
    });

    confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });

    setChatMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        text: \`🌟 **Comprehension Verified!** Your explanation for "\${activeCheckpoint?.conceptName || activeFile.name}" scored **\${score}/100**. Those lines are now certified as **Verified Understood Ownership** in your portfolio!\`
      }
    ]);
  };

  // AI-Free Checkpoint Completion
  const handleAIFreeCheckpointPassed = (code: string) => {
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    setChatMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        text: \`🏆 **Independent Mastery Certified!** You solved the challenge without AI generation or assistance. This achievement has been recorded to your verified engineering portfolio.\`
      }
    ]);
  };

  const handleSendFollowup = async () => {
    if (!followupPrompt.trim() || isFollowupLoading) return;
    const promptText = followupPrompt.trim();
    setFollowupPrompt('');

    setChatMessages(prev => [...prev, { role: 'user', text: promptText }]);
    setIsFollowupLoading(true);
    setIsTutorDrawerOpen(true);

    try {
      const resp = await aiService.generateChatResponse(
        promptText,
        \`Project: \${project.name}. Current concept: \${activeCheckpoint?.conceptName || 'Software Architecture'}.\`,
        aiSettings,
        {
          projectFiles: project.files,
          activeFile: activeFile || undefined,
          techStack: project.techStack,
          projectName: project.name,
        }
      );

      // Enforce assistance policy on response content
      const policyCheck = enforceAssistancePolicy(assistanceLevel, resp.text, stats);
      if (!policyCheck.allowed) {
        setChatMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            text: policyCheck.message || 'Direct solution code blocked by current assistance policy.' 
          }
        ]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', text: resp.text }]);
      }
    } catch {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: \`In \${project.name}, we structure each statement cleanly with full syntax visibility. You can inspect any token or run tests anytime!\`
        }
      ]);
    } finally {
      setIsFollowupLoading(false);
    }
  };

  const handleSelectRepositoryFile = (file: ProjectFile) => {
    setProject(prev => ({ ...prev, activeFileId: file.id }));

    if (file.content) {
      const scaffold = generateFileChallengeScaffold(file.content, file.name, file.language);
      setActiveFileChallenge(scaffold);
      setUserCode(scaffold.scaffoldUserCode);

      // Update active checkpoint so validator & progress align with selected file
      setCheckpoints(prev => {
        if (!prev[currentStepIndex]) return prev;
        return prev.map((ckpt, idx) => {
          if (idx === currentStepIndex) {
            return {
              ...ckpt,
              targetFileId: file.id,
              conceptName: \`\${file.name} Architecture\`,
              title: \`Implement \${file.name} (Lines \${scaffold.startLine}–\${scaffold.endLine})\`,
              prompt: \`In this file (\${scaffold.totalLines} lines), approximately \${scaffold.challengePercent}% of the implementation (\${scaffold.challengeLineCount} lines, L\${scaffold.startLine}–L\${scaffold.endLine}) has been scaffolded for your active coding task. Reference the 100% full file on the left and write your implementation in the editor!\`,
              initialCode: scaffold.scaffoldUserCode,
              solutionCode: scaffold.fullReferenceCode,
            };
          }
          return ckpt;
        });
      });

      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: \`📂 **Loaded \${file.name}** (\${scaffold.totalLines} lines).\n\n• **Left Column**: 100% of the authentic file is loaded into the Reference Specification viewer with line-by-line syllable decomposition.\n• **Right Column**: A **\${scaffold.challengeLineCount}-line challenge** (\${scaffold.challengePercent}% of file, Lines \${scaffold.startLine}–\${scaffold.endLine}) has been created with surrounding code intact.\n\nType your code or ask any questions about this file!\`
        }
      ]);
    }
  };

  const handleFileContentChange = (newContent: string) => {
    if (!activeFile) return;
    setProject(prev => ({
      ...prev,
      files: prev.files.map(f => f.id === activeFile.id ? { ...f, content: newContent } : f)
    }));
  };

  // Total lines across all files in repository
  const totalRepoLines = project.files.reduce((acc, f) => acc + (f.content ? f.content.split('\\n').length : 0), 0);
  const runtime = getRuntimeEnvironment();
  const currentPolicy = ASSISTANCE_POLICIES[assistanceLevel];

  // Command Palette Items
  const commandPaletteItems: CommandItem[] = [
    {
      id: 'run-tests',
      title: 'Run & Validate Code',
      shortcut: 'Ctrl+Enter',
      icon: <Play className="w-4 h-4 text-emerald-600" />,
      category: 'execution',
      action: () => handleCheckSubmission(),
    },
    {
      id: 'toggle-focus',
      title: isFocusMode ? 'Exit Focus Mode' : 'Toggle Focus Mode (100% Fullscreen Editor)',
      shortcut: 'Alt+F',
      icon: <Maximize2 className="w-4 h-4 text-[#326080]" />,
      category: 'workspace',
      action: () => setIsFocusMode(prev => !prev),
    },
    {
      id: 'predict-reveal',
      title: 'Predict Next Step (Predict-Before-Reveal)',
      shortcut: 'Alt+P',
      icon: <Brain className="w-4 h-4 text-amber-600" />,
      category: 'learning',
      action: () => setIsPredictModalOpen(true),
    },
    {
      id: 'explain-back',
      title: 'Explain-Back Code Audit (Boost Understood %)',
      shortcut: 'Alt+E',
      icon: <MessageSquareQuote className="w-4 h-4 text-sky-600" />,
      category: 'learning',
      action: () => setIsExplainBackModalOpen(true),
    },
    {
      id: 'ai-free-checkpoint',
      title: 'AI-Free Mastery Checkpoint (Independent Mode)',
      shortcut: 'Alt+C',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
      category: 'learning',
      action: () => setIsAIFreeModalOpen(true),
    },
    {
      id: 'view-portfolio',
      title: 'View Verified Engineering Portfolio',
      icon: <Award className="w-4 h-4 text-amber-600" />,
      category: 'learning',
      action: () => setIsPortfolioModalOpen(true),
    },
    {
      id: 'knowledge-graph',
      title: 'Open Architectural Knowledge Graph',
      icon: <Layers className="w-4 h-4 text-[#326080]" />,
      category: 'workspace',
      action: () => setIsKnowledgeGraphOpen(true),
    },
    {
      id: 'trust-architecture',
      title: 'View Trust, Execution & Privacy Boundaries',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
      category: 'workspace',
      action: () => setIsTrustModalOpen(true),
    },
    {
      id: 'github-import',
      title: 'Import Any GitHub Repository',
      icon: <FolderGit2 className="w-4 h-4 text-[#805232]" />,
      category: 'workspace',
      action: () => setIsGithubModalOpen(true),
    },
  ];

  return (
    <div className="flex flex-col h-screen w-screen bg-[#FFF1E7] text-[#1c1917] overflow-hidden font-sans select-none antialiased relative selection:bg-[#326080] selection:text-white">
      {/* Background Beach Sand Micro-Dot Canvas */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 z-0" 
        style={{
          backgroundImage: 'radial-gradient(rgba(180, 150, 110, 0.22) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} 
      />

      {/* ========================================================================= */}
      {/* TOP GLOBAL BAR: Project Info, Policy, Command Palette, Ownership, Preview */}
      {/* ========================================================================= */}
      <header className="h-14 px-4 md:px-6 border-b border-[#ebdcd0] bg-[#FFF1E7]/95 backdrop-blur-md flex items-center justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={onReturnToLanding}
            className="p-1.5 rounded-xl hover:bg-[#f6e7db] text-[#78716c] hover:text-[#1c1917] transition-colors"
            title="Return to Projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-tight text-[#1c1917]">{project.name}</span>
            <span className="text-[10px] font-mono uppercase bg-[#B5D2E6]/30 text-[#326080] font-bold px-2 py-0.5 rounded-full border border-[#B5D2E6]/60">
              {getTargetLanguage()}
            </span>
          </div>

          {/* Runtime Tier Chip */}
          <div 
            onClick={() => setIsTrustModalOpen(true)}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/80 border border-[#ebdcd0] text-[10px] font-mono text-[#57534e] cursor-pointer hover:bg-white transition-all shadow-sm"
            title={runtime.desc}
          >
            <span>{runtime.icon}</span>
            <span className="font-bold">{runtime.badge}</span>
          </div>

          {/* Mode Switcher: Playground vs File IDE */}
          {!isFocusMode && (
            <div className="hidden sm:flex items-center p-0.5 rounded-xl bg-white/70 border border-[#ebdcd0] text-xs ml-1 shadow-inner">
              <button
                onClick={() => setWorkspaceMode('playground')}
                className={\`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all font-semibold \${
                  workspaceMode === 'playground'
                    ? 'bg-[#326080] text-white shadow-sm'
                    : 'text-[#78716c] hover:text-[#1c1917]'
                }\`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Playground</span>
              </button>
              <button
                onClick={() => setWorkspaceMode('files')}
                className={\`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all font-semibold \${
                  workspaceMode === 'files'
                    ? 'bg-[#326080] text-white shadow-sm'
                    : 'text-[#78716c] hover:text-[#1c1917]'
                }\`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Files</span>
              </button>
            </div>
          )}

          {/* Multi-File Repository Scale Pill */}
          <button
            onClick={() => setIsFilesDrawerOpen(!isFilesDrawerOpen)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/90 hover:bg-[#f6e7db] border border-[#ebdcd0] text-[11px] font-mono text-[#57534e] hover:text-[#1c1917] transition-colors shadow-sm"
            title="Browse all repository files"
          >
            <Folder className="w-3.5 h-3.5 text-[#326080]" />
            <span className="font-bold">{project.files.length} Files</span>
            <span className="text-[#a8a29e]">•</span>
            <span>{totalRepoLines} Lines</span>
          </button>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2">
          {/* Command Palette Trigger */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/90 hover:bg-white border border-[#ebdcd0] text-xs font-semibold text-[#44403c] transition-all shadow-sm"
            title="Open Command Palette (Ctrl+K)"
          >
            <CommandIcon className="w-3.5 h-3.5 text-[#326080]" />
            <kbd className="hidden lg:inline text-[10px] font-mono bg-[#faf6ee] text-[#78716c] px-1.5 py-0.5 rounded border border-[#ebdcd0]">
              Ctrl K
            </kbd>
          </button>

          {/* 5-Level Assistance Policy Selector */}
          <div className="flex items-center space-x-1 bg-white/90 border border-[#ebdcd0] rounded-xl px-2.5 py-1 text-xs shadow-sm">
            <span className="text-[10px] font-mono text-[#78716c] font-bold uppercase hidden sm:inline">AI Policy:</span>
            <select
              value={assistanceLevel}
              onChange={(e) => handleSelectAssistanceLevel(Number(e.target.value) as AssistanceLevelNumber)}
              className="bg-transparent text-[#1c1917] font-bold text-xs outline-none cursor-pointer"
            >
              <option value={1}>L1: Tutor (User Heavy)</option>
              <option value={2}>L2: Pair Programming</option>
              <option value={3}>L3: Co-Developer (Default)</option>
              <option value={4}>L4: Builder (Diff Mode)</option>
              <option value={5}>L5: Autopilot (Gated)</option>
            </select>
          </div>

          {/* Verified Ownership Pill */}
          <div 
            onClick={() => setIsPortfolioModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/90 border border-[#ebdcd0] text-xs font-mono shadow-sm cursor-pointer hover:bg-white transition-all"
            title={\`Verified Ownership: \${stats.verifiedOwnershipPercentage}% (\${stats.authoredPercentage}% Authored • \${stats.understoodPercentage}% Understood • \${stats.importedLines} Imported)\`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 font-bold">{stats.verifiedOwnershipPercentage}% Verified</span>
          </div>

          {/* Focus Mode Toggle */}
          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={\`p-2 rounded-xl border text-xs font-bold transition-all \${
              isFocusMode
                ? 'bg-[#326080] text-white border-[#326080] shadow-sm'
                : 'bg-white/90 text-[#57534e] border-[#ebdcd0] hover:bg-[#f6e7db]'
            }\`}
            title={isFocusMode ? "Exit Fullscreen Focus Mode" : "Focus Mode (100% Fullscreen Editor)"}
          >
            {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Verified Portfolio Trigger */}
          <button
            onClick={() => setIsPortfolioModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100/90 hover:bg-amber-200/80 border border-amber-300/80 text-[#92400e] text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Open Verified Engineering Portfolio"
          >
            <Award className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Portfolio</span>
          </button>

          {/* AI Tutor Chat Toggle Button */}
          {!isFocusMode && (
            <button
              onClick={() => setIsTutorDrawerOpen(!isTutorDrawerOpen)}
              className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors \${
                isTutorDrawerOpen 
                  ? 'bg-[#326080] border-[#326080] text-white shadow-sm' 
                  : 'bg-white/90 hover:bg-[#f6e7db] border-[#ebdcd0] text-[#44403c] hover:text-[#1c1917]'
              }\`}
              title="Toggle AI Co-Developer Chat Drawer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">AI Tutor</span>
            </button>
          )}

          {/* Deep-Dive Modals */}
          <button
            onClick={() => setIsKnowledgeGraphOpen(true)}
            className="p-2 rounded-xl bg-white/90 hover:bg-[#f6e7db] border border-[#ebdcd0] text-[#57534e] hover:text-[#1c1917] transition-colors shadow-sm"
            title="Architectural Knowledge Graph"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-white/90 hover:bg-[#f6e7db] border border-[#ebdcd0] text-[#57534e] hover:text-[#1c1917] transition-colors shadow-sm"
            title="Settings & Reset"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Toggle Preview Window */}
          {!isFocusMode && (
            <button
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ml-1 \${
                isPreviewOpen
                  ? 'bg-white text-[#326080] border-[#ebdcd0] hover:bg-[#f6e7db]'
                  : 'bg-[#326080] text-white border-[#326080] shadow-md shadow-[#326080]/20'
              }\`}
              title={isPreviewOpen ? "Minimize Preview Window" : "Open Companion Preview Window"}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isPreviewOpen ? 'Preview Aside' : 'Open Preview'}</span>
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* REPOSITORY MULTI-FILE DRAWER                                              */}
      {/* ========================================================================= */}
      {isFilesDrawerOpen && (
        <div className="bg-[#FFF1E7] border-b border-[#ebdcd0] p-4 z-20 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-[#326080]" />
              <span className="font-extrabold text-xs uppercase tracking-wider text-[#1c1917] font-mono">
                Repository File Matrix ({project.files.length} Files • {totalRepoLines} Lines)
              </span>
              <span className="text-[11px] text-[#78716c]">
                Click any file to load 100% reference and active 10–20% challenge
              </span>
            </div>
            <button
              onClick={() => setIsFilesDrawerOpen(false)}
              className="p-1 rounded-lg text-[#78716c] hover:text-[#1c1917] hover:bg-[#f6e7db]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
            {project.files.map((file) => {
              const isActive = file.id === project.activeFileId;
              const isTarget = file.id === activeCheckpoint?.targetFileId;
              const lineCount = file.content ? file.content.split('\\n').length : 0;

              return (
                <div
                  key={file.id}
                  onClick={() => handleSelectRepositoryFile(file)}
                  className={\`p-2.5 rounded-xl border text-xs cursor-pointer transition-all \${
                    isActive 
                      ? 'bg-amber-50/90 border-amber-400/90 shadow-sm ring-1 ring-amber-300' 
                      : 'bg-white/80 hover:bg-[#f6e7db] border-[#ebdcd0]'
                  }\`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs truncate text-[#1c1917]" title={file.name}>
                      {file.name}
                    </span>
                    {isTarget && (
                      <span className="text-[9px] font-mono px-1 rounded bg-[#326080] text-white">
                        TARGET
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#78716c] font-mono">
                    <span>{file.language}</span>
                    <span>{lineCount} lines</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN BODY: LARGE CODING PLAYGROUND + COMPANION PREVIEW                    */}
      {/* ========================================================================= */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ----------------------------------------------------------------------- */}
        {/* PANE 1: THE LARGE CODING PLAYGROUND & EXPLANATION STUDIO                */}
        {/* ----------------------------------------------------------------------- */}
        <div className={\`flex-1 flex flex-col h-full bg-[#FFF1E7] overflow-y-auto custom-scrollbar \${isFocusMode ? 'p-2 md:p-3 space-y-3' : 'p-4 md:p-6 lg:p-8 space-y-6'}\`}>
          
          {workspaceMode === 'playground' ? (
            <>
              {activeCheckpoint ? (
                <>
                  {/* 1. Header Card: Concept & Step Objectives */}
                  <div className="rounded-2xl border border-[#ebdcd0] bg-white p-5 shadow-sm relative overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono uppercase tracking-wider text-[#92400e] font-extrabold bg-amber-100/90 border border-amber-300/80 px-3 py-1 rounded-full">
                          Step {currentStepIndex + 1} of {checkpoints.length}
                        </span>
                        <span className="text-sm text-[#1c1917] font-bold">
                          {activeCheckpoint.conceptName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                          {currentPolicy.badge}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {activeCheckpoint.targetFileId && (
                          <div className="flex items-center gap-1.5 text-xs font-mono bg-white/80 px-3 py-1 rounded-xl border border-[#ebdcd0]">
                            <span className="text-[#78716c]">Target File:</span>
                            <span className="text-[#326080] font-bold">
                              {project.files.find(f => f.id === activeCheckpoint.targetFileId)?.name || 'app.js'}
                            </span>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            const exp = aiService.getConceptExplanation(activeCheckpoint.conceptId, 'beginner');
                            setActiveExplanation(exp);
                            setIsExplanationOpen(true);
                          }}
                          className="text-xs text-[#326080] hover:text-[#254b66] flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/90 hover:bg-[#f6e7db] border border-[#ebdcd0] transition-colors font-medium shadow-sm"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Explain Concept</span>
                        </button>
                      </div>
                    </div>

                    <h2 className="text-xl md:text-2xl font-black text-[#1c1917] tracking-tight mb-2">
                      {activeCheckpoint.title}
                    </h2>
                    <p className="text-sm text-[#44403c] leading-relaxed max-w-4xl">
                      {activeCheckpoint.prompt}
                    </p>
                  </div>

                  {/* 2. Real-Life Analogy & Architectural Context Accordion */}
                  {(activeCheckpoint.realLifeExample || activeCheckpoint.contextExplanation) && (
                    <div className="rounded-2xl border border-amber-200/90 bg-[#fffdf8] overflow-hidden shadow-sm transition-all">
                      <button
                        type="button"
                        onClick={() => setIsAnalogyExpanded(!isAnalogyExpanded)}
                        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-amber-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">🌍</span>
                          <span className="text-sm font-bold text-[#78350f]">
                            Real-Life Physical Analogy &amp; Why This Code Exists
                          </span>
                        </div>
                        <span className="text-xs font-mono text-[#92400e]">
                          {isAnalogyExpanded ? '▲ Hide Analogy' : '▼ View Real-Life Analogy'}
                        </span>
                      </button>

                      {isAnalogyExpanded && (
                        <div className="px-5 pb-5 pt-1 space-y-4 border-t border-amber-200/60 text-xs md:text-sm text-[#44403c] leading-relaxed">
                          {activeCheckpoint.realLifeExample && (
                            <div className="p-4 rounded-xl bg-amber-100/60 border border-amber-200/80 text-[#78350f] space-y-1">
                              <span className="font-bold text-xs font-mono uppercase tracking-wider block">
                                Physical Metaphor:
                              </span>
                              <p>{activeCheckpoint.realLifeExample}</p>
                            </div>
                          )}

                          {activeCheckpoint.contextExplanation && (
                            <div className="space-y-1">
                              <span className="font-bold text-xs font-mono uppercase tracking-wider text-[#92400e] block">
                                Architectural Purpose:
                              </span>
                              <p>{activeCheckpoint.contextExplanation}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. Side-by-Side Dual Studio */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs px-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs font-mono uppercase tracking-wider text-[#326080]">
                          Line-By-Line Development Studio
                        </span>
                        <span className="text-[11px] text-[#78716c]">
                          Left: Reference code • Right: Your code
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={\`text-[11px] font-mono px-2.5 py-0.5 rounded-full border \${
                          matchStats.percent === 100
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : matchStats.percent >= 50
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-white/80 text-[#78716c] border-[#ebdcd0]'
                        }\`}>
                          {matchStats.percent}% Reference Aligned ({matchStats.matched}/{matchStats.total} lines)
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[460px]">
                      {/* COLUMN 1: REFERENCE CODE & SYLLABLE DECOMPOSER */}
                      <div className="flex flex-col h-full min-h-[440px]">
                        <InteractiveTokenCodeViewer
                          code={activeFileChallenge?.fullReferenceCode || activeCheckpoint.solutionCode || activeCheckpoint.initialCode || activeFile?.content || ''}
                          language={getTargetLanguage()}
                          onCopyOrInsert={() => setUserCode(activeFileChallenge?.fullReferenceCode || activeCheckpoint.solutionCode || activeCheckpoint.initialCode || '')}
                          title={\`REFERENCE SPECIFICATION (\${project.files.find(f => f.id === activeCheckpoint.targetFileId)?.name || activeFile?.name || 'app.js'})\`}
                          theme="sand"
                          projectName={project.name}
                          fileName={project.files.find(f => f.id === activeCheckpoint.targetFileId)?.name || activeFile?.name || 'app.js'}
                        />
                      </div>

                      {/* COLUMN 2: SPACIOUS USER WORKSPACE */}
                      <div className="flex flex-col rounded-2xl border border-[#ebdcd0] bg-white overflow-hidden focus-within:border-[#326080] focus-within:ring-2 focus-within:ring-[#B5D2E6]/50 shadow-sm h-full min-h-[440px] transition-all">
                        {/* Editor Header */}
                        <div className="h-11 px-4 bg-white/90 border-b border-[#ebdcd0] flex items-center justify-between shrink-0">
                          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1c1917]">
                            <Code2 className="w-4 h-4 text-[#326080]" />
                            <span>YOUR IMPLEMENTATION</span>
                            <span className="text-[11px] font-normal text-[#78716c] font-sans">
                              • {project.files.find(f => f.id === activeCheckpoint.targetFileId)?.name || activeFile?.name || 'app.js'}
                            </span>
                            {activeFileChallenge && (
                              <span className="text-[10px] font-mono bg-amber-100 text-[#92400e] border border-amber-300 px-2 py-0.5 rounded-full font-bold ml-1">
                                {activeFileChallenge.challengeLineCount} lines challenge ({activeFileChallenge.challengePercent}%)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setUserCode(activeFileChallenge ? activeFileChallenge.scaffoldUserCode : (activeCheckpoint.initialCode || ''));
                                updateCursorPosition();
                              }}
                              className="text-[11px] text-[#78716c] hover:text-[#1c1917] px-2.5 py-1 rounded-lg bg-white/90 hover:bg-[#f6e7db] border border-[#ebdcd0] transition-colors font-mono"
                              title="Reset to challenge scaffold"
                            >
                              Reset Scaffold
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setUserCode(activeFileChallenge ? activeFileChallenge.fullReferenceCode : (activeCheckpoint.solutionCode || ''));
                                updateCursorPosition();
                              }}
                              className="text-[11px] text-white px-2.5 py-1 rounded-lg bg-[#326080] hover:bg-[#254b66] transition-colors font-mono font-medium shadow-sm"
                              title="Load reference code"
                            >
                              Load Reference
                            </button>
                          </div>
                        </div>

                        {/* Editor Body with Synchronized Line Numbers Gutter */}
                        <div className="flex-1 flex overflow-hidden min-h-[380px] bg-white relative">
                          <div 
                            ref={gutterRef}
                            className="w-12 md:w-14 shrink-0 bg-[#faf6ee] border-r border-[#ebdcd0] py-3.5 pr-2.5 text-right font-mono text-[12px] md:text-[13px] leading-6 text-[#a8a29e] select-none overflow-hidden"
                            aria-hidden="true"
                          >
                            {Array.from({ length: Math.max(1, (userCode ? userCode.split('\\n').length : 1)) }).map((_, i) => (
                              <div 
                                key={i}
                                className={\`transition-colors \${cursorLine === i + 1 ? 'text-[#326080] font-bold' : ''}\`}
                              >
                                {i + 1}
                              </div>
                            ))}
                          </div>

                          <textarea
                            ref={textareaRef}
                            value={userCode}
                            onChange={e => {
                              setUserCode(e.target.value);
                              updateCursorPosition();
                            }}
                            onScroll={handleEditorScroll}
                            onKeyDown={handleEditorKeyDown}
                            onClick={updateCursorPosition}
                            onKeyUp={updateCursorPosition}
                            onSelect={updateCursorPosition}
                            placeholder={getCodePlaceholder()}
                            className="flex-1 w-full bg-white py-3.5 px-3 font-mono text-[13px] md:text-sm text-[#0f172a] resize-none outline-none leading-6 placeholder-[#a8a29e] whitespace-pre overflow-x-auto selection:bg-[#B5D2E6]/60"
                            spellCheck={false}
                          />
                        </div>

                        {/* Editor Status Bar */}
                        <div className="h-7 px-4 bg-[#faf6ee] border-t border-[#ebdcd0] flex items-center justify-between text-[11px] font-mono text-[#78716c] shrink-0">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-[#326080]">
                              Ln {cursorLine}, Col {cursorCol}
                            </span>
                            <span>Spaces: 2</span>
                            <span>UTF-8</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span>{(userCode ? userCode.split('\\n').length : 0)} lines</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#f6e7db] text-[#326080] font-bold text-[10px]">
                              {getTargetLanguage()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. Progressive Hints Tier */}
                  {activeCheckpoint.hints && activeCheckpoint.hints.length > 0 && (
                    <div className="rounded-2xl border border-amber-200/90 bg-[#fffdf8] p-4 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={handleRevealNextHint}
                          disabled={revealedHintIndex >= activeCheckpoint.hints.length}
                          className="text-xs text-[#78350f] hover:text-[#92400e] flex items-center gap-2 transition-colors disabled:opacity-40 font-bold"
                        >
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <span>Need Guidance? Reveal Progressive Hint ({revealedHintIndex}/{activeCheckpoint.hints.length})</span>
                        </button>
                        {revealedHintIndex > 0 && (
                          <span className="text-[11px] font-mono text-[#92400e] font-bold">
                            Hint Level {revealedHintIndex} Active
                          </span>
                        )}
                      </div>

                      {revealedHintIndex > 0 && (
                        <div className="space-y-2 pt-1">
                          {activeCheckpoint.hints.slice(0, revealedHintIndex).map((hint: Hint, hIdx: number) => (
                            <div 
                              key={hIdx}
                              className="p-3 rounded-xl bg-[#faf6ee] border border-amber-200/70 text-xs text-[#44403c] flex items-start gap-2.5"
                            >
                              <span className="font-bold text-[#92400e] font-mono text-[10px] mt-0.5">
                                HINT {hIdx + 1}:
                              </span>
                              <span className="leading-relaxed">{hint.content}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 5. Validation Result Banner */}
                  {lastEvaluation && (
                    <div className={\`p-4 rounded-2xl border text-sm shadow-sm \${
                      lastEvaluation.passed
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                    }\`}>
                      <div className="flex items-center gap-2 font-bold mb-1">
                        {lastEvaluation.passed ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            <span>All Tests Passed! Excellent Job.</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                            <span>{lastEvaluation.title || 'Tests Incomplete. Keep Going!'}</span>
                          </>
                        )}
                      </div>
                      <p className="text-[#44403c] leading-relaxed mb-1.5 text-xs md:text-sm">
                        {lastEvaluation.message}
                      </p>
                      {lastEvaluation.diagnostic?.suggestedHint && !lastEvaluation.passed && (
                        <p className="text-[#78350f] text-xs italic font-medium">
                          💡 Suggestion: {lastEvaluation.diagnostic.suggestedHint}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 6. Primary Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    <button
                      onClick={handleCheckSubmission}
                      disabled={isSubmitting}
                      className="py-2.5 px-6 rounded-xl bg-[#326080] hover:bg-[#254b66] text-white font-bold text-xs md:text-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#326080]/20 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Verifying Tests...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-white" />
                          <span>Run &amp; Validate Code</span>
                        </>
                      )}
                    </button>

                    {/* Predict Before Reveal */}
                    <button
                      onClick={() => setIsPredictModalOpen(true)}
                      className="py-2.5 px-4 rounded-xl bg-white hover:bg-[#f6e7db] border border-[#ebdcd0] text-[#1c1917] font-bold text-xs transition-all flex items-center gap-2 shadow-sm"
                      title="Predict execution behavior before viewing reference"
                    >
                      <Brain className="w-4 h-4 text-amber-600" />
                      <span>Predict Next Step</span>
                    </button>

                    {/* Explain-Back Audit */}
                    <button
                      onClick={() => setIsExplainBackModalOpen(true)}
                      className="py-2.5 px-4 rounded-xl bg-white hover:bg-[#f6e7db] border border-[#ebdcd0] text-[#1c1917] font-bold text-xs transition-all flex items-center gap-2 shadow-sm"
                      title="Audit and explain code in your own words to increase Understood Ownership %"
                    >
                      <MessageSquareQuote className="w-4 h-4 text-sky-600" />
                      <span>Explain-Back Audit</span>
                    </button>

                    {/* AI-Free Checkpoint */}
                    <button
                      onClick={() => setIsAIFreeModalOpen(true)}
                      className="py-2.5 px-4 rounded-xl bg-white hover:bg-[#f6e7db] border border-[#ebdcd0] text-[#1c1917] font-bold text-xs transition-all flex items-center gap-2 shadow-sm"
                      title="Test yourself without AI autocomplete or hints"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>AI-Free Checkpoint</span>
                    </button>

                    {/* Verified Portfolio */}
                    <button
                      onClick={() => setIsPortfolioModalOpen(true)}
                      className="py-2.5 px-4 rounded-xl bg-amber-100/90 hover:bg-amber-200/80 border border-amber-300 text-[#92400e] font-bold text-xs transition-all flex items-center gap-2 shadow-sm"
                      title="View your verifiable portfolio certificate and syllabus breakdown"
                    >
                      <Award className="w-4 h-4 text-amber-700" />
                      <span>Certified Portfolio</span>
                    </button>

                    {lastEvaluation?.passed && currentStepIndex < checkpoints.length - 1 && (
                      <button
                        onClick={handleNextStep}
                        className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs md:text-sm active:scale-[0.99] transition-all flex items-center gap-2 shadow-md shadow-emerald-900/20"
                      >
                        <span>Next Engineering Concept</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-12 text-[#78716c]">
                  Select a checkpoint or open a repository file to begin.
                </div>
              )}
            </>
          ) : (
            /* ================= MONACO FILE TREE MODE ================= */
            <div className="flex-1 flex overflow-hidden rounded-2xl border border-[#ebdcd0] bg-white shadow-sm min-h-[550px]">
              <div className="w-64 border-r border-[#ebdcd0] bg-[#faf6ee] p-3 flex flex-col shrink-0">
                <div className="flex items-center justify-between mb-3 px-2">
                  <span className="font-mono text-xs font-bold text-[#1c1917] uppercase tracking-wider">Project Files</span>
                  <span className="text-[10px] text-[#78716c] font-mono">{project.files.length} files</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                  {project.files.map(file => (
                    <div
                      key={file.id}
                      onClick={() => handleSelectRepositoryFile(file)}
                      className={\`flex items-center gap-2 px-3 py-2 rounded-xl text-xs cursor-pointer font-mono transition-colors \${
                        file.id === project.activeFileId
                          ? 'bg-[#326080] text-white font-bold shadow-sm'
                          : 'text-[#44403c] hover:bg-white'
                      }\`}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span className="truncate">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="h-10 px-4 bg-[#faf6ee] border-b border-[#ebdcd0] flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#1c1917]">{activeFile?.name || 'app.js'}</span>
                  <span className="text-[10px] font-mono text-[#78716c]">{activeFile?.language}</span>
                </div>
                <div className="flex-1 p-2">
                  <CodeEditor
                    activeFile={activeFile}
                    onCodeChange={handleFileContentChange}
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* PANE 2: COMPANION PREVIEW WINDOW (IF OPEN)                              */}
        {/* ----------------------------------------------------------------------- */}
        {isPreviewOpen && !isFocusMode && (
          <div className="w-full lg:w-[480px] xl:w-[540px] border-l border-[#ebdcd0] bg-[#FFF1E7] flex flex-col h-full shadow-lg z-10 animate-slideIn">
            <div className="h-11 px-4 bg-white/90 border-b border-[#ebdcd0] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono font-bold text-[#1c1917]">Companion Live Preview</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={\`p-1 rounded transition-colors \${previewDevice === 'desktop' ? 'bg-[#326080] text-white' : 'text-[#78716c] hover:bg-[#f6e7db]'}\`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={\`p-1 rounded transition-colors \${previewDevice === 'mobile' ? 'bg-[#326080] text-white' : 'text-[#78716c] hover:bg-[#f6e7db]'}\`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-3.5 bg-[#ebdcd0] mx-1" />

                <button
                  onClick={() => setPreviewKey(k => k + 1)}
                  className="p-1 hover:text-[#1c1917] text-[#78716c] transition-colors rounded hover:bg-[#f6e7db]"
                  title="Reload Preview Sandbox"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1 hover:text-[#1c1917] text-[#78716c] transition-colors rounded hover:bg-[#f6e7db] ml-1"
                  title="Close Preview Window"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live Preview Container */}
            <div className="flex-1 relative overflow-hidden bg-white/50 flex items-center justify-center p-2">
              <div className={\`w-full h-full rounded-2xl overflow-hidden shadow-lg transition-all \${
                previewDevice === 'mobile' ? 'max-w-[320px] max-h-[580px] border border-[#ebdcd0] rounded-3xl' : ''
              }\`}>
                <LivePreview
                  key={previewKey}
                  files={project.files}
                  onElementInspected={handleElementInspected}
                />
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SLIDE-OVER AI TUTOR DRAWER                                              */}
        {/* ----------------------------------------------------------------------- */}
        {isTutorDrawerOpen && !isFocusMode && (
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[400px] z-30 bg-[#FFF1E7]/95 backdrop-blur-xl border-l border-[#ebdcd0] shadow-2xl flex flex-col animate-slideIn">
            <div className="h-14 px-4 border-b border-[#ebdcd0] flex items-center justify-between shrink-0 bg-white/70">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#326080] to-[#487a9e] flex items-center justify-center shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-[#1c1917] block">AI Co-Developer Tutor</span>
                  <span className="text-[10px] font-mono text-[#326080] font-bold">{currentPolicy.badge}</span>
                </div>
              </div>
              <button
                onClick={() => setIsTutorDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-[#f6e7db] text-[#78716c] hover:text-[#1c1917]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={\`flex gap-2.5 text-xs \${msg.role === 'user' ? 'justify-end' : 'justify-start'}\`}
                >
                  <div 
                    className={\`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm \${
                      msg.role === 'user'
                        ? 'bg-[#326080] text-white'
                        : 'bg-[#faf6ee] text-[#1c1917] border border-[#ebdcd0]'
                    }\`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-[#ebdcd0] bg-white/70">
              <div className="relative rounded-xl border border-[#ebdcd0] bg-white p-2 focus-within:border-[#326080]">
                <input
                  type="text"
                  value={followupPrompt}
                  onChange={e => setFollowupPrompt(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSendFollowup();
                  }}
                  placeholder="Ask a question..."
                  className="w-full bg-transparent text-xs text-[#1c1917] outline-none pr-8 pl-1 placeholder-[#a8a29e]"
                />
                <button
                  onClick={handleSendFollowup}
                  disabled={!followupPrompt.trim() || isFollowupLoading}
                  className="absolute right-2 top-2 p-1 rounded-lg bg-[#326080] text-white hover:bg-[#254b66] disabled:opacity-30 shadow-sm"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* GitHub Repository Importer Modal */}
      <GithubImportModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
        onImportComplete={({ project: importedProj, checkpoints: importedCkpts, milestones: importedMiles }) => {
          setProject(importedProj);
          setCheckpoints(importedCkpts);
          setMilestones(importedMiles);
          setCurrentStepIndex(0);
          setUserCode(importedCkpts[0]?.initialCode || '');
          setChatMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              text: \`🚀 Successfully imported "\${importedProj.name}" with \${importedProj.files.length} files. All files are loaded and ready for step-by-step line learning!\`
            }
          ]);
        }}
      />

      {/* Command Palette Modal (Ctrl+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commandPaletteItems}
      />

      {/* Trust & Transparency Modal */}
      <TrustTransparencyModal
        isOpen={isTrustModalOpen}
        onClose={() => setIsTrustModalOpen(false)}
      />

      {/* Predict Before Reveal Modal */}
      <PredictBeforeRevealModal
        isOpen={isPredictModalOpen}
        onClose={() => setIsPredictModalOpen(false)}
        checkpoint={activeCheckpoint}
        onPredictionSubmitted={(isCorrect, text) => {
          setChatMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              text: isCorrect
                ? \`🎯 **Prediction Validated!** You accurately predicted: "\${text}". Your mental model is aligned with this implementation.\`
                : \`💡 **Hypothesis Noted:** You predicted: "\${text}". Inspect the reference code on the left to observe how the program actually behaves.\`
            }
          ]);
        }}
      />

      {/* Explain-Back Audit Modal */}
      <ExplainBackModal
        isOpen={isExplainBackModalOpen}
        onClose={() => setIsExplainBackModalOpen(false)}
        conceptName={activeCheckpoint?.conceptName || activeFile?.name || 'Software Architecture'}
        targetCodeSnippet={activeFileChallenge?.fullReferenceCode || activeCheckpoint?.solutionCode || activeFile?.content || ''}
        expectedKeywords={activeCheckpoint?.expectedKeywords}
        onVerificationPassed={handleExplainBackPassed}
      />

      {/* AI-Free Mastery Checkpoint Modal */}
      <AIFreeCheckpointModal
        isOpen={isAIFreeModalOpen}
        onClose={() => setIsAIFreeModalOpen(false)}
        conceptName={activeCheckpoint?.conceptName || 'Independent Architecture'}
        starterCode={activeCheckpoint?.initialCode || '// Write your independent code here...'}
        taskPrompt={activeCheckpoint?.prompt || 'Implement this module without AI hints.'}
        expectedLanguage={getTargetLanguage()}
        onCheckpointCompleted={(code) => {
          setUserCode(code);
          handleAIFreeCheckpointPassed(code);
        }}
      />

      {/* Verified Engineering Portfolio Modal */}
      <VerifiedPortfolioModal
        isOpen={isPortfolioModalOpen}
        onClose={() => setIsPortfolioModalOpen(false)}
        project={project}
        stats={stats}
        checkpoints={checkpoints}
      />

      {/* Deep-Dive Modals */}
      <ExplanationModal
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
        explanation={activeExplanation}
      />
      <KnowledgeGraphModal
        isOpen={isKnowledgeGraphOpen}
        onClose={() => setIsKnowledgeGraphOpen(false)}
        masteredConceptIds={masteredConceptIds}
        activeConceptId={activeCheckpoint?.conceptId || ''}
        project={project}
        activeCheckpoint={activeCheckpoint || undefined}
      />
      <ProjectTimelineModal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        milestones={milestones}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={aiSettings}
        onSaveSettings={setAiSettings}
        onResetProject={() => {
          setUserCode(activeCheckpoint?.initialCode || '');
          setLastEvaluation(null);
        }}
      />
    </div>
  );
};
`;

fs.writeFileSync(workspacePath, workspaceCode, 'utf8');
console.log('Successfully upgraded VercelWorkspace.tsx with Master Improvement Blueprint architecture!');
