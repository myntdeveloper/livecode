import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { Editor } from "@monaco-editor/react";
import {
  Code2,
  Copy,
  Play,
  Trash2,
  Users,
  Check,
  Moon,
  Sun,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { LanguageSelector } from "../components/LanguageSelector";
import { Modal } from "../components/ui/Modal";
import { Select } from "../components/ui/Select";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { darkTheme, lightTheme } from "../utils/monacoTheme";
import {
  languageMap,
  defaultCode,
} from "../utils/languageConfig";
import { execute } from "../api/executor";
import {
  changeRoomLanguage,
  closeRoom,
  getRoomById,
  type RoomResponse,
} from "../api/room";
import { getProfile } from "../api/user";

const CURSOR_COLORS = [
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

const AVATAR_GRADIENTS = [
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

interface Participant {
  id: string;
  name: string;
  color: string;
  gradient: string;
  online: boolean;
  avatarUrl?: string;
  isAdmin?: boolean;
  canEdit?: boolean;
}

type TerminalPosition = "right" | "bottom";

interface WsMessage {
  type: string;
  user_id?: string;
  target_user_id?: string;
  code?: string;
  language?: string;
  users?: string[];
  output?: string;
  is_error?: boolean;
  line?: number;
  column?: number;
  name?: string;
  avatar_url?: string;
  profiles?: Record<string, { name?: string; avatar_url?: string }>;
  cursors?: Record<string, { line: number; column: number }>;
}

export function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const [code, setCode] = useState(defaultCode.javascript);
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isOutputError, setIsOutputError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [participants, setParticipants] = useState<
    Participant[]
  >([]);
  const [kickTarget, setKickTarget] = useState<Participant | null>(null);
  const [isEndSessionModalOpen, setIsEndSessionModalOpen] =
    useState(false);
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [roomError, setRoomError] = useState<"not-found" | "closed" | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserName, setCurrentUserName] = useState<string>("Guest");
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string>("");
  const [terminalInput, setTerminalInput] = useState<string>("");
  const [terminalInputQueue, setTerminalInputQueue] = useState<string[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<Record<string, { line: number; column: number }>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const ignoreCodeBroadcastRef = useRef(false);
  const ignoreLanguageBroadcastRef = useRef(false);
  const cursorDecorationsRef = useRef<string[]>([]);
  const completionRegisteredRef = useRef(false);

  const isOwner = Boolean(room?.owner_id && room.owner_id === currentUserId);

  const buildParticipant = (
    userId: string,
    profiles?: Record<string, { name?: string; avatar_url?: string }>,
    selfId?: string,
    selfName?: string,
    selfAvatar?: string,
  ): Participant => {
    const effectiveSelfId = selfId ?? currentUserId;
    const effectiveSelfName = selfName ?? currentUserName;
    const indexSeed = userId
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = indexSeed % CURSOR_COLORS.length;
    const isCurrentUser = userId === effectiveSelfId;
    const profileName = profiles?.[userId]?.name?.trim();
    const fallbackName = profileName || `User ${userId.slice(0, 6)}`;
    const avatarUrl = isCurrentUser
      ? (selfAvatar ?? currentUserAvatar)
      : profiles?.[userId]?.avatar_url;

    return {
      id: userId,
      name: isCurrentUser ? effectiveSelfName : fallbackName,
      color: CURSOR_COLORS[index],
      gradient: AVATAR_GRADIENTS[index],
      online: true,
      avatarUrl,
      isAdmin: room?.owner_id === userId,
    };
  };

  const connectRoomSocket = (
    roomID: string,
    selfID: string,
    selfName: string,
    selfAvatar: string,
  ) => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/ws/rooms/${roomID}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    let pingTimer: ReturnType<typeof setInterval> | null = null;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "profile",
          name: selfName,
          avatar_url: selfAvatar,
        }),
      );
      pingTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 25000);
    };

    ws.onmessage = (event) => {
      let message: WsMessage;
      try {
        message = JSON.parse(event.data) as WsMessage;
      } catch {
        return;
      }

      if (message.type === "presence" && Array.isArray(message.users)) {
        setParticipants(
          message.users.map((userID) =>
            buildParticipant(
              userID,
              message.profiles,
              selfID,
              selfName,
              selfAvatar,
            ),
          ),
        );
        if (message.cursors) {
          setRemoteCursors(message.cursors);
        }
        return;
      }

      if (message.type === "code_sync" && typeof message.code === "string") {
        ignoreCodeBroadcastRef.current = true;
        setCode(message.code);
        return;
      }

      if (message.type === "language_sync" && typeof message.language === "string") {
        ignoreLanguageBroadcastRef.current = true;
        setLanguage(message.language);
        return;
      }

      if (message.type === "run_output" && typeof message.output === "string") {
        setOutput(message.output);
        setIsOutputError(Boolean(message.is_error));
        return;
      }

      if (
        message.type === "cursor_sync" &&
        typeof message.user_id === "string" &&
        typeof message.line === "number" &&
        typeof message.column === "number"
      ) {
        setRemoteCursors((prev) => ({
          ...prev,
          [message.user_id as string]: {
            line: message.line as number,
            column: message.column as number,
          },
        }));
        return;
      }

      if (message.type === "kicked" && message.target_user_id === selfID) {
        navigate("/");
        return;
      }

      if (message.type === "room_closed") {
        setRoomError("closed");
        ws.close();
      }
    };

    ws.onclose = () => {
      if (pingTimer) {
        clearInterval(pingTimer);
      }
      wsRef.current = null;
    };
  };

  const handleLanguageChange = (newLanguage: string) => {
    if (!isOwner || !room) {
      return;
    }
    setLanguage(newLanguage);
    clearTerminal();

    void changeRoomLanguage(room.id, newLanguage)
      .then((updatedRoom) => {
        setRoom(updatedRoom);
        setLanguage(updatedRoom.language);
      })
      .catch(() => undefined);
  };

  const handleParticipantClick = (
    participant: Participant,
    index: number,
  ) => {
    if (!isOwner || participant.id === currentUserId || index === 0) {
      return;
    }
    setKickTarget(participant);
  };

  const handleKick = () => {
    if (!kickTarget || !isOwner || wsRef.current?.readyState !== WebSocket.OPEN) {
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: "kick",
        target_user_id: kickTarget.id,
      }),
    );
    setKickTarget(null);
  };

  const handleEndRoomSession = async () => {
    if (!room || !isOwner) {
      setIsEndSessionModalOpen(false);
      return;
    }

    try {
      const closedRoom = await closeRoom(room.id);
      setRoom(closedRoom);
      setRoomError("closed");
      setIsEndSessionModalOpen(false);
      wsRef.current?.close();
    } catch {
      setIsEndSessionModalOpen(false);
    }
  };

  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }

    const bootstrapRoom = async () => {
      try {
        const [profileResponse, roomResponse] = await Promise.all([
          getProfile(),
          getRoomById(roomId),
        ]);

        const user = profileResponse.user;
        const displayName = user.name && user.surname
          ? `${user.name} ${user.surname}`
          : user.login || "Guest";

        setCurrentUserId(user.id);
        setCurrentUserName(displayName);
        setCurrentUserAvatar(user.avatar_url || "");

        localStorage.setItem("userName", user.login || "Guest");
        localStorage.setItem("userFirstName", user.name || "");
        localStorage.setItem("userLastName", user.surname || "");
        localStorage.setItem("userAvatarUrl", user.avatar_url || "");

        if (!roomResponse) {
          setRoomError("not-found");
          return;
        }

        if (roomResponse.status === "closed") {
          setRoomError("closed");
          return;
        }

        setRoom(roomResponse);
        setLanguage(roomResponse.language || "javascript");
        setCode(roomResponse.code || defaultCode.javascript);
        setParticipants([
          buildParticipant(
            user.id,
            undefined,
            user.id,
            displayName,
            user.avatar_url || "",
          ),
        ]);
        connectRoomSocket(
          roomResponse.id,
          user.id,
          displayName,
          user.avatar_url || "",
        );
      } catch {
        setRoomError("not-found");
      }
    };

    void bootstrapRoom();

    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [roomId, navigate]);

  useEffect(() => {
    if (!ignoreCodeBroadcastRef.current) {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "code_change", code }));
      }
      return;
    }

    ignoreCodeBroadcastRef.current = false;
  }, [code]);

  useEffect(() => {
    if (!ignoreLanguageBroadcastRef.current) {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "language_change", language }));
      }
      return;
    }

    ignoreLanguageBroadcastRef.current = false;
  }, [language]);

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) {
      return;
    }

    const monaco = monacoRef.current;
    const editor = editorRef.current;
    const nextDecorations = Object.entries(remoteCursors)
      .filter(([userID]) => userID !== currentUserId)
      .map(([, cursor]) => ({
        range: new monaco.Range(cursor.line, cursor.column, cursor.line, cursor.column),
        options: {
          className: "livecode-remote-cursor",
          stickiness:
            monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        },
      }));

    cursorDecorationsRef.current = editor.deltaDecorations(
      cursorDecorationsRef.current,
      nextDecorations,
    );
  }, [remoteCursors, currentUserId]);

  if (roomError) {
    const title = roomError === "closed" ? t("room.closedTitle") : t("room.notFoundTitle");
    const description = roomError === "closed"
      ? t("room.closedDescription")
      : t("room.notFoundDescription");

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-2xl border border-border/50 bg-card/30 p-8 text-center space-y-4">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
          <Button onClick={() => navigate("/")}>{t("notFound.backHome")}</Button>
        </div>
      </div>
    );
  }

  const copyRoomLink = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatExecutionText = (text: string) =>
    text
      .replace(/^execution failed:[\s\S]*?stderr:\s*/i, "")
      .replace(/\r\n/g, "\n")
      .trim();

  const normalizeTerminalInput = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return "";
    }
    const withEscapedNewlines = trimmed.replace(/\\n/g, "\n");
    if (withEscapedNewlines.includes("\n")) {
      return withEscapedNewlines.endsWith("\n")
        ? withEscapedNewlines
        : `${withEscapedNewlines}\n`;
    }
    const tokens = withEscapedNewlines.split(/\s+/).filter(Boolean);
    return `${tokens.join("\n")}\n`;
  };

  const runCode = async () => {
    const mergedInput = [...terminalInputQueue];
    if (terminalInput.trim()) {
      mergedInput.push(terminalInput);
    }
    const inputToRun = normalizeTerminalInput(mergedInput.join("\n"));
    try {
      const result = await execute(language, code, inputToRun);
      const runOutput =
        result.output || result.stdout || result.stderr || result.error || "";
      const normalizedOutput = runOutput || t("room.runPlaceholder");
      const isError = Boolean(result.error) || Boolean(result.stderr) || Boolean(result.timeout);
      const finalOutput = formatExecutionText(normalizedOutput);
      setOutput(finalOutput);
      setIsOutputError(isError);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "run_output",
            output: finalOutput,
            is_error: isError,
          }),
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Execution failed";
      setOutput(formatExecutionText(message));
      setIsOutputError(true);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "run_output",
            output: message,
            is_error: true,
          }),
        );
      }
    } finally {
      setTerminalInput("");
      setTerminalInputQueue([]);
    }
  };

  const clearTerminal = () => {
    setOutput("");
    setIsOutputError(false);
    setTerminalInput("");
    setTerminalInputQueue([]);
  };

  const renderOutputPanel = (borderClassName: string) => (
    <aside className={`h-full border-border/50 bg-card/30 backdrop-blur-sm flex flex-col ${borderClassName}`}>
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t("room.output")}
        </h3>
        <div className="flex items-center gap-2">
          <Button onClick={clearTerminal} size="sm" variant="outline">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button onClick={runCode} size="sm">
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
          placeholder="Program input (Enter adds line, Run executes)"
          className="font-mono"
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => setTerminalInput(e.target.value)}
          onFocus={(e) => {
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") {
              e.preventDefault();
              const value = terminalInput.trim();
              if (!value) {
                return;
              }
              setTerminalInputQueue((prev) => [...prev, value]);
              setTerminalInput("");
            }
          }}
        />
      </div>
    </aside>
  );

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-3 flex items-center justify-between backdrop-blur-sm bg-background/80">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Code2 className="w-4 h-4 text-primary" />
            </div>
            <span className="tracking-tight font-semibold">
              Livecode
            </span>
          </button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              {t("room.label")}:
            </span>
            <code className="px-2 py-1 rounded bg-muted text-foreground font-mono">
              {room?.id || roomId}
            </code>
            <button
              onClick={copyRoomLink}
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
                onClick={() => setIsEndSessionModalOpen(true)}
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
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-all"
            title={t("room.theme")}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden pt-2">
          <PanelGroup direction="horizontal" className="h-full">
            <Panel defaultSize={18} minSize={15} maxSize={25}>
              <aside className="h-full border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col">
                <div className="p-4 border-b border-border/50">
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {t("room.language")}
                  </h3>
                  <LanguageSelector
                    value={language}
                    onChange={handleLanguageChange}
                    disabled={!isOwner}
                  />
                </div>
                <div className="p-4 flex-1 overflow-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      {t("room.participants")} ({participants.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {participants.map((participant, index) => (
                      <button
                        key={participant.id}
                        onClick={() =>
                          handleParticipantClick(participant, index)
                        }
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-all group"
                        disabled={!isOwner || participant.id === currentUserId}
                      >
                        {participant.avatarUrl ? (
                          <img
                            src={participant.avatarUrl}
                            alt={participant.name}
                            className="w-9 h-9 rounded-full object-cover shadow-lg"
                          />
                        ) : (
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br ${participant.gradient} shadow-lg`}
                          >
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm flex-1 text-left">
                          {participant.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </Panel>
            <PanelResizeHandle className="w-1 bg-border/50 hover:bg-primary transition-colors" />
            <Panel defaultSize={82} minSize={40}>
              <PanelGroup direction="vertical" className="h-full">
                <Panel defaultSize={70} minSize={40}>
                  <main className="h-full flex flex-col">
                    <div className="flex-1 relative">
                      <Editor
                        height="100%"
                        language={languageMap[language] || language}
                        value={code}
                        onChange={(value) => {
                          setCode(value || "");
                        }}
                        theme={
                          theme === "dark"
                            ? "livecode-dark"
                            : "livecode-light"
                        }
                        beforeMount={(monaco) => {
                          monacoRef.current = monaco;
                          if (!completionRegisteredRef.current) {
                            const keywords: Record<string, string[]> = {
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
                            Object.entries(keywords).forEach(([lang, words]) => {
                              monaco.languages.registerCompletionItemProvider(lang, {
                                provideCompletionItems: () => ({
                                  suggestions: words.map((word) => ({
                                    label: word,
                                    kind: monaco.languages.CompletionItemKind.Keyword,
                                    insertText: word,
                                  })),
                                }),
                              });
                            });
                            completionRegisteredRef.current = true;
                          }
                          monaco.editor.defineTheme(
                            "livecode-dark",
                            darkTheme,
                          );
                          monaco.editor.defineTheme(
                            "livecode-light",
                            lightTheme,
                          );
                        }}
                        onMount={(editor, monaco) => {
                          editorRef.current = editor;
                          editor.onDidChangeCursorPosition((event) => {
                            if (wsRef.current?.readyState === WebSocket.OPEN) {
                              wsRef.current.send(
                                JSON.stringify({
                                  type: "cursor_change",
                                  line: event.position.lineNumber,
                                  column: event.position.column,
                                }),
                              );
                            }
                          });
                          monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
                            {
                              noSemanticValidation: false,
                              noSyntaxValidation: false,
                            },
                          );
                          monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
                            {
                              target:
                                monaco.languages.typescript
                                  .ScriptTarget.ES2020,
                              allowNonTsExtensions: true,
                              moduleResolution:
                                monaco.languages.typescript
                                  .ModuleResolutionKind.NodeJs,
                              module:
                                monaco.languages.typescript
                                  .ModuleKind.CommonJS,
                              noEmit: true,
                              esModuleInterop: true,
                              allowJs: true,
                            },
                          );
                          monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
                            {
                              noSemanticValidation: false,
                              noSyntaxValidation: false,
                            },
                          );
                          monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
                            {
                              target:
                                monaco.languages.typescript
                                  .ScriptTarget.ES2020,
                              allowNonTsExtensions: true,
                              moduleResolution:
                                monaco.languages.typescript
                                  .ModuleResolutionKind.NodeJs,
                              module:
                                monaco.languages.typescript
                                  .ModuleKind.CommonJS,
                              noEmit: true,
                              esModuleInterop: true,
                            },
                          );
                        }}
                        options={{
                          fontSize: 14,
                          fontFamily:
                            "'JetBrains Mono', 'Fira Code', monospace",
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
                    </div>
                  </main>
                </Panel>
                <PanelResizeHandle className="h-1 bg-border/50 hover:bg-primary transition-colors" />
                <Panel defaultSize={30} minSize={20} maxSize={55}>
                  {renderOutputPanel("border-t")}
                </Panel>
              </PanelGroup>
            </Panel>
          </PanelGroup>
      </div>

      <Modal
        isOpen={Boolean(kickTarget)}
        onClose={() => setKickTarget(null)}
        title={t("room.kickTitle")}
      >
        <p className="text-sm text-muted-foreground">
          {t("room.kickConfirm")}{" "}
          <span className="text-foreground font-medium">
            {kickTarget?.name}
          </span>
          ?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setKickTarget(null)}
          >
            {t("common.cancel")}
          </Button>
          <Button onClick={handleKick} disabled={!isOwner}>
            {t("room.kickAction")}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isEndSessionModalOpen}
        onClose={() => setIsEndSessionModalOpen(false)}
        title={t("room.closeLobby")}
      >
        <p className="text-sm text-muted-foreground">
          {t("room.closeLobbyConfirm")}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEndSessionModalOpen(false)}
          >
            {t("common.cancel")}
          </Button>
          <Button onClick={handleEndRoomSession}>
            {t("room.closeLobbyAction")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
