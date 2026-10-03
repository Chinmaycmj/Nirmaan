export interface TokenDoc {
  token: string;
  name: string;
  category: 'keyword' | 'type' | 'function' | 'operator' | 'css_property' | 'dom_api' | 'constant';
  language: 'javascript' | 'css' | 'cpp' | 'java' | 'python' | 'html' | 'react' | 'universal';
  shortDescription: string;
  detailedExplanation: string;
  realLifeAnalogy?: string;
  documentationUrl: string;
  documentationSource: 'MDN Web Docs' | 'cppreference.com' | 'Oracle Java Docs' | 'Python Docs' | 'React Docs' | 'W3C / Web Standards';
  syntaxExample?: string;
  syllableBreakdown?: string;
  phonetic?: string;
  grammarRole?: string;
}

export interface LineSyllableToken {
  text: string;
  category: 'keyword' | 'type' | 'identifier' | 'operator' | 'punctuation' | 'literal' | 'comment';
  syllables?: string;
  phonetic?: string;
  grammarRole: string;
  explanation: string;
  docUrl: string;
  docSource: string;
}

export const TOKEN_DOCUMENTATION_REGISTRY: Record<string, TokenDoc> = {
  // ================= C++ TOKENS =================
  'switch': {
    token: 'switch',
    name: 'switch statement',
    category: 'keyword',
    language: 'cpp',
    shortDescription: 'Evaluates an integral or enum expression and jumps to matching case labels.',
    detailedExplanation: 'In C++, switch compiles into a jump table when cases are dense, allowing O(1) branch dispatch rather than sequential O(N) if-else comparisons. It matches integral types such as char or int.',
    realLifeAnalogy: 'Like a train track switchyard where the lever immediately directs the locomotive onto track 4 without testing tracks 1, 2, and 3 first.',
    documentationUrl: 'https://en.cppreference.com/w/cpp/language/switch',
    documentationSource: 'cppreference.com',
    syntaxExample: "switch (op) { case '+': return a + b; }",
    syllableBreakdown: 'switch',
    phonetic: '[swich]',
    grammarRole: 'Selection Statement Keyword',
  },
  'case': {
    token: 'case',
    name: 'case label',
    category: 'keyword',
    language: 'cpp',
    shortDescription: 'Defines a target jump point inside a switch body matching a constant value.',
    detailedExplanation: 'Case labels must be compile-time constant expressions. When execution jumps to a case, execution continues sequentially unless halted by a return or break statement.',
    realLifeAnalogy: 'Like a marked elevator floor button that lights up when you arrive at floor 7.',
    documentationUrl: 'https://en.cppreference.com/w/cpp/language/switch',
    documentationSource: 'cppreference.com',
    syntaxExample: "case '+': return prev + current;",
    syllableBreakdown: 'case',
    phonetic: '[kays]',
    grammarRole: 'Branch Target Label',
  },
  'std::nan': {
    token: 'std::nan',
    name: 'std::nan (Not-a-Number)',
    category: 'constant',
    language: 'cpp',
    shortDescription: 'Generates a quiet NaN (Not-A-Number) IEEE 754 floating-point representation.',
    detailedExplanation: 'Returns a floating point NaN without raising a hardware trap. Used in numerical computing to signal undefined operations (like zero division 0/0 or 10/0) without crashing the program.',
    realLifeAnalogy: 'Like an ATM receipt printing "VOID TRANSACTION" instead of catching on fire when someone types an invalid account number.',
    documentationUrl: 'https://en.cppreference.com/w/cpp/numeric/math/nan',
    documentationSource: 'cppreference.com',
    syntaxExample: 'return std::nan("");',
    syllableBreakdown: 'S-T-D col-on col-on N-A-N',
    phonetic: '[es-tee-dee nan]',
    grammarRole: 'Standard Library Numerical Constant',
  },
  'double': {
    token: 'double',
    name: 'double precision float',
    category: 'type',
    language: 'cpp',
    shortDescription: '64-bit IEEE 754 double-precision floating point type (~15-17 decimal digits of precision).',
    detailedExplanation: 'Allocates 8 bytes (64 bits): 1 sign bit, 11 exponent bits, and 52 mantissa/fraction bits. Essential for precision financial, mathematical, and scientific calculations.',
    realLifeAnalogy: 'Like a laboratory analytical balance that measures down to the microgram, compared to a kitchen scale.',
    documentationUrl: 'https://en.cppreference.com/w/cpp/language/types',
    documentationSource: 'cppreference.com',
    syntaxExample: 'double calculate(double prev, double current, char op);',
    syllableBreakdown: 'dou·ble',
    phonetic: '[dúb-uhl]',
    grammarRole: 'Primitive Floating-Point Type Specifier',
  },
  'char': {
    token: 'char',
    name: 'char data type',
    category: 'type',
    language: 'cpp',
    shortDescription: 'Character type representing an 8-bit ASCII character or integer code.',
    detailedExplanation: 'In C++, char is a 1-byte integer type representing text characters (e.g. \'+\', \'-\'). Character literals are wrapped in single quotes.',
    realLifeAnalogy: 'Like a single keycap on a mechanical typewriter.',
    documentationUrl: 'https://en.cppreference.com/w/cpp/language/types',
    documentationSource: 'cppreference.com',
    syntaxExample: "char op = '+';",
    syllableBreakdown: 'char',
    phonetic: '[chahr]',
    grammarRole: 'Character Primitive Type Specifier',
  },
  '#include': {
    token: '#include',
    name: '#include preprocessor directive',
    category: 'keyword',
    language: 'cpp',
    shortDescription: 'Instructs the C++ preprocessor to include the contents of a header file.',
    detailedExplanation: 'Inserts the complete declarations from header libraries (like <iostream> for I/O or <cmath> for mathematical constants) before compilation commences.',
    realLifeAnalogy: 'Like ordering tools from the warehouse before beginning construction on a building.',
    documentationUrl: 'https://en.cppreference.com/w/cpp/preprocessor/include',
    documentationSource: 'cppreference.com',
    syntaxExample: '#include <iostream>',
    syllableBreakdown: 'hash in·clude',
    phonetic: '[hash in-klood]',
    grammarRole: 'Preprocessor Macro Directive',
  },

  // ================= JAVA TOKENS =================
  'public static': {
    token: 'public static',
    name: 'public static modifier',
    category: 'keyword',
    language: 'java',
    shortDescription: 'Specifies an globally-accessible class method that belongs to the class itself rather than instances.',
    detailedExplanation: '\'public\' allows invocation from any class in any package. \'static\' means no instance (new Calculator()) is required to call it—it resides directly on the class bytecode.',
    realLifeAnalogy: 'Like a public town clock on the courthouse tower: anyone can look at it without having to buy their own personal wristwatch.',
    documentationUrl: 'https://docs.oracle.com/javase/tutorial/java/javaOO/classvars.html',
    documentationSource: 'Oracle Java Docs',
    syntaxExample: 'public static double calculate(double prev, double current, char op)',
    syllableBreakdown: 'pub·lic stat·ic',
    phonetic: '[púb-lik stát-ik]',
    grammarRole: 'Access & Storage Specifier',
  },
  'Double.NaN': {
    token: 'Double.NaN',
    name: 'Double.NaN constant',
    category: 'constant',
    language: 'java',
    shortDescription: 'A constant holding a Not-a-Number (NaN) value of type double (IEEE 754).',
    detailedExplanation: 'In Java, Double.NaN represents an undefined arithmetic result. Any comparison with NaN (x == Double.NaN) returns false; use Double.isNaN(x) to test for it.',
    realLifeAnalogy: 'Like a test grading sheet marked "INCOMPLETE" instead of a numerical score from 0 to 100.',
    documentationUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Double.html#NaN',
    documentationSource: 'Oracle Java Docs',
    syntaxExample: 'if (current == 0.0) return Double.NaN;',
    syllableBreakdown: 'Dou·ble dot N-A-N',
    phonetic: '[dúb-uhl dot nan]',
    grammarRole: 'Wrapper Class Floating Constant',
  },

  // ================= JAVASCRIPT & DOM TOKENS =================
  'addEventListener': {
    token: 'addEventListener',
    name: 'addEventListener DOM method',
    category: 'dom_api',
    language: 'javascript',
    shortDescription: 'Registers an event handler function to be invoked when a specified event occurs.',
    detailedExplanation: 'Attaches a listener to an EventTarget (such as a Button or document). Supports event bubbling, capture phase, and prevents overwriting existing listeners unlike onclick.',
    realLifeAnalogy: 'Like hiring a security bellhop at the hotel door: whenever a guest rings the bell (click), the bellhop opens the door (runs function).',
    documentationUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener',
    documentationSource: 'MDN Web Docs',
    syntaxExample: "button.addEventListener('click', (e) => { ... });",
    syllableBreakdown: 'add E·vent Lis·ten·er',
    phonetic: '[ad ih-vént lís-uh-ner]',
    grammarRole: 'Event Target Dispatch Method',
  },
  'querySelector': {
    token: 'querySelector',
    name: 'document.querySelector',
    category: 'dom_api',
    language: 'javascript',
    shortDescription: 'Returns the first Element within the document that matches the specified CSS selector.',
    detailedExplanation: 'Parses any valid CSS selector string (\'#display\', \'.keypad button\', \'[data-action]\') and traverses the DOM tree using fast native browser engine routines.',
    realLifeAnalogy: 'Like searching for a book on a library shelf by its call number sticker.',
    documentationUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector',
    documentationSource: 'MDN Web Docs',
    syntaxExample: "const display = document.querySelector('#display');",
    syllableBreakdown: 'que·ry Se·lec·tor',
    phonetic: '[kwéer-ee sih-lék-ter]',
    grammarRole: 'DOM Node Query Method',
  },
  'querySelectorAll': {
    token: 'querySelectorAll',
    name: 'document.querySelectorAll',
    category: 'dom_api',
    language: 'javascript',
    shortDescription: 'Returns a static (non-live) NodeList representing a list of elements matching the selector.',
    detailedExplanation: 'Returns all matching nodes that you can iterate over using .forEach(). Because it is a static snapshot, modifying the DOM does not invalidate the collection.',
    realLifeAnalogy: 'Like taking a group photograph of everyone wearing blue shirts: the photo remains fixed even if people change clothes later.',
    documentationUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll',
    documentationSource: 'MDN Web Docs',
    syntaxExample: "const keys = document.querySelectorAll('.keypad button');",
    syllableBreakdown: 'que·ry Se·lec·tor All',
    phonetic: '[kwéer-ee sih-lék-ter awl]',
    grammarRole: 'DOM NodeList Query Method',
  },
  'dataset': {
    token: 'dataset',
    name: 'HTMLElement.dataset',
    category: 'dom_api',
    language: 'javascript',
    shortDescription: 'Provides read/write access to custom data attributes (data-*) on elements.',
    detailedExplanation: 'Maps HTML attributes like data-digit="7" into JavaScript object properties e.g. e.target.dataset.digit. CamelCases hyphenated names automatically.',
    realLifeAnalogy: 'Like a luggage tag attached to a suitcase holding extra passenger metadata.',
    documentationUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset',
    documentationSource: 'MDN Web Docs',
    syntaxExample: "const digit = button.dataset.digit;",
    syllableBreakdown: 'da·ta·set',
    phonetic: '[déy-tuh-set]',
    grammarRole: 'DOM String Map Property',
  },
  'textContent': {
    token: 'textContent',
    name: 'Node.textContent',
    category: 'dom_api',
    language: 'javascript',
    shortDescription: 'Gets or sets the text content of a node and its descendants without parsing HTML.',
    detailedExplanation: 'Unlike innerHTML, textContent does not trigger HTML parsing and is safe against Cross-Site Scripting (XSS) attacks because characters are treated purely as raw text.',
    realLifeAnalogy: 'Like writing with a dry-erase marker on a plain whiteboard instead of executing code.',
    documentationUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent',
    documentationSource: 'MDN Web Docs',
    syntaxExample: "display.textContent = '42';",
    syllableBreakdown: 'text Con·tent',
    phonetic: '[tekst kón-tent]',
    grammarRole: 'Raw String Content Accessor',
  },
  'parseFloat': {
    token: 'parseFloat',
    name: 'parseFloat() function',
    category: 'function',
    language: 'javascript',
    shortDescription: 'Parses a string argument and returns a floating point number.',
    detailedExplanation: 'Reads from left to right, ignoring leading whitespace. Stops at the first invalid decimal character. Returns NaN if the first non-whitespace character cannot be converted.',
    realLifeAnalogy: 'Like a coin sorter scanning a string of characters and pulling out legitimate numerical values.',
    documentationUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseFloat',
    documentationSource: 'MDN Web Docs',
    syntaxExample: "const val = parseFloat('3.14159');",
    syllableBreakdown: 'parse Float',
    phonetic: '[pahrs floht]',
    grammarRole: 'Global Numerical Conversion Function',
  },
  'return': {
    token: 'return',
    name: 'return statement',
    category: 'keyword',
    language: 'universal',
    shortDescription: 'Terminates the execution of a function and specifies a value to be returned to the caller.',
    detailedExplanation: 'Transfers control flow immediately back to the call site. Any lines of code placed after a return statement in the same block are unreachable dead code.',
    realLifeAnalogy: 'Like handing completed homework to the teacher and exiting the classroom.',
    documentationUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/return',
    documentationSource: 'MDN Web Docs',
    syntaxExample: 'return prev + current;',
    syllableBreakdown: 're·turn',
    phonetic: '[rih-túrn]',
    grammarRole: 'Control Transfer Keyword',
  },
  'const': {
    token: 'const',
    name: 'const declaration',
    category: 'keyword',
    language: 'javascript',
    shortDescription: 'Declares a block-scoped, immutable variable identifier binding.',
    detailedExplanation: 'Cannot be reassigned via assignment operator (=) and cannot be redeclared. Prevents accidental variable overwriting and signals intent to the JavaScript compiler.',
    realLifeAnalogy: 'Like tattooing a value onto a marble pillar rather than writing on a scratchpad.',
    documentationUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const',
    documentationSource: 'MDN Web Docs',
    syntaxExample: 'const maxItems = 100;',
    syllableBreakdown: 'const',
    phonetic: '[konst]',
    grammarRole: 'Immutable Block-Scope Binding Keyword',
  },
  'let': {
    token: 'let',
    name: 'let declaration',
    category: 'keyword',
    language: 'javascript',
    shortDescription: 'Declares a re-assignable, block-scoped local variable.',
    detailedExplanation: 'Scoped to the nearest enclosing pair of curly braces {}. Unlike var, let does not hoist with undefined and prevents temporal dead zone errors.',
    realLifeAnalogy: 'Like a whiteboard slot where numbers can be erased and replaced with updated values as calculations proceed.',
    documentationUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let',
    documentationSource: 'MDN Web Docs',
    syntaxExample: 'let currentInput = "0";',
    syllableBreakdown: 'let',
    phonetic: '[let]',
    grammarRole: 'Mutable Local Variable Declaration Keyword',
  },

  // ================= CSS GRID TOKENS =================
  'display: grid': {
    token: 'display: grid',
    name: 'CSS Grid Container',
    category: 'css_property',
    language: 'css',
    shortDescription: 'Defines an element as a grid container, establishing a new grid formatting context for its children.',
    detailedExplanation: 'Transforms direct children into grid items. Unlocks two-dimensional layout controls across both columns and rows simultaneously, unlike one-dimensional Flexbox.',
    realLifeAnalogy: 'Like laying down a graph-paper blueprint matrix for building rooms on a floorplan.',
    documentationUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/display',
    documentationSource: 'MDN Web Docs',
    syntaxExample: '.keypad { display: grid; }',
    syllableBreakdown: 'dis·play col-on grid',
    phonetic: '[dih-spléy gríd]',
    grammarRole: 'Formatting Context Declaration',
  },
  'grid-template-columns': {
    token: 'grid-template-columns',
    name: 'grid-template-columns',
    category: 'css_property',
    language: 'css',
    shortDescription: 'Defines the track sizing functions and line names of the grid columns.',
    detailedExplanation: 'Specifies the number of columns and their respective widths using pixels, percentages, auto, or fractional units (fr). Used with repeat() for symmetric matrices.',
    realLifeAnalogy: 'Like partitioning a chocolate bar into equal vertical columns.',
    documentationUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns',
    documentationSource: 'MDN Web Docs',
    syntaxExample: 'grid-template-columns: repeat(4, 1fr);',
    syllableBreakdown: 'grid tem·plate col·umns',
    phonetic: '[gríd tém-plit kól-uhmz]',
    grammarRole: 'Track List Definition Property',
  },
  'repeat(4, 1fr)': {
    token: 'repeat(4, 1fr)',
    name: 'repeat() CSS function',
    category: 'css_property',
    language: 'css',
    shortDescription: 'Represents a repeated track list pattern of 4 columns, each taking 1 equal fraction (1fr) of free space.',
    detailedExplanation: 'Shorthand for "1fr 1fr 1fr 1fr". The 1fr unit distributes leftover space in the grid container proportionally among tracks without overflow.',
    realLifeAnalogy: 'Like dividing a pizza into 4 identical slices so no slice is wider than the others.',
    documentationUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/repeat',
    documentationSource: 'MDN Web Docs',
    syntaxExample: 'grid-template-columns: repeat(4, 1fr);',
    syllableBreakdown: 're·peat four, one F-R',
    phonetic: '[rih-péet fohr, wún ef-ahr]',
    grammarRole: 'CSS Functional Notation',
  },
  'gap': {
    token: 'gap',
    name: 'gap (gutter sizing)',
    category: 'css_property',
    language: 'css',
    shortDescription: 'Sets the gutters (spacing) between grid rows and columns without adding margin to outer edges.',
    detailedExplanation: 'Modern CSS standard replacing row-gap and column-gap. Eliminates negative-margin hacks and cleanly separates interactive buttons.',
    realLifeAnalogy: 'Like the mortar lines between bathroom tiles keeping each tile separated by an exact distance.',
    documentationUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/gap',
    documentationSource: 'MDN Web Docs',
    syntaxExample: 'gap: 12px;',
    syllableBreakdown: 'gap',
    phonetic: '[gap]',
    grammarRole: 'Layout Gutter Dimension Property',
  },

  // ================= PYTHON TOKENS =================
  'def': {
    token: 'def',
    name: 'def keyword',
    category: 'keyword',
    language: 'python',
    shortDescription: 'Defines a user-created function in Python.',
    detailedExplanation: 'Binds a function object to the specified identifier name. Python executes def statements as executable code, producing first-class callable functions.',
    realLifeAnalogy: 'Like writing down a recipe and naming it "Chocolate Chip Cookies" in your kitchen cookbook.',
    documentationUrl: 'https://docs.python.org/3/reference/compound_stmts.html#def',
    documentationSource: 'Python Docs',
    syntaxExample: 'def calculate(prev, current, op):',
    syllableBreakdown: 'def',
    phonetic: '[def]',
    grammarRole: 'Function Definition Header Keyword',
  },
  'float("nan")': {
    token: 'float("nan")',
    name: 'float("nan") in Python',
    category: 'constant',
    language: 'python',
    shortDescription: 'Constructs an IEEE 754 floating-point Not-a-Number (NaN) value from string.',
    detailedExplanation: 'Python does not have a built-in literal nan keyword; creating float("nan") or using math.nan safely represents undefined arithmetic calculations without throwing ZeroDivisionError.',
    realLifeAnalogy: 'Like a calculator display screen showing "Error" instead of smoking when you divide by zero.',
    documentationUrl: 'https://docs.python.org/3/library/functions.html#float',
    documentationSource: 'Python Docs',
    syntaxExample: 'return float("nan")',
    syllableBreakdown: 'float of nan',
    phonetic: '[floht ov nan]',
    grammarRole: 'Type Constructor Instantiation',
  },
  'if/elif/else': {
    token: 'if/elif/else',
    name: 'if, elif, else statements',
    category: 'keyword',
    language: 'python',
    shortDescription: 'Conditional branch execution in Python evaluating truthy/falsy expressions.',
    detailedExplanation: 'Python tests conditions from top to bottom. The first condition that evaluates to True executes its indented block; subsequent elif/else blocks are skipped.',
    realLifeAnalogy: 'Like a flowchart decision diamond directing you left or right depending on whether it is raining.',
    documentationUrl: 'https://docs.python.org/3/reference/compound_stmts.html#if',
    documentationSource: 'Python Docs',
    syntaxExample: "if op == '+': return prev + current",
    syllableBreakdown: 'if, el·if, else',
    phonetic: '[if, él-if, els]',
    grammarRole: 'Compound Conditional Statement',
  },

  // ================= REACT & TYPESCRIPT =================
  'useState': {
    token: 'useState',
    name: 'useState React Hook',
    category: 'function',
    language: 'react',
    shortDescription: 'Declares a state variable and updater function to persist values across component re-renders.',
    detailedExplanation: 'React preserves state across render calls. When calling the updater (setVal), React queues a re-render of the component tree and schedules DOM reconciliation.',
    realLifeAnalogy: 'Like a scoreboard in a basketball stadium: when a basket is made, the scorer updates the display board so all spectators see the new score.',
    documentationUrl: 'https://react.dev/reference/react/useState',
    documentationSource: 'React Docs',
    syntaxExample: "const [count, setCount] = useState(0);",
    syllableBreakdown: 'use State',
    phonetic: '[yoos stayt]',
    grammarRole: 'State Persistence Hook Primitive',
  },
};

