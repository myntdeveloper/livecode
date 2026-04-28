export const CURSOR_COLORS = [
  "#6366f1",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ef4444",
  "#84cc16",
  "#f97316",
  "#a855f7",
];

export const AVATAR_GRADIENTS = [
  "from-indigo-500 to-purple-500",
  "from-pink-500 to-rose-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-violet-500 to-fuchsia-500",
  "from-cyan-500 to-blue-500",
  "from-red-500 to-pink-500",
  "from-lime-500 to-green-500",
  "from-orange-500 to-red-500",
  "from-purple-500 to-indigo-500",
];

export const KEYWORDS: Record<string, string[]> = {
  javascript: ["function", "const", "let", "return", "if", "else", "for", "while", "import", "export", "async", "await", "class"],
  typescript: ["interface", "type", "enum", "implements", "extends", "function", "const", "let", "return", "if", "else", "for", "while", "import", "export", "async", "await", "class"],
  python: ["def", "class", "return", "if", "elif", "else", "for", "while", "import", "from", "try", "except", "with", "as", "lambda"],
  go: ["package", "import", "func", "var", "const", "type", "struct", "interface", "if", "else", "for", "range", "switch", "case", "return", "defer", "go"],
  rust: ["fn", "let", "mut", "struct", "enum", "impl", "trait", "if", "else", "for", "while", "loop", "match", "use", "pub", "return"],
  java: ["class", "public", "private", "protected", "static", "void", "int", "String", "if", "else", "for", "while", "switch", "case", "return", "new"],
  cpp: ["#include", "int", "void", "class", "struct", "if", "else", "for", "while", "switch", "case", "return", "namespace", "std"],
  c: ["#include", "int", "void", "struct", "if", "else", "for", "while", "switch", "case", "return", "typedef"],
  csharp: ["namespace", "class", "public", "private", "static", "void", "int", "string", "if", "else", "for", "while", "switch", "case", "return", "using"],
  php: ["<?php", "function", "class", "public", "private", "protected", "if", "else", "for", "while", "foreach", "return", "echo"],
  ruby: ["def", "class", "module", "if", "elsif", "else", "while", "do", "end", "require", "puts", "return"],
  swift: ["import", "class", "struct", "enum", "func", "var", "let", "if", "else", "for", "while", "switch", "case", "return", "guard"],
  kotlin: ["fun", "class", "object", "val", "var", "if", "else", "when", "for", "while", "return", "import"],
};

export const LANGUAGE_SNIPPETS: Record<
  string,
  Array<{ label: string; insertText: string; documentation: string }>
> = {
  javascript: [
    { label: "for", insertText: "for (let ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n  $0\n}", documentation: "For loop" },
    { label: "function", insertText: "function ${1:name}(${2:args}) {\n  $0\n}", documentation: "Function declaration" },
  ],
  typescript: [
    { label: "interface", insertText: "interface ${1:Name} {\n  $0\n}", documentation: "Interface declaration" },
    { label: "function", insertText: "function ${1:name}(${2:args}): ${3:void} {\n  $0\n}", documentation: "Typed function" },
  ],
  python: [
    { label: "def", insertText: "def ${1:name}(${2:args}):\n    $0", documentation: "Function definition" },
    { label: "for", insertText: "for ${1:item} in ${2:items}:\n    $0", documentation: "For-in loop" },
  ],
  go: [
    { label: "func", insertText: "func ${1:name}(${2:args}) ${3:error} {\n\t$0\n}", documentation: "Function declaration" },
    { label: "for", insertText: "for ${1:i} := 0; ${1:i} < ${2:n}; ${1:i}++ {\n\t$0\n}", documentation: "For loop" },
  ],
  rust: [
    { label: "fn", insertText: "fn ${1:name}(${2:args}) {\n    $0\n}", documentation: "Function declaration" },
    { label: "match", insertText: "match ${1:value} {\n    ${2:pattern} => ${3:expr},\n    _ => ${4:default},\n}", documentation: "Match expression" },
  ],
  java: [
    { label: "main", insertText: "public static void main(String[] args) {\n    $0\n}", documentation: "Main method" },
    { label: "for", insertText: "for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n    $0\n}", documentation: "For loop" },
  ],
  cpp: [
    { label: "main", insertText: "int main() {\n    $0\n    return 0;\n}", documentation: "Main function" },
    { label: "for", insertText: "for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n    $0\n}", documentation: "For loop" },
  ],
  c: [
    { label: "main", insertText: "int main(void) {\n    $0\n    return 0;\n}", documentation: "Main function" },
    { label: "for", insertText: "for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n    $0\n}", documentation: "For loop" },
  ],
  csharp: [
    { label: "class", insertText: "class ${1:Name}\n{\n    $0\n}", documentation: "Class declaration" },
    { label: "for", insertText: "for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++)\n{\n    $0\n}", documentation: "For loop" },
  ],
  php: [
    { label: "function", insertText: "function ${1:name}(${2:$arg}) {\n    $0\n}", documentation: "Function declaration" },
    { label: "foreach", insertText: "foreach (${1:$items} as ${2:$item}) {\n    $0\n}", documentation: "Foreach loop" },
  ],
  ruby: [
    { label: "def", insertText: "def ${1:name}(${2:args})\n  $0\nend", documentation: "Method definition" },
    { label: "each", insertText: "${1:items}.each do |${2:item}|\n  $0\nend", documentation: "Each iterator" },
  ],
  swift: [
    { label: "func", insertText: "func ${1:name}(${2:args}) {\n    $0\n}", documentation: "Function declaration" },
    { label: "for", insertText: "for ${1:item} in ${2:items} {\n    $0\n}", documentation: "For-in loop" },
  ],
  kotlin: [
    { label: "fun", insertText: "fun ${1:name}(${2:args}) {\n    $0\n}", documentation: "Function declaration" },
    { label: "for", insertText: "for (${1:item} in ${2:items}) {\n    $0\n}", documentation: "For-in loop" },
  ],
};