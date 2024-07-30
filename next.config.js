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
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig