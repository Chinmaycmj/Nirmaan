import { AuthorType } from './project';

export type TaskType = 
  | 'COMPLETE_CODE'      // Type A: Fill in missing portion
  | 'WRITE_SCRATCH'      // Type B: Implement from specification
  | 'PREDICT_OUTPUT'     // Type C: Predict what code will log/return
  | 'FIX_BUG'            // Type D: Identify and fix broken code
  | 'EXPLAIN_CODE'       // Type E: Natural language explanation graded by AI
  | 'CHOOSE_APPROACH'    // Type F: Multiple implementations, pick best & why
  | 'MODIFY_CODE';       // Type G: Extend existing component/feature

export type CheckpointStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';

export type ConceptCategory = 
  | 'Syntax & Fundamentals'
  | 'Functions & Logic'
  | 'Data Structures'
  | 'React Core'
  | 'State & Hooks'
  | 'Events & Forms'
  | 'Async & APIs'
  | 'Architecture & Clean Code';

export interface Concept {
  id: string;
  name: string;
  category: ConceptCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  prerequisites: string[]; // array of concept IDs
}

export interface TestCase {
  id: string;
  description: string;
  input?: any;
  expectedOutput?: any;
  assertionFn?: string; // stringified test expression
}

export interface Hint {
  level: 1 | 2 | 3 | 4;
  type: 'conceptual' | 'structural' | 'syntax' | 'partial_solution';
  title: string;
  content: string;
}

export interface LearningCheckpoint {
  id: string;
  projectId: string;
  stepNumber: number;
  title: string;
  conceptId: string;
  conceptName: string;
  taskType: TaskType;
  prompt: string;
  contextExplanation: string; // "Why does this exist in our project?"
  targetFileId: string;
  targetLineStart?: number;
  targetLineEnd?: number;
  initialCode?: string;       // starter code or template
  solutionCode: string;      // canonical correct code
  brokenCode?: string;        // for FIX_BUG tasks
  testCases: TestCase[];
  hints: Hint[];
  // For PREDICT_OUTPUT and CHOOSE_APPROACH:
  multipleChoiceOptions?: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  // For EXPLAIN_CODE:
  expectedKeywords?: string[];
  rubricCriteria?: string[];
  
  status: CheckpointStatus;
  attempts: number;
  hintsUsed: number;
  userSubmittedCode?: string;
  feedback?: string;
  completedAt?: number;
  whatChangedInPreview?: string; // Clear explanation of visual change
  realLifeExample?: string;      // Relatable real-world physical metaphor or practical analogy
  language?: string;             // Active language: 'cpp' | 'java' | 'python' | 'javascript' | 'css' | 'html'
}

export interface ConceptMastery {
  conceptId: string;
  conceptName: string;
  status: 'not_started' | 'learning' | 'mastered' | 'needs_review';
  successCount: number;
  mistakeCount: number;
  lastPracticed: number;
}

export interface LearnerProfile {
  userId: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  learningPreference: 'learn_first' | 'balanced' | 'speed';
  masteredConcepts: Record<string, ConceptMastery>;
  totalExercisesCompleted: number;
  hintsDependencyScore: number; // 0-100 (lower is more independent)
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  stepNumber: number;
  title: string;
  description: string;
  conceptName: string;
  timestamp: number;
  targetFile: string;
  completed: boolean;
}
