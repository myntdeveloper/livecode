const AUTH_TOKEN_KEY = "authToken";
const AUTH_PROVIDER_KEY = "authProvider";

export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
}

export function markAuthenticated(provider: "github") {
  localStorage.setItem(AUTH_TOKEN_KEY, `${provider}-session`);
  localStorage.setItem(AUTH_PROVIDER_KEY, provider);
}

export function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_PROVIDER_KEY);
}
