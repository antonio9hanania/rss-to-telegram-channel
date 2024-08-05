// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "cache-control: public, max-age=0, must-revalidate",
          },

          {
            key: "X-Vercel-Cache",
            value: "BYPASS",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
