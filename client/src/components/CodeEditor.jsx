import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, language, onChange, onCursorChange, cursors }) => {
  const editorRef = useRef(null);
  const decorationsRef = useRef([]);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;

    // Set custom theme
    monaco.editor.defineTheme('codesync-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6c6c80', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c678dd' },
        { token: 'string', foreground: 'a6e3a1' },
        { token: 'number', foreground: 'f9e2af' },
        { token: 'type', foreground: '89b4fa' },
        { token: 'function', foreground: '89dceb' },
        { token: 'variable', foreground: 'cdd6f4' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#cdd6f4',
        'editor.lineHighlightBackground': '#1a1a2e',
        'editor.selectionBackground': '#6C63FF33',
        'editor.inactiveSelectionBackground': '#6C63FF1a',
        'editorLineNumber.foreground': '#3d3d5c',
        'editorLineNumber.activeForeground': '#6C63FF',
        'editorCursor.foreground': '#6C63FF',
        'editor.selectionHighlightBackground': '#6C63FF1a',
        'editorIndentGuide.background': '#1e1e2e',
        'editorIndentGuide.activeBackground': '#3d3d5c',
        'editorWidget.background': '#111118',
        'editorWidget.border': '#6C63FF33',
        'editorSuggestWidget.background': '#111118',
        'editorSuggestWidget.border': '#6C63FF33',
        'editorSuggestWidget.selectedBackground': '#6C63FF33',
        'scrollbarSlider.background': '#6C63FF33',
        'scrollbarSlider.hoverBackground': '#6C63FF55',
      },
    });
    monaco.editor.setTheme('codesync-dark');

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      if (onCursorChange) {
        onCursorChange({
          lineNumber: e.position.lineNumber,
          column: e.position.column,
        });
      }
    });

    // Focus editor
    editor.focus();
  };

  // Update remote user cursors as decorations
  useEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const monaco = window.monaco;
    if (!monaco) return;

    const newDecorations = [];

    Object.entries(cursors).forEach(([socketId, { username, cursor, color }]) => {
      if (!cursor) return;

      // Remote cursor decoration (colored line highlight)
      newDecorations.push({
        range: new monaco.Range(
          cursor.lineNumber,
          cursor.column,
          cursor.lineNumber,
          cursor.column + 1
        ),
        options: {
          className: `remote-cursor-${socketId}`,
          beforeContentClassName: `remote-cursor-marker`,
          hoverMessage: { value: `**${username}** is here` },
          stickiness: 1,
          afterContentClassName: `remote-cursor-label-${socketId}`,
        },
      });
    });

    // Apply decorations
    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );

    // Inject dynamic styles for cursor colors
    let styleEl = document.getElementById('remote-cursor-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'remote-cursor-styles';
      document.head.appendChild(styleEl);
    }

    let styles = '';
    Object.entries(cursors).forEach(([socketId, { username, color }]) => {
      styles += `
        .remote-cursor-${socketId} {
          background: ${color}22 !important;
          border-left: 2px solid ${color} !important;
        }
        .remote-cursor-label-${socketId}::after {
          content: '${username}';
          position: absolute;
          top: -18px;
          left: 0;
          background: ${color};
          color: white;
          padding: 1px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          white-space: nowrap;
          pointer-events: none;
          z-index: 100;
        }
      `;
    });

    styleEl.textContent = styles;
  }, [cursors]);

  // Map language names for Monaco
  const getMonacoLanguage = (lang) => {
    const map = {
      javascript: 'javascript',
      python: 'python',
      typescript: 'typescript',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      html: 'html',
      css: 'css',
      json: 'json',
    };
    return map[lang] || 'javascript';
  };

  return (
    <Editor
      height="100%"
      language={getMonacoLanguage(language)}
      value={code}
      onChange={(value) => onChange(value || '')}
      onMount={handleEditorMount}
      loading={
        <div style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d1117',
        }}>
          <div className="spinner" style={{ width: 30, height: 30 }}></div>
        </div>
      }
      options={{
        fontSize: 15,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
        fontLigatures: true,
        lineHeight: 24,
        minimap: { enabled: true, scale: 1, showSlider: 'mouseover' },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        renderLineHighlight: 'all',
        renderWhitespace: 'selection',
        bracketPairColorization: { enabled: true },
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        formatOnPaste: true,
        tabSize: 2,
        wordWrap: 'on',
        padding: { top: 16, bottom: 16 },
        suggestFontSize: 14,
        suggest: {
          showMethods: true,
          showFunctions: true,
          showVariables: true,
          showKeywords: true,
        },
      }}
    />
  );
};

export default CodeEditor;
