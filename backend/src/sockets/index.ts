import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { SocketUser } from "../types";

const connectedUsers = new Map<string, SocketUser>();

export function initializeSocketIO(httpServer: HttpServer): Server {
  const socketOrigins = String(config.cors.origin ?? "")
    .split(",")
    .map((o: string) => o.trim())
    .filter(Boolean);

  const io = new Server(httpServer, {
    cors: {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || socketOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token || typeof token !== "string") {
      next(new Error("Authentication error"));
      return;
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; email: string; role: string };
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`[Socket.IO] User connected: ${user.email} (${socket.id})`);

    connectedUsers.set(socket.id, {
      userId: user.userId,
      socketId: socket.id,
      role: user.role,
    });

    socket.join(`user:${user.userId}`);

    socket.on("join_room", (room: string) => {
      socket.join(room);
    });

    socket.on("leave_room", (room: string) => {
      socket.leave(room);
    });

    socket.on("update_status", (status: { status: "ONLINE" | "BUSY" | "OFFLINE" }) => {
      io.emit("user:status_changed", {
        userId: user.userId,
        status: status.status,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket.IO] User disconnected: ${user.email} (${reason})`);
      connectedUsers.delete(socket.id);

      io.emit("user:status_changed", {
        userId: user.userId,
        status: "OFFLINE",
        timestamp: new Date().toISOString(),
      });
    });
  });

  return io;
}

export function emitToUser(io: Server, userId: string, event: string, data: any) {
  io.to(`user:${userId}`).emit(event, data);
}

export function emitToAll(io: Server, event: string, data: any) {
  io.emit(event, data);
}

export function broadcastStatusChange(io: Server, userId: string, status: string) {
  io.emit("user:status_changed", {
    userId,
    status,
    timestamp: new Date().toISOString(),
  });
}

export function getConnectedUsers() {
  return Array.from(connectedUsers.values());
}

export function isUserOnline(userId: string): boolean {
  return Array.from(connectedUsers.values()).some((u) => u.userId === userId);
}

export { connectedUsers };
