import { useAuthStore } from "@/stores/authStore";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string | undefined,
    message: string,
  ) {
    super(message);
  }
}

interface Envelope<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
}

// Serializes concurrent 401s onto a single refresh call so a burst of
// requests doesn't rotate the refresh token multiple times (each rotation
// invalidates the previous refresh token server-side).
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, user, setSession, clear } = useAuthStore.getState();
  if (!refreshToken) return null;
  if (!refreshInFlight) {
    refreshInFlight = fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) {
          clear();
          return null;
        }
        const body = (await res.json()) as Envelope<{ accessToken: string; refreshToken: string }>;
        if (user) setSession(user, body.data.accessToken, body.data.refreshToken);
        return body.data.accessToken;
      })
      .catch(() => {
        clear();
        return null;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken;
  const headers = new Headers(init.headers);
  // Let the browser set multipart/form-data (with boundary) itself for
  // FormData bodies — forcing JSON here would break file uploads.
  if (!(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const res = await fetch(`/api${path}`, { ...init, headers });

  if (res.status === 401 && !retried) {
    const newToken = await refreshAccessToken();
    if (newToken) return apiFetch<T>(path, init, true);
  }

  const body = (await res.json().catch(() => null)) as Envelope<T> | null;
  if (!res.ok || !body?.success) {
    throw new ApiError(res.status, body?.error?.code, body?.error?.message ?? res.statusText);
  }
  return body.data;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, json?: unknown) =>
    apiFetch<T>(path, { method: "POST", body: json instanceof FormData ? json : json ? JSON.stringify(json) : undefined }),
  patch: <T>(path: string, json?: unknown) => apiFetch<T>(path, { method: "PATCH", body: json ? JSON.stringify(json) : undefined }),
  put: <T>(path: string, json?: unknown) => apiFetch<T>(path, { method: "PUT", body: json ? JSON.stringify(json) : undefined }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
