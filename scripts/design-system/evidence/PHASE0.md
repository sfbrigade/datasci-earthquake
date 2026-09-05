# Design-system evidence Phase 0

Phase-0 spike for issue #1029. This branch does not change SafeHome product behavior, `styles/theme.ts`, or the standalone theme mapper.

## Authority

- Base branch: `develop`
- Base commit: `ba9e0ab536b278f7f48196ea75dda852b4e0905e`
- Base tree: `a3df8ced81ea2dacf9e00b8990578bf82f3561b4`
- Toolchain observed in CI: Node 24.18.0, TypeScript 6.0.2, Chakra UI 3.36.1
- Accepted Phase-0 run: GitHub Actions `33937200100`
- Accepted artifact: `9960580684`
- Artifact SHA-256: `c71275ab5e13414f10d279bbdea04e962aa5b6fdf1e68c0bc88de774ab8f78e3`

The benchmark oracle is the previously reviewed B1 slice from the correctness-hardened mapper: 10 files, 40 sites, 116 facts (108 explicit Exact, 2 recipe-default Exact, 4 Possible, 2 Unresolved).

## Results

### 1. TypeScript source extraction

The zero-new-dependency TypeScript AST prototype recovered all known B1 source facts that it is intended to score:

- explicit Exact: **108 / 108**
- Possible/bounded: **4 / 4**
- Unresolved sites: **2 / 2**
- recipe defaults: intentionally excluded from AST scoring; handled as Chakra semantic implications

The prototype emits 284 raw facts on the 10-file corpus (255 exact, 6 bounded, 23 unresolved). Therefore the result above is a **recall result against the known oracle, not a whole-repository precision score**. Raw facts must still be classified through Chakra semantics before becoming usage claims.

### 2. TypeScript-native module reachability

Using SafeHome's own `tsconfig.json` (`moduleResolution: bundler`, `@/*` path mapping) and an explicit phase-0 Next App Router entrypoint policy:

- TypeScript/JavaScript source files considered in the accepted run: **99** (includes the Phase-0 hostile fixture)
- `app-source` files: **66**
- product-reachable `app-source` files: **58 / 66**
- internal-demo-reachable files: **25 / 99**
- unresolved local code imports: **0**
- asset dependencies classified separately: **5**

All six reviewed sentinels pass, including:

- `address-mapper.tsx`: product reachable
- `card-hazard.tsx`: product reachable
- `share.tsx`: not product reachable, but internal-demo reachable
- `components-test-lib/page.tsx`: internal-demo entrypoint, not product entrypoint

Reachability is a claim under `safehome-next16-app-router-phase0.v1`, not a universal runtime claim.

### 3. Typed evidence outside JSX

The TypeChecker can identify Chakra-bearing contextual types outside JSX:

- `app/data/data.ts` `iconColor` values (`grey.400`, `orange`, `tsunamiBlue`) have a Chakra color `ConditionalValue<...>` contextual type.
- `emergency-kit-steps.tsx` typed `iconColor` and `iconBackground` literals resolve directly to Chakra `ColorsToken` contextual types.

All **4 / 4** TypeChecker sentinels pass. This supports a whole-source evidence analyzer rather than a JSX-only scanner.

### 4. Controlled Chakra semantic evaluation

Loading the exact SafeHome Chakra system in an isolated probe succeeded for **13 / 13** semantic probes and was byte-deterministic across repeated executions.

Useful observed behavior:

- `system.token("colors.blue.text")` resolves to the SafeHome value.
- `textStyle: "textSmall"` expands through `fonts.body`, `fontSizes.sm`, and `fontWeights.normal` CSS variables.
- `layerStyle: "text"` expands through `colors.grey.900`.
- `p: "4"`, `fontWeight: "bold"`, and `zIndex: "docked"` transform to token-backed CSS variables.
- `display: "flex"` and `position: "absolute"` remain literal values rather than being misclassified as token references.
- `colorPalette: "blue"` expands into virtual palette bindings and remains distinct from one concrete color-token reference.
- `system.getRecipe("button")` exposes the exact Chakra 3.36.1 defaults `size=md`, `variant=solid`.
- the active token dictionary contains 593 flattened token entries across the observed categories.
- `system.utility.getTypes()` exposes utility/token-domain information suitable for classifying token-bearing props.

Source abstractions remain primary evidence; transformed CSS is semantic expansion, not a replacement for source provenance.

### 5. Hostile semantic-classification fixture

The Phase-0 classifier deliberately mixes token-backed values, ordinary CSS literals, named styles, recipe defaults, nested pseudo-style objects, dynamic expressions, and `colorPalette` context.

