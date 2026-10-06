import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '172.24.44.7',
    '*.loca.lt',
    '*.ngrok-free.app',
    '*.trycloudflare.com',
  ],
};

export default nextConfig;
