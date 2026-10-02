import { AISettings, ConceptExplanation, ExplanationLevel } from '@/types/ai';
import { createExpenseTrackerProject } from './curriculum/expenseTracker';
import { createTaskManagerProject } from './curriculum/taskManager';
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
    experienceLevel: string,
    preference: string
  ): Promise<{
    project: Project;
    checkpoints: LearningCheckpoint[];
    milestones: ProjectMilestone[];
  }> {
    const lower = prompt.toLowerCase();

    // Built-in intelligent curricula
    if (lower.includes('expense') || lower.includes('budget') || lower.includes('finance') || lower.includes('money')) {
      return createExpenseTrackerProject();
    }

    if (lower.includes('task') || lower.includes('todo') || lower.includes('project') || lower.includes('kanban')) {
      return createTaskManagerProject();
    }

    // Default to the comprehensive Expense Tracker project if prompt is general
    return createExpenseTrackerProject();
  }

  public getConceptExplanation(
    conceptId: string,
    level: ExplanationLevel = 'beginner'
  ): ConceptExplanation {
    const explanations: Record<string, ConceptExplanation> = {
      ts_interfaces: {
        concept: 'TypeScript Interface',
        language: 'TypeScript',
        syntax: 'export interface Name { property: type; }',
        whatItDoes: 'Declares an explicit contract describing the structure and data types of an object.',
        whyItExists: 'In large applications, passing objects without contracts leads to typos and runtime crashes. Interfaces give instant compiler feedback and IDE autocomplete.',
        usedBy: 'ExpenseForm.tsx, ExpenseList.tsx, SummaryCards.tsx',
        beginnerExplanation: 'Think of an interface like a recipe ingredient list or a driver license format. It makes sure every expense has a title, an amount, and a category before you can use it.',
        intermediateExplanation: 'TypeScript interfaces compile away to zero runtime JavaScript overhead while enforcing compile-time shape consistency and enabling IDE auto-complete.',
        advancedExplanation: 'Interfaces enable declaration merging, nominal-like structural typing checks via AST graph traversal, and zero-cost abstraction for V8 JIT shape optimization.',
        commonPitfalls: ['Marking fields as optional (?) when your UI requires them', 'Confusing type aliases with interfaces'],
      },
      array_methods: {
        concept: 'Array Methods (reduce, map, filter)',
        language: 'JavaScript / TypeScript',
        syntax: 'array.reduce((acc, curr) => acc + curr.amount, 0)',
        whatItDoes: 'Transforms, aggregates, or filters arrays declaratively without mutating the original collection.',
        whyItExists: 'Functional programming methods make code predictable, concise, and safe by avoiding manual loop index tracking and accidental variable mutations.',
        usedBy: 'SummaryCards.tsx (total calculations), ExpenseList.tsx (deletions)',
        beginnerExplanation: 'Instead of counting items on your fingers with a manual "for" loop, reduce gives you a calculator accumulator that adds every price up in one smooth step.',
        intermediateExplanation: 'Higher-order array methods preserve immutability by returning new collections or primitive values rather than mutating the caller array in-place.',
        advancedExplanation: 'V8 optimizes contiguous array iterations with Monomorphic ICs when callback signatures remain stable, minimizing garbage collection allocations.',
        commonPitfalls: ['Forgetting to specify the initial value (e.g. 0)', 'Calling array methods on undefined or null values'],
      },
      state_immutability: {
        concept: 'State Immutability',
        language: 'React / JavaScript',
        syntax: 'setExpenses(prev => [...prev, newExpense])',
        whatItDoes: 'Replaces previous state with a newly allocated reference rather than altering the existing memory location.',
        whyItExists: 'React uses shallow equality checks (oldRef === newRef) to detect changes. If you mutate an array in place, React sees the same pointer and refuses to update your screen.',
        usedBy: 'App.tsx (handleAddExpense, handleDeleteExpense)',
        beginnerExplanation: 'Think of your state like a snapshot photograph. You don\'t paint over the old photograph; you take a brand new photograph with the new item included!',
        intermediateExplanation: 'Immutable updates ensure predictable time-travel debugging, allow pure component memoization (React.memo), and ensure reliable concurrency in React 18+ Fiber reconciler.',
        advancedExplanation: 'The Fiber reconciler compares workInProgress fiber alternate pointers. In-place mutation breaks the referential transparency of memoized selector graphs.',
        commonPitfalls: ['Using array.push() or array.splice() directly on state variables', 'Shallow copying deeply nested objects without copying nested references'],
      },
      react_state: {
        concept: 'React State (useState)',
        language: 'React / TypeScript',
        syntax: 'const [state, setState] = useState(initialValue);',
        whatItDoes: 'Stores values that survive between component renders and triggers a DOM reconciliation whenever updated.',
        whyItExists: 'Standard JavaScript variables reset to their initial value every time a component function executes. useState gives components long-term memory.',
        usedBy: 'App.tsx, ExpenseForm.tsx',
        beginnerExplanation: 'State is like a sticky note on your component. It holds your input text or your list of expenses, keeping it safe even when the page updates.',
        intermediateExplanation: 'useState returns a state value and a dispatch function. Updates are scheduled in React Fiber work queues and batched for optimal DOM rendering performance.',
        advancedExplanation: 'Hooks are stored as a singly linked list on the fiber node (`fiber.memoizedState`). The order of hook calls must remain strictly invariant across renders.',
        commonPitfalls: ['Calling useState inside conditional if blocks or loops', 'Expecting state variables to update synchronously right on the next line'],
      },
      conditional_rendering: {
        concept: 'Conditional Rendering',
        language: 'React / JSX',
        syntax: 'condition ? <ComponentA /> : <ComponentB />',
        whatItDoes: 'Dynamically shows or hides UI elements based on current application data and boolean state.',
        whyItExists: 'Applications have dynamic states: loading spinners, empty states, error banners, and success confirmations. Conditional rendering handles all of them gracefully.',
        usedBy: 'ExpenseList.tsx (Empty state vs Transactions)',
        beginnerExplanation: 'It is like a traffic light for your website. If there are no expenses yet, show a friendly note; otherwise, show the transaction cards.',
        intermediateExplanation: 'Using ternaries or guard clauses (`condition && <Element />`) allows declarative DOM branch switching while keeping JSX expressions pure.',
        advancedExplanation: 'React reconciles distinct element types by destroying and recreating the sub-tree DOM nodes when conditional root keys or component types alternate.',
        commonPitfalls: ['Accidentally rendering 0 on screen when doing `array.length && <List />`', 'Nesting too many ternaries, making JSX unreadable'],
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
}

export const aiService = new AIProviderService();
