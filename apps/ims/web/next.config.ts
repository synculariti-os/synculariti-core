import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@synculariti/types',
    '@synculariti/validators',
    '@synculariti/translations',
  ],
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
