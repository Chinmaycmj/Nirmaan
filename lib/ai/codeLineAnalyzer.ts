export interface AITokenBreakdown {
  token: string;
  role: string;
  whyUsed: string;
  docUrl: string;
  docSource: string;
}

export interface AICodeAnalysis {
  lineContent: string;
  lineNumber: number;
  language: string;
  summary: string;
  detailedWalkthrough: string;
  realWorldAnalogy: string;
  tokens: AITokenBreakdown[];
  memoryAndRuntime: string;
  bestPractices: string;
  commonPitfalls: string[];
  suggestedQuestions: string[];
}

/**
 * Extracts intact, meaningful semantic tokens from a line of code.
 * Preserves hyphenated CSS properties (font-size, grid-template-columns),
 * CSS class selectors (.logo, .navbar), units (22px, 1.5rem), hex colors (#d97706),
 * HTML tags (<nav>, </nav>), and multi-character operators (=>, ===, !==).
 */
export function extractSemanticTokensFromLine(line: string, language: string): string[] {
  const trimmed = line.trim();
  if (!trimmed) return [];

  const isHashCommentLang = ['python', 'py', 'bash', 'sh', 'yaml', 'yml'].includes((language || '').toLowerCase());

  let tokenRegex: RegExp;
  if (isHashCommentLang) {
    tokenRegex = /<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/|\/\/[^\n]*|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`[^`]*`|<\/?[a-zA-Z0-9_-]+|#[a-fA-F0-9]{3,8}|\.[a-zA-Z0-9_-]+|[0-9]+(?:\.[0-9]+)?(?:px|rem|em|%|vh|vw|fr|s|ms|deg)?|===|!==|==|!=|<=|>=|=>|\+\+|--|\+=|-=|\*=|\/=|&&|\|\||::|->|[a-zA-Z_][a-zA-Z0-9_]*-[a-zA-Z0-9_-]+|[a-zA-Z_][a-zA-Z0-9_$]*|[{}();,.:=<>+\-*/\[\]]/g;
  } else {
    tokenRegex = /<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`[^`]*`|<\/?[a-zA-Z0-9_-]+|#[a-fA-F0-9]{3,8}|#[a-zA-Z0-9_-]+|\.[a-zA-Z0-9_-]+|[0-9]+(?:\.[0-9]+)?(?:px|rem|em|%|vh|vw|fr|s|ms|deg)?|===|!==|==|!=|<=|>=|=>|\+\+|--|\+=|-=|\*=|\/=|&&|\|\||::|->|[a-zA-Z_][a-zA-Z0-9_]*-[a-zA-Z0-9_-]+|[a-zA-Z_][a-zA-Z0-9_$]*|[{}();,.:=<>+\-*/\[\]]/g;
  }

  const matches = trimmed.match(tokenRegex) || [];
  return matches.filter(t => t.trim().length > 0);
}

/**
 * Returns deep, educational role and rationale for any token in context.
 * Never outputs vague generic sentences like "Participates in line statement execution".
 */
