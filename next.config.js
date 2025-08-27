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
      backendHost = "http://127.0.0.1:8000";
    } else if (env === "dev_docker") {
      backendHost = "http://backend:8000";
    } else {
      backendHost = "";
    }

    return [
      {
        source: "/api/:path*",
        destination:
          backendHost === "" ? "/api/:path*" : `${backendHost}/api/:path*`,
      },
      {
        source: "/docs",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/docs"
            : "/api/docs",
      },
      {
        source: "/openapi.json",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/openapi.json"
            : "/api/openapi.json",
      },
    ];
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
