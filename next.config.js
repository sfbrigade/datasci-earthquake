// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/:path*"
            : "/api/",
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
  // TODO FIXME:
  // ⚠ Webpack is configured while Turbopack is not, which may cause problems.
  // ⚠ See instructions if you need to configure Turbopack:
  // https://nextjs.org/docs/app/api-reference/next-config-js/turbopack#configuration
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
