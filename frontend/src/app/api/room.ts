import { apiFetch } from "./client";

export interface RoomResponse {
  id: string;
  owner_id: string;
  code: string;
  language: string;
  created_at: string;
  status: string;
}

export const createRoom = async () => {
  const res = await apiFetch("/api/rooms", {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to create room");
  }

  return (await res.json()) as RoomResponse;
};

export const getRoomById = async (roomId: string) => {
  const res = await apiFetch(`/api/rooms/${roomId}`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Failed to load room");
  }
  return (await res.json()) as RoomResponse;
};

export const closeRoom = async (roomId: string) => {
  const res = await apiFetch(`/api/rooms/${roomId}/close`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error("Failed to close room");
  }
  return (await res.json()) as RoomResponse;
};

export const changeRoomLanguage = async (roomId: string, language: string) => {
  const res = await apiFetch(`/api/rooms/${roomId}/language`, {
    method: "POST",
    body: JSON.stringify({ language }),
  });
  if (!res.ok) {
    throw new Error("Failed to change room language");
  }
  return (await res.json()) as RoomResponse;
};

export const updateRoomCode = async (roomId: string, code: string) => {
  const res = await apiFetch(`/api/rooms/${roomId}/code`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    throw new Error("Failed to save room code");
  }
  return (await res.json()) as RoomResponse;
};