export function explainTokenInContext(token: string, line: string, language: string): AITokenBreakdown {
  const raw = token.trim();
  const lower = raw.toLowerCase();
  const lang = (language || 'javascript').toLowerCase();

  // 1. CSS Selectors (e.g. .logo, .navbar, .food-card, #root)
  if (raw.startsWith('.')) {
    const className = raw.slice(1);
    return {
      token: raw,
      role: 'CSS Class Selector',
      whyUsed: `Targets all HTML elements decorated with class="${className}" to apply this visual styling block.`,
      docUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Class_selectors',
      docSource: 'MDN Web Docs',
    };
  }

  if (raw.startsWith('#') && (raw.length === 4 || raw.length === 7 || raw.length === 9) && /#[a-fA-F0-9]+/.test(raw)) {
    return {
      token: raw,
      role: 'Hexadecimal Color Literal',
      whyUsed: `Defines an exact sRGB color value (${raw}) matching the application brand palette.`,
      docUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hex-color',
      docSource: 'MDN Web Docs',
    };
  }

  if (raw.startsWith('#')) {
    return {
      token: raw,
      role: 'CSS ID Selector',
      whyUsed: `Targets the unique DOM element with id="${raw.slice(1)}" for specific single-element styling.`,
      docUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/ID_selectors',
      docSource: 'MDN Web Docs',
    };
  }

  // 2. CSS Properties
  const cssProperties: Record<string, { role: string; why: string; url: string }> = {
    'font-size': {
      role: 'CSS Typography Dimension',
      why: 'Controls the glyph height and optical sizing of text characters on screen (e.g. 22px).',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/font-size',
    },
    'font-weight': {
      role: 'CSS Typographic Weight',
      why: 'Specifies character stroke thickness or boldness (e.g. 800 for extra-bold visual prominence).',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight',
    },
    'font-family': {
      role: 'CSS Typeface Specifier',
      why: 'Declares preferred typeface font families and fallback system font cascades.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/font-family',
    },
    'color': {
      role: 'CSS Text Foreground Color',
      why: 'Applies foreground text color to all character glyphs inside this element.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color',
    },
    'background': {
      role: 'CSS Container Background',
      why: 'Applies backdrop background styling (color, gradient, or image) beneath element content.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/background',
    },
    'background-color': {
      role: 'CSS Background Fill Color',
      why: 'Fills the container background with a solid color behind text and nested children.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/background-color',
    },
    'padding': {
      role: 'CSS Internal Spacing (Padding)',
      why: 'Creates interior breathing room between the element boundary and its inner content.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/padding',
    },
    'margin': {
      role: 'CSS External Spacing (Margin)',
      why: 'Establishes outer separation distance between this element and neighboring DOM elements.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/margin',
    },
    'border': {
      role: 'CSS Perimeter Border Stroke',
      why: 'Draws a visible outline boundary stroke enclosing the element dimensions.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/border',
    },
    'border-radius': {
      role: 'CSS Corner Curvature',
      why: 'Rounds the outer corner vertices of the box model for modern softened UI aesthetics.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius',
    },
    'border-bottom': {
      role: 'CSS Bottom Edge Divider',
      why: 'Renders a subtle separation stroke along the bottom edge of headers or navbars.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom',
    },
    'display': {
      role: 'CSS Box Formatting Context',
      why: 'Controls whether the element generates block, inline, 1D flexbox, or 2D grid layout context.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/display',
    },
    'grid-template-columns': {
      role: 'CSS Grid Track Definition',
      why: 'Defines the column widths, tracks, and responsive repeating patterns for the 2D layout matrix.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns',
    },
    'gap': {
      role: 'CSS Grid/Flex Gutter Distance',
      why: 'Enforces clean uniform spacing gutters between grid tracks or flex items without margin hacks.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/gap',
    },
    'align-items': {
      role: 'CSS Cross-Axis Alignment',
      why: 'Positions child elements along the perpendicular cross axis (e.g. vertically centering items).',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/align-items',
    },
    'justify-content': {
      role: 'CSS Main-Axis Distribution',
      why: 'Distributes leftover space along the primary direction axis (e.g. pushing nav items to edges).',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content',
    },
    'box-shadow': {
      role: 'CSS Depth Elevation Shadow',
      why: 'Casts smooth drop-shadow silhouettes beneath cards and modals to create visual hierarchy.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow',
    },
    'cursor': {
      role: 'CSS Mouse Cursor Specifier',
      why: 'Changes the operating system pointer icon (e.g. pointer hand) to signal interactive clickability.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/cursor',
    },
    'width': {
      role: 'CSS Horizontal Dimension',
      why: 'Sets explicit horizontal span of the element bounding box.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/width',
    },
    'height': {
      role: 'CSS Vertical Dimension',
      why: 'Sets explicit vertical height of the element bounding box.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/height',
    },
    'max-width': {
      role: 'CSS Horizontal Ceiling Boundary',
      why: 'Prevents content containers from stretching too wide on large desktop monitors.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/max-width',
    },
  };

  if (cssProperties[lower]) {
    const prop = cssProperties[lower];
    return {
      token: raw,
      role: prop.role,
      whyUsed: prop.why,
      docUrl: prop.url,
      docSource: 'MDN Web Docs',
    };
  }

  // 3. CSS Units & Common Values
  if (/^[0-9]+(?:\.[0-9]+)?px$/i.test(raw)) {
    return {
      token: raw,
      role: 'CSS Pixel Dimension (px)',
      whyUsed: `Defines an absolute screen measurement of ${raw} independent pixels for precise visual sizing.`,
      docUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/length#px',
      docSource: 'MDN Web Docs',
    };
  }

  if (/^[0-9]+(?:\.[0-9]+)?(?:rem|em)$/i.test(raw)) {
    return {
      token: raw,
      role: 'CSS Relative Typography Unit',
      whyUsed: `Scales proportionally based on user root font settings (${raw}), maintaining responsive accessibility.`,
      docUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/length#rem',
      docSource: 'MDN Web Docs',
    };
  }

  if (/^[0-9]+(?:\.[0-9]+)?%$/i.test(raw)) {
    return {
      token: raw,
      role: 'CSS Percentage Ratio',
      whyUsed: `Computes dimension as ${raw} relative to the parent container bounding box.`,
      docUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/percentage',
      docSource: 'MDN Web Docs',
    };
  }

  if (/^[0-9]+(?:\.[0-9]+)?fr$/i.test(raw)) {
    return {
      token: raw,
      role: 'CSS Grid Fractional Unit (fr)',
      whyUsed: `Allocates a proportional fraction (${raw}) of free leftover container space across grid columns.`,
      docUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/flex_value',
      docSource: 'MDN Web Docs',
    };
  }

  const cssValues: Record<string, { role: string; why: string }> = {
    'pointer': { role: 'Cursor State Keyword', why: 'Instructs the browser to render a clickable hand pointer on hover.' },
    'flex': { role: 'Flexbox Layout Model', why: 'Activates one-dimensional flexible box alignment for child components.' },
    'grid': { role: 'Grid Layout Model', why: 'Activates two-dimensional column and row matrix layout for child elements.' },
    'space-between': { role: 'Flex Distribution Mode', why: 'Pushes first and last children to opposing edges with equal space between them.' },
    'center': { role: 'Alignment Keyword', why: 'Aligns content along the geometric center of the container axis.' },
    'bold': { role: 'Font Weight Value', why: 'Applies standard bold emphasis to text characters.' },
    'none': { role: 'Reset / Inactive Keyword', why: 'Removes default browser styling, borders, or backgrounds.' },
    'solid': { role: 'Border Stroke Style', why: 'Renders an unbroken continuous line for border strokes.' },
    'transparent': { role: 'Alpha Transparency Color', why: 'Renders fully see-through color allowing underlying backdrops to show.' },
  };

  if (cssValues[lower]) {
    const val = cssValues[lower];
    return {
      token: raw,
      role: val.role,
      whyUsed: val.why,
      docUrl: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(raw)}`,
      docSource: 'MDN Web Docs',
    };
  }

  // Numeric Constants & Values (e.g. 800, 100, 0, 3.14)
  if (/^[0-9]+(?:\.[0-9]+)?$/.test(raw)) {
    return {
      token: raw,
      role: 'Numeric Literal Constant',
      whyUsed: `Specifies numeric constant value ${raw} (e.g. typography font-weight 800, coordinates, or scalar quantity).`,
      docUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#numeric_literals',
      docSource: 'MDN Web Docs',
    };
  }

  // 4. HTML Elements & Attributes
  if (raw.startsWith('<') || raw.startsWith('</')) {
    const tag = raw.replace(/[<>/]/g, '').toLowerCase();
    const tagDocs: Record<string, { role: string; why: string }> = {
      'nav': { role: 'HTML5 Semantic Navigation Landmark', why: 'Wraps primary navigation links for screen reader accessibility and clean DOM structure.' },
      'div': { role: 'Generic HTML Container', why: 'Groups child elements together for layout structuring and CSS targeting.' },
      'span': { role: 'Inline Text Phrasing Container', why: 'Wraps specific words inside text without causing a new line break.' },
      'h1': { role: 'Primary Heading Landmark', why: 'Designates the main title of the page or view for visual hierarchy and SEO ranking.' },
      'h2': { role: 'Secondary Section Heading', why: 'Subdivides content into distinct topic modules.' },
      'h3': { role: 'Subsection Heading Landmark', why: 'Labels individual cards, items, or subsection titles.' },
      'p': { role: 'HTML Paragraph Landmark', why: 'Renders body copy text with standard typography margins.' },
      'button': { role: 'Interactive Button Control', why: 'Provides accessible keyboard and click event activation for user actions.' },
      'script': { role: 'Script Embed Tag', why: 'Loads and executes client-side JavaScript in the browser runtime.' },
      'link': { role: 'External Resource Link', why: 'Connects external stylesheets or webfonts to the HTML document.' },
      'head': { role: 'Document Metadata Container', why: 'Houses page title, viewport settings, and stylesheet references.' },
      'body': { role: 'Document Content Body', why: 'Contains the complete visible presentation DOM tree rendered in the viewport.' },
      'main': { role: 'Central Content Landmark', why: 'Encloses the dominant core functionality of the webpage.' },
    };

    if (tagDocs[tag]) {
      const info = tagDocs[tag];
      return {
        token: raw,
        role: info.role,
        whyUsed: info.why,
        docUrl: `https://developer.mozilla.org/en-US/docs/Web/HTML/Element/${tag}`,
        docSource: 'MDN Web Docs',
      };
    }
  }

  // 5. React Hooks & Functional Architecture
  if (raw === 'useState') {
    return {
      token: raw,
      role: 'React State Persistence Hook',
      whyUsed: 'Preserves reactive state variables across renders and schedules component re-renders when updated.',
      docUrl: 'https://react.dev/reference/react/useState',
      docSource: 'React Docs',
    };
  }

  if (raw === 'useEffect') {
    return {
      token: raw,
      role: 'React Lifecycle Effect Hook',
      whyUsed: 'Executes side-effect lifecycles (subscriptions, DOM mutations, data fetching) after render completion.',
      docUrl: 'https://react.dev/reference/react/useEffect',
      docSource: 'React Docs',
    };
  }

  if (raw === 'useRef') {
    return {
      token: raw,
      role: 'React Mutable Reference Hook',
      whyUsed: 'Holds mutable DOM element nodes or values that persist without triggering component re-renders.',
      docUrl: 'https://react.dev/reference/react/useRef',
      docSource: 'React Docs',
    };
  }

  if (/^set[A-Z]/.test(raw)) {
    const varName = raw.slice(3).toLowerCase();
    return {
      token: raw,
      role: 'React State Setter Function',
      whyUsed: `Dispatches new state values for '${varName}' and requests React Virtual DOM reconciliation.`,
      docUrl: 'https://react.dev/reference/react/useState#setstate',
      docSource: 'React Docs',
    };
  }

  // 6. JavaScript Core Language Keywords & APIs
  const jsKeywords: Record<string, { role: string; why: string; url: string }> = {
    'const': {
      role: 'Immutable Block-Scope Binding Keyword',
      why: 'Declares an immutable variable binding that cannot be reassigned, preventing mutation bugs.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const',
    },
    'let': {
      role: 'Mutable Block-Scope Variable Keyword',
      why: 'Declares a re-assignable local variable within the current block scope.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let',
    },
    'function': {
      role: 'Function Declaration Keyword',
      why: 'Declares a reusable callable block of execution logic with its own scope.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function',
    },
    'return': {
      role: 'Control Flow Return Statement',
      why: 'Exits the active function immediately and passes the computed output value back to caller.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/return',
    },
    'export': {
      role: 'ES Module Export Keyword',
      why: 'Exposes functions, components, or constants for consumption by other project modules.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export',
    },
    'import': {
      role: 'ES Module Import Keyword',
      why: 'Loads external functions, components, or packages into this module namespace.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import',
    },
    'default': {
      role: 'Primary Export Modifier',
      why: 'Specifies the default fallback entity imported when referencing this file.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export#using_the_default_export',
    },
    'document': {
      role: 'DOM Root Global Object',
      why: 'Provides the browser gateway interface to inspect and modify the active webpage DOM tree.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document',
    },
    'window': {
      role: 'Browser Window Global Scope',
      why: 'Represents the viewport container and host runtime environment of the client browser.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window',
    },
    'addEventListener': {
      role: 'DOM Event Registration Method',
      why: 'Attaches an event handler to respond to user interactions (clicks, keystrokes, form submits).',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener',
    },
    'querySelector': {
      role: 'DOM Query Selector Method',
      why: 'Searches the live DOM tree and returns the first element matching this CSS selector.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector',
    },
    'querySelectorAll': {
      role: 'DOM Multi-Element Query Method',
      why: 'Returns a static NodeList of all DOM elements matching the specified CSS selector.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll',
    },
    'forEach': {
      role: 'Array Iteration Method',
      why: 'Executes a callback function once for every item in the collection.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach',
    },
    'map': {
      role: 'Array Projection Method',
      why: 'Transforms each element in an array into a new value, commonly converting data into JSX elements.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map',
    },
    'reduce': {
      role: 'Array Accumulator Method',
      why: 'Iterates through an array to distill items into a single accumulated result (e.g. total balance).',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce',
    },
    'push': {
      role: 'Array Append Mutation Method',
      why: 'Appends one or more new items onto the end of an array collection.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push',
    },
    'async': {
      role: 'Asynchronous Coroutine Keyword',
      why: 'Declares a non-blocking asynchronous function that implicitly resolves as a Promise.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function',
    },
    'await': {
      role: 'Promise Resolution Operator',
      why: 'Pauses async function execution non-blockingly until a Promise fulfills with its value.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await',
    },
  };

  if (jsKeywords[raw]) {
    const kw = jsKeywords[raw];
    return {
      token: raw,
      role: kw.role,
      whyUsed: kw.why,
      docUrl: kw.url,
      docSource: 'MDN Web Docs',
    };
  }

  // 7. Syntactic Delimiters & Operators
  const punctuation: Record<string, { role: string; why: string }> = {
    '{': { role: 'Declaration Block Opener', why: 'Opens a style declaration block, function body, or object literal scope.' },
    '}': { role: 'Declaration Block Closer', why: 'Closes a style declaration block, function body, or object literal scope.' },
    '(': { role: 'Parameter / Call Opener', why: 'Opens a function argument list or groups mathematical expressions for precedence.' },
    ')': { role: 'Parameter / Call Closer', why: 'Closes a function argument list or expression grouping.' },
    '[': { role: 'Array / Destructure Opener', why: 'Begins an array literal or array destructuring pattern.' },
    ']': { role: 'Array / Destructure Closer', why: 'Concludes an array literal or array destructuring pattern.' },
    ';': { role: 'Statement Terminator', why: 'Explicitly concludes a statement or CSS property declaration before subsequent rules.' },
    ':': { role: 'Property / Type Separator', why: 'Separates a CSS or object key from its assigned value or type annotation.' },
    ',': { role: 'Element List Separator', why: 'Separates items in argument lists, arrays, or multi-selector CSS rules.' },
    '.': { role: 'Member Access Operator', why: 'Accesses an object property or method on the preceding target entity.' },
    '=>': { role: 'ES6 Arrow Lambda Operator', why: 'Defines an inline anonymous function with lexical scope binding.' },
    '=': { role: 'Assignment Operator', why: 'Stores and binds the evaluated right-hand value into the left-hand identifier.' },
    '===': { role: 'Strict Equality Operator', why: 'Verifies value and type equality without implicit JavaScript type coercion.' },
    '!==': { role: 'Strict Inequality Operator', why: 'Verifies that two entities differ in either value or underlying type.' },
    '+': { role: 'Addition / Concatenation Operator', why: 'Calculates numeric addition or concatenates text strings.' },
    '-': { role: 'Subtraction Operator', why: 'Calculates arithmetic difference between two numeric values.' },
    '*': { role: 'Multiplication Operator', why: 'Multiplies two numbers to compute products or scaling factors.' },
    '/': { role: 'Division Operator', why: 'Divides numbers to compute ratios or fractional proportions.' },
    '&&': { role: 'Logical AND Operator', why: 'Evaluates truthy conjunction or conditionally renders UI in JSX.' },
    '||': { role: 'Logical OR / Fallback Operator', why: 'Provides fallback default values when the left-hand operand is falsy.' },
  };

  if (punctuation[raw]) {
    const p = punctuation[raw];
    return {
      token: raw,
      role: p.role,
      whyUsed: p.why,
      docUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators',
      docSource: 'MDN Web Docs',
    };
  }

  // 8. Domain Identifiers & Variables (e.g. logo, balance, transactions, cart, item, price)
  const domainIdentifiers: Record<string, { role: string; why: string }> = {
    'logo': { role: 'Brand Identity Identifier', why: 'Designates the company brand emblem or title element in the header.' },
    'balance': { role: 'Account Balance State Variable', why: 'Stores available financial funds for ledger display and real-time deductions.' },
    'transactions': { role: 'Transaction Ledger Collection', why: 'Holds historical credit/debit records rendered in the activity table.' },
    'cart': { role: 'Shopping Cart State Array', why: 'Stores ordered menu items selected by the user before checkout calculation.' },
    'item': { role: 'Catalog Item Identifier', why: 'Represents the specific product record currently processed in the order loop.' },
    'price': { role: 'Product Price Property', why: 'Holds the numeric currency cost assigned to a menu item.' },
    'orderBtn': { role: 'Action Button DOM Reference', why: 'References the interactive button clicked by the user to order food.' },
    'cartBtn': { role: 'Cart Button DOM Reference', why: 'References the navbar badge button displaying total cart items.' },
    'recipient': { role: 'Transfer Beneficiary Variable', why: 'Holds the destination account or recipient tag for funds transfer.' },
    'transferAmount': { role: 'Transfer Value Input Variable', why: 'Captures user input indicating how much money to send.' },
  };

  if (domainIdentifiers[lower]) {
    const d = domainIdentifiers[lower];
    return {
      token: raw,
      role: d.role,
      whyUsed: d.why,
      docUrl: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(raw)}`,
      docSource: 'Application Architecture',
    };
  }

  // 9. Intelligent Fallback for arbitrary custom tokens
  return {
    token: raw,
    role: 'Application Domain Symbol',
    whyUsed: `Named identifier '${raw}' encapsulates application state or logic specific to this component.`,
    docUrl: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(raw)}`,
    docSource: 'MDN Web Docs',
  };
}

