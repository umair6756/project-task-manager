import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(accessToken: string): Socket {
  socket?.disconnect();
  socket = io("/", { auth: { token: accessToken }, reconnection: true });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}
