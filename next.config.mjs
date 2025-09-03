/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: config => {
    config.module.rules.push({
      test: /\.css$/,
      resourceQuery: /raw/,
      type: 'asset/source',
    });
    return config;
  },
};
export default nextConfig;
