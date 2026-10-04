import { InterventionLevel, AssistanceLevelNumber, ProjectStats } from '@/types/project';

export interface AssistancePolicyConfig {
  levelNumber: AssistanceLevelNumber;
  levelKey: InterventionLevel;
  displayName: string;
  badge: string;
  maxGeneratedLines: number;
  minOwnershipFloor: number;
  allowDirectSolutions: boolean;
  socraticGuidanceOnly: boolean;
  description: string;
  aiBehaviorSummary: string;
  learnerResponsibility: string;
}

export const ASSISTANCE_POLICIES: Record<AssistanceLevelNumber, AssistancePolicyConfig> = {
  1: {
    levelNumber: 1,
    levelKey: 'tutor',
    displayName: 'Level 1: Tutor',
    badge: 'Tutor Only (User Heavy)',
    maxGeneratedLines: 0, // No full code generation allowed
    minOwnershipFloor: 85,
    allowDirectSolutions: false,
    socraticGuidanceOnly: true,
    description: 'AI explains principles, asks guiding questions, and offers progressive hints. You author virtually 100% of the code.',
    aiBehaviorSummary: 'Explains concepts, offers hints, points out syntax rules. Zero copy-paste answers.',
    learnerResponsibility: 'Author all implementation code from scratch or specifications.',
  },
  2: {
    levelNumber: 2,
    levelKey: 'pair',
    displayName: 'Level 2: Pair',
    badge: 'Pair Programming',
    maxGeneratedLines: 8,
    minOwnershipFloor: 75,
    allowDirectSolutions: false,
    socraticGuidanceOnly: false,
    description: 'AI suggests small snippets and micro-scaffolds (≤ 8 lines). You write most of the logic and control flow.',
    aiBehaviorSummary: 'Suggests micro-snippets, function signatures, and targeted bug fixes.',
    learnerResponsibility: 'Write majority of code, implement business logic, and handle edge cases.',
  },
  3: {
    levelNumber: 3,
    levelKey: 'guided',
    displayName: 'Level 3: Co-Developer',
    badge: 'Co-Developer (Recommended)',
    maxGeneratedLines: 30,
    minOwnershipFloor: 60,
    allowDirectSolutions: false,
    socraticGuidanceOnly: false,
    description: 'AI scaffolds architectural boilerplate; you implement critical algorithms, state transitions, and event handlers.',
    aiBehaviorSummary: 'Scaffolds 10-20% challenges, sets up component skeletons, leaves key blocks for learner.',
    learnerResponsibility: 'Write critical algorithmic blocks and pass verification tests.',
  },
  4: {
    levelNumber: 4,
    levelKey: 'builder',
    displayName: 'Level 4: Builder',
    badge: 'AI Builder',
    maxGeneratedLines: 120,
    minOwnershipFloor: 40,
    allowDirectSolutions: true,
    socraticGuidanceOnly: false,
    description: 'AI implements larger functional features. You review diffs, test edge cases, and justify engineering decisions.',
    aiBehaviorSummary: 'Implements full routines; requires learner diff approval and test execution.',
    learnerResponsibility: 'Review diffs, run integration tests, and explain system architecture.',
  },
  5: {
    levelNumber: 5,
    levelKey: 'ai',
    displayName: 'Level 5: Autopilot',
    badge: 'Autopilot (Gated)',
    maxGeneratedLines: 500,
    minOwnershipFloor: 25,
    allowDirectSolutions: true,
    socraticGuidanceOnly: false,
    description: 'End-to-end autonomous synthesis. Gated behind independent comprehension verification and explain-back audit.',
    aiBehaviorSummary: 'Generates full systems; triggers mandatory explain-back audit before final commit.',
    learnerResponsibility: 'Audit generated codebase, conduct security review, and pass explain-back check.',
  },
};

/**
 * Resolves assistance level number from legacy InterventionLevel string or number
 */
