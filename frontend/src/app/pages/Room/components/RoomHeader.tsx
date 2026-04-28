import React from "react";
import { Check, Code2, Copy, LogOut, Moon, Sun } from "lucide-react";

interface RoomHeaderProps {
  roomId: string;
  copied: boolean;
  isOwner: boolean;
  theme: string;
  onCopy: () => void;
  onCloseRoom: () => void;
  onHome: () => void;
  onToggleTheme: () => void;
  t: (key: string) => string;
}

export function RoomHeader({
  roomId,
  copied,
  isOwner,
  theme,
  onCopy,
  onCloseRoom,
  onHome,
  onToggleTheme,
  t,
}: RoomHeaderProps) {
  return (
    <header className="border-b border-border/50 px-6 py-3 flex items-center justify-between backdrop-blur-sm bg-background/80">
      <div className="flex items-center gap-4">
        <button
          onClick={onHome}
          className="flex items-center gap-2 hover:text-primary transition-colors"
        >
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Code2 className="w-4 h-4 text-primary" />
          </div>
          <span className="tracking-tight font-semibold">Livecode</span>
        </button>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{t("room.label")}:</span>
          <code className="px-2 py-1 rounded bg-muted text-foreground font-mono">
            {roomId}
          </code>
          <button
            onClick={onCopy}
            className="p-1.5 hover:bg-muted rounded transition-colors"
            title="Copy room link"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          {isOwner && (
            <button
              onClick={onCloseRoom}
              className="p-1.5 hover:bg-muted rounded transition-colors"
              title={t("room.closeLobby")}
            >
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-all"
          title={t("room.theme")}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Moon className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>
    </header>
  );
}
