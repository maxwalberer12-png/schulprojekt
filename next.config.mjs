/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp', '@supabase/ssr', '@supabase/supabase-js'],
  },
};

export default nextConfig;
