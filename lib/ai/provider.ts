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

    return explanations[conceptId] || {
      concept: 'Programming Concept',
      language: 'TypeScript / React',
      syntax: 'Syntax pattern',
      whatItDoes: 'Encapsulates modular logic in the application.',
      whyItExists: 'Provides clean separation of concerns and maintainability.',
      usedBy: 'Project Components',
      beginnerExplanation: 'This code helps your application organize data and respond to user actions.',
      intermediateExplanation: 'Follows idiomatic React and TypeScript paradigms for maintainable frontends.',
      advancedExplanation: 'Optimized for modularity, type inference, and React Fiber render scheduling.',
      commonPitfalls: ['Unclear variable naming', 'Lack of error boundary protection'],
    };
  }

  public async generateChatResponse(
    message: string,
    context?: string,
    settings?: AISettings
  ): Promise<{ text: string }> {
    const lower = message.toLowerCase();
    if (lower.includes('why') || lower.includes('exist')) {
      return {
        text: `In this architecture, components and utilities are separated to ensure high cohesion and loose coupling. Keeping business calculations pure makes them 100% testable and predictable.`
      };
    }
    if (lower.includes('state') || lower.includes('usestate')) {
      return {
        text: `React state (useState) provides component-level memory across re-renders. When updated via the setter, React's Fiber reconciler schedules a virtual DOM diff and smoothly patches the real DOM.`
      };
    }
    if (lower.includes('type') || lower.includes('interface')) {
      return {
        text: `TypeScript interfaces establish compile-time contracts. They define the shape of your data without adding any runtime overhead in the compiled JavaScript.`
      };
    }
    if (lower.includes('error') || lower.includes('bug') || lower.includes('fail')) {
      return {
        text: `Let's break this down: Check your function parameters and return statement. Look at the hints tab above for progressive guidance from conceptual hints to partial solutions.`
      };
    }
    return {
      text: `Great question regarding "${message}". In ${context || 'this project'}, we maintain strict TypeScript type safety and idiomatic React component patterns. Check the live preview on the right or explore the Code tab to see how the pieces connect!`
    };
  }
}

export const aiService = new AIProviderService();
