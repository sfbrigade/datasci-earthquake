import { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  watchOptions: {
    // Turbopack-specific polling for watch options (might be needed for e.g. Docker environments if host filesystem does not reliably notify of changes)
    // TODO: check if this is equivalent to WATCHPACK_POLLING environment variable
    pollIntervalMs: 1000, // Check for changes every 1 second
  },
  reactCompiler: true,
  // NOTE: productionBrowserSourceMaps disabled — source maps increase the JS transfer
  // size visible to users and measurably hurt Lighthouse performance scores. Use server-side
  // error tracking (Sentry, etc.) with source maps uploaded out-of-band instead.
  experimental: {
    optimizePackageImports: [
      "@chakra-ui/react",
      "react-icons",
      "framer-motion",
    ],
  },
  modularizeImports: {
    "react-icons/?(((\\w*)?/?)*)": {
      transform: "react-icons/{{ matches.[1] }}/{{member}}",
      skipDefaultConversion: true,
    },
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

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);