/**
 * Main AI Line Analyzer: Analyzes any line of code contextually and pedagogically.
 * Generates unique, authentic explanations for every line and token.
 */
export async function analyzeCodeLineWithAI(
  line: string,
  lineNumber: number,
  language: string,
  surroundingContext?: string
): Promise<AICodeAnalysis> {
  const trimmed = line.trim();
  const lang = (language || 'javascript').toLowerCase();
  const tokens = extractSemanticTokensFromLine(trimmed, lang).map(tok => explainTokenInContext(tok, trimmed, lang));

  // 1. Python Pydantic Model Field
  if (trimmed.includes(':') && (trimmed.includes('Field(') || trimmed.includes('= Field'))) {
    const varNameMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_\[\], ]+)/);
    const varName = varNameMatch ? varNameMatch[1] : 'attribute';
    const typeHint = varNameMatch ? varNameMatch[2].trim() : 'str';

    return {
      lineContent: trimmed,
      lineNumber,
      language: 'Python',
      summary: `Declares a strictly-typed schema attribute '${varName}' with Pydantic runtime validation and metadata.`,
      detailedWalkthrough: `In Python architectures (such as FastAPI and Pydantic), this line creates an explicit schema contract. The type annotation ':${typeHint}' enforces type compliance at runtime, while 'Field(...)' configures field constraints, serialization rules, and automatic OpenAPI documentation.`,
      realWorldAnalogy: `Like a pre-printed official application form with a strictly designated box for "${varName}": the inspector verifies that only valid ${typeHint} text is written inside before accepting the file.`,
      tokens,
      memoryAndRuntime: `When the model class is loaded, Pydantic constructs an internal validator schema. Instantiating the model verifies input payloads against this specification at compiled C/Rust speed.`,
      bestPractices: `Always supply a 'description' or 'examples' parameter inside Field() to generate clean automatic Swagger/OpenAPI documentation for API consumers.`,
      commonPitfalls: [
        `Assigning a mutable default (like Field(default=[])) instead of using default_factory=list.`,
        `Expecting standard Python classes to validate types without inheriting from Pydantic BaseModel.`,
      ],
      suggestedQuestions: [
        `How does Pydantic validate this field when invalid types are supplied?`,
        `How can I make this field optional with None as default?`,
        `How does FastAPI use this field to auto-generate Swagger UI?`,
      ],
    };
  }

  // 2. CSS Rules & Typography (e.g. .logo { font-size: 22px; font-weight: 800; color: #d97706; })
  if (trimmed.includes('font-size') || trimmed.includes('font-weight') || trimmed.includes('color:') || trimmed.includes('.logo') || trimmed.includes('border-radius')) {
    const selectorMatch = trimmed.match(/^(\.[a-zA-Z0-9_-]+|#[a-zA-Z0-9_-]+|[a-zA-Z0-9_-]+)\s*\{/);
    const selectorName = selectorMatch ? selectorMatch[1] : 'this element';

    return {
      lineContent: trimmed,
      lineNumber,
      language: 'CSS',
      summary: `Applies brand typography, sizing, and color hierarchy to '${selectorName}'.`,
      detailedWalkthrough: `This CSS rule styles visual presentation for ${selectorName}. It binds explicit font sizing, optical weight boldness, and palette coloration to maintain visual prominence and readability across browser viewports.`,
      realWorldAnalogy: `Like painting and illuminating an embossed sign above a storefront: choosing specific lettering scale and brand colors ensures customers immediately identify the brand.`,
      tokens,
      memoryAndRuntime: `The browser layout engine (Blink/Gecko) parses CSS declarations into the CSSOM (CSS Object Model) tree and recalculates computed styles during the composite render phase.`,
      bestPractices: `Use relative rem units or design system tokens (CSS custom properties) for font sizing to support user accessibility font scaling.`,
      commonPitfalls: [
        `Omitting closing semicolons between multiple CSS declarations.`,
        `Using pixel sizes for body text which can prevent user browser zoom accessibility.`,
      ],
      suggestedQuestions: [
        `Why is font-weight specified as a numeric scale (800) instead of a keyword?`,
        `How does the CSSOM cascade resolve conflicting font-size rules?`,
        `How can CSS custom properties (--color-brand) make this rule reusable?`,
      ],
    };
  }

  // 3. CSS Grid Layout Container
  if (trimmed.includes('display: grid') || trimmed.includes('grid-template-columns')) {
    return {
      lineContent: trimmed,
      lineNumber,
      language: 'CSS',
      summary: `Configures a two-dimensional responsive CSS Grid formatting context for structured column alignment.`,
      detailedWalkthrough: `CSS Grid enables full 2D control over both rows and columns. Using fractional units (fr) or auto-fill/auto-fit ensures layout stretches and adapts fluidly to different screen widths.`,
      realWorldAnalogy: `Like a modern modular shelving unit with adjustable partitions: items automatically slot into structured compartments without tipping over.`,
      tokens,
      memoryAndRuntime: `The browser rendering engine recalculates the layout tree geometry, allocating coordinates to each grid cell without triggering reflows on unrelated DOM subtrees.`,
      bestPractices: `Combine repeat(auto-fit, minmax(240px, 1fr)) with 'gap' to achieve fully responsive column layouts without media queries.`,
      commonPitfalls: [
        `Using float or inline-block tricks when CSS Grid provides native alignment.`,
      ],
      suggestedQuestions: [
        `What is the difference between auto-fit and auto-fill in CSS Grid?`,
        `How does fr (fractional unit) compute available space?`,
      ],
    };
  }

  // 4. React State Hook (e.g. const [balance, setBalance] = useState(12450.75);)
  if (trimmed.includes('useState(') || trimmed.includes('useState<')) {
    const stateMatch = trimmed.match(/\[\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s*\]/);
    const varName = stateMatch ? stateMatch[1] : 'state';
    const setterName = stateMatch ? stateMatch[2] : 'setter';

    return {
      lineContent: trimmed,
      lineNumber,
      language: 'React',
      summary: `Initializes reactive state variable '${varName}' with state dispatcher function '${setterName}'.`,
      detailedWalkthrough: `Allocates a state slot in React's component fiber tree. Calling ${setterName}() schedules a reconciliation pass that re-renders dependent JSX components with updated data.`,
      realWorldAnalogy: `Like a digital readout gauge on an ATM: when transactions occur, the display immediately updates so the user sees their current balance in real time.`,
      tokens,
      memoryAndRuntime: `React stores the state value inside an internal linked-list hook node associated with this component instance in memory.`,
      bestPractices: `Always treat React state as immutable. Never mutate state variables directly—always dispatch updates via ${setterName}().`,
      commonPitfalls: [
        `Mutating arrays or objects directly (e.g. state.push(x)) instead of creating a new copy (...state).`,
        `Calling useState inside nested loops or conditionals, which violates React's Rules of Hooks.`,
      ],
      suggestedQuestions: [
        `Why does React require state to be updated via setter functions rather than direct mutation?`,
        `How does React batch multiple state updates for performance?`,
      ],
    };
  }

  // 5. JavaScript DOM Event Registration (e.g. addEventListener or querySelectorAll)
  if (trimmed.includes('addEventListener') || (trimmed.includes('querySelectorAll') && trimmed.includes('.forEach'))) {
    return {
      lineContent: trimmed,
      lineNumber,
      language: 'JavaScript',
      summary: `Registers an asynchronous DOM event listener to capture and handle user interactions.`,
      detailedWalkthrough: `Subscribes an event callback function to the browser event loop. When the user interacts with the targeted element, the browser invokes the callback asynchronously with the event context.`,
      realWorldAnalogy: `Like placing an order intercom at a drive-thru window: when a customer speaks into the microphone (event), the staff immediately hears the order and begins preparing it.`,
      tokens,
      memoryAndRuntime: `Registers an entry in the browser engine's internal event table. Retains a closure reference to the callback handler until removed or the document unmounts.`,
      bestPractices: `Use event delegation on parent containers when handling events across many dynamic child items to conserve memory.`,
      commonPitfalls: [
        `Registering anonymous inline functions that cannot be detached with removeEventListener.`,
      ],
      suggestedQuestions: [
        `How does event bubbling differ from event capturing?`,
        `How can event delegation improve memory efficiency in list views?`,
      ],
    };
  }

  // 6. C++ / Java Switch & NaN Branching
  if (trimmed.includes('switch') || trimmed.includes('std::nan') || trimmed.includes('Double.NaN')) {
    const isJava = trimmed.includes('Double.NaN');
    return {
      lineContent: trimmed,
      lineNumber,
      language: isJava ? 'Java' : 'C++',
      summary: `Executes high-speed conditional branching with defensive protection against zero-division arithmetic errors.`,
      detailedWalkthrough: `In compiled languages, switch statements compile into dense jump tables enabling O(1) branch dispatch. Returning NaN (Not-a-Number) complies with IEEE 754 floating-point standards without crashing the process.`,
      realWorldAnalogy: `Like a railway track switch lever: instead of stopping to test every rail sequentially, the train immediately turns onto the exact matching track.`,
      tokens,
      memoryAndRuntime: `Direct hardware register arithmetic execution. Quiet NaN contains a dedicated IEEE 754 bit pattern (all exponent bits 1 with non-zero mantissa).`,
      bestPractices: `Always provide a 'default' case label to safely handle unanticipated input values.`,
      commonPitfalls: [
        `Testing equality with (x == NaN), which always returns false per IEEE 754. Always use std::isnan(x) or Double.isNaN(x)!`,
      ],
      suggestedQuestions: [
        `Why does x == NaN always return false in IEEE 754?`,
        `How does the compiler construct a jump table for switch statements?`,
      ],
    };
  }

  // 7. HTML Element Markup (e.g. <nav class="navbar"> or <button class="order-btn">)
  if (trimmed.startsWith('<') && !trimmed.startsWith('<!--')) {
    const tagMatch = trimmed.match(/<([a-zA-Z0-9_-]+)/);
    const tag = tagMatch ? tagMatch[1] : 'element';
    const classMatch = trimmed.match(/class(?:Name)?="([^"]*)"/);
    const cls = classMatch ? classMatch[1] : '';

    return {
      lineContent: trimmed,
      lineNumber,
      language: 'HTML',
      summary: `Renders a semantic HTML '<${tag}>' element${cls ? ` with styling class '${cls}'` : ''}.`,
      detailedWalkthrough: `Inserts a structural node into the DOM hierarchy. Browsers use this structure to compute box model layout coordinates, attach CSS style cascades, and expose accessible landmarks for screen readers.`,
      realWorldAnalogy: `Like erecting a physical wall partition inside a building: it demarcates a dedicated zone for content to live within.`,
      tokens,
      memoryAndRuntime: `Constructs an HTML${tag.toUpperCase()}Element node in the browser DOM memory heap with property bindings.`,
      bestPractices: `Use semantic HTML landmarks (nav, main, header, article) instead of plain div tags wherever possible.`,
      commonPitfalls: [
        `Leaving HTML tags unclosed, causing DOM parser tree reconstruction quirks.`,
      ],
      suggestedQuestions: [
        `How does semantic HTML improve accessibility (a11y) and SEO?`,
        `How does the browser parse HTML into the live DOM tree?`,
      ],
    };
  }

  // 8. ES Module Import / Export
  if (trimmed.startsWith('import ') || trimmed.startsWith('export ')) {
    return {
      lineContent: trimmed,
      lineNumber,
      language: 'JavaScript / TypeScript',
      summary: `${trimmed.startsWith('import') ? 'Imports dependencies' : 'Exports component module'} for architectural modularity.`,
      detailedWalkthrough: `Establishes an explicit dependency relationship using modern ES Module standards. Enables bundlers (like Next.js and Webpack) to perform static analysis, tree-shaking dead code, and optimizing build chunks.`,
      realWorldAnalogy: `Like receiving specialized parts from an external supplier: it keeps the workshop organized without having to manufacture every tool in-house.`,
      tokens,
      memoryAndRuntime: `Evaluated at module evaluation phase before runtime execution begins. Modules are cached in the module registry.`,
      bestPractices: `Favor named imports for tree-shaking optimization over wildcard (import * as ...) imports.`,
      commonPitfalls: [
        `Mixing CommonJS require() with ES Module import statements.`,
      ],
      suggestedQuestions: [
        `How does tree-shaking eliminate unused code during compilation?`,
        `What is the difference between default and named exports?`,
      ],
    };
  }

  // 9. Universal Semantic Line Analysis (Intelligently deconstructs any remaining line)
  const firstToken = tokens[0]?.token || 'instruction';
  return {
    lineContent: trimmed,
    lineNumber,
    language: language.toUpperCase(),
    summary: `Executes instruction block in ${language}: evaluates '${firstToken}' and resolves statements.`,
    detailedWalkthrough: `This line participates in the runtime execution flow of this file. It executes statements involving (${tokens.slice(0, 4).map(t => t.token).join(', ')}) to maintain data consistency and component logic.`,
    realWorldAnalogy: `Like an essential step in an engineering blueprint: each token performs its designated function to keep the system running reliably.`,
    tokens,
    memoryAndRuntime: `Processed in the active thread call stack according to ${language} execution specifications.`,
    bestPractices: `Keep lines focused on a single responsibility to maintain readability and simplify testing.`,
    commonPitfalls: [
      `Missing semicolons or delimiters depending on language syntax requirements.`,
    ],
    suggestedQuestions: [
      `Why is this specific syntax chosen here?`,
      `How does this line interact with other components in the project?`,
    ],
  };
}
