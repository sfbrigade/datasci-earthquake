import { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack specific watch options (might be needed for Docker environments) (TODO: look into if it's actually needed)
  watchOptions: {
    pollIntervalMs: 1000, // Check for changes every 1 second
  },
  reactCompiler: true,
  productionBrowserSourceMaps: true,
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  rewrites: async () => {
    const env = process.env.ENVIRONMENT;
    let backendHost;

    if (env === "local") {
      backendHost = "http://127.0.0.1:8000"; // Local development backend
    } else if (env === "dev_docker") {
      backendHost = "http://backend:8000"; // In docker, the service name is used as the hostname
    } else {
      backendHost = ""; // In preview and production, the backend is served from the same origin
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
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              icon: true, // This is your desired option
            },
          },
        ],
        as: "*.js", // Important to tell Turbopack to treat as JS module
      },
    },
  },
};

export default nextConfig;
