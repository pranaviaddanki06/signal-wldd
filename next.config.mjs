/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [{ source: '/', destination: '/final', permanent: false }];
  },
};
export default nextConfig;
