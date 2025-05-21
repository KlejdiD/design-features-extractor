/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Configure serverless function settings
  experimental: {
    serverComponentsExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  },

  // Configure the serverless function timeout (if supported by your hosting provider)
  serverRuntimeConfig: {
    maxDuration: 60, // 60 seconds
  },
};

export default nextConfig;
