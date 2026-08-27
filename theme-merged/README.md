# DTCG export

`theme.tokens.json` is the source of truth for the design tokens. The initial
export was generated from the ejected Chakra theme. Only use the reverse export
below if you intentionally need to re-import changes made to the old ejected
files; it overwrites the DTCG source of truth.

```sh
npm run gen:dtcg-tokens
```

To compile the DTCG file into the Chakra token configuration consumed by
`styles/theme.ts`, run:

```sh
npm run gen:chakra-theme
```

`npm run build` compiles this generated module before type generation and the
Next.js build. Do not edit `styles/generated-dtcg-theme.ts` directly.

The export uses standard DTCG `$value`, `$type`, `$description`, and token
references. Color values are normalized to sRGB objects; dimensions and
durations become `{ value, unit }` objects; and Chakra's `_light` / `_dark`
semantic color conditions become `semantic.color.light` and
`semantic.color.dark`. Color values also include the standard six-digit `hex`
fallback; alpha remains the separate DTCG `alpha` value. The Chakra generator
uses these standard values directly; it does not use a per-token copy of the
original Chakra value.

Fractional Chakra scale keys are encoded with underscores in DTCG (for example,
`0_5` and `0_25`), because DTCG token names cannot contain periods. The Chakra
generator restores their original dot notation (`"0.5"`, `"0.25"`).

Chakra-only CSS values (for example `vw`, `auto`, `currentColor`, responsive
values, shadows expressed as CSS strings, assets, recipes, and keyframes) have
no DTCG equivalent. They are preserved, unchanged, under the
`$extensions.com.safehome.chakra-ui` namespace. The existing TypeScript theme
continues to be the Chakra runtime configuration, importing the generated token
module from `styles/generated-dtcg-theme.ts`.
