import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  // The app is served behind a Caddy + cloud gateway that rewrites Host/Origin.
  // Server Actions in Next.js 16 reject requests where x-forwarded-host != origin,
  // which broke all server actions (lead submit, status changes, file uploads).
  // allowRefererOrigin lets Server Actions accept these forwarded requests.
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost',
        'localhost:3000',
        'localhost:81',
        'preview-chat-91e9baa3-b6cc-4f59-8c26-edd8b275b5a5.space-z.ai',
        'ws-ff-ae-a-fea-iepkghkhtz.cn-hongkong-vpc.fcapp.run',
        '*.space-z.ai',
        '*.fcapp.run',
      ],
    },
  },
};

export default nextConfig;
