import { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  rewrites: async () => {
    const env = process.env.ENVIRONMENT;
    const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    let backendHost;

    if (env === "local") {
      backendHost = "http://127.0.0.1:8000"; // Local development backend
    } else if (env === "dev_docker") {
      backendHost = "http://backend:8000"; // In docker, the service name is used as the hostname
    } else if (env === "prod") {
      if (!backendBaseUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is required in preview/production for API rewrites."
        );
      }
      backendHost = backendBaseUrl; // Use the provided backend base URL for preview and production (currently Railway)
    } else {
      throw new Error(
        `Unexpected ENVIRONMENT "${env}". Expected one of: local, dev_docker, prod.`
      );
    }

    const rewrites = [];

    // Only add API rewrite if backendHost is defined. Docs and openapi.json are available for devs only.
    if (backendHost) {
      rewrites.push(
        {
          source: "/api/:path*",
          destination: `${backendHost}/api/:path*`,
        },
        {
          source: "/docs",
          destination: `${backendHost}/docs`,
        },
        {
          source: "/openapi.json",
          destination: `${backendHost}/openapi.json`,
        }
      );
    }

    return rewrites;
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            icon: true, // Optional: Optimize for icon usage
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
