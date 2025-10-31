export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("authToken");
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem("authToken", token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem("authToken");
}
