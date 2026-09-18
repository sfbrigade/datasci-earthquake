# Map snapshots

The server map services load allowlisted GeoJSON files from `public/data` in
all environments. They do not fetch the CDN or fall back to a same-origin API.
The home page and its parallel-route fallback (used by `/about` and `/prepare`)
require all four snapshots. Missing files, invalid JSON, invalid geometry, or
missing FEMA tract/risk properties reject the page render. Build failures identify
the file; later server-render failures propagate to Next's error handling rather
than displaying empty hazard layers.

Validation checks FeatureCollections, features, point/polygon coordinate structure,
closed rings, and FEMA tract identifiers and nullable risk properties. It does not
perform topology repair, recategorize risk, or constrain dataset feature counts.
An explicitly empty FeatureCollection is valid and distinct from a loading error.

This changes freshness: map snapshots update when a deployment carries new files,
replacing remote fetching with one-day revalidation. Browser point lookups still
use the existing same-origin `/api/...` routes and backend data. Map snapshots and
database responses can represent different generations indefinitely; this change
does not synchronize them. Publishing ETL files and deploying them remain separate
steps. CDN/API environment variables and backend routes are unchanged.

A production build on Node 24.18.0 with locked Next 16.3.3 classified `/`, `/about`,
and `/prepare` as static with `initialRevalidateSeconds: false`. Normal requests
serve their prerendered output without running the filesystem loader. Next also
included all four files in the relevant page output traces automatically, so no
`outputFileTracingIncludes` override was needed. Recheck these boundaries if routes
become dynamic, gain revalidation, or change deployment packaging. Local Next traces
are evidence about Next output, not a verification of a deployed Vercel function.

Regression checks:

```sh
npm test -- --runInBand app/api/__tests__ app/components/__tests__/hooks/useHazardDataFetcher.test.tsx
ENVIRONMENT=prod CI= NEXT_PUBLIC_CDN_URL=http://127.0.0.1:9/data NEXT_PUBLIC_API_URL=http://127.0.0.1:9/api npm run build
```

The second command deliberately makes the old remote data path unusable. Unrelated
build tooling and Google fonts can still require network access. Run builds in an
isolated copy if a development server is using the workspace.
