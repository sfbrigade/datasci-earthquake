# SafeHome design-token sources

Normal theme generation has three authoritative inputs:

- `theme.tokens.json` is the portable DTCG Format 2025.10 document. It contains primitives, non-contextual semantic tokens, and the default/light value of contextual semantic tokens.
- `theme.resolver.json` is the DTCG Resolver 2025.10 document. It identifies theme-contextual tokens and supplies dark values at the same token paths.
- `theme.chakra.json` is the versioned Chakra/Web supplement validated by `theme.chakra.schema.json`. It owns CSS-only token values and explicit platform bindings such as the `next/font` CSS variables.

`theme.report.json` is a deterministic migration report. It provides accounting, path mappings, reasons for platform-only dispositions, and diagnostics, but is never an input to runtime theme generation.

Compile the three authority inputs into the Chakra definitions consumed by `styles/theme.ts`:

```sh
npm run gen:chakra-theme
```

`npm run build` runs this forward compiler before Chakra type generation. Do not edit `styles/generated-dtcg-theme.ts` directly.

The ejected files under `tokens/` and `semantic-tokens/` are migration inputs only. To intentionally overwrite all four JSON artifacts from those old sources, run:

```sh
npm run gen:dtcg-tokens
```

This reverse import is deliberately not part of the normal build.

Chakra `DEFAULT` is represented by the reserved DTCG `$root` token segment. Fractional Chakra keys use underscores in DTCG (`0_5`, `0_25`) and are restored to dot notation during Chakra generation. Only `px` and `rem` values are emitted as DTCG dimensions; CSS percentages, viewport units, intrinsic sizes, keywords, animation strings, gradient geometry, assets, and values that cannot be losslessly parsed remain in the Chakra supplement.
