import { Project } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone } from '@/types/learning';

export function createPythonCalculatorProject(): {
  project: Project;
  checkpoints: LearningCheckpoint[];
  milestones: ProjectMilestone[];
} {
  const projectId = 'proj-python-calc';

  const mainPyContent = `# ==============================================================================
# NIRMAAN PYTHON CALCULATOR ENGINE
# ==============================================================================
from calculator import calculate, format_result

def main():
    print("========================================")
    print("   NIRMAAN PYTHON CALCULATOR ENGINE     ")
    print("========================================")
    print("Supported operators: +, -, *, /\\n")

    # Sample batch calculations demonstration
    tests = [
        (15, 25, '+'),
        (50, 18, '-'),
        (6, 7, '*'),
        (42, 6, '/'),
        (10, 0, '/')
    ]

    for a, b, op in tests:
        res = calculate(a, b, op)
        print(f"  {a} {op} {b} = {format_result(res)}")

    print("\\nAll algorithmic assertions verified successfully!")

if __name__ == "__main__":
    main()
`;

  const calculatorPyContent = `import math

def calculate(prev, current, op):
    """
    Performs binary arithmetic operation.
    Guards against division by zero by returning float('nan').
    """
    if op == '+':
        return prev + current
    elif op == '-':
        return prev - current
    elif op == '*' or op == '×':
        return prev * current
    elif op == '/' or op == '÷':
        if current == 0:
            return float('nan')
        return prev / current
    return current

def format_result(val):
    """
    Formats the numeric result for clean terminal presentation.
    """
    if math.isnan(val):
        return "Error (Division by Zero)"
    if isinstance(val, float) and val.is_integer():
        return str(int(val))
    return str(round(val, 6))
`;

  const project: Project = {
    id: projectId,
    name: 'Python Calculator Engine',
    description: 'Command-line arithmetic engine built in idiomatic Python 3 with error handling and precision formatting.',
    techStack: {
      frontend: 'Interactive Terminal Output',
      language: 'Python 3',
      styling: 'CLI Stream',
    },
    interventionLevel: 'guided',
    currentStage: 'Stage 1: Core Calculation Logic',
    activeFileId: 'calculator-py',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    files: [
      {
        id: 'main-py',
        projectId,
        path: 'main.py',
        name: 'main.py',
        language: 'python' as any,
        content: mainPyContent,
        version: 1,
        contributions: [
          {
            id: 'c1',
            fileId: 'main-py',
            startLine: 1,
            endLine: 30,
            authorType: 'AI_GENERATED',
            timestamp: Date.now(),
          },
        ],
      },
      {
        id: 'calculator-py',
        projectId,
        path: 'calculator.py',
        name: 'calculator.py',
        language: 'python' as any,
        content: calculatorPyContent,
        version: 1,
        contributions: [
          {
            id: 'c2',
            fileId: 'calculator-py',
            startLine: 1,
            endLine: 35,
            authorType: 'AI_GENERATED',
            timestamp: Date.now(),
          },
        ],
      },
    ],
  };

  const checkpoints: LearningCheckpoint[] = [
    {
      id: 'step-1-py-calc',
      projectId,
      stepNumber: 1,
      title: 'Python Functions: Binary Arithmetic Engine',
      conceptId: 'python_functions',
      conceptName: 'Python Functions & Error Handling',
      taskType: 'COMPLETE_CODE',
      language: 'python',
      prompt: 'Implement `def calculate(prev, current, op):` in Python using `if/elif/else` statements for +, -, *, and /. Guard against division by zero by returning `float("nan")`.',
      contextExplanation: 'In Python, functions are first-class citizens. Writing pure arithmetic functions ensures deterministic results and prevents runtime ZeroDivisionError exceptions.',
      realLifeExample: 'Think of a digital postage meter at the post office. When you place a package on the scale (`prev`) and enter destination weight units (`current`) with a shipping speed operator (`op`), the meter computes the exact postage rate (`return prev * rate`). If you accidentally enter 0 packages to divide bulk postage (`dividing by zero`), the meter LCD flashes "NaN / Invalid Parcel" rather than crashing the post office database!',
      targetFileId: 'calculator-py',
      initialCode: `def calculate(prev, current, op):
    # YOUR PYTHON CODE HERE
`,
      solutionCode: `def calculate(prev, current, op):
    if op == '+':
        return prev + current
    elif op == '-':
        return prev - current
    elif op == '*' or op == '×':
        return prev * current
    elif op == '/' or op == '÷':
        if current == 0:
            return float('nan')
        return prev / current
    return current
`,
      testCases: [
        {
          id: 'test-py-add',
          description: 'Calculates addition (15 + 25 = 40)',
          assertionFn: 'return calculate(15, 25, "+") == 40',
        },
        {
          id: 'test-py-multiply',
          description: 'Calculates multiplication (6 * 7 = 42)',
          assertionFn: 'return calculate(6, 7, "*") == 42',
        },
        {
          id: 'test-py-zero-division',
          description: 'Guards against division by zero returning NaN',
          assertionFn: 'import math; return math.isnan(calculate(10, 0, "/"))',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Conditionals in Python',
          content: 'Use `if`, `elif`, and `else` blocks to check which operator string was passed.',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Zero Division Guard',
          content: 'In Python, `x / 0` throws a ZeroDivisionError. Check `if current == 0:` before performing division.',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Python NaN Syntax',
          content: 'In Python, you can generate Not-a-Number using `float("nan")`.',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Full Python Function',
          content: `def calculate(prev, current, op):\n    if op == '+':\n        return prev + current\n    elif op == '-':\n        return prev - current\n    elif op == '*' or op == '×':\n        return prev * current\n    elif op == '/' or op == '÷':\n        return float('nan') if current == 0 else prev / current\n    return current`,
        },
      ],
      status: 'IN_PROGRESS',
      attempts: 0,
      hintsUsed: 0,
    },
  ];

  const milestones: ProjectMilestone[] = [
    {
      id: 'm1',
      projectId,
      stepNumber: 1,
      title: 'Python Arithmetic Logic',
      description: 'Implemented pure arithmetic operations with zero-division handling.',
      conceptName: 'Python Functions',
      timestamp: Date.now(),
      targetFile: 'calculator.py',
      completed: false,
    },
  ];

  return { project, checkpoints, milestones };
}
