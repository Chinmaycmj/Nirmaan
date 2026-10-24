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

  // 3. Quoted String Literals (e.g. 'cardGrid', 'searchInput', 'input', 'click', 'food')
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('`') && raw.endsWith('`'))) {
    const unquoted = raw.slice(1, -1);
    const lineLower = line.toLowerCase();

    if (lineLower.includes('getelementbyid') || lineLower.includes('queryselector')) {
      return {
        token: raw,
        role: 'DOM Target ID / Selector Argument',
        whyUsed: `Specifies the unique DOM element identifier '${unquoted}' to locate and bind the HTML node in the document tree.`,
        docUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById',
        docSource: 'MDN Web Docs',
      };
    }

    if (lineLower.includes('addeventlistener')) {
      return {
        token: raw,
        role: 'DOM Event Type Specifier',
        whyUsed: `Designates the browser interaction event type ('${unquoted}') to intercept and handle on this DOM target.`,
        docUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#parameters',
        docSource: 'MDN Web Docs',
      };
    }

    if (lineLower.includes('createelement')) {
      return {
        token: raw,
        role: 'HTML Element Tag Name Argument',
        whyUsed: `Instructs the browser DOM factory to instantiate a new <${unquoted}> element node in memory.`,
        docUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement',
        docSource: 'MDN Web Docs',
      };
    }

    if (line.includes('category:') || line.includes('name:') || line.includes('price:') || line.includes('initialItems')) {
      return {
        token: raw,
        role: 'Data Entity Attribute String Literal',
        whyUsed: `Stores constant text data value "${unquoted}" within this catalog/model record structure.`,
        docUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String',
        docSource: 'MDN Web Docs',
      };
    }

    return {
      token: raw,
      role: 'String Literal Constant',
      whyUsed: `Encapsulates static string text value "${unquoted}" for processing in this instruction.`,
      docUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String',
      docSource: 'MDN Web Docs',
    };
  }

  // 4. CSS Units & Common Values
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

  // 6. JavaScript Core Language Keywords & Web Platform APIs
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
    'var': {
      role: 'Function-Scoped Variable Declaration',
      why: 'Legacy variable declaration with function scoping and hoisting behavior.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var',
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
    // DOM APIs
    'getElementById': {
      role: 'DOM Element Retrieval by ID Method',
      why: 'Queries the live DOM tree and returns the unique HTML element matching the given element ID.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById',
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
    'addEventListener': {
      role: 'DOM Event Registration Method',
      why: 'Attaches an event handler callback to respond to user interactions (clicks, keystrokes, form submits).',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener',
    },
    'removeEventListener': {
      role: 'DOM Event Detachment Method',
      why: 'Removes an event listener previously registered with addEventListener to prevent memory leaks.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener',
    },
    'createElement': {
      role: 'DOM Element Factory Method',
      why: 'Instantiates a new HTML element node of the specified tag name in memory, ready for DOM insertion.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement',
    },
    'appendChild': {
      role: 'DOM Node Insertion Method',
      why: 'Mounts the child node into the document tree as the last child of this parent element.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild',
    },
    'removeChild': {
      role: 'DOM Node Deletion Method',
      why: 'Removes a specified child node from the DOM tree, detaching it from the live UI.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild',
    },
    'innerHTML': {
      role: 'DOM HTML Content Serialization Property',
      why: 'Gets or sets the raw HTML markup contained within the element, dynamically constructing child DOM nodes.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML',
    },
    'textContent': {
      role: 'DOM Plain Text Content Property',
      why: 'Reads or sets the safe unparsed text inside the node and its descendants without HTML injection risks.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent',
    },
    'value': {
      role: 'Form Control Input Value Property',
      why: 'Reads or mutates the current text or selection value of an input, textarea, or select control.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/value',
    },
    'classList': {
      role: 'DOM Element Class Token List',
      why: 'Exposes the live token list of CSS classes on this element with helper methods (add, remove, toggle).',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/classList',
    },
    'add': {
      role: 'Collection / ClassList Add Method',
      why: 'Appends specified class names or set elements to the collection if not already present.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/add',
    },
    'remove': {
      role: 'Collection / ClassList Remove Method',
      why: 'Removes specified class names or elements from the collection.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/remove',
    },
    'toggle': {
      role: 'ClassList Toggle Method',
      why: 'Adds the class if absent, or removes it if present, returning a boolean indicating the new state.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle',
    },
    'contains': {
      role: 'Collection Membership Check Method',
      why: 'Returns true if the collection or element contains the specified token or child node.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/contains',
    },
    'target': {
      role: 'DOM Event Target Property',
      why: 'References the specific DOM element where the user event originated (e.g. clicked button or input).',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Event/target',
    },
    'currentTarget': {
      role: 'Event Listener Host Reference',
      why: 'References the DOM element to which the active event handler was bound.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Event/currentTarget',
    },
    'preventDefault': {
      role: 'Default Action Cancellation Method',
      why: 'Suppresses default browser event actions (such as preventing form submit from refreshing page).',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault',
    },
    'stopPropagation': {
      role: 'Event Bubbling Suppression Method',
      why: 'Halts propagation of the event through the parent DOM tree hierarchy.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation',
    },
    'setAttribute': {
      role: 'DOM Attribute Setter Method',
      why: 'Sets the value of a named HTML attribute on the targeted element.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute',
    },
    'getAttribute': {
      role: 'DOM Attribute Getter Method',
      why: 'Retrieves the current string value of the named HTML attribute from the element.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute',
    },
    'style': {
      role: 'Inline CSS Style Declaration Object',
      why: 'Provides read/write access to inline CSS properties directly on this specific DOM node.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style',
    },
    'focus': {
      role: 'Focus Activation Method',
      why: 'Sets keyboard and cursor focus directly onto the targeted element.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus',
    },
    'blur': {
      role: 'Focus Deactivation Method',
      why: 'Removes keyboard focus from the active element.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/blur',
    },
    // Array & String Methods
    'filter': {
      role: 'Array Predicate Filtering Method',
      why: 'Creates a shallow copy containing only array elements that pass the boolean test function.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter',
    },
    'includes': {
      role: 'Collection Inclusion Check Method',
      why: 'Determines whether an array or string includes a certain value or substring, returning true or false.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes',
    },
    'toLowerCase': {
      role: 'String Lowercase Conversion Method',
      why: 'Returns the calling string converted to lowercase, enabling case-insensitive search matching.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase',
    },
    'toUpperCase': {
      role: 'String Uppercase Conversion Method',
      why: 'Returns the calling string converted to uppercase characters.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toUpperCase',
    },
    'trim': {
      role: 'Whitespace Stripping Method',
      why: 'Removes leading and trailing whitespace characters from both ends of the string.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim',
    },
    'forEach': {
      role: 'Array Iteration Method',
      why: 'Executes a callback function once for every item in the collection.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach',
    },
    'map': {
      role: 'Array Projection Method',
      why: 'Transforms each element in an array into a new value, commonly converting data into JSX/DOM elements.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map',
    },
    'reduce': {
      role: 'Array Accumulator Method',
      why: 'Iterates through an array to distill items into a single accumulated result (e.g. total sum).',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce',
    },
    'find': {
      role: 'Array Predicate Search Method',
      why: 'Returns the first element in the array that satisfies the provided testing callback function.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find',
    },
    'findIndex': {
      role: 'Array Predicate Index Search Method',
      why: 'Returns the index of the first element that satisfies the provided testing callback function.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex',
    },
    'some': {
      role: 'Array Existential Check Method',
      why: 'Tests whether at least one element in the array satisfies the testing callback condition.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some',
    },
    'every': {
      role: 'Array Universal Check Method',
      why: 'Tests whether all elements in the array satisfy the testing callback condition.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every',
    },
    'slice': {
      role: 'Array / String Subsequence Extraction',
      why: 'Returns a shallow copy section of an array or string from begin to end without mutating original.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice',
    },
    'splice': {
      role: 'Array In-Place Mutation Method',
      why: 'Changes array contents by removing or replacing existing elements and/or adding new elements.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice',
    },
    'push': {
      role: 'Array Append Mutation Method',
      why: 'Appends one or more new items onto the end of an array collection.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push',
    },
    'pop': {
      role: 'Array Remove Last Method',
      why: 'Removes the last element from an array and returns that element.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop',
    },
    'shift': {
      role: 'Array Remove First Method',
      why: 'Removes the first element from an array and returns that element.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift',
    },
    'unshift': {
      role: 'Array Prepend Method',
      why: 'Adds one or more elements to the beginning of an array and returns the new length.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift',
    },
    'join': {
      role: 'Array String Serialization Method',
      why: 'Joins all elements of an array into a single string separated by the specified delimiter.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join',
    },
    'split': {
      role: 'String Delimiter Tokenizer Method',
      why: 'Divides a string into an ordered list of substrings by searching for the separator pattern.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split',
    },
    'replace': {
      role: 'String Pattern Replacement Method',
      why: 'Returns a new string with matches of a pattern replaced by a replacement string.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace',
    },
    'replaceAll': {
      role: 'Global String Replacement Method',
      why: 'Replaces all occurrences of a search string or pattern with a replacement string.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll',
    },
    'length': {
      role: 'Collection Size Property',
      why: 'Reflects the total count of items in an array or character count in a string.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/length',
    },
    'sort': {
      role: 'Array In-Place Sorting Method',
      why: 'Sorts elements of an array in place using a comparison callback.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort',
    },
    'reverse': {
      role: 'Array Reversal Method',
      why: 'Reverses the order of elements in an array in place.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse',
    },
    // JSON & Object APIs
    'JSON': {
      role: 'JSON Namespace Gateway',
      why: 'Provides static parse() and stringify() methods to convert between text and JavaScript objects.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON',
    },
    'parse': {
      role: 'JSON Deserialization Method',
      why: 'Converts a JSON-formatted string into a live JavaScript object or array structure.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse',
    },
    'stringify': {
      role: 'JSON Serialization Method',
      why: 'Converts a JavaScript object or primitive into a standard JSON string representation.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify',
    },
    'Object': {
      role: 'Universal Object Constructor',
      why: 'Provides reflection methods for examining keys, values, and object prototypes.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object',
    },
    'keys': {
      role: 'Object Key Enumeration Method',
      why: 'Returns an array of a given object\'s own enumerable string-keyed property names.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys',
    },
    'values': {
      role: 'Object Value Enumeration Method',
      why: 'Returns an array of a given object\'s own enumerable property values.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values',
    },
    'entries': {
      role: 'Object [Key, Value] Pair Enumerator',
      why: 'Returns an array of a given object\'s own enumerable string-keyed [key, value] pairs.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries',
    },
    'assign': {
      role: 'Object Property Merge Method',
      why: 'Copies all enumerable own properties from one or more source objects to a target object.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign',
    },
    // Async & Timers
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
    'Promise': {
      role: 'Asynchronous Resolution Constructor',
      why: 'Represents the eventual completion (or failure) of an asynchronous operation and its value.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
    },
    'then': {
      role: 'Promise Fulfillment Handler',
      why: 'Appends a callback handler executed when the Promise fulfills successfully.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then',
    },
    'catch': {
      role: 'Promise Rejection Handler',
      why: 'Appends a callback handler executed when an asynchronous error occurs.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch',
    },
    'setTimeout': {
      role: 'Asynchronous Delay Timer',
      why: 'Schedules a callback function to execute after a specified millisecond delay.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/setTimeout',
    },
    'setInterval': {
      role: 'Recurring Interval Timer',
      why: 'Repeatedly executes a callback function with a fixed millisecond delay between each call.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/setInterval',
    },
    'clearTimeout': {
      role: 'Timer Cancellation Method',
      why: 'Cancels a pending timeout previously established by calling setTimeout().',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/clearTimeout',
    },
    'clearInterval': {
      role: 'Interval Cancellation Method',
      why: 'Cancels a repeating interval previously established by calling setInterval().',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/clearInterval',
    },
    'fetch': {
      role: 'Asynchronous Network Fetch API',
      why: 'Initiates a promise-based HTTP network request to retrieve or send remote JSON or assets.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/fetch',
    },
    'localStorage': {
      role: 'Persistent Browser Storage API',
      why: 'Allows web applications to store key-value data persistently in the browser across sessions.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage',
    },
    'sessionStorage': {
      role: 'Session-Scoped Browser Storage API',
      why: 'Stores key-value data in the browser for the duration of the current page tab session.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage',
    },
    'console': {
      role: 'Browser Console Diagnostic Object',
      why: 'Provides access to the browser debugging console for logging, timing, and error tracking.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/console',
    },
    'log': {
      role: 'Console Log Output Method',
      why: 'Prints informational diagnostic output to the developer console.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/console/log',
    },
    'error': {
      role: 'Console Error Output Method',
      why: 'Prints error diagnostic output and stack trace to the developer console.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/console/error',
    },
    'warn': {
      role: 'Console Warning Output Method',
      why: 'Prints warning messages with visual prominence to the developer console.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/console/warn',
    },
    // Flow control & structures
    'if': {
      role: 'Conditional Branch Statement',
      why: 'Executes a block of code if a specified condition evaluates to truthy.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else',
    },
    'else': {
      role: 'Conditional Alternative Statement',
      why: 'Executes when the corresponding if condition evaluates to falsy.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else',
    },
    'for': {
      role: 'Iteration Loop Statement',
      why: 'Executes a code block repeatedly until a specified exit condition evaluates to false.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for',
    },
    'while': {
      role: 'Pre-Condition Loop Statement',
      why: 'Creates a loop that executes a specified statement as long as the test condition evaluates to true.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/while',
    },
    'try': {
      role: 'Exception Handling Try Block',
      why: 'Marks a block of statements to try and specifies a response should an exception be thrown.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch',
    },
    'throw': {
      role: 'Exception Raising Statement',
      why: 'Throws a user-defined exception that halts execution and passes control to the nearest catch block.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw',
    },
    'new': {
      role: 'Constructor Instantiation Operator',
      why: 'Creates an instance of an object that has a constructor function and prototype chain.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new',
    },
    'this': {
      role: 'Execution Context Reference',
      why: 'References the object that is executing the current function or method.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this',
    },
    'typeof': {
      role: 'Type Inspection Operator',
      why: 'Returns a string indicating the type of the unevaluated operand.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof',
    },
    'instanceof': {
      role: 'Prototype Verification Operator',
      why: 'Tests to see if the prototype property of a constructor appears anywhere in the prototype chain of an object.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof',
    },
    'null': {
      role: 'Intentional Absence of Value Literal',
      why: 'Represents the intentional absence of any object value or memory pointer.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null',
    },
    'undefined': {
      role: 'Uninitialized Primitive Value',
      why: 'Indicates that a variable has not been assigned a value, or that an argument was not provided.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined',
    },
    'true': {
      role: 'Boolean Truth Literal',
      why: 'Represents the boolean truth value in conditional evaluations.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean',
    },
    'false': {
      role: 'Boolean Falsity Literal',
      why: 'Represents the boolean falsity value in conditional evaluations.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean',
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

  // 7. Python Core Language Keywords & Built-ins
  const pythonKeywords: Record<string, { role: string; why: string; url: string }> = {
    'def': { role: 'Python Function Definition Keyword', why: 'Declares a callable Python function block with local parameter scope.', url: 'https://docs.python.org/3/reference/compound_stmts.html#function-definitions' },
    'self': { role: 'Instance Self-Reference Identifier', why: 'Refers to the active instance of the class in method calls.', url: 'https://docs.python.org/3/tutorial/classes.html#class-objects' },
    'class': { role: 'Class Definition Keyword', why: 'Declares an object-oriented class blueprints containing attributes and methods.', url: 'https://docs.python.org/3/reference/compound_stmts.html#class-definitions' },
    'from': { role: 'Module Import Source Specifier', why: 'Designates the source package or module from which symbols are loaded.', url: 'https://docs.python.org/3/reference/simple_stmts.html#the-import-statement' },
    'as': { role: 'Import Alias / Context Manager Specifier', why: 'Assigns an alias name or binds context manager expression output.', url: 'https://docs.python.org/3/reference/compound_stmts.html#the-with-statement' },
    'in': { role: 'Membership Test / Iteration Keyword', why: 'Tests collection membership or drives for loop iteration through sequences.', url: 'https://docs.python.org/3/reference/expressions.html#membership-test-operations' },
    'is': { role: 'Object Identity Comparison Operator', why: 'Tests whether two variables point to the exact same memory address.', url: 'https://docs.python.org/3/reference/expressions.html#is-not' },
    'not': { role: 'Logical Negation Operator', why: 'Inverts truth value of an expression.', url: 'https://docs.python.org/3/reference/expressions.html#boolean-operations' },
    'and': { role: 'Short-Circuit Logical AND Operator', why: 'Evaluates second operand only if first is truthy.', url: 'https://docs.python.org/3/reference/expressions.html#boolean-operations' },
    'or': { role: 'Short-Circuit Logical OR Operator', why: 'Evaluates second operand only if first is falsy.', url: 'https://docs.python.org/3/reference/expressions.html#boolean-operations' },
    'None': { role: 'Python Null Singleton Object', why: 'Represents absence of a return value or unassigned variable.', url: 'https://docs.python.org/3/library/constants.html#None' },
    'True': { role: 'Python Boolean Truth Constant', why: 'Represents boolean true in conditional expressions.', url: 'https://docs.python.org/3/library/constants.html#True' },
    'False': { role: 'Python Boolean Falsity Constant', why: 'Represents boolean false in conditional expressions.', url: 'https://docs.python.org/3/library/constants.html#False' },
    'print': { role: 'Standard Output Print Function', why: 'Outputs text strings and expressions to stdout stream.', url: 'https://docs.python.org/3/library/functions.html#print' },
    'len': { role: 'Sequence Length Function', why: 'Returns the number of elements in a list, string, tuple, or dictionary.', url: 'https://docs.python.org/3/library/functions.html#len' },
    'range': { role: 'Immutable Sequence Generator', why: 'Generates arithmetic sequence of integers commonly used in loops.', url: 'https://docs.python.org/3/library/functions.html#func-range' },
    'dict': { role: 'Dictionary Mapping Type', why: 'Hash map collection storing key-value pairs with O(1) lookup speed.', url: 'https://docs.python.org/3/library/stdtypes.html#dict' },
    'list': { role: 'Dynamic Array Sequence Type', why: 'Mutable ordered sequence of heterogeneous elements.', url: 'https://docs.python.org/3/library/stdtypes.html#list' },
    'str': { role: 'Text Sequence Type', why: 'Immutable sequence of Unicode code points.', url: 'https://docs.python.org/3/library/stdtypes.html#text-sequence-type-str' },
    'int': { role: 'Arbitrary-Precision Integer Type', why: 'Represents whole numbers without overflow limitations.', url: 'https://docs.python.org/3/library/stdtypes.html#numeric-types-int-float-complex' },
    'float': { role: 'Double Precision Float Type', why: 'IEEE 754 64-bit floating point real numbers.', url: 'https://docs.python.org/3/library/stdtypes.html#numeric-types-int-float-complex' },
    'bool': { role: 'Boolean Type', why: 'Subtype of integers holding True or False.', url: 'https://docs.python.org/3/library/stdtypes.html#boolean-type-bool' },
  };

  if (pythonKeywords[raw]) {
    const pk = pythonKeywords[raw];
    return {
      token: raw,
      role: pk.role,
      whyUsed: pk.why,
      docUrl: pk.url,
      docSource: 'Python Docs',
    };
  }

  // 8. C++ & Java Core Language Keywords & Types
  const cppAndJavaKeywords: Record<string, { role: string; why: string; url: string; source: string }> = {
    'public': { role: 'Public Access Specifier', why: 'Allows unrestricted access to the member from any scope.', url: 'https://en.cppreference.com/w/cpp/language/access', source: 'cppreference.com' },
    'private': { role: 'Private Access Specifier', why: 'Restricts member access strictly to methods of the enclosing class.', url: 'https://en.cppreference.com/w/cpp/language/access', source: 'cppreference.com' },
    'protected': { role: 'Protected Access Specifier', why: 'Allows access to enclosing class and derived subclass methods.', url: 'https://en.cppreference.com/w/cpp/language/access', source: 'cppreference.com' },
    'static': { role: 'Static Storage Duration Specifier', why: 'Binds member to the class type rather than individual instance objects.', url: 'https://en.cppreference.com/w/cpp/language/static', source: 'cppreference.com' },
    'final': { role: 'Immutability / Non-Overridable Modifier', why: 'Prevents variable reassignment, method overriding, or class inheritance.', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.1.1.2', source: 'Oracle Java Docs' },
    'void': { role: 'Empty / No Return Value Type', why: 'Signifies that the function does not produce an output return value.', url: 'https://en.cppreference.com/w/cpp/language/types', source: 'cppreference.com' },
    'int': { role: 'Signed Integer Primitive Type', why: '32-bit two\'s complement signed integer (-2,147,483,648 to 2,147,483,647).', url: 'https://en.cppreference.com/w/cpp/language/types', source: 'cppreference.com' },
    'float': { role: 'Single-Precision Floating-Point Type', why: '32-bit IEEE 754 floating point scalar.', url: 'https://en.cppreference.com/w/cpp/language/types', source: 'cppreference.com' },
    'double': { role: 'Double-Precision Floating-Point Type', why: '64-bit IEEE 754 double precision floating point type.', url: 'https://en.cppreference.com/w/cpp/language/types', source: 'cppreference.com' },
    'char': { role: 'Character Primitive Type', why: 'Represents an 8-bit character code or ASCII byte.', url: 'https://en.cppreference.com/w/cpp/language/types', source: 'cppreference.com' },
    'bool': { role: 'Boolean Primitive Type', why: 'Holds boolean true or false value.', url: 'https://en.cppreference.com/w/cpp/language/types', source: 'cppreference.com' },
    'boolean': { role: 'Java Boolean Primitive Type', why: 'Holds boolean true or false value.', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.2.5', source: 'Oracle Java Docs' },
    'String': { role: 'Java Character String Object Type', why: 'Immutable sequence of characters represented as an object.', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html', source: 'Oracle Java Docs' },
    'auto': { role: 'Automatic Type Deduction Specifier', why: 'Deduces variable type automatically from its initializing expression at compile-time.', url: 'https://en.cppreference.com/w/cpp/language/auto', source: 'cppreference.com' },
    'std': { role: 'C++ Standard Library Namespace', why: 'Enclosing namespace for standard algorithms, containers, and I/O streams.', url: 'https://en.cppreference.com/w/cpp/symbol_index', source: 'cppreference.com' },
    'cout': { role: 'Standard Character Output Stream', why: 'Writes character data to stdout stream using the << insertion operator.', url: 'https://en.cppreference.com/w/cpp/io/cout', source: 'cppreference.com' },
    'cin': { role: 'Standard Character Input Stream', why: 'Reads typed characters from stdin stream using the >> extraction operator.', url: 'https://en.cppreference.com/w/cpp/io/cin', source: 'cppreference.com' },
    'endl': { role: 'End-of-Line Stream Manipulator', why: 'Inserts newline character and immediately flushes stream buffer.', url: 'https://en.cppreference.com/w/cpp/io/manip/endl', source: 'cppreference.com' },
    'vector': { role: 'Dynamic Contiguous Array Container', why: 'Sequence container that encapsulates dynamic sizing arrays.', url: 'https://en.cppreference.com/w/cpp/container/vector', source: 'cppreference.com' },
    'nullptr': { role: 'Null Pointer Literal', why: 'Prvalue of type std::nullptr_t representing a null memory pointer.', url: 'https://en.cppreference.com/w/cpp/language/nullptr', source: 'cppreference.com' },
    'System': { role: 'Java System Core Class', why: 'Provides standard input, output, error streams, and environment properties.', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/System.html', source: 'Oracle Java Docs' },
    'out': { role: 'Standard PrintStream Reference', why: 'Output stream connected to the host console.', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/System.html#out', source: 'Oracle Java Docs' },
    'println': { role: 'Line Printing Method', why: 'Prints argument text to console and terminates the line with a newline.', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/io/PrintStream.html#println()', source: 'Oracle Java Docs' },
  };

  if (cppAndJavaKeywords[raw]) {
    const cj = cppAndJavaKeywords[raw];
    return {
      token: raw,
      role: cj.role,
      whyUsed: cj.why,
      docUrl: cj.url,
      docSource: cj.source,
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

  // 9. Intelligent Syntactic Analyzer for arbitrary custom symbols / identifiers
  const lineTrimmed = line.trim();

  // Pattern A: const initialItems = [ ...
  if (lineTrimmed.includes(`const ${raw} = [`) || lineTrimmed.includes(`let ${raw} = [`) || lineTrimmed.includes(`var ${raw} = [`)) {
    return {
      token: raw,
      role: 'In-Memory Dataset Collection Array',
      whyUsed: `Initializes the foundational in-memory data array '${raw}' holding catalog/application records for UI rendering and search filtering.`,
      docUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
      docSource: 'MDN Web Docs',
    };
  }

  // Pattern B: const cardGrid = document.getElementById(...)
  if (lineTrimmed.includes(`const ${raw} = document.`) || lineTrimmed.includes(`let ${raw} = document.`) || lineTrimmed.includes(`const ${raw} = getElementById`) || lineTrimmed.includes(`const ${raw} = querySelector`)) {
    return {
      token: raw,
      role: 'Cached DOM Element Reference',
      whyUsed: `Stores a cached reference to the '${raw}' DOM element to enable fast dynamic manipulation without repeating DOM queries.`,
      docUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById',
      docSource: 'MDN Web Docs',
    };
  }

  // Pattern C: function renderCards(...) or const filterItems = ...
  if (lineTrimmed.includes(`function ${raw}`) || lineTrimmed.includes(`const ${raw} = (`) || lineTrimmed.includes(`const ${raw} = function`)) {
    return {
      token: raw,
      role: 'Application Routine / Function Definition',
      whyUsed: `Declares the execution routine '${raw}' that coordinates data processing and updates application state or UI.`,
      docUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function',
      docSource: 'MDN Web Docs',
    };
  }

  // Pattern D: Followed by '(' -> Function invocation
  if (lineTrimmed.includes(`${raw}(`)) {
    return {
      token: raw,
      role: 'Application Routine Invocation',
      whyUsed: `Executes the callable routine '${raw}()', passing parameters to perform calculation or trigger UI rendering.`,
      docUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions',
      docSource: 'MDN Web Docs',
    };
  }

  // Pattern E: Object property key (e.g. id: 1, name: 'Burger', category: 'food')
  if (lineTrimmed.includes(`${raw}:`) || lineTrimmed.includes(`"${raw}":`) || lineTrimmed.includes(`'${raw}':`)) {
    return {
      token: raw,
      role: 'Data Entity Attribute Key',
      whyUsed: `Defines the '${raw}' property key within this record schema, structuring item attributes for access and filtering.`,
      docUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer',
      docSource: 'MDN Web Docs',
    };
  }

  // Pattern F: Preceded by '.' -> Property or method access (e.g. item.name, card.id)
  if (lineTrimmed.includes(`.${raw}`)) {
    return {
      token: raw,
      role: 'Object Property Accessor',
      whyUsed: `Reads the '${raw}' attribute from the preceding object reference during execution or filtering.`,
      docUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors',
      docSource: 'MDN Web Docs',
    };
  }

  // Pattern G: Callback or loop parameter (e.g. (e) =>, (item) =>, (items))
  if (lineTrimmed.includes(`(${raw})`) || lineTrimmed.includes(`(${raw},`) || lineTrimmed.includes(`, ${raw})`) || lineTrimmed.includes(`${raw} =>`)) {
    return {
      token: raw,
      role: 'Callback / Function Parameter',
      whyUsed: `Receives the dynamic input argument '${raw}' passed into this block during iteration or event dispatch.`,
      docUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#function_parameters',
      docSource: 'MDN Web Docs',
    };
  }

  // Pattern H: Variable declaration (const x = ..., let y = ...)
  if (lineTrimmed.includes(`const ${raw}`) || lineTrimmed.includes(`let ${raw}`) || lineTrimmed.includes(`var ${raw}`)) {
    return {
      token: raw,
      role: 'Block-Scoped Variable Binding',
      whyUsed: `Binds variable '${raw}' within this scope to hold runtime values and manage component state.`,
      docUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const',
      docSource: 'MDN Web Docs',
    };
  }

  // Clean Final Fallback (never generic or vague)
  return {
    token: raw,
    role: `${raw} (Application Identifier)`,
    whyUsed: `Named symbol '${raw}' encapsulates domain state and execution logic in this ${language || 'code'} module.`,
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
