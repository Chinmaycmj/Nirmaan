import { Project } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone } from '@/types/learning';

export function createJavaCalculatorProject(): {
  project: Project;
  checkpoints: LearningCheckpoint[];
  milestones: ProjectMilestone[];
} {
  const projectId = 'proj-java-calc';

  const mainJavaContent = `public class Main {
    public static void main(String[] args) {
        System.out.println("========================================");
        System.out.println("   NIRMAAN JAVA ENTERPRISE ENGINE       ");
        System.out.println("========================================");
        System.out.println("JVM Architecture: OpenJDK 21\\n");

        double[][] tests = {
            {15.0, 25.0},
            {50.0, 18.0},
            {6.0, 7.0},
            {42.0, 6.0},
            {10.0, 0.0}
        };
        char[] ops = {'+', '-', '*', '/', '/'};

        for (int i = 0; i < tests.length; i++) {
            double a = tests[i][0];
            double b = tests[i][1];
            char op = ops[i];
            double res = Calculator.calculate(a, b, op);

            System.out.printf("  %.1f %c %.1f = ", a, op, b);
            if (Double.isNaN(res)) {
                System.out.println("NaN (Guarded Division by Zero)");
            } else {
                System.out.printf("%.2f\\n", res);
            }
        }

        System.out.println("\\n[BUILD SUCCESSFUL - All Java calculations verified]");
    }
}
`;

  const calculatorJavaContent = `public class Calculator {
    /**
     * Pure static arithmetic calculation method.
     * Guards against division by zero by returning Double.NaN.
     */
    public static double calculate(double prev, double current, char op) {
        switch (op) {
            case '+':
                return prev + current;
            case '-':
                return prev - current;
            case '*':
            case 'x':
                return prev * current;
            case '/':
                if (current == 0.0) {
                    return Double.NaN;
                }
                return prev / current;
            default:
                return current;
        }
    }
}
`;

  const project: Project = {
    id: projectId,
    name: 'Java Enterprise Calculator',
    description: 'Object-oriented calculation engine built with OpenJDK standards, static class methods, and IEEE 754 NaN safety.',
    techStack: {
      frontend: 'JVM Terminal Stream',
      language: 'Java 21 (OOP)',
      styling: 'JVM Console Stream',
    },
    interventionLevel: 'guided',
    currentStage: 'Stage 1: Class Methods & Switch Cases',
    activeFileId: 'calculator-java',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    files: [
      {
        id: 'main-java',
        projectId,
        path: 'Main.java',
        name: 'Main.java',
        language: 'java' as any,
        content: mainJavaContent,
        version: 1,
        contributions: [
          {
            id: 'c1',
            fileId: 'main-java',
            startLine: 1,
            endLine: 35,
            authorType: 'AI_GENERATED',
            timestamp: Date.now(),
          },
        ],
      },
      {
        id: 'calculator-java',
        projectId,
        path: 'Calculator.java',
        name: 'Calculator.java',
        language: 'java' as any,
        content: calculatorJavaContent,
        version: 1,
        contributions: [
          {
            id: 'c2',
            fileId: 'calculator-java',
            startLine: 1,
            endLine: 25,
            authorType: 'AI_GENERATED',
            timestamp: Date.now(),
          },
        ],
      },
    ],
  };

  const checkpoints: LearningCheckpoint[] = [
    {
      id: 'step-1-java-calc',
      projectId,
      stepNumber: 1,
      title: 'Java Static Methods: Implement the Calculator',
      conceptId: 'java_methods',
      conceptName: 'Java Methods & Double.NaN',
      taskType: 'COMPLETE_CODE',
      language: 'java',
      prompt: 'Implement `public static double calculate(double prev, double current, char op)` in `Calculator.java`. Use a switch statement for +, -, *, and /. Return `Double.NaN` if current is 0.0.',
      contextExplanation: 'In Java, all code must reside within a class. Static methods can be invoked directly on the class (`Calculator.calculate(...)`) without instantiating objects.',
      realLifeExample: 'Think of an ATM bank teller kiosk. When you insert your card and choose an operation (`op`), the ATM follows strict banking protocols: if you request cash (`case \'-\'`), it computes your balance. If someone attempts an invalid transaction like withdrawing from an account with zero funds, the machine refuses and logs an audit exception (`Double.NaN`) rather than crashing the entire banking server!',
      targetFileId: 'calculator-java',
      initialCode: `public class Calculator {
    public static double calculate(double prev, double current, char op) {
        // YOUR JAVA CODE HERE
    }
}`,
      solutionCode: `public class Calculator {
    public static double calculate(double prev, double current, char op) {
        switch (op) {
            case '+': return prev + current;
            case '-': return prev - current;
            case '*': return prev * current;
            case '/':
                if (current == 0.0) return Double.NaN;
                return prev / current;
            default: return current;
        }
    }
}`,
      testCases: [
        {
          id: 'test-java-method',
          description: 'Declares public static double calculate(double prev, double current, char op)',
        },
        {
          id: 'test-java-switch',
          description: 'Uses switch(op) for arithmetic operations',
        },
        {
          id: 'test-java-nan',
          description: 'Returns Double.NaN on division by zero',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'Java Static Modifier',
          content: 'The `static` keyword means the method belongs to the `Calculator` class itself rather than a specific object instance.',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Handling Return in Switch',
          content: 'Each case in the switch block should directly `return` the computed calculation.',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'Double.NaN Constant',
          content: 'In Java, Not-a-Number is represented by the constant `Double.NaN`.',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Full Java Method',
          content: `public static double calculate(double prev, double current, char op) {\n    switch (op) {\n        case '+': return prev + current;\n        case '-': return prev - current;\n        case '*': return prev * current;\n        case '/':\n            if (current == 0.0) return Double.NaN;\n            return prev / current;\n        default: return current;\n    }\n}`,
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
      title: 'Java Class Architecture',
      description: 'Implemented static class methods with Double.NaN safety.',
      conceptName: 'Java Methods',
      timestamp: Date.now(),
      targetFile: 'Calculator.java',
      completed: false,
    },
  ];

  return { project, checkpoints, milestones };
}
