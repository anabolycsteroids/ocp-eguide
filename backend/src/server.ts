import http from "http";
import app from "./app";
import { config } from "./config";
import { prisma } from "./config/database";
import { initializeSocketIO } from "./sockets";

const server = http.createServer(app);

const io = initializeSocketIO(server);

(app as any).io = io;

async function start() {
  try {
    await prisma.$connect();
    console.log("[Database] PostgreSQL connected");

    server.listen(config.port, () => {
      console.log(`[Server] Running on port ${config.port}`);
      console.log(`[Server] Environment: ${config.nodeEnv}`);
      console.log(`[API] http://localhost:${config.port}/api`);
      console.log(`[Docs] http://localhost:${config.port}/api/docs`);
      console.log(`[Socket.IO] ws://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("[Server] Failed to start:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log("\n[Server] Shutting down...");
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});

start();
