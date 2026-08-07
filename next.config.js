/** @type {import('next').NextConfig} */
const nextConfig = {
  // La aplicación oficial local es el CRM legacy servido por Live Server
  // en 127.0.0.1:5500. Evita que la versión Next experimental se use por
  // accidente desde localhost:3000.
  async redirects() {
    return [{ source: '/:path*', destination: 'http://127.0.0.1:5500/:path*', permanent: false }];
  },
};

module.exports = nextConfig;
