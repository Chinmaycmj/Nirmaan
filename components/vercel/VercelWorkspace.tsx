'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectFile, ProjectStats } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone, Hint } from '@/types/learning';
import { AISettings, ConceptExplanation, ValidationEvaluation } from '@/types/ai';
import { aiService } from '@/lib/ai/provider';
import { calculateProjectOwnership } from '@/lib/learning/ownershipTracker';
import { validateCheckpointSubmission } from '@/lib/learning/validator';
import { InteractiveTokenCodeViewer } from '@/components/learning/InteractiveTokenCodeViewer';
import { GithubImportModal } from '@/components/github/GithubImportModal';

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
  FileText
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

  // Multi-File Project Drawer
  const [isFilesDrawerOpen, setIsFilesDrawerOpen] = useState<boolean>(false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState<boolean>(false);

  // Companion Preview controls
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(true);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState<number>(0);

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
  const stackRuntime = project.techStack?.runtime || '';
  const initialGreeting = `Welcome to your high-scale ${stackLanguage} architecture (${project.files.length} files). Reference code with line-by-line syntax and syllable analysis is on the left, and your active workspace is on the right. Let's build every line together!`;

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

  // Deep-dive Modals
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [activeExplanation, setActiveExplanation] = useState<ConceptExplanation | null>(null);
  const [isKnowledgeGraphOpen, setIsKnowledgeGraphOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiSettings, setAiSettings] = useState<AISettings>({ provider: 'builtin' });

  const activeCheckpoint = checkpoints[currentStepIndex] || null;
  const activeFile = project.files.find(f => f.id === project.activeFileId) || project.files[0] || null;

  // Calculate project ownership
  const stats: ProjectStats = calculateProjectOwnership(project);
  stats.checkpointsCompleted = checkpoints.filter(c => c.status === 'COMPLETED').length;
  stats.totalCheckpoints = checkpoints.length;

  const chatScrollRef = useRef<HTMLDivElement>(null);

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

  // 100% Real Code Match Analysis
  const getMatchStats = () => {
    const reference = activeCheckpoint?.solutionCode || activeCheckpoint?.initialCode || '';
    if (!reference.trim()) return { matched: 0, total: 0, percent: 100 };

    const refLines = reference.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//') && !l.startsWith('#') && !l.startsWith('/*'));
    const userLines = userCode.split('\n').map(l => l.trim()).filter(Boolean);

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
                      endLine: userCode.split('\n').length,
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
            text: `🎉 Outstanding work! You successfully mastered "${activeCheckpoint.conceptName}". ${evaluation.message}`
          }
        ]);
      }
    } catch (err: any) {
      setLastEvaluation({
        passed: false,
        score: 0,
        title: 'Evaluation Error',
        message: `Evaluation error: ${err.message || 'Please check your code syntax.'}`,
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
        `Project: ${project.name}. Current concept: ${activeCheckpoint?.conceptName || 'Software Architecture'}.`,
        aiSettings
      );
      setChatMessages(prev => [...prev, { role: 'assistant', text: resp.text }]);
    } catch {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `In ${project.name}, we structure each statement cleanly with full syntax visibility. You can inspect any token or run tests anytime!`
        }
      ]);
    } finally {
      setIsFollowupLoading(false);
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
  const totalRepoLines = project.files.reduce((acc, f) => acc + (f.content ? f.content.split('\n').length : 0), 0);

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
      {/* TOP GLOBAL BAR: Project Info, Mode Switcher, GitHub Import, Preview       */}
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
            <span className="text-[10px] font-mono uppercase bg-[#B5D2E6]/30 text-[#326080] font-bold px-2.5 py-0.5 rounded-full border border-[#B5D2E6]/60">
              {getTargetLanguage()}
            </span>
          </div>

          {/* Mode Switcher: Playground vs File IDE */}
          <div className="hidden sm:flex items-center p-0.5 rounded-xl bg-white/70 border border-[#ebdcd0] text-xs ml-2 shadow-inner">
            <button
              onClick={() => setWorkspaceMode('playground')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all font-semibold ${
                workspaceMode === 'playground'
                  ? 'bg-[#326080] text-white shadow-sm'
                  : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Coding Playground</span>
            </button>
            <button
              onClick={() => setWorkspaceMode('files')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all font-semibold ${
                workspaceMode === 'files'
                  ? 'bg-[#326080] text-white shadow-sm'
                  : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Monaco File Tree</span>
            </button>
          </div>

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
          {/* GitHub Repository Importer Button */}
          <button
            onClick={() => setIsGithubModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100/90 hover:bg-amber-200/80 border border-amber-300/80 text-[#92400e] text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Import public GitHub repository or high-scale multi-file architecture"
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import GitHub Repo</span>
          </button>

          {/* Ownership Pill */}
          <div 
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#ebdcd0] text-xs font-mono shadow-sm"
            title="Code Ownership: Human vs AI"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 font-bold">{stats.userPercentage}% You</span>
            <span className="text-[#a8a29e]">/</span>
            <span className="text-[#78716c]">{100 - stats.userPercentage}% AI</span>
          </div>

          {/* AI Tutor Chat Toggle Button */}
          <button
            onClick={() => setIsTutorDrawerOpen(!isTutorDrawerOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              isTutorDrawerOpen 
                ? 'bg-[#326080] border-[#326080] text-white shadow-sm' 
                : 'bg-white/90 hover:bg-[#f6e7db] border-[#ebdcd0] text-[#44403c] hover:text-[#1c1917]'
            }`}
            title="Toggle AI Co-Developer Chat Drawer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">AI Tutor</span>
          </button>

          {/* Deep-Dive Modals */}
          <button
            onClick={() => {
              if (activeCheckpoint) {
                const exp = aiService.getConceptExplanation(activeCheckpoint.conceptId, 'beginner');
                setActiveExplanation(exp);
                setIsExplanationOpen(true);
              }
            }}
            className="p-2 rounded-xl hover:bg-[#f6e7db] text-[#78716c] hover:text-[#1c1917] transition-colors"
            title="Deep Concept Explanation"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsKnowledgeGraphOpen(true)}
            className="p-2 rounded-xl hover:bg-[#f6e7db] text-[#78716c] hover:text-[#1c1917] transition-colors"
            title="Knowledge Graph & Mastery"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsTimelineOpen(true)}
            className="p-2 rounded-xl hover:bg-[#f6e7db] text-[#78716c] hover:text-[#1c1917] transition-colors"
            title="Project Roadmap & Milestones"
          >
            <CheckCheck className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl hover:bg-[#f6e7db] text-[#78716c] hover:text-[#1c1917] transition-colors"
            title="AI & Environment Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Toggle Preview Window (Aside / Small) */}
          <button
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ml-1 ${
              isPreviewOpen
                ? 'bg-white text-[#326080] border-[#ebdcd0] hover:bg-[#f6e7db]'
                : 'bg-[#326080] text-white border-[#326080] shadow-md shadow-[#326080]/20'
            }`}
            title={isPreviewOpen ? "Minimize Preview Window" : "Open Companion Preview Window"}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isPreviewOpen ? 'Preview Aside' : 'Open Preview'}</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* REPOSITORY MULTI-FILE DRAWER (HIGH-SCALE 10-100+ FILES EXPLORER)          */}
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
                Select any file to inspect reference code or edit side-by-side
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
              const lineCount = file.content ? file.content.split('\n').length : 0;

              return (
                <div
                  key={file.id}
                  onClick={() => {
                    setProject(prev => ({ ...prev, activeFileId: file.id }));
                  }}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-amber-50/90 border-amber-400/90 shadow-sm ring-1 ring-amber-300' 
                      : 'bg-white/80 hover:bg-[#f6e7db] border-[#ebdcd0]'
                  }`}
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
        {/* PANE 1: THE LARGE CODING PLAYGROUND & EXPLANATION STUDIO (MARINA PEACH) */}
        {/* ----------------------------------------------------------------------- */}
        <div className="flex-1 flex flex-col h-full bg-[#FFF1E7] overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 space-y-6">
          
          {workspaceMode === 'playground' ? (
            /* ================= PLAYGROUND MODE (DEFAULT) ================= */
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
                          <span>Explain in Detail</span>
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
                        <div className="flex items-center gap-1 text-xs text-[#92400e] font-semibold font-mono">
                          <span>{isAnalogyExpanded ? 'Collapse' : 'Expand Analogy'}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isAnalogyExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {isAnalogyExpanded && (
                        <div className="px-5 pb-5 pt-1 space-y-3 border-t border-amber-100 text-sm text-[#44403c] leading-relaxed">
                          {activeCheckpoint.realLifeExample && (
                            <div className="p-3.5 rounded-xl bg-[#faf6ee] border border-amber-200/70">
                              <div className="text-[11px] font-mono uppercase tracking-wider text-[#92400e] font-bold mb-1">
                                Physical Real-World Analogy
                              </div>
                              <p className="text-[#1c1917] text-sm italic">
                                "{activeCheckpoint.realLifeExample}"
                              </p>
                            </div>
                          )}
                          {activeCheckpoint.contextExplanation && (
                            <div className="text-sm text-[#44403c]">
                              <span className="text-[#326080] font-bold">Engineering Context: </span>
                              {activeCheckpoint.contextExplanation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. THE LARGE CODING PLAYGROUND (SIDE-BY-SIDE 100% REAL CODE) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#57534e]">
                          Side-by-Side 100% Real Code Studio ({getTargetLanguage()})
                        </span>
                        <span className="text-[11px] text-[#78716c] font-normal">
                          Inspect tokens &amp; syllables on left, implement your solution on right
                        </span>
                      </div>
                      
                      {/* Match Status Badge */}
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                          matchStats.percent === 100
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : matchStats.percent > 50
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-white/80 text-[#78716c] border-[#ebdcd0]'
                        }`}>
                          {matchStats.percent}% Reference Aligned ({matchStats.matched}/{matchStats.total} lines)
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[460px]">
                      {/* COLUMN 1: REFERENCE CODE & SYLLABLE DECOMPOSER */}
                      <div className="flex flex-col h-full min-h-[440px]">
                        <InteractiveTokenCodeViewer
                          code={activeCheckpoint.solutionCode || activeCheckpoint.initialCode || ''}
                          language={getTargetLanguage()}
                          onCopyOrInsert={() => setUserCode(activeCheckpoint.solutionCode || activeCheckpoint.initialCode || '')}
                          title="REFERENCE SPECIFICATION"
                          theme="sand"
                        />
                      </div>

                      {/* COLUMN 2: SPACIOUS USER WORKSPACE (MARINA / IVORY) */}
                      <div className="flex flex-col rounded-2xl border border-[#ebdcd0] bg-white overflow-hidden focus-within:border-[#326080] focus-within:ring-2 focus-within:ring-[#B5D2E6]/50 shadow-sm h-full min-h-[440px] transition-all">
                        <div className="h-10 px-4 bg-white/80 border-b border-[#ebdcd0] flex items-center justify-between shrink-0">
                          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1c1917]">
                            <Code2 className="w-4 h-4 text-[#326080]" />
                            <span>YOUR IMPLEMENTATION ({getTargetLanguage()})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setUserCode(activeCheckpoint.initialCode || '')}
                              className="text-[11px] text-[#78716c] hover:text-[#1c1917] px-2.5 py-0.5 rounded-lg bg-white/90 hover:bg-[#f6e7db] border border-[#ebdcd0] transition-colors font-mono"
                              title="Reset to template"
                            >
                              Reset
                            </button>
                            <button
                              type="button"
                              onClick={() => setUserCode(activeCheckpoint.solutionCode || '')}
                              className="text-[11px] text-white px-2.5 py-0.5 rounded-lg bg-[#326080] hover:bg-[#254b66] transition-colors font-mono font-medium shadow-sm"
                              title="Load reference code"
                            >
                              Load Reference
                            </button>
                          </div>
                        </div>

                        <textarea
                          value={userCode}
                          onChange={e => setUserCode(e.target.value)}
                          placeholder={getCodePlaceholder()}
                          className="flex-1 w-full bg-[#ffffff] p-4 text-xs md:text-sm font-mono text-[#0f172a] resize-none outline-none leading-relaxed placeholder-[#a8a29e] min-h-[380px]"
                          spellCheck={false}
                        />
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
                    <div className={`p-4 rounded-2xl border text-sm shadow-sm ${
                      lastEvaluation.passed
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                    }`}>
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
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={handleCheckSubmission}
                      disabled={isSubmitting}
                      className="py-3 px-8 rounded-xl bg-[#326080] hover:bg-[#254b66] text-white font-bold text-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#326080]/20 disabled:opacity-50"
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

                    {lastEvaluation?.passed && currentStepIndex < checkpoints.length - 1 && (
                      <button
                        onClick={handleNextStep}
                        className="py-3 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm active:scale-[0.99] transition-all flex items-center gap-2 shadow-md shadow-emerald-900/20"
                      >
                        <span>Next Engineering Concept</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-[#78716c]">
                  <p>All checkpoints completed!</p>
                </div>
              )}
            </>
          ) : (
            /* ================= FULL FILE TREE & MONACO IDE MODE ================= */
            <div className="flex-1 h-full min-h-[500px]">
              <CodeEditor
                activeFile={activeFile}
                onCodeChange={handleFileContentChange}
                onExplainSelection={(code) => {
                  setFollowupPrompt(`Explain this selected code: ${code}`);
                  handleSendFollowup();
                }}
                onWhyDoesThisExist={(code) => {
                  setFollowupPrompt(`Why does this code exist in our project architecture? ${code.slice(0, 100)}`);
                  handleSendFollowup();
                }}
              />
            </div>
          )}

          {/* Quick Follow-up Question Input at Bottom of Playground */}
          <div className="pt-4 border-t border-[#ebdcd0]">
            <div className="relative rounded-2xl border border-[#ebdcd0] bg-white p-2 focus-within:border-[#326080] transition-colors shadow-sm">
              <input
                type="text"
                value={followupPrompt}
                onChange={e => setFollowupPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSendFollowup();
                }}
                placeholder="Ask AI Tutor anything about this code, tokens, or syllables (e.g. why is std::nan used here?)..."
                className="w-full bg-transparent text-xs md:text-sm text-[#1c1917] outline-none pr-10 pl-2 placeholder-[#a8a29e]"
                disabled={isFollowupLoading}
              />
              <button
                onClick={handleSendFollowup}
                disabled={!followupPrompt.trim() || isFollowupLoading}
                className="absolute right-2.5 top-2.5 p-1 rounded-xl bg-[#326080] text-white hover:bg-[#254b66] disabled:opacity-30 transition-colors shadow-sm"
              >
                {isFollowupLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <ArrowUp className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* PANE 2: COMPANION PREVIEW WINDOW (ASIDE OR SMALL)                       */}
        {/* ----------------------------------------------------------------------- */}
        {isPreviewOpen ? (
          <div className="w-[380px] xl:w-[430px] shrink-0 border-l border-[#ebdcd0] bg-white/95 flex flex-col h-full z-10 animate-fadeIn shadow-sm">
            {/* Companion Browser Toolbar */}
            <div className="h-12 px-3 border-b border-[#ebdcd0] flex items-center justify-between shrink-0 bg-white/80">
              <div className="flex items-center gap-1.5 text-xs text-[#1c1917] font-bold">
                <Eye className="w-3.5 h-3.5 text-[#326080]" />
                <span>Live Preview Sandbox</span>
              </div>

              {/* URL bar & device toggle */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center p-0.5 rounded-lg bg-white border border-[#ebdcd0]">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1 rounded ${previewDevice === 'desktop' ? 'bg-[#326080] text-white' : 'text-[#78716c] hover:text-[#1c1917]'}`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1 rounded ${previewDevice === 'mobile' ? 'bg-[#326080] text-white' : 'text-[#78716c] hover:text-[#1c1917]'}`}
                    title="Mobile Preview"
                  >
                    <Smartphone className="w-3 h-3" />
                  </button>
                </div>

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
                  title="Minimize Preview Window"
                >
                  <PanelRightClose className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Live Preview Container */}
            <div className="flex-1 relative overflow-hidden bg-white/50 flex items-center justify-center p-2">
              <div className={`w-full h-full rounded-2xl overflow-hidden shadow-lg transition-all ${
                previewDevice === 'mobile' ? 'max-w-[320px] max-h-[580px] border border-[#ebdcd0] rounded-3xl' : ''
              }`}>
                <LivePreview
                  key={previewKey}
                  files={project.files}
                  onElementInspected={handleElementInspected}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Minimized Preview Strip */
          <div className="w-10 border-l border-[#ebdcd0] bg-white/95 flex flex-col items-center py-4 shrink-0 select-none">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="p-2 rounded-xl bg-[#f6e7db] hover:bg-[#ebdcd0] text-[#326080] shadow-sm transition-colors"
              title="Expand Companion Live Preview"
            >
              <PanelRightOpen className="w-4 h-4 text-[#326080]" />
            </button>
            <span 
              onClick={() => setIsPreviewOpen(true)}
              className="mt-6 text-[10px] font-mono uppercase tracking-widest text-[#78716c] rotate-90 whitespace-nowrap cursor-pointer hover:text-[#1c1917]"
            >
              Live Preview
            </span>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SLIDE-OVER AI TUTOR DRAWER                                              */}
        {/* ----------------------------------------------------------------------- */}
        {isTutorDrawerOpen && (
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[400px] z-30 bg-[#FFF1E7]/95 backdrop-blur-xl border-l border-[#ebdcd0] shadow-2xl flex flex-col animate-slideIn">
            <div className="h-14 px-4 border-b border-[#ebdcd0] flex items-center justify-between shrink-0 bg-white/70">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#326080] to-[#487a9e] flex items-center justify-center shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-extrabold text-sm text-[#1c1917]">AI Co-Developer Tutor</span>
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
                  className={`flex gap-2.5 text-xs ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-[#326080] text-white'
                        : 'bg-[#faf6ee] text-[#1c1917] border border-[#ebdcd0]'
                    }`}
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
              text: `🚀 Successfully imported "${importedProj.name}" with ${importedProj.files.length} files. All files are loaded and ready for step-by-step line learning!`
            }
          ]);
        }}
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
