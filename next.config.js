/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  transpilePackages: ['@splinetool/react-spline', '@splinetool/runtime'],
}

module.exports = nextConfig