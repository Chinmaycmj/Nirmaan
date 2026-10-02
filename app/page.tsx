'use client';

import React, { useState, useCallback } from 'react';
import { Project, ProjectFile, InterventionLevel, ProjectStats } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone } from '@/types/learning';
import { AISettings, ConceptExplanation, ValidationEvaluation } from '@/types/ai';
import { aiService } from '@/lib/ai/provider';
import { calculateProjectOwnership } from '@/lib/learning/ownershipTracker';
import { validateCheckpointSubmission } from '@/lib/learning/validator';
import { createCalculatorProject } from '@/lib/ai/curriculum/calculator';
import { createExpenseTrackerProject } from '@/lib/ai/curriculum/expenseTracker';

import { AntigravityHero } from '@/components/landing/AntigravityHero';
import { Header } from '@/components/ide/Header';
import { FileExplorer } from '@/components/ide/FileExplorer';
import { CodeEditor } from '@/components/ide/CodeEditor';
import { LivePreview } from '@/components/preview/LivePreview';
import { TutorPanel } from '@/components/tutor/TutorPanel';
import { ExplanationModal } from '@/components/modals/ExplanationModal';
import { KnowledgeGraphModal } from '@/components/modals/KnowledgeGraphModal';
import { ProjectTimelineModal } from '@/components/modals/ProjectTimelineModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { Eye, GraduationCap, Columns } from 'lucide-react';

