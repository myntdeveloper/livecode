import React from "react";
import { Play, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

interface OutputPanelProps {
  output: string;
  isOutputError: boolean;
  terminalInput: string;
  terminalInputQueue: string[];
  onTerminalInputChange: (value: string) => void;
  onTerminalInputSubmit: () => void;
  onRun: () => void;
  onClear: () => void;
  t: (key: string) => string;
  borderClassName: string;
}

export function OutputPanel({
  output,
  isOutputError,
  terminalInput,
  terminalInputQueue,
  onTerminalInputChange,
  onTerminalInputSubmit,
  onRun,
  onClear,
  t,
  borderClassName,
}: OutputPanelProps) {
  return (
    <aside className={`h-full border-border/50 bg-card/30 backdrop-blur-sm flex flex-col ${borderClassName}`}>
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t("room.output")}
        </h3>
        <div className="flex items-center gap-2">
          <Button onClick={onClear} size="sm" variant="outline">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button onClick={onRun} size="sm">
            <Play className="w-4 h-4 mr-2" />
            {t("room.run")}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className={`text-sm font-mono whitespace-pre-wrap leading-relaxed ${output && isOutputError ? "text-red-500" : "text-muted-foreground"}`}>
          {output || t("room.runPlaceholder")}
        </pre>
      </div>
      <div className="border-t border-border/50 p-3">
        {terminalInputQueue.length > 0 && (
          <p className="mb-2 text-xs text-muted-foreground font-mono">
            queued: {terminalInputQueue.join(" | ")}
          </p>
        )}
        <Input
          value={terminalInput}
          placeholder="Terminal input (Enter sends one line)"
          className="font-mono"
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => onTerminalInputChange(e.target.value)}
          onFocus={(e) => {
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") {
              e.preventDefault();
              onTerminalInputSubmit();
            }
          }}
        />
      </div>
    </aside>
  );
}
