import { postJson } from "./api";

export type AuthTokenPayload = {
  sub: string;
  universityEmail?: string;
  fullName?: string;
};

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

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return atob(padded);
}

export function getTokenPayload(): AuthTokenPayload | null {
  const token = getAuthToken();
  if (!token || typeof window === "undefined") {
    return null;
  }

  const segments = token.split(".");
  if (segments.length < 2) {
    return null;
  }

  try {
    const decoded = base64UrlDecode(segments[1]);
    return JSON.parse(decoded) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  const token = getAuthToken();

  try {
    if (!token) {
      return;
    }

    await postJson<unknown>(
      "/auth/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  } catch (error) {
    console.warn("Logout request failed", error);
    throw error;
  } finally {
    clearAuthToken();
  }
}
