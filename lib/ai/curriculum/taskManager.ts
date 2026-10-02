import { Project, ProjectFile } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone } from '@/types/learning';

export function createTaskManagerProject(): {
  project: Project;
  checkpoints: LearningCheckpoint[];
  milestones: ProjectMilestone[];
} {
  const files: ProjectFile[] = [
    {
      id: 'file-task-types',
      projectId: 'proj-task-manager',
      path: 'src/types.ts',
      name: 'types.ts',
      language: 'typescript',
      version: 1,
      content: `export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  dueDate: string;
}
`,
      contributions: [
        {
          id: 'c-1',
          fileId: 'file-task-types',
          startLine: 1,
          endLine: 10,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
    {
      id: 'file-task-item',
      projectId: 'proj-task-manager',
      path: 'src/components/TaskItem.tsx',
      name: 'TaskItem.tsx',
      language: 'tsx',
      version: 1,
      content: `import React from 'react';
import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  const priorityColors = {
    low: 'bg-blue-50 text-blue-700 border-blue-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    high: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
        />
        <span className={\`text-sm font-medium \${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}\`}>
          {task.title}
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <span className={\`text-xs px-2.5 py-1 rounded-full font-medium border \${priorityColors[task.priority]}\`}>
          {task.priority}
        </span>
        <button
          onClick={() => onDelete(task.id)}
          className="text-slate-400 hover:text-red-500 text-xs px-2 py-1 rounded"
        >
          Remove
        </button>
      </div>
    </div>
  );
};
`,
      contributions: [
        {
          id: 'c-2',
          fileId: 'file-task-item',
          startLine: 1,
          endLine: 45,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
    {
      id: 'file-task-app',
      projectId: 'proj-task-manager',
      path: 'src/App.tsx',
      name: 'App.tsx',
      language: 'tsx',
      version: 1,
      content: `import React, { useState } from 'react';
import { Task, Priority } from './types';
import { TaskItem } from './components/TaskItem';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Complete React Components checkpoint', completed: true, priority: 'high', dueDate: 'Today' },
    { id: '2', title: 'Review TypeScript interfaces', completed: false, priority: 'medium', dueDate: 'Tomorrow' },
    { id: '3', title: 'Connect Live Preview inspector', completed: false, priority: 'high', dueDate: 'Today' },
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      completed: false,
      priority: newPriority,
      dueDate: 'Soon',
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTitle('');
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10 font-sans">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Focus Task Hub</h1>
            <p className="text-slate-500 text-sm mt-1">
              Completed {completedCount} of {tasks.length} tasks
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
            ✓
          </div>
        </header>

        <form onSubmit={handleAddTask} className="mb-6 flex gap-3">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as Priority)}
            className="px-3 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-colors"
          >
            Add Task
          </button>
        </form>

        <div className="space-y-3">
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
`,
      contributions: [
        {
          id: 'c-3',
          fileId: 'file-task-app',
          startLine: 1,
          endLine: 95,
          authorType: 'AI_GENERATED',
          timestamp: Date.now(),
        },
      ],
    },
  ];

  const checkpoints: LearningCheckpoint[] = [
    {
      id: 'chk-t-1',
      projectId: 'proj-task-manager',
      stepNumber: 1,
      title: 'Implement Task Toggle Function',
      conceptId: 'react_state',
      conceptName: 'Array Mapping & State Update',
      taskType: 'COMPLETE_CODE',
      targetFileId: 'file-task-app',
      prompt: 'Complete the `toggleTaskById(tasks, targetId)` helper function. It must return a new array where the task with `id === targetId` has its `completed` property inverted (`!t.completed`), while keeping all other tasks unchanged.',
      contextExplanation: 'When toggling a single item inside an array in React state, `array.map()` allows you to inspect each element, transform the target object with `{ ...t, completed: !t.completed }`, and leave the rest untouched.',
      initialCode: `function toggleTaskById(tasks, targetId) {
  // YOUR CODE: Return tasks.map(...)
}
`,
      solutionCode: `function toggleTaskById(tasks, targetId) {
  return tasks.map(t => (t.id === targetId ? { ...t, completed: !t.completed } : t));
}
`,
      testCases: [
        {
          id: 'tc-t-1',
          description: 'Inverts completed status of target task',
          assertionFn: 'const list = [{ id: "1", completed: false }, { id: "2", completed: true }]; const res = toggleTaskById(list, "1"); return res[0].completed === true && res[1].completed === true;',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Mapping Over State',
          content: '`map` creates a new array of the same length by applying your callback function to each item.',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Ternary inside map',
          content: 'Return `item.id === targetId ? { ...item, completed: !item.completed } : item`.',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Syntax Expression',
          content: '`return tasks.map(t => (t.id === targetId ? { ...t, completed: !t.completed } : t));`',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Full Function',
          content: `function toggleTaskById(tasks, targetId) {
  return tasks.map(t => (t.id === targetId ? { ...t, completed: !t.completed } : t));
}`,
        },
      ],
      status: 'IN_PROGRESS',
      attempts: 0,
      hintsUsed: 0,
      whatChangedInPreview: 'Clicking any checkbox now toggles the task completion and line-through styling!',
    },
  ];

  const milestones: ProjectMilestone[] = [
    {
      id: 'm-t-1',
      projectId: 'proj-task-manager',
      stepNumber: 1,
      title: 'Created Task Management Core',
      description: 'Scaffolded task list, priority tags, and form input.',
      conceptName: 'React Components',
      timestamp: Date.now() - 3600000,
      targetFile: 'src/App.tsx',
      completed: true,
    },
  ];

  const project: Project = {
    id: 'proj-task-manager',
    name: 'Modern Task Manager',
    description: 'An interactive productivity application to master array transformations, React state, and component props.',
    techStack: {
      frontend: 'React 18',
      language: 'TypeScript',
      styling: 'Tailwind CSS',
    },
    interventionLevel: 'guided',
    currentStage: 'Interactive State & Filtering',
    activeFileId: 'file-task-app',
    files,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now(),
  };

  return { project, checkpoints, milestones };
}
