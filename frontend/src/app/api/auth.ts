import { apiFetch } from "./client";

export const loginGithub = () => {
  window.location.href = "/api/auth/github";
};

export const logoutRequest = async () => {
  const res = await apiFetch("/api/auth/logout", {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to logout");
  }
};
