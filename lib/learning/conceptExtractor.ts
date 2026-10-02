import { InterventionLevel } from '@/types/project';

export interface ExtractedCodeBlock {
  id: string;
  startLine: number;
  endLine: number;
  language: string;
  conceptId: string;
  conceptName: string;
  syntax: string;
  purpose: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  importance: 'low' | 'medium' | 'high';
  learningValue: 'low' | 'medium' | 'high';
  recommendedHumanTask: boolean;
  code: string;
}

export function analyzeFileForLearningOpportunities(
  filePath: string,
  content: string,
  interventionLevel: InterventionLevel
): ExtractedCodeBlock[] {
  const lines = content.split('\n');
  const blocks: ExtractedCodeBlock[] = [];

  // Patterns to detect concepts in TypeScript/React files
  const patterns: {
    regex: RegExp;
    conceptId: string;
    conceptName: string;
    syntax: string;
    purpose: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    importance: 'low' | 'medium' | 'high';
    learningValue: 'low' | 'medium' | 'high';
  }[] = [
    {
      regex: /export\s+interface\s+(\w+)\s*\{/g,
      conceptId: 'ts_interfaces',
      conceptName: 'TypeScript Interface',
      syntax: 'interface Declaration',
      purpose: 'Enforces type structure and object contracts across components.',
      difficulty: 'beginner',
      importance: 'high',
      learningValue: 'high',
    },
    {
      regex: /const\s+\[(\w+),\s*set\w+\]\s*=\s*useState/g,
      conceptId: 'react_state',
      conceptName: 'React State Hook (useState)',
      syntax: 'useState Hook',
      purpose: 'Declares reactive component state that triggers UI updates.',
      difficulty: 'beginner',
      importance: 'high',
      learningValue: 'high',
    },
    {
      regex: /\.(reduce|map|filter)\s*\(/g,
      conceptId: 'array_methods',
      conceptName: 'Array Method (reduce/map/filter)',
      syntax: 'Higher-Order Array Method',
      purpose: 'Transforms or aggregates collections immutably.',
      difficulty: 'intermediate',
      importance: 'high',
      learningValue: 'high',
    },
    {
      regex: /const\s+(\w+)\s*=\s*\((.*?)\)\s*:\s*\w*.*=>/g,
      conceptId: 'arrow_functions',
      conceptName: 'Arrow Function Expression',
      syntax: 'Arrow Function (=>)',
      purpose: 'Defines modern concise function logic with lexical binding.',
      difficulty: 'beginner',
      importance: 'medium',
      learningValue: 'medium',
    },
    {
      regex: /function\s+(\w+)\s*\((.*?)\)/g,
      conceptId: 'functions_parameters',
      conceptName: 'Function Declaration',
      syntax: 'Named Function',
      purpose: 'Encapsulates reusable procedural logic with parameters and return values.',
      difficulty: 'beginner',
      importance: 'high',
      learningValue: 'high',
    },
    {
      regex: /on(Click|Submit|Change|KeyDown)\s*=\s*\{/g,
      conceptId: 'event_handling',
      conceptName: 'Event Handling',
      syntax: 'React Event Attribute',
      purpose: 'Connects user interactions (clicks, input typing, submits) to handler logic.',
      difficulty: 'beginner',
      importance: 'high',
      learningValue: 'high',
    },
    {
      regex: /fetch\s*\(|await\s+/g,
      conceptId: 'async_await',
      conceptName: 'Asynchronous API Request',
      syntax: 'async/await & fetch API',
      purpose: 'Requests or sends data to an asynchronous external service.',
      difficulty: 'intermediate',
      importance: 'high',
      learningValue: 'high',
    },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const pat of patterns) {
      pat.regex.lastIndex = 0;
      if (pat.regex.test(line)) {
        // Find closing brace or logical block boundary
        let endLine = Math.min(i + 10, lines.length);
        let braceCount = 0;
        let foundOpen = false;

        for (let j = i; j < lines.length; j++) {
          const l = lines[j];
          for (const char of l) {
            if (char === '{') {
              braceCount++;
              foundOpen = true;
            } else if (char === '}') {
              braceCount--;
            }
          }
          if (foundOpen && braceCount === 0) {
            endLine = j + 1;
            break;
          }
        }

        const blockCode = lines.slice(i, endLine).join('\n');

        // Determine if human should write this based on intervention level
        let shouldBeHuman = false;
        if (interventionLevel === 'tutor') {
          shouldBeHuman = pat.learningValue !== 'low';
        } else if (interventionLevel === 'guided') {
          shouldBeHuman = pat.learningValue === 'high';
        } else if (interventionLevel === 'collaborative') {
          shouldBeHuman = pat.learningValue === 'high' && pat.importance === 'high';
        } else {
          shouldBeHuman = false; // AI builder mode
        }

        blocks.push({
          id: `block_${i}_${pat.conceptId}`,
          startLine: i + 1,
          endLine,
          language: filePath.endsWith('.tsx') || filePath.endsWith('.ts') ? 'typescript' : 'javascript',
          conceptId: pat.conceptId,
          conceptName: pat.conceptName,
          syntax: pat.syntax,
          purpose: pat.purpose,
          difficulty: pat.difficulty,
          importance: pat.importance,
          learningValue: pat.learningValue,
          recommendedHumanTask: shouldBeHuman,
          code: blockCode,
        });

        i = endLine - 1; // Advance past this block
        break;
      }
    }
  }

  return blocks;
}
