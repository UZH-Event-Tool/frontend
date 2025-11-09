const DEFAULT_BASE_URL = "http://localhost:4000";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL;

type JsonResult<T> = {
  data: T;
  response: Response;
};

async function requestJson<TResponse>(
  path: string,
  init: RequestInit = {},
): Promise<JsonResult<TResponse>> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);

  let parsed: unknown = null;
  try {
    parsed = await response.json();
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const message =
      typeof parsed === "object" &&
      parsed !== null &&
      "message" in parsed &&
      typeof (parsed as { message?: unknown }).message === "string"
        ? (parsed as { message: string }).message
        : response.statusText || "Request failed";

    throw new Error(message);
  }

  return { data: parsed as TResponse, response };
}

export async function fetchJson<TResponse>(
  path: string,
  init: RequestInit = {},
) {
  return requestJson<TResponse>(path, init);
}

export async function postJson<TResponse>(
  path: string,
  body: unknown,
  init: RequestInit = {},
): Promise<JsonResult<TResponse>> {
  return requestJson<TResponse>(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    body: JSON.stringify(body),
    ...init,
  });
}
