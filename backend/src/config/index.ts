import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  jwt: {
    secret: process.env.JWT_SECRET || "dev-jwt-secret",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  cors: {
    origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },

  oauth: {
    clientId: process.env.OAUTH_CLIENT_ID || "",
    clientSecret: process.env.OAUTH_CLIENT_SECRET || "",
    callbackUrl: process.env.OAUTH_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  },

  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};
