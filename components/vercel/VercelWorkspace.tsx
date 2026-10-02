'use client';

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
  Loader2
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

  // Right Canvas View: 'preview' or 'code'
  const [canvasView, setCanvasView] = useState<'preview' | 'code'>('preview');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState<number>(0);

  // Interactive Task state for current checkpoint
  const [userCode, setUserCode] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [explanationText, setExplanationText] = useState<string>('');
  const [revealedHintIndex, setRevealedHintIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState<ValidationEvaluation | null>(null);
  const [solutionUnlocked, setSolutionUnlocked] = useState(false);

  // Bottom prompt input for follow-up refinement/questions
  const [followupPrompt, setFollowupPrompt] = useState('');
  const [isFollowupLoading, setIsFollowupLoading] = useState(false);
  const [isAnalogyExpanded, setIsAnalogyExpanded] = useState<boolean>(true);

  // Dynamic Assistant Greeting based on chosen stack
  const stackLanguage = initialProject.techStack?.language || 'JavaScript';
  const stackFramework = initialProject.techStack?.framework || '';
  const initialGreeting = initialProject.techStack?.runtime?.includes('Terminal') || initialProject.techStack?.runtime?.includes('g++') || initialProject.techStack?.runtime?.includes('OpenJDK') || initialProject.techStack?.runtime?.includes('Python')
    ? `I've architected your application in ${stackLanguage} (${initialProject.techStack.runtime}). The environment and live terminal runner are initialized on the right. Let's master the core engineering concepts together step by step!`
    : `I've architected your application with ${stackLanguage}${stackFramework ? ` and ${stackFramework}` : ''}. The live sandbox is running on the right. Now let's build the core engineering concepts together step by step!`;

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
        setUserCode(activeCheckpoint.brokenCode || activeCheckpoint.initialCode || '');
      } else {
        setUserCode(activeCheckpoint.initialCode || '');
      }
      setSelectedOption('');
      setExplanationText('');
      setRevealedHintIndex(0);
      setLastEvaluation(null);
      setSolutionUnlocked(false);

      if (activeCheckpoint.targetFileId) {
        setProject(prev => ({ ...prev, activeFileId: activeCheckpoint.targetFileId }));
      }
    }
  }, [activeCheckpoint?.id]);

  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMessages, lastEvaluation, revealedHintIndex]);

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

  // Handle Code-to-Preview Connection (Visual Inspector)
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
          origin: { y: 0.7 }
        });

        // Update checkpoint status to COMPLETED
        setCheckpoints(prev => prev.map((cp, idx) => 
          idx === currentStepIndex ? { ...cp, status: 'COMPLETED' } : cp
        ));

        // Add to mastered concepts
        if (!masteredConceptIds.includes(activeCheckpoint.conceptId)) {
          setMasteredConceptIds(prev => [...prev, activeCheckpoint.conceptId]);
        }

        // Apply completed code to the active file if applicable
        if (activeCheckpoint.targetFileId && activeCheckpoint.solutionCode) {
          setProject(prev => {
            const updatedFiles = prev.files.map(f => {
              if (f.id === activeCheckpoint.targetFileId) {
                const newContent = f.content.includes(activeCheckpoint.initialCode || '')
                  ? f.content.replace(activeCheckpoint.initialCode || '', userCode)
                  : f.content;
                return {
                  ...f,
                  content: newContent !== f.content ? newContent : f.content,
                  contributions: [
                    ...f.contributions,
                    {
                      id: `contrib-${Date.now()}`,
                      fileId: f.id,
                      startLine: 1,
                      endLine: (userCode.split('\n').length || 1) + 5,
                      authorType: 'USER_WRITTEN' as const,
                      timestamp: Date.now(),
                      conceptId: activeCheckpoint.conceptId,
                    }
                  ]
                };
              }
              return f;
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
            text: `🎉 Outstanding! You successfully mastered "${activeCheckpoint.conceptName}". ${evaluation.message}`
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
          investigationSteps: ['Check for unclosed braces', 'Ensure valid TypeScript syntax'],
          suggestedHint: 'Verify that syntax conforms to modern TypeScript.'
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
          text: `Here is how that works in ${project.name}: we keep our React state localized in App.tsx to ensure predictable unidirectional data flow. You can inspect the code anytime in the Code tab on the right.`
        }
      ]);
    } finally {
      setIsFollowupLoading(false);
    }
  };

  // Handle direct file edits in the Code tab
  const handleFileContentChange = (newContent: string) => {
    if (!activeFile) return;
    setProject(prev => ({
      ...prev,
      files: prev.files.map(f => f.id === activeFile.id ? { ...f, content: newContent } : f)
    }));
  };

  const handleSelectFile = (fileId: string) => {
    setProject(prev => ({ ...prev, activeFileId: fileId }));
  };

  return (
    <div className="flex h-screen w-screen bg-[#030712] text-[#f4f4f5] overflow-hidden font-sans select-none antialiased relative">
      {/* Award-winning micro-dot background grid canvas */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 z-0" 
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} 
      />
      {/* ========================================================================= */}
      {/* LEFT PANE: Vercel-style Conversation, Guidance & Learning Stream (42-45%) */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[520px] xl:w-[620px] shrink-0 border-r border-[#1f2430] bg-[#05070f]/95 backdrop-blur-md flex flex-col h-full z-10">
        
        {/* Top Header Bar */}
        <header className="h-14 px-4 border-b border-[#27272a] flex items-center justify-between shrink-0 bg-[#09090b]/80 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={onReturnToLanding}
              className="p-1.5 rounded-md hover:bg-[#27272a] text-[#a1a1aa] hover:text-white transition-colors"
              title="Return to Projects"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white">{project.name}</span>
              <span className="text-[10px] font-mono uppercase bg-[#27272a] text-[#a1a1aa] px-1.5 py-0.5 rounded border border-[#3f3f46]">
                Nirmaan
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Ownership Pill */}
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-xs font-mono"
              title="Code Ownership: Human vs AI"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 font-medium">{stats.userPercentage}% You</span>
              <span className="text-[#71717a]">/</span>
              <span className="text-[#a1a1aa]">{100 - stats.userPercentage}% AI</span>
            </div>

            {/* Quick action buttons */}
            <button
              onClick={() => setIsKnowledgeGraphOpen(true)}
              className="p-1.5 rounded-md hover:bg-[#27272a] text-[#a1a1aa] hover:text-white transition-colors"
              title="Knowledge Graph & Mastery"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsTimelineOpen(true)}
              className="p-1.5 rounded-md hover:bg-[#27272a] text-[#a1a1aa] hover:text-white transition-colors"
              title="Project Roadmap & Milestones"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-md hover:bg-[#27272a] text-[#a1a1aa] hover:text-white transition-colors"
              title="AI & Environment Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Conversation & Active Checkpoint Stream */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-5 custom-scrollbar">
          
          {/* Conversation history items */}
          {chatMessages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex gap-3 text-sm ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-cyan-600 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-[#27272a] text-white border border-[#3f3f46]'
                    : 'bg-[#18181b] text-[#e4e4e7] border border-[#27272a]'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Active Interactive Learning Checkpoint Card */}
          {activeCheckpoint && (
            <div className="rounded-2xl border border-indigo-500/30 bg-[#121216] p-4.5 shadow-xl shadow-indigo-950/20 relative overflow-hidden">
              {/* Subtle top glow */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
              
              {/* Step indicator header */}
              <div className="flex items-center justify-between mb-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold bg-indigo-950/70 border border-indigo-800/50 px-2 py-0.5 rounded-full">
                    Step {currentStepIndex + 1} of {checkpoints.length}
                  </span>
                  <span className="text-xs text-[#a1a1aa] font-medium">
                    {activeCheckpoint.conceptName}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const exp = aiService.getConceptExplanation(activeCheckpoint.conceptId, 'beginner');
                    setActiveExplanation(exp);
                    setIsExplanationOpen(true);
                  }}
                  className="text-xs text-[#a1a1aa] hover:text-white flex items-center gap-1 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Explain</span>
                </button>
              </div>

              {/* Title & Goal */}
              <h3 className="text-base font-semibold text-white mb-1.5">
                {activeCheckpoint.title}
              </h3>
              <p className="text-xs text-[#a1a1aa] mb-3.5 leading-relaxed">
                {activeCheckpoint.prompt}
              </p>

              {/* Target File context pill */}
              {activeCheckpoint.targetFileId && (
                <div className="mb-3 flex items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-[#18181b] text-emerald-400 font-semibold uppercase text-[10px] border border-[#27272a]">
                    {getTargetLanguage()}
                  </span>
                  <span className="text-[#71717a]">Target: </span>
                  <span className="text-indigo-300 font-semibold">
                    {project.files.find(f => f.id === activeCheckpoint.targetFileId)?.name || 'style.css'}
                  </span>
                </div>
              )}

              {/* Real-Life Analogy & Concept Explanation Accordion */}
              {(activeCheckpoint.realLifeExample || activeCheckpoint.contextExplanation) && (
                <div className="mb-4 rounded-xl border border-purple-500/30 bg-purple-950/20 overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => setIsAnalogyExpanded(!isAnalogyExpanded)}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-purple-950/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🌍</span>
                      <span className="text-xs font-semibold text-purple-200">
                        Real-Life Analogy &amp; Explanation
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-purple-400 font-medium">
                      <span>{isAnalogyExpanded ? 'Hide' : 'Show Analogy'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isAnalogyExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {isAnalogyExpanded && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-2 border-t border-purple-900/30 text-xs text-slate-300 leading-relaxed">
                      {activeCheckpoint.realLifeExample && (
                        <div className="p-2.5 rounded-lg bg-[#07090e]/90 border border-purple-800/30">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold mb-1">
                            Tangible Real-Life Example
                          </div>
                          <p className="text-slate-200 text-xs italic">
                            "{activeCheckpoint.realLifeExample}"
                          </p>
                        </div>
                      )}
                      {activeCheckpoint.contextExplanation && (
                        <div className="text-xs text-slate-300">
                          <span className="text-purple-300 font-medium">Why this code exists: </span>
                          {activeCheckpoint.contextExplanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Interactive Task Form Area */}
              <div className="mb-4">
                {/* Code-based tasks: COMPLETE_CODE, WRITE_SCRATCH, FIX_BUG */}
                {(activeCheckpoint.taskType === 'COMPLETE_CODE' ||
                  activeCheckpoint.taskType === 'WRITE_SCRATCH' ||
                  activeCheckpoint.taskType === 'FIX_BUG') && (
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2 shadow-sm">
                      <Sparkles className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white">Interactive Guided Practice:</span>
                        <span className="ml-1 text-zinc-400">
                          Bring cursor to any line in the reference code to view instant explanations and jump to official external documentation (MDN, cppreference, Python docs, Oracle Java). Type the code into your workspace on the right to master syntax.
                        </span>
                      </div>
                    </div>

                    {/* Side-by-side layout: Reference Code on left, User Workspace on right */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                      {/* COLUMN 1: INTERACTIVE REFERENCE CODE WITH TOKEN & LINE INSPECTION */}
                      <div className="flex flex-col">
                        <InteractiveTokenCodeViewer
                          code={activeCheckpoint.solutionCode || activeCheckpoint.initialCode || ''}
                          language={getTargetLanguage()}
                          onCopyOrInsert={() => setUserCode(activeCheckpoint.solutionCode || activeCheckpoint.initialCode || '')}
                          title="REFERENCE CODE"
                        />
                      </div>

                      {/* COLUMN 2: USER WORKSPACE */}
                      <div className="flex flex-col rounded-xl border border-zinc-800 bg-[#08090d] overflow-hidden focus-within:border-zinc-500 shadow-2xl">
                        <div className="h-8 px-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-zinc-200">
                            <Code2 className="w-3 h-3 text-zinc-400" />
                            <span>YOUR WORKSPACE ({getTargetLanguage()})</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {userCode.trim().length > 0 ? `${userCode.split('\n').length} lines` : 'Type code here'}
                          </span>
                        </div>
                        <textarea
                          value={userCode}
                          onChange={e => setUserCode(e.target.value)}
                          placeholder={getCodePlaceholder()}
                          rows={8}
                          className="w-full bg-[#04060a] p-3 text-xs font-mono text-emerald-400 resize-none outline-none leading-relaxed placeholder-slate-600 min-h-[140px]"
                          spellCheck={false}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Multiple choice: PREDICT_OUTPUT, CHOOSE_APPROACH */}
                {(activeCheckpoint.taskType === 'PREDICT_OUTPUT' || 
                  activeCheckpoint.taskType === 'CHOOSE_APPROACH') && (
                  <div className="space-y-2">
                    {(activeCheckpoint.initialCode || activeCheckpoint.brokenCode) && (
                      <div className="mb-2">
                        <InteractiveTokenCodeViewer
                          code={activeCheckpoint.initialCode || activeCheckpoint.brokenCode || ''}
                          language={getTargetLanguage()}
                          title="CODE SNIPPET"
                        />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      {activeCheckpoint.multipleChoiceOptions?.map((opt, i: number) => (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedOption(opt.id)}
                          className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-start gap-2.5 ${
                            selectedOption === opt.id
                              ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-sm'
                              : 'bg-[#18181b] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46] hover:text-[#e4e4e7]'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-mono ${
                            selectedOption === opt.id ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-[#3f3f46]'
                          }`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span>{opt.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Natural Language Explanation: EXPLAIN_CODE */}
                {activeCheckpoint.taskType === 'EXPLAIN_CODE' && (
                  <div className="space-y-2">
                    {(activeCheckpoint.initialCode || activeCheckpoint.brokenCode) && (
                      <div className="mb-2">
                        <InteractiveTokenCodeViewer
                          code={activeCheckpoint.initialCode || activeCheckpoint.brokenCode || ''}
                          language={getTargetLanguage()}
                          title="CODE SNIPPET"
                        />
                      </div>
                    )}
                    <textarea
                      value={explanationText}
                      onChange={e => setExplanationText(e.target.value)}
                      placeholder="Explain in your own words what this code does and why..."
                      rows={4}
                      className="w-full bg-[#0c0c0e] border border-[#27272a] rounded-lg p-3 text-xs text-[#f4f4f5] outline-none focus:border-indigo-500 placeholder-[#3f3f46]"
                    />
                  </div>
                )}
              </div>

              {/* Hints Drawer */}
              {activeCheckpoint.hints && activeCheckpoint.hints.length > 0 && (
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleRevealNextHint}
                      disabled={revealedHintIndex >= activeCheckpoint.hints.length}
                      className="text-xs text-[#a1a1aa] hover:text-amber-400 flex items-center gap-1.5 transition-colors disabled:opacity-40"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {revealedHintIndex >= activeCheckpoint.hints.length
                          ? 'All Hints Revealed'
                          : `Need a hint? (${revealedHintIndex}/${activeCheckpoint.hints.length})`}
                      </span>
                    </button>

                    {revealedHintIndex >= 2 && !solutionUnlocked && (
                      <button
                        onClick={() => {
                          setSolutionUnlocked(true);
                          if (activeCheckpoint.solutionCode) {
                            setUserCode(activeCheckpoint.solutionCode);
                          }
                        }}
                        className="text-[11px] text-purple-400 hover:text-purple-300 underline"
                      >
                        Peek Solution
                      </button>
                    )}
                  </div>

                  {/* Render revealed hints */}
                  {revealedHintIndex > 0 && (
                    <div className="space-y-1.5">
                      {activeCheckpoint.hints.slice(0, revealedHintIndex).map((hint: Hint, hIdx: number) => (
                        <div 
                          key={hIdx}
                          className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200/90 flex items-start gap-2"
                        >
                          <span className="font-semibold text-amber-400 font-mono text-[10px] mt-0.5">
                            HINT {hIdx + 1}:
                          </span>
                          <span className="leading-relaxed">{hint.content}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Validation Result Banner */}
              {lastEvaluation && (
                <div className={`p-3 rounded-xl border mb-4 text-xs ${
                  lastEvaluation.passed
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                }`}>
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    {lastEvaluation.passed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>All Tests Passed! Excellent Job.</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <span>{lastEvaluation.title || 'Tests Incomplete. Keep Going!'}</span>
                      </>
                    )}
                  </div>
                  <p className="text-[#a1a1aa] leading-relaxed mb-1.5">
                    {lastEvaluation.message}
                  </p>
                  {lastEvaluation.diagnostic?.suggestedHint && !lastEvaluation.passed && (
                    <p className="text-amber-300/90 text-[11px] italic">
                      💡 Suggestion: {lastEvaluation.diagnostic.suggestedHint}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleCheckSubmission}
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-3 rounded-lg bg-white text-black font-semibold text-xs hover:bg-[#e4e4e7] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-white/5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying Tests...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Run & Validate</span>
                    </>
                  )}
                </button>

                {lastEvaluation?.passed && currentStepIndex < checkpoints.length - 1 && (
                  <button
                    onClick={handleNextStep}
                    className="py-2 px-3.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-500 active:scale-[0.99] transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950"
                  >
                    <span>Next Concept</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* All Checkpoints Completed Banner */}
          {activeCheckpoint && activeCheckpoint.status === 'COMPLETED' && currentStepIndex === checkpoints.length - 1 && (
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-950/40 to-cyan-950/30 border border-emerald-500/40 text-center space-y-2">
              <Zap className="w-7 h-7 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-semibold text-white">Full Application Complete!</h4>
              <p className="text-xs text-[#a1a1aa]">
                You have coded the critical algorithms, state models, and event handlers. You own the code!
              </p>
            </div>
          )}
        </div>

        {/* Bottom Input Prompt Bar (Vercel / v0 style) */}
        <div className="p-3 border-t border-[#27272a] bg-[#09090b] shrink-0">
          <div className="relative rounded-xl border border-[#27272a] bg-[#121214] focus-within:border-[#3f3f46] transition-colors p-2 shadow-inner">
            <input
              type="text"
              value={followupPrompt}
              onChange={e => setFollowupPrompt(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSendFollowup();
              }}
              placeholder="Ask AI tutor anything or suggest a feature change..."
              className="w-full bg-transparent text-xs text-[#f4f4f5] outline-none pr-9 pl-1.5 placeholder-[#52525b]"
              disabled={isFollowupLoading}
            />
            <button
              onClick={handleSendFollowup}
              disabled={!followupPrompt.trim() || isFollowupLoading}
              className="absolute right-2 top-2 p-1 rounded-lg bg-white text-black hover:bg-[#e4e4e7] disabled:opacity-30 disabled:hover:bg-white transition-colors"
            >
              {isFollowupLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArrowUp className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-[#52525b]">
            <span>Press Enter to ask AI tutor</span>
            <span>Vercel-Grade Isolated Sandbox</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANE: Big Canvas (Live Preview / Code Editor) (55-58%)             */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-full bg-[#000000] overflow-hidden">
        
        {/* Canvas Toolbar Bar */}
        <div className="h-14 px-4 border-b border-[#27272a] flex items-center justify-between shrink-0 bg-[#09090b]/80 backdrop-blur">
          {/* View Mode Toggle: [ Preview ] vs [ Code ] */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#18181b] border border-[#27272a]">
            <button
              onClick={() => setCanvasView('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                canvasView === 'preview'
                  ? 'bg-[#27272a] text-white shadow-sm'
                  : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setCanvasView('code')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                canvasView === 'code'
                  ? 'bg-[#27272a] text-white shadow-sm'
                  : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
          </div>

          {/* Browser Address Bar Simulation */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#121214] border border-[#27272a] text-xs font-mono text-[#a1a1aa] max-w-sm w-full mx-4">
            <Globe className="w-3.5 h-3.5 text-[#71717a] shrink-0" />
            <span className="truncate text-[11px] text-[#e4e4e7]">
              https://preview.nirmaan.app/{project.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'app'}
            </span>
            <button 
              onClick={() => setPreviewKey(k => k + 1)}
              className="ml-auto p-0.5 hover:text-white text-[#71717a] transition-colors"
              title="Reload Preview Sandbox"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Responsive & Inspector Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 rounded-lg bg-[#18181b] border border-[#27272a]">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1 rounded ${previewDevice === 'desktop' ? 'bg-[#27272a] text-white' : 'text-[#71717a] hover:text-white'}`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1 rounded ${previewDevice === 'mobile' ? 'bg-[#27272a] text-white' : 'text-[#71717a] hover:text-white'}`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#18181b] border border-[#27272a] text-[11px] text-[#a1a1aa] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Live Runtime</span>
            </div>
          </div>
        </div>

        {/* Canvas Body */}
        <div className="flex-1 relative overflow-hidden bg-[#09090b]">
          {canvasView === 'preview' ? (
            <div className="w-full h-full flex items-center justify-center p-4 bg-[#09090b]">
              <div 
                className={`h-full transition-all duration-300 rounded-xl overflow-hidden border border-[#27272a] shadow-2xl bg-[#09090b] flex flex-col ${
                  previewDevice === 'mobile' ? 'w-[375px] max-h-[720px]' : 'w-full'
                }`}
              >
                <LivePreview
                  key={previewKey}
                  files={project.files}
                  onElementInspected={handleElementInspected}
                />
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col">
              {/* File Tabs */}
              <div className="flex items-center gap-1 px-4 py-2 bg-[#121214] border-b border-[#27272a] overflow-x-auto shrink-0">
                {project.files.map(file => (
                  <button
                    key={file.id}
                    onClick={() => handleSelectFile(file.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-colors shrink-0 ${
                      file.id === (project.activeFileId || project.files[0]?.id)
                        ? 'bg-[#27272a] text-white border border-[#3f3f46]'
                        : 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-[#f4f4f5]'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{file.name}</span>
                    {file.contributions.some(c => c.authorType === 'USER_WRITTEN') && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Authored by human" />
                    )}
                  </button>
                ))}
              </div>

              {/* Code Editor */}
              <div className="flex-1 relative">
                {activeFile ? (
                  <CodeEditor
                    activeFile={activeFile}
                    onCodeChange={handleFileContentChange}
                    onWhyDoesThisExist={() => {
                      const exp = aiService.getConceptExplanation(
                        activeCheckpoint?.conceptId || 'functions_parameters',
                        'intermediate'
                      );
                      setActiveExplanation(exp);
                      setIsExplanationOpen(true);
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-[#71717a]">
                    Select a file to view code
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALS & OVERLAYS                                                         */}
      {/* ========================================================================= */}
      <ExplanationModal
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
        explanation={activeExplanation}
      />

      <KnowledgeGraphModal
        isOpen={isKnowledgeGraphOpen}
        onClose={() => setIsKnowledgeGraphOpen(false)}
        masteredConceptIds={masteredConceptIds}
        activeConceptId={activeCheckpoint?.conceptId}
      />

      <ProjectTimelineModal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        milestones={milestones}
        onSelectMilestoneFile={(targetPath) => {
          const file = project.files.find(f => f.path === targetPath || f.name === targetPath);
          if (file) handleSelectFile(file.id);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={aiSettings}
        onSaveSettings={setAiSettings}
        onResetProject={() => {}}
      />
    </div>
  );
};
