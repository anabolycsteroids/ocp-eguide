import type { NextConfig } from "next";

const LAN_IP = process.env.LAN_IP || "";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...(LAN_IP ? [`http://${LAN_IP}:3000`] : []),
  ],
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        // Static map dataset — cacheable; SWR keeps deployments fresh safely.
        source: "/assets/map/:file",
        headers: [{ key: "Cache-Control", value: "public, max-age=300, stale-while-revalidate=86400" }],
      },
      {
        source: "/assets/map/:file(.*)\\.jpg",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
