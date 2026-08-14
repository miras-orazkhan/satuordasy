import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No "output: standalone" — Vercel handles deployment automatically.
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  // The app may be served behind a cloud gateway that rewrites Host/Origin.
  // Server Actions in Next.js 16 reject requests where x-forwarded-host != origin.
  // List all known gateway hosts here.
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost',
        'localhost:3000',
        'localhost:81',
        'satuordasy.com',
        'www.satuordasy.com',
        'preview-chat-91e9baa3-b6cc-4f59-8c26-edd8b275b5a5.space-z.ai',
        'ws-ff-ae-a-fea-iepkghkhtz.cn-hongkong-vpc.fcapp.run',
        '*.space-z.ai',
        '*.fcapp.run',
        '*.vercel.app',
      ],
    },
  },
};

export default nextConfig;
