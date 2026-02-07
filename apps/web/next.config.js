/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Proxy API requests to backend
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    // Ensure URL has protocol
    let destination;
    if (apiUrl) {
      // Add https:// if missing
      destination = apiUrl.startsWith('http://') || apiUrl.startsWith('https://')
        ? `${apiUrl}/api/:path*`
        : `https://${apiUrl}/api/:path*`;
    } else {
      destination = 'http://localhost:3001/api/:path*';
    }
    
    return [
      {
        source: '/api/:path*',
        destination,
      },
    ];
  },
}

module.exports = nextConfig
