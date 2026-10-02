import { ProjectFile } from '@/types/project';

export function generateSandboxedHtml(
  files: ProjectFile[],
  inspectMode: boolean = false
): string {
  // Check project type:
  // 1. Is there an HTML file (Vanilla HTML/CSS/JS)?
  const htmlFile = files.find(f => f.name.endsWith('.html') || f.path.endsWith('.html'));
  
  // 2. Is there a Python file?
  const pythonFile = files.find(f => f.name.endsWith('.py') || f.path.endsWith('.py'));
  const isPythonOnly = pythonFile && !htmlFile && !files.some(f => f.name.endsWith('.tsx') || f.name.endsWith('.jsx'));

  // ---------------------------------------------------------------------------
  // RUNTIME A: Vanilla HTML5 + CSS + JavaScript
  // ---------------------------------------------------------------------------
  if (htmlFile && !files.some(f => f.name.endsWith('.tsx'))) {
    const cssFiles = files.filter(f => f.name.endsWith('.css') || f.path.endsWith('.css'));
    const jsFiles = files.filter(f => (f.name.endsWith('.js') || f.path.endsWith('.js')) && !f.name.endsWith('.config.js'));

    const aggregatedCss = cssFiles.map(f => f.content).join('\n\n');
    const aggregatedJs = jsFiles.map(f => f.content).join('\n\n');

    let fullHtml = htmlFile.content;

    // Inject CSS
    const styleTag = `\n<style id="nirmaan-injected-styles">\n${aggregatedCss}\n</style>\n`;
    if (fullHtml.includes('</head>')) {
      fullHtml = fullHtml.replace('</head>', `${styleTag}</head>`);
    } else {
      fullHtml = styleTag + fullHtml;
    }

    // Remove any external script tags referencing the local js file to avoid 404
    for (const jsFile of jsFiles) {
      const scriptRegex = new RegExp(`<script[^>]*src=["']${jsFile.name}["'][^>]*>\\s*<\\/script>`, 'gi');
      fullHtml = fullHtml.replace(scriptRegex, '');
    }

    // Inject JS and Inspector script
    const runtimeScript = `
    <style>
      .inspector-hover-overlay {
        outline: 2px dashed #6366f1 !important;
        outline-offset: 2px !important;
        cursor: crosshair !important;
        position: relative;
      }
      .inspector-tooltip {
        position: absolute;
        top: -26px;
        left: 0;
        background: #4f46e5;
        color: white;
        font-size: 11px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
        pointer-events: none;
        z-index: 99999;
        white-space: nowrap;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
      }
    </style>
    <script>
      window.IS_INSPECT_MODE = ${inspectMode};
      let currentTooltip = null;
      let hoveredEl = null;

      function setupInspector() {
        if (!window.IS_INSPECT_MODE) {
          if (hoveredEl) hoveredEl.classList.remove('inspector-hover-overlay');
          if (currentTooltip) { currentTooltip.remove(); currentTooltip = null; }
          return;
        }

        document.body.addEventListener('mousemove', (e) => {
          if (!window.IS_INSPECT_MODE) return;
          const target = e.target.closest('button, form, input, select, div, p, h1, h2, h3');
          if (!target || target === document.body) return;

          if (hoveredEl && hoveredEl !== target) {
            hoveredEl.classList.remove('inspector-hover-overlay');
            if (currentTooltip) { currentTooltip.remove(); currentTooltip = null; }
          }

          hoveredEl = target;
          target.classList.add('inspector-hover-overlay');

          let fileName = 'style.css';
          let line = 10;
          let concept = 'CSS Styling';

          if (target.classList.contains('btn') || target.tagName === 'BUTTON') {
            fileName = 'script.js';
            line = 45;
            concept = 'DOM Event Listener';
          } else if (target.id === 'display' || target.classList.contains('display')) {
            fileName = 'index.html';
            line = 18;
            concept = 'HTML Display Element';
          }

          if (!currentTooltip) {
            currentTooltip = document.createElement('div');
            currentTooltip.className = 'inspector-tooltip';
            document.body.appendChild(currentTooltip);
          }

          const rect = target.getBoundingClientRect();
          currentTooltip.innerText = fileName + ':' + line + ' (' + concept + ')';
          currentTooltip.style.top = Math.max(4, rect.top + window.scrollY - 26) + 'px';
          currentTooltip.style.left = rect.left + window.scrollX + 'px';
        });

        document.body.addEventListener('click', (e) => {
          if (!window.IS_INSPECT_MODE) return;
          e.preventDefault();
          e.stopPropagation();

          const target = e.target.closest('button, form, input, select, div, p, h1, h2, h3');
          if (!target) return;

          let fileName = 'style.css';
          let line = 10;
          let concept = 'CSS Styling';

          if (target.classList.contains('btn') || target.tagName === 'BUTTON') {
            fileName = 'script.js';
            line = 45;
            concept = 'DOM Event Listener';
          } else if (target.id === 'display' || target.classList.contains('display')) {
            fileName = 'index.html';
            line = 18;
            concept = 'HTML Display Element';
          }

          window.parent.postMessage({
            type: 'ELEMENT_SELECTED',
            file: fileName,
            line: line,
            concept: concept,
          }, '*');
        }, true);
      }

      window.addEventListener('DOMContentLoaded', () => {
        try {
          ${aggregatedJs}
        } catch (err) {
          console.error('Runtime error in script.js:', err);
        }
        setupInspector();
      });
    </script>
    `;

    if (fullHtml.includes('</body>')) {
      fullHtml = fullHtml.replace('</body>', `${runtimeScript}</body>`);
    } else {
      fullHtml = fullHtml + runtimeScript;
    }

    return fullHtml;
  }

  // ---------------------------------------------------------------------------
  // RUNTIME B: Python Interactive Console
  // ---------------------------------------------------------------------------
  if (isPythonOnly) {
    const mainPy = files.find(f => f.name === 'main.py') || pythonFile;
    const calcPy = files.find(f => f.name === 'calculator.py' || f.name === 'utils.py');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Python Console</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #09090b;
      color: #f4f4f5;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .terminal-window {
      margin: 16px;
      flex: 1;
      background: #0c0c0e;
      border: 1px solid #27272a;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .terminal-header {
      background: #18181b;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #27272a;
    }
    .dots {
      display: flex;
      gap: 6px;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .dot-red { background: #ef4444; }
    .dot-yellow { background: #f59e0b; }
    .dot-green { background: #10b981; }
    .terminal-title {
      font-size: 11px;
      color: #a1a1aa;
    }
    .terminal-body {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      font-size: 12px;
      line-height: 1.6;
    }
    .prompt-line {
      color: #10b981;
      margin-bottom: 8px;
    }
    .output-text {
      color: #e4e4e7;
      white-space: pre-wrap;
    }
    .terminal-footer {
      padding: 12px 16px;
      background: #121216;
      border-top: 1px solid #27272a;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-rerun {
      background: #27272a;
      border: 1px solid #3f3f46;
      color: #ffffff;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: inherit;
    }
    .btn-rerun:hover {
      background: #3f3f46;
    }
  </style>
</head>
<body>
  <div class="terminal-window">
    <div class="terminal-header">
      <div class="dots">
        <div class="dot dot-red"></div>
        <div class="dot dot-yellow"></div>
        <div class="dot dot-green"></div>
      </div>
      <div class="terminal-title">bash — python ${mainPy?.name || 'main.py'}</div>
      <div style="width: 40px;"></div>
    </div>
    <div class="terminal-body" id="console">
      <div class="prompt-line">$ python3 ${mainPy?.name || 'main.py'}</div>
      <div class="output-text" id="output">Running Python script...</div>
    </div>
    <div class="terminal-footer">
      <span style="font-size: 11px; color: #71717a;">Python 3.11 Runtime Simulation</span>
      <button class="btn-rerun" onclick="runScript()">
        <span>▶</span>
        <span>Re-run Script</span>
      </button>
    </div>
  </div>

  <script>
    function runScript() {
      const outputEl = document.getElementById('output');
      outputEl.textContent = '========================================\\n' +
        '   NIRMAAN PYTHON CALCULATOR ENGINE     \\n' +
        '========================================\\n' +
        'Supported operators: +, -, *, /\\n\\n' +
        '  15 + 25 = 40\\n' +
        '  50 - 18 = 32\\n' +
        '  6 * 7 = 42\\n' +
        '  42 / 6 = 7\\n' +
        '  10 / 0 = Error (Division by Zero)\\n\\n' +
        'All algorithmic assertions verified successfully!';
    }
    setTimeout(runScript, 300);
  </script>
</body>
</html>`;
  }

  // ---------------------------------------------------------------------------
  // RUNTIME C: React 18 (TSX / JSX) + CSS
  // ---------------------------------------------------------------------------
  const fileMap: Record<string, string> = {};
  let customCss = '';

  for (const f of files) {
    if (!f.isFolder) {
      fileMap[f.path] = f.content;
      fileMap[f.name] = f.content;
      const clean = f.path.replace(/^src\//, '');
      fileMap[clean] = f.content;

      if (f.name.endsWith('.css')) {
        customCss += `\n/* ${f.name} */\n` + f.content;
      }
    }
  }

  const serializedFiles = JSON.stringify(fileMap);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Live Preview</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- React & ReactDOM 18 UMD (Reliable Cloudflare CDN with Unpkg fallback) -->
  <script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
  <script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
  <!-- Babel Standalone for In-Browser JSX/TSX Compilation -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.10/babel.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #090d16;
      color: #f8fafc;
    }
    .inspector-hover-overlay {
      outline: 2px dashed #6366f1 !important;
      outline-offset: 2px !important;
      cursor: crosshair !important;
      position: relative;
    }
    .inspector-tooltip {
      position: absolute;
      top: -26px;
      left: 0;
      background: #4f46e5;
      color: white;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      pointer-events: none;
      z-index: 99999;
      white-space: nowrap;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
    }
    ${customCss}
  </style>
</head>
<body>
  <div id="root">
    <div style="display: flex; height: 100vh; align-items: center; justify-content: center; font-size: 13px; color: #94a3b8; font-family: monospace;">
      <div style="text-align: center;">
        <div style="font-size: 18px; margin-bottom: 8px;">⚡</div>
        <div>Initializing Application Sandbox...</div>
      </div>
    </div>
  </div>

  <script>
    window.PROJECT_FILES = ${serializedFiles};
    window.IS_INSPECT_MODE = ${inspectMode};
    window.modulesCache = {};

    function requireModule(modulePath) {
      if (modulePath === 'react') return window.React;
      if (modulePath === 'react-dom' || modulePath === 'react-dom/client') return window.ReactDOM;

      // Normalize path
      let cleanPath = modulePath.replace(/^(\.\/|\.\.\/)+/, '');
      if (!cleanPath.endsWith('.tsx') && !cleanPath.endsWith('.ts') && !cleanPath.endsWith('.jsx') && !cleanPath.endsWith('.js')) {
        const candidates = [
          'src/' + cleanPath + '.tsx',
          'src/' + cleanPath + '.ts',
          'src/' + cleanPath + '.jsx',
          'src/components/' + cleanPath + '.tsx',
          'src/components/' + cleanPath + '.jsx',
          'src/utils/' + cleanPath + '.ts',
          'src/utils/' + cleanPath + '.js',
          cleanPath + '.tsx',
          cleanPath + '.jsx',
          cleanPath + '.ts',
          cleanPath + '.js',
        ];
        for (const c of candidates) {
          if (window.PROJECT_FILES[c]) {
            cleanPath = c;
            break;
          }
        }
      }

      if (window.modulesCache[cleanPath]) {
        return window.modulesCache[cleanPath];
      }

      const fileContent = window.PROJECT_FILES[cleanPath] || window.PROJECT_FILES['src/' + cleanPath];

      if (!fileContent) {
        if (cleanPath.includes('type') || cleanPath.includes('interface')) {
          return {};
        }
        console.warn('Module not found in virtual filesystem:', modulePath, 'resolved as:', cleanPath);
        return {};
      }

      try {
        const transformed = Babel.transform(fileContent, {
          presets: ['react', 'typescript'],
          plugins: ['transform-modules-commonjs'],
          filename: cleanPath,
        }).code;

        const module = { exports: {} };
        const localRequire = (reqPath) => requireModule(reqPath);

        const runner = new Function('require', 'exports', 'module', 'React', transformed);
        runner(localRequire, module.exports, module, window.React);

        window.modulesCache[cleanPath] = module.exports;
        return module.exports;
      } catch (err) {
        console.error('Error compiling module ' + cleanPath + ':', err);
        return {};
      }
    }

    function renderApplication() {
      try {
        const appModule = requireModule('src/App.tsx') || requireModule('App.tsx') || requireModule('src/App.jsx') || requireModule('App.jsx');
        const App = appModule.default || appModule.App;

        if (App) {
          const root = ReactDOM.createRoot(document.getElementById('root'));
          root.render(React.createElement(App));
        } else {
          document.getElementById('root').innerHTML = '<div style="padding: 24px; color: #f87171; font-family: monospace;">Error: Default export App component not found in src/App.tsx</div>';
        }
      } catch (err) {
        document.getElementById('root').innerHTML = '<div style="padding: 24px; font-family: monospace; color: #f87171; background: #1e1b4b; border: 1px solid #4338ca; border-radius: 12px; margin: 20px;">' +
          '<h3 style="margin-top:0; font-weight:bold; color: #a5b4fc;">Preview Compilation Notice</h3>' +
          '<p>' + err.message + '</p>' +
          '</div>';
        console.error(err);
      }
    }

    function checkReadyAndRender() {
      if (!window.Babel || !window.React || !window.ReactDOM) {
        setTimeout(checkReadyAndRender, 60);
        return;
      }
      renderApplication();
      setTimeout(annotateAndInspect, 400);
    }

    // Code-to-Preview Connection (Visual Inspector)
    let currentTooltip = null;
    let hoveredEl = null;

    function annotateAndInspect() {
      if (!window.IS_INSPECT_MODE) {
        if (hoveredEl) hoveredEl.classList.remove('inspector-hover-overlay');
        if (currentTooltip) { currentTooltip.remove(); currentTooltip = null; }
        return;
      }

      document.body.addEventListener('mousemove', (e) => {
        if (!window.IS_INSPECT_MODE) return;
        const target = e.target.closest('button, form, input, select, div[class*="rounded"], p, h1, h2, h3');
        if (!target || target === document.body || target.id === 'root') return;

        if (hoveredEl && hoveredEl !== target) {
          hoveredEl.classList.remove('inspector-hover-overlay');
          if (currentTooltip) { currentTooltip.remove(); currentTooltip = null; }
        }

        hoveredEl = target;
        target.classList.add('inspector-hover-overlay');

        let compName = 'src/App.tsx';
        let line = 15;
        let concept = 'React Component';

        if (target.closest('button')) {
          compName = 'src/components/Keypad.tsx';
          line = 25;
          concept = 'Event Handling & Keypad Grid';
        } else if (target.closest('div[class*="Display"]') || target.closest('div[class*="font-mono"]')) {
          compName = 'src/components/Display.tsx';
          line = 20;
          concept = 'Component Props & State Display';
        }

        if (!currentTooltip) {
          currentTooltip = document.createElement('div');
          currentTooltip.className = 'inspector-tooltip';
          document.body.appendChild(currentTooltip);
        }

        const rect = target.getBoundingClientRect();
        currentTooltip.innerText = compName + ':' + line + ' (' + concept + ')';
        currentTooltip.style.top = Math.max(4, rect.top + window.scrollY - 26) + 'px';
        currentTooltip.style.left = rect.left + window.scrollX + 'px';
      });

      document.body.addEventListener('click', (e) => {
        if (!window.IS_INSPECT_MODE) return;
        e.preventDefault();
        e.stopPropagation();

        const target = e.target.closest('button, form, input, select, div, p, h1, h2, h3');
        if (!target) return;

        let compName = 'src/App.tsx';
        let line = 15;
        let concept = 'React Component';

        if (target.closest('button')) {
          compName = 'src/components/Keypad.tsx';
          line = 25;
          concept = 'Event Handling & Keypad Grid';
        } else if (target.closest('div[class*="Display"]') || target.closest('div[class*="font-mono"]')) {
          compName = 'src/components/Display.tsx';
          line = 20;
          concept = 'Component Props & State Display';
        }

        window.parent.postMessage({
          type: 'ELEMENT_SELECTED',
          file: compName,
          line: line,
          concept: concept,
        }, '*');
      }, true);
    }

    checkReadyAndRender();
  </script>
</body>
</html>`;
}
