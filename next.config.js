/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: { domains: ["clips.jimmyboy.tv", "cdn.7tv.app", "twitch.tv", "clips-media-assets2.twitch.tv"] },
}

module.exports = nextConfig
