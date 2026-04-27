import { apiFetch } from "./client";

export interface UserResponse {
  user: {
    id: string;
    name: string;
    surname: string;
    login: string;
    avatar_url: string;
  };
}

interface UpdateUserResponse {
  user: {
    id: string;
    name: string;
    surname: string;
    login: string;
    avatar_url: string;
  };
}

export const getProfile = async () => {
  const res = await apiFetch("/api/user/me");

  if (!res.ok) {
    throw new Error("Failed to load profile");
  }

  return (await res.json()) as UserResponse;
};

export const updateProfileName = async (name: string, surname: string) => {
  const res = await apiFetch("/api/user/name", {
    method: "PUT",
    body: JSON.stringify({ name, surname }),
  });

  if (!res.ok) {
    throw new Error("Failed to update profile");
  }

  return (await res.json()) as UpdateUserResponse;
};
