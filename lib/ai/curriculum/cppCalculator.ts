import { Project } from '@/types/project';
import { LearningCheckpoint, ProjectMilestone } from '@/types/learning';

export function createCppCalculatorProject(): {
  project: Project;
  checkpoints: LearningCheckpoint[];
  milestones: ProjectMilestone[];
} {
  const projectId = 'proj-cpp-calc';

  const mainCppContent = `#include <iostream>
#include <iomanip>
#include <cmath>
#include "calculator.h"

int main() {
    std::cout << "========================================" << std::endl;
    std::cout << "   NIRMAAN C++ PRECISION CALCULATOR     " << std::endl;
    std::cout << "========================================" << std::endl;
    std::cout << "Compiled with: g++ -std=c++20 -O3\\n" << std::endl;

    double testCases[][2] = {
        {15.0, 25.0},
        {50.0, 18.0},
        {6.0, 7.0},
        {42.0, 6.0},
        {10.0, 0.0}
    };
    char ops[] = {'+', '-', '*', '/', '/'};

    for (int i = 0; i < 5; ++i) {
        double a = testCases[i][0];
        double b = testCases[i][1];
        char op = ops[i];
        double res = calculate(a, b, op);

        std::cout << "  " << a << " " << op << " " << b << " = ";
        if (std::isnan(res)) {
            std::cout << "nan (Guarded Division by Zero)" << std::endl;
        } else {
            std::cout << std::setprecision(6) << res << std::endl;
        }
    }

    std::cout << "\\n[Process completed with exit code 0]" << std::endl;
    return 0;
}
`;

  const calculatorHContent = `#ifndef CALCULATOR_H
#define CALCULATOR_H

#include <cmath>

/**
 * Pure C++ arithmetic function.
 * Performs binary operation and returns std::nan("") on zero division.
 */
double calculate(double prev, double current, char op);

#endif
`;

  const calculatorCppContent = `#include "calculator.h"
#include <cmath>

double calculate(double prev, double current, char op) {
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
                return std::nan("");
            }
            return prev / current;
        default:
            return current;
    }
}
`;

  const project: Project = {
    id: projectId,
    name: 'C++ Precision Calculator',
    description: 'High-performance arithmetic system built with modern C++20, header modularity, and IEEE 754 zero-division protection.',
    techStack: {
      frontend: 'C++ Terminal Output',
      language: 'C++ (C++20)',
      styling: 'CLI Binary Stream',
    },
    interventionLevel: 'guided',
    currentStage: 'Stage 1: Core Mathematical Operators',
    activeFileId: 'calculator-cpp',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    files: [
      {
        id: 'main-cpp',
        projectId,
        path: 'main.cpp',
        name: 'main.cpp',
        language: 'cpp' as any,
        content: mainCppContent,
        version: 1,
        contributions: [
          {
            id: 'c1',
            fileId: 'main-cpp',
            startLine: 1,
            endLine: 40,
            authorType: 'AI_GENERATED',
            timestamp: Date.now(),
          },
        ],
      },
      {
        id: 'calculator-h',
        projectId,
        path: 'calculator.h',
        name: 'calculator.h',
        language: 'cpp' as any,
        content: calculatorHContent,
        version: 1,
        contributions: [
          {
            id: 'c2',
            fileId: 'calculator-h',
            startLine: 1,
            endLine: 15,
            authorType: 'AI_GENERATED',
            timestamp: Date.now(),
          },
        ],
      },
      {
        id: 'calculator-cpp',
        projectId,
        path: 'calculator.cpp',
        name: 'calculator.cpp',
        language: 'cpp' as any,
        content: calculatorCppContent,
        version: 1,
        contributions: [
          {
            id: 'c3',
            fileId: 'calculator-cpp',
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
      id: 'step-1-cpp-calc',
      projectId,
      stepNumber: 1,
      title: 'C++ Functions: Arithmetic Switch Engine',
      conceptId: 'cpp_functions',
      conceptName: 'C++ Functions & Switch Statements',
      taskType: 'COMPLETE_CODE',
      language: 'cpp',
      prompt: 'Implement `double calculate(double prev, double current, char op)` in C++ using a `switch` block for +, -, *, and /. Guard against division by zero by returning `std::nan("")`.',
      contextExplanation: 'C++ executes directly on machine hardware without a virtual machine. Type-safe functions with explicit double return types ensure maximum CPU performance and zero garbage-collection latency.',
      realLifeExample: 'Think of a mechanical transmission gearbox in a car. When you shift the lever into position (operator `op`), the transmission physically meshes specific gears (`case "+"`, `case "*"`) to transmit exact engine RPM into wheel rotation (`return prev * current`). If you attempt to engage reverse while driving at 80 MPH (dividing by zero), the safety synchro clutch disengages (`return std::nan("")`) to protect the engine block from destruction!',
      targetFileId: 'calculator-cpp',
      initialCode: `double calculate(double prev, double current, char op) {
    // YOUR C++ CODE HERE
}`,
      solutionCode: `double calculate(double prev, double current, char op) {
    switch (op) {
        case '+': return prev + current;
        case '-': return prev - current;
        case '*': return prev * current;
        case '/':
            if (current == 0.0) return std::nan("");
            return prev / current;
        default: return current;
    }
}`,
      testCases: [
        {
          id: 'test-cpp-signature',
          description: 'Declares double calculate(double prev, double current, char op)',
        },
        {
          id: 'test-cpp-switch',
          description: 'Uses switch(op) for +, -, *, /',
        },
        {
          id: 'test-cpp-nan',
          description: 'Guards against division by zero using std::nan',
        },
      ],
      hints: [
        {
          level: 1,
          type: 'conceptual',
          title: 'C++ Switch Syntax',
          content: 'In C++, switch statements evaluate primitive types like `char`. Use single quotes for characters: `case \'+\':`.',
        },
        {
          level: 2,
          type: 'structural',
          title: 'Handling Return Statements',
          content: 'When each `case` contains a `return` statement, you don\'t need a `break;` because the function exits immediately.',
        },
        {
          level: 3,
          type: 'syntax',
          title: 'std::nan Representation',
          content: 'To return a Not-a-Number value in C++, write `return std::nan("");`.',
        },
        {
          level: 4,
          type: 'partial_solution',
          title: 'Complete C++ Function',
          content: `double calculate(double prev, double current, char op) {\n    switch (op) {\n        case '+': return prev + current;\n        case '-': return prev - current;\n        case '*': return prev * current;\n        case '/':\n            if (current == 0.0) return std::nan("");\n            return prev / current;\n        default: return current;\n    }\n}`,
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
      title: 'C++ Binary Arithmetic Engine',
      description: 'Compiled and executed arithmetic operations with IEEE 754 NaN protection.',
      conceptName: 'C++ Functions',
      timestamp: Date.now(),
      targetFile: 'calculator.cpp',
      completed: false,
    },
  ];

  return { project, checkpoints, milestones };
}
