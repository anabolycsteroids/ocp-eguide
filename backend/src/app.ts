import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { config } from "./config";
import { swaggerSpec } from "./config/swagger";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet());

const allowedOrigins = String(config.cors.origin ?? "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin/no-origin (curl, health checks) and configured origins.
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: { code: "TOO_MANY_REQUESTS", message: "Too many requests, please try again later" },
  },
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Stricter limiter for credential endpoints (brute-force protection).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: "TOO_MANY_REQUESTS", message: "Too many attempts, please try again later" },
  },
});

if (config.nodeEnv !== "production") {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "OCP e-Guide API Documentation",
  }));

  app.get("/api/docs/json", (_req, res) => {
    res.json(swaggerSpec);
  });
}

app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "healthy", timestamp: new Date().toISOString() } });
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.use("/api", routes);

app.use(errorHandler);

export default app;
