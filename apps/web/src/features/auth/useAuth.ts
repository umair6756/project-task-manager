import { useMutation } from "@tanstack/react-query";
import type { LoginInput, RegisterInput } from "@flowforge/shared";
import { api } from "@/lib/apiClient";
import { useAuthStore, type AuthUser } from "@/stores/authStore";
import { connectSocket, disconnectSocket } from "@/lib/socket";

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

function applySession(res: AuthResponse): void {
  useAuthStore.getState().setSession(res.user, res.accessToken, res.refreshToken);
  connectSocket(res.accessToken);
}

export function useLogin() {
  return useMutation({
    mutationFn: (input: LoginInput) => api.post<AuthResponse>("/auth/login", input),
    onSuccess: applySession,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => api.post<AuthResponse>("/auth/register", input),
    onSuccess: applySession,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => api.post<{ sent: boolean }>("/auth/forgot-password", { email }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { token: string; password: string }) => api.post<{ reset: boolean }>("/auth/reset-password", input),
  });
}

export function useLogout(): () => void {
  return () => {
    const { refreshToken, clear } = useAuthStore.getState();
    if (refreshToken) void api.post("/auth/logout", { refreshToken }).catch(() => {});
    disconnectSocket();
    clear();
  };
}
