export type InterventionLevel = 'tutor' | 'guided' | 'collaborative' | 'ai';

export type AuthorType = 'AI_GENERATED' | 'USER_WRITTEN' | 'AI_ASSISTED' | 'USER_MODIFIED';

export interface CodeContribution {
  id: string;
  fileId: string;
  startLine: number;
  endLine: number;
  authorType: AuthorType;
  timestamp: number;
  conceptId?: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  path: string;
  name: string;
  content: string;
  language: 'typescript' | 'javascript' | 'tsx' | 'jsx' | 'css' | 'html' | 'json';
  version: number;
  isFolder?: boolean;
  contributions: CodeContribution[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: {
    frontend: string;
    language: string;
    styling: string;
    backend?: string;
  };
  interventionLevel: InterventionLevel;
  currentStage: string;
  activeFileId: string;
  files: ProjectFile[];
  createdAt: number;
  updatedAt: number;
}

export interface ProjectStats {
  totalLines: number;
  userWrittenLines: number;
  aiGeneratedLines: number;
  userPercentage: number;
  checkpointsCompleted: number;
  totalCheckpoints: number;
  hintsUsedCount: number;
}
