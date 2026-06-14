import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  transpilePackages: [
    '@synculariti/types',
    '@synculariti/validators',
    '@synculariti/translations',
    '@synculariti/whatsapp-client',
    '@synculariti/shared-utils',
    '@synculariti/shared-supabase',
  ],
};

export default nextConfig;
