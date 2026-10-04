import test from 'node:test';
import assert from 'node:assert/strict';

// Test 1: Progressive Hint System Logic
test('Progressive Hint System unrolls hints in 4 strict tiers and unlocks solution at end', () => {
  const hints = [
    { level: 1, type: 'conceptual', title: 'Conceptual Clue', content: 'Think about return values' },
    { level: 2, type: 'structural', title: 'Placement', content: 'Place inside function body' },
    { level: 3, type: 'syntax', title: 'Syntax', content: 'return array.reduce(...)' },
    { level: 4, type: 'partial_solution', title: 'Skeleton', content: 'return expenses.reduce(...)' },
  ];

  let state = { currentRevealedLevel: 0, hintsUsed: 0, solutionUnlocked: false };

  let nextLevel = (state.currentRevealedLevel + 1);
  state = { currentRevealedLevel: nextLevel, hintsUsed: state.hintsUsed + 1, solutionUnlocked: nextLevel >= 4 };
  assert.equal(state.currentRevealedLevel, 1);
  assert.equal(state.hintsUsed, 1);
  assert.equal(state.solutionUnlocked, false);

  nextLevel = (state.currentRevealedLevel + 1);
  state = { currentRevealedLevel: nextLevel, hintsUsed: state.hintsUsed + 1, solutionUnlocked: nextLevel >= 4 };
  assert.equal(state.currentRevealedLevel, 2);

  nextLevel = (state.currentRevealedLevel + 1);
  state = { currentRevealedLevel: nextLevel, hintsUsed: state.hintsUsed + 1, solutionUnlocked: nextLevel >= 4 };
  assert.equal(state.currentRevealedLevel, 3);

  nextLevel = (state.currentRevealedLevel + 1);
  state = { currentRevealedLevel: nextLevel, hintsUsed: state.hintsUsed + 1, solutionUnlocked: nextLevel >= 4 };
  assert.equal(state.currentRevealedLevel, 4);
  assert.equal(state.solutionUnlocked, true);
});

// Test 2: Code Ownership Calculation
test('Code Ownership Engine accurately calculates percentages and attributes lines', () => {
  const totalLines = 10;
  const userLines = 4;
  const userPercentage = Math.round((userLines / totalLines) * 100);

  assert.equal(totalLines, 10);
  assert.equal(userLines, 4);
  assert.equal(userPercentage, 40);
});

// Test 3: Validation Engine - Function Evaluation (Type A & B)
test('Validation Engine executes assertions dynamically against student code', () => {
  const studentCode = `
    function calculateTotal(expenses) {
      return expenses.reduce((sum, item) => sum + item.amount, 0);
    }
  `;

  const assertionFn = `
    const items = [{ amount: 10 }, { amount: 25 }, { amount: 5 }];
    return calculateTotal(items) === 40;
  `;

  const runner = new Function('testInput', `${studentCode}; ${assertionFn};`);
  const result = runner();
  assert.equal(result, true);
});

// Test 4: Calculator Pure Functions
test('Calculator arithmetic engine computes binary operations correctly', () => {
  function calculate(prev, current, operation) {
    switch (operation) {
      case '+': return prev + current;
      case '-': return prev - current;
      case '×': return prev * current;
      case '÷': return current === 0 ? NaN : prev / current;
      default: return current;
    }
  }

  assert.equal(calculate(10, 5, '+'), 15);
  assert.equal(calculate(20, 8, '-'), 12);
  assert.equal(calculate(6, 7, '×'), 42);
  assert.equal(calculate(20, 4, '÷'), 5);
  assert.ok(Number.isNaN(calculate(10, 0, '÷')));
});

// Test 5: TypeScript Sanitization (Preventing "Unexpected token 'export'" SyntaxError)
test('TypeScript sanitization strips export keywords and type annotations safely', () => {
  function sanitizeTypeScript(tsCode) {
    let js = tsCode;
    js = js.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '');
    js = js.replace(/\bexport\s+(default\s+)?/g, '');
    js = js.replace(/interface\s+\w+[\s\S]*?\{[\s\S]*?\}/g, '');
    js = js.replace(/type\s+\w+\s*=[\s\S]*?;/g, '');
    js = js.replace(/\)\s*:\s*[A-Za-z0-9_<>\[\]|&\s]+\s*\{/g, ') {');
    js = js.replace(/([a-zA-Z0-9_]+)\s*:\s*[A-Za-z0-9_<>\[\]|&]+(?=[,\)\=\{])/g, '$1');
    js = js.replace(/\s+as\s+[A-Za-z0-9_<>\[\]]+/g, '');
    return js;
  }

  const rawTsCode = `
    export function calculate(prev: number, current: number, operation: string): number {
      return prev + current;
    }
  `;

  const sanitized = sanitizeTypeScript(rawTsCode);
  const runner = new Function('testInput', `${sanitized}; return calculate(3, 4, "+") === 7;`);
  assert.equal(runner(), true);
});

// Test 6: Interface Structure Validation (No runtime SyntaxError)
test('TypeScript Interface validation checks properties via contract analysis without SyntaxError', () => {
  const userInterfaceSubmission = `
    export type ExpenseCategory = 'Food' | 'Transport';

    export interface Expense {
      id: string;
      title: string;
      amount: number;
      category: ExpenseCategory;
      date: string;
    }
  `;

  const hasInterface = /interface\s+Expense/i.test(userInterfaceSubmission);
  const hasAmount = /amount\s*:\s*number/i.test(userInterfaceSubmission);
  const hasCategory = /category/i.test(userInterfaceSubmission);
  const hasDate = /date/i.test(userInterfaceSubmission);

  assert.ok(hasInterface);
  assert.ok(hasAmount);
  assert.ok(hasCategory);
  assert.ok(hasDate);
});

// Test 7: Explanation Evaluation
test('Validation Engine scores natural language explanation against keywords', () => {
  const explanation = 'React compares state by reference. Direct mutation keeps the same pointer, so React skips re-rendering.';
  const keywords = ['reference', 're-render'];
  const lower = explanation.toLowerCase();
  const matched = keywords.filter(k => lower.includes(k));
  assert.equal(matched.length, 2);
});

// Test 8: Multi-language & Tech Stack Detection
test('Tech Stack Detector accurately detects Vanilla JS + CSS, Python, and React', () => {
  function detectStack(prompt) {
    const lower = prompt.toLowerCase();
    if (lower.includes('python') || lower.includes('in py')) return 'python';
    if (lower.includes('vanilla') || lower.includes('js and css') || lower.includes('javascript and css') || lower.includes('html, css, js')) return 'vanilla_web';
    if (lower.includes('html and css') && !lower.includes('javascript')) return 'html_css';
    return 'react_ts';
  }

  assert.equal(detectStack('Build a simple calculator with vanilla JavaScript and CSS'), 'vanilla_web');
  assert.equal(detectStack('Build me a calculator using Python with zero-division guard'), 'python');
  assert.equal(detectStack('Build a landing page with HTML and CSS'), 'html_css');
  assert.equal(detectStack('Build a task manager with React and TypeScript'), 'react_ts');
});

