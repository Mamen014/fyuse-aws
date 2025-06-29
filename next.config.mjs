/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fyuse-images.s3.ap-southeast-2.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.klingai.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's21-kling.klingai.com',
        pathname: '/**',
      },
      // Add other image hostnames here if you are using images from other domains
    ],
  },
};

export default nextConfig;