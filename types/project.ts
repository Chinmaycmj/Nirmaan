export type InterventionLevel = 'tutor' | 'pair' | 'guided' | 'collaborative' | 'builder' | 'ai';

export type AssistanceLevelNumber = 1 | 2 | 3 | 4 | 5;

export type AuthorType = 
  | 'AI_GENERATED' 
  | 'USER_WRITTEN' 
  | 'AI_ASSISTED' 
  | 'USER_MODIFIED' 
  | 'USER_UNDERSTOOD' 
  | 'IMPORTED_BASELINE';

export interface CodeContribution {
  id: string;
  fileId: string;
  startLine: number;
  endLine: number;
  authorType: AuthorType;
  timestamp: number;
  conceptId?: string;
  explanationNotes?: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  path: string;
  name: string;
  content: string;
  language: 'typescript' | 'javascript' | 'tsx' | 'jsx' | 'css' | 'html' | 'json' | 'cpp' | 'java' | 'python' | 'markdown';
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
    framework?: string;
    runtime?: string;
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
  understoodLines: number;
  aiGeneratedLines: number;
  importedLines: number;
  authoredPercentage: number;
  understoodPercentage: number;
  verifiedOwnershipPercentage: number;
  userPercentage: number;
  checkpointsCompleted: number;
  totalCheckpoints: number;
  hintsUsedCount: number;
}
