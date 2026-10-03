import { extractSemanticTokensFromLine, explainTokenInContext, AITokenBreakdown } from './codeLineAnalyzer';

export interface EnclosingBlockInfo {
  blockType: 'css_rule' | 'react_component' | 'react_hook' | 'function' | 'html_element' | 'control_flow' | 'module_scope';
  blockName: string;
  startLine: number;
  endLine: number;
  codeSnippet: string;
  siblingTokensOrProperties: string[];
  surroundingSummary: string;
}

export interface CollaboratingToken {
  token: string;
  role: string;
  relationship: string;
}

export interface TokenBlockContextAnalysis {
  token: string;
  role: string;
  whyUsed: string;
  docUrl: string;
  docSource: string;
  enclosingBlock: EnclosingBlockInfo;
  howTokenPowersBlock: string;
  collaboratingTokens: CollaboratingToken[];
  rippleEffect: string;
  surroundingGroupContext: string;
  suggestedQuestions: string[];
}

/**
 * Detects the enclosing scope or code block surrounding a given line index.
 * Handles CSS rules, React components/hooks, functions, HTML tags, and loops.
 */
export function detectEnclosingCodeBlock(
  lines: string[],
  targetLineIndex: number,
  language: string
): EnclosingBlockInfo {
  const line = lines[targetLineIndex] || '';
  const lang = (language || '').toLowerCase();
  const total = lines.length;

  // 1. CSS Rule Block Detection
  const isCss = lang.includes('css') || 
    (line.includes(':') && (line.includes('px') || line.includes('rem') || line.includes('#') || line.includes(';'))) ||
    line.trim().startsWith('.') || line.trim().startsWith('#') || line.trim().startsWith('@');

  if (isCss) {
    let startLine = targetLineIndex;
    let selector = '';

    // Walk backward to find selector or opening brace
    for (let i = targetLineIndex; i >= 0; i--) {
      const cur = lines[i].trim();
      if (cur.includes('{') || /^[.#a-zA-Z0-9_:,\s>+~-]+$/.test(cur)) {
        selector = cur.replace(/\{.*/, '').trim();
        startLine = i;
        if (cur.includes('{')) break;
      }
      if (cur === '}' && i !== targetLineIndex) break;
    }

    // Walk forward to find closing brace
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

    const cleanSelector = selector || 'CSS Style Block';
    return {
      blockType: 'css_rule',
      blockName: `CSS Rule: ${cleanSelector}`,
      startLine: startLine + 1,
      endLine: endLine + 1,
      codeSnippet: blockLines.join('\n'),
      siblingTokensOrProperties: siblingDeclarations,
      surroundingSummary: `Presentation group styling '${cleanSelector}'. Orchestrates visual geometry, color palette, and typography across ${siblingDeclarations.length || 1} declarations.`,
    };
  }

  // 2. React Component Scope Detection
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
    const constCompMatch = cur.match(/(?:export\s+)?const\s+([A-Z][a-zA-Z0-9_]*)\s*[:=]/);
    if (constCompMatch) {
      compStart = i;
      compName = constCompMatch[1];
      break;
    }
  }

  // 3. Local Function or Method Detection
  let funcStart = -1;
  let funcName = '';
  for (let i = targetLineIndex; i >= 0; i--) {
    const cur = lines[i].trim();
    const fnMatch = cur.match(/(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(/) ||
                    cur.match(/(?:const|let)\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?\(/) ||
                    cur.match(/def\s+([a-zA-Z0-9_]+)\s*\(/) ||
                    cur.match(/(?:public|private|static|\w+)\s+(?:void|\w+)\s+([a-zA-Z0-9_]+)\s*\(/);
    if (fnMatch) {
      funcStart = i;
      funcName = fnMatch[1];
      break;
    }
  }

  // 4. React Hook Detection (useEffect, useState callback)
  let hookStart = -1;
  let hookName = '';
  for (let i = targetLineIndex; i >= 0; i--) {
    const cur = lines[i].trim();
    if (cur.includes('useEffect(') || cur.includes('useCallback(') || cur.includes('useMemo(')) {
      hookStart = i;
      hookName = cur.split('(')[0].trim();
      break;
    }
  }

  // Prioritize most specific local scope (Hook > Function > Component)
  const chosenStart = hookStart !== -1 && hookStart > (funcStart !== -1 ? funcStart : -1)
    ? hookStart
    : (funcStart !== -1 ? funcStart : compStart);

  if (chosenStart !== -1) {
    let braceCount = 0;
    let foundFirstBrace = false;
    let chosenEnd = targetLineIndex;

    for (let i = chosenStart; i < total; i++) {
      const cur = lines[i];
      for (const char of cur) {
        if (char === '{') {
          braceCount++;
          foundFirstBrace = true;
        } else if (char === '}') {
          braceCount--;
        }
      }
      if (foundFirstBrace && braceCount <= 0) {
        chosenEnd = i;
        break;
      }
    }

    const blockLines = lines.slice(chosenStart, chosenEnd + 1);
    const isComponent = chosenStart === compStart;
    const isHook = chosenStart === hookStart;

    const blockType = isHook ? 'react_hook' : (isComponent ? 'react_component' : 'function');
    const blockLabel = isHook 
      ? `React Hook: ${hookName}` 
      : (isComponent ? `Component: <${compName} />` : `Function: ${funcName}()`);

    return {
      blockType,
      blockName: blockLabel,
      startLine: chosenStart + 1,
      endLine: chosenEnd + 1,
      codeSnippet: blockLines.join('\n'),
      siblingTokensOrProperties: blockLines.slice(1, -1).map(l => l.trim()).filter(Boolean).slice(0, 5),
      surroundingSummary: isComponent
        ? `Architectural container: ${blockLabel} manages local state lifecycle, event handling, and template markup.`
        : (isHook 
            ? `Lifecycle hook: ${blockLabel} manages asynchronous side-effects, subscriptions, or cached computations.`
            : `Callable routine: ${blockLabel} executes algorithmic data processing and state mutations.`),
    };
  }

  // 5. HTML Landmark or Tag Block
  if (line.includes('<') && line.includes('>')) {
    const tagMatch = line.match(/<([a-zA-Z0-9_-]+)/);
    const tag = tagMatch ? tagMatch[1] : 'element';
    const start = Math.max(0, targetLineIndex - 1);
    const end = Math.min(total - 1, targetLineIndex + 1);
    return {
      blockType: 'html_element',
      blockName: `HTML Landmark: <${tag}>`,
      startLine: start + 1,
      endLine: end + 1,
      codeSnippet: lines.slice(start, end + 1).join('\n'),
      siblingTokensOrProperties: [line.trim()],
      surroundingSummary: `Structural DOM layout node '<${tag}>' hosting nested interface elements and responsive styles.`,
    };
  }

  // 6. Natural Surrounding Execution Window (Fallback)
  const windowStart = Math.max(0, targetLineIndex - 2);
  const windowEnd = Math.min(total - 1, targetLineIndex + 2);
  const blockLines = lines.slice(windowStart, windowEnd + 1);

  return {
    blockType: 'control_flow',
    blockName: `Scope Window (Lines ${windowStart + 1}-${windowEnd + 1})`,
    startLine: windowStart + 1,
    endLine: windowEnd + 1,
    codeSnippet: blockLines.join('\n'),
    siblingTokensOrProperties: blockLines.map(l => l.trim()).filter(Boolean),
    surroundingSummary: `Sequential execution scope coordinating instructions across lines ${windowStart + 1} to ${windowEnd + 1}.`,
  };
}

/**
 * Performs deep, block-level contextual analysis of any token within its enclosing group of code.
 * Explains how this token collaborates with surrounding declarations, its data lifecycle, and ripple effects.
 */
export function analyzeTokenInBlockContext(
  token: string,
  lineContent: string,
  lineIndex: number,
  allLines: string[],
  language: string,
  projectName?: string
): TokenBlockContextAnalysis {
  const cleanToken = token.trim();
  const lower = cleanToken.toLowerCase();
  const baseAnalysis: AITokenBreakdown = explainTokenInContext(cleanToken, lineContent, language);
  const enclosingBlock = detectEnclosingCodeBlock(allLines, lineIndex, language);
  const projName = projectName || 'Application';

  // Extract collaborating tokens from the surrounding block
  const blockTokens = extractSemanticTokensFromLine(enclosingBlock.codeSnippet, language);
  const siblingTokens = Array.from(new Set(blockTokens.filter(t => t !== cleanToken))).slice(0, 4);

  const collaboratingTokens: CollaboratingToken[] = siblingTokens.map(sib => {
    const sibInfo = explainTokenInContext(sib, enclosingBlock.codeSnippet, language);
    return {
      token: sib,
      role: sibInfo.role,
      relationship: `Collaborates with '${cleanToken}' inside ${enclosingBlock.blockName} to establish cohesive component behavior.`,
    };
  });

  // Dynamic Synthesis: How this token specifically powers the enclosing block
  let howTokenPowersBlock = '';
  let rippleEffect = '';

  // Case A: CSS Properties and Values in CSS Rules
  if (enclosingBlock.blockType === 'css_rule') {
    if (lower === 'font-size' || /^[0-9]+(?:\.[0-9]+)?px$/.test(cleanToken)) {
      howTokenPowersBlock = `Inside ${enclosingBlock.blockName}, '${cleanToken}' establishes the optical glyph height. In tandem with sibling properties (${siblingTokens.slice(0, 2).join(', ') || 'typography rules'}), it anchors visual hierarchy and guarantees prominent contrast against surrounding navigation links.`;
      rippleEffect = `Altering '${cleanToken}' directly changes text proportions. Decreasing it flattens the hierarchy into standard body copy; increasing it too far risks line wrapping on smaller mobile displays.`;
    } else if (lower === 'font-weight' || cleanToken === '800' || cleanToken === '700' || cleanToken === 'bold') {
      howTokenPowersBlock = `Inside ${enclosingBlock.blockName}, '${cleanToken}' applies stroke boldness to character glyphs. It prevents large text from looking spindly and commands immediate user focus when the header loads.`;
      rippleEffect = `Reducing weight to normal (400) creates a subdued, washed-out title that fails to draw the user's attention.`;
    } else if (lower === 'color' || cleanToken.startsWith('#')) {
      howTokenPowersBlock = `Inside ${enclosingBlock.blockName}, '${cleanToken}' applies the brand color palette. It ensures strong WCAG AAA contrast ratio against the background backdrop and unifies branding across the UI.`;
      rippleEffect = `Changing this color breaks palette cohesion with adjacent action buttons and header badges.`;
    } else if (lower === 'display' || lower === 'grid' || lower === 'flex') {
      howTokenPowersBlock = `Inside ${enclosingBlock.blockName}, '${cleanToken}' switches the browser layout formatting context. It coordinates children into responsive 1D flex rows or 2D grid matrices without floating elements.`;
      rippleEffect = `Switching from flex/grid to block causes child buttons and logo elements to stack vertically instead of aligning neatly side-by-side.`;
    } else if (cleanToken.startsWith('.')) {
      howTokenPowersBlock = `Serves as the primary class hook targeting all DOM nodes with class="${cleanToken.slice(1)}". Encapsulates all styling rules within this single maintainable selector.`;
      rippleEffect = `Renaming this selector breaks CSS attachment to corresponding HTML/JSX elements, dropping all custom styles back to raw browser defaults.`;
    } else {
      howTokenPowersBlock = `Inside ${enclosingBlock.blockName}, '${cleanToken}' participates in this layout block. Collaborates with ${siblingTokens.slice(0, 2).join(' and ') || 'surrounding rules'} to maintain aesthetic stability.`;
      rippleEffect = `Removing this declaration alters the box model or typography calculations for ${enclosingBlock.blockName}.`;
    }
  }

  // Case B: React Component / Hook Scope
  else if (enclosingBlock.blockType === 'react_component' || enclosingBlock.blockType === 'react_hook') {
    if (lower === 'usestate' || lower.startsWith('set')) {
      howTokenPowersBlock = `Inside ${enclosingBlock.blockName}, '${cleanToken}' manages reactive memory. When state updates occur, it triggers React Virtual DOM diffing to re-render affected UI views automatically.`;
      rippleEffect = `Mutating state directly without '${cleanToken}' will fail to trigger component re-render, creating stale UI displays out of sync with actual application data.`;
    } else if (lower === 'useeffect') {
      howTokenPowersBlock = `Inside ${enclosingBlock.blockName}, '${cleanToken}' governs component side-effects. It isolates asynchronous API calls, subscriptions, and DOM updates from the pure rendering cycle.`;
      rippleEffect = `Removing '${cleanToken}' or omitting its dependency array can cause infinite network request loops or memory leaks on unmount.`;
    } else if (lower.includes('balance') || lower.includes('transfer') || lower.includes('cart') || lower.includes('item')) {
      howTokenPowersBlock = `Inside ${enclosingBlock.blockName}, '${cleanToken}' represents core application domain data for ${projName}. Coordinates with sibling logic (${siblingTokens.slice(0, 2).join(', ')}) to maintain business rules and financial/catalog integrity.`;
      rippleEffect = `Modifying this variable could produce inaccurate balance balances, broken cart totals, or uncaught calculation exceptions during user interaction.`;
    } else {
      howTokenPowersBlock = `Inside ${enclosingBlock.blockName}, '${cleanToken}' executes an essential step in component lifecycle and data flow, collaborating with ${siblingTokens.slice(0, 2).join(', ') || 'neighboring logic'}.`;
      rippleEffect = `Omitting or refactoring '${cleanToken}' changes the execution path or return signature of ${enclosingBlock.blockName}.`;
    }
  }

  // Case C: Functions / Algorithms
  else if (enclosingBlock.blockType === 'function') {
    howTokenPowersBlock = `Inside ${enclosingBlock.blockName}, '${cleanToken}' drives algorithmic execution. It coordinates inputs, transforms state, and produces the required output for the surrounding routine.`;
    rippleEffect = `Modifying '${cleanToken}' alters computational logic, potentially leading to off-by-one errors, invalid return values, or unhandled runtime exceptions.`;
  }

  // Case D: Universal Default
  else {
    howTokenPowersBlock = `Inside ${enclosingBlock.blockName}, '${cleanToken}' functions in lockstep with adjacent code statements (${siblingTokens.slice(0, 2).join(', ') || 'surrounding logic'}) to ensure cohesive execution.`;
    rippleEffect = `Removing '${cleanToken}' disrupts statement resolution in this scope window.`;
  }

  const suggestedQuestions = [
    `How does '${cleanToken}' interact with other statements in ${enclosingBlock.blockName}?`,
    `What design pattern or best practice is applied in this block?`,
    `How can I refactor this block to improve performance or accessibility?`,
  ];

  return {
    token: cleanToken,
    role: baseAnalysis.role,
    whyUsed: baseAnalysis.whyUsed,
    docUrl: baseAnalysis.docUrl,
    docSource: baseAnalysis.docSource,
    enclosingBlock,
    howTokenPowersBlock,
    collaboratingTokens,
    rippleEffect,
    surroundingGroupContext: enclosingBlock.surroundingSummary,
    suggestedQuestions,
  };
}

/**
 * Tokenizes a line into hoverable interactive token spans and whitespace segments.
 * Allows moving the mouse cursor over any individual token in the code view.
 */
export function tokenizeLineForInteractiveDisplay(
  line: string,
  language: string
): Array<{ text: string; isToken: boolean; isWhitespace: boolean }> {
  if (!line) return [{ text: ' ', isToken: false, isWhitespace: true }];

  const tokens = extractSemanticTokensFromLine(line, language);
  if (tokens.length === 0) {
    return [{ text: line, isToken: false, isWhitespace: line.trim().length === 0 }];
  }

  const segments: Array<{ text: string; isToken: boolean; isWhitespace: boolean }> = [];
  let currentIndex = 0;

  for (const token of tokens) {
    const tokenPos = line.indexOf(token, currentIndex);
    if (tokenPos === -1) continue;

    // Add preceding non-token gap (spaces, punctuation)
    if (tokenPos > currentIndex) {
      const gap = line.slice(currentIndex, tokenPos);
      segments.push({
        text: gap,
        isToken: false,
        isWhitespace: gap.trim().length === 0,
      });
    }

    // Add interactive token
    segments.push({
      text: token,
      isToken: true,
      isWhitespace: false,
    });

    currentIndex = tokenPos + token.length;
  }

  // Trailing gap
  if (currentIndex < line.length) {
    const trailing = line.slice(currentIndex);
    segments.push({
      text: trailing,
      isToken: false,
      isWhitespace: trailing.trim().length === 0,
    });
  }

  return segments;
}
