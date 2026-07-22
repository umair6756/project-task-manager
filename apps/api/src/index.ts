import http from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDb } from "./db/connect.js";
import { verifyAccessToken } from "./modules/auth/tokens.js";
import { createAgenda } from "./jobs/agenda.js";

async function main(): Promise<void> {
  await connectDb();

  const app = createApp();
  const server = http.createServer(app);

  // WHAT: Socket.io rooms per userId (CLAUDE.md §3 realtime rule). Frontend
  // subscribes from Phase 9+; for now this just authenticates the socket
  // and joins the room so later phases can `io.to(userId).emit(...)`.
  const io = new SocketIOServer(server, { cors: { origin: env.CLIENT_ORIGIN } });
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("unauthorized"));
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });
  io.on("connection", (socket) => {
    socket.join(socket.data.userId as string);
  });

  createAgenda(io);

  server.listen(env.PORT, () => {
    logger.info(`FlowForge API listening on :${env.PORT} (docs at /docs)`);
  });
}

main().catch((err) => {
  logger.error({ err }, "fatal startup error");
  process.exit(1);
});