/**
 * Decomposes any line of code into its individual syllables and syntax tokens.
 */
export function decomposeLineIntoSyllablesAndTokens(line: string, languageHint?: string): LineSyllableToken[] {
  const trimmed = line.trim();
  if (!trimmed) return [];

  // Match identifiers, strings, keywords, operators, delimiters
  const tokenRegex = /([a-zA-Z0-9_:]+|==|!=|<=|>=|\+=|-=|\*=|\/=|=>|\/\/|\/\*|\*\/|[+\-*/=<>{}();,\.']|"[^"]*"|'[^']*')/g;
  const matches = trimmed.match(tokenRegex) || [trimmed];
  const result: LineSyllableToken[] = [];

  for (const match of matches) {
    const doc = findTokenDocumentation(match, languageHint);
    const category = categorizeToken(match);

    result.push({
      text: match,
      category,
      syllables: doc?.syllableBreakdown || generateSyllables(match),
      phonetic: doc?.phonetic || `[${match.toLowerCase()}]`,
      grammarRole: doc?.grammarRole || deriveGrammarRole(match, category),
      explanation: doc?.shortDescription || `Syntax token '${match}' in ${languageHint || 'code'}.`,
      docUrl: doc?.documentationUrl || getDocumentationSearchUrl(match, languageHint),
      docSource: doc?.documentationSource || getOfficialDocSourceForLanguage(languageHint),
    });
  }

  return result;
}

function categorizeToken(token: string): LineSyllableToken['category'] {
  if (['switch', 'case', 'return', 'def', 'if', 'else', 'elif', 'const', 'let', 'public', 'static', 'class'].includes(token)) {
    return 'keyword';
  }
  if (['double', 'char', 'int', 'float', 'void', 'boolean', 'string', 'number'].includes(token)) {
    return 'type';
  }
  if (['+', '-', '*', '/', '=', '==', '!=', '<', '>', '+=', '-='].includes(token)) {
    return 'operator';
  }
  if (['{', '}', '(', ')', ';', ',', ':', '.'].includes(token)) {
    return 'punctuation';
  }
  if (token.startsWith('"') || token.startsWith("'") || /^[0-9]+(\.[0-9]+)?$/.test(token)) {
    return 'literal';
  }
  if (token.startsWith('//') || token.startsWith('#')) {
    return 'comment';
  }
  return 'identifier';
}

function deriveGrammarRole(token: string, category: LineSyllableToken['category']): string {
  switch (category) {
    case 'keyword': return 'Reserved Control Language Keyword';
    case 'type': return 'Data Type Specifier';
    case 'operator': return 'Arithmetic / Assignment Operator';
    case 'punctuation': return 'Syntactic Delimiter / Scope Boundary';
    case 'literal': return 'Constant Literal Value';
    case 'comment': return 'Documentation Annotation';
    default: return 'Identifier / Symbol Name';
  }
}

function generateSyllables(text: string): string {
  if (text.length <= 4) return text;
  // Simple heuristic hyphenation for readability
  return text.replace(/([aeiouy]{1,2})([^aeiouy\s]{1,2})([aeiouy])/gi, '$1·$2$3');
}

/**
 * Finds matching documentation for a token or line of code.
 */
export function findTokenDocumentation(rawToken: string, languageHint?: string): TokenDoc | null {
  const clean = rawToken.trim();
  if (!clean) return null;

  if (TOKEN_DOCUMENTATION_REGISTRY[clean]) {
    return TOKEN_DOCUMENTATION_REGISTRY[clean];
  }

  const cleanLower = clean.toLowerCase();
  for (const [key, doc] of Object.entries(TOKEN_DOCUMENTATION_REGISTRY)) {
    if (key.toLowerCase() === cleanLower) {
      return doc;
    }
  }

  for (const [key, doc] of Object.entries(TOKEN_DOCUMENTATION_REGISTRY)) {
    if (clean.includes(key) || key.includes(clean)) {
      return doc;
    }
  }

  const officialSource = getOfficialDocSourceForLanguage(languageHint);
  const searchUrl = getDocumentationSearchUrl(clean, languageHint);

  return {
    token: clean,
    name: `${clean} syntax`,
    category: 'keyword',
    language: (languageHint as any) || 'universal',
    shortDescription: `Component of ${languageHint || 'programming'} code statement.`,
    detailedExplanation: `The identifier "${clean}" performs an essential role in this code block. Click the official source link below to view its complete specification, parameters, and syntax rules.`,
    documentationUrl: searchUrl,
    documentationSource: officialSource,
    syllableBreakdown: generateSyllables(clean),
    grammarRole: 'Code Identifier / Statement Component',
  };
}

/**
 * Explains an entire line of code and returns token breakdowns + direct external documentation link.
 */
export function explainCodeLine(lineContent: string, lineNumber: number, language: string): {
  lineNumber: number;
  explanation: string;
  primaryToken?: TokenDoc;
  allTokens: TokenDoc[];
  syllables: LineSyllableToken[];
  externalDocUrl: string;
  docSource: string;
} {
  const trimmed = lineContent.trim();
  const tokensFound: TokenDoc[] = [];

  for (const [key, doc] of Object.entries(TOKEN_DOCUMENTATION_REGISTRY)) {
    if (lineContent.includes(key)) {
      tokensFound.push(doc);
    }
  }

  const primaryToken = tokensFound[0] || findTokenDocumentation(trimmed, language);
  const externalDocUrl = primaryToken ? primaryToken.documentationUrl : getDocumentationSearchUrl(trimmed, language);
  const docSource = primaryToken ? primaryToken.documentationSource : getOfficialDocSourceForLanguage(language);
  const syllables = decomposeLineIntoSyllablesAndTokens(lineContent, language);

  let explanation = `Line ${lineNumber} executes this statement.`;
  if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('#')) {
    explanation = `Code comment explaining the rationale or specifications for upcoming instructions.`;
  } else if (trimmed.includes('switch')) {
    explanation = `Evaluates the operator and branches directly to matching case conditions for rapid O(1) execution.`;
  } else if (trimmed.includes('case')) {
    explanation = `Branch target: executes arithmetic operation if the operator matches this symbol.`;
  } else if (trimmed.includes('std::nan') || trimmed.includes('Double.NaN') || trimmed.includes('float("nan")')) {
    explanation = `Defensive guard against division by zero: returns Not-a-Number (NaN) without crashing the program.`;
  } else if (trimmed.includes('return')) {
    explanation = `Exits the function immediately and passes the computed calculation result back to the caller.`;
  } else if (trimmed.includes('addEventListener')) {
    explanation = `Attaches a click event listener to catch user keypad taps and trigger corresponding calculation updates.`;
  } else if (trimmed.includes('display: grid')) {
    explanation = `Establishes a 2D CSS Grid formatting context so buttons arrange into structured keypad rows and columns.`;
  } else if (trimmed.includes('grid-template-columns')) {
    explanation = `Configures the keypad layout into 4 equal-width responsive fractional columns.`;
  } else if (trimmed.includes('gap:')) {
    explanation = `Sets uniform spacing between keypad buttons without requiring complex margin calculations.`;
  } else if (trimmed.includes('def calculate') || trimmed.includes('double calculate') || trimmed.includes('function calculate')) {
    explanation = `Defines the primary arithmetic calculation function with strict parameter signatures and return types.`;
  }

  return {
    lineNumber,
    explanation,
    primaryToken: primaryToken || undefined,
    allTokens: tokensFound,
    syllables,
    externalDocUrl,
    docSource,
  };
}

function getOfficialDocSourceForLanguage(lang?: string): 'MDN Web Docs' | 'cppreference.com' | 'Oracle Java Docs' | 'Python Docs' | 'React Docs' | 'W3C / Web Standards' {
  if (!lang) return 'MDN Web Docs';
  const l = lang.toLowerCase();
  if (l.includes('c++') || l.includes('cpp')) return 'cppreference.com';
  if (l.includes('java') && !l.includes('script')) return 'Oracle Java Docs';
  if (l.includes('python')) return 'Python Docs';
  if (l.includes('react')) return 'React Docs';
  return 'MDN Web Docs';
}

function getDocumentationSearchUrl(token: string, lang?: string): string {
  const l = (lang || '').toLowerCase();
  
  // Extract primary symbol/keyword from complex expressions (e.g. "disease_name: str = Field(c" -> "Field")
  let cleanSymbol = token.trim();
  if (cleanSymbol.includes('Field(') || cleanSymbol.includes('Field')) {
    return 'https://docs.pydantic.dev/latest/concepts/fields/';
  }
  if (cleanSymbol.includes('BaseModel')) {
    return 'https://docs.pydantic.dev/latest/concepts/models/';
  }
  if (cleanSymbol.includes(': str') || cleanSymbol === 'str') {
    return 'https://docs.python.org/3/library/stdtypes.html#text-sequence-type-str';
  }
  if (cleanSymbol.includes(': int') || cleanSymbol === 'int') {
    return 'https://docs.python.org/3/library/stdtypes.html#numeric-types-int-float-complex';
  }
  if (cleanSymbol.includes(': float') || cleanSymbol === 'float') {
    return 'https://docs.python.org/3/library/stdtypes.html#numeric-types-int-float-complex';
  }
  if (cleanSymbol.includes('FastAPI') || cleanSymbol.includes('APIRouter')) {
    return 'https://fastapi.tiangolo.com/';
  }

  // Extract clean alphanumeric keyword
  const words = cleanSymbol.match(/[a-zA-Z0-9_]+/g) || [cleanSymbol];
  // Prefer keywords like Field, def, class, return, switch, calculate
  const keyword = words.find(w => ['switch', 'case', 'return', 'def', 'class', 'import', 'str', 'Field', 'int', 'float', 'double', 'calculate', 'addEventListener'].includes(w)) || words[words.length - 1] || cleanSymbol;
  const q = encodeURIComponent(keyword.trim());

  if (l.includes('c++') || l.includes('cpp')) {
    return `https://en.cppreference.com/mwiki/index.php?search=${q}`;
  }
  if (l.includes('java') && !l.includes('script')) {
    return `https://docs.oracle.com/en/java/javase/21/docs/api/search.html?q=${q}`;
  }
  if (l.includes('python')) {
    return `https://docs.python.org/3/search.html?q=${q}`;
  }
  if (l.includes('react')) {
    return `https://react.dev/reference/react`;
  }
  return `https://developer.mozilla.org/en-US/search?q=${q}`;
}
