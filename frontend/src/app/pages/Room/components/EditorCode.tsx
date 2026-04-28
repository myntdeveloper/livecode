import React from "react";
import { Editor, loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { darkTheme, lightTheme } from "../../../utils/monacoTheme";
import { languageMap } from "../../../utils/languageConfig";
import { KEYWORDS, LANGUAGE_SNIPPETS } from "../constants";

let isMonacoWorkersConfigured = false;
const ROOM_LANGUAGE_LABELS = new Set([
  "python",
  "go",
  "rust",
  "java",
  "cpp",
  "c",
  "csharp",
  "php",
  "ruby",
  "swift",
  "kotlin",
]);

if (!isMonacoWorkersConfigured) {
  (globalThis as typeof globalThis & {
    MonacoEnvironment?: {
      getWorker: (_: string, label: string) => Worker;
    };
  }).MonacoEnvironment = {
    getWorker(_, label) {
      if (label === "json") {
        return new jsonWorker();
      }
      if (label === "css" || label === "scss" || label === "less") {
        return new cssWorker();
      }
      if (label === "html" || label === "handlebars" || label === "razor") {
        return new htmlWorker();
      }
      if (label === "typescript" || label === "javascript") {
        return new tsWorker();
      }
      if (ROOM_LANGUAGE_LABELS.has(label)) {
        return new editorWorker();
      }
      return new editorWorker();
    },
  };

  loader.config({ monaco });
  isMonacoWorkersConfigured = true;
}

interface EditorCodeProps {
  code: string;
  language: string;
  theme: string;
  completionRegisteredRef: React.MutableRefObject<boolean>;
  editorRef: React.MutableRefObject<any>;
  monacoRef: React.MutableRefObject<any>;
  onCodeChange: (value: string) => void;
  onCursorChange: (line: number, column: number) => void;
}

export function EditorCode({
  code,
  language,
  theme,
  completionRegisteredRef,
  editorRef,
  monacoRef,
  onCodeChange,
  onCursorChange,
}: EditorCodeProps) {
  return (
    <Editor
      height="100%"
      language={languageMap[language] || language}
      value={code}
      onChange={(value) => onCodeChange(value || "")}
      theme={theme === "dark" ? "livecode-dark" : "livecode-light"}
      beforeMount={(monaco) => {
        monacoRef.current = monaco;
        if (!completionRegisteredRef.current) {
          Object.entries(KEYWORDS).forEach(([lang, words]) => {
            monaco.languages.registerCompletionItemProvider(lang, {
              triggerCharacters: [".", ":", "(", "_"],
              provideCompletionItems: (model, position) => {
                const wordUntil = model.getWordUntilPosition(position);
                const range = {
                  startLineNumber: position.lineNumber,
                  endLineNumber: position.lineNumber,
                  startColumn: wordUntil.startColumn,
                  endColumn: wordUntil.endColumn,
                };
                const prefix = wordUntil.word.toLowerCase();
                const keywordSuggestions = words
                  .filter((word) => !prefix || word.toLowerCase().startsWith(prefix))
                  .map((word) => ({
                    label: word,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: word,
                    detail: `${lang} keyword`,
                    sortText: `1_${word}`,
                    range,
                  }));

                const snippets = LANGUAGE_SNIPPETS[lang] || [];
                const snippetSuggestions = snippets
                  .filter((snippet) => !prefix || snippet.label.toLowerCase().startsWith(prefix))
                  .map((snippet) => ({
                    label: snippet.label,
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: snippet.insertText,
                    insertTextRules:
                      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: snippet.documentation,
                    sortText: `0_${snippet.label}`,
                    range,
                  }));

                return {
                  suggestions: [...snippetSuggestions, ...keywordSuggestions],
                };
              },
            });
          });
          completionRegisteredRef.current = true;
        }
        monaco.editor.defineTheme("livecode-dark", darkTheme);
        monaco.editor.defineTheme("livecode-light", lightTheme);
      }}
      onMount={(editor, monaco) => {
        editorRef.current = editor;
        editor.onDidChangeCursorPosition((event) => {
          onCursorChange(event.position.lineNumber, event.position.column);
        });

        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        });
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          allowNonTsExtensions: true,
          moduleResolution:
            monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.CommonJS,
          noEmit: true,
          esModuleInterop: true,
          allowJs: true,
        });
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        });
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          allowNonTsExtensions: true,
          moduleResolution:
            monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.CommonJS,
          noEmit: true,
          esModuleInterop: true,
        });
      }}
      options={{
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        minimap: { enabled: false },
        lineNumbers: "on",
        emptySelectionClipboard: false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: "on",
        padding: { top: 16 },
        renderLineHighlight: "line",
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "off",
        quickSuggestions: {
          other: true,
          comments: true,
          strings: true,
        },
        suggest: {
          showKeywords: true,
          showSnippets: true,
          showFunctions: true,
          showVariables: true,
          showClasses: true,
          showMethods: true,
          showWords: true,
        },
        parameterHints: {
          enabled: true,
        },
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: "on",
        tabCompletion: "on",
        wordBasedSuggestions: "allDocuments",
        snippetSuggestions: "top",
        quickSuggestionsDelay: 0,
      }}
    />
  );
}