export function resolveAssistanceLevel(level: InterventionLevel | AssistanceLevelNumber | string): AssistancePolicyConfig {
  if (typeof level === 'number' && ASSISTANCE_POLICIES[level as AssistanceLevelNumber]) {
    return ASSISTANCE_POLICIES[level as AssistanceLevelNumber];
  }
  const str = String(level).toLowerCase();
  if (str === 'tutor' || str === '1') return ASSISTANCE_POLICIES[1];
  if (str === 'pair' || str === '2') return ASSISTANCE_POLICIES[2];
  if (str === 'guided' || str === 'collaborative' || str === '3') return ASSISTANCE_POLICIES[3];
  if (str === 'builder' || str === '4') return ASSISTANCE_POLICIES[4];
  if (str === 'ai' || str === '5') return ASSISTANCE_POLICIES[5];
  return ASSISTANCE_POLICIES[3]; // Default to Level 3 Co-Developer
}

export interface PolicyValidationResult {
  allowed: boolean;
  policy: AssistancePolicyConfig;
  message?: string;
  adjustedContent?: string;
  requiresExplainBack?: boolean;
}

/**
 * Evaluates whether an AI generation action conforms to the current level's policy.
 * Deterministic enforcement: The policy engine disposes what the LLM proposes.
 */
export function enforceAssistancePolicy(
  level: InterventionLevel | AssistanceLevelNumber,
  proposedCode: string,
  stats?: ProjectStats
): PolicyValidationResult {
  const policy = resolveAssistanceLevel(level);
  const codeLines = proposedCode.trim() ? proposedCode.split('\n').length : 0;

  // Level 1: Hard ban on full solutions / extensive code generation
  if (policy.levelNumber === 1 && codeLines > 3) {
    return {
      allowed: false,
      policy,
      message: `[Policy Guard: ${policy.displayName}] Direct solution code blocked. In Level 1 Tutor mode, AI assists through Socratic hints, conceptual explanations, and syntax references. You must author the code yourself.`,
      requiresExplainBack: false,
    };
  }

  // Level 2: Limit generation to micro-snippets
  if (policy.levelNumber === 2 && codeLines > policy.maxGeneratedLines) {
    return {
      allowed: false,
      policy,
      message: `[Policy Guard: ${policy.displayName}] Code snippet exceeds ${policy.maxGeneratedLines} lines. In Pair mode, AI only suggests small targeted snippets so you retain authorial control.`,
    };
  }

  // Check ownership floor compliance
  if (stats && stats.verifiedOwnershipPercentage < policy.minOwnershipFloor && policy.levelNumber >= 4) {
    return {
      allowed: false,
      policy,
      message: `[Policy Guard] Current verified ownership (${stats.verifiedOwnershipPercentage}%) is below the required floor (${policy.minOwnershipFloor}%) for ${policy.displayName}. Complete an Explain-Back review or write more lines to unlock higher AI assistance.`,
      requiresExplainBack: true,
    };
  }

  return {
    allowed: true,
    policy,
  };
}

/**
 * Validates whether a learner can promote their assistance level.
 * Rule: Lower freely, raise with a cost (requires passing an explain-back or meeting ownership floor).
 */
export function canPromoteAssistanceLevel(
  currentLevel: AssistanceLevelNumber,
  targetLevel: AssistanceLevelNumber,
  ownershipStats: ProjectStats
): { canPromote: boolean; requiresChallenge: boolean; message: string } {
  // Lowering assistance (e.g., from Level 4 Builder down to Level 1 Tutor) is always unrestricted!
  if (targetLevel <= currentLevel) {
    return {
      canPromote: true,
      requiresChallenge: false,
      message: `Assistance level reduced to ${ASSISTANCE_POLICIES[targetLevel].displayName}. You have full authorial control.`,
    };
  }

  // Raising assistance: verify ownership floor
  const targetConfig = ASSISTANCE_POLICIES[targetLevel];
  if (ownershipStats.verifiedOwnershipPercentage < targetConfig.minOwnershipFloor) {
    return {
      canPromote: false,
      requiresChallenge: true,
      message: `To raise assistance to ${targetConfig.displayName}, your verified ownership must be at least ${targetConfig.minOwnershipFloor}% (currently ${ownershipStats.verifiedOwnershipPercentage}%). Pass an Explain-Back check to proceed.`,
    };
  }

  return {
    canPromote: true,
    requiresChallenge: false,
    message: `Promoted to ${targetConfig.displayName}. Remember to review and test all AI contributions!`,
  };
}
