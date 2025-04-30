/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Configure SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });

    return config;
  },
};

module.exports = nextConfig; 