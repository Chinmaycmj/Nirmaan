import { AISettings, ConceptExplanation, ExplanationLevel } from '@/types/ai';
import { routeOrSynthesizeProject } from './universalPlanner';
import { Project } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone } from '@/types/learning';

export class AIProviderService {
  private settings: AISettings;

  constructor(settings?: Partial<AISettings>) {
    this.settings = {
      provider: settings?.provider || 'builtin',
      apiKey: settings?.apiKey,
      model: settings?.model,
      customEndpoint: settings?.customEndpoint,
    };
  }

  public updateSettings(settings: AISettings) {
    this.settings = settings;
  }

  public async generateProjectFromPrompt(
    prompt: string,
    experienceLevel: string = 'beginner',
    preference: string = 'guided',
    techStackChoice?: string
  ): Promise<{
    project: Project;
    checkpoints: LearningCheckpoint[];
    milestones: ProjectMilestone[];
  }> {
    // If the user has configured an external LLM API key (Gemini / OpenAI),
    // we can attempt a live API call, and gracefully fall back to the universal planner
    if (this.settings.provider !== 'builtin' && this.settings.apiKey) {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            provider: this.settings.provider,
            apiKey: this.settings.apiKey,
            model: this.settings.model,
            experienceLevel,
            preference,
            techStackChoice,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.project && data.checkpoints) {
            return data;
          }
        }
      } catch (err) {
        console.warn('External AI generation error, using universal synthesis engine:', err);
      }
    }

    // High-performance Universal Planner & Synthesis Engine
    return routeOrSynthesizeProject(prompt, techStackChoice);
  }

  public getConceptExplanation(
    conceptId: string,
    level: ExplanationLevel = 'beginner'
  ): ConceptExplanation {
    const explanations: Record<string, ConceptExplanation> = {
      functions_parameters: {
        concept: 'Pure Functions & Parameter Contracts',
        language: 'TypeScript / JavaScript',
        syntax: 'function calculate(prev: number, current: number, op: string): number',
        whatItDoes: 'Encapsulates reusable computational logic with declared inputs and predictable outputs with zero unintended side effects.',
        whyItExists: 'Decoupling pure calculations from rendering makes code easy to test, maintain, and reason about.',
        usedBy: 'Core Project Utilities',
        beginnerExplanation: 'Think of a function like a calculator button or recipe. You pass numbers in, and it reliably returns the answer without changing anything else in your app.',
        intermediateExplanation: 'Pure functions have referential transparency: given identical parameters, they always return the identical result with zero side effects.',
        advancedExplanation: 'V8 JIT optimizes pure numeric and string functions by inlining call-site bytecode and caching IC lookups.',
        commonPitfalls: ['Relying on external mutable variables', 'Failing to handle edge cases like zero or empty inputs'],
      },
      variables_types: {
        concept: 'Variables & Data Representation',
        language: 'JavaScript / TypeScript',
        syntax: 'const value: number = 42;',
        whatItDoes: 'Allocates and names memory slots for strings, numbers, booleans, and objects.',
        whyItExists: 'Provides clean semantics and contracts across component boundaries.',
        usedBy: 'types.ts',
        beginnerExplanation: 'Variables are like labeled storage boxes. const holds a box you cannot swap out, keeping your data predictable.',
        intermediateExplanation: 'TypeScript static typing ensures compile-time shape verification before executing runtime V8 JavaScript.',
        advancedExplanation: 'Primitive types in V8 (Smi, HeapNumber, String) use optimized memory allocations in young generation heap.',
        commonPitfalls: ['Accidental type coercion with == instead of ===', 'Uninitialized variables'],
      },
      ts_interfaces: {
        concept: 'TypeScript Interface',
        language: 'TypeScript',
        syntax: 'export interface Name { property: type; }',
        whatItDoes: 'Declares an explicit contract describing the structure and data types of an object.',
        whyItExists: 'In large applications, passing objects without contracts leads to typos and runtime crashes. Interfaces give instant compiler feedback and IDE autocomplete.',
        usedBy: 'types.ts',
        beginnerExplanation: 'Think of an interface like an ID card format or blueprint. It guarantees which properties exist on every object.',
        intermediateExplanation: 'TypeScript interfaces compile away to zero runtime JavaScript overhead while enforcing compile-time shape consistency.',
        advancedExplanation: 'Interfaces enable declaration merging, nominal-like structural typing checks via AST graph traversal, and zero-cost abstraction for V8 JIT shape optimization.',
        commonPitfalls: ['Marking fields as optional (?) when your UI requires them', 'Confusing type aliases with interfaces'],
      },
      array_methods: {
        concept: 'Array Methods (map, filter, reduce)',
        language: 'JavaScript / TypeScript',
        syntax: 'array.filter(item => item.active)',
        whatItDoes: 'Transforms, aggregates, or filters arrays declaratively without mutating the original collection.',
        whyItExists: 'Functional programming methods make code predictable, concise, and safe by avoiding manual loop index tracking and accidental variable mutations.',
        usedBy: 'App.tsx, components',
        beginnerExplanation: 'Instead of counting items on your fingers with a manual "for" loop, array methods give you powerful helpers that filter or transform collections in one clean step.',
        intermediateExplanation: 'Higher-order array methods preserve immutability by returning new collections or primitive values rather than mutating the caller array in-place.',
        advancedExplanation: 'V8 optimizes contiguous array iterations with Monomorphic ICs when callback signatures remain stable, minimizing garbage collection allocations.',
        commonPitfalls: ['Forgetting to specify the initial value in reduce', 'Calling array methods on undefined or null values'],
      },
      state_immutability: {
        concept: 'State Immutability in React',
        language: 'React / JavaScript',
        syntax: 'setItems(prev => [...prev, newItem])',
        whatItDoes: 'Replaces previous state with a newly allocated reference rather than altering the existing memory location.',
        whyItExists: 'React uses shallow equality checks (oldRef === newRef) to detect changes. If you mutate an array in place, React sees the same pointer and refuses to update your screen.',
        usedBy: 'App.tsx',
        beginnerExplanation: 'Think of your state like a snapshot photograph. You don\'t paint over the old photograph; you take a brand new photograph with the new item included!',
        intermediateExplanation: 'Immutable updates ensure predictable time-travel debugging, allow pure component memoization (React.memo), and ensure reliable concurrency in React 18+ Fiber reconciler.',
        advancedExplanation: 'The Fiber reconciler compares workInProgress fiber alternate pointers. In-place mutation breaks the referential transparency of memoized selector graphs.',
        commonPitfalls: ['Using array.push() directly on state variables', 'Mutating state objects in place'],
      },
      react_state: {
        concept: 'React State (useState)',
        language: 'React / TypeScript',
        syntax: 'const [state, setState] = useState(initialValue);',
        whatItDoes: 'Stores values that survive between component renders and triggers a DOM reconciliation whenever updated.',
        whyItExists: 'Standard JavaScript variables reset to their initial value every time a component function executes. useState gives components long-term memory.',
        usedBy: 'App.tsx',
        beginnerExplanation: 'State is like a sticky note on your component. It holds your input text or active items, keeping it safe even when the page updates.',
        intermediateExplanation: 'useState returns a state value and a dispatch function. Updates are scheduled in React Fiber work queues and batched for optimal DOM rendering performance.',
        advancedExplanation: 'Hooks are stored as a singly linked list on the fiber node (`fiber.memoizedState`). The order of hook calls must remain strictly invariant across renders.',
        commonPitfalls: ['Calling useState inside conditional if blocks or loops', 'Expecting state variables to update synchronously right on the next line'],
      },
    };

    if (explanations[conceptId]) {
      return explanations[conceptId];
    }

    // Dynamic, tech-stack-accurate concept generator for imported projects & custom stacks
    const cLower = conceptId.toLowerCase();
    const isHtmlCss = cLower.includes('html') || cLower.includes('css') || cLower.includes('dom') || cLower.includes('style');
    const isPython = cLower.includes('python') || cLower.includes('py');
    const isCompiled = cLower.includes('cpp') || cLower.includes('c++') || cLower.includes('java');

    if (isHtmlCss) {
      return {
        concept: 'HTML5 Semantic Layout & CSS Styling Architecture',
        language: 'HTML5 / CSS3 / Vanilla JavaScript',
        syntax: '.nav-btn { display: flex; align-items: center; padding: 0 24px; height: 64px; }',
        whatItDoes: 'Structures document landmarks and presentation rules for buttons, navigation, and menu card grids.',
        whyItExists: 'Decouples visual styling from content markup, creating responsive interfaces that adapt smoothly across mobile and desktop viewports.',
        usedBy: 'HTML & CSS Stylesheets',
        beginnerExplanation: 'Think of HTML as the skeleton of the building and CSS as the paint, windows, and layout design that makes it visually engaging and comfortable to navigate.',
        intermediateExplanation: 'Combines CSS Box Model rules (padding, margin, border) with modern Flexbox formatting contexts to achieve fluid, dynamic alignment without layout shifts.',
        advancedExplanation: 'Leverages CSS custom properties (variables) and hardware-accelerated transforms for optimal browser compositing passes with 60fps scrolling.',
        commonPitfalls: ['Forgetting to set box-sizing: border-box', 'Hardcoding fixed pixel widths that cause overflow on mobile screens'],
      };
    }

    if (isPython) {
      return {
        concept: 'Python Computational Routines & Data Contracts',
        language: 'Python 3',
        syntax: 'def calculate_total(items: list) -> float:',
        whatItDoes: 'Encapsulates data transformations and mathematical routines with clean indentation and type hints.',
        whyItExists: 'Provides clean procedural and object-oriented abstractions that are readable, maintainable, and easily unit-tested.',
        usedBy: 'Python Modules & Services',
        beginnerExplanation: 'In Python, code blocks are defined by indentation. Functions take inputs, perform operations, and return the result cleanly.',
        intermediateExplanation: 'Utilizes list comprehensions and generators for memory-efficient lazy evaluation across collections.',
        advancedExplanation: 'Python bytecode executes on the CPython evaluation loop with dynamic dispatch and GIL thread synchronization.',
        commonPitfalls: ['Using mutable default arguments like def fn(x=[])', 'Indentation mismatch errors between tabs and spaces'],
      };
    }

    if (isCompiled) {
      return {
        concept: 'Compiled Language Control Flow & Branch Dispatch',
        language: 'C++ / Java',
        syntax: 'switch (operator) { case \'+\': return prev + current; }',
        whatItDoes: 'Executes high-speed conditional branching and arithmetic calculations directly in hardware registers.',
        whyItExists: 'Provides maximum execution speed and type safety for systems, financial calculations, and numerical engines.',
        usedBy: 'Core Engine Classes',
        beginnerExplanation: 'Compiled code runs directly on your computer processor. Switch statements jump immediately to the matching case without checking every option.',
        intermediateExplanation: 'Compiles into jump tables enabling O(1) branch dispatch rather than sequential O(N) comparisons.',
        advancedExplanation: 'Optimized into assembly jump tables with CPU branch prediction cache alignment.',
        commonPitfalls: ['Forgetting break statements in switch cases', 'Division by zero without IEEE 754 NaN guards'],
      };
    }

    return {
      concept: 'Application Architecture & Component Logic',
      language: 'Software Engineering',
      syntax: 'export function Component() { /* Implementation */ }',
      whatItDoes: 'Structures modular routines, state management, and visual presentation.',
      whyItExists: 'Separates concerns into cohesive, maintainable modules that can be tested and scaled.',
      usedBy: 'Application Modules',
      beginnerExplanation: 'Organizes your code into clear, readable sections so each part has a specific responsibility.',
      intermediateExplanation: 'Maintains unidirectional data flow and clean separation of concerns across project files.',
      advancedExplanation: 'Optimized for modular bundling, memory efficiency, and deterministic execution lifecycles.',
      commonPitfalls: ['Mixing business logic directly inside presentation templates', 'Unclear naming conventions'],
    };
  }

  public async generateChatResponse(
    message: string,
    context?: string,
    settings?: AISettings,
    repoContext?: {
      projectFiles?: Array<{ name: string; path?: string; content: string; language?: string }>;
      activeFile?: { name: string; content: string; language?: string };
      techStack?: { frontend?: string; language?: string; styling?: string; framework?: string };
      projectName?: string;
    }
  ): Promise<{ text: string }> {
    const raw = message.trim();
    const lower = raw.toLowerCase();
    const cleanTerm = raw.replace(/[?!.,;:()'"`]/g, '').trim();

    // Extract search candidates: whole phrase, plus individual words/tokens ignoring filler words
    const stopWords = new Set(['what', 'is', 'the', 'how', 'does', 'do', 'can', 'you', 'explain', 'tell', 'me', 'about', 'in', 'for', 'this', 'show', 'please', 'where', 'why']);
    const candidateTokens = raw
      .replace(/[?!.,;:()'"`]/g, ' ')
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length >= 2 && !stopWords.has(w.toLowerCase()));

    const searchTerms = Array.from(new Set([cleanTerm, ...candidateTokens])).filter(Boolean);

    // 1. Search repository files for the specific query term (e.g. "nav-btn", "navbar", "logo", "balance")
    const allFiles = repoContext?.projectFiles || [];
    const activeFile = repoContext?.activeFile;
    const filesToSearch = activeFile ? [activeFile, ...allFiles.filter(f => f.name !== activeFile.name)] : allFiles;

    let matchingRule = '';
    let matchingFileName = '';
    let matchType = '';
    let matchedToken = '';

    for (const term of searchTerms) {
      for (const file of filesToSearch) {
        if (!file.content) continue;
        const content = file.content;

        // Check for CSS class matching .term or id #term
        const cssClassRegex = new RegExp(`(\\.[a-zA-Z0-9_-]*${term}[a-zA-Z0-9_-]*\\s*\\{[^}]*\\})`, 'i');
        const cssMatch = content.match(cssClassRegex);
        if (cssMatch) {
          matchingRule = cssMatch[1].trim();
          matchingFileName = file.name;
          matchType = 'css';
          matchedToken = term;
          break;
        }

        // Check for HTML element with class="...term..."
        const htmlClassRegex = new RegExp(`(<[a-zA-Z0-9_-]+[^>]*class=["'][^"']*${term}[^"']*["'][^>]*>)`, 'i');
        const htmlMatch = content.match(htmlClassRegex);
        if (htmlMatch) {
          matchingRule = htmlMatch[1].trim();
          matchingFileName = file.name;
          matchType = 'html';
          matchedToken = term;
          break;
        }

        // Check for JavaScript/TypeScript function or variable
        const jsRegex = new RegExp(`(?:const|let|var|function|def)\\s+([a-zA-Z0-9_]*${term}[a-zA-Z0-9_]*)[^;\\n{]*`, 'i');
        const jsMatch = content.match(jsRegex);
        if (jsMatch) {
          matchingRule = jsMatch[0].trim();
          matchingFileName = file.name;
          matchType = 'js';
          matchedToken = term;
          break;
        }
      }
      if (matchingRule) break;
    }

    // If matching code definition found in repo, generate bespoke educational explanation!
    if (matchingRule) {
      const displayToken = matchedToken || cleanTerm;
      if (matchType === 'css') {
        return {
          text: `In **${repoContext?.projectName || 'this project'}**, \`${displayToken}\` is defined in \`${matchingFileName}\`:\n\n\`\`\`css\n${matchingRule}\n\`\`\`\n\n**What It Does:**\nThis CSS rule formats the interactive styling and layout for elements decorated with \`.${displayToken}\`. It specifies box dimensions, padding spacing, and uses Flexbox formatting so that button text and navigation icons align neatly. In this application, it provides accessible, visually distinct touch targets for users to navigate the portal.`
        };
      }
      if (matchType === 'html') {
        return {
          text: `In **${repoContext?.projectName || 'this project'}**, \`${displayToken}\` appears in \`${matchingFileName}\`:\n\n\`\`\`html\n${matchingRule}\n\`\`\`\n\n**What It Does:**\nThis structural HTML landmark establishes an interactive container for \`${displayToken}\`. It binds visual CSS styling and attaches DOM click events so users can interact with this component in the viewport.`
        };
      }
      if (matchType === 'js') {
        return {
          text: `In **${repoContext?.projectName || 'this project'}**, \`${displayToken}\` is declared in \`${matchingFileName}\`:\n\n\`\`\`javascript\n${matchingRule}\n\`\`\`\n\n**What It Does:**\nManages computational execution and data flow for \`${displayToken}\`. It coordinates parameters, transforms state, and updates the application interface when actions are triggered.`
        };
      }
    }

    // 2. Query regarding Repository Tech Stack, Architecture, or Prompt
    if (lower.includes('tech stack') || lower.includes('stack') || lower.includes('what is this repo') || lower.includes('architecture') || lower.includes('prompt')) {
      const stack = repoContext?.techStack;
      const proj = repoContext?.projectName || 'This repository';
      return {
        text: `### 🛠️ Architecture & Tech Stack for ${proj}\n\n- **Frontend / Markup**: ${stack?.frontend || 'HTML5 Semantic Layout & DOM'}\n- **Primary Language**: ${stack?.language || 'JavaScript / TypeScript'}\n- **Styling Architecture**: ${stack?.styling || 'CSS3 Flexbox & Grid System'}\n- **Repository Scale**: ${allFiles.length} files across the codebase\n\n**Project Purpose:**\nAn interactive web application featuring responsive navigation bars, dynamic catalog cards, and modular component hierarchy. You can inspect any file from the **Repository File Matrix** above to examine its complete implementation!`
      };
    }

    // 3. Questions regarding CSS, HTML, Flexbox, or Layout
    if (lower.includes('css') || lower.includes('flex') || lower.includes('grid') || lower.includes('style') || lower.includes('layout')) {
      return {
        text: `In this project's CSS architecture, layout containers use **CSS Flexbox** and the **Box Model** to achieve fluid alignment. Elements use semantic class selectors (like \`.navbar\`, \`.nav-btn\`, and \`.card\`) with CSS custom properties for uniform brand colors and spacing.`
      };
    }

    // 4. Questions regarding React State, Hooks
    if (lower.includes('state') || lower.includes('usestate') || lower.includes('hook')) {
      return {
        text: `React state (\`useState\`) maintains reactive component memory across renders. Calling the setter dispatches a Virtual DOM reconciliation pass and smoothly updates the viewport.`
      };
    }

    // 5. Questions regarding Functions, Logic & Bugs
    if (lower.includes('error') || lower.includes('bug') || lower.includes('fail') || lower.includes('fix')) {
      return {
        text: `Let's debug this: Check the syntax in your active editor. Compare your implementation against the **Reference Specification** on the left. Ensure all closing braces, quotation marks, and semicolons match the expected pattern.`
      };
    }

    // 6. Natural Language Contextual Response
    const activeFileName = repoContext?.activeFile?.name || 'the active file';
    const lang = repoContext?.activeFile?.language || repoContext?.techStack?.language || 'code';
    return {
      text: `Regarding "${raw}": In **${repoContext?.projectName || 'this project'}** (${activeFileName}), statements are structured following modern ${lang} standards. You can hover over any token in the Reference Specification to inspect its enclosing block, or use the editor on the right to test your implementation!`
    };
  }
}

export const aiService = new AIProviderService();

