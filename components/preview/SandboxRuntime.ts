import { ProjectFile } from '@/types/project';

export function generateSandboxedHtml(
  files: ProjectFile[],
  inspectMode: boolean = false
): string {
  // Convert files into an in-memory JSON registry
  const fileMap: Record<string, string> = {};
  for (const f of files) {
    if (!f.isFolder) {
      fileMap[f.path] = f.content;
      fileMap[f.name] = f.content;
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
  <!-- React & ReactDOM 18 UMD -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <!-- Babel Standalone for In-Browser JSX/TSX Compilation -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
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
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script>
    window.PROJECT_FILES = ${serializedFiles};
    window.IS_INSPECT_MODE = ${inspectMode};

    // Simple module execution registry
    window.modulesCache = {};

    function requireModule(modulePath) {
      // Normalize path
      let cleanPath = modulePath.replace(/^(\.\/|\.\.\/)+/, '');
      if (!cleanPath.endsWith('.tsx') && !cleanPath.endsWith('.ts')) {
        if (window.PROJECT_FILES['src/' + cleanPath + '.tsx']) cleanPath = 'src/' + cleanPath + '.tsx';
        else if (window.PROJECT_FILES['src/' + cleanPath + '.ts']) cleanPath = 'src/' + cleanPath + '.ts';
        else if (window.PROJECT_FILES['src/components/' + cleanPath + '.tsx']) cleanPath = 'src/components/' + cleanPath + '.tsx';
        else if (window.PROJECT_FILES[cleanPath + '.tsx']) cleanPath = cleanPath + '.tsx';
        else if (window.PROJECT_FILES[cleanPath + '.ts']) cleanPath = cleanPath + '.ts';
      }

      if (window.modulesCache[cleanPath]) {
        return window.modulesCache[cleanPath];
      }

      const fileContent = window.PROJECT_FILES[cleanPath] || window.PROJECT_FILES['src/' + cleanPath];

      if (!fileContent) {
        if (modulePath === 'react') return window.React;
        if (modulePath === 'react-dom') return window.ReactDOM;
        console.warn('Module not found in virtual filesystem:', modulePath);
        return {};
      }

      // Transpile using Babel
      try {
        const transformed = Babel.transform(fileContent, {
          presets: ['react', 'typescript'],
          plugins: ['transform-modules-commonjs'],
          filename: cleanPath,
        }).code;

        const module = { exports: {} };
        const localRequire = (reqPath) => {
          if (reqPath === 'react') return window.React;
          if (reqPath === 'react-dom') return window.ReactDOM;
          return requireModule(reqPath);
        };

        const runner = new Function('require', 'exports', 'module', 'React', transformed);
        runner(localRequire, module.exports, module, window.React);

        window.modulesCache[cleanPath] = module.exports;
        return module.exports;
      } catch (err) {
        console.error('Error compiling module ' + cleanPath + ':', err);
        throw err;
      }
    }

    try {
      const appModule = requireModule('src/App.tsx');
      const App = appModule.default || appModule.App;

      if (App) {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(App));
      } else {
        document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red;">Error: Default export App component not found in src/App.tsx</div>';
      }
    } catch (err) {
      document.getElementById('root').innerHTML = '<div style="padding: 24px; font-family: monospace; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; margin: 20px;">' +
        '<h3 style="margin-top:0; font-weight:bold;">Preview Compilation Error</h3>' +
        '<p>' + err.message + '</p>' +
        '</div>';
      console.error(err);
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

        // Guess component name and file based on contents and parent tags
        let compName = 'App.tsx';
        let line = 15;
        let concept = 'React Component';

        if (target.closest('form')) {
          compName = 'src/components/ExpenseForm.tsx';
          line = 24;
          concept = 'Event Handling & Controlled State';
        } else if (target.closest('div[class*="grid-cols"]')) {
          compName = 'src/components/SummaryCards.tsx';
          line = 12;
          concept = 'Array.reduce & Aggregations';
        } else if (target.closest('button[title*="Delete"]') || target.innerText.toLowerCase().includes('delete')) {
          compName = 'src/components/ExpenseList.tsx';
          line = 52;
          concept = 'Array.filter & Event Callbacks';
        } else if (target.closest('div[class*="divide-y"]')) {
          compName = 'src/components/ExpenseList.tsx';
          line = 36;
          concept = 'Array.map & Key Prop';
        }

        if (!currentTooltip) {
          currentTooltip = document.createElement('div');
          currentTooltip.className = 'inspector-tooltip';
          document.body.appendChild(currentTooltip);
        }

        const rect = target.getBoundingClientRect();
        currentTooltip.innerText = compName + ':' + line + ' (' + concept + ')';
        currentTooltip.style.top = Math.max(4, rect.top + window.scrollY - 24) + 'px';
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

        if (target.closest('form')) {
          compName = 'src/components/ExpenseForm.tsx';
          line = 24;
          concept = 'Event Handling & Controlled State';
        } else if (target.closest('div[class*="grid-cols"]')) {
          compName = 'src/components/SummaryCards.tsx';
          line = 12;
          concept = 'Array.reduce & Aggregations';
        } else if (target.closest('button[title*="Delete"]') || target.innerText.toLowerCase().includes('delete')) {
          compName = 'src/components/ExpenseList.tsx';
          line = 52;
          concept = 'Array.filter & Event Callbacks';
        } else if (target.closest('div[class*="divide-y"]')) {
          compName = 'src/components/ExpenseList.tsx';
          line = 36;
          concept = 'Array.map & Key Prop';
        }

        window.parent.postMessage({
          type: 'ELEMENT_SELECTED',
          file: compName,
          line: line,
          concept: concept,
        }, '*');
      }, true);
    }

    setTimeout(annotateAndInspect, 300);
  </script>
</body>
</html>`;
}
