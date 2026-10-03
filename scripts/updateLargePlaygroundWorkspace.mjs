import fs from 'fs';
import path from 'path';

const workspacePath = path.resolve('components/vercel/VercelWorkspace.tsx');

const workspaceContent = `'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectFile, ProjectStats } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone, Hint } from '@/types/learning';
import { AISettings, ConceptExplanation, ValidationEvaluation } from '@/types/ai';
import { aiService } from '@/lib/ai/provider';
import { calculateProjectOwnership } from '@/lib/learning/ownershipTracker';
import { validateCheckpointSubmission } from '@/lib/learning/validator';
import { InteractiveTokenCodeViewer } from '@/components/learning/InteractiveTokenCodeViewer';

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
  X
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

  // Main Workspace Mode: 'playground' (large learning studio) vs 'files' (full multi-file Monaco IDE)
  const [workspaceMode, setWorkspaceMode] = useState<'playground' | 'files'>('playground');

  // Preview panel aside/small controls
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(true);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState<number>(0);

  // Interactive Task state for current checkpoint
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

  // Dynamic Assistant Greeting based on chosen stack
  const stackLanguage = initialProject.techStack?.language || 'JavaScript';
  const stackFramework = initialProject.techStack?.framework || '';
  const initialGreeting = initialProject.techStack?.runtime?.includes('Terminal') || initialProject.techStack?.runtime?.includes('g++') || initialProject.techStack?.runtime?.includes('OpenJDK') || initialProject.techStack?.runtime?.includes('Python')
    ? \`I've architected your application in \${stackLanguage} (\${initialProject.techStack.runtime}). The environment and live terminal runner are initialized on the right. Let's master the core engineering concepts together in your large coding playground!\`
    : \`I've architected your application with \${stackLanguage}\${stackFramework ? \` and \${stackFramework}\` : ''}. The live sandbox is running on the right. Now let's write the core code and master the concepts together!\`;

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

  // Modals state
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [activeExplanation, setActiveExplanation] = useState<ConceptExplanation | null>(null);
  const [isKnowledgeGraphOpen, setIsKnowledgeGraphOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiSettings, setAiSettings] = useState<AISettings>({ provider: 'builtin' });

  const activeCheckpoint = checkpoints[currentStepIndex] || null;
  const activeFile = project.files.find(f => f.id === project.activeFileId) || project.files[0] || null;

  // Calculate ownership stats
  const stats: ProjectStats = calculateProjectOwnership(project);
  stats.checkpointsCompleted = checkpoints.filter(c => c.status === 'COMPLETED').length;
  stats.totalCheckpoints = checkpoints.length;

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Sync state when checkpoint changes
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

  // Dynamic target language and placeholder detection
  const getTargetLanguage = () => {
    if (activeCheckpoint?.language) {
      if (activeCheckpoint.language === 'cpp') return 'C++';
      if (activeCheckpoint.language === 'java') return 'Java';
      if (activeCheckpoint.language === 'python') return 'Python';
      if (activeCheckpoint.language === 'javascript') return 'JavaScript';
      if (activeCheckpoint.language === 'css') return 'CSS';
      if (activeCheckpoint.language === 'html') return 'HTML';
    }
    const target = project.files.find(f => f.id === activeCheckpoint?.targetFileId);
    const name = target?.name || '';
    if (name.endsWith('.cpp') || name.endsWith('.h')) return 'C++';
    if (name.endsWith('.java')) return 'Java';
    if (name.endsWith('.css') || activeCheckpoint?.conceptId.includes('css')) return 'CSS';
    if (name.endsWith('.js') || activeCheckpoint?.conceptId.includes('dom') || project.techStack?.language === 'JavaScript') return 'JavaScript';
    if (name.endsWith('.py') || activeCheckpoint?.conceptId.includes('python')) return 'Python';
    if (name.endsWith('.html')) return 'HTML';
    return project.techStack?.language || 'TypeScript';
  };

  const getCodePlaceholder = () => {
    const lang = getTargetLanguage();
    if (lang === 'C++') return '// Write your C++ calculate implementation here (e.g. switch(op) { case ... })...';
    if (lang === 'Java') return '// Write your Java calculate implementation here (e.g. switch(op) { case ... })...';
    if (lang === 'CSS') return '/* Write your CSS rules here... */';
    if (lang === 'JavaScript') return '// Write your JavaScript code here...';
    if (lang === 'Python') return '# Write your Python code here...';
    if (lang === 'HTML') return '<!-- Write your HTML markup here... -->';
    return '// Write your TypeScript code here...';
  };

  // Progressive Hint Revealer
  const handleRevealNextHint = () => {
    if (!activeCheckpoint) return;
    if (revealedHintIndex < activeCheckpoint.hints.length) {
      setRevealedHintIndex(prev => prev + 1);
    }
  };

  // Submit and Validate Checkpoint
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
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Update checkpoint status to COMPLETED
        setCheckpoints(prev =>
          prev.map(c => c.id === activeCheckpoint.id ? { ...c, status: 'COMPLETED' } : c)
        );

        // Update corresponding project file with student's verified code
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

        // Add notification message in chat
        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: \`🎉 Outstanding! You successfully mastered "\${activeCheckpoint.conceptName}". \${evaluation.message}\`
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

  // Next Checkpoint Step
  const handleNextStep = () => {
    if (currentStepIndex < checkpoints.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  // Handle User Follow-up Question/Prompt
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
        aiSettings
      );

      setChatMessages(prev => [...prev, { role: 'assistant', text: resp.text }]);
    } catch {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: \`Here is how that works in \${project.name}: we keep our core logic modular and predictable. You can inspect the code anytime in your large playground.\`
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

  return (
    <div className="flex flex-col h-screen w-screen bg-[#030712] text-[#f4f4f5] overflow-hidden font-sans select-none antialiased relative">
      {/* Background Micro-Dot Canvas */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 z-0" 
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} 
      />

      {/* ========================================================================= */}
      {/* TOP GLOBAL BAR: Project Info, Mode Switcher, Ownership, Preview Toggle    */}
      {/* ========================================================================= */}
      <header className="h-14 px-4 md:px-6 border-b border-zinc-800 bg-[#08090e]/90 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={onReturnToLanding}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Return to Projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-white">{project.name}</span>
            <span className="text-[10px] font-mono uppercase bg-zinc-800/80 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700">
              {getTargetLanguage()}
            </span>
          </div>

          {/* Mode Switcher: Playground vs File IDE */}
          <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs ml-2">
            <button
              onClick={() => setWorkspaceMode('playground')}
              className={\`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium \${
                workspaceMode === 'playground'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }\`}
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Coding Playground</span>
            </button>
            <button
              onClick={() => setWorkspaceMode('files')}
              className={\`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium \${
                workspaceMode === 'files'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }\`}
            >
              <FileCode className="w-3.5 h-3.5 text-zinc-400" />
              <span>Full File Tree</span>
            </button>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2">
          {/* Ownership Pill */}
          <div 
            className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono"
            title="Code Ownership: Human vs AI"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-semibold">{stats.userPercentage}% You</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400">{100 - stats.userPercentage}% AI</span>
          </div>

          {/* AI Tutor Chat Toggle Button */}
          <button
            onClick={() => setIsTutorDrawerOpen(!isTutorDrawerOpen)}
            className={\`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors \${
              isTutorDrawerOpen 
                ? 'bg-indigo-950/80 border-indigo-500/60 text-indigo-200' 
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-white'
            }\`}
            title="Toggle AI Co-Developer Chat Drawer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
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
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Deep Concept Explanation"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsKnowledgeGraphOpen(true)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Knowledge Graph & Mastery"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsTimelineOpen(true)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Project Roadmap & Milestones"
          >
            <CheckCheck className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="AI & Environment Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Toggle Preview Window (Aside / Small) */}
          <button
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ml-1 \${
              isPreviewOpen
                ? 'bg-zinc-800 text-white border-zinc-700'
                : 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
            }\`}
            title={isPreviewOpen ? "Minimize Preview Window" : "Open Companion Preview Window"}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isPreviewOpen ? 'Preview Aside' : 'Open Preview'}</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN BODY: LARGE CODING PLAYGROUND (70-75%) + COMPANION PREVIEW (25-30%) */}
      {/* ========================================================================= */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ----------------------------------------------------------------------- */}
        {/* PANE 1: THE LARGE CODING PLAYGROUND & EXPLANATION STUDIO               */}
        {/* ----------------------------------------------------------------------- */}
        <div className="flex-1 flex flex-col h-full bg-[#030712] overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 space-y-6">
          
          {workspaceMode === 'playground' ? (
            /* ================= PLAYGROUND MODE (DEFAULT) ================= */
            <>
              {activeCheckpoint ? (
                <>
                  {/* 1. Header Card: Concept & Step Objectives */}
                  <div className="rounded-2xl border border-zinc-800 bg-[#08090e]/95 p-5 shadow-xl relative overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono uppercase tracking-wider text-indigo-300 font-bold bg-indigo-950/80 border border-indigo-800/60 px-2.5 py-1 rounded-full">
                          Step {currentStepIndex + 1} of {checkpoints.length}
                        </span>
                        <span className="text-sm text-zinc-300 font-semibold">
                          {activeCheckpoint.conceptName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {activeCheckpoint.targetFileId && (
                          <div className="flex items-center gap-1.5 text-xs font-mono bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800">
                            <span className="text-zinc-500">Target File:</span>
                            <span className="text-emerald-400 font-semibold">
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
                          className="text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Explain in Detail</span>
                        </button>
                      </div>
                    </div>

                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-2">
                      {activeCheckpoint.title}
                    </h2>
                    <p className="text-sm text-zinc-300 leading-relaxed max-w-4xl">
                      {activeCheckpoint.prompt}
                    </p>
                  </div>

                  {/* 2. Real-Life Analogy & Architectural Context Accordion */}
                  {(activeCheckpoint.realLifeExample || activeCheckpoint.contextExplanation) && (
                    <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 overflow-hidden shadow-lg transition-all">
                      <button
                        type="button"
                        onClick={() => setIsAnalogyExpanded(!isAnalogyExpanded)}
                        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-purple-950/30 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">🌍</span>
                          <span className="text-sm font-bold text-purple-200">
                            Real-Life Analogy &amp; Why This Code Exists
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-purple-400 font-semibold font-mono">
                          <span>{isAnalogyExpanded ? 'Collapse' : 'Expand Analogy'}</span>
                          <ChevronDown className={\`w-4 h-4 transition-transform \${isAnalogyExpanded ? 'rotate-180' : ''}\`} />
                        </div>
                      </button>

                      {isAnalogyExpanded && (
                        <div className="px-5 pb-5 pt-1 space-y-3 border-t border-purple-900/30 text-sm text-zinc-300 leading-relaxed">
                          {activeCheckpoint.realLifeExample && (
                            <div className="p-3.5 rounded-xl bg-[#07090e]/95 border border-purple-800/40">
                              <div className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-bold mb-1">
                                Physical Real-World Analogy
                              </div>
                              <p className="text-zinc-200 text-sm italic">
                                "{activeCheckpoint.realLifeExample}"
                              </p>
                            </div>
                          )}
                          {activeCheckpoint.contextExplanation && (
                            <div className="text-sm text-zinc-300">
                              <span className="text-purple-300 font-bold">Engineering Context: </span>
                              {activeCheckpoint.contextExplanation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. THE LARGE CODING PLAYGROUND (SPACIOUS 2-COLUMN GRID) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                          Interactive Coding Studio ({getTargetLanguage()})
                        </span>
                        <span className="text-[11px] text-zinc-500 font-normal">
                          Inspect tokens on the left, implement your solution on the right
                        </span>
                      </div>
                      <span className="text-xs text-indigo-400 font-mono">
                        {userCode.trim().length > 0 ? \`\${userCode.split('\\n').length} lines written\` : 'Ready'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[460px]">
                      {/* COLUMN 1: REFERENCE CODE & TOKEN INSPECTOR */}
                      <div className="flex flex-col h-full min-h-[440px]">
                        <InteractiveTokenCodeViewer
                          code={activeCheckpoint.solutionCode || activeCheckpoint.initialCode || ''}
                          language={getTargetLanguage()}
                          onCopyOrInsert={() => setUserCode(activeCheckpoint.solutionCode || activeCheckpoint.initialCode || '')}
                          title="REFERENCE CODE"
                        />
                      </div>

                      {/* COLUMN 2: SPACIOUS USER WORKSPACE */}
                      <div className="flex flex-col rounded-xl border border-zinc-700/80 bg-[#07090e] overflow-hidden focus-within:border-indigo-400 shadow-2xl h-full min-h-[440px]">
                        <div className="h-9 px-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between shrink-0">
                          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-200">
                            <Code2 className="w-4 h-4 text-emerald-400" />
                            <span>YOUR WORKSPACE ({getTargetLanguage()})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setUserCode(activeCheckpoint.initialCode || '')}
                              className="text-[10px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors font-mono"
                              title="Reset to template"
                            >
                              Reset
                            </button>
                            <button
                              type="button"
                              onClick={() => setUserCode(activeCheckpoint.solutionCode || '')}
                              className="text-[10px] text-indigo-300 hover:text-white px-2 py-0.5 rounded bg-indigo-950/80 hover:bg-indigo-900 transition-colors font-mono border border-indigo-800/50"
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
                          className="flex-1 w-full bg-[#04060a] p-4 text-xs md:text-sm font-mono text-emerald-400 resize-none outline-none leading-relaxed placeholder-zinc-600 min-h-[380px]"
                          spellCheck={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Progressive Hints Tier */}
                  {activeCheckpoint.hints && activeCheckpoint.hints.length > 0 && (
                    <div className="rounded-xl border border-zinc-800 bg-[#08090e] p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={handleRevealNextHint}
                          disabled={revealedHintIndex >= activeCheckpoint.hints.length}
                          className="text-xs text-zinc-300 hover:text-amber-400 flex items-center gap-2 transition-colors disabled:opacity-40 font-medium"
                        >
                          <Lightbulb className="w-4 h-4 text-amber-400" />
                          <span>Need Guidance? Reveal Progressive Hint ({revealedHintIndex}/{activeCheckpoint.hints.length})</span>
                        </button>
                        {revealedHintIndex > 0 && (
                          <span className="text-[11px] font-mono text-amber-400/90">
                            Hint Level {revealedHintIndex} Active
                          </span>
                        )}
                      </div>

                      {revealedHintIndex > 0 && (
                        <div className="space-y-2 pt-1">
                          {activeCheckpoint.hints.slice(0, revealedHintIndex).map((hint: Hint, hIdx: number) => (
                            <div 
                              key={hIdx}
                              className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200/90 flex items-start gap-2.5"
                            >
                              <span className="font-bold text-amber-400 font-mono text-[10px] mt-0.5">
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
                    <div className={\`p-4 rounded-xl border text-sm \${
                      lastEvaluation.passed
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                        : 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                    }\`}>
                      <div className="flex items-center gap-2 font-bold mb-1">
                        {lastEvaluation.passed ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span>All Tests Passed! Excellent Job.</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5 text-rose-400" />
                            <span>{lastEvaluation.title || 'Tests Incomplete. Keep Going!'}</span>
                          </>
                        )}
                      </div>
                      <p className="text-zinc-300 leading-relaxed mb-1.5 text-xs md:text-sm">
                        {lastEvaluation.message}
                      </p>
                      {lastEvaluation.diagnostic?.suggestedHint && !lastEvaluation.passed && (
                        <p className="text-amber-300/90 text-xs italic">
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
                      className="py-3 px-8 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-black" />
                          <span>Verifying Tests...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-black" />
                          <span>Run &amp; Validate Code</span>
                        </>
                      )}
                    </button>

                    {lastEvaluation?.passed && currentStepIndex < checkpoints.length - 1 && (
                      <button
                        onClick={handleNextStep}
                        className="py-3 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm active:scale-[0.99] transition-all flex items-center gap-2 shadow-lg shadow-emerald-950"
                      >
                        <span>Next Engineering Concept</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-zinc-400">
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
                  setFollowupPrompt(\`Explain this selected code: \${code}\`);
                  handleSendFollowup();
                }}
                onWhyDoesThisExist={(code) => {
                  setFollowupPrompt(\`Why does this code exist in our project architecture? \${code.slice(0, 100)}\`);
                  handleSendFollowup();
                }}
              />
            </div>
          )}

          {/* Quick Follow-up Question Input at Bottom of Playground */}
          <div className="pt-4 border-t border-zinc-800">
            <div className="relative rounded-xl border border-zinc-800 bg-[#08090d] p-2 focus-within:border-zinc-500 transition-colors">
              <input
                type="text"
                value={followupPrompt}
                onChange={e => setFollowupPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSendFollowup();
                }}
                placeholder="Ask AI Tutor anything about this code or concept (e.g. why is std::nan used here?)..."
                className="w-full bg-transparent text-xs md:text-sm text-zinc-200 outline-none pr-10 pl-2 placeholder-zinc-500"
                disabled={isFollowupLoading}
              />
              <button
                onClick={handleSendFollowup}
                disabled={!followupPrompt.trim() || isFollowupLoading}
                className="absolute right-2.5 top-2.5 p-1 rounded-lg bg-white text-black hover:bg-zinc-200 disabled:opacity-30 transition-colors"
              >
                {isFollowupLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <ArrowUp className="w-4 h-4 text-black" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* PANE 2: COMPANION PREVIEW WINDOW (ASIDE OR SMALL: 380px - 420px)        */}
        {/* ----------------------------------------------------------------------- */}
        {isPreviewOpen ? (
          <div className="w-[380px] xl:w-[430px] shrink-0 border-l border-zinc-800 bg-[#050608] flex flex-col h-full z-10 animate-fadeIn">
            {/* Companion Browser Toolbar */}
            <div className="h-12 px-3 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-[#08090d]">
              <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Preview</span>
              </div>

              {/* URL bar & device toggle */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center p-0.5 rounded-md bg-zinc-900 border border-zinc-800">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={\`p-1 rounded \${previewDevice === 'desktop' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}\`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={\`p-1 rounded \${previewDevice === 'mobile' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}\`}
                    title="Mobile Preview"
                  >
                    <Smartphone className="w-3 h-3" />
                  </button>
                </div>

                <button 
                  onClick={() => setPreviewKey(k => k + 1)}
                  className="p-1 hover:text-white text-zinc-400 transition-colors rounded hover:bg-zinc-800"
                  title="Reload Preview Sandbox"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1 hover:text-white text-zinc-400 transition-colors rounded hover:bg-zinc-800 ml-1"
                  title="Minimize Preview Window"
                >
                  <PanelRightClose className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Live Preview Container */}
            <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center p-2">
              <div className={\`w-full h-full rounded-xl overflow-hidden shadow-2xl transition-all \${
                previewDevice === 'mobile' ? 'max-w-[320px] max-h-[580px] border border-zinc-800 rounded-3xl' : ''
              }\`}>
                <LivePreview
                  key={previewKey}
                  project={project}
                  activeCheckpoint={activeCheckpoint}
                  device={previewDevice}
                  onInspectElement={() => {}}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Minimized Preview Strip */
          <div className="w-10 border-l border-zinc-800 bg-[#08090d] flex flex-col items-center py-4 shrink-0 select-none">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white shadow-md transition-colors"
              title="Expand Companion Live Preview"
            >
              <PanelRightOpen className="w-4 h-4 text-indigo-400" />
            </button>
            <span 
              onClick={() => setIsPreviewOpen(true)}
              className="mt-6 text-[10px] font-mono uppercase tracking-widest text-zinc-500 rotate-90 whitespace-nowrap cursor-pointer hover:text-zinc-300"
            >
              Live Preview
            </span>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SLIDE-OVER AI TUTOR DRAWER                                              */}
        {/* ----------------------------------------------------------------------- */}
        {isTutorDrawerOpen && (
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[400px] z-30 bg-[#08090d]/95 backdrop-blur-xl border-l border-zinc-800 shadow-2xl flex flex-col animate-slideIn">
            <div className="h-14 px-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-sm text-white">AI Co-Developer Tutor</span>
              </div>
              <button
                onClick={() => setIsTutorDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
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
                        ? 'bg-zinc-800 text-white border border-zinc-700'
                        : 'bg-zinc-900 text-zinc-200 border border-zinc-800'
                    }\`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-zinc-800 bg-[#06070a]">
              <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 p-2 focus-within:border-zinc-500">
                <input
                  type="text"
                  value={followupPrompt}
                  onChange={e => setFollowupPrompt(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSendFollowup();
                  }}
                  placeholder="Ask a question..."
                  className="w-full bg-transparent text-xs text-white outline-none pr-8 pl-1 placeholder-zinc-500"
                />
                <button
                  onClick={handleSendFollowup}
                  disabled={!followupPrompt.trim() || isFollowupLoading}
                  className="absolute right-2 top-2 p-1 rounded-lg bg-white text-black hover:bg-zinc-200 disabled:opacity-30"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Deep-Dive Modals */}
      <ExplanationModal
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
        explanation={activeExplanation}
      />
      <KnowledgeGraphModal
        isOpen={isKnowledgeGraphOpen}
        onClose={() => setIsKnowledgeGraphOpen(false)}
        checkpoints={checkpoints}
        currentStepIndex={currentStepIndex}
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
      />
    </div>
  );
};
`;

fs.writeFileSync(workspacePath, workspaceContent, 'utf8');
console.log('Successfully updated VercelWorkspace.tsx into a Large Coding Playground with companion preview aside');
