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
      const clean = f.path.replace(/^src\//, '');
      fileMap[clean] = f.content;
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
      if (!cleanPath.endsWith('.tsx') && !cleanPath.endsWith('.ts')) {
        const candidates = [
          'src/' + cleanPath + '.tsx',
          'src/' + cleanPath + '.ts',
          'src/components/' + cleanPath + '.tsx',
          'src/utils/' + cleanPath + '.ts',
          cleanPath + '.tsx',
          cleanPath + '.ts',
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
        // Return empty object for type-only files (e.g. types.ts)
        if (cleanPath.includes('type') || cleanPath.includes('interface')) {
          return {};
        }
        console.warn('Module not found in virtual filesystem:', modulePath, 'resolved as:', cleanPath);
        return {};
      }

      try {
        // Transpile with Babel Standalone
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
        const appModule = requireModule('src/App.tsx') || requireModule('App.tsx');
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
