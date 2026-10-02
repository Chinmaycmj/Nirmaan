export type TechStackId = 
  | 'javascript'    // Pure JavaScript + HTML5 + CSS
  | 'vanilla_web'   // Pure JavaScript + HTML5 + CSS
  | 'cpp'           // C++ (C++20, STL, CLI)
  | 'java'          // Java (OOP, JVM, CLI)
  | 'python'        // Python 3 (Idiomatic, CLI)
  | 'c'             // C (Standard C, Pointers, Functions)
  | 'react_js'      // React 18 + Pure JavaScript (JSX)
  | 'react_ts'      // React 18 + TypeScript + Tailwind
  | 'react_css'     // React 18 + Custom CSS
  | 'html_css';     // Pure HTML5 + Modern CSS

export interface DetectedStack {
  id: TechStackId;
  name: string;
  languages: string[];
  primaryLanguage: string;
  styling: string;
  description: string;
  welcomeMessage: string;
}

export function detectTechStack(prompt: string, explicitChoice?: string): DetectedStack {
  // If user selected an explicit choice other than auto
  if (explicitChoice && explicitChoice !== 'auto') {
    switch (explicitChoice) {
      case 'cpp':
        return {
          id: 'cpp',
          name: 'C++ (Modern C++20)',
          languages: ['cpp', 'c'],
          primaryLanguage: 'cpp',
          styling: 'Terminal CLI Console',
          description: 'High-performance compiled systems programming with standard library functions and STL.',
          welcomeMessage: "I've architected your C++ system using modern C++ standards, STL headers, and modular functions. The live terminal simulation is active on the right. Let's build the core algorithms together step by step.",
        };
      case 'java':
        return {
          id: 'java',
          name: 'Java (OOP & JVM)',
          languages: ['java'],
          primaryLanguage: 'java',
          styling: 'JVM Terminal Stream',
          description: 'Strict type safety, class methods, and enterprise object-oriented programming.',
          welcomeMessage: "I've architected your Java application with clean OOP structure, class encapsulation, and static calculation methods. The interactive JVM console is live on the right. Let's write the core methods together step by step.",
        };
      case 'python':
        return {
          id: 'python',
          name: 'Python 3',
          languages: ['python'],
          primaryLanguage: 'python',
          styling: 'Interactive Terminal',
          description: 'Idiomatic Python 3 logic, data structures, and interactive console.',
          welcomeMessage: "I've architected your Python application using clean, idiomatic Python 3 functions, exception handling, and modular logic. The interactive terminal is running on the right. Let's code the core algorithms together step by step.",
        };
      case 'javascript':
      case 'vanilla_web':
        return {
          id: 'javascript',
          name: 'Pure JavaScript + CSS + HTML5',
          languages: ['javascript', 'css', 'html'],
          primaryLanguage: 'javascript',
          styling: 'Pure CSS3',
          description: 'Zero build step, standard DOM APIs, CSS Grid & Flexbox without TypeScript.',
          welcomeMessage: "I've architected your application with modern pure JavaScript (ES6+), HTML5, and CSS3. The components and layout are live in the preview on the right. Now, let's write the core JavaScript functions and CSS together step by step.",
        };
      case 'react_js':
        return {
          id: 'react_js',
          name: 'React 18 + JavaScript (JSX)',
          languages: ['jsx', 'javascript', 'css'],
          primaryLanguage: 'javascript',
          styling: 'Tailwind CSS',
          description: 'Modern component-driven development with React 18 hooks and pure JavaScript.',
          welcomeMessage: "I've architected your application with React 18 and pure JavaScript (JSX). The components and layout are live in the preview on the right. Let's build the state and handlers together step by step.",
        };
      case 'html_css':
        return {
          id: 'html_css',
          name: 'HTML5 + Modern CSS',
          languages: ['html', 'css'],
          primaryLanguage: 'html',
          styling: 'Modern CSS3',
          description: 'Semantic HTML markup and modern responsive CSS layout.',
          welcomeMessage: "I've architected your project using semantic HTML5 markup and modern CSS3 Grid & Flexbox styling. Let's master layout and design together step by step.",
        };
      case 'react_ts':
      default:
        return {
          id: 'react_ts',
          name: 'React + TypeScript + Tailwind',
          languages: ['typescript', 'tsx', 'css'],
          primaryLanguage: 'typescript',
          styling: 'Tailwind CSS',
          description: 'Industry standard type-safe React 18 development.',
          welcomeMessage: "I've architected your application with React 18, TypeScript, and Tailwind CSS. The components and layout are live in the preview on the right. Let's build the core engineering concepts together step by step.",
        };
    }
  }

  const lower = prompt.toLowerCase();

  // 1. C++ Detection (e.g. "c++", "cpp", "cplusplus")
  if (
    lower.includes('c++') ||
    lower.includes('cpp') ||
    lower.includes('cplusplus') ||
    /\b(c\+\+|cpp)\b/i.test(lower)
  ) {
    return {
      id: 'cpp',
      name: 'C++ (Modern C++20)',
      languages: ['cpp', 'c'],
      primaryLanguage: 'cpp',
      styling: 'Terminal CLI Console',
      description: 'High-performance compiled systems programming with standard library functions and STL.',
      welcomeMessage: "I've architected your C++ system using modern C++ standards, STL headers, and modular functions. The live terminal simulation is active on the right. Let's build the core algorithms together step by step.",
    };
  }

  // 2. Java Detection (e.g. "java", "in java", "using java", but not "javascript")
  if (
    (/\bjava\b/i.test(lower) || lower.includes('java ') || lower.endsWith('java')) &&
    !lower.includes('javascript')
  ) {
    return {
      id: 'java',
      name: 'Java (OOP & JVM)',
      languages: ['java'],
      primaryLanguage: 'java',
      styling: 'JVM Terminal Stream',
      description: 'Strict type safety, class methods, and enterprise object-oriented programming.',
      welcomeMessage: "I've architected your Java application with clean OOP structure, class encapsulation, and static calculation methods. The interactive JVM console is live on the right. Let's write the core methods together step by step.",
    };
  }

  // 3. Python Detection (e.g. "python", "py", "using python", "in py")
  if (
    lower.includes('python') ||
    lower.includes('in py') ||
    lower.includes('using py') ||
    lower.includes('.py') ||
    /\b(py|python3)\b/i.test(lower)
  ) {
    return {
      id: 'python',
      name: 'Python 3',
      languages: ['python'],
      primaryLanguage: 'python',
      styling: 'Terminal Console',
      description: 'Idiomatic Python 3 logic and console algorithms.',
      welcomeMessage: "I've architected your Python application using clean, idiomatic Python 3 functions, exception handling, and modular logic. The interactive terminal is running on the right. Let's code the core algorithms together step by step.",
    };
  }

  // 4. Pure C Language
  if (
    /\b(in c|using c|c language|pure c)\b/i.test(lower) &&
    !lower.includes('c++') &&
    !lower.includes('css')
  ) {
    return {
      id: 'c',
      name: 'C (Standard C17)',
      languages: ['c'],
      primaryLanguage: 'c',
      styling: 'Terminal Output',
      description: 'Core procedural programming with pointers, functions, and standard IO.',
      welcomeMessage: "I've architected your C system with standard procedural functions and stdio. The terminal console is ready on the right. Let's build the arithmetic functions together step by step.",
    };
  }

  // 5. Pure JavaScript (JS) Detection
  // Matches: "using js", "in js", "calculator using js", "javascript", "vanilla", "vanilla js", "pure js"
  if (
    /\b(js|javascript|vanilla|vanillajs|es6|node)\b/i.test(lower) ||
    lower.includes('using js') ||
    lower.includes('in js') ||
    lower.includes('pure js') ||
    lower.includes('vanilla js') ||
    lower.includes('js and css') ||
    lower.includes('javascript and css') ||
    lower.includes('html, css, js') ||
    (lower.includes('javascript') && !lower.includes('typescript'))
  ) {
    return {
      id: 'javascript',
      name: 'Pure JavaScript + CSS + HTML5',
      languages: ['javascript', 'css', 'html'],
      primaryLanguage: 'javascript',
      styling: 'Pure CSS3 (Grid & Flexbox)',
      description: 'Native web standards: semantic HTML5, pure CSS3, and modern ES6 JavaScript without TypeScript.',
      welcomeMessage: "I've architected your application with modern pure JavaScript (ES6+), HTML5, and CSS3. The components and layout are live in the preview on the right. Now, let's write the core JavaScript functions and CSS together step by step.",
    };
  }

  // 6. Pure HTML and CSS (no JS)
  if (
    (lower.includes('html and css') || lower.includes('html & css') || lower.includes('pure css') || lower.includes('only css')) &&
    !lower.includes('javascript') &&
    !lower.includes('js')
  ) {
    return {
      id: 'html_css',
      name: 'HTML5 + Modern CSS',
      languages: ['html', 'css'],
      primaryLanguage: 'html',
      styling: 'Modern CSS3',
      description: 'Semantic HTML5 structure and responsive CSS styling.',
      welcomeMessage: "I've architected your project using semantic HTML5 markup and modern CSS3 Grid & Flexbox styling. Let's master layout and design together step by step.",
    };
  }

  // 7. React + Pure CSS
  if (
    (lower.includes('react') || lower.includes('next')) &&
    (lower.includes('pure css') || lower.includes('custom css') || lower.includes('plain css') || lower.includes('no tailwind'))
  ) {
    return {
      id: 'react_css',
      name: 'React + Custom CSS',
      languages: ['tsx', 'css', 'javascript'],
      primaryLanguage: 'typescript',
      styling: 'Custom CSS3',
      description: 'React components styled with handwritten pure CSS.',
      welcomeMessage: "I've architected your application with React 18 and custom CSS stylesheets. The components and layout are live in the preview on the right. Let's build the core concepts together step by step.",
    };
  }

  // 8. Explicit TypeScript requested
  if (lower.includes('typescript') || lower.includes('ts')) {
    return {
      id: 'react_ts',
      name: 'React 18 + TypeScript + Tailwind',
      languages: ['typescript', 'tsx', 'css'],
      primaryLanguage: 'typescript',
      styling: 'Tailwind CSS',
      description: 'Type-safe React 18 development with TypeScript and Tailwind CSS.',
      welcomeMessage: "I've architected your application with React 18, TypeScript, and Tailwind CSS. The components and layout are live in the preview on the right. Let's build the core engineering concepts together step by step.",
    };
  }

  // Default: React + JavaScript (clean and approachable for everyone without forcing TypeScript)
  return {
    id: 'javascript',
    name: 'Pure JavaScript + CSS + HTML5',
    languages: ['javascript', 'css', 'html'],
    primaryLanguage: 'javascript',
    styling: 'Modern Web Standards',
    description: 'Clean modern JavaScript (ES6+), HTML5 semantic markup, and CSS3.',
    welcomeMessage: "I've architected your application with clean JavaScript, HTML5, and CSS3. The components and layout are live in the preview on the right. Let's build the core concepts together step by step.",
  };
}
