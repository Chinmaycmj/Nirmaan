'use client';

import React, { useState } from 'react';
import { Project, InterventionLevel } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone } from '@/types/learning';
import { aiService } from '@/lib/ai/provider';
import { createCalculatorProject } from '@/lib/ai/curriculum/calculator';

import { AntigravityHero } from '@/components/landing/AntigravityHero';
import { VercelWorkspace } from '@/components/vercel/VercelWorkspace';

export default function WorkspacePage() {
  const [isWorkspaceActive, setIsWorkspaceActive] = useState<boolean>(false);
  const [lastPrompt, setLastPrompt] = useState<string>('Build a simple calculator');

  // Default project: starts with clean Calculator
  const [projectData, setProjectData] = useState(() => createCalculatorProject());
  const [project, setProject] = useState<Project>(projectData.project);
  const [checkpoints, setCheckpoints] = useState<LearningCheckpoint[]>(projectData.checkpoints);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>(projectData.milestones);

  // Handle launch from Antigravity Hero prompt
  const handleStartProjectFromHero = async (
    userPrompt: string,
    level: InterventionLevel,
    experience: string
  ) => {
    setLastPrompt(userPrompt);
    const result = await aiService.generateProjectFromPrompt(userPrompt, experience, level);
    result.project.interventionLevel = level;
    setProject(result.project);
    setCheckpoints(result.checkpoints);
    setMilestones(result.milestones);
    setIsWorkspaceActive(true);
  };

  // If workspace is not active yet, show clean Antigravity prompt hero
  if (!isWorkspaceActive) {
    return <AntigravityHero onStartProject={handleStartProjectFromHero} />;
  }

  // Vercel / v0 style full-bleed workspace: prompt stream on left, big live preview on right
  return (
    <VercelWorkspace
      key={project.id}
      initialProject={project}
      initialCheckpoints={checkpoints}
      initialMilestones={milestones}
      initialPrompt={lastPrompt}
      onReturnToLanding={() => setIsWorkspaceActive(false)}
    />
  );
}
