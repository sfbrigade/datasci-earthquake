// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
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

    // Only add API rewrite if backendHost is defined
    if (backendHost) {
      rewrites.push({
        source: "/api/:path*",
        destination: `${backendHost}/api/:path*`,
      });
    }

    rewrites.push({
      source: "/docs",
      destination:
        process.env.NODE_ENV === "development"
          ? "http://127.0.0.1:8000/docs"
          : "/api/docs",
    });

    rewrites.push({
      source: "/openapi.json",
      destination:
        process.env.NODE_ENV === "development"
          ? "http://127.0.0.1:8000/openapi.json"
          : "/api/openapi.json",
    });

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

module.exports = nextConfig;
