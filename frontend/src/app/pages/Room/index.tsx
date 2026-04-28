import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Copy,
  Settings,
} from "lucide-react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { Button } from "../../components/ui/Button";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  defaultCode,
} from "../../utils/languageConfig";
import {
  changeRoomLanguage,
  closeRoom,
  execute,
  getProfile,
  getRoomById,
  type RoomResponse,
  updateRoomCode,
} from "./api";
import { buildParticipant, formatExecutionText, normalizeTerminalInput } from "./helpers";
import type { Participant, WsMessage } from "./types";
import { RoomHeader } from "./components/RoomHeader";
import { RoomSidebar } from "./components/RoomSidebar";
import { OutputPanel } from "./components/OutputPanel";
import { RoomModals } from "./components/RoomModals";
import { EditorCode } from "./components/EditorCode";

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
  const codeLoadedRef = useRef(false);

  const isOwner = Boolean(room?.owner_id && room.owner_id === currentUserId);

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
              room?.owner_id,
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
        codeLoadedRef.current = true;
        setParticipants([
          buildParticipant(
            user.id,
            undefined,
            roomResponse.owner_id,
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
    if (!room?.id || !codeLoadedRef.current) {
      return;
    }
    const timer = setTimeout(() => {
      void updateRoomCode(room.id, code);
    }, 600);
    return () => clearTimeout(timer);
  }, [room?.id, code]);

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

  const isWaitingForMoreInput = (text: string) =>
    /EOFError:\s*EOF when reading a line/i.test(text) ||
    /unexpected end of input/i.test(text) ||
    /end of file/i.test(text) ||
    /No line found/i.test(text);

  const stripEofTrace = (text: string) =>
    text
      .split("\n")
      .filter((line) => !/traceback|file ".*main\.py"|eoferror:/i.test(line))
      .join("\n")
      .trim();

  const runCode = async () => {
    const mergedInput = [...terminalInputQueue];
    if (terminalInput.length > 0) {
      mergedInput.push(terminalInput);
    }
    const inputToRun = normalizeTerminalInput(mergedInput.join("\n"));
    try {
      const result = await execute(language, code, inputToRun);
      const stdoutText = result.output || result.stdout || "";
      const stderrText = result.error || result.stderr || "";
      const detectionText = [stdoutText, stderrText].filter(Boolean).join("\n");
      const waitingInput = isWaitingForMoreInput(detectionText);
      const isError = (Boolean(stderrText) || Boolean(result.timeout)) && !waitingInput;
      const normalizedOutput = waitingInput
        ? stdoutText || t("room.runPlaceholder")
        : stdoutText || stderrText || t("room.runPlaceholder");
      const formattedOutput = formatExecutionText(normalizedOutput);
      const finalOutput = waitingInput ? stripEofTrace(formattedOutput) : formattedOutput;
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
      if (!waitingInput) {
        setTerminalInputQueue([]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Execution failed";
      const formattedOutput = formatExecutionText(message);
      const waitingInput = isWaitingForMoreInput(formattedOutput);
      const finalOutput = waitingInput ? stripEofTrace(formattedOutput) : formattedOutput;
      setOutput(finalOutput);
      setIsOutputError(!waitingInput);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "run_output",
            output: finalOutput,
            is_error: !waitingInput,
          }),
        );
      }
      if (!waitingInput) {
        setTerminalInputQueue([]);
      }
    } finally {
      setTerminalInput("");
    }
  };

  const clearTerminal = () => {
    setOutput("");
    setIsOutputError(false);
    setTerminalInput("");
    setTerminalInputQueue([]);
  };

  const enqueueTerminalInputLine = () => {
    const value = terminalInput;
    if (value.length === 0) {
      return;
    }
    setTerminalInputQueue((prev) => [...prev, value]);
    setOutput((prev) => (prev ? `${prev}\n> ${value}` : `> ${value}`));
    setIsOutputError(false);
    setTerminalInput("");
    setTimeout(() => {
      void runCode();
    }, 0);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <RoomHeader
        roomId={room?.id || roomId || ""}
        copied={copied}
        isOwner={isOwner}
        theme={theme}
        onCopy={copyRoomLink}
        onCloseRoom={() => setIsEndSessionModalOpen(true)}
        onHome={() => navigate("/")}
        onToggleTheme={toggleTheme}
        t={t}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden pt-2">
          <PanelGroup direction="horizontal" className="h-full">
            <Panel defaultSize={18} minSize={15} maxSize={25}>
              <RoomSidebar
                language={language}
                participants={participants}
                isOwner={isOwner}
                currentUserId={currentUserId}
                onLanguageChange={handleLanguageChange}
                onParticipantClick={handleParticipantClick}
                t={t}
              />
            </Panel>
            <PanelResizeHandle className="w-1 bg-border/50 hover:bg-primary transition-colors" />
            <Panel defaultSize={82} minSize={40}>
              <PanelGroup direction="vertical" className="h-full">
                <Panel defaultSize={70} minSize={40}>
                  <main className="h-full flex flex-col">
                    <div className="flex-1 relative">
                      <EditorCode
                        code={code}
                        language={language}
                        theme={theme}
                        completionRegisteredRef={completionRegisteredRef}
                        editorRef={editorRef}
                        monacoRef={monacoRef}
                        onCodeChange={setCode}
                        onCursorChange={(line, column) => {
                          if (wsRef.current?.readyState === WebSocket.OPEN) {
                            wsRef.current.send(
                              JSON.stringify({
                                type: "cursor_change",
                                line,
                                column,
                              }),
                            );
                          }
                        }}
                      />
                    </div>
                  </main>
                </Panel>
                <PanelResizeHandle className="h-1 bg-border/50 hover:bg-primary transition-colors" />
                <Panel defaultSize={30} minSize={20} maxSize={55}>
                  <OutputPanel
                    borderClassName="border-t"
                    output={output}
                    isOutputError={isOutputError}
                    terminalInput={terminalInput}
                    terminalInputQueue={terminalInputQueue}
                    onTerminalInputChange={setTerminalInput}
                    onTerminalInputSubmit={enqueueTerminalInputLine}
                    onRun={() => {
                      void runCode();
                    }}
                    onClear={clearTerminal}
                    t={t}
                  />
                </Panel>
              </PanelGroup>
            </Panel>
          </PanelGroup>
      </div>

      <RoomModals
        kickTarget={kickTarget}
        isOwner={isOwner}
        isEndSessionModalOpen={isEndSessionModalOpen}
        onKickCancel={() => setKickTarget(null)}
        onKickConfirm={handleKick}
        onEndSessionCancel={() => setIsEndSessionModalOpen(false)}
        onEndSessionConfirm={handleEndRoomSession}
        t={t}
      />
    </div>
  );
}
