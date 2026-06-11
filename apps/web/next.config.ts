import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@synculariti/types',
    '@synculariti/validators',
    '@synculariti/translations',
    '@synculariti/whatsapp-client',
    '@synculariti/shared-utils',
    '@synculariti/shared-supabase',
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

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
