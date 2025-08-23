import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    // Allow data URIs
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
  },
};

export default nextConfig;
