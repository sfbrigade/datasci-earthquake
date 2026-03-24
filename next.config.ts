import { NextConfig } from "next";

const nextConfig: NextConfig = {
  watchOptions: {
    // Turbopack-specific polling for watch options (might be needed for e.g. Docker environments if host filesystem does not reliably notify of changes)
    // TODO: check if this is equivalent to WATCHPACK_POLLING environment variable
    pollIntervalMs: 1000, // Check for changes every 1 second
  },
  reactCompiler: true,
  productionBrowserSourceMaps: true,
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
    } else if (env === "prod" || env === "ci") {
      // For prod and ci, use the provided URL or empty string (same origin)
      // The provided backend base URL for preview and production is currently Railway.
      backendHost = backendBaseUrl || "";
    } else {
      throw new Error(
        `Unexpected ENVIRONMENT "${env}". Expected one of: local, dev_docker, prod, ci.`
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
