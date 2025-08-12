import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface MonacoProps {
  value: string;
  language: string;
  path?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export default function Monaco({ value, language, path, onChange, readOnly = false }: MonacoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Configure Monaco theme for GitHub dark
    monaco.editor.defineTheme('github-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '7d8590', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff7b72' },
        { token: 'string', foreground: 'a5d6ff' },
        { token: 'number', foreground: '79c0ff' },
        { token: 'type', foreground: 'ffa657' },
        { token: 'class', foreground: 'ffa657' },
        { token: 'function', foreground: 'd2a8ff' },
        { token: 'variable', foreground: 'f0f6fc' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#f0f6fc',
        'editor.lineHighlightBackground': '#161b22',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
        'editorCursor.foreground': '#f0f6fc',
        'editorWhitespace.foreground': '#484f58',
        'editorLineNumber.foreground': '#7d8590',
        'editorLineNumber.activeForeground': '#f0f6fc',
      }
    });

    const editor = monaco.editor.create(containerRef.current, {
      value,
      language,
      theme: 'github-dark',
      readOnly,
      minimap: { enabled: true },
      fontSize: 14,
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
      suggest: {
        showKeywords: true,
        showSnippets: true,
      },
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false,
      },
    });

    editorRef.current = editor;

    // Handle content changes
    const disposable = editor.onDidChangeModelContent(() => {
      if (onChange) {
        onChange(editor.getValue());
      }
    });

    return () => {
      disposable.dispose();
      editor.dispose();
    };
  }, []);

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== value) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  // Update language when it changes
  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  return <div ref={containerRef} className="w-full h-full" />;
}
