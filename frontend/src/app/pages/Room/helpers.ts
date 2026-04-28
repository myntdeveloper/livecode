import { AVATAR_GRADIENTS, CURSOR_COLORS } from "./constants";
import type { Participant } from "./types";

export const formatExecutionText = (text: string) =>
  text
    .replace(/^execution failed:[\s\S]*?stderr:\s*/i, "")
    .replace(/\r\n/g, "\n")
    .trim();

export const normalizeTerminalInput = (value: string) => {
  if (value.length === 0) {
    return "";
  }
  const withEscapedNewlines = value.replace(/\\n/g, "\n");
  return withEscapedNewlines.endsWith("\n")
    ? withEscapedNewlines
    : `${withEscapedNewlines}\n`;
};

export const buildParticipant = (
  userId: string,
  profiles: Record<string, { name?: string; avatar_url?: string }> | undefined,
  roomOwnerID: string | undefined,
  currentUserID: string,
  currentUserName: string,
  currentUserAvatar: string,
): Participant => {
  const indexSeed = userId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = indexSeed % CURSOR_COLORS.length;
  const isCurrentUser = userId === currentUserID;
  const profileName = profiles?.[userId]?.name?.trim();
  const fallbackName = profileName || `User ${userId.slice(0, 6)}`;
  const avatarUrl = isCurrentUser
    ? currentUserAvatar
    : profiles?.[userId]?.avatar_url;

  return {
    id: userId,
    name: isCurrentUser ? currentUserName : fallbackName,
    color: CURSOR_COLORS[index],
    gradient: AVATAR_GRADIENTS[index],
    online: true,
    avatarUrl,
    isAdmin: roomOwnerID === userId,
  };
};