export default function WorkspacePage() {
  // Whether the user is inside the IDE or on the Antigravity clean prompt screen
  const [isWorkspaceActive, setIsWorkspaceActive] = useState<boolean>(false);

  // Default project: starts with clean Calculator when triggered
  const [projectData, setProjectData] = useState(() => createCalculatorProject());
  const [project, setProject] = useState<Project>(projectData.project);
  const [checkpoints, setCheckpoints] = useState<LearningCheckpoint[]>(projectData.checkpoints);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>(projectData.milestones);
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState<number>(0);
  const [masteredConceptIds, setMasteredConceptIds] = useState<string[]>([]);

  // Right Workbench active tab: 'split' | 'preview' | 'tutor'
  const [rightTab, setRightTab] = useState<'split' | 'preview' | 'tutor'>('split');

  // Modals state
  const [isExplanationOpen, setIsExplanationOpen] = useState<boolean>(false);
  const [activeExplanation, setActiveExplanation] = useState<ConceptExplanation | null>(null);
  const [isKnowledgeGraphOpen, setIsKnowledgeGraphOpen] = useState<boolean>(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [aiSettings, setAiSettings] = useState<AISettings>({ provider: 'builtin' });

  // Calculate project statistics and human ownership %
  const stats: ProjectStats = calculateProjectOwnership(project);
  stats.checkpointsCompleted = checkpoints.filter(c => c.status === 'COMPLETED').length;
  stats.totalCheckpoints = checkpoints.length;

  const activeCheckpoint = checkpoints[currentCheckpointIndex] || null;
  const activeFile = project.files.find(f => f.id === project.activeFileId) || project.files[0] || null;

  // Handle launch from Antigravity Hero prompt
  const handleStartProjectFromHero = async (
    userPrompt: string,
    level: InterventionLevel,
    experience: string
  ) => {
    const result = await aiService.generateProjectFromPrompt(userPrompt, experience, level);
    result.project.interventionLevel = level;
    setProject(result.project);
    setCheckpoints(result.checkpoints);
    setMilestones(result.milestones);
    setCurrentCheckpointIndex(0);
    setMasteredConceptIds([]);
    setIsWorkspaceActive(true);
  };

  // Handle active file selection
  const handleSelectFile = (fileId: string) => {
    setProject(prev => ({ ...prev, activeFileId: fileId }));
  };

  // Handle code change inside editor
  const handleCodeChange = (newContent: string) => {
    setProject(prev => ({
      ...prev,
      files: prev.files.map(f =>
        f.id === prev.activeFileId ? { ...f, content: newContent, version: f.version + 1 } : f
      ),
    }));
  };

  // Handle intervention level change
  const handleInterventionChange = (level: InterventionLevel) => {
    setProject(prev => ({ ...prev, interventionLevel: level }));
  };

  // Handle Code-to-Preview Connection (Visual Inspector)
  const handleElementInspected = useCallback((filePath: string, line: number, conceptName: string) => {
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
  }, [project.files, activeCheckpoint?.conceptId]);

  // Handle Concept Explanation Trigger
  const handleConceptExplain = (conceptId: string) => {
    const explanation = aiService.getConceptExplanation(conceptId, 'beginner');
    setActiveExplanation(explanation);
    setIsExplanationOpen(true);
  };

  // Handle "Why Does This Exist?" Action
  const handleWhyDoesThisExist = (codeSnippet?: string) => {
    const conceptId = activeCheckpoint?.conceptId || 'functions_parameters';
    const explanation = aiService.getConceptExplanation(conceptId, 'intermediate');
    setActiveExplanation(explanation);
    setIsExplanationOpen(true);
  };

  // Handle Checkpoint Submission Verification
  const handleCheckSubmission = async (submission: string): Promise<ValidationEvaluation> => {
    if (!activeCheckpoint) {
      return {
        passed: false,
        score: 0,
        title: 'No Checkpoint Active',
        message: 'No active task found.',
        testResults: [],
      };
    }

    const evaluation = await validateCheckpointSubmission(activeCheckpoint, submission);

    if (evaluation.passed) {
      setCheckpoints(prev =>
        prev.map(c =>
          c.id === activeCheckpoint.id
            ? { ...c, status: 'COMPLETED', userSubmittedCode: submission, completedAt: Date.now() }
            : c
        )
      );

      if (!masteredConceptIds.includes(activeCheckpoint.conceptId)) {
        setMasteredConceptIds(prev => [...prev, activeCheckpoint.conceptId]);
      }

      const targetFile = project.files.find(f => f.id === activeCheckpoint.targetFileId);
      if (targetFile && (activeCheckpoint.taskType === 'COMPLETE_CODE' ||
                         activeCheckpoint.taskType === 'WRITE_SCRATCH' ||
                         activeCheckpoint.taskType === 'FIX_BUG' ||
                         activeCheckpoint.taskType === 'MODIFY_CODE')) {
        
        let updatedContent = targetFile.content;
        if (activeCheckpoint.initialCode && updatedContent.includes(activeCheckpoint.initialCode.trim())) {
          updatedContent = updatedContent.replace(activeCheckpoint.initialCode.trim(), submission.trim());
        } else if (activeCheckpoint.brokenCode && updatedContent.includes(activeCheckpoint.brokenCode.trim())) {
          updatedContent = updatedContent.replace(activeCheckpoint.brokenCode.trim(), submission.trim());
        } else {
          updatedContent = targetFile.content + '\n' + submission;
        }

        setProject(prev => ({
          ...prev,
          files: prev.files.map(f =>
            f.id === targetFile.id
              ? {
                  ...f,
                  content: updatedContent,
                  contributions: [
                    ...f.contributions,
                    {
                      id: `contrib-${Date.now()}`,
                      fileId: f.id,
                      startLine: 1,
                      endLine: submission.split('\n').length + 5,
                      authorType: 'USER_WRITTEN',
                      timestamp: Date.now(),
                      conceptId: activeCheckpoint.conceptId,
                    },
                  ],
                }
              : f
          ),
        }));
      }

      setMilestones(prev =>
        prev.map((m, idx) =>
          idx === currentCheckpointIndex ? { ...m, completed: true } : m
        )
      );
    }

    return evaluation;
  };

  // Continue to next checkpoint
  const handleNextCheckpoint = () => {
    if (currentCheckpointIndex < checkpoints.length - 1) {
      const nextIndex = currentCheckpointIndex + 1;
      setCurrentCheckpointIndex(nextIndex);
      const nextCheckpoint = checkpoints[nextIndex];
      if (nextCheckpoint && nextCheckpoint.targetFileId) {
        setProject(prev => ({ ...prev, activeFileId: nextCheckpoint.targetFileId }));
      }
    }
  };

  // Reset project
  const handleResetProject = () => {
    const resetData = createCalculatorProject();
    setProject(resetData.project);
    setCheckpoints(resetData.checkpoints);
    setMilestones(resetData.milestones);
    setCurrentCheckpointIndex(0);
    setMasteredConceptIds([]);
  };

  // If workspace is not active yet, show clean Antigravity prompt hero
  if (!isWorkspaceActive) {
    return <AntigravityHero onStartProject={handleStartProjectFromHero} />;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans">
      {/* Top Header */}
      <Header
        projectName={project.name}
        stageName={project.currentStage}
        stats={stats}
        interventionLevel={project.interventionLevel}
        onInterventionChange={handleInterventionChange}
        onRunCode={() => {
          setProject(prev => ({ ...prev, updatedAt: Date.now() }));
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenKnowledgeGraph={() => setIsKnowledgeGraphOpen(true)}
        onOpenTimeline={() => setIsTimelineOpen(true)}
        onResetProject={handleResetProject}
        onNewProject={() => setIsWorkspaceActive(false)}
        onReturnToHero={() => setIsWorkspaceActive(false)}
      />

      {/* Main IDE Workspace: Left Explorer | Center Full-Height Editor | Right Workbench */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: File Explorer (220px) */}
        <FileExplorer
          files={project.files}
          activeFileId={project.activeFileId}
          onSelectFile={handleSelectFile}
          onCreateFile={(name) => {
            const newFile: ProjectFile = {
              id: `file-${Date.now()}`,
              projectId: project.id,
              path: name,
              name: name.split('/').pop() || name,
              content: '// New file\n',
              language: 'typescript',
              version: 1,
              contributions: [
                {
                  id: `c-${Date.now()}`,
                  fileId: `file-${Date.now()}`,
                  startLine: 1,
                  endLine: 2,
                  authorType: 'USER_WRITTEN',
                  timestamp: Date.now(),
                },
              ],
            };
            setProject(prev => ({
              ...prev,
              files: [...prev.files, newFile],
              activeFileId: newFile.id,
            }));
          }}
        />

        {/* Center: Monaco Code Editor (Full Vertical Height, Spacious!) */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800 h-full">
          <CodeEditor
            activeFile={activeFile}
            onCodeChange={handleCodeChange}
            onWhyDoesThisExist={handleWhyDoesThisExist}
          />
        </div>

        {/* Right: Interactive Workbench (Width: 480px / 520px, Full Vertical Height!) */}
        <div className="w-[480px] xl:w-[520px] flex flex-col bg-slate-950 border-l border-slate-800 h-full select-none">
          {/* Workbench Tab Switcher */}
          <div className="h-10 px-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
              <button
                onClick={() => setRightTab('split')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  rightTab === 'split' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="View Live Preview and AI Tutor together"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Split View</span>
              </button>
              <button
                onClick={() => setRightTab('preview')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  rightTab === 'preview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Full height Live Preview"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setRightTab('tutor')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  rightTab === 'tutor' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Full height AI Tutor task & hints"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Tutor (Step {currentCheckpointIndex + 1}/{checkpoints.length})</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              {rightTab === 'split' ? 'Preview + Tutor' : rightTab === 'preview' ? 'Live Sandbox' : 'Interactive Task'}
            </div>
          </div>

          {/* Workbench Tab Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {rightTab === 'preview' && (
              <LivePreview files={project.files} onElementInspected={handleElementInspected} />
            )}

            {rightTab === 'tutor' && (
              <TutorPanel
                checkpoint={activeCheckpoint}
                totalCheckpoints={checkpoints.length}
                currentStepIndex={currentCheckpointIndex}
                onCheckSubmission={handleCheckSubmission}
                onConceptExplain={handleConceptExplain}
                onWhyDoesThisExist={handleWhyDoesThisExist}
                onNextCheckpoint={handleNextCheckpoint}
              />
            )}

            {rightTab === 'split' && (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="h-[46%] border-b border-slate-800 overflow-hidden">
                  <LivePreview files={project.files} onElementInspected={handleElementInspected} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <TutorPanel
                    checkpoint={activeCheckpoint}
                    totalCheckpoints={checkpoints.length}
                    currentStepIndex={currentCheckpointIndex}
                    onCheckSubmission={handleCheckSubmission}
                    onConceptExplain={handleConceptExplain}
                    onWhyDoesThisExist={handleWhyDoesThisExist}
                    onNextCheckpoint={handleNextCheckpoint}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
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
        onSelectMilestoneFile={(targetPath) => {
          const file = project.files.find(f => f.path === targetPath || f.name === targetPath);
          if (file) handleSelectFile(file.id);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={aiSettings}
        onSaveSettings={(s) => {
          setAiSettings(s);
          aiService.updateSettings(s);
        }}
        onResetProject={handleResetProject}
      />
    </div>
  );
}
