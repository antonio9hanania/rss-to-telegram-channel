// const path = require('path')

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   sassOptions: {
//     includePaths: [path.join(__dirname, 'src', 'styles')],
//   },
//   env: {
//     TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
//     TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
//   },
// }

// module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
