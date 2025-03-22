
import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

// Create the next-intl plugin
const withNextIntl = createNextIntlPlugin();

// Combine the plugins by applying them sequentially
const buildConfig = () => {
  // First apply next-intl
  const withIntlConfig = withNextIntl(nextConfig);


  return withIntlConfig;
};

export default buildConfig();