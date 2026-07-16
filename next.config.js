/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Archive.org — provedor inicial de armazenamento de vídeos
      { protocol: 'https', hostname: '*.archive.org' },
      { protocol: 'https', hostname: 'archive.org' },
      // Supabase Storage (capas, posters, avatars)
      { protocol: 'https', hostname: '*.supabase.co' },
      // Raw assets do GitHub (ex.: logotipo)
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

module.exports = withPWA(nextConfig);
