import type { NextConfig } from "next";

const supabaseStoragePattern = (() => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(supabaseUrl);

    return {
      protocol: parsedUrl.protocol.replace(":", "") as "http" | "https",
      hostname: parsedUrl.hostname,
      pathname: "/storage/v1/object/public/**",
    };
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  trailingSlash: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "strengthswriter.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(supabaseStoragePattern ? [supabaseStoragePattern] : []),
    ],
  },
};

export default nextConfig;
