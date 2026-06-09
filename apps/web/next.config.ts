import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@synculariti/types',
    '@synculariti/validators',
    '@synculariti/translations',
    '@synculariti/whatsapp-client',
  ],
  async rewrites() {
    return [
      {
        source: "/ekasa-proxy/:match*",
        destination: "https://ekasa.financnasprava.sk/mdu/api/v1/opd/:match*",
      },
    ];
  },
};

export default nextConfig;
