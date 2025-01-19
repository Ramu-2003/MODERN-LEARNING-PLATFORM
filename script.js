// Monaco Editor setup
require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' } });

let editor;
let currentLanguage = 'html';
const defaultCode = {
  html: '<!-- Write your HTML here -->\n<h1>Hello World</h1>\n<p>Start coding!</p>',
  css: '/* Write your CSS here */\nh1 {\n  color: #6366f1;\n  text-align: center;\n  margin: 2rem 0;\n}\n\np {\n  color: #4b5563;\n  text-align: center;\n}',
  js: '// Write your JavaScript here\nconsole.log("Ready to code! 🚀");\n\n// Example: Add a click event\ndocument.querySelector("h1")?.addEventListener("click", () => {\n  alert("Hello, developer!");\n});'
};

let code = { ...defaultCode };

// Initialize Monaco Editor
require(['vs/editor/editor.main'], function() {
  editor = monaco.editor.create(document.getElementById('editor'), {
    value: code[currentLanguage],
    language: currentLanguage,
    theme: 'vs-dark',
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: 'JetBrains Mono',
    padding: { top: 16 },
    smoothScrolling: true,
    cursorSmoothCaretAnimation: true,
    formatOnPaste: true,
    formatOnType: true,
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
  });

  editor.onDidChangeModelContent(() => {
    code[currentLanguage] = editor.getValue();
    updatePreview();
  });

  // Initial preview
  updatePreview();
});

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const language = tab.dataset.tab;
    if (language === currentLanguage) return;

    // Update active tab
    document.querySelector('.tab.active').classList.remove('active');
    tab.classList.add('active');

    // Update editor
    currentLanguage = language;
    monaco.editor.setModelLanguage(editor.getModel(), language);
    editor.setValue(code[language]);
  });
});

// Preview functionality
function updatePreview() {
  const wrappedJS = `
    try {
      const originalConsole = console.log;
      const originalConsoleError = console.error;
      
      console.log = function(...args) {
        window.parent.postMessage({ type: 'log', content: args.join(' ') }, '*');
        originalConsole.apply(console, args);
      };

      console.error = function(...args) {
        window.parent.postMessage({ type: 'error', content: args.join(' ') }, '*');
        originalConsoleError.apply(console, args);
      };

      ${code.js}
    } catch (error) {
      window.parent.postMessage({ type: 'error', content: error.message }, '*');
    }
  `;

  const preview = document.getElementById('preview');
  preview.srcdoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${code.css}</style>
      </head>
      <body>
        ${code.html}
        <script>${wrappedJS}<\/script>
      </body>
    </html>
  `;
}

// Console functionality
const consoleOutput = document.getElementById('consoleOutput');

window.addEventListener('message', event => {
  if (event.data && typeof event.data === 'object') {
    const { type, content } = event.data;
    const log = document.createElement('div');
    log.textContent = `[${type.toUpperCase()}] ${content}`;
    log.className = type;
    consoleOutput.appendChild(log);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }
});

document.getElementById('clearConsole').addEventListener('click', () => {
  consoleOutput.innerHTML = '';
});

// Refresh button
document.getElementById('refreshBtn').addEventListener('click', updatePreview);

// Expand/Collapse button
const expandBtn = document.getElementById('expandBtn');
const editorGrid = document.querySelector('.editor-grid');

expandBtn.addEventListener('click', () => {
  editorGrid.classList.toggle('expanded');
  const icon = expandBtn.querySelector('.icon');
  const isExpanded = editorGrid.classList.contains('expanded');
  
  if (isExpanded) {
    expandBtn.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M4 10h6m0 0V4m0 6L3 3m17 7h-6m0 0V4m0 6l7-7"></path>
      </svg>
      Collapse
    `;
  } else {
    expandBtn.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3"></path>
      </svg>
      Expand
    `;
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  editor?.layout();
});