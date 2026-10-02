'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Project, ProjectFile, InterventionLevel, ProjectStats } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone } from '@/types/learning';
import { AISettings, ConceptExplanation, ValidationEvaluation } from '@/types/ai';
import { aiService } from '@/lib/ai/provider';
import { calculateProjectOwnership } from '@/lib/learning/ownershipTracker';
import { validateCheckpointSubmission } from '@/lib/learning/validator';
import { createExpenseTrackerProject } from '@/lib/ai/curriculum/expenseTracker';

import { Header } from '@/components/ide/Header';
import { FileExplorer } from '@/components/ide/FileExplorer';
import { CodeEditor } from '@/components/ide/CodeEditor';
import { LivePreview } from '@/components/preview/LivePreview';
import { TutorPanel } from '@/components/tutor/TutorPanel';
import { ExplanationModal } from '@/components/modals/ExplanationModal';
import { KnowledgeGraphModal } from '@/components/modals/KnowledgeGraphModal';
import { ProjectTimelineModal } from '@/components/modals/ProjectTimelineModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';

export default function WorkspacePage() {
  // Initialize default project (Expense Tracker from Section 45)
  const [projectData, setProjectData] = useState(() => createExpenseTrackerProject());
  const [project, setProject] = useState<Project>(projectData.project);
  const [checkpoints, setCheckpoints] = useState<LearningCheckpoint[]>(projectData.checkpoints);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>(projectData.milestones);
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState<number>(0);
  const [masteredConceptIds, setMasteredConceptIds] = useState<string[]>([]);

  // Modals state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
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
    // Find target file in project
    const targetFile = project.files.find(f => f.path === filePath || f.name === filePath || f.path.endsWith(filePath));
    if (targetFile) {
      setProject(prev => ({ ...prev, activeFileId: targetFile.id }));
    }

    // Open explanation for this concept
    const explanation = aiService.getConceptExplanation(
      activeCheckpoint?.conceptId || 'react_components',
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
    const conceptId = activeCheckpoint?.conceptId || 'ts_interfaces';
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
      // Mark checkpoint as completed
      setCheckpoints(prev =>
        prev.map(c =>
          c.id === activeCheckpoint.id
            ? { ...c, status: 'COMPLETED', userSubmittedCode: submission, completedAt: Date.now() }
            : c
        )
      );

      // Add to mastered concepts if not already there
      if (!masteredConceptIds.includes(activeCheckpoint.conceptId)) {
        setMasteredConceptIds(prev => [...prev, activeCheckpoint.conceptId]);
      }

      // Update the target file in the project with the user's verified code!
      // And record that this section was USER_WRITTEN
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
          // Append or replace solution pattern
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

      // Mark milestone as completed
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
      // Switch active file to next checkpoint's target file
      if (nextCheckpoint && nextCheckpoint.targetFileId) {
        setProject(prev => ({ ...prev, activeFileId: nextCheckpoint.targetFileId }));
      }
    }
  };

  // Onboarding completion
  const handleOnboardingComplete = async (data: {
    prompt: string;
    experience: 'beginner' | 'intermediate' | 'advanced';
    technologies: string[];
    preference: 'learn_first' | 'balanced' | 'speed';
  }) => {
    const result = await aiService.generateProjectFromPrompt(data.prompt, data.experience, data.preference);
    setProject(result.project);
    setCheckpoints(result.checkpoints);
    setMilestones(result.milestones);
    setCurrentCheckpointIndex(0);
    setMasteredConceptIds([]);
    setIsOnboardingOpen(false);
  };

  // Reset project
  const handleResetProject = () => {
    const resetData = createExpenseTrackerProject();
    setProject(resetData.project);
    setCheckpoints(resetData.checkpoints);
    setMilestones(resetData.milestones);
    setCurrentCheckpointIndex(0);
    setMasteredConceptIds([]);
  };

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
          // Triggers re-render of preview and evaluation
          setProject(prev => ({ ...prev, updatedAt: Date.now() }));
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenKnowledgeGraph={() => setIsKnowledgeGraphOpen(true)}
        onOpenTimeline={() => setIsTimelineOpen(true)}
        onResetProject={handleResetProject}
        onNewProject={() => setIsOnboardingOpen(true)}
      />

      {/* Main IDE Workspace: Explorer | Editor | Live Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: File Explorer */}
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

        {/* Center: Monaco Code Editor */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800">
          <CodeEditor
            activeFile={activeFile}
            onCodeChange={handleCodeChange}
            onWhyDoesThisExist={handleWhyDoesThisExist}
          />
        </div>

        {/* Right: Live Preview Sandbox with Code-to-Preview Connection */}
        <div className="w-[45%] flex flex-col min-w-[340px] max-w-[680px]">
          <LivePreview
            files={project.files}
            onElementInspected={handleElementInspected}
          />
        </div>
      </div>

      {/* Bottom: AI Tutor & Learning Panel */}
      <TutorPanel
        checkpoint={activeCheckpoint}
        totalCheckpoints={checkpoints.length}
        currentStepIndex={currentCheckpointIndex}
        onCheckSubmission={handleCheckSubmission}
        onConceptExplain={handleConceptExplain}
        onWhyDoesThisExist={handleWhyDoesThisExist}
        onNextCheckpoint={handleNextCheckpoint}
      />

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

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