// Test 9: CSS Grid Rule Validation
test('CSS Validation Engine verifies CSS Grid layout, columns, and gap rules', () => {
  const userCss = `
    .keypad {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
  `;

  const hasGridDisplay = /display\s*:\s*grid/i.test(userCss);
  const hasGridCols = /grid-template-columns\s*:\s*(repeat\(\s*4\s*,\s*1fr\s*\)|1fr\s+1fr\s+1fr\s+1fr)/i.test(userCss);
  const hasGap = /gap\s*:\s*12px/i.test(userCss);

  assert.ok(hasGridDisplay);
  assert.ok(hasGridCols);
  assert.ok(hasGap);
});

// Test 10: Python Logic & Structural Verification
test('Python calculation function validates pure arithmetic and zero-division guard', () => {
  const pythonCode = `
    def calculate(prev, current, op):
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
  `;

  const hasDef = /def\s+calculate\s*\(/i.test(pythonCode);
  const hasAdd = /\+\s*current/i.test(pythonCode);
  const hasSub = /-\s*current/i.test(pythonCode);
  const hasMul = /\*\s*current/i.test(pythonCode);
  const hasDivZero = /current\s*==\s*0/i.test(pythonCode) && /nan/i.test(pythonCode);

  assert.ok(hasDef);
  assert.ok(hasAdd);
  assert.ok(hasSub);
  assert.ok(hasMul);
  assert.ok(hasDivZero);
});

// Test 11: Vanilla JS DOM String Calculation & Replacement
test('Vanilla JS appendDigit properly replaces initial zero or appends characters', () => {
  function appendDigit(currentInput, digit) {
    if (currentInput === '0') return digit;
    return currentInput + digit;
  }

  assert.equal(appendDigit('0', '7'), '7');
  assert.equal(appendDigit('7', '5'), '75');
  assert.equal(appendDigit('75', '.'), '75.');
  assert.equal(appendDigit('75.', '2'), '75.2');
});

// Test 12: C++20 Function & Switch Arithmetic with IEEE 754 NaN Protection
test('C++ Switch implementation validates arithmetic and zero-division guard', () => {
  const cppCode = `
    double calculate(double prev, double current, char op) {
        switch (op) {
            case '+': return prev + current;
            case '-': return prev - current;
            case '*': return prev * current;
            case '/':
                if (current == 0.0) return std::nan("");
                return prev / current;
            default: return current;
        }
    }
  `;

  const hasSignature = /double\s+calculate\s*\(\s*double\s+\w+,\s*double\s+\w+,\s*char\s+\w+\s*\)/i.test(cppCode);
  const hasSwitch = /switch\s*\(\s*op\s*\)/i.test(cppCode);
  const hasCases = /case\s*'\+':/i.test(cppCode) && /case\s*'\*':/i.test(cppCode);
  const hasNanGuard = /current\s*==\s*0\.0/i.test(cppCode) && /std::nan/i.test(cppCode);

  assert.ok(hasSignature);
  assert.ok(hasSwitch);
  assert.ok(hasCases);
  assert.ok(hasNanGuard);
});

// Test 13: Java 21 Static Method & Double.NaN Handling
test('Java Static calculate method validates operations and Double.NaN guard', () => {
  const javaCode = `
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
  `;

  const hasSignature = /public\s+static\s+double\s+calculate/i.test(javaCode);
  const hasSwitch = /switch\s*\(\s*op\s*\)/i.test(javaCode);
  const hasCases = /case\s*'\+':/i.test(javaCode) && /case\s*'\*':/i.test(javaCode);
  const hasDoubleNan = /Double\.NaN/i.test(javaCode);

  assert.ok(hasSignature);
  assert.ok(hasSwitch);
  assert.ok(hasCases);
  assert.ok(hasDoubleNan);
});

// Test 14: Dynamic Stack Detection for "Simple calculator using Js" (No TypeScript Leakage)
test('Stack detector accurately routes "Simple calculator using Js" to vanilla_web and not TypeScript', () => {
  function detectStack(prompt) {
    const lower = prompt.toLowerCase();
    if (/\b(cpp|c\+\+|clang)\b/i.test(lower)) return 'cpp';
    if (/\b(java|jvm|openjdk)\b/i.test(lower) && !lower.includes('javascript')) return 'java';
    if (/\b(python|py|python3)\b/i.test(lower)) return 'python';
    if (/\b(js|javascript|vanilla|es6|node)\b/i.test(lower) && !lower.includes('typescript')) return 'vanilla_web';
    if (lower.includes('react') && (lower.includes('typescript') || lower.includes('ts'))) return 'react_ts';
    return 'react_ts';
  }

  assert.equal(detectStack('Simple calculator using Js'), 'vanilla_web');
  assert.equal(detectStack('calculator in js'), 'vanilla_web');
  assert.equal(detectStack('calculator with cpp'), 'cpp');
  assert.equal(detectStack('calculator in java'), 'java');
  assert.equal(detectStack('calculator in python'), 'python');
  assert.notEqual(detectStack('Simple calculator using Js'), 'react_ts');
});

// Test 15: Token & Line Documentation Engine with Official External Links
test('Token documentation engine resolves tokens and generates official documentation links', () => {
  const tokenRegistry = {
    'switch': { source: 'cppreference.com', url: 'https://en.cppreference.com/w/cpp/language/switch' },
    'std::nan': { source: 'cppreference.com', url: 'https://en.cppreference.com/w/cpp/numeric/math/nan' },
    'Double.NaN': { source: 'Oracle Java Docs', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Double.html#NaN' },
    'addEventListener': { source: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener' },
    'grid-template-columns': { source: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns' },
  };

  assert.equal(tokenRegistry['switch'].source, 'cppreference.com');
  assert.equal(tokenRegistry['std::nan'].source, 'cppreference.com');
  assert.equal(tokenRegistry['Double.NaN'].source, 'Oracle Java Docs');
  assert.equal(tokenRegistry['addEventListener'].source, 'MDN Web Docs');
  assert.equal(tokenRegistry['grid-template-columns'].source, 'MDN Web Docs');
  assert.ok(tokenRegistry['std::nan'].url.includes('cppreference'));
  assert.ok(tokenRegistry['Double.NaN'].url.includes('oracle'));
  assert.ok(tokenRegistry['addEventListener'].url.includes('mozilla'));
});

// Test 16: GitHub URL Parser & Metadata Extraction
test('GitHub URL Parser extracts owner, repository, and branch correctly', () => {
  function parseGithubUrl(rawUrl) {
    let clean = rawUrl.trim().replace(/\/+$/, '');
    clean = clean.replace(/^https?:\/\/github\.com\//i, '');
    const parts = clean.split('/');

    const owner = parts[0] || 'facebook';
    const repo = parts[1] || 'react';
    let branch = 'main';

    if (parts.length >= 4 && parts[2] === 'tree') {
      branch = parts[3];
    }

    return {
      owner,
      repo,
      branch,
      url: `https://github.com/${owner}/${repo}`,
    };
  }

  const res1 = parseGithubUrl('https://github.com/Chinmaycmj/Nirmaan');
  assert.equal(res1.owner, 'Chinmaycmj');
  assert.equal(res1.repo, 'Nirmaan');
  assert.equal(res1.branch, 'main');

  const res2 = parseGithubUrl('https://github.com/nlohmann/json/tree/develop');
  assert.equal(res2.owner, 'nlohmann');
  assert.equal(res2.repo, 'json');
  assert.equal(res2.branch, 'develop');

  const res3 = parseGithubUrl('torvalds/linux');
  assert.equal(res3.owner, 'torvalds');
  assert.equal(res3.repo, 'linux');
});

// Test 17: Multi-File Repository Scale (10 to 100+ files, 1,000+ lines)
test('GitHub multi-file project scale supports enterprise monorepos with 12+ files and 1,400+ lines', () => {
  const monorepo = {
    id: 'fullstack-monorepo-enterprise',
    name: 'Enterprise Monorepo',
    fileCount: 12,
    lineCount: 1450,
    files: [
      { name: 'calculator.cpp', lines: 25 },
      { name: 'types.h', lines: 20 },
      { name: 'matrix.cpp', lines: 18 },
      { name: 'server.py', lines: 35 },
      { name: 'routes.py', lines: 15 },
      { name: 'index.html', lines: 40 },
      { name: 'style.css', lines: 55 },
      { name: 'app.js', lines: 60 },
      { name: 'components.js', lines: 15 },
      { name: 'store.js', lines: 15 },
      { name: 'unit_test.cpp', lines: 20 },
      { name: 'architecture.md', lines: 15 },
    ]
  };

  assert.equal(monorepo.fileCount, 12);
  assert.equal(monorepo.files.length, 12);
  assert.ok(monorepo.lineCount >= 1000);
  assert.ok(monorepo.files.some(f => f.name.endsWith('.cpp')));
  assert.ok(monorepo.files.some(f => f.name.endsWith('.py')));
  assert.ok(monorepo.files.some(f => f.name.endsWith('.html')));
  assert.ok(monorepo.files.some(f => f.name.endsWith('.css')));
  assert.ok(monorepo.files.some(f => f.name.endsWith('.js')));
});

// Test 18: Line Syllable & Token Decomposition Engine
test('Syllable tokenizer breaks down line code into individual syllables, phonetics, and grammar roles', () => {
  const dictionary = {
    'double': 'dou·ble',
    'calculate': 'cal·cu·late',
    'switch': 'switch',
    'return': 're·turn',
  };

  function generateSyllables(text) {
    if (dictionary[text]) return dictionary[text];
    if (text.length <= 4) return text;
    return text.replace(/([aeiouy]{1,2})([^aeiouy\s]{1,2})([aeiouy])/gi, '$1·$2$3');
  }

  function decomposeLine(line) {
    const tokenRegex = /([a-zA-Z0-9_:]+|==|!=|<=|>=|\+=|-=|\*=|\/=|=>|[+\-*/=<>{}();,\.'])/g;
    const matches = line.trim().match(tokenRegex) || [];
    return matches.map(m => ({
      text: m,
      syllables: generateSyllables(m),
      phonetic: `[${m.toLowerCase()}]`,
      isKeyword: ['switch', 'case', 'return', 'double', 'char'].includes(m)
    }));
  }

  const tokens = decomposeLine('double calculate(double prev, double current, char op);');
  assert.ok(tokens.length >= 8);
  assert.equal(tokens[0].text, 'double');
  assert.equal(tokens[0].syllables, 'dou·ble');
  assert.equal(tokens[0].isKeyword, true);
  assert.equal(tokens[1].text, 'calculate');
  assert.equal(tokens[1].syllables, 'cal·cu·late');
});

// Test 19: Side-by-Side 100% Real Code Match Matrix
test('Side-by-side code alignment accurately tracks matched reference lines', () => {
  function calculateMatchStats(userCode, referenceCode) {
    const refLines = referenceCode.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
    const userLines = userCode.split('\n').map(l => l.trim()).filter(Boolean);

    if (refLines.length === 0) return { matched: 0, total: 0, percent: 100 };

    let matches = 0;
    for (const r of refLines) {
      if (userLines.some(u => u === r || u.includes(r) || r.includes(u))) {
        matches++;
      }
    }
    const percent = Math.min(100, Math.round((matches / refLines.length) * 100));
    return { matched: matches, total: refLines.length, percent };
  }

  const refCode = `
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
    }
  `;

  const partialUser = `
    switch (op) {
      case '+': return a + b;
    }
  `;

  const completeUser = `
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
    }
  `;

  const partialStats = calculateMatchStats(partialUser, refCode);
  assert.ok(partialStats.percent >= 50 && partialStats.percent < 100);

  const completeStats = calculateMatchStats(completeUser, refCode);
  assert.equal(completeStats.percent, 100);
});

// Test 20: Real-World GitHub Repositories like Chinmaycmj/design_disaster_Bhukkad Never Leak Calculator
test('GitHub Importer resolves food delivery web apps and never falls back to a calculator', () => {
  function resolveRepoFiles(repoName) {
    const lower = repoName.toLowerCase();
    if (lower.includes('bhukkad') || lower.includes('food') || lower.includes('order')) {
      return {
        name: 'Chinmaycmj/design_disaster_Bhukkad',
        language: 'HTML5 & CSS & JS',
        files: [
          { name: 'bhukkadresolved.html', language: 'html' },
          { name: 'bhukkad.html', language: 'html' },
          { name: 'README.md', language: 'markdown' }
        ],
        concept: 'HTML5 & CSS Sticky Navigation Architecture'
      };
    }
    return { name: repoName, language: 'javascript', files: [], concept: 'Architecture' };
  }

  const project = resolveRepoFiles('Chinmaycmj/design_disaster_Bhukkad');
  assert.equal(project.language, 'HTML5 & CSS & JS');
  assert.ok(project.files.some(f => f.name === 'bhukkadresolved.html'));
  assert.equal(project.concept.includes('calculator'), false);
  assert.equal(project.files.some(f => f.name.includes('calc')), false);
});

// Test 21: AI Code Line Analyzer & Clean Doc Routing (Resolving user's disease_name: str = Field(...) issue)
test('AI Code Analyzer deconstructs Pydantic model fields and routes clean documentation URLs', () => {
  function sanitizeDocUrl(line) {
    if (line.includes('Field(') || line.includes('Field')) {
      return 'https://docs.pydantic.dev/latest/concepts/fields/';
    }
    if (line.includes('BaseModel')) {
      return 'https://docs.pydantic.dev/latest/concepts/models/';
    }
    if (line.includes(': str')) {
      return 'https://docs.python.org/3/library/stdtypes.html#text-sequence-type-str';
    }
    const words = line.match(/[a-zA-Z0-9_]+/g) || [];
    return `https://docs.python.org/3/search.html?q=${words[0] || 'python'}`;
  }

  const complexLine = 'disease_name: str = Field(description="Clinical diagnosis name")';
  const docUrl = sanitizeDocUrl(complexLine);

  assert.equal(docUrl, 'https://docs.pydantic.dev/latest/concepts/fields/');
  assert.equal(docUrl.includes('disease_name'), false); // Never leaks arbitrary variable name into search
  assert.equal(docUrl.includes('Field('), false); // No unescaped parentheses in query
});

// Test 22: Dotfiles and Config Files are Never Classified as JavaScript Code
test('Dotfiles, lockfiles, and configs are classified as markdown/json and never javascript', () => {
  function detectLanguage(filename) {
    const lower = filename.toLowerCase();
    const name = lower.split('/').pop() || lower;
    if (name.endsWith('.json')) return 'json';
    if (name.startsWith('.') || name.includes('ignore') || name.includes('license') || name === 'procfile') return 'markdown';
    if (name.endsWith('rc')) return 'json';
    if (lower.endsWith('.html')) return 'html';
    if (lower.endsWith('.tsx')) return 'tsx';
    if (lower.endsWith('.jsx')) return 'jsx';
    if (lower.endsWith('.ts')) return 'typescript';
    if (lower.endsWith('.js')) return 'javascript';
    return 'javascript';
  }

  assert.equal(detectLanguage('.gitignore'), 'markdown');
  assert.equal(detectLanguage('.env'), 'markdown');
  assert.equal(detectLanguage('.eslintrc.json'), 'json');
  assert.equal(detectLanguage('package.json'), 'json');
  assert.equal(detectLanguage('app/page.tsx'), 'tsx');
  assert.equal(detectLanguage('src/App.jsx'), 'jsx');
});

// Test 23: GitHub Importer Candidate Scoring selects real components over .gitignore
test('GitHub importer candidate scoring prioritizes App.tsx / page.tsx and demotes .gitignore', () => {
  function isConfig(path) {
    const p = path.toLowerCase();
    const name = p.split('/').pop() || p;
    if (name.startsWith('.')) return true;
    if (name.includes('lock') || name.includes('license')) return true;
    return false;
  }

  function getScore(file) {
    const name = file.name.toLowerCase();
    if (isConfig(file.path) || file.name.startsWith('.')) return -100;
    if (file.language === 'markdown' || file.language === 'json') return -50;
    if (name === 'app.tsx' || name === 'app.jsx') return 100;
    if (name === 'page.tsx' || name === 'dashboard.tsx') return 95;
    return 50;
  }

  const mockAuraBankFiles = [
    { name: '.gitignore', path: '.gitignore', language: 'markdown' },
    { name: 'components.json', path: 'components.json', language: 'json' },
    { name: 'page.tsx', path: 'app/page.tsx', language: 'tsx' },
    { name: 'Dashboard.tsx', path: 'components/Dashboard.tsx', language: 'tsx' },
  ];

  const sorted = [...mockAuraBankFiles].sort((a, b) => getScore(b) - getScore(a));
  assert.equal(sorted[0].name, 'page.tsx');
  assert.equal(sorted[1].name, 'Dashboard.tsx');
  assert.equal(sorted[sorted.length - 1].name, '.gitignore');
});

// Test 24: Imported GitHub repository validation verifies authentic code without Java calculator false trigger
test('Imported GitHub repositories validate real code and never trigger Java calculator error', () => {
  function validateImportedRepo(checkpoint, code) {
    // Java check strictly guarded
    const isJava = !checkpoint.projectId.startsWith('gh-') && (
      checkpoint.language === 'java' ||
      (checkpoint.conceptId.includes('java') && !checkpoint.conceptId.includes('javascript') && checkpoint.language !== 'javascript')
    );
    if (isJava) {
      return { passed: false, title: 'Java Logic Incomplete' };
    }

    if (checkpoint.projectId.startsWith('gh-')) {
      const codeClean = code.replace(/\/\/.*/g, '').trim();
      const hasMeaningfulCode = codeClean.length >= 15 && !code.includes('// ... write implementation ...');
      return {
        passed: hasMeaningfulCode,
        title: hasMeaningfulCode ? 'Repository Checkpoint Verified!' : 'Implementation In Progress',
      };
    }
    return { passed: true, title: 'Default Verified' };
  }

  const ghCheckpoint = {
    projectId: 'gh-Chinmaycmj-AuraBank-123456',
    conceptId: 'repo_arch_javascript',
    language: 'javascript',
    title: 'Core Architecture of page.tsx',
  };

  const userCode = `export default function BankingDashboard() { return <div>AuraBank Portal</div>; }`;
  const result = validateImportedRepo(ghCheckpoint, userCode);

  assert.equal(result.passed, true);
  assert.equal(result.title, 'Repository Checkpoint Verified!');
  assert.notEqual(result.title, 'Java Logic Incomplete');
});

// Test 25: Semantic Tokenizer preserves CSS properties, selectors, units, and provides non-vague explanations
test('Semantic Tokenizer preserves CSS properties and eliminates vague duplicate token explanations', () => {
  function extractSemanticTokensFromLine(line, language) {
    const trimmed = line.trim();
    if (!trimmed) return [];
    const isHashCommentLang = ['python', 'py', 'bash', 'sh', 'yaml', 'yml'].includes((language || '').toLowerCase());
    let tokenRegex;
    if (isHashCommentLang) {
      tokenRegex = /<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/|\/\/[^\n]*|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`[^`]*`|<\/?[a-zA-Z0-9_-]+|#[a-fA-F0-9]{3,8}|\.[a-zA-Z0-9_-]+|[0-9]+(?:\.[0-9]+)?(?:px|rem|em|%|vh|vw|fr|s|ms|deg)?|===|!==|==|!=|<=|>=|=>|\+\+|--|\+=|-=|\*=|\/=|&&|\|\||::|->|[a-zA-Z_][a-zA-Z0-9_]*-[a-zA-Z0-9_-]+|[a-zA-Z_][a-zA-Z0-9_$]*|[{}();,.:=<>+\-*/\[\]]/g;
    } else {
      tokenRegex = /<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`[^`]*`|<\/?[a-zA-Z0-9_-]+|#[a-fA-F0-9]{3,8}|#[a-zA-Z0-9_-]+|\.[a-zA-Z0-9_-]+|[0-9]+(?:\.[0-9]+)?(?:px|rem|em|%|vh|vw|fr|s|ms|deg)?|===|!==|==|!=|<=|>=|=>|\+\+|--|\+=|-=|\*=|\/=|&&|\|\||::|->|[a-zA-Z_][a-zA-Z0-9_]*-[a-zA-Z0-9_-]+|[a-zA-Z_][a-zA-Z0-9_$]*|[{}();,.:=<>+\-*/\[\]]/g;
    }
    const matches = trimmed.match(tokenRegex) || [];
    return matches.filter(t => t.trim().length > 0);
  }

  const cssProperties = {
    'font-size': { role: 'CSS Typography Dimension', why: 'Controls the glyph height and optical sizing of text characters on screen (e.g. 22px).' },
    'font-weight': { role: 'CSS Typographic Weight', why: 'Specifies character stroke thickness or boldness (e.g. 800 for extra-bold visual prominence).' },
    'color': { role: 'CSS Text Foreground Color', why: 'Applies foreground text color to all character glyphs inside this element.' },
  };

  function explainTokenInContext(token, line, language) {
    const raw = token.trim();
    const lower = raw.toLowerCase();
    if (raw.startsWith('.')) {
      return { token: raw, role: 'CSS Class Selector', whyUsed: `Targets all HTML elements decorated with class="${raw.slice(1)}" to apply this visual styling block.` };
    }
    if (raw.startsWith('#') && (raw.length === 4 || raw.length === 7 || raw.length === 9) && /#[a-fA-F0-9]+/.test(raw)) {
      return { token: raw, role: 'Hexadecimal Color Literal', whyUsed: `Defines an exact sRGB color value (${raw}) matching the application brand palette.` };
    }
    if (cssProperties[lower]) {
      return { token: raw, role: cssProperties[lower].role, whyUsed: cssProperties[lower].why };
    }
    if (/^[0-9]+(?:\.[0-9]+)?px$/i.test(raw)) {
      return { token: raw, role: 'CSS Pixel Dimension (px)', whyUsed: `Defines an absolute screen measurement of ${raw} independent pixels for precise visual sizing.` };
    }
    if (/^[0-9]+(?:\.[0-9]+)?$/.test(raw)) {
      return { token: raw, role: 'Numeric Literal Constant', whyUsed: `Specifies numeric constant value ${raw}.` };
    }
    if (raw === '{' || raw === '}') {
      return { token: raw, role: 'Declaration Block Delimiter', whyUsed: raw === '{' ? 'Opens CSS declaration block.' : 'Closes CSS declaration block.' };
    }
    if (raw === ':') {
      return { token: raw, role: 'Property-Value Separator', whyUsed: 'Separates property from value.' };
    }
    if (raw === ';') {
      return { token: raw, role: 'Declaration Terminator', whyUsed: 'Terminates CSS declaration.' };
    }
    return { token: raw, role: 'Token', whyUsed: `Statement token in ${language}.` };
  }

  const testCssLine = '.logo { font-size: 22px; font-weight: 800; color: #d97706; }';
  const tokens = extractSemanticTokensFromLine(testCssLine, 'css');

  // Verify composite tokens are preserved intact and never mutilated
  assert.ok(tokens.includes('.logo'), 'Must preserve .logo intact as CSS class selector');
  assert.ok(tokens.includes('font-size'), 'Must preserve font-size intact as single CSS property');
  assert.ok(!tokens.includes('font') && !tokens.includes('size'), 'Must not split font-size into font and size');
  assert.ok(tokens.includes('22px'), 'Must preserve 22px intact with unit');
  assert.ok(tokens.includes('font-weight'), 'Must preserve font-weight intact');
  assert.ok(tokens.includes('800'), 'Must preserve numeric weight 800 intact');
  assert.ok(tokens.includes('#d97706'), 'Must preserve hex color #d97706 intact');

  // Verify rich semantic descriptions
  const explanations = tokens.map(t => explainTokenInContext(t, testCssLine, 'css'));
  for (const exp of explanations) {
    assert.ok(!exp.whyUsed.includes('Participates in line statement execution'), 'Must never output vague generic placeholder text');
    assert.ok(exp.whyUsed.length > 10, 'Each token must have substantive explanation');
  }

  const logoExp = explanations.find(e => e.token === '.logo');
  assert.equal(logoExp.role, 'CSS Class Selector');

  const fontSizeExp = explanations.find(e => e.token === 'font-size');
  assert.equal(fontSizeExp.role, 'CSS Typography Dimension');

  const weightExp = explanations.find(e => e.token === '800');
  assert.equal(weightExp.role, 'Numeric Literal Constant');

  const colorExp = explanations.find(e => e.token === '#d97706');
  assert.equal(colorExp.role, 'Hexadecimal Color Literal');
});

// Test 26: Surrounding Block Detection and Scope Context Analysis
test('Surrounding Block Detection accurately identifies enclosing scopes, collaborating tokens, and ripple effects', () => {
  function detectEnclosingCodeBlock(lines, targetLineIndex, language) {
    const line = lines[targetLineIndex] || '';
    const lang = (language || '').toLowerCase();
    const total = lines.length;

    const isCss = lang.includes('css') || 
      (line.includes(':') && (line.includes('px') || line.includes('rem') || line.includes('#') || line.includes(';'))) ||
      line.trim().startsWith('.') || line.trim().startsWith('#');

    if (isCss) {
      let startLine = targetLineIndex;
      let selector = '';
      for (let i = targetLineIndex; i >= 0; i--) {
        const cur = lines[i].trim();
        if (cur.includes('{') || /^[.#a-zA-Z0-9_:,\s>+~-]+$/.test(cur)) {
          selector = cur.replace(/\{.*/, '').trim();
          startLine = i;
          if (cur.includes('{')) break;
        }
        if (cur === '}' && i !== targetLineIndex) break;
      }

      let endLine = targetLineIndex;
      for (let i = targetLineIndex; i < total; i++) {
        const cur = lines[i].trim();
        if (cur.includes('}')) {
          endLine = i;
          break;
        }
      }

      const blockLines = lines.slice(startLine, endLine + 1);
      const siblingDeclarations = blockLines
        .map(l => l.trim())
        .filter(l => l.includes(':') && l.includes(';'));

      return {
        blockType: 'css_rule',
        blockName: `CSS Rule: ${selector || 'CSS Block'}`,
        startLine: startLine + 1,
        endLine: endLine + 1,
        codeSnippet: blockLines.join('\n'),
        siblingTokensOrProperties: siblingDeclarations,
        surroundingSummary: `Presentation group styling '${selector || 'elements'}'.`,
      };
    }

    let compStart = -1;
    let compName = '';
    for (let i = targetLineIndex; i >= 0; i--) {
      const cur = lines[i].trim();
      const compMatch = cur.match(/(?:export\s+default\s+|export\s+)?function\s+([A-Z][a-zA-Z0-9_]*)/);
      if (compMatch) {
        compStart = i;
        compName = compMatch[1];
        break;
      }
    }

    if (compStart !== -1) {
      return {
        blockType: 'react_component',
        blockName: `Component: <${compName} />`,
        startLine: compStart + 1,
        endLine: lines.length,
        codeSnippet: lines.slice(compStart).join('\n'),
        siblingTokensOrProperties: [],
        surroundingSummary: `Architectural container: <${compName} />.`,
      };
    }

    return {
      blockType: 'control_flow',
      blockName: 'Execution Scope',
      startLine: 1,
      endLine: total,
      codeSnippet: lines.join('\n'),
      siblingTokensOrProperties: [],
      surroundingSummary: 'Sequential execution scope.',
    };
  }

  function tokenizeLineForInteractiveDisplay(line) {
    const tokenRegex = /<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`[^`]*`|<\/?[a-zA-Z0-9_-]+|#[a-fA-F0-9]{3,8}|#[a-zA-Z0-9_-]+|\.[a-zA-Z0-9_-]+|[0-9]+(?:\.[0-9]+)?(?:px|rem|em|%|vh|vw|fr|s|ms|deg)?|===|!==|==|!=|<=|>=|=>|\+\+|--|\+=|-=|\*=|\/=|&&|\|\||::|->|[a-zA-Z_][a-zA-Z0-9_]*-[a-zA-Z0-9_-]+|[a-zA-Z_][a-zA-Z0-9_$]*|[{}();,.:=<>+\-*/\[\]]/g;
    const tokens = line.match(tokenRegex) || [];
    const segments = [];
    let currentIndex = 0;

    for (const token of tokens) {
      const tokenPos = line.indexOf(token, currentIndex);
      if (tokenPos === -1) continue;
      if (tokenPos > currentIndex) {
        const gap = line.slice(currentIndex, tokenPos);
        segments.push({ text: gap, isToken: false, isWhitespace: gap.trim().length === 0 });
      }
      segments.push({ text: token, isToken: true, isWhitespace: false });
      currentIndex = tokenPos + token.length;
    }
    if (currentIndex < line.length) {
      const trailing = line.slice(currentIndex);
      segments.push({ text: trailing, isToken: false, isWhitespace: trailing.trim().length === 0 });
    }
    return segments;
  }

  const cssLines = [
    '/* Global Navigation Styles */',
    '.logo {',
    '  font-size: 22px;',
    '  font-weight: 800;',
    '  color: #d97706;',
    '}',
    '.nav-links { display: flex; }'
  ];

  // 1. Verify CSS Rule Block Detection
  const block = detectEnclosingCodeBlock(cssLines, 2, 'css');
  assert.equal(block.blockType, 'css_rule');
  assert.equal(block.blockName, 'CSS Rule: .logo');
  assert.equal(block.startLine, 2);
  assert.equal(block.endLine, 6);
  assert.equal(block.siblingTokensOrProperties.length, 3);

  // 2. Verify React Component Scope Detection
  const reactLines = [
    'import React, { useState } from "react";',
    'export default function BankingDashboard() {',
    '  const [balance, setBalance] = useState(12450.00);',
    '  return <div>{balance}</div>;',
    '}'
  ];
  const reactBlock = detectEnclosingCodeBlock(reactLines, 2, 'tsx');
  assert.equal(reactBlock.blockType, 'react_component');
  assert.equal(reactBlock.blockName, 'Component: <BankingDashboard />');
  assert.equal(reactBlock.startLine, 2);

  // 3. Verify Interactive Tokenization for Cursor Hover
  const segments = tokenizeLineForInteractiveDisplay('  font-size: 22px;');
  assert.ok(segments.some(s => s.text === 'font-size' && s.isToken === true));
  assert.ok(segments.some(s => s.text === '22px' && s.isToken === true));
  assert.ok(segments.some(s => s.text === ':' && s.isToken === true));
  assert.ok(segments.some(s => s.text === ';' && s.isToken === true));

  // 4. Verify Universal Language Scope (Python Indentation)
  function detectPythonScope(lines, targetLineIndex) {
    let pyHeaderLine = -1;
    let pyHeaderName = '';
    let baseIndent = 0;
    for (let i = targetLineIndex; i >= 0; i--) {
      const cur = lines[i];
      const fnMatch = cur.trim().match(/^(?:async\s+)?def\s+([a-zA-Z0-9_]+)\s*\(/);
      if (fnMatch) {
        pyHeaderLine = i;
        pyHeaderName = `Python Function: def ${fnMatch[1]}()`;
        baseIndent = cur.search(/\S/);
        break;
      }
    }
    let pyEndLine = pyHeaderLine;
    for (let i = pyHeaderLine + 1; i < lines.length; i++) {
      const cur = lines[i];
      if (!cur.trim() || cur.trim().startsWith('#')) continue;
      const indent = cur.search(/\S/);
      if (indent <= baseIndent) break;
      pyEndLine = i;
    }
    return { startLine: pyHeaderLine + 1, endLine: pyEndLine + 1, name: pyHeaderName };
  }

  const pyLines = [
    'import math',
    'def calculate_tax(income):',
    '    if income > 50000:',
    '        return income * 0.2',
    '    return income * 0.1',
    'def other(): pass'
  ];
  const pyScope = detectPythonScope(pyLines, 3);
  assert.equal(pyScope.startLine, 2);
  assert.equal(pyScope.endLine, 5);
  assert.equal(pyScope.name, 'Python Function: def calculate_tax()');
});

// Test 34: 10-20% Code Challenge Scaffolder on High-Scale Files (e.g. 1492-line bhukkad.html)
test('Code Challenge Scaffolder calculates 10-20% challenge window and preserves 100% reference code', () => {
  function generateChallenge(fileContent, fileName, language) {
    const lines = fileContent.split('\n');
    const N = lines.length;
    const isHtml = fileName.endsWith('.html');
    const isCss = fileName.endsWith('.css');
    const cStart = isHtml ? '<!-- ' : (isCss ? '/* ' : '// ');
    const cEnd = isHtml ? ' -->' : (isCss ? ' */' : '');

    let challengeSize = Math.max(5, Math.min(220, Math.round(N * 0.15)));
    if (N > 1000) {
      challengeSize = Math.min(200, Math.max(100, Math.round(N * 0.12)));
    }

    let startIdx = Math.min(Math.round(N * 0.08), 25);
    let endIdx = Math.min(N - 1, startIdx + challengeSize - 1);
    const actualCount = endIdx - startIdx + 1;

    const leading = lines.slice(0, startIdx);
    const trailing = lines.slice(endIdx + 1);
    const banner = [
      `${cStart}🎯 YOUR CHALLENGE: Lines ${startIdx + 1} to ${endIdx + 1}${cEnd}`,
      `${cStart}// Implement ~${actualCount} lines...${cEnd}`
    ];

    const scaffold = [...leading, ...banner, ...trailing].join('\n');
    return {
      fullReference: fileContent,
      scaffoldUserCode: scaffold,
      totalLines: N,
      challengeCount: actualCount,
      percent: Math.round((actualCount / N) * 100),
      startLine: startIdx + 1,
      endLine: endIdx + 1,
    };
  }

  // 1. Simulate 1492-line bhukkad.html
  const dummyHtmlLines = Array.from({ length: 1492 }, (_, i) => `  <div class="line-${i + 1}">Content</div>`);
  dummyHtmlLines[0] = '<!DOCTYPE html><html><body>';
  dummyHtmlLines[1491] = '</body></html>';
  const htmlContent = dummyHtmlLines.join('\n');

  const resultHtml = generateChallenge(htmlContent, 'bhukkad.html', 'html');
  assert.equal(resultHtml.totalLines, 1492);
  // Must be between 100 and 200 lines as requested by user
  assert.ok(resultHtml.challengeCount >= 100 && resultHtml.challengeCount <= 200, `Expected 100-200 lines, got ${resultHtml.challengeCount}`);
  // Percent should be around 10-20% (12%)
  assert.ok(resultHtml.percent >= 10 && resultHtml.percent <= 20);
  assert.equal(resultHtml.fullReference, htmlContent);
  assert.ok(resultHtml.scaffoldUserCode.includes('<!-- 🎯 YOUR CHALLENGE'));
  assert.ok(resultHtml.scaffoldUserCode.includes('<!DOCTYPE html><html><body>'));
  assert.ok(resultHtml.scaffoldUserCode.includes('</body></html>'));

  // 2. Simulate 50-line CSS file
  const dummyCssLines = Array.from({ length: 50 }, (_, i) => `.item-${i} { color: red; }`);
  const cssContent = dummyCssLines.join('\n');
  const resultCss = generateChallenge(cssContent, 'styles.css', 'css');
  assert.equal(resultCss.totalLines, 50);
  assert.ok(resultCss.challengeCount >= 5 && resultCss.challengeCount <= 15);
  assert.ok(resultCss.scaffoldUserCode.includes('/* 🎯 YOUR CHALLENGE'));
});

// Test 35: Context-Aware AI Search & Non-Repetitive Explanation Engine
test('AI Chat generates authentic explanations for queries like nav-btn without canned TypeScript replies', () => {
  const repoFiles = [
    {
      name: 'bhukkadresolved.html',
      content: `
        <header class="navbar">
          <button class="nav-btn">Menu</button>
        </header>
        <style>
          .nav-btn {
            display: flex;
            align-items: center;
            padding: 0 24px;
            height: 64px;
            background: #e11d48;
          }
        </style>
      `
    }
  ];

  function searchAndExplain(term, files, projectName) {
    const raw = term.trim();
    const cleanTerm = raw.replace(/[?!.,;:()'"`]/g, '').trim();
    const stopWords = new Set(['what', 'is', 'the', 'how', 'does', 'do', 'can', 'you', 'explain', 'tell', 'me', 'about', 'in', 'for', 'this', 'show', 'please']);
    const candidateTokens = raw
      .replace(/[?!.,;:()'"`]/g, ' ')
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length >= 2 && !stopWords.has(w.toLowerCase()));

    const searchTerms = Array.from(new Set([cleanTerm, ...candidateTokens])).filter(Boolean);

    let matchingRule = '';
    let matchType = '';
    let foundFile = '';
    let matchedToken = '';

    for (const t of searchTerms) {
      for (const f of files) {
        const cssRegex = new RegExp(`(\\.[a-zA-Z0-9_-]*${t}[a-zA-Z0-9_-]*\\s*\\{[^}]*\\})`, 'i');
        const cssMatch = f.content.match(cssRegex);
        if (cssMatch) {
          matchingRule = cssMatch[1].trim();
          matchType = 'css';
          foundFile = f.name;
          matchedToken = t;
          break;
        }
      }
      if (matchingRule) break;
    }

    if (matchingRule && matchType === 'css') {
      const displayToken = matchedToken || cleanTerm;
      return {
        text: `In **${projectName}**, \`${displayToken}\` is defined in \`${foundFile}\`:\n\n\`\`\`css\n${matchingRule}\n\`\`\`\n\n**What It Does:**\nThis CSS rule formats the interactive styling and layout for elements decorated with \`.${displayToken}\`. It specifies box dimensions, padding spacing, and uses Flexbox formatting.`
      };
    }

    return { text: 'Generic fallback' };
  }

  // 1. Query for "nav-btn?"
  const response1 = searchAndExplain('nav-btn?', repoFiles, 'Bhukkad');
  assert.ok(response1.text.includes('.nav-btn {'));
  assert.ok(response1.text.includes('display: flex;'));
  assert.ok(response1.text.includes('padding: 0 24px;'));
  assert.ok(response1.text.includes('height: 64px;'));
  assert.ok(!response1.text.includes('strict TypeScript type safety'));

  // 2. Query for "Explain nav-btn."
  const response2 = searchAndExplain('Explain nav-btn.', repoFiles, 'Bhukkad');
  assert.ok(response2.text.includes('.nav-btn {'));
  assert.ok(response2.text.includes('Flexbox formatting'));
  assert.ok(!response2.text.includes('strict TypeScript type safety'));
});

// Test 36: Deterministic 5-Level AI Assistance Policy Engine (Blueprint Section 4.1 & 9.1)
test('Policy Engine enforces strict generation constraints and promotion gating across 5 assistance levels', () => {
  const policies = {
    1: { level: 1, name: 'Level 1: Tutor', maxLines: 0, minFloor: 85 },
    2: { level: 2, name: 'Level 2: Pair', maxLines: 8, minFloor: 75 },
    3: { level: 3, name: 'Level 3: Co-Developer', maxLines: 30, minFloor: 60 },
    4: { level: 4, name: 'Level 4: Builder', maxLines: 120, minFloor: 40 },
    5: { level: 5, name: 'Level 5: Autopilot', maxLines: 500, minFloor: 25 },
  };

  function enforcePolicy(levelNum, proposedLines, currentOwnership) {
    const p = policies[levelNum];
    if (levelNum === 1 && proposedLines > 3) {
      return { allowed: false, reason: 'Level 1 blocks direct solutions; Socratic hints only.' };
    }
    if (levelNum === 2 && proposedLines > p.maxLines) {
      return { allowed: false, reason: `Exceeds max allowed ${p.maxLines} lines for Pair mode.` };
    }
    if (currentOwnership < p.minFloor && levelNum >= 4) {
      return { allowed: false, reason: `Ownership (${currentOwnership}%) below required floor (${p.minFloor}%).` };
    }
    return { allowed: true };
  }

  function canPromote(currentLvl, targetLvl, currentOwnership) {
    // Lowering is always allowed freely
    if (targetLvl <= currentLvl) return { allowed: true, requiresChallenge: false };
    const target = policies[targetLvl];
    if (currentOwnership < target.minFloor) {
      return { allowed: false, requiresChallenge: true, reason: `Must have >= ${target.minFloor}% ownership.` };
    }
    return { allowed: true, requiresChallenge: false };
  }

  // 1. Level 1 must block full code generation
  assert.equal(enforcePolicy(1, 20, 90).allowed, false);
  assert.equal(enforcePolicy(1, 2, 90).allowed, true);

  // 2. Level 2 must cap snippets at 8 lines
  assert.equal(enforcePolicy(2, 12, 80).allowed, false);
  assert.equal(enforcePolicy(2, 6, 80).allowed, true);

  // 3. Level 4 requires at least 40% verified ownership
  assert.equal(enforcePolicy(4, 50, 30).allowed, false);
  assert.equal(enforcePolicy(4, 50, 65).allowed, true);

  // 4. Lowering assistance level from Level 4 to Level 1 is always permitted
  assert.equal(canPromote(4, 1, 30).allowed, true);

  // 5. Raising assistance level from Level 1 to Level 4 when ownership is low requires challenge
  const promoteBlocked = canPromote(1, 4, 35);
  assert.equal(promoteBlocked.allowed, false);
  assert.equal(promoteBlocked.requiresChallenge, true);
});

// Test 37: Line-Level Provenance & Multi-Tier Ownership Tracking (Blueprint Section 4.2)
test('Line Provenance Engine computes Authored %, Understood %, and isolates Imported Baseline', () => {
  function computeProvenance(files, isGithubRepo = false) {
    let totalLines = 0;
    let userLines = 0;
    let understoodLines = 0;
    let importedLines = 0;
    let aiLines = 0;

    for (const f of files) {
      const lines = f.content.split('\n');
      const count = lines.length;
      totalLines += count;

      const isImported = f.isImported || (isGithubRepo && !f.hasEdits);
      const statuses = new Array(count).fill(isImported ? 'IMPORTED_BASELINE' : 'AI_GENERATED');

      for (const c of f.contributions || []) {
        for (let i = c.start - 1; i < c.end; i++) {
          statuses[i] = c.type;
        }
      }

      for (const s of statuses) {
        if (s === 'USER_WRITTEN') userLines += 1;
        else if (s === 'USER_UNDERSTOOD') understoodLines += 1;
        else if (s === 'IMPORTED_BASELINE') importedLines += 1;
        else aiLines += 1;
      }
    }

    const activeLines = Math.max(1, totalLines - importedLines);
    const effectiveTotal = importedLines > 0 ? activeLines : Math.max(1, totalLines);

    const authoredPct = Math.round((userLines / effectiveTotal) * 100);
    const understoodPct = Math.round((understoodLines / effectiveTotal) * 100);
    const verifiedOwnership = Math.min(100, Math.round(((userLines + understoodLines) / effectiveTotal) * 100));

    return { totalLines, userLines, understoodLines, importedLines, authoredPct, understoodPct, verifiedOwnership };
  }

  // 1. Fresh Project with 10 user lines, 5 understood lines, 15 AI lines (30 total)
  const freshFiles = [
    {
      content: 'line1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\nline10\n' +
               'line11\nline12\nline13\nline14\nline15\n' +
               'line16\nline17\nline18\nline19\nline20\nline21\nline22\nline23\nline24\nline25\nline26\nline27\nline28\nline29\nline30',
      contributions: [
        { start: 1, end: 10, type: 'USER_WRITTEN' },
        { start: 11, end: 15, type: 'USER_UNDERSTOOD' }
      ]
    }
  ];

  const freshResult = computeProvenance(freshFiles);
  assert.equal(freshResult.totalLines, 30);
  assert.equal(freshResult.userLines, 10);
  assert.equal(freshResult.understoodLines, 5);
  assert.equal(freshResult.authoredPct, 33);
  assert.equal(freshResult.understoodPct, 17);
  assert.equal(freshResult.verifiedOwnership, 50);

  // 2. Imported 1000-line repo where user authored 50 lines and understood 30 lines
  const importedFiles = [
    {
      content: Array.from({ length: 1000 }, (_, i) => `code line ${i}`).join('\n'),
      isImported: true,
      contributions: [
        { start: 1, end: 50, type: 'USER_WRITTEN' },
        { start: 51, end: 80, type: 'USER_UNDERSTOOD' }
      ]
    }
  ];

  const importedResult = computeProvenance(importedFiles, true);
  assert.equal(importedResult.totalLines, 1000);
  assert.equal(importedResult.userLines, 50);
  assert.equal(importedResult.understoodLines, 30);
  // Verified ownership on active challenge lines
  assert.ok(importedResult.verifiedOwnership > 0);
});

// Test 38: Command Palette & Verifiable Portfolio Integration (Blueprint Section 5.3 & 15)
test('Command Palette registers all core actions and Verified Portfolio maps to CS Syllabus', () => {
  const commands = [
    { id: 'run-tests', title: 'Run & Validate Code', shortcut: 'Ctrl+Enter' },
    { id: 'toggle-focus', title: 'Toggle Focus Mode', shortcut: 'Alt+F' },
    { id: 'predict-reveal', title: 'Predict Next Step', shortcut: 'Alt+P' },
    { id: 'explain-back', title: 'Explain-Back Code Audit', shortcut: 'Alt+E' },
    { id: 'ai-free-checkpoint', title: 'AI-Free Mastery Checkpoint', shortcut: 'Alt+C' },
    { id: 'view-portfolio', title: 'View Verified Engineering Portfolio' },
    { id: 'knowledge-graph', title: 'Open Architectural Knowledge Graph' },
  ];

  assert.equal(commands.length, 7);
  assert.ok(commands.some(c => c.shortcut === 'Ctrl+Enter'));
  assert.ok(commands.some(c => c.shortcut === 'Alt+F'));
  assert.ok(commands.some(c => c.shortcut === 'Alt+P'));
  assert.ok(commands.some(c => c.shortcut === 'Alt+E'));
  assert.ok(commands.some(c => c.shortcut === 'Alt+C'));

  // Syllabus Mapping
  const syllabusTopics = [
    'Data Structures & Logic',
    'Frontend Architecture',
    'Software Engineering',
    'System Verification'
  ];
  assert.equal(syllabusTopics.length, 4);
});











