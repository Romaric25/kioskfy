import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(import.meta.dirname, ".."),
  },
  reactCompiler: true,
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.dealafrique.com",
      },
      {
        protocol: "https",
        hostname: "dealafrique.com",
      },
      {
        protocol: "https",
        hostname: "storage.dealafrique.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "media.dealafrique.com",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    formats: ["image/webp"],
  },
  async rewrites() {
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
    const laboUrl = process.env.NEXT_PUBLIC_LABO_URL;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    const adminHost = adminUrl ? new URL(adminUrl).hostname : "admin.kioskfy.com";
    const laboHost = laboUrl ? new URL(laboUrl).hostname : "labo.kioskfy.com";
    const appHost = appUrl ? new URL(appUrl).hostname : "app.kioskfy.com";

    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: appHost,
          },
        ],
        destination: "/:path*",
      },
      {
        source: "/admin/:path*",
        has: [
          {
            type: "host",
            value: adminHost,
          },
        ],
        destination: "/admin/:path*",
      },
      {
        source: "/organization/:path*",
        has: [
          {
            type: "host",
            value: laboHost,
          },
        ],
        destination: "/organization/:path*",
      },
      // Localhost fallback/dev support
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "localhost",
          },
        ],
        destination: "/:path*",
      },
      {
        source: "/admin/:path*",
        has: [
          {
            type: "host",
            value: "localhost",
          },
        ],
        destination: "/admin/:path*",
      },
      {
        source: "/organization/:path*",
        has: [
          {
            type: "host",
            value: "localhost",
          },
        ],
        destination: "/organization/:path*",
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);

