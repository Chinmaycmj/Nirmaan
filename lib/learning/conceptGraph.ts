import { Concept } from '@/types/learning';

export const KNOWLEDGE_GRAPH_CONCEPTS: Record<string, Concept> = {
  'variables_types': {
    id: 'variables_types',
    name: 'Variables & Data Types',
    category: 'Syntax & Fundamentals',
    difficulty: 'beginner',
    description: 'Declaring values with const/let and understanding strings, numbers, booleans, and TypeScript primitive types.',
    prerequisites: [],
  },
  'functions_parameters': {
    id: 'functions_parameters',
    name: 'Functions & Parameters',
    category: 'Functions & Logic',
    difficulty: 'beginner',
    description: 'Writing reusable blocks of code, passing parameters, and returning calculated values.',
    prerequisites: ['variables_types'],
  },
  'arrow_functions': {
    id: 'arrow_functions',
    name: 'Arrow Functions',
    category: 'Functions & Logic',
    difficulty: 'beginner',
    description: 'Concise modern ES6 function syntax and lexical scoping.',
    prerequisites: ['functions_parameters'],
  },
  'arrays_objects': {
    id: 'arrays_objects',
    name: 'Arrays & Objects',
    category: 'Data Structures',
    difficulty: 'beginner',
    description: 'Structuring collections of data, key-value pairs, and nested models.',
    prerequisites: ['variables_types'],
  },
  'ts_interfaces': {
    id: 'ts_interfaces',
    name: 'TypeScript Interfaces',
    category: 'Syntax & Fundamentals',
    difficulty: 'beginner',
    description: 'Defining explicit contracts and shapes for objects to ensure type safety.',
    prerequisites: ['arrays_objects'],
  },
  'array_methods': {
    id: 'array_methods',
    name: 'Array Methods (map, filter, reduce)',
    category: 'Data Structures',
    difficulty: 'intermediate',
    description: 'Transforming, filtering, and aggregating collections declaratively without manual loops.',
    prerequisites: ['arrays_objects', 'arrow_functions'],
  },
  'jsx_syntax': {
    id: 'jsx_syntax',
    name: 'JSX & Layout Structure',
    category: 'React Core',
    difficulty: 'beginner',
    description: 'Writing HTML-like syntax inside JavaScript to define UI structure declaratively.',
    prerequisites: ['functions_parameters'],
  },
  'react_components': {
    id: 'react_components',
    name: 'React Components',
    category: 'React Core',
    difficulty: 'beginner',
    description: 'Building isolated, reusable UI blocks that compose together.',
    prerequisites: ['jsx_syntax'],
  },
  'component_props': {
    id: 'component_props',
    name: 'Component Props',
    category: 'React Core',
    difficulty: 'beginner',
    description: 'Passing data downwards from parent components to child components.',
    prerequisites: ['react_components', 'ts_interfaces'],
  },
  'react_state': {
    id: 'react_state',
    name: 'React State (useState)',
    category: 'State & Hooks',
    difficulty: 'beginner',
    description: 'Managing dynamic, reactive component memory that triggers re-renders on update.',
    prerequisites: ['react_components'],
  },
  'state_immutability': {
    id: 'state_immutability',
    name: 'State Immutability',
    category: 'State & Hooks',
    difficulty: 'intermediate',
    description: 'Updating state without mutating previous state objects using spread operators (...).',
    prerequisites: ['react_state', 'arrays_objects'],
  },
  'event_handling': {
    id: 'event_handling',
    name: 'Event Handling & Forms',
    category: 'Events & Forms',
    difficulty: 'beginner',
    description: 'Responding to user interactions (onClick, onChange, onSubmit) and managing controlled inputs.',
    prerequisites: ['react_state', 'arrow_functions'],
  },
  'conditional_rendering': {
    id: 'conditional_rendering',
    name: 'Conditional Rendering',
    category: 'React Core',
    difficulty: 'beginner',
    description: 'Displaying different UI elements based on state conditions (ternaries and short-circuit &&).',
    prerequisites: ['react_state', 'jsx_syntax'],
  },
  'async_await': {
    id: 'async_await',
    name: 'Async/Await & Promises',
    category: 'Async & APIs',
    difficulty: 'intermediate',
    description: 'Handling asynchronous operations and network calls cleanly without callback hell.',
    prerequisites: ['functions_parameters'],
  },
  'api_fetching': {
    id: 'api_fetching',
    name: 'API Fetching & useEffect',
    category: 'Async & APIs',
    difficulty: 'intermediate',
    description: 'Communicating with backend endpoints and synchronizing external data with React components.',
    prerequisites: ['async_await', 'react_state'],
  },
  'component_architecture': {
    id: 'component_architecture',
    name: 'Component Architecture & Separation of Concerns',
    category: 'Architecture & Clean Code',
    difficulty: 'intermediate',
    description: 'Splitting complex views into focused presentation components, forms, and business logic.',
    prerequisites: ['react_components', 'component_props'],
  },
};

export function getPrerequisiteChain(conceptId: string): string[] {
  const chain: string[] = [];
  const visited = new Set<string>();

  function traverse(id: string) {
    if (visited.has(id) || !KNOWLEDGE_GRAPH_CONCEPTS[id]) return;
    visited.add(id);
    const prereqs = KNOWLEDGE_GRAPH_CONCEPTS[id].prerequisites;
    for (const prereqId of prereqs) {
      traverse(prereqId);
      if (!chain.includes(prereqId)) {
        chain.push(prereqId);
      }
    }
  }

  traverse(conceptId);
  return chain;
}

export function arePrerequisitesMet(conceptId: string, masteredIds: Set<string>): boolean {
  const concept = KNOWLEDGE_GRAPH_CONCEPTS[conceptId];
  if (!concept) return true;
  return concept.prerequisites.every(p => masteredIds.has(p));
}
