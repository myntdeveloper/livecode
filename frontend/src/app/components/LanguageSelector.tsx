import React, {useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Code2 } from "lucide-react";
import { clsx } from "clsx";

interface LanguageSelectorProps {
  value: string;
  onChange: (language: string) => void;
  disabled?: boolean;
}

const LANGUAGES = [
  {
    id: "javascript",
    name: "JavaScript",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  },
  {
    id: "typescript",
    name: "TypeScript",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  },
  {
    id: "python",
    name: "Python",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  },
  {
    id: "go",
    name: "Go",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg",
  },
  {
    id: "rust",
    name: "Rust",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg",
  },
  {
    id: "java",
    name: "Java",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  },
  {
    id: "cpp",
    name: "C++",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
  },
  {
    id: "c",
    name: "C",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
  },
  {
    id: "csharp",
    name: "C#",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg",
  },
  {
    id: "php",
    name: "PHP",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
  },
  {
    id: "ruby",
    name: "Ruby",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg",
  },
  {
    id: "swift",
    name: "Swift",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg",
  },
  {
    id: "kotlin",
    name: "Kotlin",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg",
  },
];

export function LanguageSelector({ value, onChange, disabled = false }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const currentLang = useMemo(
    () => LANGUAGES.find((lang) => lang.id === value),
    [value],
  );

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handleOutside);
    return () => window.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full h-10 px-3 rounded-md border border-input bg-input text-sm flex items-center justify-between gap-2 hover:border-ring/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 min-w-0">
          {currentLang?.icon ? (
            <img
              src={currentLang.icon}
              alt={currentLang.name}
              className="w-4 h-4 shrink-0"
            />
          ) : (
            <Code2 className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
          <span className="font-medium truncate">
            {currentLang?.name || "Language"}
          </span>
        </span>
        <ChevronDown
          className={clsx(
            "w-4 h-4 text-muted-foreground transition-all duration-300 ease-out",
            isOpen ? "rotate-180 scale-105" : "rotate-0 scale-100",
          )}
        />
      </button>

      <div
        className={clsx(
          "absolute z-20 mt-1 w-full rounded-md border border-border bg-card shadow-lg overflow-hidden origin-top",
          "transition-all duration-200",
          isOpen
            ? "opacity-100 scale-y-100 pointer-events-auto"
            : "opacity-0 scale-y-95 pointer-events-none",
        )}
      >
        {LANGUAGES.map((lang) => (
          <button
            type="button"
            key={lang.id}
            onClick={() => {
              onChange(lang.id);
              setIsOpen(false);
            }}
            className={clsx(
              "w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted transition-colors",
              value === lang.id && "bg-muted/60",
            )}
          >
            <img
              src={lang.icon}
              alt={lang.name}
              className="w-4 h-4 shrink-0"
            />
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
