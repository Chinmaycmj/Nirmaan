export type TechStackId = 
  | 'vanilla_web'   // Vanilla JavaScript + HTML5 + CSS
  | 'react_ts'      // React 18 + TypeScript + Tailwind
  | 'react_css'     // React 18 + Custom CSS (no Tailwind)
  | 'html_css'      // Pure HTML5 + Modern CSS
  | 'python';       // Python 3

export interface DetectedStack {
  id: TechStackId;
  name: string;
  languages: string[];
  primaryLanguage: string;
  styling: string;
  description: string;
}

export function detectTechStack(prompt: string, explicitChoice?: string): DetectedStack {
  // If user selected an explicit choice other than auto
  if (explicitChoice && explicitChoice !== 'auto') {
    switch (explicitChoice) {
      case 'vanilla_web':
        return {
          id: 'vanilla_web',
          name: 'Vanilla JavaScript + CSS + HTML5',
          languages: ['javascript', 'css', 'html'],
          primaryLanguage: 'javascript',
          styling: 'Pure CSS3',
          description: 'Zero build step, standard DOM APIs, CSS Grid & Flexbox.',
        };
      case 'react_css':
        return {
          id: 'react_css',
          name: 'React + Custom CSS',
          languages: ['tsx', 'css', 'javascript'],
          primaryLanguage: 'typescript',
          styling: 'Custom CSS3 Modules',
          description: 'React component architecture with handwritten CSS stylesheets.',
        };
      case 'html_css':
        return {
          id: 'html_css',
          name: 'HTML5 + Modern CSS',
          languages: ['html', 'css'],
          primaryLanguage: 'html',
          styling: 'Modern CSS3',
          description: 'Semantic HTML markup and modern responsive CSS layout.',
        };
      case 'python':
        return {
          id: 'python',
          name: 'Python 3',
          languages: ['python'],
          primaryLanguage: 'python',
          styling: 'Terminal Output',
          description: 'Idiomatic Python 3 logic, data structures, and interactive console.',
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
        };
    }
  }

  const lower = prompt.toLowerCase();

  // 1. Python detection
  if (
    lower.includes('python') ||
    lower.includes('in py') ||
    lower.includes('using py') ||
    lower.includes('.py')
  ) {
    return {
      id: 'python',
      name: 'Python 3',
      languages: ['python'],
      primaryLanguage: 'python',
      styling: 'Terminal Console',
      description: 'Idiomatic Python 3 logic and console algorithms.',
    };
  }

  // 2. Pure HTML and CSS (no JS)
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
    };
  }

  // 3. Vanilla JavaScript + CSS / HTML
  if (
    lower.includes('vanilla') ||
    lower.includes('pure js') ||
    lower.includes('vanilla js') ||
    lower.includes('js and css') ||
    lower.includes('js & css') ||
    lower.includes('javascript and css') ||
    lower.includes('javascript & css') ||
    lower.includes('html, css, js') ||
    lower.includes('html css js') ||
    lower.includes('html, css and js') ||
    lower.includes('html, css and javascript') ||
    lower.includes('no react') ||
    lower.includes('no framework') ||
    (lower.includes('javascript') && !lower.includes('react') && !lower.includes('typescript'))
  ) {
    return {
      id: 'vanilla_web',
      name: 'Vanilla JavaScript + CSS + HTML5',
      languages: ['javascript', 'css', 'html'],
      primaryLanguage: 'javascript',
      styling: 'Pure CSS3 (Grid & Flexbox)',
      description: 'Native web standards: semantic HTML5, pure CSS3, and modern ES6 JavaScript.',
    };
  }

  // 4. React + Custom CSS
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
    };
  }

  // Default: React + TypeScript
  return {
    id: 'react_ts',
    name: 'React 18 + TypeScript + Tailwind',
    languages: ['typescript', 'tsx', 'css'],
    primaryLanguage: 'typescript',
    styling: 'Tailwind CSS',
    description: 'Modern type-safe React architecture.',
  };
}
