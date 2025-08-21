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

module.exports = nextConfig;

// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(module.exports, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "sfcivictech",
  project: "safehome-frontend",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