All **16 / 16** semantic sentinels pass:

- `p="4"` -> explicit `spacing.4`
- `color="blue.text"` -> explicit `colors.blue.text`
- `fontWeight="bold"` -> explicit `fontWeights.bold`
- `zIndex="docked"` -> explicit `zIndex.docked`
- `display="flex"` -> style literal, **not** a token reference
- `position="absolute"` -> style literal, **not** a token reference
- `textStyle="textSmall"` remains an explicit named text-style abstraction
- `layerStyle="text"` remains an explicit named layer-style abstraction
- `textStyle.textSmall` semantically expands through `fonts.body`, `fontSizes.sm`, and `fontWeights.normal`
- bare `Button` defaults are semantic implications, not explicit source facts
- explicit Button variants are distinguished and suppress corresponding defaults
- dynamic color and spacing expressions remain unresolved with their respective token domains
- nested `_hover.color="grey.400"` resolves to `colors.grey.400`
- `colorPalette="blue"` remains palette context rather than a direct concrete-token fact

The fixture emits 14 evidence facts, 5 explicit token facts, 2 non-token style literals, and 2 domain-specific unresolved facts. This is a **hostile fixture precision test**, not a measured whole-repository precision rate.

### 6. Determinism

The workflow executes each canonical prototype twice and byte-compares its JSON:

- source extraction: deterministic
- module reachability: deterministic
- TypeChecker probe: deterministic
- Chakra semantic probe: deterministic
- hostile semantic classifier: deterministic

## Challenger tools

### Knip

Knip 6.34.0 was run ephemerally in `--production` mode and was **not added to `package.json`**.

It independently corroborated important source-only/orphan candidates such as:

- `layout-height-constrained.tsx`
- `layout-responsive.tsx`
- `mobile-report-hazards.tsx`
- `snippets/legend-clicked-context.tsx`

Knip does not preserve our needed product-vs-internal-demo distinction: for example `share.tsx` is reachable from the real `components-test-lib` Next route, so a single production/unused verdict is less informative than our realm-aware reachability facts.

Knip also reports unrelated dependency/export hygiene findings. Those are outside this spike and are not evidence authority for the design-system mapper.

### dependency-cruiser

Not adopted or run in Phase 0. The TypeScript-native graph currently has zero unresolved local code imports, all reviewed reachability sentinels pass, and Knip independently corroborates the high-value source-only cases. dependency-cruiser has therefore not yet demonstrated a correctness advantage that justifies another canonical graph engine. Revisit if hostile fixtures or real repository patterns expose a graph gap.

### Panda CSS

Not adopted or run in Phase 0. TypeScript recovered the complete known B1 source oracle, and the actual SafeHome Chakra system successfully provides Chakra-specific semantic expansion and utility-domain classification. Panda remains a useful future extraction oracle if precision/fuzz testing exposes cases that the intentionally bounded evaluator cannot safely resolve.

## Provisional architecture decision

Use the smallest authority-preserving stack unless future evidence falsifies it:

1. **TypeScript Compiler API + TypeChecker** — source facts, bounded local evaluation, symbols/types, and initially module resolution.
2. **SafeHome's actual Chakra system** — controlled configuration evaluation, token-domain classification, recipe semantics, and semantic implications.
3. **Repo-owned fact/claim layer** — coverage, provenance, entrypoint policy, unresolved domains, and derived claims.
4. **Knip/Panda/dependency-cruiser/other tools** — independent challengers, not canonical authority unless they empirically earn a narrower role.

No `Mapped`/`Unused` conclusion should be generated from these facts. The future mapper should expose explicit usage-evidence dimensions and preserve unresolved/coverage blockers.

## Remaining Phase-0 gap

The B1 benchmark establishes complete recall on the reviewed slice, and the hostile fixture demonstrates correct behavior for the main precision failure modes we identified. We still do **not** have a measured whole-repository precision rate.

Before mapper 2.14 integration, the next benchmark should:

1. freeze a draft `safehome.design-system-evidence.v1` fact/claim contract;
2. apply semantic/domain classification across the whole eligible frontend source corpus;
3. manually review a stratified sample of positive, negative, bounded, and unresolved results;
4. measure false-positive/false-negative/disagreement rates;
5. only then decide whether another static-analysis dependency has earned a permanent role.

## Next action

Freeze and validate the draft v1 evidence contract, then run the repo-wide classifier plus stratified manual precision audit. Keep the mapper 2.13 UI frozen until that evidence contract is trustworthy.
