# SafeHome design-token sources

Normal theme generation has three authoritative inputs:

- `theme.tokens.json` is the portable DTCG Format 2025.10 document. It contains primitives, non-contextual semantic tokens, and the default/light value of contextual semantic tokens.
- `theme.resolver.json` is the DTCG Resolver 2025.10 document. It identifies theme-contextual tokens and supplies dark values at the same token paths.
- `theme.chakra.json` is the versioned Chakra/Web supplement validated by `theme.chakra.schema.json`. It owns CSS-only token values and explicit platform bindings such as the `next/font` CSS variables.

`theme.report.json` is a deterministic migration report. It provides accounting, exact source-token snapshots, path mappings, reasons for platform-only dispositions, and diagnostics. The round-trip tests use those snapshots as migration evidence because the old ejected source files are not committed. The report is never an input to forward or runtime theme generation.

Compile the three authority inputs into the Chakra definitions consumed by `styles/theme.ts`:

```sh
npm run gen:chakra-theme
```

`npm run build` first runs the design-token tests, then runs this forward compiler before Chakra type generation. The tests validate all three authority files against pinned schemas, prove every migrated source leaf has an equivalent compiled Chakra leaf, and require the committed generated TypeScript to match a pure in-memory render. Do not edit `styles/generated-dtcg-theme.ts` directly.

The ejected files under `tokens/` and `semantic-tokens/` are migration inputs only. To intentionally overwrite all four JSON artifacts from those old sources, run:

```sh
npm run gen:dtcg-tokens
```

This reverse import is deliberately not part of the normal build.

Chakra `DEFAULT` is represented by the reserved DTCG `$root` token segment. Fractional Chakra keys use underscores in DTCG (`0_5`, `0_25`) and are restored to dot notation during Chakra generation. Only `px` and `rem` values are emitted as DTCG dimensions; CSS percentages, viewport units, intrinsic sizes, keywords, animation strings, gradient geometry, assets, and values that cannot be losslessly parsed remain in the Chakra supplement.

## SafeHome Chakra adapter subset

The authority files conform to the broader DTCG specifications, but the local Chakra adapter intentionally supports only the constructs used by this theme:

- aliases written as DTCG curly references or JSON Pointer references;
- structured `srgb` colors with three numeric components and optional numeric alpha;
- `px`/`rem` dimensions and `ms`/`s` durations;
- font-family arrays, numeric values and font weights, stroke-style strings, four-number cubic Bézier arrays, and complete border composites;
- light/dark overrides in the pinned Resolver 2025.10 shape documented above.

Valid DTCG constructs outside that subset are rejected with the token path and unsupported construct instead of being silently altered. In particular, the adapter currently rejects non-sRGB color spaces and nonnumeric color components such as `"none"`. CSS-specific values belong in `theme.chakra.json`, where their Chakra representation is kept exactly.

The official Format and Resolver schemas are vendored for offline validation. Their pinned URLs, checksums, and refresh procedure are in [`scripts/schemas/dtcg/README.md`](../scripts/schemas/dtcg/README.md).
