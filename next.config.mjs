/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

const buildConfig = () => {
  return nextConfig;
};

export default buildConfig();
